import React, { useState } from 'react';
import { MoodSummary } from '../types';
import { Smile, Frown, Meh, Angry, BarChart2 } from 'lucide-react';

interface MoodTrackerProps {
  moodData: MoodSummary | null;
  onVote: (emoji: '😃' | '😐' | '😡' | '😭') => Promise<void>;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ moodData, onVote, addToast }) => {
  const [voting, setVoting] = useState(false);

  const moods: { emoji: '😃' | '😐' | '😡' | '😭'; label: string; bg: string; text: string; border: string }[] = [
    { emoji: '😃', label: 'Senang / Antusias', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' },
    { emoji: '😐', label: 'Biasa Saja', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800' },
    { emoji: '😡', label: 'Kesal / Capek', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800' },
    { emoji: '😭', label: 'Sedih / Butuh Hiburan', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-800' },
  ];

  const handleVote = async (emoji: '😃' | '😐' | '😡' | '😭') => {
    try {
      setVoting(true);
      await onVote(emoji);
      addToast('success', `Mood ${emoji} berhasil dicatat! Terimakasih sudah berbagi perasaan hari ini.`);
    } catch (err: any) {
      addToast('error', err.message || 'Gagal menyimpan mood');
    } finally {
      setVoting(false);
    }
  };

  const percentages = moodData?.percentages || { '😃': 0, '😐': 0, '😡': 0, '😭': 0 };
  const counts = moodData?.counts || { '😃': 0, '😐': 0, '😡': 0, '😭': 0 };
  const totalVotes = moodData?.totalVotes || 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Smile className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Class Mood Tracker Hari Ini
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bagaimana perasaanmu hari ini di kelas XI-B2? Pilih emoji di bawah ini!
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
          {totalVotes} Suara
        </span>
      </div>

      {/* Emoji Click Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {moods.map((m) => (
          <button
            key={m.emoji}
            id={`btn-mood-${m.emoji}`}
            disabled={voting}
            onClick={() => handleVote(m.emoji)}
            className={`p-4 rounded-2xl border ${m.border} ${m.bg} hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 text-center group cursor-pointer shadow-sm`}
          >
            <span className="text-3xl group-hover:bounce transition-transform">{m.emoji}</span>
            <span className={`text-xs font-bold ${m.text}`}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Class Average Visual Bar Breakdown */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Rata-rata Suasana Hati Kelas</span>
          {moodData?.dominantMood && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              Mood Dominan: {moodData.dominantMood}
            </span>
          )}
        </div>

        <div className="space-y-2">
          {moods.map((m) => {
            const pct = percentages[m.emoji] || 0;
            const count = counts[m.emoji] || 0;
            return (
              <div key={m.emoji} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">{m.emoji}</span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      m.emoji === '😃'
                        ? 'bg-emerald-500'
                        : m.emoji === '😐'
                        ? 'bg-amber-500'
                        : m.emoji === '😡'
                        ? 'bg-rose-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-16 text-right text-xs font-bold text-slate-600 dark:text-slate-400">
                  {pct}% ({count})
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
