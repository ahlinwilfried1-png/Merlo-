import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  MessageCircle,
  ExternalLink
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
      <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-slate-900 bg-white rounded-3xl p-4 sm:p-6 shadow-sm" id="page-announcement-detail">
        {/* Barre d'en-tête Sans Cadre */}
        <div className="flex items-center justify-between py-2.5">
          <button
            onClick={() => setSelectedAnnouncement(null)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Retour à la liste"
            id="btn-back-to-announcements"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">Message</h1>
          <div className="w-9 h-9" />
        </div>

        {/* Contenu Sans Cadre */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2 pb-3">
            <div className="flex items-start gap-2">
              {selectedAnnouncement.isNew && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mt-1.5 shrink-0" />
              )}
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {selectedAnnouncement.title}
              </h2>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">{selectedAnnouncement.date}</span>
              {selectedAnnouncement.tag && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  {selectedAnnouncement.tag}
                </span>
              )}
            </div>
          </div>

          {/* Corps complet du texte */}
          <div className="text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line py-2">
            {selectedAnnouncement.content}
          </div>

          {/* Bouton d'action si disponible */}
          {selectedAnnouncement.actionTab && onNavigate && (
            <div className="pt-3">
              <button
                onClick={() => onNavigate(selectedAnnouncement.actionTab!)}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
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

  // LISTE PRINCIPALE DES ANNONCES (Sans Cadre)
  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-slate-900 bg-white rounded-3xl p-4 sm:p-6 shadow-sm" id="page-annonces-container">
      {/* Barre d'en-tête Sans Cadre */}
      <div className="flex items-center justify-between py-2.5">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
          title="Retour"
          id="btn-back-annonces-view"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-900">Message & Annonces</h1>
        <div className="w-9 h-9" />
      </div>

      {/* Liste des annonces Sans Cadre */}
      <div className="space-y-2">
        {/* En-tête Canal Officiel Sans Cadre */}
        <a
          href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between gap-3 text-slate-800 group cursor-pointer hover:bg-slate-100/90 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 block">Suivre la chaîne Agroprofit sur WhatsApp</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase">
                  Officiel
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium block">Alertes en temps réel & preuves de retraits</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </a>

        {announcements.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Aucun message ou annonce pour le moment.
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedAnnouncement(item)}
              className="py-3.5 px-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-3 group w-full"
            >
              {/* Colonne gauche : Titre avec point vert + Date */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-start gap-2">
                  {item.isNew && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mt-1.5 shrink-0" />
                  )}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                </div>
                <div className="mt-1 text-xs text-slate-400 font-mono">
                  {item.date}
                </div>
              </div>

              {/* Colonne droite : Flèche > */}
              <div className="shrink-0 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5">
                <ChevronRight className="w-5 h-5 stroke-[2]" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
