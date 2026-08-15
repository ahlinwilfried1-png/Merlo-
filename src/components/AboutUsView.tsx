import React from 'react';
import { Info, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AboutUsViewProps {
  onBack: () => void;
}

export default function AboutUsView({ onBack }: AboutUsViewProps) {
  return (
    <div className="max-w-xl mx-auto space-y-6 text-left" id="page-about-us-container">
      {/* Header */}
      <div className="flex items-center gap-3 py-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-white tracking-tight">À Propos de Nous</h1>
          <p className="text-xs text-zinc-400">Présentation du groupe Agrocapital & Projets Agricoles VIP</p>
        </div>
      </div>

      {/* Content without heavy borders */}
      <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
        <p>
          <strong className="text-white">Agrocapital</strong> est une plateforme technologique et financière pionnière spécialisée dans le financement participatif de projets agricoles, de serres modernes, de fermes mécanisées et d'unités agro-industrielles à haut rendement en Afrique de l'Ouest et Centrale.
        </p>

        <div className="py-2 space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-[#22c55e]">
            Nos engagements fondamentaux
          </h2>
          <div className="space-y-2 pt-1 text-xs text-zinc-300">
            <div className="flex items-start gap-2.5">
              <span className="text-[#22c55e] font-bold">•</span>
              <span><strong>Revenus 24/7 :</strong> Les gains issus de l'exploitation des projets agro-industriels sont distribués automatiquement chaque 24 heures.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#22c55e] font-bold">•</span>
              <span><strong>Retraits Fluides :</strong> Traitement continu 24h/24 vers les principaux réseaux Mobile Money (Wave, Orange, MTN, Moov) et comptes bancaires.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#22c55e] font-bold">•</span>
              <span><strong>Programme d'Affiliation Transparent :</strong> 30% de commission au Niveau 1, 2% au Niveau 2 et 1% au Niveau 3.</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-800/40">
          Siège social : Abidjan, Plateau • Filiales : Dakar, Yaoundé, Cotonou, Lomé • Licence d'exploitation financière n° CI-2026-AURA-8991.
        </p>
      </div>
    </div>
  );
}
