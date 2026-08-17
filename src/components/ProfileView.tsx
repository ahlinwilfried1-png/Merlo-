import React, { useState } from 'react';
import { 
  Gift, 
  UserCheck, 
  WalletCards, 
  Banknote, 
  ScrollText, 
  Headphones, 
  LogOut, 
  ChevronRight, 
  ShieldCheck 
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
    <div className="space-y-5 max-w-xl mx-auto text-left py-1" id="profile-view-root">
      
      {/* 1. TOP USER & BALANCE SECTION (Clean, Fluid, Borderless Design) */}
      <div className="space-y-4" id="profile-user-header-section">
        {/* User Identity Row */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-emerald-950/40 shrink-0">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.phoneNumber ? user.phoneNumber.slice(-2) : 'U')}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  {user.fullName || user.phoneNumber || user.email.split('@')[0]}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                  {user.role === 'admin' ? 'ADMIN' : (user.vipTier || 'VIP 1')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono text-zinc-400">ID : {user.referralCode}</span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Actif
                </span>
              </div>
            </div>
          </div>

          {/* Solde Retirable Header Badge */}
          <div className="text-right shrink-0">
            <span className="text-[10px] font-medium text-zinc-400 block uppercase tracking-wider">Solde retirable</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-400 tracking-tight">
              {wallet.balance.toLocaleString('fr-FR')} <span className="text-[10px] font-semibold text-zinc-400">F CFA</span>
            </span>
          </div>
        </div>

        {/* 2. TWO PRIMARY ACTION BUTTONS: DÉPÔT / PAIEMENT & RETRAIT */}
        <div className="grid grid-cols-2 gap-3" id="top-wallet-action-buttons">
          <button
            onClick={() => onNavigate('recharge')}
            id="wallet-btn-paiement"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 active:scale-[0.98] cursor-pointer"
          >
            <WalletCards className="w-4 h-4" />
            Dépôt / Paiement
          </button>
          <button
            onClick={() => onNavigate('retrait')}
            id="wallet-btn-retrait"
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-white text-xs sm:text-sm font-bold tracking-wide transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <Banknote className="w-4 h-4 text-emerald-400" />
            Retrait
          </button>
        </div>
      </div>

      {/* 2. GESTION DU COMPTE ET TRANSACTIONS (Clean, fluid list without heavy boxes) */}
      <div className="space-y-1 pt-1" id="wallet-menu-financial-list">
        <div className="px-1 pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Compte & Finances
          </span>
        </div>

        {/* 1. Code cadeau */}
        <button
          onClick={() => onNavigate('code_cadeau')}
          id="row-gift-code"
          className="w-full flex items-center justify-between px-2.5 py-3 hover:bg-zinc-900/60 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="text-emerald-400">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white block">
                Code cadeau
              </span>
              <span className="text-[10px] text-zinc-400">Échangez vos coupons bonus</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 2. Détails du compte */}
        <button
          onClick={() => onNavigate('details_compte')}
          id="row-account-details"
          className="w-full flex items-center justify-between px-2.5 py-3 hover:bg-zinc-900/60 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white block">
                Détails du compte
              </span>
              <span className="text-[10px] text-zinc-400">Statistiques, solde & revenus</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 3. Registres de paiement */}
        <button
          onClick={() => onNavigate('registre_paiement')}
          id="row-payment-records"
          className="w-full flex items-center justify-between px-2.5 py-3 hover:bg-zinc-900/60 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="text-emerald-400">
              <WalletCards className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white block">
                Registres de paiement
              </span>
              <span className="text-[10px] text-zinc-400">Historique des recharges et dépôts</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 4. Registres de retrait */}
        <button
          onClick={() => onNavigate('registre_retrait')}
          id="row-withdrawal-records"
          className="w-full flex items-center justify-between px-2.5 py-3 hover:bg-zinc-900/60 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="text-emerald-400">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white block">
                Registres de retrait
              </span>
              <span className="text-[10px] text-zinc-400">Suivi des demandes de virement</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      </div>

      {/* 3. ASSISTANCE ET RÈGLES */}
      <div className="space-y-1 pt-2 border-t border-zinc-900" id="wallet-menu-info-list">
        <div className="px-1 pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Assistance & Plateforme
          </span>
        </div>

        {/* Règles de la plateforme */}
        <button
          onClick={() => onNavigate('regles_plateforme')}
          id="row-platform-rules"
          className="w-full flex items-center justify-between px-2.5 py-3 hover:bg-zinc-900/60 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="text-emerald-400">
              <ScrollText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white block">
                Règles de la plateforme
              </span>
              <span className="text-[10px] text-zinc-400">Modalités de retrait, dépôts & cycles</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* Service client 24/7 */}
        <button
          onClick={() => onNavigate('service_client')}
          id="row-customer-service"
          className="w-full flex items-center justify-between px-2.5 py-3 hover:bg-zinc-900/60 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="text-emerald-400">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white block">
                Service client 24/7
              </span>
              <span className="text-[10px] text-zinc-400">Support en direct et réclamations</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* Sortie sécurisée */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          id="row-secure-logout"
          className="w-full flex items-center justify-between px-2.5 py-3 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="text-rose-400">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-rose-400 block transition-colors">
                Sortie sécurisée
              </span>
              <span className="text-[10px] text-zinc-400">Déconnexion de votre session</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      </div>

      {/* Admin Row if admin user */}
      {user.role === 'admin' && onOpenAdmin && (
        <div className="pt-2 border-t border-zinc-900">
          <button
            onClick={onOpenAdmin}
            id="row-admin-management"
            className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-500/10 hover:bg-amber-500/15 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-amber-300 block">
                  Console Administrateur
                </span>
                <span className="text-[10px] text-amber-400/70">Gestion des utilisateurs, validation dépôts & retraits</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="modal-logout-confirm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#121215] text-zinc-100 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative text-center space-y-3.5 border border-zinc-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                <LogOut className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Sortie sécurisée</h3>
                <p className="text-xs text-zinc-400 mt-1">Êtes-vous certain de vouloir fermer votre session ?</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-rose-950/60"
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

