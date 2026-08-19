import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Bell,
  Sparkles,
  ShieldCheck,
  Award,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Announcement } from '../types';

interface AnnoncesViewProps {
  announcements?: Announcement[];
  onBack: () => void;
  onNavigate?: (tab: string) => void;
}

const getTagTheme = (tag?: string) => {
  const t = (tag || '').toLowerCase();
  if (t.includes('récompense') || t.includes('bonus') || t.includes('cadeau') || t.includes('prime')) {
    return {
      badgeBg: 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 border-amber-400/60 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]',
      dotBg: 'bg-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]',
      cardBorder: 'border-amber-500/40 hover:border-amber-400/80',
      gradient: 'from-amber-500/15 via-[#022b36]/90 to-[#021f28]',
      icon: Award
    };
  }
  if (t.includes('témoignage') || t.includes('preuve') || t.includes('paiement') || t.includes('retrait')) {
    return {
      badgeBg: 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 border-emerald-400/60 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]',
      dotBg: 'bg-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]',
      cardBorder: 'border-emerald-500/40 hover:border-emerald-400/80',
      gradient: 'from-emerald-500/15 via-[#022b36]/90 to-[#021f28]',
      icon: CheckCircle2
    };
  }
  if (t.includes('sécurité') || t.includes('important') || t.includes('alerte') || t.includes('officiel')) {
    return {
      badgeBg: 'bg-gradient-to-r from-rose-500/25 to-red-500/25 border-rose-400/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
      dotBg: 'bg-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]',
      cardBorder: 'border-rose-500/40 hover:border-rose-400/80',
      gradient: 'from-rose-500/15 via-[#022b36]/90 to-[#021f28]',
      icon: ShieldCheck
    };
  }
  if (t.includes('produit') || t.includes('vip') || t.includes('top') || t.includes('investissement')) {
    return {
      badgeBg: 'bg-gradient-to-r from-purple-500/25 to-indigo-500/25 border-purple-400/60 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
      dotBg: 'bg-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]',
      cardBorder: 'border-purple-500/40 hover:border-purple-400/80',
      gradient: 'from-purple-500/15 via-[#022b36]/90 to-[#021f28]',
      icon: TrendingUp
    };
  }
  return {
    badgeBg: 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border-cyan-400/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    dotBg: 'bg-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]',
    cardBorder: 'border-cyan-500/40 hover:border-cyan-400/80',
    gradient: 'from-cyan-500/15 via-[#022b36]/90 to-[#021f28]',
    icon: Sparkles
  };
};

export default function AnnoncesView({ 
  announcements = [], 
  onBack, 
  onNavigate 
}: AnnoncesViewProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Vue Détail d'une annonce
  if (selectedAnnouncement) {
    const theme = getTagTheme(selectedAnnouncement.tag);
    const IconComp = theme.icon;

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
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${theme.gradient} border ${theme.cardBorder} space-y-2`}>
            <div className="flex items-start gap-2.5">
              <span className={`w-3 h-3 rounded-full ${theme.dotBg} inline-block mt-1 shrink-0`} />
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug luminous-text">
                {selectedAnnouncement.title}
              </h2>
            </div>
            
            <div className="flex items-center justify-between text-xs text-cyan-200/80 pt-1">
              <span className="font-mono bg-[#021f28]/90 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-cyan-300 text-[11px]">
                {selectedAnnouncement.date}
              </span>
              {selectedAnnouncement.tag && (
                <span className={`px-3 py-1 rounded-full border text-[11px] font-extrabold flex items-center gap-1.5 ${theme.badgeBg}`}>
                  <IconComp className="w-3.5 h-3.5" />
                  {selectedAnnouncement.tag}
                </span>
              )}
            </div>
          </div>

          {/* Corps complet du texte */}
          <div className="bg-[#02242e]/95 border border-[#094754]/80 rounded-2xl p-4 sm:p-5 text-sm text-cyan-50 leading-relaxed space-y-3 whitespace-pre-line shadow-inner">
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

  // LISTE PRINCIPALE DES ANNONCES (Thème Coloré, Vibrant & Luminous)
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
      <div className="space-y-3">
        {/* En-tête Canal Officiel WhatsApp */}
        <a
          href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 p-4 bg-gradient-to-r from-emerald-950/80 via-[#022b36] to-[#021f28] border border-emerald-500/50 rounded-2xl flex items-center justify-between gap-3 text-white group cursor-pointer hover:border-emerald-400 transition-all shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white block luminous-text">Chaîne Officielle WhatsApp</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/60 text-emerald-300 text-[9px] font-black uppercase tracking-wider">
                  Vérifié
                </span>
              </div>
              <span className="text-[11px] text-emerald-200/90 font-medium block mt-0.5">Alertes instantanées, guides & preuves de paiement</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </a>

        {announcements.length === 0 ? (
          <div className="py-12 text-center text-cyan-300/60 text-sm bg-[#02242e]/60 border border-[#094754]/60 rounded-2xl">
            Aucun message ou annonce pour le moment.
          </div>
        ) : (
          announcements.map((item) => {
            const theme = getTagTheme(item.tag);
            const IconComp = theme.icon;

            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedAnnouncement(item)}
                className={`py-3.5 px-4 rounded-2xl bg-gradient-to-r ${theme.gradient} border ${theme.cardBorder} transition-all cursor-pointer flex items-center justify-between gap-3 group w-full shadow-md`}
              >
                {/* Colonne gauche : Titre avec point lumineux coloré + Date + Badge coloré */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-start gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${theme.dotBg} inline-block mt-1.5 shrink-0`} />
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-white leading-snug group-hover:text-cyan-200 transition-colors luminous-text-soft">
                      {item.title}
                    </h3>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-cyan-300/80 font-mono text-[11px] bg-[#021f28]/80 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                      {item.date}
                    </span>
                    {item.tag && (
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1 ${theme.badgeBg}`}>
                        <IconComp className="w-3 h-3" />
                        {item.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Colonne droite : Flèche > */}
                <div className="w-7 h-7 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:bg-cyan-900 group-hover:border-cyan-400 transition-all">
                  <ChevronRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
