import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Bell,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { Announcement } from '../types';

interface AnnoncesViewProps {
  announcements?: Announcement[];
  onBack: () => void;
  onNavigate?: (tab: string) => void;
}

export default function AnnoncesView({ 
  announcements = [], 
  onBack, 
  onNavigate 
}: AnnoncesViewProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Vue Détail d'une annonce
  if (selectedAnnouncement) {
    return (
      <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left aura-glass-card border border-[#0d5969] rounded-3xl p-4 sm:p-6 shadow-2xl text-white" id="page-announcement-detail">
        {/* Barre d'en-tête Thème Sombre Luminous */}
        <div className="flex items-center justify-between py-2 border-b border-[#0a4652]/70 pb-3">
          <button
            onClick={() => setSelectedAnnouncement(null)}
            className="w-9 h-9 rounded-full bg-[#064250]/80 hover:bg-[#085668] border border-cyan-500/30 text-cyan-300 hover:text-white flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95"
            title="Retour à la liste"
            id="btn-back-to-announcements"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
            <h1 className="text-base sm:text-lg font-black text-white luminous-text">Détail du Message</h1>
          </div>
          <div className="w-9 h-9" />
        </div>

        {/* Contenu de l'annonce */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-1"
        >
          <div className="space-y-2 pb-2">
            <div className="flex items-start gap-2.5">
              {selectedAnnouncement.isNew && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)] inline-block mt-1.5 shrink-0" />
              )}
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug luminous-text">
                {selectedAnnouncement.title}
              </h2>
            </div>
            
            <div className="flex items-center justify-between text-xs text-cyan-200/80">
              <span className="font-mono bg-[#021f28] border border-[#094754] px-2.5 py-0.5 rounded-lg text-cyan-300/90 text-[11px]">
                {selectedAnnouncement.date}
              </span>
              {selectedAnnouncement.tag && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-extrabold luminous-text-emerald">
                  {selectedAnnouncement.tag}
                </span>
              )}
            </div>
          </div>

          {/* Corps complet du texte */}
          <div className="bg-[#02242e]/90 border border-[#094754]/70 rounded-2xl p-4 sm:p-5 text-sm text-cyan-100/95 leading-relaxed space-y-3 whitespace-pre-line shadow-inner">
            {selectedAnnouncement.content}
          </div>

          {/* Bouton d'action si disponible */}
          {selectedAnnouncement.actionTab && onNavigate && (
            <div className="pt-2">
              <button
                onClick={() => onNavigate(selectedAnnouncement.actionTab!)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-orange-500/25 border border-orange-400/30"
              >
                <span>{selectedAnnouncement.actionText || 'Accéder'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // LISTE PRINCIPALE DES ANNONCES (Thème Site Dark Cyan & Luminous)
  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left aura-glass-card border border-[#0d5969] rounded-3xl p-4 sm:p-6 shadow-2xl text-white" id="page-annonces-container">
      {/* Barre d'en-tête Thème Sombre */}
      <div className="flex items-center justify-between py-2 border-b border-[#0a4652]/70 pb-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[#064250]/80 hover:bg-[#085668] border border-cyan-500/30 text-cyan-300 hover:text-white flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95"
          title="Retour"
          id="btn-back-annonces-view"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
          <h1 className="text-base sm:text-lg font-black text-white luminous-text">Message & Annonces</h1>
        </div>
        <div className="w-9 h-9" />
      </div>

      {/* Liste des annonces */}
      <div className="space-y-2.5">
        {/* En-tête Canal Officiel WhatsApp */}
        <a
          href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 p-3.5 bg-[#022b36]/90 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-white group cursor-pointer hover:bg-[#033947] transition shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white block">Chaîne Officielle WhatsApp Agroprofit</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9px] font-black uppercase luminous-text-emerald">
                  Officiel
                </span>
              </div>
              <span className="text-[11px] text-cyan-300/90 font-medium block">Alertes en temps réel, guides & preuves de paiement</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </a>

        {announcements.length === 0 ? (
          <div className="py-12 text-center text-cyan-300/60 text-sm bg-[#02242e]/60 border border-[#094754]/60 rounded-2xl">
            Aucun message ou annonce pour le moment.
          </div>
        ) : (
          announcements.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedAnnouncement(item)}
              className="py-3.5 px-4 rounded-2xl bg-[#022b36]/80 hover:bg-[#064250]/90 border border-[#094754]/70 transition-all cursor-pointer flex items-center justify-between gap-3 group w-full shadow-sm"
            >
              {/* Colonne gauche : Titre avec point vert/bleu + Date */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-start gap-2.5">
                  {item.isNew && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)] inline-block mt-1.5 shrink-0" />
                  )}
                  <h3 className="text-xs sm:text-sm md:text-base font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors luminous-text-soft">
                    {item.title}
                  </h3>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-cyan-300/70 font-mono">
                  <span>{item.date}</span>
                  {item.tag && (
                    <span className="px-2 py-0.2 rounded-md bg-[#021f28] border border-cyan-500/30 text-cyan-300 text-[10px]">
                      {item.tag}
                    </span>
                  )}
                </div>
              </div>

              {/* Colonne droite : Flèche > */}
              <ChevronRight className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
