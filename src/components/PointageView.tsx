import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  Clock,
  ChevronLeft,
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

const POINTAGE_REWARD_AMOUNT = 100; // 100 F CFA
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
    <div className="max-w-xl mx-auto space-y-4 text-left text-zinc-100" id="page-pointage-container">
      {/* Header */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition cursor-pointer border border-zinc-700"
          title="Retour"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-white">Pointage Quotidien</h1>
        <div className="w-9 h-9" />
      </div>

      {/* Hero Banner Card */}
      <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
              Cycle 24h
            </span>
            <span className="px-3 py-1 bg-black/30 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider">
              +100 F CFA / jour
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Prime de Présence Quotidienne</h2>
          <p className="text-xs text-emerald-100 leading-relaxed max-w-sm">
            Effectuez votre pointage une fois toutes les 24 heures pour recevoir automatiquement 100 F CFA sur votre solde.
          </p>
        </div>
      </div>

      {/* Pointage Card */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block font-mono">
            Statut du cycle journalier
          </span>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
            canClaim ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{canClaim ? 'Disponible' : 'En attente 24h'}</span>
          </div>
        </div>

        {claimedNotice && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{claimedNotice}</span>
          </div>
        )}

        {/* 7 Days Preview */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {streakDays.map((item) => {
            const isToday = item.day === 1;
            return (
              <div
                key={item.day}
                className={`p-2 sm:p-3 rounded-2xl text-center flex flex-col items-center justify-between gap-1.5 shadow-xs transition ${
                  isToday && canClaim
                    ? 'bg-emerald-500/20 border border-emerald-500/40'
                    : isToday && !canClaim
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-zinc-900 border border-zinc-800'
                }`}
              >
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 block">J{item.day}</span>
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                    isToday && canClaim
                      ? 'bg-emerald-500 text-white animate-pulse'
                      : isToday && !canClaim
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isToday && !canClaim ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.day}
                </div>
                <span className="text-[9px] font-bold font-mono text-zinc-300 block">
                  +100 F
                </span>
              </div>
            );
          })}
        </div>

        {/* Timer Box if on cooldown */}
        {!canClaim && (
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Prochain pointage dans :</span>
            </div>
            <span className="font-mono font-bold text-amber-400 text-sm bg-zinc-900 px-3 py-1 rounded-xl shadow-xs border border-amber-500/30">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleClaim}
          disabled={!canClaim}
          id="btn-claim-pointage-page"
          className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
            !canClaim
              ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-98'
          }`}
        >
          <Gift className="w-5 h-5" />
          {canClaim ? 'Pointer & Recevoir 100 F CFA' : `Pointage validé (Revenez dans ${formatTime(timeRemaining)})`}
        </button>

        {/* Rules note */}
        <div className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
          <p className="font-bold text-zinc-200">Règles du pointage :</p>
          <p>• Le pointage s'effectue strictement une fois toutes les 24 heures.</p>
          <p>• Chaque pointage validé crédite immédiatement 100 F CFA sur votre solde.</p>
        </div>
      </div>
    </div>
  );
}

