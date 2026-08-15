import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ArrowUpCircle, 
  Award, 
  Calendar, 
  MessageCircle, 
  Volume2, 
  ShieldCheck, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  TrendingUp, 
  Sparkles,
  Headphones,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WalletState, UserSubscription, Transaction, VIPPackage } from '../types';
import { VIP_PACKAGES, formatCurrency } from '../data';

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
  '****420 rechargé 1,500XOF 65****209',
  '****814 rechargé 25,000XOF 07****381',
  '****192 retiré 15,000XOF 05****994',
  '****550 souscrit VIP 2 25,000XOF 01****120',
  '****903 rechargé 50,000XOF 77****455',
  '****231 retiré 30,000XOF 68****312'
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
    <div className="space-y-4 max-w-xl mx-auto text-left" id="dashboard-view-root">
      {/* 1. TOP TICKER NOTIFICATION BAR */}
      <div 
        id="top-live-ticker"
        className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 overflow-hidden text-xs text-zinc-300 select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="text-[#22c55e] shrink-0">
            <Volume2 className="w-5 h-5 text-[#22c55e]" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-[13px] font-bold text-white truncate"
            >
              {LIVE_TICKERS[tickerIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 2. SOLDE PORTEFEUILLE MAIN CARD */}
      <div 
        id="wallet-main-card"
        className="bg-zinc-900 border border-zinc-800/80 rounded-3xl overflow-hidden relative shadow-lg"
      >
        {/* Top accent glow stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#22c55e] via-emerald-400 to-[#10b981]"></div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center border border-[#22c55e]/30">
              <CreditCard className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#22c55e] block font-mono">
                SOLDE PORTEFEUILLE
              </span>
              <span className="text-xs font-semibold text-zinc-400 block">
                Solde disponible
              </span>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="flex items-center gap-2.5 pt-1">
            <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {Math.round(wallet.balance).toLocaleString('fr-FR')}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#22c55e] text-black text-xs font-black tracking-wider uppercase font-mono shadow-xs">
              XOF
            </span>
          </div>
        </div>
      </div>

      {/* 3. SECTION OPÉRATIONS RAPIDES (OUVERTURE DE PAGE DÉDIÉE) */}
      <div className="space-y-3 pt-2" id="quick-operations-section">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#22c55e] font-mono">
            OPÉRATIONS RAPIDES
          </h3>
          <span className="px-3 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-wider font-mono">
            AURA VIP INVEST
          </span>
        </div>

        {/* 4 Quick Action Buttons Grid -> Navigating to dedicated pages */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          {/* 1. Recharger */}
          <button
            onClick={() => onNavigate('recharge')}
            id="quick-action-recharge"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#ff6d00] hover:bg-[#e65100] text-white flex items-center justify-center shadow-md shadow-[#ff6d00]/20 group-hover:scale-105 group-active:scale-95 transition-all">
              <CreditCard className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-zinc-300 tracking-tight group-hover:text-white">
              Recharger
            </span>
          </button>

          {/* 2. Retirer */}
          <button
            onClick={() => onNavigate('retrait')}
            id="quick-action-withdraw"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#22c55e] hover:bg-[#1eb852] text-black flex items-center justify-center shadow-md shadow-[#22c55e]/20 group-hover:scale-105 group-active:scale-95 transition-all">
              <ArrowUpCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-zinc-300 tracking-tight group-hover:text-white">
              Retirer
            </span>
          </button>

          {/* 3. Pointage */}
          <button
            onClick={() => onNavigate('pointage')}
            id="quick-action-pointage"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#f59e0b] hover:bg-[#d97706] text-black flex items-center justify-center shadow-md shadow-[#f59e0b]/20 group-hover:scale-105 group-active:scale-95 transition-all">
              <Calendar className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-zinc-300 tracking-tight group-hover:text-white">
              Pointage
            </span>
          </button>

          {/* 4. Annonces */}
          <button
            onClick={() => onNavigate('annonces')}
            id="quick-action-annonces"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] text-white flex items-center justify-center shadow-md shadow-[#3b82f6]/20 group-hover:scale-105 group-active:scale-95 transition-all">
              <MessageCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-zinc-300 tracking-tight group-hover:text-white">
              Annonces
            </span>
          </button>
        </div>
      </div>

      {/* 4. VIP DIRECT ACCESS CARD */}
      <div 
        onClick={() => onNavigate('produit')}
        id="banner-vip-dashboard"
        className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-4 sm:p-5 shadow-sm hover:border-[#22c55e]/50 transition cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-black text-white block">Gamme Agrocapital VIP</span>
            <span className="text-xs text-zinc-400 block mt-0.5">Explorez les contrats agricoles Agrocapital et récoltez vos gains quotidiens</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-[#22c55e]">
          <span>Explorer</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* 5. BANNIÈRE OFFICIELLE WHATSAPP & PARRAINAGE & SERVICE CLIENT */}
      <a
        href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
        target="_blank"
        rel="noopener noreferrer"
        id="banner-whatsapp-official-dashboard"
        className="bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-lg hover:border-emerald-400 transition cursor-pointer flex items-center justify-between group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-black flex items-center justify-center shadow-md shadow-[#25D366]/20 shrink-0 group-hover:scale-105 transition-transform">
            <MessageCircle className="w-6 h-6 fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white block">Chaîne WhatsApp Agrocapital</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                Officiel
              </span>
            </div>
            <span className="text-xs text-zinc-300 block mt-0.5">Suivre la chaîne pour les alertes de gains 24h & codes cadeaux</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#25D366] shrink-0">
          <span className="hidden sm:inline">Suivre</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </a>

      {/* 6. BANNIÈRE PARRAINAGE & SERVICE CLIENT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Parrainage Banner */}
        <div 
          onClick={() => onNavigate('equipe')}
          id="banner-referral-dashboard"
          className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-4 shadow-sm hover:border-amber-500/50 transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-white block">30% Bonus Parrainage</span>
              <span className="text-[10px] text-zinc-400 block">Niveau 1 immédiat + 2% N2 + 1% N3</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </div>

        {/* Service Client Banner */}
        <div 
          onClick={() => onNavigate('service_client')}
          id="banner-sav-dashboard"
          className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-4 shadow-sm hover:border-sky-500/50 transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-white block">Service Client SAV 24/7</span>
              <span className="text-[10px] text-zinc-400 block">Conseillers disponibles en direct</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </div>
      </div>
    </div>
  );
}
