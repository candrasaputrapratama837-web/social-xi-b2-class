import React, { useState, useEffect } from 'react';
import { CountdownEventItem } from '../types';
import { Calendar, Clock, Sparkles } from 'lucide-react';

interface CountdownProps {
  events: CountdownEventItem[];
}

export const CountdownEvent: React.FC<CountdownProps> = ({ events }) => {
  const activeEvent = events.find((e) => e.isActive) || events[0];

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!activeEvent || !activeEvent.targetDate) return;

    const calculateTime = () => {
      const target = new Date(activeEvent.targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [activeEvent]);

  if (!activeEvent) {
    return (
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-md">
        <h3 className="text-sm font-bold opacity-80">Event Countdown</h3>
        <p className="text-xs mt-1 opacity-70">Belum ada agenda countdown aktif saat ini.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-md border border-emerald-700/50 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <span className="px-3 py-1 bg-emerald-700/60 text-emerald-200 text-[11px] font-bold rounded-full uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-300" />
          {activeEvent.category || 'Agenda Penting XI-B2'}
        </span>
        <div className="flex items-center gap-1 text-xs text-emerald-300">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(activeEvent.targetDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
        </div>
      </div>

      <h3 className="text-lg font-black text-white leading-tight mb-1">{activeEvent.title}</h3>
      <p className="text-xs text-emerald-200/90 mb-5 line-clamp-2">{activeEvent.description}</p>

      {/* Counter Grid */}
      <div className="grid grid-cols-4 gap-2.5 text-center">
        <div className="bg-emerald-950/80 backdrop-blur-sm p-3 rounded-2xl border border-emerald-700/50">
          <span className="block text-2xl sm:text-3xl font-black text-amber-300">{timeLeft.days}</span>
          <span className="block text-[10px] uppercase font-bold text-emerald-300 mt-0.5">Hari</span>
        </div>
        <div className="bg-emerald-950/80 backdrop-blur-sm p-3 rounded-2xl border border-emerald-700/50">
          <span className="block text-2xl sm:text-3xl font-black text-white">{timeLeft.hours}</span>
          <span className="block text-[10px] uppercase font-bold text-emerald-300 mt-0.5">Jam</span>
        </div>
        <div className="bg-emerald-950/80 backdrop-blur-sm p-3 rounded-2xl border border-emerald-700/50">
          <span className="block text-2xl sm:text-3xl font-black text-white">{timeLeft.minutes}</span>
          <span className="block text-[10px] uppercase font-bold text-emerald-300 mt-0.5">Menit</span>
        </div>
        <div className="bg-emerald-950/80 backdrop-blur-sm p-3 rounded-2xl border border-emerald-700/50">
          <span className="block text-2xl sm:text-3xl font-black text-emerald-400">{timeLeft.seconds}</span>
          <span className="block text-[10px] uppercase font-bold text-emerald-300 mt-0.5">Detik</span>
        </div>
      </div>
    </div>
  );
};
