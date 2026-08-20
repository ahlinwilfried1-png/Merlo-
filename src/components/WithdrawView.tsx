import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ArrowUpRight, 
  Clock,
  AlertCircle, 
  Loader2, 
  Wallet, 
  Lock,
  Sprout,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WalletState } from '../types';
import { formatCurrency } from '../data';
import PageHeader from './PageHeader';

interface WithdrawViewProps {
  wallet: WalletState;
  activeProductsCount?: number;
  onAddWithdrawal: (amount: number, address: string) => Promise<{ success: boolean; error?: string; newBalance?: number }> | void;
  onBack: () => void;
  onGoToProducts?: () => void;
}

export default function WithdrawView({ 
  wallet, 
  activeProductsCount = 0, 
  onAddWithdrawal, 
  onBack,
  onGoToProducts 
}: WithdrawViewProps) {
  const hasActiveProduct = activeProductsCount > 0;

  const [amount, setAmount] = useState('1000');
  const [phoneOrAccount, setPhoneOrAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [completedWithdrawAmt, setCompletedWithdrawAmt] = useState(0);

  const parsedAmount = parseFloat(amount) || 0;
  const minWithdraw = 1000;
  const feeRate = 0.10;
  const feeAmount = Math.round(parsedAmount * feeRate);
  const netAmount = Math.max(0, parsedAmount - feeAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hasActiveProduct) {
      setError('Retrait impossible : Vous devez posséder au moins un contrat/produit VIP actif pour pouvoir effectuer un retrait.');
      return;
    }
    if (parsedAmount > wallet.balance) {
      setError(`Solde insuffisant (${formatCurrency(wallet.balance)} disponible).`);
      return;
    }
    if (parsedAmount < minWithdraw) {
      setError(`Le minimum de retrait est de ${formatCurrency(minWithdraw)}.`);
      return;
    }
    if (!phoneOrAccount.trim()) {
      setError('Veuillez renseigner le numéro de téléphone ou compte de réception.');
      return;
    }

    setLoading(true);

    const detailsDest = `Compte: ${phoneOrAccount.trim()} (Frais 10%: -${formatCurrency(feeAmount)} | Net: ${formatCurrency(netAmount)})`;

    try {
      const res = await onAddWithdrawal(parsedAmount, detailsDest);
      setLoading(false);
      if (res && res.success === false) {
        setError(res.error || 'Erreur lors du traitement du retrait.');
        return;
      }
      setCompletedWithdrawAmt(parsedAmount);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Erreur lors de la soumission du retrait.');
    }
  };

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-cyan-50" id="page-withdraw-container">
      {/* Barre d'en-tête */}
      <PageHeader
        title="Retrait de Fonds"
        subtitle="Transfert instantané vers votre compte mobile"
        onBack={onBack}
        badge="F CFA"
        icon={<ArrowUpRight className="w-5 h-5 text-cyan-400" />}
      />

      {/* Bloc Solde Retirable (Sans cadre/bordure) */}
      <div className="aura-glass-card p-5 rounded-3xl shadow-2xl border-0 ring-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 text-cyan-300 flex items-center justify-center shadow-inner border-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-cyan-200/80 font-medium block">Solde Retirable</span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono luminous-text">
                {formatCurrency(wallet.balance)}
              </span>
            </div>
          </div>
          <div className="text-right bg-[#02242e]/80 px-3.5 py-2 rounded-2xl border-0">
            <span className="text-[10px] text-cyan-300/80 block font-mono">Min. Retrait</span>
            <span className="text-xs font-black text-emerald-400 font-mono luminous-text-emerald">1 000 F CFA</span>
          </div>
        </div>
      </div>

      {/* RÈGLE STRICTE: AVERTISSEMENT SI AUCUN PRODUIT ACTIF (Sans bordures) */}
      {!hasActiveProduct && (
        <div className="p-4 rounded-3xl aura-glass-card text-cyan-100 space-y-2.5 shadow-xl border-0 ring-0" id="alert-no-active-product-withdraw">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider font-mono">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Retrait Verrouillé : Produit actif requis</span>
          </div>
          <p className="text-xs text-cyan-200/90 leading-relaxed">
            Pour sécuriser les transactions de la plateforme, les retraits sont réservés aux membres possédant au moins <strong>1 contrat VIP actif</strong>.
          </p>
          {onGoToProducts && (
            <button
              type="button"
              onClick={onGoToProducts}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-amber-600/30 active:scale-95 border-0"
            >
              <Sprout className="w-4 h-4" />
              <span>Investir dans un produit VIP</span>
            </button>
          )}
        </div>
      )}

      {/* Formulaire Principal (Sans cadre/bordure) */}
      <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 border-0 ring-0">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 text-rose-200 text-xs font-bold flex items-center gap-2 shadow-lg border-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Montant à retirer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase font-mono tracking-wider text-cyan-300 luminous-text-cyan">
                Montant à retirer
              </label>
              <button
                type="button"
                onClick={() => {
                  setAmount(wallet.balance.toString());
                  setSuccess(false);
                }}
                className="text-xs font-bold text-cyan-300 hover:text-white hover:underline cursor-pointer border-0"
              >
                Tout retirer ({formatCurrency(wallet.balance)})
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                min="1000"
                step="500"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setSuccess(false); }}
                required
                placeholder="Entrez le montant (min. 1 000)"
                className="w-full bg-[#021f28]/90 focus:bg-[#032933] rounded-2xl py-3.5 px-4 text-base font-black text-white placeholder-cyan-500/50 focus:outline-none font-mono transition shadow-inner border-0 ring-0"
              />
              <span className="absolute right-4 top-4 text-xs font-bold text-cyan-400 font-mono">
                F CFA
              </span>
            </div>

            {/* Détails du retrait & Frais 10% */}
            {parsedAmount > 0 && (
              <div className="mt-2.5 p-4 rounded-2xl bg-[#02242e]/80 text-xs space-y-2 font-mono shadow-inner border-0 ring-0">
                <div className="flex justify-between text-cyan-200/80">
                  <span>Montant demandé :</span>
                  <span className="text-white font-bold">{formatCurrency(parsedAmount)}</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>Frais de traitement (10%) :</span>
                  <span>-{formatCurrency(feeAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-0 text-emerald-400 font-black text-sm luminous-text-emerald">
                  <span>Montant net à recevoir :</span>
                  <span>{formatCurrency(netAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Numéro ou Compte de réception */}
          <div>
            <label className="block text-xs font-black uppercase font-mono tracking-wider text-cyan-300 mb-2 luminous-text-cyan">
              Numéro de téléphone / Compte de réception
            </label>
            <div className="flex items-center bg-[#021f28]/90 focus-within:bg-[#032933] rounded-2xl px-4 py-3 transition shadow-inner border-0 ring-0">
              <input
                type="tel"
                value={phoneOrAccount}
                onChange={(e) => setPhoneOrAccount(e.target.value)}
                placeholder="Ex: 90 12 34 56 ou +228 90 12 34 56"
                required
                className="flex-1 bg-transparent text-sm font-black text-white placeholder-cyan-500/50 focus:outline-none font-mono border-0"
              />
            </div>
          </div>

          {/* Message de confirmation de retrait en attente */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-amber-950/80 rounded-2xl flex items-center gap-3 text-cyan-100 text-xs font-medium shadow-xl border-0 ring-0"
              >
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="block font-bold text-amber-300">Demande de retrait enregistrée — En attente</span>
                  <span className="text-cyan-200/90 leading-relaxed">
                    Votre demande de {formatCurrency(completedWithdrawAmt)} ({formatCurrency(netAmount)} nets après déduction des frais de 10%) a été transmise avec succès. Dès validation administrative, les fonds seront crédités directement sur votre numéro/compte {phoneOrAccount}.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton de validation */}
          <button
            type="submit"
            disabled={loading || wallet.balance < minWithdraw || !hasActiveProduct}
            id="btn-confirm-withdraw-page"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider transition shadow-xl shadow-cyan-600/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2 border-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Traitement en cours...</span>
              </>
            ) : !hasActiveProduct ? (
              <>
                <Lock className="w-5 h-5" />
                <span>PRODUIT REQUIS POUR RETIRER</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                <span>Valider le Retrait ({formatCurrency(parsedAmount)})</span>
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-cyan-300/70 text-center pt-1 leading-relaxed">
          1 retrait autorisé par jour • Disponible 24h/24 et 7j/7 • Frais de traitement : 10%.
        </p>
      </div>
    </div>
  );
}

