import React, { useState } from 'react';
import { CalendarCheck, Gift, Check, Sparkles, X, Clock, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../data';

interface PointageModalProps {
  onClose: () => void;
  onClaimReward: (amount: number) => void;
}

const STREAK_DAYS = [
  { day: 1, reward: 100, label: 'Jour 1' },
  { day: 2, reward: 150, label: 'Jour 2' },
  { day: 3, reward: 200, label: 'Jour 3' },
  { day: 4, reward: 250, label: 'Jour 4' },
  { day: 5, reward: 300, label: 'Jour 5' },
  { day: 6, reward: 400, label: 'Jour 6' },
  { day: 7, reward: 500, label: 'Jour 7 (Grand Bonus)' }
];

export default function PointageModal({ onClose, onClaimReward }: PointageModalProps) {
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  const handlePointage = () => {
    if (hasClaimedToday) return;

    const currentReward = STREAK_DAYS[currentDay - 1]?.reward || 200;
    setHasClaimedToday(true);
    onClaimReward(currentReward);
    setClaimedNotice(`Félicitations ! Vous avez reçu +${formatCurrency(currentReward)} sur votre solde portefeuille.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="pointage-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white text-zinc-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto text-left"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider font-mono">
              RÉCOMPENSE QUOTIDIENNE
            </span>
            <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight mt-0.5">
              Pointage Quotidien (Check-in)
            </h2>
          </div>
        </div>

        <p className="text-xs text-zinc-600 mb-5 leading-relaxed">
          Effectuez votre pointage chaque jour pour réclamer vos bonus en Franc CFA. Maintenez une série de 7 jours consécutifs pour débloquer le super bonus de fidélité !
        </p>

        {/* Notice alert */}
        <AnimatePresence>
          {claimedNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
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
                className={`p-2.5 rounded-xl text-center transition-all flex flex-col items-center justify-between shadow-xs ${
                  isToday
                    ? 'bg-amber-50 shadow-md ring-2 ring-amber-400/40'
                    : isPassed
                    ? 'bg-emerald-50'
                    : 'bg-zinc-50 opacity-70'
                }`}
              >
                <span className="text-[10px] font-bold text-zinc-500 block">J{item.day}</span>
                <div className="my-1">
                  {isPassed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <Gift className={`w-5 h-5 mx-auto ${isToday ? 'text-amber-600 animate-bounce' : 'text-zinc-400'}`} />
                  )}
                </div>
                <span className={`text-[10px] font-black font-mono ${isToday ? 'text-amber-700' : 'text-zinc-700'}`}>
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
          className={`w-full py-3.5 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
            hasClaimedToday
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25 active:scale-[0.98]'
          }`}
        >
          {hasClaimedToday ? (
            <>
              <Check className="w-4 h-4" /> Pointage du jour déjà validé
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> Faire mon Pointage (+{STREAK_DAYS[currentDay - 1]?.reward} F CFA)
            </>
          )}
        </button>

        <p className="text-[10px] text-zinc-500 text-center mt-3 font-mono">
          Prochain pointage réinitialisé à minuit (00:00 GMT).
        </p>
      </motion.div>
    </div>
  );
}
