import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Plus, Trash2, Eye, Lock, Upload, Image as ImageIcon, Check, Calendar, FileText, X } from 'lucide-react';
import { RekapKasItem, UserAuthMode } from '../types';

interface RekapKasSectionProps {
  kasList: RekapKasItem[];
  authMode: UserAuthMode;
  onAddKas: (kas: { bulan: string; totalKas: number; imageUrl: string; catatan: string }) => Promise<void>;
  onDeleteKas: (id: string) => Promise<void>;
  onOpenLoginModal: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const RekapKasSection: React.FC<RekapKasSectionProps> = ({
  kasList = [],
  authMode = 'public',
  onAddKas,
  onDeleteKas,
  onOpenLoginModal,
  showToast,
}) => {
  const safeKasList = Array.isArray(kasList) ? kasList : [];
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [bulan, setBulan] = useState('');
  const [totalKas, setTotalKas] = useState('');
  const [catatan, setCatatan] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const grandTotal = safeKasList.reduce((acc, curr) => acc + (curr?.totalKas || curr?.amountPaid || 0), 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran foto terlalu besar (Maksimal 5MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulan.trim()) {
      showToast('Harap masukan nama bulan/periode!', 'error');
      return;
    }
    if (!imagePreview) {
      showToast('Harap unggah foto bukti/buku kas!', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddKas({
        bulan: bulan.trim(),
        totalKas: Number(totalKas) || 0,
        imageUrl: imagePreview,
        catatan: catatan.trim(),
      });
      showToast('Rekap kas berhasil ditambahkan!', 'success');
      setShowAddModal(false);
      setBulan('');
      setTotalKas('');
      setCatatan('');
      setImagePreview('');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan rekap kas', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/80 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Wallet className="w-3.5 h-3.5" /> Transparansi Keuangan XI-B2
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Rekap Kas Kelas <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Social-XI-B2</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Laporan saldo kas bulanan dan bukti dokumentasi fisik buku kas yang dikelola secara jujur dan terbuka oleh Bendahara Kelas.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-center items-start min-w-[220px]">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Kas Terkumpul</span>
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-1">
              Rp {grandTotal.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">Sesuai audit bendahara terakhir</span>
          </div>
        </div>
      </div>

      {/* Access Restriction Notice for PUBLIC mode */}
      {authMode === 'public' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 backdrop-blur-xl shadow-xl relative overflow-hidden"
        >
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white">Akses Terbatas Mode Publik</h3>
            <p className="text-sm text-slate-400">
              Rincian rekap kas dan foto bukti fisik hanya dapat dibuka oleh <span className="text-emerald-400 font-semibold">Siswa XI-B2</span> atau <span className="text-amber-400 font-semibold">Admin Kelas</span> untuk menjaga keamanan data internal.
            </p>
          </div>
          <button
            onClick={onOpenLoginModal}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Lock className="w-4 h-4" /> Login Siswa / Admin
          </button>
        </motion.div>
      )}

      {/* Main Content (Visible for Siswa & Admin) */}
      {authMode !== 'public' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" /> Histori Rekap Bulanan ({safeKasList.length})
            </h3>

            {authMode === 'admin' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Rekap Kas
              </button>
            )}
          </div>

          {safeKasList.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="font-medium text-slate-300">Belum ada catatan rekap kas yang diunggah.</p>
              <p className="text-xs text-slate-500 mt-1">Admin dapat mengunggah rekap buku kas melalui tombol di atas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeKasList.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        {item.bulan}
                      </span>
                      {authMode === 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Hapus rekap kas bulan ${item.bulan}?`)) {
                              onDeleteKas(item._id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Hapus Rekap Kas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium">Saldo / Pemasukan</span>
                      <p className="text-2xl font-black text-white mt-0.5">
                        Rp {item.totalKas.toLocaleString('id-ID')}
                      </p>
                    </div>

                    {item.catatan && (
                      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{item.catatan}</p>
                      </div>
                    )}

                    {/* Image Preview Thumbnail */}
                    <div className="relative group/img rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[4/3]">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80'}
                        alt={`Buku Kas ${item.bulan}`}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <button
                          onClick={() => setSelectedImage(item.imageUrl)}
                          className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all border border-white/30"
                        >
                          <Eye className="w-4 h-4" /> Lihat Foto Fisik
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/60 text-[11px] text-slate-500 flex justify-between items-center">
                    <span>Diunggah pada</span>
                    <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Add Rekap Kas (Admin Only) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                  <Wallet className="w-5 h-5" /> Tambah Rekap Kas Bulanan
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Bulan & Tahun Periode *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Maret 2026"
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Total Kas Terkumpul (Rp) *
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 500000"
                    value={totalKas}
                    onChange={(e) => setTotalKas(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Upload Foto Buku Kas (Real File Upload) *
                  </label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-950 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img src={imagePreview} alt="Preview" className="h-32 object-contain mx-auto rounded-lg border border-slate-800" />
                        <span className="text-xs text-emerald-400 font-semibold block">Ganti Foto</span>
                      </div>
                    ) : (
                      <div className="space-y-1 py-2">
                        <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                        <span className="text-xs font-semibold text-slate-300 block">Klik atau Seret Foto Buku Kas ke Sini</span>
                        <span className="text-[11px] text-slate-500 block">Format JPG/PNG (Max 5MB)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Catatan Rincian
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Catat pengeluaran atau pengingat untuk siswa..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Rekap Kas'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Image Full View */}
      <AnimatePresence>
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl w-full max-h-[90vh] relative p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 z-10 cursor-pointer border border-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={selectedImage}
                alt="Foto Rekap Kas Full"
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl border border-slate-800 shadow-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
