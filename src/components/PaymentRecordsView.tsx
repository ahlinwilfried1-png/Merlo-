import React from 'react';
import { ChevronLeft, ArrowDownLeft, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../data';

interface PaymentRecordsViewProps {
  transactions: Transaction[];
  onBack: () => void;
}

export default function PaymentRecordsView({ transactions, onBack }: PaymentRecordsViewProps) {
  const depositRecords = transactions.filter(t => t.type === 'deposit');

  return (
    <div className="max-w-xl mx-auto space-y-4 text-left text-zinc-100" id="page-payment-records-container">
      {/* Header */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition cursor-pointer border border-zinc-700"
          title="Retour"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-white">Registres de Paiement</h1>
        <div className="w-9 h-9" />
      </div>

      {/* List */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 shadow-xl divide-y divide-zinc-800/80">
        {depositRecords.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">
            Aucun registre de paiement enregistré pour le moment.
          </div>
        ) : (
          depositRecords.map((t) => (
            <div key={t.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-white block">{t.description}</span>
                <span className="text-[11px] text-zinc-400 block">
                  {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {t.details && <span className="text-[10px] text-zinc-400 font-mono block">{t.details}</span>}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-emerald-400 block">
                  +{formatCurrency(t.amount)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                  t.status === 'completed' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : t.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {t.status === 'completed' ? 'Validé' : t.status === 'pending' ? 'En attente' : 'Rejeté'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


