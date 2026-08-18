import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Lock, 
  Gift, 
  ArrowRight, 
  Check, 
  Headphones, 
  Globe, 
  Shield, 
  X, 
  MessageSquare, 
  PhoneCall, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authRegisterUser, authLoginUser } from '../lib/supabaseService';
import { generateReferralCode } from '../data';
import UserBackground from './UserBackground';

interface AuthProps {
  onLoginSuccess: (
    email: string, 
    fullName: string, 
    referrerCode?: string, 
    role?: 'admin' | 'user',
    phoneNumber?: string,
    password?: string,
    initialBalance?: number
  ) => void;
}

const COUNTRY_CODES = [
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
];

const RECENT_WITHDRAWALS = [
  { phone: '@65****609', amount: '35 600 F CFA', seconds: '210' },
  { phone: '@69****842', amount: '50 000 F CFA', seconds: '145' },
  { phone: '@67****113', amount: '120 000 F CFA', seconds: '320' },
  { phone: '@07****584', amount: '25 000 F CFA', seconds: '85' },
  { phone: '@68****905', amount: '75 400 F CFA', seconds: '190' },
];

export default function Auth({ onLoginSuccess }: AuthProps) {
  // Mode: 'register' = Inscription (création nouveau compte), 'login' = Connexion (authentification existant)
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Form Fields
  const [selectedCountryCode, setSelectedCountryCode] = useState('+228');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    const match = hash.match(/ref=([a-zA-Z0-9_-]+)/);
    return urlParams.get('ref') || urlParams.get('invite') || (match ? match[1] : '6281499');
  });

  const [language, setLanguage] = useState<'Français' | 'English'>('Français');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Live Toast ticker
  const [toastIndex, setToastIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setToastIndex((prev) => (prev + 1) % RECENT_WITHDRAWALS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentToast = RECENT_WITHDRAWALS[toastIndex];

  // Clean error when switching modes
  const handleSwitchMode = (newMode: 'register' | 'login') => {
    setAuthMode(newMode);
    setError(null);
    setSuccessNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanDigits = phoneNumber.trim().replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 6) {
      setError(language === 'Français' ? 'Veuillez saisir un numéro de téléphone valide (au moins 6 chiffres).' : 'Please enter a valid phone number.');
      return;
    }

    if (!password || password.length < 4) {
      setError(language === 'Français' ? 'Le mot de passe doit comporter au moins 4 caractères.' : 'Password must be at least 4 characters.');
      return;
    }

    const fullPhoneFormatted = `${selectedCountryCode} ${cleanDigits}`;
    const cleanPhoneNoSpace = `${selectedCountryCode}${cleanDigits}`.replace(/\s+/g, '');

    // FLOW 1: INSCRIPTION (Création de compte uniquement)
    if (authMode === 'register') {
      if (password !== confirmPassword) {
        setError(language === 'Français' ? 'Les deux mots de passe ne correspondent pas.' : 'Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const result = await authRegisterUser({
          phoneNumber: fullPhoneFormatted,
          password,
          fullName: fullName.trim() || `Membre ${cleanDigits.slice(-4)}`,
          email: `${cleanDigits}@aurainvest.com`,
          referralCode: generateReferralCode(),
          referredBy: inviteCode.trim() || undefined
        });

        if (!result.success) {
          setError(result.error || 'Erreur lors de la création du compte. Vérifiez vos informations.');
          setLoading(false);
          return;
        }

        setSuccessNotice('Compte créé avec succès ! Bonus d\'inscription de 100 F CFA crédité.');
        
        setTimeout(() => {
          setLoading(false);
          const u = result.user || {};
          onLoginSuccess(
            u.email || `${cleanDigits}@aurainvest.com`,
            u.full_name || fullName.trim() || `Membre ${cleanDigits.slice(-4)}`,
            inviteCode.trim() || undefined,
            u.is_admin ? 'admin' : 'user',
            fullPhoneFormatted,
            password,
            100 // 100 FCFA welcome bonus strictly on register
          );
        }, 600);
      } catch (err: any) {
        setError(err.message || 'Erreur réseau lors de l\'inscription.');
        setLoading(false);
      }
      return;
    }

    // FLOW 2: CONNEXION (Authentification des utilisateurs existants uniquement)
    if (authMode === 'login') {
      setLoading(true);
      try {
        const result = await authLoginUser({
          phoneNumber: fullPhoneFormatted,
          password
        });

        if (!result.success) {
          setError(result.error || 'Identifiants incorrects ou compte inexistant.');
          setLoading(false);
          return;
        }

        const u = result.user || {};
        const isAdmin = Boolean(result.isAdmin || u.is_admin);

        setTimeout(() => {
          setLoading(false);
          onLoginSuccess(
            u.email || `${cleanDigits}@aurainvest.com`,
            u.full_name || (isAdmin ? 'Administrateur Général Aura' : `Membre ${cleanDigits.slice(-4)}`),
            undefined,
            isAdmin ? 'admin' : 'user',
            fullPhoneFormatted,
            password,
            result.balance !== undefined ? Number(result.balance) : undefined
          );
        }, 500);
      } catch (err: any) {
        setError(err.message || 'Erreur de connexion.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 font-sans selection:bg-emerald-500/30 text-left text-zinc-100 overflow-x-hidden">
      <UserBackground />
      {/* Container card */}
      <div className="w-full max-w-[430px] bg-zinc-900 sm:rounded-[36px] overflow-hidden flex flex-col relative sm:shadow-2xl sm:border sm:border-zinc-800">
        
        {/* Top Banner section */}
        <div className="p-3.5 sm:p-4 pb-2">
          <div className="relative rounded-[24px] overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-lg min-h-[160px] flex flex-col justify-between p-4.5 border border-emerald-500/30">
            
            {/* Banner background graphic visual */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-end justify-end pointer-events-none opacity-15 overflow-hidden">
              <div className="relative w-full h-full flex items-end justify-end">
                <Shield className="w-36 h-36 text-white" />
              </div>
            </div>

            {/* Floating Live Withdrawal Notification */}
            <div className="absolute top-2.5 right-2.5 left-auto z-20 max-w-[240px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentToast.phone}
                  initial={{ opacity: 0, y: -10, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.92 }}
                  transition={{ duration: 0.35 }}
                  className="bg-zinc-950/90 backdrop-blur-md rounded-2xl p-2 px-3 shadow-xl border border-zinc-800 text-left"
                >
                  <p className="text-[11px] font-bold text-zinc-200 font-sans tracking-tight">
                    {currentToast.phone}
                  </p>
                  <p className="text-[10px] font-semibold text-zinc-300 leading-tight mt-0.5">
                    Retrait de <span className="font-bold text-emerald-400">{currentToast.amount}</span> validé !
                  </p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">
                    Il y a {currentToast.seconds} secondes.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Left Content Banner */}
            <div className="relative z-10 max-w-[65%] space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-300 shadow-sm shadow-emerald-300/50"></span>
                <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">Aura Invest</span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-[1.15] tracking-tight">
                  Investissement <br />
                  <span className="text-emerald-200">Rentable 24h</span>
                </h1>
              </div>

              <div className="inline-block bg-black/30 backdrop-blur-md text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-lg tracking-wide border border-emerald-500/20">
                Bonus offert : 100 F CFA
              </div>

              <div className="flex items-center gap-1 text-[9px] font-medium text-emerald-100 pt-0.5">
                <span>⚡</span>
                <span>Rendement journalier</span>
                <span className="text-emerald-300">•</span>
                <span>Retraits 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dark Card Content */}
        <div className="bg-zinc-900 p-6 sm:p-7 flex-1 flex flex-col justify-between relative z-10 text-left">
          
          {/* Top Tabs: Clearly Separate Inscription vs Connexion */}
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between gap-2">
              {/* Distinctive Pill Tabs for Registration vs Login */}
              <div className="flex items-center bg-zinc-950/80 p-1 rounded-2xl w-full max-w-[280px] border border-zinc-800">
                <button
                  type="button"
                  id="tab-btn-register"
                  onClick={() => handleSwitchMode('register')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'register'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>INSCRIPTION</span>
                </button>
                <button
                  type="button"
                  id="tab-btn-login"
                  onClick={() => handleSwitchMode('login')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'login'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>CONNEXION</span>
                </button>
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-zinc-100 py-1.5 px-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer"
                >
                  <span>{language}</span>
                  <span className="text-[10px] text-zinc-500">▼</span>
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 py-1 z-30">
                    <button
                      type="button"
                      onClick={() => { setLanguage('Français'); setIsLangDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 flex items-center justify-between"
                    >
                      <span>Français</span>
                      {language === 'Français' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLanguage('English'); setIsLangDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 flex items-center justify-between"
                    >
                      <span>English</span>
                      {language === 'English' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mode Description Subtitle */}
            <div className="border-b border-zinc-800/80 pb-2">
              <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-tight">
                {authMode === 'register' ? 'Créer un nouveau compte' : 'Accès investisseur'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {authMode === 'register'
                  ? 'Inscrivez-vous et recevez immédiatement 100 FCFA de prime de bienvenue.'
                  : 'Saisissez vos identifiants pour accéder à votre solde et vos produits.'}
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-semibold flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
              {authMode === 'login' && (error.includes('existe pas') || error.includes('inscrire')) && (
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className="self-start text-[11px] font-bold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 rounded-xl transition shadow-sm cursor-pointer mt-0.5"
                >
                  → Créer un compte (Inscription)
                </button>
              )}
              {authMode === 'register' && (error.includes('déjà enregistré') || error.includes('connecter')) && (
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="self-start text-[11px] font-bold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 rounded-xl transition shadow-sm cursor-pointer mt-0.5"
                >
                  → Se connecter à votre compte
                </button>
              )}
            </div>
          )}

          {successNotice && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Dedicated Forms */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* 1. Phone Number Input with Country Code */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                Numéro de téléphone
              </label>
              <div className="flex items-center bg-zinc-950/80 hover:bg-zinc-950 focus-within:bg-zinc-950 rounded-2xl h-[52px] px-3.5 border border-zinc-800 focus-within:border-emerald-500/80 transition-all">
                
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-emerald-400">
                  <Smartphone className="w-5 h-5 stroke-[2.5]" />
                </div>

                {/* Country Code Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="flex items-center gap-1 text-sm font-bold text-zinc-200 pl-1 pr-2 py-1 hover:text-emerald-400 transition cursor-pointer"
                  >
                    <span>{selectedCountryCode}</span>
                  </button>

                  {isCountryDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-48 max-h-56 overflow-y-auto bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 py-1.5 z-40">
                      {COUNTRY_CODES.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountryCode(item.code);
                            setIsCountryDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span>{item.flag}</span>
                            <span>{item.country}</span>
                          </span>
                          <span className="font-bold text-zinc-400">{item.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-5 w-[1px] bg-zinc-800 mr-2"></div>

                {/* Phone Number Input */}
                <input
                  type="tel"
                  id="auth-phone-input"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="ex: 90 12 34 56"
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Full Name / Pseudo (Registration Only) */}
            {authMode === 'register' && (
              <div className="relative">
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                  Nom complet ou Pseudo
                </label>
                <div className="flex items-center bg-zinc-950/80 hover:bg-zinc-950 focus-within:bg-zinc-950 rounded-2xl h-[52px] px-3.5 border border-zinc-800 focus-within:border-emerald-500/80 transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-emerald-400">
                    <UserIcon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    id="auth-fullname-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ex: Jean Dupont"
                    className="flex-1 bg-transparent text-sm font-semibold text-zinc-100 placeholder-zinc-500 focus:outline-none pl-2"
                  />
                </div>
              </div>
            )}

            {/* 3. Password Input */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                Mot de passe
              </label>
              <div className="flex items-center bg-zinc-950/80 hover:bg-zinc-950 focus-within:bg-zinc-950 rounded-2xl h-[52px] px-3.5 border border-zinc-800 focus-within:border-emerald-500/80 transition-all">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-emerald-400">
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === 'register' ? 'Au moins 4 caractères' : 'Votre mot de passe'}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-100 placeholder-zinc-500 focus:outline-none pl-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4. Confirm Password (Registration Only) */}
            {authMode === 'register' && (
              <div className="relative">
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="flex items-center bg-zinc-950/80 hover:bg-zinc-950 focus-within:bg-zinc-950 rounded-2xl h-[52px] px-3.5 border border-zinc-800 focus-within:border-emerald-500/80 transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-emerald-400">
                    <Lock className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="auth-confirm-password-input"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez le mot de passe"
                    className="flex-1 bg-transparent text-sm font-semibold text-zinc-100 placeholder-zinc-500 focus:outline-none pl-2"
                  />
                </div>
              </div>
            )}

            {/* 5. Referral / Invitation Code (Registration Only) */}
            {authMode === 'register' && (
              <div className="relative">
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                  Code d'invitation (Optionnel)
                </label>
                <div className="flex items-center bg-zinc-950/80 hover:bg-zinc-950 focus-within:bg-zinc-950 rounded-2xl h-[52px] px-3.5 border border-zinc-800 focus-within:border-emerald-500/80 transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-emerald-400">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <Gift className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                  <input
                    type="text"
                    id="auth-invite-input"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="ex: 6281499"
                    className="flex-1 bg-transparent text-sm font-bold font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none pl-2"
                  />
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                id="btn-auth-submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-black text-base tracking-wide h-[52px] rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin"></div>
                ) : (
                  <span>{authMode === 'register' ? 'CRÉER MON COMPTE' : 'SE CONNECTER'}</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Toggle Section */}
          <div className="mt-6 text-center space-y-2.5">
            <p className="text-xs text-zinc-400 font-medium">
              {authMode === 'register' 
                ? "Vous possédez déjà un compte ?"
                : "Vous n'avez pas encore de compte ?"}
            </p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => handleSwitchMode(authMode === 'register' ? 'login' : 'register')}
                id="btn-toggle-auth-view"
                className="bg-zinc-950/80 hover:bg-zinc-800 text-zinc-200 text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-2 border border-zinc-800 transition-all cursor-pointer"
              >
                <span>{authMode === 'register' ? 'Se connecter à mon compte' : "Créer un compte (+100 FCFA)"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Customer Service Floating Widget */}
          <div className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-4 z-30">
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              title="Service Client"
              className="relative group cursor-pointer transition-transform hover:scale-105"
            >
              <div className="w-13 h-13 rounded-full bg-emerald-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center relative text-zinc-950">
                <Headphones className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-300 border-2 border-zinc-900"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Service Modal */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-left space-y-4 border border-zinc-800 text-zinc-100"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">Assistance Client 24/7</h3>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Service Actif
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Une question sur la création de compte, la connexion ou la prime de 100 FCFA ? Contactez directement nos conseillers.
              </p>

              <div className="space-y-2">
                <a
                  href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-2xl text-xs font-black transition shadow-lg shadow-emerald-500/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chaîne Officielle WhatsApp
                </a>
                <a
                  href="https://t.me/AuraInvestOfficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-3 bg-sky-500 hover:bg-sky-400 text-zinc-950 rounded-2xl text-xs font-black transition shadow-lg shadow-sky-500/20"
                >
                  <PhoneCall className="w-4 h-4" />
                  Canal Telegram Officiel
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
