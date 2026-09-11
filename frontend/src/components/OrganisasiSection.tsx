import React, { useState } from 'react';
import { User, ShieldCheck, Sparkles, HeartHandshake, BookOpen, Dumbbell, Flag, Church, Camera, Upload, Edit2, ImageIcon } from 'lucide-react';
import { UserAuthMode } from '../types';

interface OrganisasiSectionProps {
  authMode?: UserAuthMode;
  classPhotoUrl?: string;
  onUpdateClassPhoto?: (newUrl: string) => void;
  onOpenLoginModal?: () => void;
}

export const OrganisasiSection: React.FC<OrganisasiSectionProps> = ({
  authMode = 'public',
  classPhotoUrl,
  onUpdateClassPhoto,
  onOpenLoginModal,
}) => {
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const currentPhoto = classPhotoUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
        setInputUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    const finalUrl = inputUrl.trim() || previewUrl;
    if (finalUrl && onUpdateClassPhoto) {
      onUpdateClassPhoto(finalUrl);
      setShowEditPhotoModal(false);
      setInputUrl('');
      setPreviewUrl('');
    }
  };

  const pengurusInti = [
    { role: 'Ketua Kelas', name: 'FIZA', level: 1, color: 'border-emerald-600 bg-emerald-50' },
    { role: 'Wakil Ketua', name: 'FEMY MAULIDYA', level: 2, color: 'border-teal-600 bg-teal-50' },
  ];

  const sekretarisBendahara = [
    { role: 'Sekretaris 1', name: 'SAKILA NAZIRA ZIARAH', color: 'border-blue-500 bg-blue-50' },
    { role: 'Sekretaris 2', name: 'CHIKA ANASTASYA PUTRI', color: 'border-blue-400 bg-blue-50' },
    { role: 'Bendahara 1', name: 'SHAKIRA AMELIA', color: 'border-amber-500 bg-amber-50' },
    { role: 'Bendahara 2', name: 'KAILA', color: 'border-amber-400 bg-amber-50' },
  ];

  const divisi = [
    {
      title: 'Kebersihan',
      icon: <HeartHandshake className="w-4 h-4 text-emerald-600" />,
      members: [
        { role: 'Kasi Kebersihan 1', name: 'MARWA' },
        { role: 'Kasi Kebersihan 2', name: 'DELISKA FISTA WULANDARI' },
      ],
      border: 'border-emerald-500',
    },
    {
      title: 'Literasi',
      icon: <BookOpen className="w-4 h-4 text-blue-600" />,
      members: [
        { role: 'Kasi Literasi 1', name: 'ULUL ASMI' },
        { role: 'Kasi Literasi 2', name: 'YOHANES DAUD YORDAN' },
      ],
      border: 'border-blue-500',
    },
    {
      title: 'Olahraga',
      icon: <Dumbbell className="w-4 h-4 text-orange-600" />,
      members: [
        { role: 'Kasi Olahraga 1', name: 'NASILA' },
        { role: 'Kasi Olahraga 2', name: 'ADRIAN YUDISTIRA' },
      ],
      border: 'border-orange-500',
    },
    {
      title: 'Upacara',
      icon: <Flag className="w-4 h-4 text-rose-600" />,
      members: [
        { role: 'Kasi Upacara 1', name: 'AGUSTANIA WULANDARI' },
        { role: 'Kasi Upacara 2', name: 'PAHMI' },
      ],
      border: 'border-rose-500',
    },
    {
      title: 'Keagamaan',
      icon: <Church className="w-4 h-4 text-purple-600" />,
      members: [
        { role: 'Kasi Agama 1', name: 'FAHRI SUGANDI' },
        { role: 'Kasi Agama 2', name: 'MILA KARMILA' },
      ],
      border: 'border-purple-500',
    },
  ];

  return (
    <div className="space-y-12">
      {/* 🔹 1. FOTO BERSAMA KELAS XI-B2 SECTION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              <Camera className="w-3.5 h-3.5" /> FOTO BERSAMA KELAS XI-B2
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Kenangan Foto Kelas & Wali Kelas
            </h2>
            <p className="text-xs text-slate-500">
              SMAN 1 Sandai • Wali Kelas: <strong className="text-blue-600">Indra Setiawan, S.Pd.</strong>
            </p>
          </div>

          {authMode === 'admin' ? (
            <button
              onClick={() => setShowEditPhotoModal(true)}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
            >
              <Edit2 className="w-4 h-4" />
              Edit / Ganti Foto Kelas
            </button>
          ) : (
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 self-start md:self-auto">
              <ShieldCheck className="w-4 h-4" /> Terverifikasi Resmi Kelas XI-B2
            </span>
          )}
        </div>

        {/* Display Banner Image */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
          <img
            src={currentPhoto}
            alt="Foto Bersama Kelas XI-B2 SMAN 1 Sandai"
            className="w-full h-72 sm:h-96 md:h-[450px] object-cover transition-transform duration-500 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6 sm:p-8 text-white">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                SMAN 1 SANDAI • KELAS SOCIAL XI-B2
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Kebersamaan & Kekeluargaan Kelas XI-B2
              </h3>
              <p className="text-xs text-slate-300">
                Dokumentasi resmi seluruh siswa & wali kelas dalam lingkungan pembelajaran.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 2. STRUKTUR ORGANISASI CHART SECTION */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider inline-block border border-emerald-200">
            SMAN 1 Sandai • T.P 2026-2027
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Struktur Organisasi Kelas XI-B2
          </h2>
          <p className="text-xs text-slate-500">
            Pimpinan & Divisi Pelaksana Harian Organisasi Kelas XI-B2
          </p>
        </div>

        {/* Main Board Container */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-slate-200 shadow-sm relative overflow-hidden">
          {/* LEVEL 1: KETUA KELAS */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-50 border-4 border-emerald-600 rounded-2xl p-5 shadow-md text-center max-w-xs w-full hover:scale-105 transition-transform">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-2 border-4 border-white shadow-md">
                FI
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                Ketua Kelas
              </span>
              <h3 className="text-base font-black text-slate-900 mt-2">FIZA</h3>
            </div>
          </div>

          {/* Connecting Line Down */}
          <div className="w-1 h-6 bg-emerald-500 mx-auto -mt-6 mb-2" />

          {/* LEVEL 2: WAKIL KETUA */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-50 border-4 border-teal-600 rounded-2xl p-4 shadow-sm text-center max-w-xs w-full hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-full bg-teal-600 text-white font-black text-base flex items-center justify-center mx-auto mb-2 border-4 border-white shadow-md">
                FM
              </div>
              <span className="px-2.5 py-0.5 bg-teal-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                Wakil Ketua
              </span>
              <h3 className="text-sm font-black text-slate-900 mt-1">FEMY MAULIDYA</h3>
            </div>
          </div>

          {/* Connecting Line Horizontal */}
          <div className="w-full max-w-3xl h-1 bg-slate-200 mx-auto mb-6" />

          {/* LEVEL 3: SEKRETARIS 1 & 2 + BENDAHARA 1 & 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
            {sekretarisBendahara.map((sb) => (
              <div
                key={sb.role}
                className={`bg-slate-50 border-2 ${sb.color} rounded-2xl p-4 shadow-sm text-center hover:scale-105 transition-transform`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2 border-2 border-white shadow-sm">
                  {sb.name.substring(0, 2)}
                </div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">
                  {sb.role}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5 leading-tight">{sb.name}</h4>
              </div>
            ))}
          </div>

          {/* LEVEL 4: DIVISI / KASI SECTION */}
          <div className="pt-6 border-t-2 border-dashed border-slate-200">
            <h3 className="text-center font-black text-sm uppercase tracking-wider text-slate-700 mb-6">
              Seksi / Divisi Pelaksana
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {divisi.map((div) => (
                <div
                  key={div.title}
                  className={`bg-slate-50 rounded-2xl p-4 shadow-sm border-2 ${div.border} flex flex-col justify-between`}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                    {div.icon}
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      {div.title}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {div.members.map((m) => (
                      <div key={m.role} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0 border-2 border-blue-400">
                          {m.name.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] text-slate-400 block uppercase">{m.role}</span>
                          <h5 className="text-[11px] font-bold text-slate-800 truncate">
                            {m.name}
                          </h5>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Edit Foto Kelas Modal */}
      {showEditPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowEditPhotoModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-orange-500" />
                Edit / Ganti Foto Kelas XI-B2
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Unggah foto dari perangkat lokal Anda atau masukkan URL gambar langsung.
              </p>
            </div>

            <div className="space-y-4">
              {/* Option A: Upload Local File */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Unggah Gambar dari Perangkat
                </label>
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 rounded-2xl p-4 text-center cursor-pointer block transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-600 font-semibold block">
                    Klik untuk memilih file foto...
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option B: Enter URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Atau Masukkan URL Gambar:
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/foto-kelas.jpg"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Live Image Preview */}
              {(previewUrl || inputUrl) && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">Pratinjau Foto:</span>
                  <div className="h-40 rounded-2xl overflow-hidden border border-slate-200">
                    <img
                      src={previewUrl || inputUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditPhotoModal(false)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Simpan Foto Kelas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
