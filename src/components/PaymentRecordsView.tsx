import React from 'react';
import { ChevronLeft, Clock, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../data';
import PageHeader from './PageHeader';

interface PaymentRecordsViewProps {
  transactions: Transaction[];
  onBack: () => void;
}

export default function PaymentRecordsView({ transactions, onBack }: PaymentRecordsViewProps) {
  const depositRecords = transactions.filter(t => t.type === 'deposit');

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-cyan-50" id="page-payment-records-container">
      {/* Header */}
      <PageHeader
        title="Registres de Paiement"
        subtitle="Historique de vos recharges et dépôts de fonds"
        onBack={onBack}
        badge="Recharges"
        icon={<CreditCard className="w-5 h-5 text-cyan-400" />}
      />

      {/* List (Sans cadre/bordure) */}
      <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl divide-y divide-[#094754]/30 border-0 ring-0">
        {depositRecords.length === 0 ? (
          <div className="text-center py-16 text-cyan-300/60 text-xs">
            Aucun registre de paiement enregistré pour le moment.
          </div>
        ) : (
          depositRecords.map((t) => (
            <div key={t.id} className="py-4 first:pt-1 last:pb-1 flex items-center justify-between border-0">
              <div className="space-y-1">
                <span className="font-bold text-sm text-white block luminous-text-soft">{t.description}</span>
                <span className="text-[11px] text-cyan-300/80 block font-mono">
                  {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {t.details && <span className="text-[10px] text-cyan-400/80 font-mono block">{t.details}</span>}
              </div>
              <div className="text-right">
                <span className="text-sm font-black font-mono text-emerald-400 block luminous-text-emerald">
                  +{formatCurrency(t.amount)}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 border-0 ${
                  t.status === 'completed' 
                    ? 'bg-emerald-950/80 text-emerald-300' 
                    : t.status === 'pending'
                    ? 'bg-amber-950/80 text-amber-300'
                    : 'bg-rose-950/80 text-rose-300'
                }`}>
                  {t.status === 'completed' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Validé</span>
                    </>
                  ) : t.status === 'pending' ? (
                    <>
                      <Clock className="w-3 h-3 animate-spin text-amber-400" />
                      <span>En attente</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span>Rejeté</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

