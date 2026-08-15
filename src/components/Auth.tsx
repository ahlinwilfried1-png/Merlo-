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
  { code: '+237', country: 'Cameroun', flag: '🇨🇲' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
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
          referralCode: `AURA-${Math.floor(1000 + Math.random() * 9000)}`,
          referredBy: inviteCode.trim() || undefined
        });

        if (!result.success) {
          setError(result.error || 'Erreur lors de la création du compte. Vérifiez vos informations.');
          setLoading(false);
          return;
        }

        setSuccessNotice('Compte créé avec succès ! Bonus d\'inscription de 2 000 FCFA crédité.');
        
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
            2000 // 2000 FCFA welcome bonus strictly on register
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
    <div className="min-h-screen bg-[#ff0000] flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 font-sans selection:bg-red-200 text-left">
      {/* Container card replicating the exact screenshot aesthetic */}
      <div className="w-full max-w-[430px] bg-[#ff0000] sm:rounded-[36px] overflow-hidden flex flex-col relative sm:shadow-2xl">
        
        {/* Top Banner section */}
        <div className="p-3.5 sm:p-4 pb-2">
          <div className="relative rounded-[22px] overflow-hidden bg-gradient-to-r from-[#e8ecdd] via-[#dce6d2] to-[#c6d7ba] border border-amber-200/40 shadow-md min-h-[165px] flex flex-col justify-between p-4">
            
            {/* Banner background graphic visual */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-end justify-end pointer-events-none opacity-90 overflow-hidden">
              <div className="relative w-full h-full flex items-end justify-end">
                <svg viewBox="0 0 200 160" className="w-full h-full object-cover">
                  <defs>
                    <linearGradient id="gradPerson" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e5128" />
                      <stop offset="100%" stopColor="#09250f" />
                    </linearGradient>
                    <linearGradient id="gradShirt2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                  <circle cx="140" cy="90" r="65" fill="#fef08a" opacity="0.35" />
                  
                  {/* Person 1 */}
                  <g transform="translate(45, 20)">
                    <circle cx="35" cy="25" r="16" fill="#854d0e" />
                    <path d="M 15 50 Q 35 40 55 50 L 60 140 L 10 140 Z" fill="url(#gradShirt2)" />
                    <rect x="25" y="45" width="22" height="38" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
                    <rect x="28" y="49" width="16" height="28" rx="2" fill="#22c55e" />
                    <circle cx="36" cy="80" r="1.5" fill="#ffffff" />
                  </g>

                  {/* Person 2 */}
                  <g transform="translate(100, 10)">
                    <circle cx="45" cy="25" r="18" fill="#78350f" />
                    <path d="M 20 52 Q 45 42 70 52 L 80 150 L 10 150 Z" fill="url(#gradPerson)" />
                    <g transform="translate(18, 25) rotate(-15)">
                      <rect x="0" y="0" width="30" height="18" rx="2" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
                      <circle cx="15" cy="9" r="4" fill="#60a5fa" />
                      <text x="7" y="12" fontSize="6" fontWeight="bold" fill="#ffffff">CFA</text>
                    </g>
                    <g transform="translate(25, 20) rotate(10)">
                      <rect x="0" y="0" width="32" height="18" rx="2" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
                      <circle cx="16" cy="9" r="4" fill="#fef08a" />
                      <text x="6" y="12" fontSize="6" fontWeight="bold" fill="#713f12">2000</text>
                    </g>
                    <circle cx="68" cy="42" r="6" fill="#78350f" />
                    <path d="M 68 36 L 70 42 L 66 42 Z" fill="#78350f" />
                  </g>
                </svg>
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
                  className="bg-white/95 backdrop-blur-md rounded-2xl p-2 px-3 shadow-xl border border-zinc-200/80 text-left"
                >
                  <p className="text-[11px] font-bold text-zinc-900 font-sans tracking-tight">
                    {currentToast.phone}
                  </p>
                  <p className="text-[10px] font-semibold text-zinc-800 leading-tight mt-0.5">
                    Retrait de <span className="font-extrabold text-black">{currentToast.amount}</span> validé !
                  </p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">
                    Il y a {currentToast.seconds} secondes.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Left Content Banner */}
            <div className="relative z-10 max-w-[58%] space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-2.5 rounded-sm bg-gradient-to-r from-green-600 via-red-600 to-yellow-400"></span>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Aura Invest</span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#044e1c] leading-[1.15] tracking-tight">
                  Investissement <br />
                  <span className="text-[#c41313]">Automobile 24h</span>
                </h1>
              </div>

              <div className="inline-block bg-[#084b1d] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md tracking-wide shadow-sm">
                Bonus offert : 2 000 F CFA
              </div>

              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-950 pt-0.5">
                <span className="text-emerald-700">⚡</span>
                <span>Rendement journalier</span>
                <span className="text-zinc-400">•</span>
                <span>Retraits 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main White Card Content */}
        <div className="bg-white rounded-t-[32px] sm:rounded-b-[32px] p-6 sm:p-7 shadow-2xl flex-1 flex flex-col justify-between relative z-10 text-left">
          
          {/* Top Tabs: Clearly Separate Inscription vs Connexion */}
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
              {/* Distinctive Pill Tabs for Registration vs Login */}
              <div className="flex items-center bg-zinc-100 p-1 rounded-2xl w-full max-w-[280px]">
                <button
                  type="button"
                  id="tab-btn-register"
                  onClick={() => handleSwitchMode('register')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'register'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span>INSCRIPTION</span>
                </button>
                <button
                  type="button"
                  id="tab-btn-login"
                  onClick={() => handleSwitchMode('login')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'login'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-zinc-600 hover:text-zinc-900'
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
                  className="flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-black py-1.5 px-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition cursor-pointer"
                >
                  <span>{language}</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-zinc-200 py-1 z-30">
                    <button
                      type="button"
                      onClick={() => { setLanguage('Français'); setIsLangDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 flex items-center justify-between"
                    >
                      <span>Français</span>
                      {language === 'Français' && <Check className="w-3.5 h-3.5 text-red-600" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLanguage('English'); setIsLangDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 flex items-center justify-between"
                    >
                      <span>English</span>
                      {language === 'English' && <Check className="w-3.5 h-3.5 text-red-600" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mode Description Subtitle */}
            <div className="border-b border-zinc-100 pb-2">
              <h2 className="text-lg font-black text-zinc-900 uppercase">
                {authMode === 'register' ? 'Créer un nouveau compte' : 'Accès investisseur'}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {authMode === 'register'
                  ? 'Inscrivez-vous et recevez immédiatement 2 000 FCFA de prime de bienvenue.'
                  : 'Saisissez vos identifiants pour accéder à votre solde et vos véhicules.'}
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Dedicated Forms */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* 1. Phone Number Input with Country Code */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                Numéro de téléphone
              </label>
              <div className="flex items-center bg-[#f0f2f5] hover:bg-[#e9ecf0] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 rounded-2xl h-[52px] px-3.5 border border-transparent focus-within:border-red-500 transition-all">
                
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-red-600">
                  <Smartphone className="w-5 h-5 stroke-[2.5]" />
                </div>

                {/* Country Code Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="flex items-center gap-1 text-sm font-bold text-zinc-800 pl-1 pr-2 py-1 hover:text-red-600 transition cursor-pointer"
                  >
                    <span>{selectedCountryCode}</span>
                  </button>

                  {isCountryDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-48 max-h-56 overflow-y-auto bg-white rounded-xl shadow-2xl border border-zinc-200 py-1.5 z-40">
                      {COUNTRY_CODES.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountryCode(item.code);
                            setIsCountryDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-red-50 flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span>{item.flag}</span>
                            <span>{item.country}</span>
                          </span>
                          <span className="font-bold text-zinc-500">{item.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-5 w-[1px] bg-zinc-300 mr-2"></div>

                {/* Phone Number Input */}
                <input
                  type="tel"
                  id="auth-phone-input"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={selectedCountryCode === '+228' ? 'ex: 90 12 34 56' : selectedCountryCode === '+237' ? 'ex: 670 12 34 56' : 'ex: 76 12 34 56'}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Full Name / Pseudo (Registration Only) */}
            {authMode === 'register' && (
              <div className="relative">
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                  Nom complet ou Pseudo
                </label>
                <div className="flex items-center bg-[#f0f2f5] hover:bg-[#e9ecf0] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 rounded-2xl h-[52px] px-3.5 border border-transparent focus-within:border-red-500 transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-red-600">
                    <UserIcon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    id="auth-fullname-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ex: Jean Dupont"
                    className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none pl-2"
                  />
                </div>
              </div>
            )}

            {/* 3. Password Input */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                Mot de passe
              </label>
              <div className="flex items-center bg-[#f0f2f5] hover:bg-[#e9ecf0] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 rounded-2xl h-[52px] px-3.5 border border-transparent focus-within:border-red-500 transition-all">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-red-600">
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === 'register' ? 'Au moins 4 caractères' : 'Votre mot de passe'}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none pl-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4. Confirm Password (Registration Only) */}
            {authMode === 'register' && (
              <div className="relative">
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="flex items-center bg-[#f0f2f5] hover:bg-[#e9ecf0] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 rounded-2xl h-[52px] px-3.5 border border-transparent focus-within:border-red-500 transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-red-600">
                    <Lock className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="auth-confirm-password-input"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez le mot de passe"
                    className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none pl-2"
                  />
                </div>
              </div>
            )}

            {/* 5. Referral / Invitation Code (Registration Only) */}
            {authMode === 'register' && (
              <div className="relative">
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                  Code d'invitation (Optionnel)
                </label>
                <div className="flex items-center bg-[#f0f2f5] hover:bg-[#e9ecf0] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 rounded-2xl h-[52px] px-3.5 border border-transparent focus-within:border-red-500 transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-amber-500">
                    <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-500/40 flex items-center justify-center">
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                  </div>
                  <input
                    type="text"
                    id="auth-invite-input"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="ex: 6281499"
                    className="flex-1 bg-transparent text-sm font-bold font-mono text-zinc-900 placeholder-zinc-500 focus:outline-none pl-2"
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
                className="w-full bg-[#ff0000] hover:bg-[#e60000] active:scale-[0.99] text-white font-extrabold text-base tracking-wide h-[52px] rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>{authMode === 'register' ? 'CRÉER MON COMPTE' : 'SE CONNECTER'}</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Toggle Section */}
          <div className="mt-6 text-center space-y-2.5">
            <p className="text-xs text-zinc-600 font-medium">
              {authMode === 'register' 
                ? "Vous possédez déjà un compte ?"
                : "Vous n'avez pas encore de compte ?"}
            </p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => handleSwitchMode(authMode === 'register' ? 'login' : 'register')}
                id="btn-toggle-auth-view"
                className="bg-[#1d64c2] hover:bg-[#1752a0] text-white text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{authMode === 'register' ? 'Se connecter à mon compte' : "Créer un compte (+2 000 FCFA)"}</span>
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
              <div className="w-15 h-15 rounded-full bg-gradient-to-tr from-sky-900 to-blue-600 p-0.5 shadow-xl flex items-center justify-center relative">
                <div className="w-full h-full rounded-full border-2 border-dashed border-white/80 flex items-center justify-center bg-blue-900/90 overflow-hidden">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[7px] font-black uppercase tracking-tighter text-sky-200">AURA</span>
                    <Headphones className="w-5 h-5 text-white my-0.5" />
                    <span className="text-[7px] font-black uppercase tracking-tighter text-sky-200">SUPPORT</span>
                  </div>
                </div>
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Service Modal */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Assistance Client 24/7</h3>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Service Actif
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Une question sur la création de compte, la connexion ou la prime de 2 000 FCFA ? Contactez directement nos conseillers.
              </p>

              <div className="space-y-2">
                <a
                  href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chaîne Officielle WhatsApp
                </a>
                <a
                  href="https://t.me/AuraInvestOfficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold transition shadow-md"
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
