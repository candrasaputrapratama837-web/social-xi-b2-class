import { API_BASE } from './api';

export interface RealtimeEvent<T = any> {
  eventId: string;
  eventType: string;
  entityType: string;
  entityId?: string;
  payload: T;
  version: number;
  timestamp: string;
  targetRole?: string;
}

export type RealtimeListener = (event: RealtimeEvent) => void;
export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

class CentralizedRealtimeClient {
  private eventSource: EventSource | null = null;
  private listeners: Set<RealtimeListener> = new Set();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private currentStatus: ConnectionStatus = 'disconnected';
  private reconnectTimeout: any = null;
  private healthCheckInterval: any = null;
  private retryCount: number = 0;
  private lastEventId: string | null = null;
  private isExplicitlyClosed: boolean = false;
  private currentToken: string = '';

  constructor() {
    // Initialized on demand
  }

  public connect(token?: string) {
    if (token) {
      this.currentToken = token;
    } else {
      this.currentToken = localStorage.getItem('social_xib2_auth_token') || '';
    }

    if (this.eventSource) {
      this.disconnect(false);
    }

    this.isExplicitlyClosed = false;
    this.setStatus('connecting');

    const params = new URLSearchParams();
    if (this.currentToken) params.append('token', this.currentToken);
    if (this.lastEventId) params.append('last_event_id', this.lastEventId);

    const baseUrl = API_BASE.startsWith('http')
      ? API_BASE
      : `${window.location.origin}${API_BASE.startsWith('/') ? '' : '/'}${API_BASE}`;

    const url = `${baseUrl}/realtime/events${params.toString() ? '?' + params.toString() : ''}`;

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        this.setStatus('connected');
        this.retryCount = 0;
      };

      this.eventSource.onmessage = (e) => {
        try {
          const parsed: RealtimeEvent = JSON.parse(e.data);
          if (parsed.eventId) {
            this.lastEventId = parsed.eventId;
          }
          this.setStatus('connected');
          this.notifyListeners(parsed);
        } catch (err) {
          console.warn('Realtime event parse warning:', err);
        }
      };

      // Listen to registered custom events
      const knownEvents = [
        'student.created',
        'student.updated',
        'student.deleted',
        'student.status_changed',
        'student.xp.updated',
        'leaderboard.updated',
        'task.created',
        'task.status.updated',
        'task.deleted',
        'attendance.created',
        'attendance.updated',
        'attendance.verified',
        'attendance.deleted',
        'kas.created',
        'kas.updated',
        'kas.deleted',
        'kas.monthly.updated',
        'schedule.created',
        'schedule.deleted',
        'gallery.created',
        'gallery.deleted',
        'confession.created',
        'confession.approved',
        'confession.deleted',
        'forum.post.created',
        'forum.comment.created',
        'forum.like.updated',
        'event.created',
        'event.deleted',
        'mood.created',
        'bazaar.created',
        'saham.updated',
        'timecapsule.created',
        'class.photo.updated',
        'logo.updated',
        'system.settings.updated',
        'connection.ready'
      ];

      knownEvents.forEach((evtName) => {
        this.eventSource?.addEventListener(evtName, (e: any) => {
          try {
            const parsed: RealtimeEvent = JSON.parse(e.data);
            if (parsed.eventId) {
              this.lastEventId = parsed.eventId;
            }
            this.setStatus('connected');
            this.notifyListeners(parsed);
          } catch (err) {
            console.warn(`Error in event [${evtName}]:`, err);
          }
        });
      });

      this.eventSource.onerror = () => {
        if (this.isExplicitlyClosed) return;
        // Check if server is alive via lightweight REST probe
        this.verifyServerLiveness();
      };
    } catch (err) {
      console.error('Failed to create EventSource:', err);
      this.verifyServerLiveness();
    }

    // Start periodic background liveness checker
    this.startHealthCheck();
  }

  private async verifyServerLiveness() {
    try {
      const res = await fetch(`${API_BASE}/realtime/status`, {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        // Server is online, mark connected/active and schedule soft reconnect
        this.setStatus('connected');
        this.scheduleReconnect(1500);
        return;
      }
    } catch {
      // Backend actually unreachable
    }
    this.setStatus('reconnecting');
    this.scheduleReconnect();
  }

  private startHealthCheck() {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    this.healthCheckInterval = setInterval(async () => {
      if (this.isExplicitlyClosed) return;
      if (this.currentStatus === 'reconnecting' || this.currentStatus === 'disconnected') {
        this.verifyServerLiveness();
      }
    }, 12000);
  }

  private scheduleReconnect(customDelay?: number) {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    this.retryCount += 1;
    const delay = customDelay !== undefined ? customDelay : Math.min(1000 * Math.pow(1.3, this.retryCount), 8000);

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isExplicitlyClosed) {
        this.connect(this.currentToken);
      }
    }, delay);
  }

  public disconnect(explicit: boolean = true) {
    this.isExplicitlyClosed = explicit;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.setStatus('disconnected');
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public getStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  private setStatus(status: ConnectionStatus) {
    if (this.currentStatus === status) return;
    this.currentStatus = status;
    this.statusListeners.forEach((fn) => {
      try {
        fn(status);
      } catch (err) {
        console.error('Status listener error:', err);
      }
    });
  }

  private notifyListeners(event: RealtimeEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }
}

export const realtimeClient = new CentralizedRealtimeClient();
