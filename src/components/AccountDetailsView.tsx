import React from 'react';
import { ChevronLeft, Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, Users, CheckCircle2 } from 'lucide-react';
import { WalletState, Transaction, UserSubscription } from '../types';
import { formatCurrency } from '../data';

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
    <div className="max-w-xl mx-auto space-y-4 text-left text-zinc-100" id="page-account-details-container">
      {/* Header */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition cursor-pointer border border-zinc-700"
          title="Retour"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-white">Détails du Compte</h1>
        <div className="w-9 h-9" />
      </div>

      {/* Primary Balance Summary */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-6 shadow-xl space-y-2">
        <span className="text-xs text-zinc-400 uppercase font-mono font-bold block">Solde Retirable Disponible</span>
        <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
          {wallet.balance.toLocaleString()} <span className="text-sm font-normal text-zinc-400">F CFA</span>
        </div>
      </div>

      {/* Metrics List */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 shadow-xl divide-y divide-zinc-800/80">
        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-400 font-medium">Revenu du jour (24h)</span>
          <span className="text-sm font-bold font-mono text-emerald-400">+{todayEarnings.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-400 font-medium">Revenu cumulé total</span>
          <span className="text-sm font-bold font-mono text-white">+{wallet.totalEarnings.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-400 font-medium">Total des recharges validées</span>
          <span className="text-sm font-bold font-mono text-white">{wallet.totalDeposited.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-400 font-medium">Total des retraits perçus</span>
          <span className="text-sm font-bold font-mono text-white">{wallet.totalWithdrawn.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-400 font-medium">Commissions de parrainage</span>
          <span className="text-sm font-bold font-mono text-emerald-400">+{totalReferralEarnings.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-400 font-medium">Contrats & Produits en cours</span>
          <span className="text-sm font-bold font-mono text-emerald-400">{activeSubs.length} actif(s)</span>
        </div>
      </div>
    </div>
  );
}


