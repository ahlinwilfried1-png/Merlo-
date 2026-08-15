import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Headphones, 
  ShieldCheck, 
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  CheckCircle,
  Car
} from 'lucide-react';
import { VIPPackage, WalletState, UserSubscription } from '../types';
import { VIP_PACKAGES, formatCurrency } from '../data';
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
  const packageList = (packages && packages.length > 0) ? packages : VIP_PACKAGES;
  const [selectedPack, setSelectedPack] = useState<VIPPackage | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [now, setNow] = useState(Date.now());

  // Timer update for real-time countdown to next 24h drop
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
    <div className="text-left max-w-xl mx-auto pb-6 relative text-white" id="centre-de-produits-root">
      {/* Top Green Accent Header */}
      <div className="w-full bg-[#22c55e] h-2 rounded-full mb-3 shadow-xs"></div>

      {/* Page Title */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight" id="products-heading">
            Centre de produits
          </h1>
          <span className="text-[11px] text-[#22c55e] font-bold flex items-center gap-1 mt-0.5 font-mono">
            <Clock className="w-3.5 h-3.5" /> Revenus versés automatiquement toutes les 24 heures
          </span>
        </div>
        <span className="text-xs text-zinc-400 font-medium font-mono">
          {packageList.length} produits Agrocapital
        </span>
      </div>

      {/* PAGE INTRO BANNER OR ACTIVE STATS BAR */}
      {productsCount > 0 ? (
        <div className="space-y-3 mb-4">
          {/* TOP STATS BAR: NOMBRE DE PRODUITS (GAUCHE) & REVENU COLLECTÉ (DROITE) */}
          <div className="bg-zinc-900 rounded-2xl p-3.5 sm:p-4 border border-zinc-800 grid grid-cols-2 gap-3 text-left" id="products-top-stats-bar">
            <div className="border-r border-zinc-800 pr-3">
              <span className="text-[11px] font-medium text-zinc-400 block">
                Nombre de produits
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-white">
                  {productsCount}
                </span>
                <span className="text-[11px] text-[#22c55e] font-bold">actif(s)</span>
              </div>
            </div>

            <div className="pl-1">
              <span className="text-[11px] font-medium text-zinc-400 block">
                Revenu cumulé
              </span>
              <div className="mt-0.5">
                <span className="text-lg sm:text-xl font-black font-mono text-[#22c55e]">
                  {totalCollectedRevenue.toLocaleString()} <span className="text-[10px] text-zinc-400 font-sans">F CFA</span>
                </span>
              </div>
            </div>
          </div>

          {/* AUTOMATIC 24H DISTRIBUTION BANNER */}
          <div className="bg-gradient-to-r from-emerald-950/90 to-zinc-900 border border-emerald-500/40 rounded-2xl p-3.5 sm:p-4 shadow-md" id="products-auto-payout-banner">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Versement 100% Automatique</span>
                </div>
                <p className="text-xs text-zinc-200">
                  Revenu total journalier : <strong className="text-white font-mono text-sm">+{activeSubs.reduce((sum, s) => sum + s.dailyEarnings, 0).toLocaleString()} F CFA</strong> / 24h
                </p>
                <p className="text-[11px] text-zinc-400">
                  Crédité directement sur votre solde principal à chaque cycle de 24h, sans action requise.
                </p>
              </div>

              <div className="bg-zinc-950/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-right shrink-0">
                <span className="text-[10px] text-zinc-400 font-medium block">Prochain versement</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 tracking-wider">
                  {getCountdownString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 mb-4 text-left space-y-1.5" id="no-active-product-banner">
          <div className="flex items-center gap-2 text-[#ff6d00] text-xs font-bold font-mono uppercase">
            <AlertCircle className="w-4 h-4" />
            <span>Aucun produit Agrocapital actif</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Investissez dans un contrat de la gamme Agrocapital ci-dessous pour activer votre premier projet agricole. Vos revenus journaliers tomberont automatiquement sur votre solde principal chaque 24 heures.
          </p>
        </div>
      )}

      {/* Product List Cards */}
      <div className="space-y-4" id="products-list-container">
        {packageList.map((pack) => {
          const subscribed = isAlreadySubscribed(pack.id);

          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 transition-all text-left relative shadow-sm"
              id={`product-card-${pack.id}`}
            >
              {/* TOP ROW: Title, Days & Image */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                    {pack.name}
                  </h2>
                  <div className="text-xs sm:text-sm text-zinc-300 font-normal flex items-center gap-1.5">
                    <span>Durée du contrat (Jours)</span>
                    <strong className="text-sm sm:text-base font-bold text-white font-mono">
                      {pack.durationDays}
                    </strong>
                  </div>
                </div>

                {/* Right Vehicle Thumbnail */}
                <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                  <img
                    src={pack.image}
                    alt={pack.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* MIDDLE ROW: Dark Box with Daily (24h) & Total Revenue */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 my-3 grid grid-cols-2 text-center items-center">
                <div className="pr-2">
                  <div className="text-[#22c55e] font-bold text-base sm:text-lg font-mono leading-tight">
                    {pack.dailyEarningsAmount.toLocaleString()}
                  </div>
                  <div className="text-zinc-400 text-xs sm:text-sm font-normal mt-0.5">
                    Revenu chaque 24h
                  </div>
                </div>

                <div className="pl-2">
                  <div className="text-emerald-400 font-bold text-base sm:text-lg font-mono leading-tight">
                    {pack.totalEarningsAmount.toLocaleString()}
                  </div>
                  <div className="text-zinc-400 text-xs sm:text-sm font-normal mt-0.5">
                    Revenu total
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Price in F CFA + Invest Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-sm sm:text-base text-zinc-300 font-normal">
                  Prix (F CFA) : <span className="text-[#ff6d00] font-bold text-base sm:text-lg font-mono ml-0.5">{pack.minInvestment.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => handleOpenSubscribe(pack)}
                  id={`btn-invest-${pack.id}`}
                  className="bg-[#22c55e] hover:bg-[#1eb852] text-black font-black text-xs sm:text-sm tracking-wider px-5 sm:px-7 py-2 rounded-xl uppercase cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  INVESTIR
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Customer Service Seal / Badge */}
      <div 
        onClick={onOpenCustomerService}
        className="fixed right-4 bottom-20 z-30 cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
        id="floating-support-badge"
        title="Centre de Support Client 24/7"
      >
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col items-center justify-center text-white text-center p-1">
            <span className="text-[7px] font-black uppercase tracking-tighter leading-none block text-[#22c55e]">
              ASSISTANCE
            </span>
            <div className="w-6 h-6 rounded-full bg-[#22c55e] text-black flex items-center justify-center my-0.5 shadow-sm">
              <Headphones className="w-3.5 h-3.5" />
            </div>
            <span className="text-[6px] font-bold tracking-tight uppercase leading-none block text-zinc-300">
              Support 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Investment Modal */}
      <AnimatePresence>
        {selectedPack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs" id="invest-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-left text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPack(null)}
                className="absolute right-4 top-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                {/* Header Product Info */}
                <div className="flex items-center gap-3 pr-8">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-zinc-950 border border-zinc-800">
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
                      Durée : <strong className="text-white font-mono">{selectedPack.durationDays} jours</strong> • Versement chaque 24h
                    </p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs space-y-1">
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
                        className="inline-flex items-center gap-1 text-[#22c55e] underline font-bold hover:text-emerald-300 mt-1 cursor-pointer"
                      >
                        Recharger mon portefeuille maintenant <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {success ? (
                  <div className="p-6 text-center space-y-3 bg-[#22c55e]/15 border border-[#22c55e]/30 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-[#22c55e] text-black flex items-center justify-center mx-auto shadow-lg shadow-[#22c55e]/30">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h4 className="text-base font-bold text-white">Investissement Réussi !</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Votre contrat pour <strong>{selectedPack.name}</strong> est maintenant actif. Vos gains de <strong>{formatCurrency(selectedPack.dailyEarningsAmount)}</strong> tomberont automatiquement chaque 24 heures.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmSubscribe} className="space-y-4">
                    {/* Wallet Balance Info */}
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Solde disponible :</span>
                        <strong className="text-sm font-bold font-mono text-white">
                          {wallet.balance.toLocaleString()} F CFA
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPack(null);
                          onOpenRecharge();
                        }}
                        className="px-3 py-1 bg-[#22c55e] hover:bg-[#1eb852] text-black rounded-lg text-xs font-bold transition cursor-pointer"
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
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22c55e] rounded-xl py-2.5 px-3.5 font-mono text-lg font-bold text-white focus:outline-none transition"
                      />
                      <span className="text-[11px] text-zinc-400 font-mono block">
                        Prix fixé : <strong className="text-white">{selectedPack.minInvestment.toLocaleString()} F CFA</strong>
                      </span>
                    </div>

                    {/* Yields Review Box */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 grid grid-cols-2 text-center items-center">
                      <div className="pr-2">
                        <div className="text-[#22c55e] font-bold text-base font-mono">
                          {((parseFloat(investAmount) || selectedPack.minInvestment) === selectedPack.minInvestment 
                            ? selectedPack.dailyEarningsAmount 
                            : Math.round((parseFloat(investAmount) / selectedPack.minInvestment) * selectedPack.dailyEarningsAmount)
                          ).toLocaleString()}
                        </div>
                        <div className="text-zinc-400 text-xs font-normal">Revenu chaque 24h</div>
                      </div>

                      <div className="pl-2">
                        <div className="text-emerald-400 font-bold text-base font-mono">
                          {((parseFloat(investAmount) || selectedPack.minInvestment) === selectedPack.minInvestment 
                            ? selectedPack.totalEarningsAmount 
                            : Math.round((parseFloat(investAmount) / selectedPack.minInvestment) * selectedPack.totalEarningsAmount)
                          ).toLocaleString()}
                        </div>
                        <div className="text-zinc-400 text-xs font-normal">Revenu total</div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#1eb852] text-black text-sm font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
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
