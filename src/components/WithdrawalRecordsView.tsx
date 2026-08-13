import React from 'react';
import { FileEdit, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../data';

interface WithdrawalRecordsViewProps {
  transactions: Transaction[];
  onBack: () => void;
}

export default function WithdrawalRecordsView({ transactions, onBack }: WithdrawalRecordsViewProps) {
  const withdrawalRecords = transactions.filter(t => t.type === 'withdrawal');

  return (
    <div className="max-w-xl mx-auto space-y-5 text-left" id="page-withdrawal-records-container">
      {/* Header */}
      <div className="flex items-center gap-3 py-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-white tracking-tight">Registres de Retrait</h1>
          <p className="text-xs text-zinc-400">Historique des demandes de retraits de fonds</p>
        </div>
      </div>

      {/* List - clean without cards */}
      <div className="divide-y divide-zinc-800/40">
        {withdrawalRecords.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">
            Aucun registre de retrait enregistré pour le moment.
          </div>
        ) : (
          withdrawalRecords.map((t) => (
            <div key={t.id} className="py-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-white block">{t.description}</span>
                <span className="text-[11px] text-zinc-500 block">
                  {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {t.details && <span className="text-[10px] text-zinc-400 font-mono block">{t.details}</span>}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-white block">
                  -{formatCurrency(t.amount)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                  t.status === 'completed' 
                    ? 'bg-emerald-500/15 text-emerald-400' 
                    : t.status === 'pending'
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-rose-500/15 text-rose-400'
                }`}>
                  {t.status === 'completed' ? 'Traité / Payé' : t.status === 'pending' ? 'En traitement' : 'Échoué'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
