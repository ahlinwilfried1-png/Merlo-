import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Headphones, 
  Clock,
  Sparkles,
  Zap,
  TrendingUp
} from 'lucide-react';
import { VIPPackage, WalletState, UserSubscription } from '../types';
import { formatCurrency } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface VIPViewProps {
  wallet: WalletState;
  activeSubscriptions: UserSubscription[];
  packages?: VIPPackage[];
  onSubscribe: (packageItem: VIPPackage, investmentAmount: number) => void;
  onOpenRecharge: () => void;
  onOpenCustomerService?: () => void;
  onTrigger24hCycle?: () => void;
}

export default function VIPView({ 
  wallet, 
  activeSubscriptions, 
  packages,
  onSubscribe, 
  onOpenRecharge,
  onOpenCustomerService,
  onTrigger24hCycle
}: VIPViewProps) {
  const packageList = packages || [];
  const [selectedPack, setSelectedPack] = useState<VIPPackage | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [now, setNow] = useState(Date.now());

  // Timer update for real-time countdown to next drop
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isAlreadySubscribed = (packId: string) => {
    return activeSubscriptions.some(sub => sub.packageId === packId && sub.isActive);
  };

  const handleOpenSubscribe = (pack: VIPPackage) => {
    setErrorMessage('');
    setSuccess(false);
    setSelectedPack(pack);
    setInvestAmount(pack.minInvestment.toString());
  };

  const handleConfirmSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedPack) return;

    const parsedAmt = parseFloat(investAmount);
    if (isNaN(parsedAmt) || parsedAmt < selectedPack.minInvestment) {
      setErrorMessage(`Le montant minimum requis est de ${selectedPack.minInvestment.toLocaleString()} F CFA.`);
      return;
    }

    if (parsedAmt > wallet.balance) {
      setErrorMessage(`Solde insuffisant (${wallet.balance.toLocaleString()} F CFA). Veuillez recharger votre compte.`);
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      onSubscribe(selectedPack, parsedAmt);
      setSuccess(true);
      setTimeout(() => {
        setSelectedPack(null);
        setSuccess(false);
      }, 1600);
    }, 900);
  };

  const activeSubs = activeSubscriptions.filter(s => s.isActive);
  const totalCollectedRevenue = wallet.totalEarnings;
  const productsCount = activeSubs.length;

  // Calculate nearest next payout time
  const nextPayoutTimestamp = activeSubs.reduce((earliest, sub) => {
    if (!sub.nextPayoutAt) return earliest;
    const time = new Date(sub.nextPayoutAt).getTime();
    return earliest === 0 || time < earliest ? time : earliest;
  }, 0);

  const getCountdownString = () => {
    if (nextPayoutTimestamp === 0) return '24h 00m';
    const diff = Math.max(0, nextPayoutTimestamp - now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="text-left max-w-xl mx-auto pb-6 relative text-zinc-100" id="centre-de-produits-root">
      
      {/* Top Header Card */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 shadow-xl mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight" id="products-heading">
              Centre de produits
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Projets et contrats d'investissement agricole Agrocapital
            </p>
          </div>
          <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono">
            {packageList.length} offres
          </span>
        </div>
      </div>

      {/* PAGE INTRO BANNER OR ACTIVE STATS BAR */}
      {productsCount > 0 ? (
        <div className="space-y-3 mb-4">
          {/* TOP STATS BAR: NOMBRE DE PRODUITS (GAUCHE) & REVENU COLLECTÉ (DROITE) */}
          <div className="bg-[#121215] rounded-2xl p-4 border border-zinc-800/90 grid grid-cols-2 gap-3 text-left shadow-xl" id="products-top-stats-bar">
            <div className="border-r border-zinc-800 pr-3">
              <span className="text-xs font-semibold text-zinc-400 block">
                Nombre de produits
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {productsCount}
                </span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">actif(s)</span>
              </div>
            </div>

            <div className="pl-2">
              <span className="text-xs font-semibold text-zinc-400 block">
                Revenu cumulé
              </span>
              <div className="mt-0.5">
                <span className="text-xl font-extrabold font-mono text-emerald-400">
                  {totalCollectedRevenue.toLocaleString()} <span className="text-xs text-zinc-400 font-sans font-normal">F CFA</span>
                </span>
              </div>
            </div>
          </div>

          {/* AUTOMATIC DISTRIBUTION BANNER */}
          <div className="bg-[#18181b] border border-emerald-500/20 rounded-2xl p-4 shadow-xl" id="products-auto-payout-banner">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Versement Automatique Actif</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Revenu journalier : <strong className="text-white font-mono text-sm">+{activeSubs.reduce((sum, s) => sum + s.dailyEarnings, 0).toLocaleString()} F CFA</strong>
                </p>
                <p className="text-[11px] text-zinc-400">
                  Crédité directement sur votre solde principal sans action requise.
                </p>
              </div>

              <div className="bg-[#121215] border border-zinc-800 rounded-xl px-3 py-2 text-right shrink-0 shadow-sm">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Prochain versement</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 tracking-wider">
                  {getCountdownString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4 mb-4 text-left space-y-1 shadow-xl" id="no-active-product-banner">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono uppercase">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Catalogue d'investissements Agrocapital</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Investissez dans un contrat de la gamme Agrocapital ci-dessous pour activer votre premier projet agricole. Vos revenus journaliers sont crédités directement sur votre solde principal.
          </p>
        </div>
      )}

      {/* Product List Cards */}
      <div className="space-y-4" id="products-list-container">
        {packageList.length === 0 ? (
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-8 text-center space-y-3 shadow-xl" id="empty-products-state">
            <Sparkles className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Catalogue en cours de mise à jour</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Aucun produit d'investissement n'est disponible actuellement. Les offres seront bientôt synchronisées.
            </p>
          </div>
        ) : (
          packageList.map((pack) => {
            const subscribed = isAlreadySubscribed(pack.id);

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 transition-all text-left relative shadow-xl hover:border-emerald-500/40"
                id={`product-card-${pack.id}`}
              >
                {/* TOP ROW: Title, Days & Image */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                        {pack.name}
                      </h2>
                      {subscribed && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold">
                          Actif
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-400 font-normal flex items-center gap-1.5">
                      <span>Durée du contrat :</span>
                      <strong className="text-sm font-bold text-zinc-200 font-mono">
                        {pack.durationDays} jours
                      </strong>
                    </div>
                  </div>

                  {/* Right Vehicle Thumbnail */}
                  <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                    <img
                      src={pack.image}
                      alt={pack.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* MIDDLE ROW: Only Collected / Generated Revenue per Product */}
                <div className="bg-[#18181b] border border-zinc-800 rounded-xl py-3 px-4 my-3 text-center">
                  <div className="text-emerald-400 font-extrabold text-lg sm:text-xl font-mono leading-tight">
                    {pack.dailyEarningsAmount.toLocaleString()} <span className="text-xs font-sans text-zinc-400 font-normal">F CFA / jour</span>
                  </div>
                  <div className="text-zinc-400 text-xs font-medium mt-0.5">
                    Revenus collectés
                  </div>
                </div>

                {/* BOTTOM ROW: Price in F CFA + Invest Button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm sm:text-base text-zinc-300 font-medium">
                    Prix : <span className="text-emerald-400 font-black text-base sm:text-lg font-mono ml-0.5">{pack.minInvestment.toLocaleString()} F CFA</span>
                  </div>

                  <button
                    onClick={() => handleOpenSubscribe(pack)}
                    id={`btn-invest-${pack.id}`}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm tracking-wider px-5 sm:px-7 py-2.5 rounded-xl uppercase cursor-pointer shadow-lg shadow-emerald-950/50 active:scale-95 transition-all"
                  >
                    INVESTIR
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating Customer Service Seal / Badge */}
      <div 
        onClick={onOpenCustomerService}
        className="fixed right-4 bottom-20 z-30 cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
        id="floating-support-badge"
        title="Centre de Support Client 24/7"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/60 flex flex-col items-center justify-center p-1 border border-zinc-700">
          <Headphones className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-extrabold uppercase tracking-tight leading-none">
            Support
          </span>
        </div>
      </div>

      {/* Interactive Investment Modal */}
      <AnimatePresence>
        {selectedPack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="invest-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-left text-zinc-100"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPack(null)}
                className="absolute right-4 top-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                {/* Header Product Info */}
                <div className="flex items-center gap-3 pr-8">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800">
                    <img 
                      src={selectedPack.image} 
                      alt={selectedPack.name} 
                      referrerPolicy="no-referrer" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {selectedPack.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium mt-0.5">
                      Durée : <strong className="text-zinc-200 font-mono">{selectedPack.durationDays} jours</strong>
                    </p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs space-y-1">
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
                        className="inline-flex items-center gap-1 text-emerald-400 underline font-bold hover:text-emerald-300 mt-1 cursor-pointer"
                      >
                        Recharger mon portefeuille maintenant <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {success ? (
                  <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h4 className="text-base font-bold text-white">Investissement Réussi !</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Votre contrat pour <strong>{selectedPack.name}</strong> est maintenant actif. Vos gains journaliers de <strong>{formatCurrency(selectedPack.dailyEarningsAmount)}</strong> seront crédités sur votre solde.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmSubscribe} className="space-y-4">
                    {/* Wallet Balance Info */}
                    <div className="p-3 rounded-xl bg-[#18181b] border border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Solde disponible :</span>
                        <strong className="text-sm font-bold font-mono text-emerald-400">
                          {wallet.balance.toLocaleString()} F CFA
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPack(null);
                          onOpenRecharge();
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
                      >
                        + Recharger
                      </button>
                    </div>

                    {/* Investment Amount Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-300 block">
                        Montant à investir (F CFA)
                      </label>
                      <input
                        type="number"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        required
                        min={selectedPack.minInvestment}
                        step="500"
                        className="w-full bg-[#18181b] border border-zinc-700 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 font-mono text-lg font-bold text-white focus:outline-none transition"
                      />
                      <span className="text-[11px] text-zinc-400 font-mono block">
                        Prix fixé : <strong className="text-zinc-200">{selectedPack.minInvestment.toLocaleString()} F CFA</strong>
                      </span>
                    </div>

                    {/* Yields Review Box */}
                    <div className="bg-[#18181b] border border-zinc-800 rounded-xl py-3 px-4 text-center">
                      <div className="text-emerald-400 font-extrabold text-base font-mono">
                        {((parseFloat(investAmount) || selectedPack.minInvestment) === selectedPack.minInvestment 
                          ? selectedPack.dailyEarningsAmount 
                          : Math.round((parseFloat(investAmount) / selectedPack.minInvestment) * selectedPack.dailyEarningsAmount)
                        ).toLocaleString()} F CFA / jour
                      </div>
                      <div className="text-zinc-400 text-xs font-medium mt-0.5">Revenus collectés</div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50 active:scale-95 disabled:opacity-50"
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

