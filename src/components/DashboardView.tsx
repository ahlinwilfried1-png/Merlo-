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
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WalletState, UserSubscription, Transaction, VIPPackage } from '../types';

interface DashboardViewProps {
  wallet: WalletState;
  subscriptions: UserSubscription[];
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
  onSubscribeVIP?: (pack: VIPPackage, amount: number) => void;
  onClaimDaily: () => void;
  hasClaimable: boolean;
  claimableAmount: number;
}

// Ticker simulated live transactions
const LIVE_TICKERS = [
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
  onNavigate,
  onSubscribeVIP,
  onClaimDaily,
  hasClaimable,
  claimableAmount
}: DashboardViewProps) {
  const [tickerIndex, setTickerIndex] = useState(0);

  // Rotate live notification ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_TICKERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-3 max-w-xl mx-auto text-left" id="dashboard-view-root">
      {/* 1. TOP TICKER NOTIFICATION BAR */}
      <div 
        id="top-live-ticker"
        className="bg-[#121215] border border-zinc-800/90 rounded-xl py-2 px-3 flex items-center justify-between gap-2.5 overflow-hidden text-xs text-zinc-300 shadow-md"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="text-emerald-400 shrink-0">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-[11px] font-semibold text-zinc-200 truncate"
            >
              {LIVE_TICKERS[tickerIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
          En direct
        </span>
      </div>

      {/* 2. SOLDE PORTEFEUILLE MAIN CARD */}
      <div 
        id="wallet-main-card"
        className="bg-[#121215] border border-zinc-800/90 rounded-2xl overflow-hidden relative shadow-md"
      >
        {/* Top accent glow stripe */}
        <div className="h-1 w-full bg-emerald-500"></div>

        <div className="p-3.5 sm:p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block font-mono">
                  SOLDE PORTEFEUILLE
                </span>
                <span className="text-[11px] font-medium text-zinc-400 block">
                  Solde disponible
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('recharge')}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow-sm cursor-pointer"
            >
              Recharger
            </button>
          </div>

          {/* Balance Amount */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {Math.round(wallet.balance).toLocaleString('fr-FR')}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold tracking-wider uppercase font-mono border border-emerald-500/20">
              XOF
            </span>
          </div>
        </div>
      </div>

      {/* 3. SECTION OPÉRATIONS RAPIDES */}
      <div className="space-y-2 pt-0.5" id="quick-operations-section">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
            OPÉRATIONS RAPIDES
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider font-mono">
            Agrocapital
          </span>
        </div>

        {/* 4 Quick Action Buttons Grid -> Navigating to dedicated pages */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* 1. Recharger */}
          <button
            onClick={() => onNavigate('recharge')}
            id="quick-action-recharge"
            className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-[#121215] border border-zinc-800/80 shadow-sm hover:border-emerald-500/40 group cursor-pointer transition-all"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-300 group-hover:text-emerald-400 truncate w-full">
              Recharger
            </span>
          </button>

          {/* 2. Retirer */}
          <button
            onClick={() => onNavigate('retrait')}
            id="quick-action-withdraw"
            className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-[#121215] border border-zinc-800/80 shadow-sm hover:border-emerald-500/40 group cursor-pointer transition-all"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ArrowUpCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-300 group-hover:text-emerald-400 truncate w-full">
              Retirer
            </span>
          </button>

          {/* 3. Pointage */}
          <button
            onClick={() => onNavigate('pointage')}
            id="quick-action-pointage"
            className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-[#121215] border border-zinc-800/80 shadow-sm hover:border-emerald-500/40 group cursor-pointer transition-all"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-300 group-hover:text-emerald-400 truncate w-full">
              Pointage
            </span>
          </button>

          {/* 4. Annonces */}
          <button
            onClick={() => onNavigate('annonces')}
            id="quick-action-annonces"
            className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-[#121215] border border-zinc-800/80 shadow-sm hover:border-emerald-500/40 group cursor-pointer transition-all"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-300 group-hover:text-emerald-400 truncate w-full">
              Annonces
            </span>
          </button>
        </div>
      </div>

      {/* 4. VIP DIRECT ACCESS CARD */}
      <div 
        onClick={() => onNavigate('produit')}
        id="banner-vip-dashboard"
        className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-3 sm:p-3.5 shadow-sm hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-[13px] font-bold text-white block">Catalogue Produits Agrocapital</span>
            <span className="text-[11px] text-zinc-400 block mt-0.5">Explorez les contrats agricoles et générez vos revenus quotidiens</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 shrink-0">
          <span className="hidden sm:inline">Explorer</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 5. BANNIÈRE OFFICIELLE WHATSAPP */}
      <a
        href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
        target="_blank"
        rel="noopener noreferrer"
        id="banner-whatsapp-official-dashboard"
        className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-3 sm:p-3.5 shadow-sm hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <MessageCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-[13px] font-bold text-white block">Chaîne WhatsApp Agrocapital</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                Officiel
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 block mt-0.5">Suivre la chaîne pour les alertes de gains & codes cadeaux</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 shrink-0">
          <span className="hidden sm:inline">Suivre</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </a>

      {/* 6. BANNIÈRE PARRAINAGE & SERVICE CLIENT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
        {/* Parrainage Banner */}
        <div 
          onClick={() => onNavigate('equipe')}
          id="banner-referral-dashboard"
          className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-2.5 sm:p-3 shadow-sm hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-white block">30% Bonus Parrainage</span>
              <span className="text-[10px] text-zinc-400 block">Niveau 1 immédiat + 2% N2 + 1% N3</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>

        {/* Service Client Banner */}
        <div 
          onClick={() => onNavigate('service_client')}
          id="banner-sav-dashboard"
          className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-2.5 sm:p-3 shadow-sm hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-white block">Service Client SAV 24/7</span>
              <span className="text-[10px] text-zinc-400 block">Conseillers disponibles en direct</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>
      </div>
    </div>
  );
}

