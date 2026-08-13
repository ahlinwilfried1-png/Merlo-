import React from 'react';
import { BarChart3, ArrowLeft, ArrowDownLeft, ArrowUpRight, TrendingUp, ShieldCheck, ShoppingBag } from 'lucide-react';
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
    <div className="max-w-xl mx-auto space-y-5 text-left" id="page-account-details-container">
      {/* Header */}
      <div className="flex items-center gap-3 py-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-white tracking-tight">Détails du Compte</h1>
          <p className="text-xs text-zinc-400">Synthèse financière et récapitulatif des flux</p>
        </div>
      </div>

      {/* Primary Balance Summary */}
      <div className="py-4 space-y-1">
        <span className="text-xs text-zinc-400 uppercase font-mono">Solde Retirable Disponible</span>
        <div className="text-3xl font-black font-mono text-[#22c55e]">
          {wallet.balance.toLocaleString()} <span className="text-sm font-normal text-zinc-400">F CFA</span>
        </div>
      </div>

      {/* Metrics List - clean without cards */}
      <div className="divide-y divide-zinc-800/40">
        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-300 font-medium">Revenu du jour (24h)</span>
          <span className="text-sm font-bold font-mono text-emerald-400">+{todayEarnings.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-300 font-medium">Revenu cumulé total</span>
          <span className="text-sm font-bold font-mono text-white">+{wallet.totalEarnings.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-300 font-medium">Total des recharges validées</span>
          <span className="text-sm font-bold font-mono text-white">{wallet.totalDeposited.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-300 font-medium">Total des retraits perçus</span>
          <span className="text-sm font-bold font-mono text-zinc-300">{wallet.totalWithdrawn.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-300 font-medium">Commissions de parrainage</span>
          <span className="text-sm font-bold font-mono text-amber-400">+{totalReferralEarnings.toLocaleString()} F CFA</span>
        </div>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-sm text-zinc-300 font-medium">Contrats & Produits en cours</span>
          <span className="text-sm font-bold font-mono text-teal-300">{activeSubs.length} actif(s)</span>
        </div>
      </div>
    </div>
  );
}
