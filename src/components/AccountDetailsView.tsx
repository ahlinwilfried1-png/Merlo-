import React from 'react';
import { ChevronLeft, FileText, Wallet } from 'lucide-react';
import { WalletState, Transaction, UserSubscription } from '../types';
import PageHeader from './PageHeader';

interface AccountDetailsViewProps {
  wallet: WalletState;
  transactions: Transaction[];
  subscriptions?: UserSubscription[];
  onBack: () => void;
}

export default function AccountDetailsView({
  wallet,
  transactions,
  subscriptions = [],
  onBack
}: AccountDetailsViewProps) {
  const activeSubs = subscriptions.filter(s => s.isActive);
  const totalReferralEarnings = transactions
    .filter(t => t.type === 'referral_commission' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayEarnings = subscriptions
    .filter(s => s.isActive)
    .reduce((sum, s) => sum + s.dailyEarnings, 0);

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-cyan-50" id="page-account-details-container">
      {/* Header */}
      <PageHeader
        title="Détails du Compte"
        subtitle="Bilan financier & statistiques de rendement"
        onBack={onBack}
        badge="Synthèse Globale"
        icon={<FileText className="w-5 h-5 text-cyan-400" />}
      />

      {/* Primary Balance Summary */}
      <div className="aura-glass-card border border-[#0d5969]/70 rounded-3xl p-6 shadow-2xl space-y-2">
        <span className="text-xs text-cyan-300 uppercase font-mono font-black block tracking-wider luminous-text-cyan">
          Solde Retirable Disponible
        </span>
        <div className="text-3xl sm:text-4xl font-black font-mono text-white luminous-text">
          {wallet.balance.toLocaleString()} <span className="text-sm font-semibold text-cyan-300">F CFA</span>
        </div>
      </div>

      {/* Metrics List */}
      <div className="aura-glass-card border border-[#0d5969]/70 rounded-3xl p-5 sm:p-6 shadow-2xl divide-y divide-[#094754]/60">
        <div className="py-3.5 first:pt-1 flex items-center justify-between">
          <span className="text-sm text-cyan-200/90 font-medium">Revenu du jour (24h)</span>
          <span className="text-sm font-black font-mono text-emerald-400 luminous-text-emerald">+{todayEarnings.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-cyan-200/90 font-medium">Revenu cumulé total</span>
          <span className="text-sm font-black font-mono text-white luminous-text-soft">+{wallet.totalEarnings.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-cyan-200/90 font-medium">Total des recharges validées</span>
          <span className="text-sm font-black font-mono text-cyan-300">{wallet.totalDeposited.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-cyan-200/90 font-medium">Total des retraits perçus</span>
          <span className="text-sm font-black font-mono text-white luminous-text-soft">{wallet.totalWithdrawn.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-cyan-200/90 font-medium">Commissions de parrainage</span>
          <span className="text-sm font-black font-mono text-emerald-400 luminous-text-emerald">+{totalReferralEarnings.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 last:pb-1 flex items-center justify-between">
          <span className="text-sm text-cyan-200/90 font-medium">Contrats & Produits en cours</span>
          <span className="text-sm font-black font-mono text-cyan-300 luminous-text-cyan">{activeSubs.length} actif(s)</span>
        </div>
      </div>
    </div>
  );
}

