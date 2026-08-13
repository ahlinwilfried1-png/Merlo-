import React from 'react';
import { Megaphone, Bell, Sparkles, AlertCircle, CheckCircle2, ChevronRight, X, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface AnnoncesModalProps {
  onClose: () => void;
}

const ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Partenariat Stratégique & Flotte Automobile VIP',
    category: 'Officiel',
    date: 'Aujourd\'hui',
    badgeColor: 'bg-[#22c55e]/20 text-[#22c55e]',
    content: 'Aura Invest accélère ses programmes d\'investissement automobile dans toute la sous-région. Tous les forfaits VIP bénéficient désormais d\'un dividende versé automatiquement toutes les 24h sur votre solde retirable.',
    urgent: true
  },
  {
    id: 'ann-2',
    title: 'Recharges et Retraits Mobile Money 100% Instantanés',
    category: 'Paiement',
    date: 'Hier',
    badgeColor: 'bg-orange-500/20 text-orange-400',
    content: 'Les passerelles Wave, Orange Money, MTN MoMo, Moov Money et Free Money fonctionnent à pleine vitesse avec zéro délai de validation.',
    urgent: false
  },
  {
    id: 'ann-3',
    title: 'Super Bonus Parrainage : Taux record de 30% sur le Niveau 1',
    category: 'Promotion',
    date: 'Il y a 3 jours',
    badgeColor: 'bg-violet-500/20 text-violet-400',
    content: 'Invitez vos proches à souscrire un véhicule VIP et bénéficiez de 30% de commission directe crédités immédiatement en Franc CFA.',
    urgent: false
  }
];

export default function AnnoncesModal({ onClose }: AnnoncesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs" id="annonces-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto text-left"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#22c55e] text-black flex items-center justify-center shadow-lg shadow-[#22c55e]/25">
            <Megaphone className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-[10px] font-black uppercase tracking-wider font-mono">
              COMMUNIQUÉS & ACTUALITÉS
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              Annonces Officielles
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {ANNOUNCEMENTS.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-zinc-950 text-white space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono ${item.badgeColor}`}>
                  {item.category}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {item.date}
                </span>
              </div>
              <h3 className="text-sm font-black text-white leading-snug">{item.title}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#22c55e] hover:bg-[#1eb852] text-black rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
          >
            J'ai compris
          </button>
        </div>
      </motion.div>
    </div>
  );
}
