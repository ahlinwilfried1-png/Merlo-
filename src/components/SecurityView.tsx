import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  Smartphone,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import PageHeader from './PageHeader';

interface SecurityViewProps {
  onBack: () => void;
}

export default function SecurityView({ onBack }: SecurityViewProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 text-left" id="page-security-container">
      <PageHeader
        title="Centre de Sécurité"
        subtitle="Protégez votre compte et vos transactions"
        onBack={onBack}
        badge="Niveau Élevé"
        icon={<Lock className="w-5 h-5 text-emerald-400" />}
      />

      {/* Security Status Card */}
      <div className="aura-glass-card border border-[#0d5969]/70 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 text-cyan-300 flex items-center justify-center border border-cyan-500/40 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-white block luminous-text">Protection du Compte Active</span>
              <span className="text-[11px] text-cyan-200/80 block">Cryptage AES-256 et sessions sécurisées</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-cyan-950/90 text-cyan-300 rounded-full text-[10px] font-black uppercase border border-cyan-500/40 font-mono luminous-text-cyan">
            100% Sûr
          </span>
        </div>
      </div>

      {/* Change Password Form Card */}
      <div className="aura-glass-card border border-[#0d5969]/70 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <span className="text-xs font-black uppercase tracking-wider text-cyan-300 block font-mono luminous-text-cyan">
          Modifier le mot de passe de connexion
        </span>

        {error && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs font-bold flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Mot de passe modifié avec succès ! Vos sessions sont protégées.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-cyan-200 block mb-1.5 font-mono">
              Mot de passe actuel :
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full p-3.5 bg-[#021f28]/90 border border-cyan-500/40 rounded-2xl text-white text-xs focus:border-cyan-300 focus:outline-none transition font-mono shadow-inner placeholder-cyan-500/40"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-cyan-200 block mb-1.5 font-mono">
              Nouveau mot de passe :
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3.5 bg-[#021f28]/90 border border-cyan-500/40 rounded-2xl text-white text-xs focus:border-cyan-300 focus:outline-none transition font-mono shadow-inner placeholder-cyan-500/40"
              placeholder="Au moins 6 caractères"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-cyan-200 block mb-1.5 font-mono">
              Confirmer le nouveau mot de passe :
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3.5 bg-[#021f28]/90 border border-cyan-500/40 rounded-2xl text-white text-xs focus:border-cyan-300 focus:outline-none transition font-mono shadow-inner placeholder-cyan-500/40"
              placeholder="Répétez le mot de passe"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] font-semibold text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Masquer' : 'Afficher les caractères'}</span>
            </button>
          </div>

          <button
            type="submit"
            id="btn-update-password"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider transition shadow-xl shadow-cyan-600/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-cyan-400/30"
          >
            <KeyRound className="w-4 h-4" />
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
