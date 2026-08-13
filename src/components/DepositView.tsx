import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  CheckCircle2, 
  ArrowDownLeft, 
  Loader2, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Send,
  Info,
  ArrowRight,
  ArrowLeft,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentChannel, Transaction } from '../types';
import { formatCurrency } from '../data';
import PageHeader from './PageHeader';

interface CountryConfig {
  id: string;
  name: string;
  code: string;
  flag: string;
  phonePrefix: string;
  currency: string;
  channels: {
    id: string;
    name: string;
    accountNumber: string;
    accountName: string;
    badge?: string;
    instructions: string;
  }[];
}

const SUPPORTED_COUNTRIES: CountryConfig[] = [
  {
    id: 'cm',
    name: 'Cameroun',
    code: 'CM',
    flag: '🇨🇲',
    phonePrefix: '+237',
    currency: 'F CFA',
    channels: [
      {
        id: 'cm-mtn',
        name: 'MTN Mobile Money Cameroun',
        accountNumber: '+237 670 12 34 56',
        accountName: 'Aura Cameroun Finance',
        badge: 'Recommandé',
        instructions: '1. Composez *126# MTN MoMo Cameroun.\n2. Effectuez le transfert vers le numéro ci-dessus.\n3. Renseignez la référence de la transaction reçue par SMS.'
      },
      {
        id: 'cm-orange',
        name: 'Orange Money Cameroun',
        accountNumber: '+237 690 12 34 56',
        accountName: 'Orange Trésorerie Cameroun',
        badge: 'Instantané',
        instructions: '1. Composez #150# Orange Money Cameroun.\n2. Envoyez les fonds au numéro ci-dessus.\n3. Collez la référence SMS reçue.'
      }
    ]
  },
  {
    id: 'tg',
    name: 'Togo',
    code: 'TG',
    flag: '🇹🇬',
    phonePrefix: '+228',
    currency: 'F CFA',
    channels: [
      {
        id: 'tg-tmoney',
        name: 'T-Money Togo',
        accountNumber: '+228 90 12 34 56',
        accountName: 'Service Aura Togo',
        badge: 'Recommandé',
        instructions: '1. Composez *145# T-Money.\n2. Effectuez le transfert au numéro ci-dessus.\n3. Saisissez la référence SMS reçue.'
      },
      {
        id: 'tg-moov',
        name: 'Moov Money Togo (Flooz)',
        accountNumber: '+228 99 88 77 66',
        accountName: 'Direction Financière Togo',
        badge: 'Disponible',
        instructions: '1. Composez *155# Flooz Moov Togo.\n2. Envoyez le montant au numéro ci-dessus.\n3. Renseignez l\'ID de transaction.'
      }
    ]
  },
  {
    id: 'bf',
    name: 'Burkina Faso',
    code: 'BF',
    flag: '🇧🇫',
    phonePrefix: '+226',
    currency: 'F CFA',
    channels: [
      {
        id: 'bf-orange',
        name: 'Orange Money Burkina',
        accountNumber: '+226 76 12 34 56',
        accountName: 'Aura Burkina Trésorerie',
        badge: 'Recommandé',
        instructions: '1. Composez *144# Orange Money Burkina.\n2. Transférez le montant au numéro ci-dessus.\n3. Indiquez la référence de transfert SMS.'
      },
      {
        id: 'bf-moov',
        name: 'Moov Africa Burkina',
        accountNumber: '+226 70 88 99 00',
        accountName: 'Service Paiement Moov',
        badge: 'Disponible',
        instructions: '1. Composez *555# Moov Burkina.\n2. Envoyez les fonds au numéro ci-dessus.\n3. Saisissez la référence SMS.'
      }
    ]
  }
];

interface DepositViewProps {
  channels?: PaymentChannel[];
  onBack: () => void;
  balance?: number;
  onSubmitManualDeposit: (data: {
    amount: number;
    channelId: string;
    channelName: string;
    channelNumber: string;
    proofReference: string;
  }) => void;
  transactions?: Transaction[];
}

export default function DepositView({ 
  onBack, 
  onSubmitManualDeposit,
  transactions = []
}: DepositViewProps) {
  // Navigation between Page 1 (Config) and Page 2 (Proof / Reference Submission)
  const [stepPage, setStepPage] = useState<1 | 2>(1);

  // Selected Country state
  const [selectedCountryId, setSelectedCountryId] = useState<string>('cm');
  
  const currentCountry = SUPPORTED_COUNTRIES.find(c => c.id === selectedCountryId) || SUPPORTED_COUNTRIES[0];
  
  // Selected Channel state within the country
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    currentCountry.channels[0]?.id || ''
  );

  const [amountInput, setAmountInput] = useState<string>('25000');
  const [proofReference, setProofReference] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [lastSubmittedInfo, setLastSubmittedInfo] = useState<{
    amount: number;
    channelName: string;
    reference: string;
    countryName: string;
  } | null>(null);

  // When country changes, reset default channel to first of that country
  const handleSelectCountry = (countryId: string) => {
    setSelectedCountryId(countryId);
    const country = SUPPORTED_COUNTRIES.find(c => c.id === countryId);
    if (country && country.channels.length > 0) {
      setSelectedChannelId(country.channels[0].id);
    }
    setSubmissionSuccess(false);
  };

  const selectedChannel = currentCountry.channels.find(c => c.id === selectedChannelId) || currentCountry.channels[0];

  const quickAmounts = [2000, 5000, 10000, 25000, 50000, 100000];

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleProceedToProofPage = () => {
    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount < 1000) {
      alert('Le montant minimum de recharge est de 1 000 F CFA.');
      return;
    }
    if (!selectedChannel) {
      alert('Veuillez sélectionner un canal de paiement.');
      return;
    }
    setStepPage(2);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannel) {
      alert('Veuillez sélectionner un canal de paiement valide.');
      return;
    }

    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount < 1000) {
      alert('Le montant minimum de recharge est de 1 000 F CFA.');
      return;
    }

    if (!proofReference.trim()) {
      alert('Veuillez renseigner la référence ou la preuve du paiement (ID SMS ou numéro expéditeur).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitManualDeposit({
        amount: parsedAmount,
        channelId: selectedChannel.id,
        channelName: `${selectedChannel.name} (${currentCountry.name})`,
        channelNumber: selectedChannel.accountNumber,
        proofReference: proofReference.trim(),
      });
      setLastSubmittedInfo({
        amount: parsedAmount,
        channelName: selectedChannel.name,
        reference: proofReference.trim(),
        countryName: currentCountry.name
      });
      setSubmissionSuccess(true);
      setProofReference('');
    }, 1000);
  };

  // Pending deposits from user's transactions
  const userPendingDeposits = transactions.filter(
    t => t.type === 'deposit' && t.status === 'pending'
  );

  return (
    <div className="max-w-xl mx-auto space-y-4 text-left text-white" id="page-deposit-container">
      {/* Page Header */}
      <PageHeader
        title="Recharge de Compte"
        subtitle={stepPage === 1 ? "Sélectionnez votre pays, le montant et le canal" : "Confirmation et saisie de la preuve de paiement"}
        onBack={stepPage === 2 ? () => setStepPage(1) : onBack}
        badge="F CFA (XOF)"
        icon={<ArrowDownLeft className="w-5 h-5 text-[#22c55e]" />}
      />

      {/* Pending Deposits Alert Banner */}
      {userPendingDeposits.length > 0 && stepPage === 1 && (
        <div className="bg-amber-950/40 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Vous avez {userPendingDeposits.length} recharge(s) en attente de validation</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {userPendingDeposits.slice(0, 2).map((dep) => (
              <div key={dep.id} className="bg-zinc-950 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block font-mono">{formatCurrency(dep.amount)}</span>
                  <span className="text-[10px] text-zinc-400 block truncate max-w-[200px]">
                    {dep.channelName || dep.description} • Réf: {dep.proofReference || 'Soumise'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 text-[10px] font-black uppercase font-mono">
                  En attente
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE 1 : ÉTAPE 1 (PAYS), ÉTAPE 2 (MONTANT), ÉTAPE 3 (CANAL ET COORDONNÉES) */}
      {stepPage === 1 && (
        <div className="bg-zinc-900 rounded-3xl p-5 sm:p-6 space-y-5">
          {/* INSTRUCTION 1: SÉLECTION DU PAYS */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#22c55e] text-black flex items-center justify-center text-[10px] font-bold">1</span>
                Sélectionnez votre Pays
              </label>
              <span className="text-[10px] text-zinc-500 font-bold font-mono">
                {SUPPORTED_COUNTRIES.length} pays
              </span>
            </div>

            {/* Grid of 3 Countries */}
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_COUNTRIES.map((country) => {
                const isSelected = selectedCountryId === country.id;
                return (
                  <button
                    type="button"
                    key={country.id}
                    onClick={() => handleSelectCountry(country.id)}
                    className={`p-3 rounded-2xl text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-[#22c55e] text-black font-bold shadow-md'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <span className={`text-xs font-bold block truncate ${isSelected ? 'text-black' : 'text-white'}`}>
                      {country.name}
                    </span>
                    <span className={`text-[10px] font-mono block ${isSelected ? 'text-zinc-900' : 'text-zinc-500'}`}>
                      {country.phonePrefix}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INSTRUCTION 2 (L'ANCIENNE INSTRUCTION 3) : MONTANT DE LA RECHARGE VIENT AVANT LE CANAL */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#22c55e] text-black flex items-center justify-center text-[10px] font-bold">2</span>
              Montant de la recharge ({currentCountry.currency})
            </label>

            {/* Quick amounts */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmountInput(amt.toString())}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold font-mono cursor-pointer transition ${
                    amountInput === amt.toString()
                      ? 'bg-[#22c55e] text-black shadow-xs'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>

            {/* Manual Amount Input */}
            <div className="relative">
              <input
                type="number"
                min="1000"
                step="500"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
                className="w-full bg-zinc-950 rounded-2xl py-3.5 px-4 text-base font-black font-mono text-white focus:outline-none"
                placeholder="Montant (ex: 25000)"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-zinc-500 font-mono">
                {currentCountry.currency}
              </span>
            </div>
          </div>

          {/* INSTRUCTION 3 (L'ANCIENNE INSTRUCTION 2) : CANAUX DE PAIEMENT DU PAYS SÉLECTIONNÉ */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#22c55e] text-black flex items-center justify-center text-[10px] font-bold">3</span>
                Canaux disponibles en {currentCountry.name} {currentCountry.flag}
              </label>
              <span className="text-[10px] text-[#22c55e] font-bold font-mono">
                {currentCountry.channels.length} opérateur(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentCountry.channels.map((channel) => {
                const isSelected = selectedChannelId === channel.id;
                return (
                  <button
                    type="button"
                    key={channel.id}
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#22c55e]/20 text-white'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs text-white">{channel.name}</span>
                      {channel.badge && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md font-mono ${
                          isSelected ? 'bg-[#22c55e] text-black' : 'bg-zinc-900 text-zinc-400'
                        }`}>
                          {channel.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-[#22c55e] block">
                      {channel.accountNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DÉTAILS ET NUMÉRO DU CANAL CHOISI */}
          {selectedChannel && (
            <div className="bg-zinc-950 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#22c55e] text-black flex items-center justify-center text-xs font-black">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">{selectedChannel.name}</span>
                    {selectedChannel.accountName && (
                      <span className="text-[10px] text-zinc-400 block">Titulaire : {selectedChannel.accountName}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#22c55e]/20 text-[#22c55e] rounded-full font-bold">
                  {currentCountry.flag} Canal Vérifié
                </span>
              </div>

              {/* Numéro de réception avec bouton Copier */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block font-mono mb-1">
                  Numéro à créditer :
                </label>
                <div className="flex items-center justify-between bg-zinc-900 rounded-xl p-2.5">
                  <span className="text-base sm:text-lg font-black font-mono text-[#22c55e] tracking-wider">
                    {selectedChannel.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(selectedChannel.accountNumber)}
                    id="btn-copy-deposit-number"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      copied
                        ? 'bg-[#22c55e] text-black'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions de transfert */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-bold">
                  <Info className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                  <span>Instructions :</span>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3 text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                  {selectedChannel.instructions}
                </div>
              </div>
            </div>
          )}

          {/* Bouton pour aller à la nouvelle page (Instruction 4) */}
          <button
            type="button"
            onClick={handleProceedToProofPage}
            id="btn-proceed-deposit-step-2"
            className="w-full py-4 rounded-2xl bg-[#22c55e] hover:bg-[#1eb852] text-black font-black text-sm uppercase tracking-wider transition shadow-lg shadow-[#22c55e]/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continuer vers la Preuve de Paiement</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* PAGE 2 : NOUVELLE PAGE POUR L'INSTRUCTION 4 (RÉFÉRENCE / PREUVE DE PAIEMENT & VALIDATION) */}
      {stepPage === 2 && (
        <div className="space-y-4">
          {/* Success Notification Card */}
          <AnimatePresence>
            {submissionSuccess && lastSubmittedInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 bg-[#22c55e]/15 rounded-3xl space-y-2.5"
              >
                <div className="flex items-center gap-2.5 text-white">
                  <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
                  <h3 className="text-sm font-black">Demande de recharge soumise avec succès !</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Votre demande de <strong className="font-mono text-white">{formatCurrency(lastSubmittedInfo.amount)}</strong> via <strong className="text-white">{lastSubmittedInfo.channelName}</strong> ({lastSubmittedInfo.countryName}) avec la référence <span className="font-mono text-zinc-200">{lastSubmittedInfo.reference}</span> est passée au statut <strong>« En attente »</strong>.
                </p>
                <div className="p-3 bg-zinc-950 rounded-2xl text-[11px] text-zinc-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>L'administrateur va vérifier votre transfert et créditer votre compte sous peu.</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionSuccess(false);
                      setStepPage(1);
                    }}
                    className="text-xs font-bold text-[#22c55e] hover:underline cursor-pointer"
                  >
                    Faire une nouvelle demande de recharge
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!submissionSuccess && (
            <div className="bg-zinc-900 rounded-3xl p-5 sm:p-6 space-y-5">
              {/* Header Récapitulatif */}
              <div className="flex items-center justify-between pb-2">
                <div>
                  <span className="text-[10px] font-black uppercase font-mono text-[#22c55e] block">
                    Étape 2 / 2 - VALIDATION
                  </span>
                  <h3 className="text-lg font-black text-white">Preuve de Transfert</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStepPage(1)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
              </div>

              {/* Recap Card */}
              <div className="p-4 bg-zinc-950 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                  <span className="text-xs text-zinc-400">Montant à transférer</span>
                  <span className="text-lg font-black font-mono text-[#22c55e]">
                    {formatCurrency(parseFloat(amountInput) || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 text-xs">
                  <span className="text-zinc-400">Pays & Opérateur</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <span>{currentCountry.flag}</span>
                    <span>{selectedChannel.name}</span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-zinc-400">Numéro de réception :</span>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(selectedChannel.accountNumber)}
                      className="text-[11px] font-bold text-[#22c55e] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copié' : 'Copier le numéro'}</span>
                    </button>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-xl text-center">
                    <span className="text-base font-black font-mono text-white">
                      {selectedChannel.accountNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* FORMULAIRE DE L'INSTRUCTION 4 */}
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#22c55e] text-black flex items-center justify-center text-[10px] font-bold">4</span>
                    Référence / Preuve de paiement
                  </label>
                  <input
                    type="text"
                    value={proofReference}
                    onChange={(e) => setProofReference(e.target.value)}
                    required
                    placeholder="Ex: ID transaction (TX982...), Réf SMS de transfert, ou Numéro expéditeur"
                    className="w-full bg-zinc-950 rounded-2xl py-3.5 px-4 text-xs font-mono text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Saisissez l'ID ou la référence reçue par SMS après avoir effectué votre transfert sur le numéro ci-dessus.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !proofReference.trim()}
                  id="btn-submit-deposit-proof"
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    isSubmitting || !proofReference.trim()
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                      : 'bg-[#22c55e] hover:bg-[#1eb852] text-black shadow-[#22c55e]/20 active:scale-98'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Validation en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Valider et Soumettre ma Recharge</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security info */}
              <div className="p-3.5 bg-zinc-950 rounded-2xl text-[11px] text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
                  <span>Validation sécurisée :</span>
                </div>
                <p>Votre compte sera crédité immédiatement dès la vérification de votre référence par le service financier.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
