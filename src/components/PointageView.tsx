import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  Clock,
  Coins,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { formatCurrency } from '../data';
import PageHeader from './PageHeader';

interface PointageViewProps {
  onBack: () => void;
  onClaimDaily: () => void;
}

const POINTAGE_REWARD_AMOUNT = 100; // Exactement 100 F CFA (Daily check-in reward)
const POINTAGE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 heures

export default function PointageView({ onBack, onClaimDaily }: PointageViewProps) {
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  // Load last claim timestamp
  useEffect(() => {
    const saved = localStorage.getItem('aura_last_pointage_time');
    if (saved) {
      const timestamp = parseInt(saved, 10);
      setLastClaimTime(timestamp);
    }
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    const updateCountdown = () => {
      if (!lastClaimTime) {
        setTimeRemaining(0);
        return;
      }
      const now = Date.now();
      const elapsed = now - lastClaimTime;
      const remaining = POINTAGE_COOLDOWN_MS - elapsed;
      if (remaining > 0) {
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lastClaimTime]);

  const canClaim = timeRemaining <= 0;

  const handleClaim = () => {
    if (!canClaim) return;

    const now = Date.now();
    localStorage.setItem('aura_last_pointage_time', now.toString());
    setLastClaimTime(now);
    setTimeRemaining(POINTAGE_COOLDOWN_MS);
    setClaimedNotice(`+${formatCurrency(POINTAGE_REWARD_AMOUNT)} ajoutés avec succès à votre solde pour votre pointage journalier !`);
    onClaimDaily();
  };

  // Format milliseconds to HH:MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const streakDays = [
    { day: 1, reward: 100, isCompleted: !canClaim },
    { day: 2, reward: 100, isCompleted: false },
    { day: 3, reward: 100, isCompleted: false },
    { day: 4, reward: 100, isCompleted: false },
    { day: 5, reward: 100, isCompleted: false },
    { day: 6, reward: 100, isCompleted: false },
    { day: 7, reward: 100, isCompleted: false }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-4 text-left" id="page-pointage-container">
      <PageHeader
        title="Pointage Quotidien"
        subtitle="Disponible chaque 24 heures (Gain : 100 F CFA)"
        onBack={onBack}
        badge="Bonus 24h"
        icon={<Gift className="w-5 h-5 text-amber-600" />}
      />

      {/* Hero Banner Card */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
              Cycle 24h
            </span>
            <span className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-wider">
              +20 F CFA / jour
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Prime de Présence Quotidienne</h2>
          <p className="text-xs text-amber-100 leading-relaxed max-w-sm">
            Effectuez votre pointage une fois toutes les 24 heures pour recevoir automatiquement 20 F CFA sur votre solde.
          </p>
        </div>
      </div>

      {/* Pointage Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block font-mono">
            Statut du cycle journalier
          </span>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
            canClaim ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{canClaim ? 'Disponible' : 'En attente 24h'}</span>
          </div>
        </div>

        {claimedNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{claimedNotice}</span>
          </div>
        )}

        {/* 7 Days Preview - All strictly 20 F CFA */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {streakDays.map((item) => {
            const isToday = item.day === 1;
            return (
              <div
                key={item.day}
                className={`p-2 sm:p-3 rounded-2xl text-center flex flex-col items-center justify-between gap-1.5 shadow-xs transition ${
                  isToday && canClaim
                    ? 'bg-amber-50 ring-2 ring-amber-400'
                    : isToday && !canClaim
                    ? 'bg-emerald-50'
                    : 'bg-zinc-50'
                }`}
              >
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 block">J{item.day}</span>
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black ${
                    isToday && canClaim
                      ? 'bg-amber-500 text-white animate-pulse'
                      : isToday && !canClaim
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-500'
                  }`}
                >
                  {isToday && !canClaim ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.day}
                </div>
                <span className="text-[9px] font-bold font-mono text-zinc-700 block">
                  +20 F
                </span>
              </div>
            );
          })}
        </div>

        {/* Timer Box if on cooldown */}
        {!canClaim && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Prochain pointage dans :</span>
            </div>
            <span className="font-mono font-black text-amber-800 text-sm bg-white px-3 py-1 rounded-xl shadow-xs">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleClaim}
          disabled={!canClaim}
          id="btn-claim-pointage-page"
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
            !canClaim
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20 active:scale-98'
          }`}
        >
          <Gift className="w-5 h-5" />
          {canClaim ? 'Pointer & Recevoir 20 F CFA' : `Pointage validé (Revenez dans ${formatTime(timeRemaining)})`}
        </button>

        {/* Rules note */}
        <div className="p-3 bg-zinc-50 rounded-2xl text-[11px] text-zinc-500 space-y-1">
          <p className="font-bold text-zinc-700">Règles du pointage :</p>
          <p>• Le pointage s'effectue strictement une fois toutes les 24 heures.</p>
          <p>• Chaque pointage validé crédite immédiatement 20 F CFA sur votre solde.</p>
        </div>
      </div>
    </div>
  );
}
