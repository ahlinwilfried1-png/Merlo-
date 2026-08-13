import React from 'react';
import { PlayCircle, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PlatformRulesViewProps {
  onBack: () => void;
}

export default function PlatformRulesView({ onBack }: PlatformRulesViewProps) {
  return (
    <div className="max-w-xl mx-auto space-y-6 text-left" id="page-platform-rules-container">
      {/* Header */}
      <div className="flex items-center gap-3 py-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-white tracking-tight">Règles de la Plateforme</h1>
          <p className="text-xs text-zinc-400">Conditions d'utilisation, retraits et souscriptions</p>
        </div>
      </div>

      {/* Content without card containers */}
      <div className="space-y-4 text-xs text-zinc-300 leading-relaxed divide-y divide-zinc-800/40">
        <div className="pt-2 space-y-1">
          <h2 className="text-sm font-bold text-white">1. Règle des Retraits</h2>
          <p className="text-zinc-400">
            Le montant minimum de retrait est fixé à <strong>1 000 F CFA</strong>. Les retraits sont autorisés tous les jours ouvrés et le week-end 24h/24. Les fonds sont transférés vers le numéro Mobile Money ou compte bancaire configuré.
          </p>
        </div>

        <div className="pt-3 space-y-1">
          <h2 className="text-sm font-bold text-white">2. Cycle de Génération des Gains</h2>
          <p className="text-zinc-400">
            Chaque véhicule souscrit produit un revenu fixe chaque 24 heures. Vous pouvez collecter vos gains ou les laisser s'accumuler directement sur votre solde retirable.
          </p>
        </div>

        <div className="pt-3 space-y-1">
          <h2 className="text-sm font-bold text-white">3. Sécurité et Monocompte</h2>
          <p className="text-zinc-400">
            Chaque utilisateur n'a droit qu'à un seul compte principal lié à son numéro de téléphone ou e-mail. Toute tentative de fraude entraîne la suspension immédiate du compte.
          </p>
        </div>

        <div className="pt-3 space-y-1">
          <h2 className="text-sm font-bold text-white">4. Commission d'Affiliation</h2>
          <p className="text-zinc-400">
            Les commissions de parrainage (30% Niveau 1, 2% Niveau 2, 1% Niveau 3) sont créditées instantanément dès la confirmation du paiement du filleul et sont immédiatement retirables.
          </p>
        </div>
      </div>
    </div>
  );
}
