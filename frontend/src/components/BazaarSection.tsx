import React, { useState } from 'react';
import { GalleryImage, BazaarProductItem, SahamMarketState, TimeCapsuleItem } from '../types';
import {
  ShoppingBag,
  TrendingUp,
  Image as ImageIcon,
  Lock,
  Unlock,
  PlusCircle,
  Clock,
  Sparkles,
  PhoneCall,
  DollarSign,
  Maximize2
} from 'lucide-react';

interface BazaarProps {
  gallery: GalleryImage[];
  products: BazaarProductItem[];
  sahamState: SahamMarketState | null;
  timeCapsules: TimeCapsuleItem[];
  onTradeSaham: (type: 'BUY' | 'SELL', amount: number) => Promise<void>;
  onAddBazaarProduct: (product: Partial<BazaarProductItem>) => Promise<void>;
  onAddTimeCapsule: (senderName: string, title: string, message: string, unlockDate: string) => Promise<void>;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const BazaarSection: React.FC<BazaarProps> = ({
  gallery,
  products,
  sahamState,
  timeCapsules,
  onTradeSaham,
  onAddBazaarProduct,
  onAddTimeCapsule,
  addToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'galeri' | 'karya' | 'saham' | 'capsule'>('galeri');

  // Lightbox Modal
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // New Karya Form
  const [productTitle, setProductTitle] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('Kerajinan');
  const [productContact, setProductContact] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // New Time Capsule Form
  const [capsuleSender, setCapsuleSender] = useState('');
  const [capsuleTitle, setCapsuleTitle] = useState('');
  const [capsuleMsg, setCapsuleMsg] = useState('');
  const [capsuleDate, setCapsuleDate] = useState('2028-05-20');
  const [submittingCapsule, setSubmittingCapsule] = useState(false);

  // Saham Trade
  const [trading, setTrading] = useState(false);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle || !creatorName) {
      addToast('error', 'Judul karya dan nama pembuat wajib diisi!');
      return;
    }
    try {
      setSubmittingProduct(true);
      await onAddBazaarProduct({
        title: productTitle,
        creatorName,
        description: productDesc,
        price: Number(productPrice) || 0,
        category: productCategory,
        contactNumber: productContact,
        imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
      });
      addToast('success', '🎉 Karya siswa berhasil ditampilkan di Showcase Bazaar!');
      setProductTitle('');
      setCreatorName('');
      setProductDesc('');
      setProductPrice('');
    } catch (err: any) {
      addToast('error', err.message || 'Gagal menyimpan karya');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleCreateCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capsuleTitle || !capsuleMsg) {
      addToast('error', 'Judul dan isi pesan kapsul waktu wajib diisi!');
      return;
    }
    try {
      setSubmittingCapsule(true);
      await onAddTimeCapsule(capsuleSender || 'Siswa XI-B2', capsuleTitle, capsuleMsg, new Date(capsuleDate).toISOString());
      addToast('success', '🔒 Pesan telah terkunci rapi di Kapsul Waktu Kelas!');
      setCapsuleTitle('');
      setCapsuleMsg('');
    } catch (err: any) {
      addToast('error', err.message || 'Gagal menyimpan kapsul waktu');
    } finally {
      setSubmittingCapsule(false);
    }
  };

  const handleTrade = async (type: 'BUY' | 'SELL') => {
    try {
      setTrading(true);
      await onTradeSaham(type, 10000);
      addToast('success', `Simulasi Transaksi ${type === 'BUY' ? 'Investasi Kas' : 'Pencairan Kas'} Berhasil!`);
    } catch (err: any) {
      addToast('error', err.message || 'Gagal melakukan transaksi');
    } finally {
      setTrading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl p-8 shadow-md">
        <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
          Bazaar & Creative Space XI-B2
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mb-2">Galeri, Ekonomi Kreatif & Time Capsule</h2>
        <p className="text-sm text-amber-100 max-w-2xl leading-relaxed">
          Ruang pameran foto dokumentasi kelas, showcase karya buatan siswa XI-B2, pasar simulasi indeks kas kelas, dan pesan kapsul masa depan yang terkunci.
        </p>

        {/* Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/20">
          <button
            id="btn-subtab-galeri"
            onClick={() => setActiveSubTab('galeri')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'galeri'
                ? 'bg-white text-amber-900 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Galeri Dokumentasi
          </button>
          <button
            id="btn-subtab-karya"
            onClick={() => setActiveSubTab('karya')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'karya'
                ? 'bg-white text-amber-900 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Showcase Karya Siswa
          </button>
          <button
            id="btn-subtab-saham"
            onClick={() => setActiveSubTab('saham')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'saham'
                ? 'bg-white text-amber-900 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Simulasi Saham Kas Kelas
          </button>
          <button
            id="btn-subtab-capsule"
            onClick={() => setActiveSubTab('capsule')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'capsule'
                ? 'bg-white text-amber-900 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            Time Capsule
          </button>
        </div>
      </div>

      {/* 1. GALERI FOTO KELAS */}
      {activeSubTab === 'galeri' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Galeri Foto Momen XI-B2 ({gallery.length})
            </h3>
            <p className="text-xs text-slate-500">
              *Upload foto dilakukan khusus via Admin Dashboard.
            </p>
          </div>

          {gallery.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center text-slate-400 text-sm border border-emerald-100 dark:border-slate-800">
              Belum ada foto di galeri. Admin dapat menambahkan foto dokumentasi.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {gallery.map((img) => (
                <div
                  key={img._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 group hover:shadow-md transition-all"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      id={`btn-lightbox-${img._id}`}
                      onClick={() => setSelectedImage(img)}
                      className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                      {img.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-1.5">{img.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Oleh {img.uploadedBy} • {new Date(img.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lightbox Modal */}
          {selectedImage && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full overflow-hidden border border-slate-700 p-4 relative">
                <button
                  id="btn-close-lightbox"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white"
                >
                  ✕
                </button>
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full max-h-[70vh] object-contain rounded-2xl mb-4"
                />
                <h3 className="text-base font-bold">{selectedImage.title}</h3>
                <p className="text-xs text-slate-400">{selectedImage.category} • Diunggah oleh {selectedImage.uploadedBy}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SHOWCASE KARYA SISWA */}
      {activeSubTab === 'karya' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah Produk */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-slate-800 h-fit">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
              <PlusCircle className="w-5 h-5 text-amber-500" />
              Tampilkan Karya / Produk
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Punya bisnis kerajinan, lukisan, atau makanan ringan? Tampilkan karya kewirausahaanmu di sini!
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Pembuat / Siswa
                </label>
                <input
                  id="input-karya-creator"
                  type="text"
                  placeholder="Misal: CHIKA ANASTASYA PUTRI"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Produk / Karya
                </label>
                <input
                  id="input-karya-title"
                  type="text"
                  placeholder="Misal: Gantungan Kunci Akrilik Custom"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    id="input-karya-price"
                    type="number"
                    placeholder="15000"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    id="select-karya-category"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Kerajinan">Kerajinan</option>
                    <option value="Kuliner">Kuliner</option>
                    <option value="Digital / Seni">Digital / Seni</option>
                    <option value="Jasa">Jasa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Kontak WhatsApp / HP
                </label>
                <input
                  id="input-karya-contact"
                  type="text"
                  placeholder="081234567890"
                  value={productContact}
                  onChange={(e) => setProductContact(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  id="input-karya-desc"
                  rows={3}
                  placeholder="Penjelasan keunikan produk..."
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                id="btn-submit-karya"
                type="submit"
                disabled={submittingProduct}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl p-3 text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                Tambah ke Bazaar Kelas
              </button>
            </form>
          </div>

          {/* List Produk */}
          <div className="lg:col-span-2">
            {products.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center text-slate-400 text-sm border border-emerald-100 dark:border-slate-800">
                Belum ada produk/karya yang dipamerkan.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full">
                        {p.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-1">{p.title}</h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                        Oleh: {p.creatorName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-800 dark:text-white">
                        Rp {p.price.toLocaleString('id-ID')}
                      </span>
                      {p.contactNumber && (
                        <a
                          href={`https://wa.me/${p.contactNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          Pesan
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SIMULASI SAHAM KAS KELAS */}
      {activeSubTab === 'saham' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Pasar Simulasi Saham Kas Kelas XI-B2
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fitur edutainment keuangan: Simulasi performa "Kas Kelas Index" berdasarkan aktivitas & pembayaran kas.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Total Kas Kelas Real</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                Rp {(sahamState?.totalKas || 485000).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Indeks Pasar Kas</span>
              <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {sahamState?.indexValue || 1250.5} pts
              </div>
              <span
                className={`text-xs font-bold inline-block mt-1 ${
                  (sahamState?.changePercent || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {(sahamState?.changePercent || 0) >= 0 ? '▲ +' : '▼ '}
                {sahamState?.changePercent || 3.2}% Hari ini
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status Kesehatan Kas</span>
              <div className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">Sangat Sehat</div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">98% Siswa Rajin Bayar Kas</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Simulasi Transaksi</span>
              <div className="flex gap-2 mt-3">
                <button
                  id="btn-saham-buy"
                  disabled={trading}
                  onClick={() => handleTrade('BUY')}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  + Invest Kas
                </button>
                <button
                  id="btn-saham-sell"
                  disabled={trading}
                  onClick={() => handleTrade('SELL')}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  - Cairkan Kas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TIME CAPSULE */}
      {activeSubTab === 'capsule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Create Capsule */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-slate-800 h-fit">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
              <Lock className="w-5 h-5 text-amber-500" />
              Tulis Pesan Kapsul Waktu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Pesan disimpan dan tidak dapat dibuka sampai tanggal tertentu di masa depan.
            </p>

            <form onSubmit={handleCreateCapsule} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Pengirim
                </label>
                <input
                  id="input-tc-sender"
                  type="text"
                  placeholder="Nama Pengirim"
                  value={capsuleSender}
                  onChange={(e) => setCapsuleSender(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Judul Kapsul
                </label>
                <input
                  id="input-tc-title"
                  type="text"
                  placeholder="Misal: Harapan Saat Kelulusan"
                  value={capsuleTitle}
                  onChange={(e) => setCapsuleTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Tanggal Buka Kapsul
                </label>
                <input
                  id="input-tc-date"
                  type="date"
                  value={capsuleDate}
                  onChange={(e) => setCapsuleDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Pesan Rahasia Masa Depan
                </label>
                <textarea
                  id="input-tc-msg"
                  rows={4}
                  placeholder="Tuliskan harapan, memori, atau mimpi untuk kelas..."
                  value={capsuleMsg}
                  onChange={(e) => setCapsuleMsg(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                id="btn-submit-tc"
                type="submit"
                disabled={submittingCapsule}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl p-3 text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                Kunci Pesan di Kapsul Waktu
              </button>
            </form>
          </div>

          {/* List Kapsul Waktu */}
          <div className="lg:col-span-2 space-y-4">
            {timeCapsules.map((tc) => {
              const isLocked = new Date(tc.unlockDate).getTime() > new Date().getTime();

              return (
                <div
                  key={tc._id}
                  className={`p-6 rounded-3xl border transition-all ${
                    isLocked
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-amber-400">
                      {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                      {isLocked ? 'TERKUNCI SANGAT RAHASIA' : 'TERBUKA'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Dibuka pada: {new Date(tc.unlockDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold mb-1">{tc.title}</h3>
                  <p className="text-xs text-slate-300 font-semibold mb-3">Oleh: {tc.senderName}</p>

                  {isLocked ? (
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center text-xs text-slate-400 italic">
                      🔒 Pesan ini masih terkunci rapi sampai {new Date(tc.unlockDate).toLocaleDateString('id-ID')}. Bersabarlah menunggu momen pembukaan!
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      "{tc.message}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
