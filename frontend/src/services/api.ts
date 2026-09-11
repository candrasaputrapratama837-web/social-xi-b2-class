import {
  StudentUser,
  ScheduleItem,
  MoodSummary,
  CountdownEventItem,
  ConfessionItem,
  ForumPostItem,
  GalleryImage,
  BazaarProductItem,
  SahamMarketState,
  TimeCapsuleItem,
  AdminAuthResponse,
  InteractionEdge,
  TaskSubmission,
  RekapKasItem,
  AuthSession,
  UserAuthMode
} from '../types';

export const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL)
  ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('social_xib2_auth_token') || localStorage.getItem('social_xib2_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Robust, safe fetch wrapper that prevents JSON parsing crashes on HTML/text responses
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, text/plain, */*');
  }

  const auth = getAuthHeaders();
  if (auth.Authorization && !headers.has('Authorization')) {
    headers.set('Authorization', auth.Authorization);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error(`Koneksi backend gagal: ${netErr?.message || 'Tidak dapat terhubung ke server.'}`);
  }

  const contentType = response.headers.get('content-type') || '';
  let responseData: any = null;

  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    // Non-JSON response (e.g. HTML error page or plain text)
    const rawText = await response.text().catch(() => '');
    if (rawText.startsWith('<') || rawText.includes('<!DOCTYPE') || rawText.includes('The page c')) {
      responseData = {
        error: `Endpoint ${endpoint} mengembalikan respon HTML (${response.status} ${response.statusText}).`,
        message: `Layanan API sedang sinkronisasi.`,
      };
    } else {
      responseData = { message: rawText };
    }
  }

  if (!response.ok) {
    let errorMsg = `Permintaan gagal (${response.status}: ${response.statusText})`;
    
    // SAFE OBJECT EXTRACTOR (PREVENT [object Object])
    if (responseData) {
      if (responseData.error && typeof responseData.error === 'object') {
        // Format Laravel / format enterprise baru
        if (typeof responseData.error.message === 'string') {
          errorMsg = responseData.error.message;
        } else if (typeof responseData.error.code === 'string') {
          errorMsg = `${responseData.error.code}: Terjadi kesalahan server.`;
        } else {
          errorMsg = JSON.stringify(responseData.error);
        }
      } else if (typeof responseData.error === 'string') {
        errorMsg = responseData.error;
      } else if (typeof responseData.message === 'string') {
        errorMsg = responseData.message;
      } else if (typeof responseData === 'object') {
        try {
           errorMsg = JSON.stringify(responseData);
        } catch {
           errorMsg = 'Kesalahan server yang tidak dikenali.';
        }
      }
    }
    
    // Strip [object Object] just in case
    if (errorMsg === '[object Object]' || typeof errorMsg !== 'string') {
       errorMsg = 'Format pesan error dari server tidak dapat dibaca.';
    }

    throw new Error(errorMsg);
  }

  // Automatically unwrap standardized API response envelope
  if (responseData && typeof responseData === 'object' && responseData.success === true && 'data' in responseData) {
    return responseData.data as T;
  }

  return responseData as T;
}

export const api = {
  // ----------------------------------------------------
  // AUTH & SESSION MANAGEMENT
  // ----------------------------------------------------
  async login(email: string, password: string, role?: 'admin' | 'siswa'): Promise<{ token: string; mode: UserAuthMode; user: any }> {
    const data = await request<{ token: string; mode: UserAuthMode; user: any }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: password.trim(), role }),
    });

    localStorage.setItem('social_xib2_auth_token', data.token);
    if (data.mode === 'admin') {
      localStorage.setItem('social_xib2_admin_token', data.token);
    }
    const session: AuthSession = {
      mode: data.mode,
      email: data.user?.email || email,
      token: data.token,
      name: data.user?.name || (data.mode === 'admin' ? 'Admin Kelas' : 'Siswa XI-B2')
    };
    localStorage.setItem('social_xib2_auth_session', JSON.stringify(session));
    return data;
  },

  getStoredSession(): AuthSession {
    const raw = localStorage.getItem('social_xib2_auth_session');
    if (!raw) return { mode: 'public' };
    try {
      return JSON.parse(raw);
    } catch {
      return { mode: 'public' };
    }
  },

  getSession(): AuthSession {
    return this.getStoredSession();
  },

  setSession(mode: UserAuthMode, name?: string): AuthSession {
    const session: AuthSession = {
      mode,
      name: name || (mode === 'admin' ? 'Admin Kelas' : mode === 'siswa' ? 'Siswa XI-B2' : 'Pengunjung')
    };
    localStorage.setItem('social_xib2_auth_session', JSON.stringify(session));
    return session;
  },

  clearSession(): AuthSession {
    localStorage.removeItem('social_xib2_auth_token');
    localStorage.removeItem('social_xib2_auth_session');
    localStorage.removeItem('social_xib2_admin_token');
    return { mode: 'public' };
  },

  logout(): void {
    this.clearSession();
  },

  async loginAdmin(email: string, password: string): Promise<AdminAuthResponse> {
    const res = await this.login(email, password);
    return { token: res.token, admin: { email, role: 'admin' } };
  },

  async verifyAdmin(): Promise<boolean> {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return false;
    try {
      const res = await request<{ valid: boolean }>('/auth/verify');
      return Boolean(res?.valid);
    } catch {
      return false;
    }
  },

  // ----------------------------------------------------
  // TASKS
  // ----------------------------------------------------
  async getTasks(): Promise<TaskSubmission[]> {
    try {
      const res = await request<any>('/tasks');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.tasks)) return res.tasks;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn('api.getTasks fallback to empty array:', err);
      return [];
    }
  },

  async submitTask(task: Partial<TaskSubmission>): Promise<TaskSubmission> {
    return request<TaskSubmission>('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
  },

  async createTask(task: Partial<TaskSubmission>): Promise<TaskSubmission> {
    return this.submitTask(task);
  },

  async updateTaskStatus(id: string, payload: {
    status: 'Valid' | 'Ditolak' | 'Pending';
    adminNote?: string;
    xpAwarded?: number;
    studentId?: string;
  }): Promise<TaskSubmission> {
    return request<TaskSubmission>(`/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async deleteTask(id: string): Promise<void> {
    await request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // ----------------------------------------------------
  // REKAP KAS
  // ----------------------------------------------------
  async getRekapKas(): Promise<RekapKasItem[]> {
    const res = await request<any>('/kas');
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.records)) return res.records;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  async addRekapKas(kas: Partial<RekapKasItem>): Promise<RekapKasItem> {
    return request<RekapKasItem>('/kas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kas),
    });
  },

  async updateRekapKas(id: string, kas: Partial<RekapKasItem>): Promise<RekapKasItem> {
    return request<RekapKasItem>(`/kas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kas),
    });
  },

  async deleteRekapKas(id: string): Promise<void> {
    await request<void>(`/kas/${id}`, {
      method: 'DELETE',
    });
  },

  async getKasSummary(): Promise<any> {
    return request<any>('/kas/summary');
  },

  // ----------------------------------------------------
  // STUDENTS & LEADERBOARD
  // ----------------------------------------------------
  async getUsers(): Promise<StudentUser[]> {
    try {
      const res = await request<any>('/users');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.users)) return res.users;
      if (res && Array.isArray(res.students)) return res.students;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn('api.getUsers fallback to empty array:', err);
      return [];
    }
  },

  async addUser(student: Partial<StudentUser>): Promise<StudentUser> {
    const res = await request<any>('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    return (res && res.data) ? res.data : res;
  },

  async updateUser(id: string, student: Partial<StudentUser>): Promise<StudentUser> {
    const res = await request<any>(`/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    return (res && res.data) ? res.data : res;
  },

  async deleteUser(id: string): Promise<void> {
    await request<void>(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  async updateXP(id: string, amount: number): Promise<StudentUser> {
    const res = await request<any>(`/students/${id}/xp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    return (res && res.data) ? res.data : res;
  },

  async getLeaderboard(): Promise<StudentUser[]> {
    try {
      const res = await request<any>('/leaderboard');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.leaderboard)) return res.leaderboard;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn('api.getLeaderboard fallback to empty array:', err);
      return [];
    }
  },

  // ----------------------------------------------------
  // MOOD TRACKER
  // ----------------------------------------------------
  async getMoodSummary(): Promise<MoodSummary> {
    return request<MoodSummary>('/mood');
  },

  async voteMood(emoji: '😃' | '😐' | '😡' | '😭'): Promise<void> {
    await request<void>('/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
  },

  // ----------------------------------------------------
  // COUNTDOWN EVENTS
  // ----------------------------------------------------
  async getEvents(): Promise<CountdownEventItem[]> {
    try {
      const res = await request<any>('/events');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.events)) return res.events;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn('api.getEvents fallback to empty array:', err);
      return [];
    }
  },

  async addEvent(event: Partial<CountdownEventItem>): Promise<CountdownEventItem> {
    return request<CountdownEventItem>('/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  },

  async deleteEvent(id: string): Promise<void> {
    await request<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  // ----------------------------------------------------
  // ADMINS MANAGEMENT (MAX 2 ENFORCEMENT)
  // ----------------------------------------------------
  async getAdmins(): Promise<{ admins: any[]; maxAdmins: number }> {
    return request<{ admins: any[]; maxAdmins: number }>('/auth/admins');
  },

  async createAdmin(payload: { email: string; name: string; password: string }): Promise<any> {
    return request<any>('/auth/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async deleteAdmin(id: string): Promise<void> {
    await request<void>(`/auth/admins/${id}`, {
      method: 'DELETE',
    });
  },

  // ----------------------------------------------------
  // CLASS LOGO & PHOTO
  // ----------------------------------------------------
  async getClassLogo(): Promise<string> {
    const data = await request<{ url: string }>('/class-logo');
    return data.url;
  },

  async updateClassLogo(url: string): Promise<string> {
    const data = await request<{ url: string }>('/class-logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return data.url;
  },

  async getClassPhoto(): Promise<string> {
    const data = await request<{ url: string }>('/class-photo');
    return data.url;
  },

  async updateClassPhoto(url: string): Promise<string> {
    const data = await request<{ url: string }>('/class-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return data.url;
  },

  // ----------------------------------------------------
  // SCHEDULE
  // ----------------------------------------------------
  async getSchedule(): Promise<ScheduleItem[]> {
    try {
      const res = await request<any>('/schedule');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.schedules)) return res.schedules;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn('api.getSchedule fallback to empty array:', err);
      return [];
    }
  },

  async addSchedule(item: Partial<ScheduleItem>): Promise<ScheduleItem> {
    return request<ScheduleItem>('/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  },

  async deleteSchedule(id: string): Promise<void> {
    await request<void>(`/schedule/${id}`, {
      method: 'DELETE',
    });
  },

  // ----------------------------------------------------
  // CONFESSIONS
  // ----------------------------------------------------
  async getConfessions(): Promise<ConfessionItem[]> {
    try {
      const res = await request<any>('/confessions');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.confessions)) return res.confessions;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn('api.getConfessions fallback to empty array:', err);
      return [];
    }
  },

  async sendConfession(to: string, message: string): Promise<{ message: string }> {
    return request<{ message: string }>('/confessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    });
  },

  async approveConfession(id: string, isApproved: boolean): Promise<ConfessionItem> {
    return request<ConfessionItem>(`/confessions/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved }),
    });
  },

  async deleteConfession(id: string): Promise<void> {
    await request<void>(`/confessions/${id}`, {
      method: 'DELETE',
    });
  },

  // ----------------------------------------------------
  // FORUM
  // ----------------------------------------------------
  async getForumPosts(): Promise<ForumPostItem[]> {
    try {
      const res = await request<any>('/forum');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.posts)) return res.posts;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn('api.getForumPosts fallback to empty array:', err);
      return [];
    }
  },

  async createForumPost(authorName: string, title: string, content: string, category: string): Promise<ForumPostItem> {
    return request<ForumPostItem>('/forum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, title, content, category }),
    });
  },

  async addForumComment(postId: string, authorName: string, text: string): Promise<any> {
    return request<any>(`/forum/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, text }),
    });
  },

  async likeForumPost(postId: string): Promise<{ likes: number }> {
    return request<{ likes: number }>(`/forum/${postId}/like`, {
      method: 'POST',
    });
  },

  // ----------------------------------------------------
  // GALLERY
  // ----------------------------------------------------
  async getGallery(): Promise<GalleryImage[]> {
    try {
      const res = await request<any>('/gallery');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.images)) return res.images;
      if (res && Array.isArray(res.gallery)) return res.gallery;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn('api.getGallery fallback to empty array:', err);
      return [];
    }
  },

  async addGalleryImage(title: string, imageUrl: string, category: string, uploadedBy: string): Promise<GalleryImage> {
    return request<GalleryImage>('/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, imageUrl, category, uploadedBy }),
    });
  },

  async deleteGalleryImage(id: string): Promise<void> {
    await request<void>(`/gallery/${id}`, {
      method: 'DELETE',
    });
  },

  // ----------------------------------------------------
  // BAZAAR
  // ----------------------------------------------------
  async getBazaarProducts(): Promise<BazaarProductItem[]> {
    try {
      const res = await request<any>('/bazaar');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.products)) return res.products;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn('api.getBazaarProducts fallback to empty array:', err);
      return [];
    }
  },

  async addBazaarProduct(product: Partial<BazaarProductItem>): Promise<BazaarProductItem> {
    return request<BazaarProductItem>('/bazaar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
  },

  // ----------------------------------------------------
  // SAHAM SIMULATION
  // ----------------------------------------------------
  async getSahamState(): Promise<SahamMarketState> {
    return request<SahamMarketState>('/saham');
  },

  async tradeSaham(type: 'BUY' | 'SELL', amount: number): Promise<SahamMarketState> {
    return request<SahamMarketState>('/saham/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, amount }),
    });
  },

  // ----------------------------------------------------
  // TIME CAPSULE
  // ----------------------------------------------------
  async getTimeCapsules(): Promise<TimeCapsuleItem[]> {
    return request<TimeCapsuleItem[]>('/time-capsule');
  },

  async addTimeCapsule(senderName: string, title: string, message: string, unlockDate: string): Promise<TimeCapsuleItem> {
    return request<TimeCapsuleItem>('/time-capsule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderName, title, message, unlockDate }),
    });
  },

  // ----------------------------------------------------
  // SOSIOGRAM
  // ----------------------------------------------------
  async getSosiogram(): Promise<{ students: Partial<StudentUser>[]; edges: InteractionEdge[] }> {
    return request<{ students: Partial<StudentUser>[]; edges: InteractionEdge[] }>('/sosiogram');
  },

  // ----------------------------------------------------
  // ATTENDANCE (PRESENSI DIGITAL)
  // ----------------------------------------------------
  async getAttendance(date?: string, branchId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (branchId) params.append('branchId', branchId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/attendance${query}`);
  },

  async getAttendanceRecap(branchId?: string): Promise<any> {
    const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';
    return request<any>(`/attendance/recap${query}`);
  },

  async submitAttendance(payload: {
    studentId?: string;
    studentName: string;
    date?: string;
    status: string;
    note?: string;
    branchId?: string;
  }): Promise<any> {
    return request<any>('/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async verifyAttendance(id: string, payload: { verified: boolean; status?: string }): Promise<any> {
    return request<any>(`/attendance/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async deleteAttendance(id: string): Promise<void> {
    await request<void>(`/attendance/${id}`, {
      method: 'DELETE',
    });
  },

  // ----------------------------------------------------
  // SETTINGS & AUDIT LOGS
  // ----------------------------------------------------
  async getSettings(): Promise<any> {
    return request<any>('/settings');
  },

  async updateSettings(settings: any): Promise<any> {
    return request<any>('/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  },

  async getAuditLogs(): Promise<any[]> {
    return request<any[]>('/audit-logs');
  },

  async getHealth(): Promise<{ success: boolean; status: string; mode: string; database: string; atlasIpWhitelistGuide?: string }> {
    return request<{ success: boolean; status: string; mode: string; database: string; atlasIpWhitelistGuide?: string }>('/health');
  }
};
