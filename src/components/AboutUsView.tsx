import React from 'react';
import { ChevronLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AboutUsViewProps {
  onBack: () => void;
}

export default function AboutUsView({ onBack }: AboutUsViewProps) {
  return (
    <div className="max-w-xl mx-auto space-y-4 text-left text-zinc-100" id="page-about-us-container">
      {/* Header */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition cursor-pointer border border-zinc-700"
          title="Retour"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-white">À Propos de Nous</h1>
        <div className="w-9 h-9" />
      </div>

      {/* Content */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 text-zinc-300 text-sm leading-relaxed">
        <p>
          <strong className="text-white">Aura Car & Agroprofit</strong> est une plateforme technologique et financière pionnière spécialisée dans les investissements à haut rendement, le matériel roulant et les projets agricoles modernes en Afrique de l'Ouest.
        </p>

        <div className="py-2 space-y-2">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
            Nos engagements fondamentaux
          </h2>
          <div className="space-y-2.5 pt-1 text-xs text-zinc-400">
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold text-sm leading-none mt-0.5">•</span>
              <span><strong className="text-white">Revenus 24/7 :</strong> Les gains issus de l'exploitation sont distribués automatiquement chaque 24 heures.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold text-sm leading-none mt-0.5">•</span>
              <span><strong className="text-white">Retraits Fluides :</strong> Traitement continu 24h/24 vers les principaux réseaux Mobile Money (T-Money, Flooz) et comptes certifiés.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold text-sm leading-none mt-0.5">•</span>
              <span><strong className="text-white">Programme d'Affiliation Transparent :</strong> 15% de commission au Niveau 1, 2% au Niveau 2 et 1% au Niveau 3.</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-500 pt-3 border-t border-zinc-800/80">
          Siège social : Lomé, Togo • Filiales : Abidjan, Cotonou, Dakar • Licence d'exploitation financière n° TG-2026-AURA-8991.
        </p>
      </div>
    </div>
  );
}


