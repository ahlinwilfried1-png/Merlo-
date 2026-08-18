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

const POINTAGE_REWARD_AMOUNT = 20; // 20 F CFA
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
    { day: 1, reward: 20, isCompleted: !canClaim },
    { day: 2, reward: 20, isCompleted: false },
    { day: 3, reward: 20, isCompleted: false },
    { day: 4, reward: 20, isCompleted: false },
    { day: 5, reward: 20, isCompleted: false },
    { day: 6, reward: 20, isCompleted: false },
    { day: 7, reward: 20, isCompleted: false }
  ];

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-cyan-50" id="page-pointage-container">
      {/* Header */}
      <PageHeader
        title="Pointage Quotidien"
        subtitle="Effectuez votre pointage toutes les 24h et recevez votre bonus"
        onBack={onBack}
        badge="Cycle 24h"
        icon={<Calendar className="w-5 h-5 text-cyan-400" />}
      />

      {/* Hero Banner Card */}
      <div className="aura-glass-card border border-[#0d5969]/70 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-full text-[10px] font-black uppercase tracking-wider font-mono text-cyan-300 luminous-text-cyan">
              Cycle 24h
            </span>
            <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-full text-[10px] font-black tracking-wider font-mono text-emerald-300 luminous-text-emerald">
              +20 F CFA / jour
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white luminous-text">Prime de Présence Quotidienne</h2>
          <p className="text-xs text-cyan-200/90 leading-relaxed max-w-sm">
            Effectuez votre pointage une fois toutes les 24 heures pour recevoir automatiquement 20 F CFA sur votre solde.
          </p>
        </div>
      </div>

      {/* Pointage Card */}
      <div className="aura-glass-card border border-[#0d5969]/70 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-300 block font-mono luminous-text-cyan">
            Statut du cycle journalier
          </span>
          <div className={`px-3 py-1 rounded-full text-[11px] font-black font-mono flex items-center gap-1.5 border ${
            canClaim 
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 luminous-text-emerald' 
              : 'bg-amber-950/90 text-amber-300 border-amber-500/40'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{canClaim ? 'Disponible' : 'En attente 24h'}</span>
          </div>
        </div>

        {claimedNotice && (
          <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
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
                className={`p-2 sm:p-3 rounded-2xl text-center flex flex-col items-center justify-between gap-1.5 transition ${
                  isToday && canClaim
                    ? 'bg-cyan-950/90 border border-cyan-400 shadow-md shadow-cyan-500/20'
                    : isToday && !canClaim
                    ? 'bg-emerald-950/50 border border-emerald-500/40'
                    : 'bg-[#02242e]/70 border border-[#0a4652]/60'
                }`}
              >
                <span className="text-[9px] sm:text-[10px] font-bold text-cyan-300/80 block">J{item.day}</span>
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                    isToday && canClaim
                      ? 'bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white shadow-md'
                      : isToday && !canClaim
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#02313d] text-cyan-400/60'
                  }`}
                >
                  {isToday && !canClaim ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.day}
                </div>
                <span className="text-[9px] font-bold font-mono text-cyan-200 block">
                  +20 F
                </span>
              </div>
            );
          })}
        </div>

        {/* Timer Box if on cooldown */}
        {!canClaim && (
          <div className="p-4 bg-amber-950/80 rounded-2xl border border-amber-500/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Prochain pointage dans :</span>
            </div>
            <span className="font-mono font-bold text-amber-300 text-sm bg-black/40 px-3 py-1 rounded-xl shadow-inner border border-amber-500/30">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleClaim}
          disabled={!canClaim}
          id="btn-claim-pointage-page"
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl cursor-pointer border ${
            !canClaim
              ? 'bg-[#02242e]/60 text-cyan-500/40 border-[#0a4652]/40 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white active:scale-98 shadow-cyan-600/30 border-cyan-400/30'
          }`}
        >
          <Gift className="w-5 h-5" />
          {canClaim ? 'Pointer & Recevoir 20 F CFA' : `Pointage validé (Revenez dans ${formatTime(timeRemaining)})`}
        </button>

        {/* Rules note */}
        <div className="p-3.5 bg-[#02242e]/80 rounded-2xl border border-[#0a4652]/70 text-[11px] text-cyan-200/90 space-y-1">
          <p className="font-bold text-cyan-300 luminous-text-soft">Règles du pointage :</p>
          <p>• Le pointage s'effectue strictement une fois toutes les 24 heures.</p>
          <p>• Chaque pointage validé crédite immédiatement 20 F CFA sur votre solde.</p>
        </div>
      </div>
    </div>
  );
}

