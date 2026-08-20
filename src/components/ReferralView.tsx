import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Zap,
  Sparkles
} from 'lucide-react';
import { ReferralUser } from '../types';
import { formatCurrency } from '../data';

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

  const level1Count = referrals.filter(r => r.level === 1).length;
  const level2Count = referrals.filter(r => r.level === 2).length;
  const level3Count = referrals.filter(r => r.level === 3).length;

  const filteredReferrals = selectedLevel === 'all' 
    ? referrals 
    : referrals.filter(r => r.level === selectedLevel);

  return (
    <div className="space-y-5 text-left max-w-4xl mx-auto text-cyan-50" id="equipe-page-root">
      
      {/* 1. Header Section (Sans cadre/bordure) */}
      <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-0 ring-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 text-xs font-black font-mono luminous-text-emerald border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="uppercase text-[10px] tracking-wider">VOS COMMISSIONS SONT CRÉDITÉES AUTOMATIQUEMENT</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight luminous-text">
              Gestion de votre Équipe & Affiliation
            </h1>
            <p className="text-xs sm:text-sm text-cyan-200/90 leading-relaxed font-medium">
              Vos commissions sont créditées <strong className="text-emerald-300 font-bold">automatiquement</strong> et instantanément sur votre solde réel dès qu'un membre de votre réseau effectue une recharge ou active un contrat VIP.
            </p>
          </div>

          {/* Total Commissions Box (Sans bordure) */}
          <div className="bg-[#02242e]/80 p-4 rounded-2xl shrink-0 text-left md:text-right shadow-inner border-0">
            <span className="text-[11px] text-cyan-300/80 font-bold block font-mono">Total Commissions Automatiques</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight mt-0.5 luminous-text-emerald">
              +{formatCurrency(totalCommission)}
            </div>
            <span className="text-[11px] text-cyan-200/70 font-semibold block mt-0.5 font-mono">
              {referrals.length} membre(s) dans votre réseau
            </span>
          </div>
        </div>

        {/* 3 NIVEAUX (Sans bordures) */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#032933]/80 text-rose-300 text-xs font-bold shadow-xs border-0">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
            <span>Niveau 1 : <strong className="font-black text-white luminous-text">15%</strong> ({level1Count} membres)</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#032933]/80 text-amber-300 text-xs font-bold shadow-xs border-0">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Niveau 2 : <strong className="font-black text-white luminous-text">2%</strong> ({level2Count} membres)</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#032933]/80 text-cyan-300 text-xs font-bold shadow-xs border-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Niveau 3 : <strong className="font-black text-white luminous-text">1%</strong> ({level3Count} membres)</span>
          </div>
        </div>
      </div>

      {/* 2. UNIQUEMENT DEUX CADRES : CADRE DU CODE & CADRE DU LIEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CADRE 1 : LE CODE DE PARRAINAGE */}
        <div 
          id="cadre-code-parrainage"
          className="aura-glass-card border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-cyan-300 uppercase font-mono tracking-wider luminous-text-cyan">
              VOTRE CODE DE PARRAINAGE
            </span>
            <span className="text-[9px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md font-mono">
              Code Unique
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#02242e]/90 border border-[#0a4652]/80 rounded-2xl p-2.5 shadow-inner">
            <span className="text-xl font-mono font-black text-white tracking-widest w-full select-all pl-2 luminous-text">
              {referralCode}
            </span>
            <button
              onClick={handleCopyCode}
              id="btn-copy-ref-code"
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-md shadow-cyan-600/20 border border-cyan-400/30"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
        </div>

        {/* CADRE 2 : LE LIEN DE PARRAINAGE DIRECT */}
        <div 
          id="cadre-lien-parrainage"
          className="aura-glass-card border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-cyan-300 uppercase font-mono tracking-wider luminous-text-cyan">
              VOTRE LIEN D'INVITATION DIRECT
            </span>
            <span className="text-[9px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md font-mono">
              Lien Partageable
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#02242e]/90 border border-[#0a4652]/80 rounded-2xl p-2.5 shadow-inner">
            <span className="text-xs font-mono text-cyan-200 w-full truncate select-all pl-2">
              {referralLink}
            </span>
            <button
              onClick={handleCopyLink}
              id="btn-copy-ref-link"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-md shadow-teal-600/20 border border-teal-400/30"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. Section Membres du réseau (Sans cadre/bordure) */}
      <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-0 ring-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-0">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight luminous-text">
              Membres de votre Réseau ({referrals.length})
            </h2>
            <p className="text-xs text-cyan-200/80">
              Historique des filleuls actifs et commissions automatiques créditées.
            </p>
          </div>

          {/* Filtres par Niveau (Sans bordure) */}
          <div className="flex items-center gap-1.5 bg-[#02242e]/80 p-1.5 rounded-2xl flex-wrap border-0">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0 ${
                selectedLevel === 'all' 
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' 
                  : 'text-cyan-200 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedLevel(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0 ${
                selectedLevel === 1 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'text-rose-300 hover:text-rose-200'
              }`}
            >
              Niv. 1 (15%)
            </button>
            <button
              onClick={() => setSelectedLevel(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0 ${
                selectedLevel === 2 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-amber-300 hover:text-amber-200'
              }`}
            >
              Niv. 2 (2%)
            </button>
            <button
              onClick={() => setSelectedLevel(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0 ${
                selectedLevel === 3 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-teal-300 hover:text-teal-200'
              }`}
            >
              Niv. 3 (1%)
            </button>
          </div>
        </div>

        {filteredReferrals.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-[#02242e]/60 border-0">
            <Users className="w-8 h-8 text-cyan-400/60 mx-auto mb-2" />
            <p className="text-xs font-bold text-white">Aucun membre trouvé dans cette catégorie</p>
            <p className="text-[11px] text-cyan-300/70 mt-0.5">Partagez votre code ou lien pour inviter vos premiers filleuls.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-0 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300/80">
                  <th className="py-3 px-2">Membre</th>
                  <th className="py-3 px-2 text-center">Niveau & Taux</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-center">Statut</th>
                  <th className="py-3 px-2 text-right">Commission Automatique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#094754]/20">
                {filteredReferrals.map((ref) => {
                  const isL1 = ref.level === 1;
                  const isL2 = ref.level === 2;
                  const rate = isL1 ? '15%' : isL2 ? '2%' : '1%';
                  
                  return (
                    <tr key={ref.id} className="hover:bg-[#032933]/60 transition-colors border-0">
                      <td className="py-3 px-2 font-bold text-white flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-0 ${
                          isL1 
                            ? 'bg-rose-950 text-rose-300' 
                            : isL2 
                            ? 'bg-amber-950 text-amber-300' 
                            : 'bg-teal-950 text-teal-300'
                        }`}>
                          {ref.fullName.charAt(0)}
                        </div>
                        <span className="luminous-text-soft">{ref.fullName}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border-0 ${
                          isL1 
                            ? 'bg-rose-950/80 text-rose-300' 
                            : isL2 
                            ? 'bg-amber-950/80 text-amber-300' 
                            : 'bg-teal-950/80 text-teal-300'
                        }`}>
                          Niveau {ref.level} ({rate})
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px] text-cyan-200/70">{ref.dateJoined}</td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border-0">
                          Actif
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-emerald-400 text-sm luminous-text-emerald">
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
