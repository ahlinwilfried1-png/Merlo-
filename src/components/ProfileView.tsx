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
  ShieldCheck,
  CreditCard,
  Building2,
  Users,
  History,
  Sparkles,
  Award,
  Globe,
  Download,
  MessageSquare
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
    <div className="space-y-4 sm:space-y-5 w-full max-w-2xl sm:max-w-3xl mx-auto text-left py-1 text-cyan-50" id="profile-view-root">
      
      {/* 1. TOP HEADER STATUS (Sans cadre/bordure) */}
      <div 
        id="profile-user-header-section"
        className="aura-glass-card rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl border-0 ring-0"
      >
        {/* Top Mini Badges Row (VIP 0 | Equipe | ID) */}
        <div className="flex items-center justify-between text-xs font-bold text-cyan-200/80 px-1">
          <div className="flex items-center gap-1.5 text-amber-300 luminous-text-soft">
            <Award className="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            <span>{user.role === 'admin' ? 'ADMIN' : (user.vipTier || 'VIP 0')}</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-300">
            <Users className="w-3.5 h-3.5" />
            <span>Équipe</span>
          </div>
          <div className="text-cyan-300 font-mono text-[11px] bg-cyan-950/80 px-2.5 py-0.5 rounded-full">
            ID: {user.referralCode}
          </div>
        </div>

        {/* User Balance Display Box (Sans contour) */}
        <div className="bg-[#02242e]/70 rounded-2xl p-4 flex items-center justify-between border-0">
          <div>
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block font-mono">
              Solde Retirable Disponible
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight luminous-text">
                {Math.round(wallet.balance).toLocaleString('fr-FR')}
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase luminous-text-emerald">
                XOF
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider block font-mono">
              Revenus cumulés
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 luminous-text-emerald">
              +{(wallet.totalEarnings || wallet.balance).toLocaleString('fr-FR')} F
            </span>
          </div>
        </div>

        {/* Quick Deposit & Withdrawal Buttons (Sans contour) */}
        <div className="grid grid-cols-2 gap-3 pt-0.5" id="top-wallet-action-buttons">
          <button
            onClick={() => onNavigate('recharge')}
            id="wallet-btn-paiement"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white text-xs sm:text-sm font-black tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.98] cursor-pointer border-0"
          >
            <CreditCard className="w-4 h-4" />
            Recharger
          </button>
          <button
            onClick={() => onNavigate('retrait')}
            id="wallet-btn-retrait"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-black tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer border-0"
          >
            <Banknote className="w-4 h-4 text-white" />
            Retirer
          </button>
        </div>
      </div>

      {/* 2. THE ACTION MENU (Sans cadres, sans bordures, fluide et intégré au fond) */}
      <div 
        id="profile-action-menu-card"
        className="aura-glass-card rounded-[28px] p-2 space-y-1 shadow-2xl border-0 ring-0"
      >
        {/* Mon adresse / Coordonnées */}
        <button
          onClick={() => onNavigate('carte_bancaire')}
          id="row-my-address"
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#064250]/60 rounded-2xl transition cursor-pointer text-white group"
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
            <span className="text-xs sm:text-sm md:text-base font-bold text-white luminous-text">
              Mon adresse
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Transactions */}
        <button
          onClick={() => onNavigate('historique')}
          id="row-transactions"
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#064250]/60 rounded-2xl transition cursor-pointer text-white group"
        >
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
            <span className="text-xs sm:text-sm md:text-base font-bold text-white luminous-text">
              Transactions
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Servir / Service client */}
        <button
          onClick={() => onNavigate('service_client')}
          id="row-service-support"
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#064250]/60 rounded-2xl transition cursor-pointer text-white group"
        >
          <div className="flex items-center gap-3">
            <Headphones className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
            <span className="text-xs sm:text-sm md:text-base font-bold text-white luminous-text">
              Servir
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Code cadeau */}
        <button
          onClick={() => onNavigate('code_cadeau')}
          id="row-gift-code"
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#064250]/60 rounded-2xl transition cursor-pointer text-white group"
        >
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
            <span className="text-xs sm:text-sm md:text-base font-bold text-white luminous-text">
              Code cadeau
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Règles de la plateforme */}
        <button
          onClick={() => onNavigate('regles_plateforme')}
          id="row-rules"
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#064250]/60 rounded-2xl transition cursor-pointer text-white group"
        >
          <div className="flex items-center gap-3">
            <ScrollText className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
            <span className="text-xs sm:text-sm md:text-base font-bold text-white luminous-text">
              Règles de la plateforme
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* À propos de nous */}
        <button
          onClick={() => onNavigate('a_propos')}
          id="row-about"
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#064250]/60 rounded-2xl transition cursor-pointer text-white group"
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
            <span className="text-xs sm:text-sm md:text-base font-bold text-white luminous-text">
              À propos de nous
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Quitter / Sortie sécurisée */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          id="row-logout"
          className="w-full flex items-center justify-between p-3.5 hover:bg-rose-950/40 rounded-2xl transition cursor-pointer text-rose-300 group"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
            <span className="text-xs sm:text-sm md:text-base font-bold text-white luminous-text">
              Quitter
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400/80 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Admin Row if admin user */}
      {user.role === 'admin' && onOpenAdmin && (
        <div className="pt-1">
          <button
            onClick={onOpenAdmin}
            id="row-admin-management"
            className="w-full flex items-center justify-between p-4 bg-amber-950/60 hover:bg-amber-900/60 rounded-2xl transition-colors cursor-pointer group shadow-lg border-0"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs sm:text-sm font-black text-amber-200 block luminous-text-soft">
                  Console Administrateur
                </span>
                <span className="text-[11px] text-amber-300/80">Gestion des utilisateurs, validation dépôts & retraits</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" id="modal-logout-confirm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="aura-glass-card text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center space-y-4 border-0"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-950/80 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                <LogOut className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white luminous-text">Sortie sécurisée</h3>
                <p className="text-xs text-cyan-200/80 mt-1">Êtes-vous certain de vouloir fermer votre session ?</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-3 px-4 rounded-2xl bg-[#032029] hover:bg-[#052e3b] text-cyan-200 font-bold text-xs transition cursor-pointer border-0"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-600/30 border-0"
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

