import React, { useState, useMemo } from 'react';
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
  Smartphone,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentChannel, Transaction } from '../types';
import { INITIAL_PAYMENT_CHANNELS, formatCurrency } from '../data';
import PageHeader from './PageHeader';

interface CountryGroup {
  id: string;
  name: string;
  flag: string;
  phonePrefix: string;
  currency: string;
  channels: PaymentChannel[];
}

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
  channels,
  onBack, 
  onSubmitManualDeposit,
  transactions = []
}: DepositViewProps) {
  // Navigation between Page 1 (Config) and Page 2 (Proof / Reference Submission)
  const [stepPage, setStepPage] = useState<1 | 2>(1);

  // Active channels list from props or live backend sync
  const activeChannels: PaymentChannel[] = useMemo(() => {
    const rawList = channels || [];
    return rawList.filter(c => c.isActive !== false);
  }, [channels]);

  // Group active channels into dynamic countries (Togo only)
  const countryGroups: CountryGroup[] = useMemo(() => {
    const tgChannels: PaymentChannel[] = [];

    activeChannels.forEach(ch => {
      tgChannels.push(ch);
    });

    const groups: CountryGroup[] = [
      {
        id: 'tg',
        name: 'Togo',
        flag: '🇹🇬',
        phonePrefix: '+228',
        currency: 'F CFA',
        channels: tgChannels
      }
    ];

    return groups;
  }, [activeChannels]);

  // Selected Country state (defaults to 'tg')
  const [selectedCountryId, setSelectedCountryId] = useState<string>('tg');
  
  // Safe selected country reference
  const currentCountry = useMemo(() => {
    return countryGroups.find(c => c.id === selectedCountryId) || countryGroups[0];
  }, [countryGroups, selectedCountryId]);

  // Selected Channel state within the country or global
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');

  const selectedChannel: PaymentChannel | undefined = useMemo(() => {
    if (selectedChannelId) {
      const found = activeChannels.find(c => c.id === selectedChannelId);
      if (found) return found;
    }
    return currentCountry.channels[0] || activeChannels[0];
  }, [selectedChannelId, activeChannels, currentCountry]);

  const [amountInput, setAmountInput] = useState<string>('4000');
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

  // When country changes, select its first channel
  const handleSelectCountry = (countryId: string) => {
    setSelectedCountryId(countryId);
    const grp = countryGroups.find(c => c.id === countryId);
    if (grp && grp.channels.length > 0) {
      setSelectedChannelId(grp.channels[0].id);
    }
    setSubmissionSuccess(false);
  };

  const quickAmounts = [4000, 10000, 20000, 120000, 220000, 400000, 800000];

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleProceedToProofPage = () => {
    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount < 4000) {
      alert('Le montant minimum de recharge est de 4 000 F CFA.');
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
    if (isNaN(parsedAmount) || parsedAmount < 4000) {
      alert('Le montant minimum de recharge est de 4 000 F CFA.');
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
    <div className="max-w-xl mx-auto space-y-4 text-left text-zinc-100" id="page-deposit-container">
      {/* Page Header */}
      <PageHeader
        title="Recharge de Compte"
        subtitle={stepPage === 1 ? "Sélectionnez votre pays, le montant et le canal" : "Confirmation et saisie de la preuve de paiement"}
        onBack={stepPage === 2 ? () => setStepPage(1) : onBack}
        badge="F CFA (XOF)"
        icon={<ArrowDownLeft className="w-5 h-5 text-emerald-400" />}
      />

      {/* Pending Deposits Alert Banner */}
      {userPendingDeposits.length > 0 && stepPage === 1 && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Vous avez {userPendingDeposits.length} recharge(s) en attente de validation</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {userPendingDeposits.slice(0, 2).map((dep) => (
              <div key={dep.id} className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-zinc-100 block font-mono">{formatCurrency(dep.amount)}</span>
                  <span className="text-[10px] text-zinc-400 block truncate max-w-[200px]">
                    {dep.channelName || dep.description} • Réf: {dep.proofReference || 'Soumise'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 text-[10px] font-black uppercase font-mono border border-amber-600/40">
                  En attente
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE 1 : ÉTAPE 1 (PAYS), ÉTAPE 2 (MONTANT), ÉTAPE 3 (CANAL ET COORDONNÉES) */}
      {stepPage === 1 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
          {/* INSTRUCTION 1: SÉLECTION DU PAYS */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">1</span>
                Votre Pays (Togo 🇹🇬)
              </label>
              <span className="text-[10px] text-zinc-500 font-bold font-mono">
                Togo (+228)
              </span>
            </div>

            {/* Exclusive Togo Country Display */}
            <div className="grid grid-cols-1 gap-2.5">
              {countryGroups.map((country) => {
                const isSelected = selectedCountryId === country.id;
                return (
                  <button
                    type="button"
                    key={country.id}
                    onClick={() => handleSelectCountry(country.id)}
                    className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3 border ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white font-bold shadow-lg shadow-emerald-500/10'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <span className="text-3xl shrink-0">{country.flag}</span>
                    <div className="min-w-0 flex-1">
                      <span className={`text-xs font-black block truncate ${isSelected ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {country.name}
                      </span>
                      <span className={`text-[11px] font-mono font-bold block ${isSelected ? 'text-zinc-200' : 'text-zinc-400'}`}>
                        {country.phonePrefix} (T-Money & Flooz)
                      </span>
                      <span className={`text-[9px] font-mono block ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {country.channels.length} canal/canaux disponible(s)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INSTRUCTION 2 : MONTANT DE LA RECHARGE */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">2</span>
              Montant de la recharge ({currentCountry.currency})
            </label>

            {/* Quick amounts */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmountInput(amt.toString())}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold font-mono cursor-pointer transition border ${
                    amountInput === amt.toString()
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 text-zinc-300'
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
                min="4000"
                step="500"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-emerald-500/80 rounded-2xl py-3.5 px-4 text-base font-black font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none transition"
                placeholder="Montant (min: 4000 F CFA)"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-zinc-500 font-mono">
                {currentCountry.currency}
              </span>
            </div>
          </div>

          {/* INSTRUCTION 3 : CANAUX DE PAIEMENT DU PAYS SÉLECTIONNÉ */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">3</span>
                Canaux disponibles en {currentCountry.name} {currentCountry.flag}
              </label>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">
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
                    className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs text-zinc-100">{channel.name}</span>
                      {channel.badge && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md font-mono border ${
                          isSelected 
                            ? 'bg-emerald-500 border-emerald-500 text-zinc-950' 
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                        }`}>
                          {channel.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {channel.accountNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DÉTAILS ET NUMÉRO DU CANAL CHOISI */}
          {selectedChannel && (
            <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-black">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-zinc-100 block">{selectedChannel.name}</span>
                    {selectedChannel.accountName && (
                      <span className="text-[10px] text-zinc-400 block">Titulaire : {selectedChannel.accountName}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">
                  {currentCountry.flag} Canal Vérifié
                </span>
              </div>

              {/* Numéro de réception avec bouton Copier */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block font-mono mb-1">
                  Numéro à créditer :
                </label>
                <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5">
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-400 tracking-wider">
                    {selectedChannel.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(selectedChannel.accountNumber)}
                    id="btn-copy-deposit-number"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                      copied
                        ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                        : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
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
                  <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Instructions :</span>
                </div>
                <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
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
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
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
                className="p-5 bg-emerald-950/40 border border-emerald-500/30 rounded-3xl space-y-2.5 shadow-xl"
              >
                <div className="flex items-center gap-2.5 text-zinc-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h3 className="text-sm font-black">Demande de recharge soumise avec succès !</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Votre demande de <strong className="font-mono text-white">{formatCurrency(lastSubmittedInfo.amount)}</strong> via <strong className="text-white">{lastSubmittedInfo.channelName}</strong> ({lastSubmittedInfo.countryName}) avec la référence <span className="font-mono text-emerald-300">{lastSubmittedInfo.reference}</span> est passée au statut <strong>« En attente »</strong>.
                </p>
                <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-[11px] text-zinc-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>L'administrateur va vérifier votre transfert et créditer votre compte sous peu.</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionSuccess(false);
                      setStepPage(1);
                    }}
                    className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Faire une nouvelle demande de recharge
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!submissionSuccess && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
              {/* Header Récapitulatif */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div>
                  <span className="text-[10px] font-black uppercase font-mono text-emerald-400 block">
                    Étape 2 / 2 - VALIDATION
                  </span>
                  <h3 className="text-lg font-black text-zinc-100">Preuve de Transfert</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStepPage(1)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-300 flex items-center gap-1.5 cursor-pointer transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
              </div>

              {/* Recap Card */}
              <div className="p-4 bg-zinc-950/80 border border-zinc-800/90 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                  <span className="text-xs text-zinc-400">Montant à transférer</span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {formatCurrency(parseFloat(amountInput) || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 text-xs">
                  <span className="text-zinc-400">Pays & Opérateur</span>
                  <span className="font-bold text-zinc-100 flex items-center gap-1">
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
                      className="text-[11px] font-bold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copié' : 'Copier le numéro'}</span>
                    </button>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800/90 p-2.5 rounded-xl text-center">
                    <span className="text-base font-black font-mono text-emerald-400">
                      {selectedChannel.accountNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* FORMULAIRE DE L'INSTRUCTION 4 */}
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">4</span>
                    Référence / Preuve de paiement
                  </label>
                  <input
                    type="text"
                    value={proofReference}
                    onChange={(e) => setProofReference(e.target.value)}
                    required
                    placeholder="Ex: ID transaction (TX982...), Réf SMS de transfert, ou Numéro expéditeur"
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-emerald-500/80 rounded-2xl py-3.5 px-4 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none transition"
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
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none border border-zinc-700/50'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20 active:scale-98'
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
              <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-[11px] text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
