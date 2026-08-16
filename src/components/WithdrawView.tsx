import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ArrowUpRight, 
  Clock,
  AlertCircle, 
  Loader2, 
  Wallet, 
  Smartphone,
  Lock,
  Sprout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WalletState } from '../types';
import { formatCurrency } from '../data';

interface WithdrawViewProps {
  wallet: WalletState;
  activeProductsCount?: number;
  onAddWithdrawal: (amount: number, address: string) => void;
  onBack: () => void;
  onGoToProducts?: () => void;
}

const WITHDRAW_COUNTRIES = [
  {
    id: 'tg',
    name: 'Togo',
    flag: '🇹🇬',
    phonePrefix: '+228',
    operators: ['T-Money', 'Flooz Moov']
  }
];

export default function WithdrawView({ 
  wallet, 
  activeProductsCount = 0,
  onAddWithdrawal, 
  onBack,
  onGoToProducts 
}: WithdrawViewProps) {
  const hasActiveProduct = activeProductsCount > 0;
  const [selectedCountryId, setSelectedCountryId] = useState('tg');
  const currentCountry = WITHDRAW_COUNTRIES.find(c => c.id === selectedCountryId) || WITHDRAW_COUNTRIES[0];
  const [selectedOperator, setSelectedOperator] = useState(currentCountry.operators[0]);

  const [amount, setAmount] = useState('1000');
  const [phoneOrAccount, setPhoneOrAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [completedWithdrawAmt, setCompletedWithdrawAmt] = useState(0);

  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId);
    const country = WITHDRAW_COUNTRIES.find(c => c.id === countryId);
    if (country && country.operators.length > 0) {
      setSelectedOperator(country.operators[0]);
    }
    setSuccess(false);
  };

  const parsedAmount = parseFloat(amount) || 0;
  const minWithdraw = 1000;
  const feeRate = 0.10;
  const feeAmount = Math.round(parsedAmount * feeRate);
  const netAmount = Math.max(0, parsedAmount - feeAmount);

  const handleSubmit = (e: React.FormEvent) => {
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
      setError('Veuillez renseigner le numéro de téléphone destinataire.');
      return;
    }

    setLoading(true);

    const detailsDest = `[${currentCountry.name} - ${selectedOperator}] ${currentCountry.phonePrefix} ${phoneOrAccount.trim()} (Frais 10%: -${formatCurrency(feeAmount)} | Net: ${formatCurrency(netAmount)})`;

    setTimeout(() => {
      setLoading(false);
      setCompletedWithdrawAmt(parsedAmount);
      onAddWithdrawal(parsedAmount, detailsDest);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 text-left text-zinc-100" id="page-withdraw-container">
      {/* Barre d'en-tête */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <button
          onClick={onBack}
          id="btn-withdraw-back"
          className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition cursor-pointer border border-zinc-700"
          title="Retour"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-white">Retrait de Fonds</h1>
        <div className="w-9 h-9" />
      </div>

      {/* Bloc Solde Retirable */}
      <div className="bg-[#121215] border border-zinc-800/90 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 font-medium block">Solde Retirable</span>
              <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                {formatCurrency(wallet.balance)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400 block">Min. Retrait</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">1 000 F CFA</span>
          </div>
        </div>
      </div>

      {/* RÈGLE STRICTE: AVERTISSEMENT SI AUCUN PRODUIT ACTIF */}
      {!hasActiveProduct && (
        <div className="p-4 rounded-3xl bg-amber-950/30 border border-amber-500/30 text-zinc-200 space-y-2.5 shadow-xl" id="alert-no-active-product-withdraw">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Retrait Verrouillé : Produit actif requis</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Pour sécuriser les transactions de la plateforme, les retraits sont réservés aux membres possédant au moins <strong>1 contrat VIP actif</strong>.
          </p>
          {onGoToProducts && (
            <button
              type="button"
              onClick={onGoToProducts}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer shadow-md active:scale-95"
            >
              <Sprout className="w-4 h-4" />
              <span>Investir dans un produit</span>
            </button>
          )}
        </div>
      )}

      {/* Formulaire Principal */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Pays de destination */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              Pays de destination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {WITHDRAW_COUNTRIES.map((country) => {
                const isSelected = selectedCountryId === country.id;
                return (
                  <button
                    type="button"
                    key={country.id}
                    onClick={() => handleCountryChange(country.id)}
                    className={`p-3 rounded-2xl text-center transition cursor-pointer flex flex-col items-center gap-1 border ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <span className="text-xs font-bold block truncate">{country.name}</span>
                    <span className={`text-[11px] font-mono ${isSelected ? 'text-emerald-200' : 'text-zinc-400'}`}>
                      {country.phonePrefix}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opérateur */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              Opérateur ({currentCountry.name})
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {currentCountry.operators.map((op) => {
                const isSelected = selectedOperator === op;
                return (
                  <button
                    type="button"
                    key={op}
                    onClick={() => { setSelectedOperator(op); setSuccess(false); }}
                    className={`p-3 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{op}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Montant à retirer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-300">
                Montant à retirer
              </label>
              <button
                type="button"
                onClick={() => {
                  setAmount(wallet.balance.toString());
                  setSuccess(false);
                }}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
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
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 px-4 text-base font-bold text-white focus:outline-none focus:border-emerald-500 font-mono transition"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-zinc-500 font-mono">
                F CFA
              </span>
            </div>

            {/* Détails du retrait & Frais 10% */}
            {parsedAmount > 0 && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Montant demandé :</span>
                  <span className="text-white font-bold">{formatCurrency(parsedAmount)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Frais de réseau (10%) :</span>
                  <span>-{formatCurrency(feeAmount)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-zinc-800 text-emerald-400 font-bold text-sm">
                  <span>Montant net à recevoir :</span>
                  <span>{formatCurrency(netAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Numéro de réception */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              Numéro de téléphone de réception ({currentCountry.phonePrefix})
            </label>
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-emerald-500 transition">
              <span className="font-bold text-sm text-emerald-400 pr-2.5 font-mono">
                {currentCountry.phonePrefix}
              </span>
              <input
                type="tel"
                value={phoneOrAccount}
                onChange={(e) => setPhoneOrAccount(e.target.value)}
                placeholder="Ex: 90 12 34 56"
                required
                className="flex-1 bg-transparent text-sm font-bold text-white placeholder-zinc-500 focus:outline-none font-mono"
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
                className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-zinc-200 text-xs font-medium"
              >
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="block font-bold text-amber-400">Demande de retrait enregistrée — En attente</span>
                  <span className="text-zinc-300">
                    Votre demande de {formatCurrency(completedWithdrawAmt)} ({formatCurrency(netAmount)} nets après déduction des frais de 10%) a été transmise avec succès. Dès que l'administration aura validé votre demande, les fonds seront envoyés sur votre compte {selectedOperator} et le statut passera à « Réussi ».
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
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider transition shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
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

        <p className="text-xs text-zinc-400 text-center pt-1 leading-relaxed">
          1 retrait autorisé par jour • Disponible 24h/24 et 7j/7 • Frais de traitement : 10%.
        </p>
      </div>
    </div>
  );
}

