import React from 'react';
import { Megaphone, Bell, Sparkles, AlertCircle, CheckCircle2, ChevronRight, X, Calendar, MessageCircle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface AnnoncesModalProps {
  onClose: () => void;
}

const ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Partenariat Stratégique & Projets Agrocapital VIP',
    category: 'Officiel',
    date: 'Aujourd\'hui',
    badgeColor: 'bg-[#22c55e]/20 text-[#22c55e]',
    content: 'Agrocapital accélère ses programmes d\'investissement agricole dans toute la sous-région. Tous les forfaits VIP bénéficient désormais d\'un dividende versé automatiquement toutes les 24h sur votre solde retirable.',
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
    content: 'Invitez vos proches à souscrire un contrat Agrocapital VIP et bénéficiez de 30% de commission directe crédités immédiatement en Franc CFA.',
    urgent: false
  }
];

export default function AnnoncesModal({ onClose }: AnnoncesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="annonces-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#121215] text-zinc-100 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto text-left"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer border border-zinc-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
            <Megaphone className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider font-mono">
              COMMUNIQUÉS & ACTUALITÉS
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Annonces Officielles
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {ANNOUNCEMENTS.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.category}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {item.date}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Chaîne Officielle WhatsApp</span>
              <span className="text-[11px] text-zinc-400 block">Suivre la chaîne Aura Invest pour ne manquer aucun gain</span>
            </div>
          </div>

          <a
            href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shrink-0 shadow-lg"
          >
            <span>Suivre</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-700"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
