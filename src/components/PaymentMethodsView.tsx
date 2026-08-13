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
  const [phoneNumber, setPhoneNumber] = useState('+237 670 12 34 56');
  const [accountOwner, setAccountOwner] = useState('Wilfried N.');
  const [saved, setSaved] = useState(false);

  const [savedAccounts, setSavedAccounts] = useState([
    { id: '1', label: 'Compte principal (Cameroun MTN)', number: '+237 670 12 34 56', name: 'Wilfried N.', isDefault: true },
    { id: '2', label: 'Compte secondaire (Togo T-Money)', number: '+228 90 12 34 56', name: 'Wilfried N.', isDefault: false }
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
    <div className="max-w-xl mx-auto space-y-4 text-left text-white" id="page-payment-methods-container">
      <PageHeader
        title="Coordonnées de Retrait"
        subtitle="Gérez vos numéros et comptes de réception (Cameroun, Togo, Burkina Faso)"
        onBack={onBack}
        badge="Sécurisé"
        icon={<Wallet className="w-5 h-5 text-[#22c55e]" />}
      />

      {/* Existing saved accounts */}
      <div className="bg-zinc-900 rounded-3xl p-5 sm:p-6 space-y-4 text-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono">
            Comptes enregistrés ({savedAccounts.length})
          </span>
          <span className="text-[11px] text-[#22c55e] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-bit SSL
          </span>
        </div>

        <div className="space-y-2.5">
          {savedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-2xl bg-zinc-950 flex items-center justify-between gap-3 text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{acc.label}</span>
                    {acc.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-[9px] font-black uppercase">
                        Principal
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-zinc-400 block">{acc.number}</span>
                  <span className="text-[10px] text-zinc-500 block">{acc.name}</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(acc.id)}
                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 flex items-center justify-center transition cursor-pointer"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add new account form */}
      <div className="bg-zinc-900 rounded-3xl p-5 sm:p-6 space-y-4 text-white">
        <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block font-mono">
          Ajouter un compte de réception
        </span>

        {saved && (
          <div className="p-3 rounded-2xl bg-[#22c55e]/15 text-[#22c55e] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
            Nouveau compte enregistré avec succès !
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Numéro de téléphone / Compte :
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full p-3 bg-zinc-950 rounded-2xl font-mono text-white text-xs focus:outline-none"
              placeholder="+237 670 00 00 00, +228 ..., +226 ..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Nom complet du titulaire :
            </label>
            <input
              type="text"
              value={accountOwner}
              onChange={(e) => setAccountOwner(e.target.value)}
              required
              className="w-full p-3 bg-zinc-950 rounded-2xl text-white text-xs focus:outline-none"
              placeholder="Nom et prénoms réels"
            />
          </div>

          <button
            type="submit"
            id="btn-save-payment-account"
            className="w-full py-3.5 rounded-2xl bg-[#22c55e] hover:bg-[#1eb852] text-black font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Enregistrer ce compte
          </button>
        </form>
      </div>
    </div>
  );
}
