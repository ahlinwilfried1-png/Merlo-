import React from 'react';
import { ChevronLeft, ShieldCheck, Zap, Wallet, Users, BookOpen } from 'lucide-react';
import PageHeader from './PageHeader';

interface PlatformRulesViewProps {
  onBack: () => void;
}

export default function PlatformRulesView({ onBack }: PlatformRulesViewProps) {
  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-cyan-50" id="page-platform-rules-container">
      {/* Header */}
      <PageHeader
        title="Règles de la Plateforme"
        subtitle="Conditions d'utilisation, retraits et conditions VIP"
        onBack={onBack}
        badge="Réglementation"
        icon={<BookOpen className="w-5 h-5 text-cyan-400" />}
      />

      {/* Content List (Sans cadre/bordure) */}
      <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 border-0 ring-0">
        
        {/* Règle 1 */}
        <div className="space-y-2 first:pt-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/90 text-emerald-300 flex items-center justify-center border-0">
              <Wallet className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white luminous-text">1. Règle des Retraits</h2>
          </div>
          <p className="text-xs sm:text-[13px] text-cyan-200/90 leading-relaxed pl-10.5">
            Le montant minimum de retrait est fixé à <strong className="text-emerald-400 font-mono">1 000 F CFA</strong> avec des frais de réseau de <strong className="text-cyan-300 font-mono">10%</strong>. Pour pouvoir effectuer un retrait, l'utilisateur doit posséder au moins <strong className="text-cyan-300">1 contrat VIP actif</strong>. Les fonds sont transférés directement vers le numéro Mobile Money configuré.
          </p>
        </div>

        {/* Règle 2 */}
        <div className="pt-3 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-950/90 text-amber-300 flex items-center justify-center border-0">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white luminous-text">2. Cycle de Génération des Gains (100% Automatique)</h2>
          </div>
          <p className="text-xs sm:text-[13px] text-cyan-200/90 leading-relaxed pl-10.5">
            Chaque contrat souscrit génère un revenu journalier qui est crédité <strong className="text-amber-300">automatiquement chaque 24 heures directement sur votre solde principal</strong>, sans aucune action manuelle de collecte nécessaire.
          </p>
        </div>

        {/* Règle 3 */}
        <div className="pt-3 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/90 text-cyan-300 flex items-center justify-center border-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white luminous-text">3. Sécurité et Monocompte</h2>
          </div>
          <p className="text-xs sm:text-[13px] text-cyan-200/90 leading-relaxed pl-10.5">
            Chaque utilisateur n'a droit qu'à un seul compte principal lié à son numéro de téléphone ou e-mail. Toute tentative de fraude ou d'utilisation abusive entraîne la suspension immédiate du compte.
          </p>
        </div>

        {/* Règle 4 */}
        <div className="pt-3 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-950/90 text-teal-300 flex items-center justify-center border-0">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white luminous-text">4. Commission d'Affiliation</h2>
          </div>
          <p className="text-xs sm:text-[13px] text-cyan-200/90 leading-relaxed pl-10.5">
            Les commissions de parrainage (<strong className="text-cyan-300 font-mono">15%</strong> Niveau 1, <strong className="text-cyan-300 font-mono">2%</strong> Niveau 2, <strong className="text-cyan-300 font-mono">1%</strong> Niveau 3) sont créditées instantanément dès la confirmation du paiement du filleul et sont immédiatement retirables.
          </p>
        </div>

      </div>
    </div>
  );
}

