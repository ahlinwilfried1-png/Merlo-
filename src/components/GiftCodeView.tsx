import React, { useState } from 'react';
import { 
  Gift, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft,
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
    <div className="max-w-xl mx-auto space-y-5 text-left" id="page-gift-code-container">
      {/* Header */}
      <div className="flex items-center gap-3 py-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-white tracking-tight">Code Cadeau</h1>
          <p className="text-xs text-zinc-400">Activez vos bons d'échange et codes promotionnels</p>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase text-zinc-400">Code du bon d'échange</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={giftInput}
              onChange={(e) => setGiftInput(e.target.value.toUpperCase())}
              placeholder="Ex: BONUS-BIENVENUE-5K"
              className="flex-1 bg-zinc-900 focus:bg-zinc-850 rounded-2xl py-3 px-4 text-sm font-mono font-bold text-white placeholder:text-zinc-600 outline-none transition"
            />
            <button
              onClick={() => handleSubmit()}
              className="px-5 py-3 bg-[#22c55e] hover:bg-[#1eb852] text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              Échanger
            </button>
          </div>
        </div>

        {feedback && (
          <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/60 text-emerald-300' 
              : 'bg-rose-950/60 text-rose-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      {/* Available codes list */}
      {availableCodes.length > 0 && (
        <div className="pt-3 space-y-3">
          <span className="text-[11px] font-mono text-zinc-400 uppercase block">Codes promotionnels disponibles :</span>
          <div className="space-y-2.5">
            {availableCodes.map((c) => (
              <div 
                key={c.id} 
                className="py-3 px-1 flex items-center justify-between transition group"
              >
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold text-[#22c55e] block">{c.code}</span>
                  <span className="text-[11px] text-zinc-400 font-mono">Valeur : +{formatCurrency(c.amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(c.code)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === c.code ? 'Copié' : 'Copier'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setGiftInput(c.code);
                      handleSubmit(c.code);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Activer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
