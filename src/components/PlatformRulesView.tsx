import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PlatformRulesViewProps {
  onBack: () => void;
}

export default function PlatformRulesView({ onBack }: PlatformRulesViewProps) {
  return (
    <div className="max-w-xl mx-auto space-y-4 text-left text-zinc-100" id="page-platform-rules-container">
      {/* Header */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition cursor-pointer border border-zinc-700"
          title="Retour"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-white">Règles de la Plateforme</h1>
        <div className="w-9 h-9" />
      </div>

      {/* Content */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 text-xs text-zinc-300 leading-relaxed divide-y divide-zinc-800/80">
        <div className="space-y-1.5 first:pt-0">
          <h2 className="text-sm font-bold text-white">1. Règle des Retraits</h2>
          <p className="text-zinc-400">
            Le montant minimum de retrait est fixé à <strong>1 000 F CFA</strong> avec des frais de réseau de <strong>10%</strong>. Pour pouvoir effectuer un retrait, l'utilisateur doit posséder au moins <strong>1 contrat VIP actif</strong>. Les fonds sont transférés directement vers le numéro Mobile Money configuré.
          </p>
        </div>

        <div className="pt-3.5 space-y-1.5">
          <h2 className="text-sm font-bold text-white">2. Cycle de Génération des Gains (100% Automatique)</h2>
          <p className="text-zinc-400">
            Chaque contrat souscrit génère un revenu journalier qui tombe <strong>automatiquement chaque 24 heures directement sur votre solde principal</strong>, sans aucune action manuelle de collecte nécessaire.
          </p>
        </div>

        <div className="pt-3.5 space-y-1.5">
          <h2 className="text-sm font-bold text-white">3. Sécurité et Monocompte</h2>
          <p className="text-zinc-400">
            Chaque utilisateur n'a droit qu'à un seul compte principal lié à son numéro de téléphone ou e-mail. Toute tentative de fraude entraîne la suspension immédiate du compte.
          </p>
        </div>

        <div className="pt-3.5 space-y-1.5">
          <h2 className="text-sm font-bold text-white">4. Commission d'Affiliation</h2>
          <p className="text-zinc-400">
            Les commissions de parrainage (30% Niveau 1, 2% Niveau 2, 1% Niveau 3) sont créditées instantanément dès la confirmation du paiement du filleul et sont immédiatement retirables.
          </p>
        </div>
      </div>
    </div>
  );
}


