import React, { useState } from 'react';
import { 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Award, 
  Users, 
  Clock,
  CheckCircle2,
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
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher une opération ou référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-100 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition ${
              filter === 'all' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Tous ({transactions.length})
          </button>
          <button
            onClick={() => setFilter('deposit')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
              filter === 'deposit' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Recharges
          </button>
          <button
            onClick={() => setFilter('withdrawal')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
              filter === 'withdrawal' ? 'bg-rose-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Retraits
          </button>
          <button
            onClick={() => setFilter('vip_earning')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
              filter === 'vip_earning' ? 'bg-amber-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Revenus VIP
          </button>
          <button
            onClick={() => setFilter('referral_commission')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
              filter === 'referral_commission' ? 'bg-purple-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Parrainages
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-2.5">
        {filteredTx.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Aucune transaction ne correspond à vos critères.</p>
          </div>
        ) : (
          filteredTx.map((tx) => {
            const isPositive = tx.type === 'deposit' || tx.type === 'vip_earning' || tx.type === 'referral_commission';
            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-zinc-50 flex items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'deposit'
                        ? 'bg-emerald-100 text-emerald-700'
                        : tx.type === 'withdrawal'
                        ? 'bg-rose-100 text-rose-700'
                        : tx.type === 'vip_earning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-purple-100 text-purple-700'
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
                    <span className="font-bold text-zinc-900 block truncate">
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
                      isPositive ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {isPositive ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Succès
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
