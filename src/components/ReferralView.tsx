import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Zap, 
  CheckCircle2
} from 'lucide-react';
import { ReferralUser } from '../types';
import { formatCurrency } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface ReferralViewProps {
  referralCode: string;
  referrals: ReferralUser[];
  onAddAutoReferral?: (level: 1 | 2 | 3, memberName: string, investedAmount: number) => void;
}

export default function ReferralView({ referralCode, referrals }: ReferralViewProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'all' | 1 | 2 | 3>('all');

  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalCommission = referrals.reduce((sum, ref) => sum + ref.commissionEarned, 0);

  const filteredReferrals = selectedLevel === 'all' 
    ? referrals 
    : referrals.filter(r => r.level === selectedLevel);

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto text-white" id="equipe-page-root">
      {/* Main Header */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#22c55e] text-xs font-bold font-mono">
              <Zap className="w-3.5 h-3.5 text-[#22c55e]" />
              <span className="uppercase text-[10px] tracking-wider">PARRAINAGE AUTOMATIQUE INSTANTANÉ</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Gestion de votre Équipe & Affiliation
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Vos gains de parrainage sont crédités <strong>automatiquement</strong> et en temps réel sur votre solde dès qu'un membre rejoint votre réseau et investit.
            </p>
          </div>

          {/* Quick Total Commission Pill */}
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl shrink-0 text-left md:text-right">
            <span className="text-[11px] text-zinc-400 font-medium block">Total Commissions Automatiques</span>
            <div className="text-xl sm:text-2xl font-black text-[#22c55e] font-mono">
              +{formatCurrency(totalCommission)}
            </div>
            <span className="text-[10px] text-[#22c55e] font-bold block mt-0.5 font-mono">
              {referrals.length} membre(s) dans votre réseau
            </span>
          </div>
        </div>
      </div>

      {/* Referral Code and Link Area - ENCADRÉ (Framed with stylish borders) */}
      <div 
        id="section-framed-referral-links"
        className="bg-zinc-900 border-2 border-zinc-700/90 hover:border-[#22c55e]/60 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md transition-colors"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#22c55e]" />
            Vos Liens & Codes d'Invitation
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-[10px] font-bold font-mono">
            3 NIVEAUX : 35% • 2% • 1%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Code item - Framed container */}
          <div className="space-y-1.5 border border-zinc-800 bg-zinc-950/80 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider block">
              VOTRE CODE DE PARRAINAGE
            </span>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2">
              <span className="text-base font-mono font-black text-white tracking-wider w-full select-all pl-2">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                id="btn-copy-ref-code"
                className="bg-[#22c55e] hover:bg-[#1eb852] text-black text-xs font-black py-2 px-3 rounded-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
          </div>

          {/* Link item - Framed container */}
          <div className="space-y-1.5 border border-zinc-800 bg-zinc-950/80 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider block">
              VOTRE LIEN D'INVITATION DIRECT
            </span>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2">
              <span className="text-xs font-mono text-zinc-300 w-full truncate select-all pl-2">
                {referralLink}
              </span>
              <button
                onClick={handleCopyLink}
                id="btn-copy-ref-link"
                className="bg-[#ff6d00] hover:bg-[#e65100] text-white text-xs font-black py-2 px-3 rounded-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals List Table */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-white tracking-tight">
              Membres de votre Réseau ({referrals.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Historique des filleuls actifs et commissions automatiques créditées.
            </p>
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedLevel === 'all' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedLevel(1)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedLevel === 1 ? 'bg-[#22c55e] text-black shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Niv. 1 (35%)
            </button>
            <button
              onClick={() => setSelectedLevel(2)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedLevel === 2 ? 'bg-teal-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Niv. 2 (2%)
            </button>
            <button
              onClick={() => setSelectedLevel(3)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedLevel === 3 ? 'bg-amber-600 text-black shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Niv. 3 (1%)
            </button>
          </div>
        </div>

        {filteredReferrals.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
            <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-zinc-300">Aucun membre trouvé dans cette catégorie</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Partagez votre lien de parrainage encadré ci-dessus pour inviter vos premiers membres.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-2">Membre</th>
                  <th className="py-3 px-2 text-center">Niveau & Taux</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-center">Statut</th>
                  <th className="py-3 px-2 text-right">Commission Automatique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredReferrals.map((ref) => {
                  const rate = ref.level === 1 ? '30%' : ref.level === 2 ? '2%' : '1%';
                  return (
                    <tr key={ref.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-2 font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center text-[10px] font-black">
                          {ref.fullName.charAt(0)}
                        </div>
                        <span>{ref.fullName}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          ref.level === 1 
                            ? 'bg-[#22c55e]/20 text-[#22c55e]' 
                            : ref.level === 2 
                            ? 'bg-teal-500/20 text-teal-300' 
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          Niveau {ref.level} ({rate})
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px] text-zinc-400">{ref.dateJoined}</td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22c55e]/20 text-[#22c55e]">
                          Actif
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-[#22c55e]">
                        +{formatCurrency(ref.commissionEarned)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
