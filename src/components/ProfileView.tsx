import React, { useState } from 'react';
import { 
  Bell, 
  BarChart3, 
  FileEdit, 
  CreditCard, 
  Info, 
  PlayCircle, 
  Headphones, 
  Power, 
  ChevronRight, 
  ShieldCheck, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, WalletState, Transaction, UserSubscription } from '../types';

interface ProfileViewProps {
  user: User;
  wallet: WalletState;
  transactions: Transaction[];
  subscriptions?: UserSubscription[];
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  onOpenAdmin?: () => void;
  onRedeemGiftCode?: (code: string) => { success: boolean; message: string; amount?: number };
  onClaimReward?: (amount: number) => void;
}

export default function ProfileView({
  user,
  wallet,
  onLogout,
  onNavigate,
  onOpenAdmin
}: ProfileViewProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="space-y-4 max-w-xl mx-auto text-left" id="profile-view-root">
      
      {/* Top Banner with radial green glow */}
      <div className="relative pt-2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-radial from-[#22c55e]/25 via-[#22c55e]/5 to-transparent blur-2xl pointer-events-none -z-0"></div>

        {/* User identification & balance card */}
        <div className="relative z-10 bg-transparent p-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center text-[#22c55e] font-black text-base">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm tracking-tight">{user.fullName || user.email.split('@')[0]}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-[10px] font-bold">
                    {user.role === 'admin' ? 'ADMIN' : 'VIP 1'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] font-mono text-zinc-400">ID : {user.referralCode}</span>
                </div>
              </div>
            </div>

            {/* Withdrawable Balance Indicator */}
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Solde retirable</span>
              <span className="text-lg font-black font-mono text-[#22c55e] tracking-tight">
                {wallet.balance.toLocaleString()} <span className="text-[11px] font-normal text-zinc-400">F CFA</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. TWO BIG ACTION BUTTONS: PAIEMENT & RETRAIT */}
        <div className="grid grid-cols-2 gap-3.5 mb-5 relative z-10" id="top-wallet-action-buttons">
          <button
            onClick={() => onNavigate('recharge')}
            id="wallet-btn-paiement"
            className="w-full py-3.5 px-4 rounded-xl bg-[#22c55e] hover:bg-[#1eb852] active:bg-[#179641] text-black text-sm font-extrabold tracking-wide transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            Paiement
          </button>
          <button
            onClick={() => onNavigate('retrait')}
            id="wallet-btn-retrait"
            className="w-full py-3.5 px-4 rounded-xl bg-[#22c55e] hover:bg-[#1eb852] active:bg-[#179641] text-black text-sm font-extrabold tracking-wide transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            Retrait
          </button>
        </div>

        {/* 3. SECTION 1 (Premier bloc de fonctionnalités sans cadre ni bordure) */}
        <div className="bg-transparent overflow-hidden divide-y divide-zinc-800/40 mb-3 text-left" id="wallet-menu-section-1">
          
          {/* 1. Code cadeau -> Redirection vers nouvelle page */}
          <button
            onClick={() => onNavigate('code_cadeau')}
            id="row-gift-code"
            className="w-full flex items-center justify-between px-2 py-3.5 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Bell className="w-5 h-5 text-[#22c55e] fill-[#22c55e]/20 shrink-0" />
              <span className="text-[15px] font-semibold text-white tracking-normal group-hover:text-white">
                Code cadeau
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </button>

          {/* 2. Récompenses quotidiennes -> Redirection vers nouvelle page pointage */}
          <button
            onClick={() => onNavigate('pointage')}
            id="row-daily-rewards"
            className="w-full flex items-center justify-between px-2 py-3.5 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Bell className="w-5 h-5 text-[#22c55e] fill-[#22c55e]/20 shrink-0" />
              <span className="text-[15px] font-semibold text-white tracking-normal group-hover:text-white">
                Récompenses quotidiennes
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </button>

          {/* 3. Détails du compte -> Redirection vers nouvelle page */}
          <button
            onClick={() => onNavigate('details_compte')}
            id="row-account-details"
            className="w-full flex items-center justify-between px-2 py-3.5 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <BarChart3 className="w-5 h-5 text-zinc-400 shrink-0" />
              <span className="text-[15px] font-semibold text-white tracking-normal group-hover:text-white">
                Détails du compte
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </button>

          {/* 4. Registres de paiement -> Redirection vers nouvelle page */}
          <button
            onClick={() => onNavigate('registre_paiement')}
            id="row-payment-records"
            className="w-full flex items-center justify-between px-2 py-3.5 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <FileEdit className="w-5 h-5 text-zinc-400 shrink-0" />
              <span className="text-[15px] font-semibold text-white tracking-normal group-hover:text-white">
                Registres de paiement
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </button>

          {/* 5. Registres de retrait -> Redirection vers nouvelle page */}
          <button
            onClick={() => onNavigate('registre_retrait')}
            id="row-withdrawal-records"
            className="w-full flex items-center justify-between px-2 py-3.5 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <FileEdit className="w-5 h-5 text-zinc-400 shrink-0" />
              <span className="text-[15px] font-semibold text-white tracking-normal group-hover:text-white">
                Registres de retrait
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </button>

        </div>

        {/* 4. SECTION 2 (Deuxième bloc sans cadre ni bordure) */}
        <div className="bg-transparent overflow-hidden divide-y divide-zinc-800/40 mb-4 text-left" id="wallet-menu-section-2">
          
          {/* 7. À propos de nous -> Redirection vers nouvelle page */}
          <button
            onClick={() => onNavigate('a_propos')}
            id="row-about-us"
            className="w-full flex items-center justify-between px-2 py-3.5 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Info className="w-5 h-5 text-zinc-400 shrink-0" />
              <span className="text-[15px] font-semibold text-white tracking-normal group-hover:text-white">
                À propos de nous
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </button>

          {/* 8. Règles de la plateforme -> Redirection vers nouvelle page */}
          <button
            onClick={() => onNavigate('regles_plateforme')}
            id="row-platform-rules"
            className="w-full flex items-center justify-between px-2 py-3.5 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <PlayCircle className="w-5 h-5 text-zinc-400 shrink-0" />
              <span className="text-[15px] font-semibold text-white tracking-normal group-hover:text-white">
                Règles de la plateforme
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </button>

          {/* 9. Service client */}
          <button
            onClick={() => onNavigate('service_client')}
            id="row-customer-service"
            className="w-full flex items-center justify-between px-2 py-3.5 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Headphones className="w-5 h-5 text-zinc-400 shrink-0" />
              <span className="text-[15px] font-semibold text-white tracking-normal group-hover:text-white">
                Service client
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </button>

          {/* 10. Sortie sécurisée */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            id="row-secure-logout"
            className="w-full flex items-center justify-between px-2 py-3.5 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Power className="w-5 h-5 text-zinc-400 group-hover:text-rose-400 transition-colors shrink-0" />
              <span className="text-[15px] font-semibold text-white group-hover:text-rose-300 tracking-normal transition-colors">
                Sortie sécurisée
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 transition-colors shrink-0" />
          </button>

        </div>

        {/* Admin Row if admin user */}
        {user.role === 'admin' && onOpenAdmin && (
          <div className="overflow-hidden mb-4 text-left">
            <button
              onClick={onOpenAdmin}
              id="row-admin-management"
              className="w-full flex items-center justify-between px-2 py-3.5 hover:bg-amber-500/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-[15px] font-bold text-amber-300 tracking-normal">
                  Console Administrateur
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="modal-logout-confirm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#16171d] text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
                <Power className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Sortie sécurisée</h3>
                <p className="text-xs text-zinc-400 mt-1">Êtes-vous certain de vouloir fermer votre session ?</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-3 px-4 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Se déconnecter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
