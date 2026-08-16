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
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Protection du Compte Active</span>
              <span className="text-[11px] text-zinc-400 block">Cryptage AES-256 et sessions sécurisées</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 rounded-full text-[10px] font-bold uppercase border border-emerald-500/20">
            100% Sûr
          </span>
        </div>
      </div>

      {/* Change Password Form Card */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block font-mono">
          Modifier le mot de passe de connexion
        </span>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Mot de passe modifié avec succès ! Vos sessions sont protégées.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Mot de passe actuel :
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white text-xs focus:border-emerald-500 focus:outline-none transition font-mono"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Nouveau mot de passe :
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white text-xs focus:border-emerald-500 focus:outline-none transition font-mono"
              placeholder="Au moins 6 caractères"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Confirmer le nouveau mot de passe :
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white text-xs focus:border-emerald-500 focus:outline-none transition font-mono"
              placeholder="Répétez le mot de passe"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Masquer' : 'Afficher les caractères'}</span>
            </button>
          </div>

          <button
            type="submit"
            id="btn-update-password"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
