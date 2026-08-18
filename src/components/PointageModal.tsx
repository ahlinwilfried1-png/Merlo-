import React, { useState } from 'react';
import { CalendarCheck, Gift, Check, Sparkles, X, Clock, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../data';

interface PointageModalProps {
  onClose: () => void;
  onClaimReward: (amount: number) => void;
}

const STREAK_DAYS = [
  { day: 1, reward: 20, label: 'Jour 1' },
  { day: 2, reward: 20, label: 'Jour 2' },
  { day: 3, reward: 20, label: 'Jour 3' },
  { day: 4, reward: 20, label: 'Jour 4' },
  { day: 5, reward: 20, label: 'Jour 5' },
  { day: 6, reward: 20, label: 'Jour 6' },
  { day: 7, reward: 20, label: 'Jour 7' }
];

export default function PointageModal({ onClose, onClaimReward }: PointageModalProps) {
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  const handlePointage = () => {
    if (hasClaimedToday) return;

    const currentReward = 20;
    setHasClaimedToday(true);
    onClaimReward(currentReward);
    setClaimedNotice(`Félicitations ! Vous avez reçu +${formatCurrency(currentReward)} sur votre solde portefeuille.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-cyan-50" id="pointage-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="aura-glass-card text-cyan-50 border border-[#0d5969]/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto text-left"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 transition cursor-pointer border border-cyan-500/30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 border border-white/20">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider font-mono luminous-text-cyan">
              RÉCOMPENSE QUOTIDIENNE
            </span>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5 luminous-text">
              Pointage Quotidien (Check-in)
            </h2>
          </div>
        </div>

        <p className="text-xs text-cyan-200/90 mb-5 leading-relaxed">
          Effectuez votre pointage chaque jour pour réclamer vos 20 F CFA en Franc CFA. Maintenez une série de 7 jours consécutifs !
        </p>

        {/* Notice alert */}
        <AnimatePresence>
          {claimedNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-emerald-950/90 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{claimedNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
          {STREAK_DAYS.map((item) => {
            const isToday = item.day === currentDay;
            const isPassed = item.day < currentDay || (isToday && hasClaimedToday);

            return (
              <div
                key={item.day}
                className={`p-2.5 rounded-2xl text-center transition-all flex flex-col items-center justify-between shadow-inner ${
                  isToday
                    ? 'bg-cyan-950/90 border border-cyan-400 shadow-md shadow-cyan-500/20'
                    : isPassed
                    ? 'bg-emerald-950/60 border border-emerald-500/40'
                    : 'bg-[#02242e]/70 border border-[#0a4652]/60'
                }`}
              >
                <span className="text-[10px] font-bold text-cyan-300/80 block">J{item.day}</span>
                <div className="my-1">
                  {isPassed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <Gift className={`w-5 h-5 mx-auto ${isToday ? 'text-cyan-300 animate-bounce' : 'text-cyan-600/50'}`} />
                  )}
                </div>
                <span className={`text-[10px] font-bold font-mono ${isToday ? 'text-cyan-300 luminous-text-cyan' : 'text-cyan-400/80'}`}>
                  +{item.reward} F
                </span>
              </div>
            );
          })}
        </div>

        {/* Big Action Button */}
        <button
          onClick={handlePointage}
          disabled={hasClaimedToday}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-xl border ${
            hasClaimedToday
              ? 'bg-[#02242e]/60 text-cyan-500/40 cursor-not-allowed border-[#0a4652]/40'
              : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white active:scale-[0.98] border-cyan-400/30 shadow-cyan-600/30'
          }`}
        >
          {hasClaimedToday ? (
            <>
              <Check className="w-4 h-4" /> Pointage du jour déjà validé
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> Faire mon Pointage (+20 F CFA)
            </>
          )}
        </button>

        <p className="text-[10px] text-cyan-400/70 text-center mt-3 font-mono">
          Règle : Réinitialisation à 00h00 heure GMT
        </p>
      </motion.div>
    </div>
  );
}

