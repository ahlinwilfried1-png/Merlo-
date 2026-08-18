import React from 'react';
import { Megaphone, Bell, Sparkles, AlertCircle, CheckCircle2, ChevronRight, X, Calendar, MessageCircle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface AnnoncesModalProps {
  onClose: () => void;
}

const ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Partenariat Stratégique & Projets Aura Invest VIP',
    category: 'Officiel',
    date: 'Aujourd\'hui',
    content: 'Aura Invest accélère ses programmes d\'investissement agricole dans toute la sous-région. Tous les forfaits VIP bénéficient désormais d\'un dividende versé automatiquement toutes les 24h sur votre solde retirable.',
    urgent: true
  },
  {
    id: 'ann-2',
    title: 'Recharges et Retraits Mobile Money 100% Instantanés',
    category: 'Paiement',
    date: 'Hier',
    content: 'Les passerelles T-Money Togo, Flooz Moov Togo, Wave, Orange Money, MTN MoMo et Moov Money fonctionnent à pleine vitesse avec zéro délai de validation.',
    urgent: false
  },
  {
    id: 'ann-3',
    title: 'Super Bonus Parrainage : Taux de 15% sur le Niveau 1',
    category: 'Promotion',
    date: 'Il y a 3 jours',
    content: 'Invitez vos proches à souscrire un contrat Aura Invest VIP et bénéficiez de 15% de commission directe crédités immédiatement en Franc CFA.',
    urgent: false
  }
];

export default function AnnoncesModal({ onClose }: AnnoncesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-cyan-50" id="annonces-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="aura-glass-card text-cyan-50 border border-[#0d5969]/80 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto text-left"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 transition cursor-pointer border border-cyan-500/30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 border border-white/20">
            <Megaphone className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider font-mono luminous-text-cyan">
              COMMUNIQUÉS & ACTUALITÉS
            </span>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5 luminous-text">
              Annonces Officielles
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {ANNOUNCEMENTS.map((item) => (
            <div
              key={item.id}
              className="p-4.5 rounded-2xl bg-[#02242e]/80 border border-[#0a4652]/70 text-cyan-50 space-y-2 shadow-inner"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 luminous-text-cyan">
                  {item.category}
                </span>
                <span className="text-[11px] text-cyan-300/80 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" /> {item.date}
                </span>
              </div>
              <h3 className="text-sm font-black text-white leading-snug luminous-text-soft">{item.title}</h3>
              <p className="text-xs text-cyan-200/85 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-[#02242e]/90 border border-[#0a4652]/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-xs font-black text-white block luminous-text-soft">Chaîne Officielle WhatsApp</span>
              <span className="text-[11px] text-cyan-300/80 block">Suivre la chaîne Aura Invest pour ne manquer aucun gain</span>
            </div>
          </div>

          <a
            href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shrink-0 shadow-lg shadow-cyan-600/30 border border-cyan-400/30"
          >
            <span>Suivre</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 rounded-xl text-xs font-bold transition cursor-pointer border border-cyan-500/30"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

