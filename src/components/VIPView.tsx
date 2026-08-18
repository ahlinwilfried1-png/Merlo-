import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Headphones, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { VIPPackage, WalletState, UserSubscription } from '../types';
import { formatCurrency } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface VIPViewProps {
  wallet: WalletState;
  activeSubscriptions: UserSubscription[];
  packages?: VIPPackage[];
  onSubscribe: (packageItem: VIPPackage, investmentAmount: number) => Promise<{ success: boolean; error?: string }> | void;
  onOpenRecharge: () => void;
  onOpenCustomerService?: () => void;
}

export default function VIPView({ 
  wallet, 
  activeSubscriptions, 
  packages,
  onSubscribe, 
  onOpenRecharge,
  onOpenCustomerService
}: VIPViewProps) {
  const packageList = packages || [];
  const [selectedPack, setSelectedPack] = useState<VIPPackage | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isAlreadySubscribed = (packId: string) => {
    return activeSubscriptions.some(sub => sub.packageId === packId && sub.isActive);
  };

  const handleOpenSubscribe = (pack: VIPPackage) => {
    setErrorMessage('');
    setSuccess(false);
    setSelectedPack(pack);
    setInvestAmount(pack.minInvestment.toString());
  };

  const handleConfirmSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedPack || submitting) return;

    const parsedAmt = parseFloat(investAmount);
    if (isNaN(parsedAmt) || parsedAmt < selectedPack.minInvestment) {
      setErrorMessage(`Le montant minimum requis est de ${selectedPack.minInvestment.toLocaleString('fr-FR')} F CFA.`);
      return;
    }

    if (parsedAmt > wallet.balance) {
      setErrorMessage(`Solde insuffisant (${wallet.balance.toLocaleString('fr-FR')} F CFA). Veuillez recharger votre compte.`);
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await onSubscribe(selectedPack, parsedAmt);
      if (res && res.success === false) {
        setErrorMessage(res.error || "Échec du paiement. Veuillez vérifier votre solde.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        setSelectedPack(null);
        setSuccess(false);
      }, 1600);
    } catch (err: any) {
      setErrorMessage(err?.message || "Erreur de communication avec le serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  const paidProductsCount = activeSubscriptions.length;
  const totalCollectedRevenue = wallet.totalEarnings;

  return (
    <div className="text-left w-full max-w-2xl sm:max-w-3xl mx-auto relative text-cyan-50 space-y-4" id="produits-page-root">
      
      {/* STATS BAR: NOMBRE DE PRODUITS PAYÉS & REVENUS CUMULÉS */}
      <div className="space-y-3">
        <div className="aura-glass-card rounded-2xl p-4 border border-[#0a4652]/60 grid grid-cols-2 gap-3 text-left shadow-lg" id="products-top-stats-bar">
          <div className="border-r border-[#094754]/70 pr-3">
            <span className="text-xs font-semibold text-cyan-300/80 block">
              Nombre de produits payés
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-2xl font-black font-mono text-white luminous-text">
                {paidProductsCount}
              </span>
              <span className="text-xs text-cyan-300 font-bold bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                {paidProductsCount > 0 ? `${paidProductsCount} payé(s)` : '0 payé'}
              </span>
            </div>
          </div>

          <div className="pl-2">
            <span className="text-xs font-semibold text-cyan-300/80 block">
              Revenus cumulés
            </span>
            <div className="mt-0.5">
              <span className="text-xl font-black font-mono text-emerald-400 luminous-text-emerald">
                {totalCollectedRevenue.toLocaleString('fr-FR')} <span className="text-xs text-cyan-200/70 font-sans font-normal">F CFA</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product List Cards */}
      <div className="space-y-4" id="products-list-container">
        {packageList.length === 0 ? (
          <div className="aura-glass-card border border-[#0d5969]/60 rounded-3xl p-8 text-center space-y-3 shadow-2xl" id="empty-products-state">
            <Sparkles className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] mx-auto" />
            <h3 className="text-base font-bold text-white luminous-text">Catalogue en cours de mise à jour</h3>
            <p className="text-xs text-cyan-200/80 max-w-sm mx-auto">
              Aucun produit d'investissement n'est disponible actuellement. Les offres seront bientôt synchronisées.
            </p>
          </div>
        ) : (
          packageList.map((pack) => {
            const subscribed = isAlreadySubscribed(pack.id);
            const totalEarning = pack.totalEarningsAmount || (pack.dailyEarningsAmount * pack.durationDays);

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="aura-glass-card border border-[#0d5969]/70 rounded-3xl p-4 sm:p-5 transition-all text-left relative shadow-2xl hover:border-cyan-400/50"
                id={`product-card-${pack.id}`}
              >
                {/* TOP ROW: Title, Duration & Image */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug luminous-text">
                        {pack.name}
                      </h2>
                      {subscribed && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-extrabold luminous-text-emerald">
                          Actif
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-cyan-200/80 font-normal flex items-center gap-1.5">
                      <span>Cycle (Jours)</span>
                      <strong className="text-sm font-bold text-cyan-300 font-mono">
                        {pack.durationDays}
                      </strong>
                    </div>
                  </div>

                  {/* Right Thumbnail */}
                  <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-2xl overflow-hidden bg-slate-900/60 border border-cyan-500/30 shrink-0 shadow-md">
                    <img
                      src={pack.image}
                      alt={pack.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* MIDDLE ROW: Translucent Cyan inset container */}
                <div className="bg-[#022b36]/80 border border-[#094754]/70 rounded-2xl p-3 sm:p-3.5 my-3 grid grid-cols-2 gap-2 text-center shadow-inner">
                  <div className="pr-2 border-r border-[#094754]/60">
                    <div className="text-amber-400 font-extrabold text-base sm:text-lg font-mono leading-tight luminous-text-soft">
                      {pack.dailyEarningsAmount.toLocaleString('fr-FR')}
                    </div>
                    <div className="text-cyan-200/90 text-xs font-semibold mt-1">
                      Revenu quotidien
                    </div>
                  </div>

                  <div className="pl-2">
                    <div className="text-emerald-400 font-extrabold text-base sm:text-lg font-mono leading-tight luminous-text-emerald">
                      {totalEarning.toLocaleString('fr-FR')}
                    </div>
                    <div className="text-cyan-200/90 text-xs font-semibold mt-1">
                      Revenu total
                    </div>
                  </div>
                </div>

                {/* BOTTOM ROW: Prix(XOF) + INVESTIR Button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm sm:text-base text-cyan-100 font-bold">
                    Prix(XOF): <span className="text-amber-300 font-black text-base sm:text-lg font-mono ml-0.5 luminous-text-soft">{pack.minInvestment.toLocaleString('fr-FR')}</span>
                  </div>

                  <button
                    onClick={() => handleOpenSubscribe(pack)}
                    id={`btn-invest-${pack.id}`}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm tracking-wider px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl uppercase cursor-pointer shadow-lg shadow-orange-500/25 active:scale-95 transition-all border border-orange-400/30"
                  >
                    INVESTIR
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating Customer Service Rosette Seal / Badge matching screenshot */}
      <div 
        onClick={onOpenCustomerService}
        className="fixed right-4 bottom-20 z-30 cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
        id="floating-support-badge"
        title="Centre de Support Client 24/7"
      >
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-teal-700 text-white shadow-2xl flex flex-col items-center justify-center p-1 border-2 border-cyan-300/60 ring-2 ring-cyan-500/40">
          <Headphones className="w-5 h-5 mb-0.5 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          <span className="text-[7px] font-black uppercase tracking-tight leading-none text-center text-cyan-100">
            Support
          </span>
        </div>
      </div>

      {/* Interactive Investment Modal */}
      <AnimatePresence>
        {selectedPack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" id="invest-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="aura-glass-card border border-[#0d5969] rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPack(null)}
                className="absolute right-4 top-4 p-2 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                {/* Header Product Info */}
                <div className="flex items-center gap-3 pr-8">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-slate-900/80 border border-cyan-500/40 shadow-md">
                    <img 
                      src={selectedPack.image} 
                      alt={selectedPack.name} 
                      referrerPolicy="no-referrer" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight luminous-text">
                      {selectedPack.name}
                    </h3>
                    <p className="text-xs text-cyan-200/80 font-medium mt-0.5">
                      Cycle : <strong className="text-cyan-300 font-mono">{selectedPack.durationDays} jours</strong>
                    </p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                    {wallet.balance < selectedPack.minInvestment && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPack(null);
                          onOpenRecharge();
                        }}
                        className="inline-flex items-center gap-1 text-cyan-300 underline font-bold hover:text-cyan-200 mt-1 cursor-pointer"
                      >
                        Recharger mon portefeuille maintenant <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {success ? (
                  <div className="p-6 text-center space-y-3 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h4 className="text-base font-bold text-white luminous-text">Investissement Réussi !</h4>
                    <p className="text-xs text-cyan-100/90 leading-relaxed">
                      Votre contrat pour <strong>{selectedPack.name}</strong> est maintenant actif. Vos gains journaliers de <strong className="text-emerald-400 font-mono">{formatCurrency(selectedPack.dailyEarningsAmount)}</strong> seront crédités sur votre solde.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmSubscribe} className="space-y-4">
                    {/* Wallet Balance Info */}
                    <div className="p-3.5 rounded-2xl bg-[#02242e]/80 border border-[#0a4652]/70 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-cyan-300/80 block text-[11px]">Solde disponible :</span>
                        <strong className="text-sm font-black font-mono text-white luminous-text">
                          {wallet.balance.toLocaleString()} F CFA
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPack(null);
                          onOpenRecharge();
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md border border-orange-400/30"
                      >
                        + Recharger
                      </button>
                    </div>

                    {/* Investment Amount Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-cyan-200 block">
                        Montant à investir (F CFA)
                      </label>
                      <input
                        type="number"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        required
                        min={selectedPack.minInvestment}
                        step="500"
                        className="w-full bg-[#021f28]/90 border border-cyan-500/40 focus:border-cyan-300 rounded-2xl py-2.5 px-3.5 font-mono text-lg font-bold text-white focus:outline-none transition shadow-inner"
                      />
                      <span className="text-[11px] text-cyan-300/80 font-mono block">
                        Prix fixé : <strong className="text-amber-300">{selectedPack.minInvestment.toLocaleString()} F CFA</strong>
                      </span>
                    </div>

                    {/* Yields Review Box */}
                    <div className="bg-[#022b36]/80 border border-[#094754]/70 rounded-2xl py-3 px-4 text-center">
                      <div className="text-emerald-400 font-black text-base font-mono luminous-text-emerald">
                        {((parseFloat(investAmount) || selectedPack.minInvestment) === selectedPack.minInvestment 
                          ? selectedPack.dailyEarningsAmount 
                          : Math.round((parseFloat(investAmount) / selectedPack.minInvestment) * selectedPack.dailyEarningsAmount)
                        ).toLocaleString()} F CFA / jour
                      </div>
                      <div className="text-cyan-200/80 text-xs font-medium mt-0.5">Revenus quotidiens estimés</div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white text-sm font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-orange-500/30 active:scale-95 disabled:opacity-50 border border-orange-400/30"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...
                        </>
                      ) : (
                        `CONFIRMER L'INVESTISSEMENT (${(parseFloat(investAmount) || selectedPack.minInvestment).toLocaleString()} F CFA)`
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

