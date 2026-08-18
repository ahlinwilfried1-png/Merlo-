import React from 'react';
import { CalendarCheck, Sparkles, X, Clock, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../data';

export interface PointageModalState {
  isOpen: boolean;
  status: 'success' | 'already_claimed';
  amount: number;
  message?: string;
  timeLeftText?: string;
}

interface PointageRewardModalProps {
  modalState: PointageModalState;
  onClose: () => void;
}

export default function PointageRewardModal({ modalState, onClose }: PointageRewardModalProps) {
  if (!modalState.isOpen) return null;

  const isSuccess = modalState.status === 'success';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-cyan-50"
      id="pointage-direct-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="aura-glass-card border border-[#0d5969]/80 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative text-center overflow-hidden"
        id="pointage-direct-modal-card"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 transition cursor-pointer border border-cyan-500/30"
          title="Fermer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Top Floating Badge */}
        <div className="flex justify-center mb-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono border ${
            isSuccess 
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 luminous-text-emerald' 
              : 'bg-amber-950/90 text-amber-300 border-amber-500/40'
          }`}>
            {isSuccess ? 'Pointage Validé' : 'Cycle en cours'}
          </span>
        </div>

        {/* Big Animated Icon */}
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <motion.div 
              initial={{ scale: 0.6, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-cyan-600/40 border border-white/20"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-amber-900/80 text-amber-300 flex items-center justify-center shadow-xl border border-amber-500/40">
              <Clock className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title & Amount */}
        {isSuccess ? (
          <div className="space-y-1 mb-3">
            <h3 className="text-xl font-black text-white tracking-tight luminous-text">
              +20 F CFA Crédités !
            </h3>
            <p className="text-xs text-cyan-200/90 font-medium leading-relaxed px-2">
              Votre pointage quotidien a été enregistré avec succès et vos <strong className="text-emerald-400 font-bold font-mono luminous-text-emerald">20 F CFA</strong> ont été ajoutés directement à votre solde disponible.
            </p>
          </div>
        ) : (
          <div className="space-y-1 mb-3">
            <h3 className="text-lg font-black text-white tracking-tight luminous-text-soft">
              Pointage déjà effectué
            </h3>
            <p className="text-xs text-cyan-200/90 font-medium leading-relaxed px-2">
              Vous avez déjà récupéré vos 20 F CFA pour aujourd'hui.
              {modalState.timeLeftText && (
                <span className="block mt-1 font-bold text-amber-300 font-mono">
                  Prochain pointage dans : {modalState.timeLeftText}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            id="btn-close-pointage-feedback"
            className={`w-full py-4 px-4 rounded-2xl text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xl active:scale-98 flex items-center justify-center gap-2 border ${
              isSuccess 
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 border-cyan-400/40 shadow-cyan-600/30' 
                : 'bg-cyan-950/90 hover:bg-cyan-900 border-cyan-500/40 text-cyan-200'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Super, Continuer</span>
              </>
            ) : (
              <span>Compris</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

