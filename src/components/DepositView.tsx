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
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentChannel, Transaction, VIPPackage } from '../types';
import { INITIAL_PAYMENT_CHANNELS, formatCurrency } from '../data';
import PageHeader from './PageHeader';

interface DepositViewProps {
  channels?: PaymentChannel[];
  packages?: VIPPackage[];
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
  packages,
  onBack, 
  onSubmitManualDeposit,
  transactions = []
}: DepositViewProps) {
  // Navigation between Step 1 (Amount & Channel) and Step 2 (Proof / Reference Submission)
  const [stepPage, setStepPage] = useState<1 | 2>(1);

  // Active channels list from props or initial fallback
  const activeChannels: PaymentChannel[] = useMemo(() => {
    const rawList = channels && channels.length > 0 ? channels : INITIAL_PAYMENT_CHANNELS;
    return rawList.filter(c => c.isActive !== false);
  }, [channels]);

  // Selected Channel state
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');

  const selectedChannel: PaymentChannel | undefined = useMemo(() => {
    if (selectedChannelId) {
      const found = activeChannels.find(c => c.id === selectedChannelId);
      if (found) return found;
    }
    return activeChannels[0];
  }, [selectedChannelId, activeChannels]);

  // Dynamic quick amounts matching the centralized VIP packages prices
  const quickAmounts: number[] = useMemo(() => {
    if (packages && packages.length > 0) {
      const prices = packages
        .map(p => Number(p.minInvestment || 0))
        .filter(p => p > 0);
      const unique = Array.from(new Set(prices)).sort((a, b) => a - b);
      if (unique.length > 0) return unique;
    }
    return [2500, 6000, 15000, 32000, 70000, 250000, 500000, 1000000];
  }, [packages]);

  const minDepositAmount = useMemo(() => {
    return quickAmounts.length > 0 ? quickAmounts[0] : 2500;
  }, [quickAmounts]);

  const [amountInput, setAmountInput] = useState<string>(() => (quickAmounts[0] || 2500).toString());
  const [proofReference, setProofReference] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [lastSubmittedInfo, setLastSubmittedInfo] = useState<{
    amount: number;
    channelName: string;
    reference: string;
  } | null>(null);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleProceedToProofPage = () => {
    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount < minDepositAmount) {
      alert(`Le montant minimum de recharge est de ${formatCurrency(minDepositAmount)}.`);
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
    if (isNaN(parsedAmount) || parsedAmount < minDepositAmount) {
      alert(`Le montant minimum de recharge est de ${formatCurrency(minDepositAmount)}.`);
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
        channelName: selectedChannel.name,
        channelNumber: selectedChannel.accountNumber,
        proofReference: proofReference.trim(),
      });
      setLastSubmittedInfo({
        amount: parsedAmount,
        channelName: selectedChannel.name,
        reference: proofReference.trim()
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
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-cyan-50" id="page-deposit-container">
      {/* Page Header */}
      <PageHeader
        title="Recharge de Compte"
        subtitle={stepPage === 1 ? "Sélectionnez le montant et le canal de paiement" : "Confirmation et saisie de la preuve de paiement"}
        onBack={stepPage === 2 ? () => setStepPage(1) : onBack}
        badge="F CFA (XOF)"
        icon={<ArrowDownLeft className="w-5 h-5 text-cyan-400" />}
      />

      {/* Pending Deposits Alert Banner */}
      {userPendingDeposits.length > 0 && stepPage === 1 && (
        <div className="aura-glass-card rounded-3xl p-4 space-y-2 shadow-lg border-0 ring-0">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Vous avez {userPendingDeposits.length} recharge(s) en attente de validation</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {userPendingDeposits.slice(0, 2).map((dep) => (
              <div key={dep.id} className="bg-[#02242e]/80 rounded-2xl p-2.5 flex items-center justify-between text-xs border-0">
                <div>
                  <span className="font-black text-white block font-mono luminous-text">{formatCurrency(dep.amount)}</span>
                  <span className="text-[10px] text-cyan-200/70 block truncate max-w-[200px]">
                    {dep.channelName || dep.description} • Réf: {dep.proofReference || 'Soumise'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-[10px] font-bold uppercase font-mono border-0">
                  En attente
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE 1 : MONTANT, CANAUX DE PAIEMENT & COORDONNÉES (Sans cadre/bordure) */}
      {stepPage === 1 && (
        <div className="aura-glass-card rounded-3xl p-5 sm:p-6 space-y-6 shadow-2xl border-0 ring-0">
          
          {/* ÉTAPE 1 : MONTANT DE LA RECHARGE */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-cyan-300 font-mono mb-2.5 flex items-center gap-1.5 luminous-text-cyan">
              <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black">1</span>
              Montant de la recharge (F CFA)
            </label>

            {/* Quick amounts */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmountInput(amt.toString())}
                  className={`py-2.5 px-2 text-center rounded-xl text-[11px] sm:text-xs font-bold font-mono cursor-pointer transition border-0 ${
                    amountInput === amt.toString()
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/30 font-black'
                      : 'bg-[#02242e]/70 hover:bg-[#032d39] text-cyan-100'
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
                min={minDepositAmount}
                step="500"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
                className="w-full bg-[#021f28]/90 focus:bg-[#032933] rounded-2xl py-3 px-3.5 text-sm font-black font-mono text-white placeholder-cyan-500/50 focus:outline-none transition shadow-inner border-0 ring-0"
                placeholder={`Montant (min: ${formatCurrency(minDepositAmount)})`}
              />
              <span className="absolute right-3.5 top-3.5 text-xs font-bold text-cyan-400 font-mono">
                F CFA
              </span>
            </div>
          </div>

          {/* ÉTAPE 2 : CANAUX DE PAIEMENT DISPONIBLES */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5 luminous-text-cyan">
                <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black">2</span>
                Canal de paiement / Opérateur
              </label>
              <span className="text-[10px] text-cyan-300 font-bold font-mono">
                {activeChannels.length} canal/canaux disponible(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeChannels.map((channel) => {
                const isSelected = selectedChannel?.id === channel.id;
                return (
                  <button
                    type="button"
                    key={channel.id}
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border-0 ${
                      isSelected
                        ? 'bg-[#033440] text-white shadow-md shadow-cyan-500/20'
                        : 'bg-[#02242e]/70 hover:bg-[#032d39] text-cyan-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white luminous-text-soft">{channel.name}</span>
                      {channel.badge && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md font-mono border-0 ${
                          isSelected 
                            ? 'bg-cyan-500 text-slate-950 font-black' 
                            : 'bg-cyan-950/80 text-cyan-300'
                        }`}>
                          {channel.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 luminous-text-emerald block">
                      {channel.accountNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DÉTAILS ET NUMÉRO DU CANAL CHOISI */}
          {selectedChannel && (
            <div className="bg-[#02242e]/80 rounded-2xl p-4 space-y-3.5 shadow-inner border-0 ring-0">
              <div className="flex items-center justify-between pb-2 border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-300 flex items-center justify-center text-xs font-bold border-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block luminous-text-soft">{selectedChannel.name}</span>
                    {selectedChannel.accountName && (
                      <span className="text-[10px] text-cyan-200/70 block">Titulaire : {selectedChannel.accountName}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 bg-emerald-950/80 text-emerald-300 rounded-full font-bold border-0">
                  Vérifié
                </span>
              </div>

              {/* Numéro de réception avec bouton Copier */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block font-mono mb-1">
                  Numéro à créditer :
                </label>
                <div className="flex items-center justify-between bg-[#021f28]/90 rounded-2xl p-2.5 border-0">
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-400 tracking-wider pl-1 luminous-text-emerald">
                    {selectedChannel.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(selectedChannel.accountNumber)}
                    id="btn-copy-deposit-number"
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white'
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
                <div className="flex items-center gap-1.5 text-cyan-200 text-xs font-bold">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Instructions :</span>
                </div>
                <div className="bg-[#021f28]/90 rounded-2xl p-3 text-xs text-cyan-100/90 leading-relaxed whitespace-pre-line border-0">
                  {selectedChannel.instructions}
                </div>
              </div>
            </div>
          )}

          {/* Bouton pour aller à l'étape 2 */}
          <button
            type="button"
            onClick={handleProceedToProofPage}
            id="btn-proceed-deposit-step-2"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/25 border-0"
          >
            <span>Continuer vers la Preuve de Paiement</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* PAGE 2 : VALIDATION ET PREUVE DE PAIEMENT (Sans cadre/bordure) */}
      {stepPage === 2 && (
        <div className="space-y-4">
          {/* Success Notification Card */}
          <AnimatePresence>
            {submissionSuccess && lastSubmittedInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 aura-glass-card rounded-3xl space-y-2.5 shadow-2xl border-0 ring-0"
              >
                <div className="flex items-center gap-2.5 text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h3 className="text-sm font-black luminous-text">Demande de recharge soumise avec succès !</h3>
                </div>
                <p className="text-xs text-cyan-100/90 leading-relaxed">
                  Votre demande de <strong className="font-mono text-white luminous-text">{formatCurrency(lastSubmittedInfo.amount)}</strong> via <strong className="text-white">{lastSubmittedInfo.channelName}</strong> avec la référence <span className="font-mono text-emerald-400 font-bold luminous-text-emerald">{lastSubmittedInfo.reference}</span> est passée au statut <strong>« En attente »</strong>.
                </p>
                <div className="p-3 bg-[#02242e]/80 rounded-2xl text-[11px] text-cyan-200 flex items-center gap-2 border-0">
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
                    className="text-xs font-bold text-cyan-300 hover:text-white hover:underline cursor-pointer border-0"
                  >
                    Faire une nouvelle demande de recharge
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!submissionSuccess && (
            <div className="aura-glass-card rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl border-0 ring-0">
              {/* Header Récapitulatif */}
              <div className="flex items-center justify-between pb-2 border-0">
                <div>
                  <span className="text-[10px] font-black uppercase font-mono text-cyan-300 block luminous-text-cyan">
                    Étape 2 / 2 - VALIDATION
                  </span>
                  <h3 className="text-lg font-black text-white luminous-text">Preuve de Transfert</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStepPage(1)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-xs font-bold text-cyan-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition border-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
              </div>

              {/* Recap Card */}
              <div className="p-4 bg-[#02242e]/80 rounded-2xl space-y-3 shadow-inner border-0 ring-0">
                <div className="flex items-center justify-between pb-2.5 border-0">
                  <span className="text-xs text-cyan-200/80 font-medium">Montant à transférer</span>
                  <span className="text-lg font-black font-mono text-emerald-400 luminous-text-emerald">
                    {formatCurrency(parseFloat(amountInput) || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 text-xs border-0">
                  <span className="text-cyan-200/80 font-medium">Opérateur / Canal</span>
                  <span className="font-bold text-white luminous-text-soft">
                    {selectedChannel?.name}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-cyan-300">Numéro de réception :</span>
                    <button
                      type="button"
                      onClick={() => selectedChannel && handleCopyNumber(selectedChannel.accountNumber)}
                      className="text-[11px] font-bold text-cyan-300 hover:text-white hover:underline cursor-pointer flex items-center gap-1 border-0"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copié' : 'Copier le numéro'}</span>
                    </button>
                  </div>
                  <div className="bg-[#021f28]/90 p-2.5 rounded-xl text-center border-0">
                    <span className="text-base font-black font-mono text-emerald-400 luminous-text-emerald">
                      {selectedChannel?.accountNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* FORMULAIRE DE VALIDATION */}
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5 luminous-text-cyan">
                    <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black">3</span>
                    Référence / Preuve de paiement
                  </label>
                  <input
                    type="text"
                    value={proofReference}
                    onChange={(e) => setProofReference(e.target.value)}
                    required
                    placeholder="Ex: ID transaction (TX982...), Réf SMS de transfert, ou Numéro expéditeur"
                    className="w-full bg-[#021f28]/90 rounded-2xl py-3 px-3.5 text-xs font-mono text-white placeholder-cyan-500/50 focus:outline-none transition shadow-inner border-0 ring-0"
                  />
                  <p className="text-[11px] text-cyan-200/70 leading-tight">
                    Saisissez l'ID ou la référence reçue par SMS après avoir effectué votre transfert sur le numéro ci-dessus.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !proofReference.trim()}
                  id="btn-submit-deposit-proof"
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-xl border-0 ${
                    isSubmitting || !proofReference.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white active:scale-98 shadow-cyan-600/30'
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
              <div className="p-3.5 bg-[#02242e]/80 rounded-2xl text-[11px] text-cyan-200/80 space-y-1 border-0 ring-0">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Validation sécurisée :</span>
                </div>
                <p>Votre compte sera crédité dès la vérification de votre référence par le service financier.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
