import React, { useState } from 'react';
import { 
  Gift, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronLeft,
  Copy,
  Check
} from 'lucide-react';
import { GiftCode } from '../types';
import { formatCurrency } from '../data';

interface GiftCodeViewProps {
  onBack: () => void;
  giftCodes?: GiftCode[];
  onRedeemCode?: (code: string) => { success: boolean; message: string; amount?: number };
}

export default function GiftCodeView({ onBack, giftCodes, onRedeemCode }: GiftCodeViewProps) {
  const [giftInput, setGiftInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Active publicly available codes from props
  const availableCodes = (giftCodes || []).filter(c => c.isActive && c.usedCount < c.maxUses);

  const handleSubmit = (codeToUse?: string) => {
    const rawCode = (codeToUse || giftInput).trim().toUpperCase();
    if (!rawCode) {
      setFeedback({ type: 'error', text: 'Veuillez saisir un code cadeau.' });
      return;
    }

    if (onRedeemCode) {
      const res = onRedeemCode(rawCode);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        setGiftInput('');
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } else {
      setFeedback({ type: 'success', text: `Code « ${rawCode} » validé avec succès !` });
      setGiftInput('');
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 text-left text-zinc-100" id="page-gift-code-container">
      {/* Header */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition cursor-pointer border border-zinc-700"
          title="Retour"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-white">Code Cadeau</h1>
        <div className="w-9 h-9" />
      </div>

      {/* Main Action Area */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Activer un bon d'échange</span>
            <span className="text-[11px] text-zinc-400 block">Saisissez votre code promo ou coupon cadeau</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-300 block">Code du bon d'échange</label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={giftInput}
              onChange={(e) => setGiftInput(e.target.value.toUpperCase())}
              placeholder="Ex: BONUS-BIENVENUE-5K"
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-mono font-bold text-white placeholder:text-zinc-500 focus:outline-none transition"
            />
            <button
              onClick={() => handleSubmit()}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer shrink-0 shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Échanger</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      {/* Information Notice */}
      <div className="p-4 rounded-3xl bg-[#121215] border border-zinc-800 text-xs text-zinc-400 space-y-1.5 leading-relaxed shadow-xl">
        <span className="font-bold text-white block">ℹ️ À propos des codes cadeaux</span>
        <p>
          Les codes cadeaux et bons d'échange sont distribués exclusivement par l'administration lors d'événements officiels, de promotions ou par le support client.
        </p>
        <p>
          Chaque code possède une valeur monétaire fixée et une durée de validité limitée. Saisissez votre code ci-dessus pour l'activer sur votre solde.
        </p>
      </div>
    </div>
  );
}

