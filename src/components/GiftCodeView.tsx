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
import PageHeader from './PageHeader';

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
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-cyan-50" id="page-gift-code-container">
      {/* Header */}
      <PageHeader
        title="Code Cadeau"
        subtitle="Activez vos bons d'échange et coupons bonus"
        onBack={onBack}
        badge="Bonus Immédiat"
        icon={<Gift className="w-5 h-5 text-cyan-400" />}
      />

      {/* Main Action Area (Sans cadre/bordure) */}
      <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-0 ring-0">
        <div className="flex items-center gap-3.5 pb-3 border-0">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 text-cyan-300 flex items-center justify-center shadow-inner border-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-black text-white block luminous-text">Activer un bon d'échange</span>
            <span className="text-xs text-cyan-200/80 block">Saisissez votre code promo ou coupon cadeau</span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <label className="text-xs font-black uppercase font-mono tracking-wider text-cyan-300 block luminous-text-cyan">Code du bon d'échange</label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={giftInput}
              onChange={(e) => setGiftInput(e.target.value.toUpperCase())}
              placeholder="Ex: BONUS-BIENVENUE-5K"
              className="flex-1 bg-[#021f28]/90 rounded-2xl py-3.5 px-4 text-sm font-mono font-black text-white placeholder-cyan-500/40 focus:outline-none transition shadow-inner border-0"
            />
            <button
              onClick={() => handleSubmit()}
              id="btn-redeem-gift-code"
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer shrink-0 shadow-xl shadow-cyan-600/25 active:scale-95 flex items-center justify-center gap-2 border-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Échanger</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 shadow-lg border-0 ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/80 text-emerald-300' 
              : 'bg-rose-950/80 text-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span className="font-semibold">{feedback.text}</span>
          </div>
        )}
      </div>

      {/* Information Notice (Sans cadre/bordure) */}
      <div className="p-5 rounded-3xl aura-glass-card text-xs text-cyan-200/90 space-y-2 leading-relaxed shadow-2xl border-0 ring-0">
        <span className="font-black text-white block text-sm luminous-text">ℹ️ À propos des codes cadeaux</span>
        <p>
          Les codes cadeaux et bons d'échange sont distribués exclusivement par l'administration lors d'événements officiels, de promotions ou par le support client.
        </p>
        <p>
          Chaque code possède une valeur monétaire fixée et une durée de validité limitée. Saisissez votre code ci-dessus pour l'activer immédiatement sur votre solde.
        </p>
      </div>
    </div>
  );
}

