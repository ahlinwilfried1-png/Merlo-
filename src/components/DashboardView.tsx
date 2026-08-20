import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ArrowUpCircle, 
  Calendar, 
  MessageCircle, 
  Volume2, 
  ChevronRight, 
  Sparkles,
  Headphones,
  ShoppingBag,
  Target,
  Award,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WalletState, UserSubscription, Transaction, VIPPackage, Announcement } from '../types';
import ImageCarousel from './ImageCarousel';

interface DashboardViewProps {
  wallet: WalletState;
  subscriptions: UserSubscription[];
  transactions: Transaction[];
  announcements?: Announcement[];
  onNavigate: (tab: string) => void;
  onSubscribeVIP?: (pack: VIPPackage, amount: number) => void;
  onClaimDaily: () => void;
  hasClaimable: boolean;
  claimableAmount: number;
  onDoPointage?: () => void;
}

// Ticker simulated live transactions
const BASE_LIVE_TICKERS = [
  '****420 rechargé 15,000 XOF',
  '****814 rechargé 25,000 XOF',
  '****192 retiré 15,000 XOF',
  '****550 souscrit Contrat Maïs 25,000 XOF',
  '****903 rechargé 50,000 XOF',
  '****231 retiré 30,000 XOF'
];

export default function DashboardView({
  wallet,
  subscriptions,
  transactions,
  announcements = [],
  onNavigate,
  onSubscribeVIP,
  onClaimDaily,
  hasClaimable,
  claimableAmount,
  onDoPointage
}: DashboardViewProps) {
  const [tickerIndex, setTickerIndex] = useState(0);

  const activeTickers = BASE_LIVE_TICKERS;

  // Rotate live notification ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % activeTickers.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [activeTickers.length]);

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-3xl sm:max-w-4xl mx-auto text-left" id="dashboard-view-root">
      {/* 1. TOP TICKER NOTIFICATION BAR (Cadre fin et compact) */}
      <div 
        id="top-live-ticker"
        className="aura-glass-card rounded-xl py-2 px-3.5 sm:px-4 flex items-center justify-between gap-2.5 overflow-hidden text-xs sm:text-[12px] text-cyan-100 shadow-md border border-cyan-500/20"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="text-cyan-400 shrink-0">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-[11px] sm:text-xs font-semibold text-cyan-50 truncate luminous-text-soft"
            >
              {activeTickers[tickerIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 font-mono shadow-xs">
          En direct
        </span>
      </div>

      {/* 2. SOLDE PORTEFEUILLE MAIN CARD (TABLEAU DE BORD AGRANDI & MAJESTUEUX) */}
      <div 
        id="wallet-main-card"
        className="aura-glass-card rounded-3xl overflow-hidden relative shadow-2xl border border-cyan-500/35"
      >
        {/* Top accent glow stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 shadow-md shadow-cyan-400/50"></div>

        <div className="p-5 sm:p-6 md:p-7 space-y-4 sm:space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 block font-mono luminous-text-emerald">
                  SOLDE DU PORTEFEUILLE
                </span>
                <span className="text-xs sm:text-sm font-medium text-cyan-200/90 block">
                  Fonds disponibles & retrait immédiat
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('recharge')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-black transition shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95 border border-emerald-400/40"
              >
                Recharger
              </button>
              <button
                onClick={() => onNavigate('retrait')}
                className="hidden sm:inline-flex px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 text-xs sm:text-sm font-black transition border border-cyan-500/30 cursor-pointer active:scale-95"
              >
                Retirer
              </button>
            </div>
          </div>

          {/* Balance Amount with large display */}
          <div className="bg-[#02242e]/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-cyan-500/20 shadow-inner">
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-cyan-300/80 uppercase font-mono tracking-wider block">
                Montant Total Disponible
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black font-mono text-white tracking-tight luminous-text">
                  {Math.round(wallet.balance).toLocaleString('fr-FR')}
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-extrabold tracking-wider uppercase font-mono shadow-xs">
                  XOF
                </span>
              </div>
            </div>

            {/* Sub-Metrics inside Dashboard */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-cyan-500/15">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-cyan-200/70 uppercase tracking-wider block font-mono">
                  Revenus cumulés
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 luminous-text-emerald">
                  +{(wallet.totalEarnings || wallet.balance).toLocaleString('fr-FR')} F
                </span>
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-cyan-200/70 uppercase tracking-wider block font-mono">
                  Retraits effectués
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-cyan-300">
                  {(wallet.totalWithdrawn || 0).toLocaleString('fr-FR')} F
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION OPÉRATIONS RAPIDES (Cadres réduits et compacts) */}
      <div className="space-y-2 pt-0.5" id="quick-operations-section">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-cyan-100 font-mono luminous-text-soft">
            OPÉRATIONS RAPIDES
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/25 text-cyan-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-mono">
            Agroprofit
          </span>
        </div>

        {/* 4 Quick Action Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          {/* 1. Recharger - Orange */}
          <button
            onClick={() => onNavigate('recharge')}
            id="quick-action-recharge"
            className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-xl aura-glass-subcard hover:bg-[#074756]/80 group cursor-pointer transition-all active:scale-95 shadow-xs border border-cyan-500/15 hover:border-orange-400/30"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform border border-orange-400/30">
              <CreditCard className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-cyan-100 group-hover:text-cyan-300 truncate w-full">
              Recharger
            </span>
          </button>

          {/* 2. Retirer - Vert */}
          <button
            onClick={() => onNavigate('retrait')}
            id="quick-action-withdraw"
            className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-xl aura-glass-subcard hover:bg-[#074756]/80 group cursor-pointer transition-all active:scale-95 shadow-xs border border-cyan-500/15 hover:border-emerald-400/30"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform border border-emerald-400/30">
              <ArrowUpCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-cyan-100 group-hover:text-cyan-300 truncate w-full">
              Retirer
            </span>
          </button>

          {/* 3. Pointage - Jaune / Orange */}
          <button
            onClick={() => {
              if (onDoPointage) {
                onDoPointage();
              } else {
                onClaimDaily();
              }
            }}
            id="quick-action-pointage"
            className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-xl aura-glass-subcard hover:bg-[#074756]/80 group cursor-pointer transition-all active:scale-95 shadow-xs border border-cyan-500/15 hover:border-amber-400/30"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform border border-amber-300/30">
              <Calendar className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-cyan-100 group-hover:text-cyan-300 truncate w-full">
              Pointage
            </span>
          </button>

          {/* 4. Code Cadeau - Violet / Indigo */}
          <button
            onClick={() => onNavigate('code_cadeau')}
            id="quick-action-gift-code"
            className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-xl aura-glass-subcard hover:bg-[#074756]/80 group cursor-pointer transition-all active:scale-95 shadow-xs border border-cyan-500/15 hover:border-purple-400/30 relative"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30 group-hover:scale-105 transition-transform border border-purple-400/30 relative">
              <Gift className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-cyan-100 group-hover:text-purple-300 truncate w-full">
              Code Cadeau
            </span>
          </button>
        </div>
      </div>

      {/* 4. VIP DIRECT ACCESS CARD (Cadre compact) */}
      <div 
        onClick={() => onNavigate('produit')}
        id="banner-vip-dashboard"
        className="aura-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md hover:bg-[#064250]/80 transition cursor-pointer flex items-center justify-between group border border-cyan-500/20 hover:border-cyan-400/40"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-950/70 border border-cyan-500/25 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-[13px] md:text-sm font-bold text-white block luminous-text-soft">Catalogue Produits Agroprofit</span>
            <span className="text-[10px] sm:text-xs text-cyan-200/70 block mt-0.5">Explorez les contrats agricoles et générez vos revenus quotidiens</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 shrink-0">
          <span className="hidden sm:inline">Explorer</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 5. BANNIÈRE OFFICIELLE WHATSAPP (Cadre compact) */}
      <a
        href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
        target="_blank"
        rel="noopener noreferrer"
        id="banner-whatsapp-official-dashboard"
        className="aura-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md hover:bg-[#064250]/80 transition cursor-pointer flex items-center justify-between group border border-cyan-500/20 hover:border-emerald-400/40"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0 group-hover:scale-105 transition-transform border border-emerald-400/30">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-[13px] md:text-sm font-bold text-white block luminous-text-soft">Chaîne WhatsApp Agroprofit</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[9px] font-bold">
                Officiel
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-cyan-200/70 block mt-0.5">Suivre la chaîne pour les alertes de gains & codes cadeaux</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 shrink-0">
          <span className="hidden sm:inline">Suivre</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </a>

      {/* 6. BANNIÈRE MISSIONS & PRIMES CASH (Cadre compact) */}
      <div 
        onClick={() => onNavigate('missions')}
        id="banner-missions-dashboard"
        className="aura-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md hover:bg-[#064250]/80 transition cursor-pointer flex items-center justify-between group relative overflow-hidden border border-cyan-500/20 hover:border-cyan-400/40"
      >
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-950/70 border border-cyan-500/25 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-[13px] md:text-sm font-bold text-white block luminous-text-soft">Missions & Primes Parrainage</span>
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[9px] font-bold">
                Bonus Cash
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-cyan-200/70 block mt-0.5">Ayez des filleuls actifs et débloquez jusqu'à 7 000+ F CFA</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 shrink-0 relative z-10">
          <span className="hidden sm:inline">Participer</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 7. BANNIÈRE PARRAINAGE & SERVICE CLIENT (Cadres compacts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
        {/* Parrainage Banner */}
        <div 
          onClick={() => onNavigate('equipe')}
          id="banner-referral-dashboard"
          className="aura-glass-card rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md hover:bg-[#064250]/80 transition cursor-pointer flex items-center justify-between group border border-cyan-500/20 hover:border-cyan-400/40"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-cyan-950/70 border border-cyan-500/25 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-[13px] font-bold text-white block luminous-text-soft">15% Bonus Parrainage</span>
              <span className="text-[10px] sm:text-[11px] text-cyan-200/70 block">Niveau 1 immédiat + 2% N2 + 1% N3</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>

        {/* Service Client Banner */}
        <div 
          onClick={() => onNavigate('service_client')}
          id="banner-sav-dashboard"
          className="aura-glass-card rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md hover:bg-[#064250]/80 transition cursor-pointer flex items-center justify-between group border border-cyan-500/20 hover:border-cyan-400/40"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-cyan-950/70 border border-cyan-500/25 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-[13px] font-bold text-white block luminous-text-soft">Service Client SAV 24/7</span>
              <span className="text-[10px] sm:text-[11px] text-cyan-200/70 block">Conseillers disponibles en direct</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>
      </div>

      {/* 8. CARROUSEL FLUX D'IMAGES ENTREPRISES AGRICOLES (Tout en bas de la page) */}
      <ImageCarousel />
    </div>
  );
}


