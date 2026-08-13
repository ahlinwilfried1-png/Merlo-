import React, { useState, useEffect } from 'react';
import { Smartphone, Lock, Gift, ArrowRight, Check, Headphones, Globe, Shield, Sparkles, X, MessageSquare, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  onLoginSuccess: (email: string, fullName: string, referrerCode?: string, role?: 'admin' | 'user') => void;
}

const COUNTRY_CODES = [
  { code: '+237', country: 'Cameroun', flag: '🇨🇲' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
];

const RECENT_WITHDRAWALS = [
  { phone: '@65****609', amount: '35,600', seconds: '210' },
  { phone: '@69****842', amount: '50,000', seconds: '145' },
  { phone: '@67****113', amount: '120,000', seconds: '320' },
  { phone: '@07****584', amount: '25,000', seconds: '85' },
  { phone: '@68****905', amount: '75,400', seconds: '190' },
];

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isRegister, setIsRegister] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return !!(urlParams.get('ref') || urlParams.get('invite'));
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState('+237');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref') || urlParams.get('invite') || '6281499';
  });

  const [language, setLanguage] = useState<'Français' | 'English'>('Français');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const [error, setError] = useState('');
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

  // Quick Admin fill
  const handleAdminQuickFill = () => {
    setIsRegister(false);
    setSelectedCountryCode('+237');
    setPhoneNumber('699000000');
    setPassword('admin2026');
    setError('');
  };

  // Quick User fill
  const handleUserQuickFill = () => {
    setIsRegister(false);
    setSelectedCountryCode('+237');
    setPhoneNumber('655123456');
    setPassword('demo1234');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      setError(language === 'Français' ? 'Veuillez saisir votre numéro de téléphone.' : 'Please enter your phone number.');
      return;
    }

    if (!password) {
      setError(language === 'Français' ? 'Veuillez renseigner votre mot de passe.' : 'Please enter your password.');
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setError(language === 'Français' ? 'Les deux mots de passe ne correspondent pas.' : 'Passwords do not match.');
        return;
      }
      if (password.length < 4) {
        setError(language === 'Français' ? 'Le mot de passe doit comporter au moins 4 caractères.' : 'Password must be at least 4 characters.');
        return;
      }
    }

    setLoading(true);

    const fullFormattedPhone = `${selectedCountryCode} ${cleanPhone}`;
    const isAdmin = cleanPhone.toLowerCase().includes('admin') || password === 'admin2026' || cleanPhone === '699000000';

    setTimeout(() => {
      setLoading(false);
      const displayName = isAdmin 
        ? 'Administrateur Général Aura' 
        : `Membre ${selectedCountryCode}${cleanPhone.slice(-4)}`;
      
      const emailGenerated = `${cleanPhone}@aurainvest.com`;

      onLoginSuccess(
        emailGenerated,
        displayName,
        isRegister ? inviteCode : undefined,
        isAdmin ? 'admin' : 'user'
      );
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#ff0000] flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 font-sans selection:bg-red-200">
      {/* Container card replicating the exact screenshot */}
      <div className="w-full max-w-[430px] bg-[#ff0000] sm:rounded-[36px] overflow-hidden flex flex-col relative sm:shadow-2xl">
        
        {/* Top Banner section */}
        <div className="p-3.5 sm:p-4 pb-2">
          <div className="relative rounded-[22px] overflow-hidden bg-gradient-to-r from-[#e8ecdd] via-[#dce6d2] to-[#c6d7ba] border border-amber-200/40 shadow-md min-h-[170px] flex flex-col justify-between p-4">
            
            {/* Banner background decorative patterns & visual */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-end justify-end pointer-events-none opacity-90 overflow-hidden">
              {/* Graphic illustration of happy people with smartphone and cash banknotes */}
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
                  {/* Background soft glow circle */}
                  <circle cx="140" cy="90" r="65" fill="#fef08a" opacity="0.35" />
                  
                  {/* Person 1 (in yellow/orange) with phone */}
                  <g transform="translate(45, 20)">
                    <circle cx="35" cy="25" r="16" fill="#854d0e" />
                    <path d="M 15 50 Q 35 40 55 50 L 60 140 L 10 140 Z" fill="url(#gradShirt2)" />
                    {/* Hand with smartphone */}
                    <rect x="25" y="45" width="22" height="38" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
                    <rect x="28" y="49" width="16" height="28" rx="2" fill="#22c55e" />
                    <circle cx="36" cy="80" r="1.5" fill="#ffffff" />
                  </g>

                  {/* Person 2 (in green shirt) holding money and thumbs up */}
                  <g transform="translate(100, 10)">
                    <circle cx="45" cy="25" r="18" fill="#78350f" />
                    <path d="M 20 52 Q 45 42 70 52 L 80 150 L 10 150 Z" fill="url(#gradPerson)" />
                    {/* Banknotes held in hand */}
                    <g transform="translate(18, 25) rotate(-15)">
                      <rect x="0" y="0" width="30" height="18" rx="2" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
                      <circle cx="15" cy="9" r="4" fill="#60a5fa" />
                      <text x="7" y="12" fontSize="6" fontWeight="bold" fill="#ffffff">CFA</text>
                    </g>
                    <g transform="translate(25, 20) rotate(10)">
                      <rect x="0" y="0" width="32" height="18" rx="2" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
                      <circle cx="16" cy="9" r="4" fill="#fef08a" />
                      <text x="6" y="12" fontSize="6" fontWeight="bold" fill="#713f12">10k</text>
                    </g>
                    {/* Thumbs up */}
                    <circle cx="68" cy="42" r="6" fill="#78350f" />
                    <path d="M 68 36 L 70 42 L 66 42 Z" fill="#78350f" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Floating Live Withdrawal Notification in top-right */}
            <div className="absolute top-2.5 right-2.5 left-auto z-20 max-w-[250px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentToast.phone}
                  initial={{ opacity: 0, y: -10, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.92 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-3.5 shadow-xl border border-zinc-200/80 text-left"
                >
                  <p className="text-xs font-bold text-zinc-900 font-sans tracking-tight">
                    {currentToast.phone}
                  </p>
                  <p className="text-[11px] font-semibold text-zinc-800 leading-tight mt-0.5">
                    Retrait de <span className="font-extrabold text-black">{currentToast.amount}</span> effectué avec succès !
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Il y a {currentToast.seconds} secondes.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Left Content Banner */}
            <div className="relative z-10 max-w-[58%] space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-2.5 rounded-sm bg-gradient-to-r from-green-600 via-red-600 to-yellow-400"></span>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Aura Pro</span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#044e1c] leading-[1.15] tracking-tight">
                  Emploi <br />
                  <span className="text-[#c41313]">à temps partiel</span>
                </h1>
              </div>

              <div className="inline-block bg-[#084b1d] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md tracking-wide shadow-sm">
                Gagnez de l'argent en ligne
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-950 pt-0.5">
                <span className="text-emerald-700">⚡</span>
                <span>Tâches simples</span>
                <span className="text-zinc-400">•</span>
                <span>Retrait rapide</span>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="inline-flex items-center gap-1.5 bg-[#084b1d] hover:bg-[#063b17] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow transition-all cursor-pointer group"
                >
                  <span>Commencez</span>
                  <div className="w-4 h-4 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center text-[10px] font-black group-hover:translate-x-0.5 transition-transform">
                    ➔
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main White Card Content (Exact replica of screenshot) */}
        <div className="bg-white rounded-t-[32px] sm:rounded-b-[32px] p-6 sm:p-7 shadow-2xl flex-1 flex flex-col justify-between relative z-10 text-left">
          
          {/* Header with Title and Language dropdown */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase font-sans">
              {isRegister ? 'REGISTRE' : 'CONNEXION'}
            </h2>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-black py-1 px-2.5 rounded-lg bg-zinc-100/80 hover:bg-zinc-200/80 transition cursor-pointer"
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

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* 1. Phone Number Input with red phone icon and Country code */}
            <div className="relative">
              <div className="flex items-center bg-[#f0f2f5] hover:bg-[#e9ecf0] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 rounded-2xl h-[54px] px-3.5 border border-transparent focus-within:border-red-500 transition-all">
                
                {/* Red Smartphone Icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-red-600">
                  <Smartphone className="w-6 h-6 stroke-[2.5]" />
                </div>

                {/* Country Code Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="flex items-center gap-1 text-sm font-bold text-zinc-800 pl-1 pr-2.5 py-1 hover:text-red-600 transition cursor-pointer"
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
                  placeholder={language === 'Français' ? 'Numéro de téléphone' : 'Phone number'}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Password Input with red lock icon */}
            <div className="relative">
              <div className="flex items-center bg-[#f0f2f5] hover:bg-[#e9ecf0] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 rounded-2xl h-[54px] px-3.5 border border-transparent focus-within:border-red-500 transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-red-600">
                  <Lock className="w-6 h-6 stroke-[2.5]" />
                </div>
                <input
                  type="password"
                  id="auth-password-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'Français' ? 'Mot de passe' : 'Password'}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none pl-2"
                />
              </div>
            </div>

            {/* 3. Confirm Password Input (Registration mode only) */}
            {isRegister && (
              <div className="relative">
                <div className="flex items-center bg-[#f0f2f5] hover:bg-[#e9ecf0] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 rounded-2xl h-[54px] px-3.5 border border-transparent focus-within:border-red-500 transition-all">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-red-600">
                    <Lock className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <input
                    type="password"
                    id="auth-confirm-password-input"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={language === 'Français' ? 'Entrez à nouveau le mot de passe' : 'Confirm your password'}
                    className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none pl-2"
                  />
                </div>
              </div>
            )}

            {/* 4. Referral / Invitation Code Input (Registration mode only) */}
            {isRegister && (
              <div className="relative">
                <div className="flex items-center bg-[#f0f2f5] hover:bg-[#e9ecf0] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 rounded-2xl h-[54px] px-3.5 border border-transparent focus-within:border-red-500 transition-all">
                  {/* Yellow/amber invitation badge icon matching screenshot */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-amber-500">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-500/40 flex items-center justify-center">
                      <Gift className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                  <input
                    type="text"
                    id="auth-invite-input"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="6281499"
                    className="flex-1 bg-transparent text-sm font-bold font-mono text-zinc-900 placeholder-zinc-500 focus:outline-none pl-2"
                  />
                </div>
              </div>
            )}

            {/* Main Red Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                id="btn-auth-submit"
                className="w-full bg-[#ff0000] hover:bg-[#e60000] active:scale-[0.99] text-white font-extrabold text-base tracking-wide h-[54px] rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>{isRegister ? 'REGISTRE' : 'CONNEXION'}</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Toggle Section matching the exact blue button from the screenshot */}
          <div className="mt-7 text-center space-y-3">
            <p className="text-xs text-zinc-600 font-medium">
              {isRegister 
                ? "Vous n'avez pas encore de compte ?"
                : "Vous avez déjà un compte ?"}
            </p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                id="btn-toggle-auth-view"
                className="bg-[#1d64c2] hover:bg-[#1752a0] text-white text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{isRegister ? 'Se connecter' : "S'inscrire"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Access Admin / Demo helpers */}
          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
            <button
              type="button"
              onClick={handleAdminQuickFill}
              className="text-zinc-500 hover:text-red-600 flex items-center gap-1 font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-red-500" />
              <span>Accès Admin</span>
            </button>

            <button
              type="button"
              onClick={handleUserQuickFill}
              className="text-zinc-500 hover:text-blue-600 font-semibold transition cursor-pointer"
            >
              <span>Test Compte Démo</span>
            </button>
          </div>

          {/* Customer Service Floating Widget on bottom right matching the screenshot */}
          <div className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-4 z-30">
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              title="Service Client"
              className="relative group cursor-pointer transition-transform hover:scale-105"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-900 to-blue-600 p-0.5 shadow-xl flex items-center justify-center relative">
                {/* Circular ring with teeth/badge effect */}
                <div className="w-full h-full rounded-full border-2 border-dashed border-white/80 flex items-center justify-center bg-blue-900/90 overflow-hidden">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[7px] font-black uppercase tracking-tighter text-sky-200">CUSTOMER</span>
                    <Headphones className="w-5 h-5 text-white my-0.5" />
                    <span className="text-[7px] font-black uppercase tracking-tighter text-sky-200">SERVICE</span>
                  </div>
                </div>
                {/* Online green indicator */}
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
                    <h3 className="text-sm font-bold text-zinc-900">Service Client 24/7</h3>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Conseiller en ligne
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
                Besoin d'aide pour votre inscription, connexion ou recharge ? Nos conseillers sont disponibles en direct.
              </p>

              <div className="space-y-2">
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contacter via WhatsApp
                </a>
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold transition shadow-md"
                >
                  <PhoneCall className="w-4 h-4" />
                  Contacter sur Telegram
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
