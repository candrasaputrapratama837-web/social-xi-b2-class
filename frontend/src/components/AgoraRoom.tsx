import React, { useState } from 'react';
import { ForumPostItem, ConfessionItem, StudentUser, InteractionEdge } from '../types';
import { MessageSquare, Heart, Send, Lock, Network, ShieldCheck, Sparkles, User, ThumbsUp, MessageCircle, AlertCircle } from 'lucide-react';

interface AgoraProps {
  forumPosts: ForumPostItem[];
  confessions: ConfessionItem[];
  students: StudentUser[];
  edges: InteractionEdge[];
  onAddForumPost: (authorName: string, title: string, content: string, category: string) => Promise<void>;
  onAddForumComment: (postId: string, authorName: string, text: string) => Promise<void>;
  onLikeForumPost: (postId: string) => Promise<void>;
  onSendConfession: (to: string, message: string) => Promise<void>;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AgoraRoom: React.FC<AgoraProps> = ({
  forumPosts,
  confessions,
  students,
  edges,
  onAddForumPost,
  onAddForumComment,
  onLikeForumPost,
  onSendConfession,
  addToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'forum' | 'confession' | 'sosiogram'>('forum');

  // Forum state
  const [authorName, setAuthorName] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Diskusi Kelas');
  const [commentInputs, setCommentInputs] = useState<Record<string, { name: string; text: string }>>({});
  const [submittingPost, setSubmittingPost] = useState(false);

  // Confession state
  const [confessionTo, setConfessionTo] = useState('');
  const [confessionMessage, setConfessionMessage] = useState('');
  const [sendingConfession, setSendingConfession] = useState(false);

  // Sosiogram selection state
  const [selectedStudentNode, setSelectedStudentNode] = useState<StudentUser | null>(null);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      addToast('error', 'Judul dan isi postingan tidak boleh kosong!');
      return;
    }
    try {
      setSubmittingPost(true);
      await onAddForumPost(authorName || 'Siswa XI-B2', postTitle, postContent, postCategory);
      addToast('success', '🎉 Postingan forum berhasil dikirim! (+5 XP Keaktifan Forum)');
      setPostTitle('');
      setPostContent('');
    } catch (err: any) {
      addToast('error', err.message || 'Gagal mengirim postingan');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const input = commentInputs[postId];
    if (!input || !input.text.trim()) return;
    try {
      await onAddForumComment(postId, input.name || 'Siswa XI-B2', input.text.trim());
      addToast('success', 'Komentar terkirim!');
      setCommentInputs((prev) => ({ ...prev, [postId]: { name: '', text: '' } }));
    } catch (err: any) {
      addToast('error', err.message || 'Gagal mengirim komentar');
    }
  };

  const handleConfessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confessionMessage.trim()) {
      addToast('error', 'Tuliskan pesan confession Anda!');
      return;
    }
    try {
      setSendingConfession(true);
      await onSendConfession(confessionTo || 'Seseorang di XI-B2', confessionMessage.trim());
      addToast('success', '🔒 Confession anonim Anda telah terkirim! Menunggu moderasian Admin.');
      setConfessionTo('');
      setConfessionMessage('');
    } catch (err: any) {
      addToast('error', err.message || 'Gagal mengirim confession');
    } finally {
      setSendingConfession(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 shadow-md">
        <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
          Agora Room Social-XI-B2
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mb-2">Ruang Interaksi & Diskusi Kelas</h2>
        <p className="text-sm text-teal-100 max-w-2xl leading-relaxed">
          Tempat berkumpul seluruh warga kelas XI-B2! Diskusikan materi di Forum, kirim pesan anonim hangat di Confession Box, dan jelajahi Sosiogram jaringan interaksi teman sekelas.
        </p>

        {/* Sub-Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/20">
          <button
            id="btn-subtab-forum"
            onClick={() => setActiveSubTab('forum')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'forum'
                ? 'bg-white text-teal-800 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Forum Diskusi Kelas
          </button>
          <button
            id="btn-subtab-confession"
            onClick={() => setActiveSubTab('confession')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'confession'
                ? 'bg-white text-teal-800 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            Confession Box (Anonim)
          </button>
          <button
            id="btn-subtab-sosiogram"
            onClick={() => setActiveSubTab('sosiogram')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'sosiogram'
                ? 'bg-white text-teal-800 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Network className="w-4 h-4" />
            Sosiogram Interaksi Kelas
          </button>
        </div>
      </div>

      {/* 1. FORUM DISKUSI TAB */}
      {activeSubTab === 'forum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Post Creation Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-slate-800 h-fit">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Buat Diskusi Baru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Posting pertanyaan, info tugas, atau obrolan santai (+5 XP Keaktifan Forum).
            </p>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Anda
                </label>
                <input
                  id="input-forum-author"
                  type="text"
                  placeholder="Nama Siswa (atau kosongkan untuk anonim kelas)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Kategori
                </label>
                <select
                  id="select-forum-category"
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Diskusi Kelas">Diskusi Kelas</option>
                  <option value="Sosiologi & Mapel">Sosiologi & Mapel</option>
                  <option value="Literasi & Buku">Literasi & Buku</option>
                  <option value="Olahraga & Kas">Olahraga & Kas</option>
                  <option value="Santai & Humor">Santai & Humor</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Judul Post
                </label>
                <input
                  id="input-forum-title"
                  type="text"
                  placeholder="Misal: Pembahasan Kelompok Sosiologi"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Isi Pesan / Pertanyaan
                </label>
                <textarea
                  id="input-forum-content"
                  rows={4}
                  placeholder="Tuliskan ide, rangkuman, atau pertanyaanmu di sini..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                id="btn-submit-forum-post"
                type="submit"
                disabled={submittingPost}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl p-3 text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Posting ke Forum (+5 XP)
              </button>
            </form>
          </div>

          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-4">
            {forumPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center text-slate-400 text-sm border border-emerald-100 dark:border-slate-800">
                Belum ada postingan di forum. Jadilah yang pertama memulai diskusi!
              </div>
            ) : (
              forumPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(post.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{post.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-line">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {post.authorName}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        id={`btn-like-post-${post._id}`}
                        onClick={() => onLikeForumPost(post._id)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 rounded-xl font-bold transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{post.likes}</span>
                      </button>

                      <span className="flex items-center gap-1 font-medium">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {post.comments?.length || 0} Komentar
                      </span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-2xl">
                    {post.comments?.map((c) => (
                      <div key={c.id} className="text-xs">
                        <span className="font-bold text-slate-800 dark:text-white">{c.authorName}: </span>
                        <span className="text-slate-600 dark:text-slate-300">{c.text}</span>
                      </div>
                    ))}

                    {/* Add Comment Input */}
                    <form
                      onSubmit={(e) => handleCommentSubmit(post._id, e)}
                      className="flex items-center gap-2 pt-2"
                    >
                      <input
                        id={`input-comment-name-${post._id}`}
                        type="text"
                        placeholder="Nama"
                        value={commentInputs[post._id]?.name || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post._id]: { ...(prev[post._id] || { text: '' }), name: e.target.value },
                          }))
                        }
                        className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-2 py-1.5 text-[11px]"
                      />
                      <input
                        id={`input-comment-text-${post._id}`}
                        type="text"
                        placeholder="Tulis komentar..."
                        value={commentInputs[post._id]?.text || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post._id]: { ...(prev[post._id] || { name: '' }), text: e.target.value },
                          }))
                        }
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-1.5 text-[11px]"
                      />
                      <button
                        id={`btn-send-comment-${post._id}`}
                        type="submit"
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                      >
                        Kirim
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. CONFESSION BOX TAB */}
      {activeSubTab === 'confession' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Confession Send Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-slate-800 h-fit">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Confession Box Anonim
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Kirimkan ungkapan rasa terima kasih, apresiasi, atau pesan manis secara anonim.
            </p>

            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Aturan Moderasi:</strong> Confession akan disimpan di database dan butuh <strong>persetujuan Admin</strong> sebelum tampil publik untuk menjaga kenyamanan bersama.
              </span>
            </div>

            <form onSubmit={handleConfessionSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Ditujukan Kepada
                </label>
                <input
                  id="input-confession-to"
                  type="text"
                  placeholder="Misal: FIZA & FEMY / Seseorang di Barisan Depan"
                  value={confessionTo}
                  onChange={(e) => setConfessionTo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Isi Pesan Anonim
                </label>
                <textarea
                  id="input-confession-msg"
                  rows={5}
                  placeholder="Tuliskan pesan positif dan penyemangat di sini..."
                  value={confessionMessage}
                  onChange={(e) => setConfessionMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                id="btn-submit-confession"
                type="submit"
                disabled={sendingConfession}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl p-3 text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Kirim Confession Anonim
              </button>
            </form>
          </div>

          {/* Approved Confessions Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Confession Terpublikasi ({confessions.length})
            </h3>

            {confessions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center text-slate-400 text-sm border border-emerald-100 dark:border-slate-800">
                Belum ada confession publik yang disetujui admin.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {confessions.map((cnf) => (
                  <div
                    key={cnf._id}
                    className={`p-5 rounded-3xl bg-gradient-to-br ${
                      cnf.colorTheme || 'from-emerald-600 to-teal-700'
                    } text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px]`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
                          Untuk: {cnf.to}
                        </span>
                        <Heart className="w-4 h-4 text-white/80 fill-white/50" />
                      </div>
                      <p className="text-xs leading-relaxed font-medium mb-4 whitespace-pre-line">
                        "{cnf.message}"
                      </p>
                    </div>

                    <div className="text-[10px] text-white/70 font-mono text-right pt-2 border-t border-white/20">
                      {new Date(cnf.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SOSIOGRAM INTERAKSI TAB */}
      {activeSubTab === 'sosiogram' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Visual Sosiogram Interaksi Kelas XI-B2
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pemetaan hubungan antar siswa (Node = Siswa, Edge = Sahabat / Rekan Belajar / Teman Diskusi).
              </p>
            </div>
          </div>

          {/* Sosiogram Canvas Simulation */}
          <div className="relative bg-slate-900 rounded-3xl p-6 min-h-[420px] overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Background Network Grid Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />

            <div className="relative z-10 w-full max-w-3xl py-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {students.slice(0, 18).map((student, idx) => {
                  const isSelected = selectedStudentNode?._id === student._id;
                  return (
                    <button
                      key={student._id}
                      id={`node-student-${student._id}`}
                      onClick={() => setSelectedStudentNode(student)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-300 shadow-lg scale-110 z-20'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-emerald-500'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-950 text-emerald-300 font-black text-xs flex items-center justify-center border-2 border-emerald-500 mb-1.5 shadow-inner">
                        {student.name.substring(0, 2)}
                      </div>
                      <span className="text-[11px] font-bold truncate max-w-full">{student.name.split(' ')[0]}</span>
                      <span className="text-[9px] text-slate-400 truncate max-w-full">{student.role}</span>
                    </button>
                  );
                })}
              </div>

              {/* Edge Connection Details Modal / Popup */}
              {selectedStudentNode && (
                <div className="mt-8 p-4 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl text-white max-w-md mx-auto animate-fade-in text-center">
                  <h4 className="text-sm font-bold text-amber-300">{selectedStudentNode.name}</h4>
                  <p className="text-xs text-emerald-200 mt-0.5">Jabatan: {selectedStudentNode.role} • {selectedStudentNode.xp} XP</p>
                  <p className="text-xs text-slate-300 mt-2 italic">
                    "{selectedStudentNode.motto || 'Semangat kebersamaan di XI-B2!'}"
                  </p>
                  <button
                    onClick={() => setSelectedStudentNode(null)}
                    className="mt-3 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                  >
                    Tutup Info Node
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
