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
    <div className="max-w-xl mx-auto space-y-4 text-left" id="page-history-container">
      <PageHeader
        title="Historique des Flux"
        subtitle="Consultez l'ensemble de vos transactions et revenus"
        onBack={onBack}
        badge="Relevé"
        icon={<FileText className="w-5 h-5 text-emerald-700" />}
      />

      {/* Search and Filters */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher une opération ou référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition ${
              filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tous ({transactions.length})
          </button>
          <button
            onClick={() => setFilter('deposit')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
              filter === 'deposit' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Recharges
          </button>
          <button
            onClick={() => setFilter('withdrawal')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
              filter === 'withdrawal' ? 'bg-rose-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Retraits
          </button>
          <button
            onClick={() => setFilter('vip_earning')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
              filter === 'vip_earning' ? 'bg-amber-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Revenus VIP
          </button>
          <button
            onClick={() => setFilter('referral_commission')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
              filter === 'referral_commission' ? 'bg-purple-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Parrainages
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 shadow-xl space-y-2.5">
        {filteredTx.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Aucune transaction ne correspond à vos critères.</p>
          </div>
        ) : (
          filteredTx.map((tx) => {
            const isPositive = tx.type === 'deposit' || tx.type === 'vip_earning' || tx.type === 'referral_commission';
            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 text-xs shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'deposit'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : tx.type === 'withdrawal'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : tx.type === 'vip_earning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
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
                    <span className="font-bold text-zinc-100 block truncate">
                      {tx.description}
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-mono">
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
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                    tx.status === 'completed'
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : tx.status === 'pending'
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
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
