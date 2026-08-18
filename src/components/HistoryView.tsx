import React, { useState } from 'react';
import { 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Award, 
  Users, 
  Clock,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../data';
import PageHeader from './PageHeader';

interface HistoryViewProps {
  transactions: Transaction[];
  onBack: () => void;
}

type FilterType = 'all' | 'deposit' | 'withdrawal' | 'vip_earning' | 'referral_commission';

export default function HistoryView({ transactions, onBack }: HistoryViewProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTx = transactions.filter((tx) => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (tx.details && tx.details.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-xl mx-auto space-y-4 text-left text-cyan-50" id="page-history-container">
      <PageHeader
        title="Historique des Flux"
        subtitle="Consultez l'ensemble de vos transactions et revenus"
        onBack={onBack}
        badge="Relevé"
        icon={<FileText className="w-5 h-5 text-cyan-400" />}
      />

      {/* Search and Filters (Sans cadre/bordure) */}
      <div className="aura-glass-card rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 border-0 ring-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400/70" />
          <input
            type="text"
            placeholder="Rechercher une opération ou référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#02242e]/80 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-cyan-400/50 focus:outline-none border-0"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition border-0 ${
              filter === 'all' ? 'bg-cyan-600 text-white shadow-xs' : 'bg-cyan-950/60 text-cyan-300 hover:text-white'
            }`}
          >
            Tous ({transactions.length})
          </button>
          <button
            onClick={() => setFilter('deposit')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 border-0 ${
              filter === 'deposit' ? 'bg-cyan-600 text-white shadow-xs' : 'bg-cyan-950/60 text-cyan-300 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Recharges
          </button>
          <button
            onClick={() => setFilter('withdrawal')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 border-0 ${
              filter === 'withdrawal' ? 'bg-rose-600 text-white shadow-xs' : 'bg-cyan-950/60 text-cyan-300 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Retraits
          </button>
          <button
            onClick={() => setFilter('vip_earning')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 border-0 ${
              filter === 'vip_earning' ? 'bg-amber-600 text-white shadow-xs' : 'bg-cyan-950/60 text-cyan-300 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Revenus VIP
          </button>
          <button
            onClick={() => setFilter('referral_commission')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 border-0 ${
              filter === 'referral_commission' ? 'bg-purple-600 text-white shadow-xs' : 'bg-cyan-950/60 text-cyan-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Parrainages
          </button>
        </div>
      </div>

      {/* Transactions List (Sans cadre/bordure) */}
      <div className="aura-glass-card rounded-3xl p-4 sm:p-5 shadow-2xl space-y-2 border-0 ring-0">
        {filteredTx.length === 0 ? (
          <div className="py-12 text-center text-cyan-300/60 text-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-400" />
            <p>Aucune transaction ne correspond à vos critères.</p>
          </div>
        ) : (
          filteredTx.map((tx) => {
            const isPositive = tx.type === 'deposit' || tx.type === 'vip_earning' || tx.type === 'referral_commission';
            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-[#02242e]/70 flex items-center justify-between gap-3 text-xs shadow-xs border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-0 ${
                      tx.type === 'deposit'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : tx.type === 'withdrawal'
                        ? 'bg-rose-500/20 text-rose-300'
                        : tx.type === 'vip_earning'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {tx.type === 'deposit' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.type === 'withdrawal' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : tx.type === 'vip_earning' ? (
                      <Award className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate luminous-text-soft">
                      {tx.description}
                    </span>
                    <span className="text-[10px] text-cyan-300/70 block font-mono">
                      {new Date(tx.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} • {tx.details || tx.id}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-black text-xs block ${
                      isPositive ? 'text-emerald-400 luminous-text-emerald' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-0.5 border-0 ${
                    tx.status === 'completed'
                      ? 'text-emerald-300 bg-emerald-950/80'
                      : tx.status === 'pending'
                      ? 'text-amber-300 bg-amber-950/80'
                      : 'text-rose-300 bg-rose-950/80'
                  }`}>
                    {tx.status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5" /> Réussi
                      </>
                    ) : tx.status === 'pending' ? (
                      <>
                        <Clock className="w-2.5 h-2.5" /> En attente
                      </>
                    ) : (
                      <>
                        <XCircle className="w-2.5 h-2.5" /> Rejeté
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

