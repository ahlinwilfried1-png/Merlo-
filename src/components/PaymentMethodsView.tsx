import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  Trash2,
  Wallet,
  UserCheck
} from 'lucide-react';
import PageHeader from './PageHeader';

interface PaymentMethodsViewProps {
  onBack: () => void;
}

export default function PaymentMethodsView({ onBack }: PaymentMethodsViewProps) {
  const [phoneNumber, setPhoneNumber] = useState('+228 90 12 34 56');
  const [accountOwner, setAccountOwner] = useState('Wilfried N.');
  const [saved, setSaved] = useState(false);

  const [savedAccounts, setSavedAccounts] = useState([
    { id: '1', label: 'Compte principal (T-Money Togo)', number: '+228 90 12 34 56', name: 'Wilfried N.', isDefault: true },
    { id: '2', label: 'Compte secondaire (Flooz Moov Togo)', number: '+228 98 76 54 32', name: 'Wilfried N.', isDefault: false }
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newAcc = {
      id: Date.now().toString(),
      label: `Compte de retrait ${savedAccounts.length + 1}`,
      number: phoneNumber,
      name: accountOwner,
      isDefault: savedAccounts.length === 0
    };
    setSavedAccounts([...savedAccounts, newAcc]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = (id: string) => {
    setSavedAccounts(savedAccounts.filter(a => a.id !== id));
  };

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-cyan-50" id="page-payment-methods-container">
      <PageHeader
        title="Coordonnées de Retrait"
        subtitle="Gérez vos numéros et comptes de réception Togo (+228 - T-Money, Flooz)"
        onBack={onBack}
        badge="Sécurisé"
        icon={<Wallet className="w-5 h-5 text-cyan-400" />}
      />

      {/* Existing saved accounts */}
      <div className="aura-glass-card border border-[#0d5969]/70 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-300 font-mono luminous-text-cyan">
            Comptes enregistrés ({savedAccounts.length})
          </span>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 font-mono luminous-text-emerald">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-bit SSL
          </span>
        </div>

        <div className="space-y-2.5">
          {savedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-2xl bg-[#02242e]/80 border border-[#0a4652]/70 flex items-center justify-between gap-3 text-cyan-50 shadow-inner"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/90 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white luminous-text-soft">{acc.label}</span>
                    {acc.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase font-mono luminous-text-emerald">
                        Principal
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-cyan-200 block">{acc.number}</span>
                  <span className="text-[10px] text-cyan-300/80 block">{acc.name}</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(acc.id)}
                className="w-8 h-8 rounded-xl bg-cyan-950/80 hover:bg-rose-950/90 hover:text-rose-300 text-cyan-400/80 border border-cyan-500/20 hover:border-rose-500/40 flex items-center justify-center transition cursor-pointer"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add new account form */}
      <div className="aura-glass-card border border-[#0d5969]/70 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
        <span className="text-xs font-black uppercase tracking-wider text-cyan-300 block font-mono luminous-text-cyan">
          Ajouter un compte de réception
        </span>

        {saved && (
          <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Nouveau compte enregistré avec succès !
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-cyan-200 block mb-1.5">
              Numéro de téléphone / Compte :
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full p-3.5 bg-[#02222b] border border-[#094754] rounded-2xl font-mono text-white text-xs focus:outline-none focus:border-cyan-400 transition"
              placeholder="+228 90 00 00 00, +228 70 00 00 00"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-cyan-200 block mb-1.5">
              Nom complet du titulaire :
            </label>
            <input
              type="text"
              value={accountOwner}
              onChange={(e) => setAccountOwner(e.target.value)}
              required
              className="w-full p-3.5 bg-[#02222b] border border-[#094754] rounded-2xl text-white text-xs focus:outline-none focus:border-cyan-400 transition"
              placeholder="Nom et prénoms réels"
            />
          </div>

          <button
            type="submit"
            id="btn-save-payment-account"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-wider transition shadow-xl shadow-cyan-600/30 cursor-pointer flex items-center justify-center gap-2 border border-cyan-400/30"
          >
            <Plus className="w-4 h-4" />
            Enregistrer ce compte
          </button>
        </form>
      </div>
    </div>
  );
}


