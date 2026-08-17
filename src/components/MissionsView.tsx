import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  Award, 
  Sparkles, 
  Gift, 
  Target, 
  Check, 
  Loader2, 
  Copy, 
  Share2, 
  Coins, 
  TrendingUp, 
  ArrowRight,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Mission, User, WalletState, ReferralUser } from '../types';
import PageHeader from './PageHeader';
import { formatCurrency } from '../data';

interface MissionsViewProps {
  currentUser: User;
  wallet: WalletState;
  missions: Mission[];
  claimedMissionIds: string[];
  referrals: ReferralUser[];
  onBack: () => void;
  onClaimMission: (mission: Mission, currentProgress: number) => Promise<{ success: boolean; message?: string }>;
  onNavigateToReferral?: () => void;
}

export default function MissionsView({
  currentUser,
  wallet,
  missions,
  claimedMissionIds,
  referrals,
  onBack,
  onClaimMission,
  onNavigateToReferral
}: MissionsViewProps) {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculate actual investor referrals count
  const investorCount = referrals.length;

  // Calculate total rewards already claimed
  const totalEarnedFromMissions = missions
    .filter(m => claimedMissionIds.includes(m.id))
    .reduce((sum, m) => sum + m.rewardAmount, 0);

  const completedCount = missions.filter(m => claimedMissionIds.includes(m.id)).length;

  // Helper to render icon for mission
  const renderMissionIcon = (iconType?: string) => {
    switch (iconType) {
      case 'users':
        return <Users className="w-5 h-5 text-emerald-400" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'award':
        return <Award className="w-5 h-5 text-indigo-400" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-rose-400" />;
      case 'gift':
        return <Gift className="w-5 h-5 text-teal-400" />;
      default:
        return <Target className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleClaim = async (mission: Mission, currentProgress: number) => {
    if (claimedMissionIds.includes(mission.id) || claimingId) return;

    if (currentProgress < mission.targetCount) {
      setFeedback({
        type: 'error',
        message: `Objectif non atteint : vous avez invité ${currentProgress}/${mission.targetCount} investisseurs.`
      });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    setClaimingId(mission.id);
    try {
      const res = await onClaimMission(mission, currentProgress);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || `Félicitations ! +${formatCurrency(mission.rewardAmount)} crédités sur votre solde.`
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Impossible de récupérer la prime.'
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: e.message || 'Erreur lors de la récupération.'
      });
    } finally {
      setClaimingId(null);
      setTimeout(() => setFeedback(null), 4500);
    }
  };

  const handleCopyInvitation = () => {
    const inviteCode = currentUser.referralCode || currentUser.phoneNumber || 'AGRO2026';
    const textToCopy = `${window.location.origin}/?ref=${inviteCode}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto text-left" id="missions-view-root">
      {/* Header */}
      <PageHeader
        title="Centre de Missions"
        subtitle="Invitez des investisseurs et gagnez des primes instantanées"
        onBack={onBack}
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-xl ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <Target className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="flex-1">{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP OVERVIEW DASHBOARD CARD */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono block">
                TABLEAU DES MISSIONS
              </span>
              <h2 className="text-base font-extrabold text-white">
                Primes Débloquées
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-400 block font-medium">Missions réussies</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {completedCount} / {missions.length}
            </span>
          </div>
        </div>

        {/* Total stats pill grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-[#18181b] border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[11px] text-zinc-400 font-medium block">Total Primes Gagnées</span>
            <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
              {totalEarnedFromMissions.toLocaleString('fr-FR')} <span className="text-xs text-zinc-400 font-sans font-normal">F CFA</span>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[11px] text-zinc-400 font-medium block">Investisseurs Parrainés</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {investorCount} <span className="text-xs text-zinc-400 font-sans font-normal">membres</span>
            </div>
          </div>
        </div>

        {/* Fast invite bar */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="text-xs text-zinc-300 truncate">
            Mon code : <strong className="text-emerald-400 font-mono">{currentUser.referralCode || currentUser.phoneNumber}</strong>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyInvitation}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copié !' : 'Copier lien'}</span>
            </button>
            {onNavigateToReferral && (
              <button
                onClick={onNavigateToReferral}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>Équipe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MISSIONS LIST */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
            MISSIONS DISPONIBLES
          </h3>
          <span className="text-[11px] text-zinc-400">
            Objectifs en temps réel
          </span>
        </div>

        {missions.length === 0 ? (
          <div className="p-8 text-center bg-[#121215] border border-zinc-800/80 rounded-2xl space-y-2">
            <Target className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-400">Aucune mission disponible pour le moment.</p>
          </div>
        ) : (
          missions
            .filter(m => m.isActive !== false)
            .sort((a, b) => (Number(a.orderIndex || a.targetCount) - Number(b.orderIndex || b.targetCount)))
            .map((mission) => {
              const isClaimed = claimedMissionIds.includes(mission.id);
              const currentProgress = Math.min(investorCount, mission.targetCount);
              const progressRatio = Math.min(100, Math.round((investorCount / mission.targetCount) * 100));
              const isGoalReached = investorCount >= mission.targetCount;
              const isClaiming = claimingId === mission.id;

              return (
                <motion.div
                  key={mission.id}
                  id={`mission-card-${mission.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#121215] border rounded-2xl p-4 transition-all duration-200 shadow-sm relative overflow-hidden ${
                    isClaimed
                      ? 'border-emerald-500/20 bg-[#121215]/80 opacity-90'
                      : isGoalReached
                      ? 'border-emerald-500/50 shadow-emerald-950/20 bg-gradient-to-r from-[#121215] to-[#151d18]'
                      : 'border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Icon & Details */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                        isClaimed
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : isGoalReached
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}>
                        {renderMissionIcon(mission.iconType)}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white leading-snug truncate">
                            {mission.title}
                          </h4>
                          {isClaimed && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black">
                              Récompensé ✓
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-400 font-mono">
                            +{mission.rewardAmount.toLocaleString('fr-FR')} F CFA
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            de bonus
                          </span>
                        </div>

                        {mission.description && (
                          <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                            {mission.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5 self-center">
                      {isClaimed ? (
                        <button
                          disabled
                          className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold flex items-center gap-1 cursor-default opacity-80"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Récupéré</span>
                        </button>
                      ) : isGoalReached ? (
                        <button
                          onClick={() => handleClaim(mission, currentProgress)}
                          disabled={isClaiming}
                          id={`btn-claim-${mission.id}`}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/60 flex items-center gap-1.5 cursor-pointer animate-pulse"
                        >
                          {isClaiming ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>En cours...</span>
                            </>
                          ) : (
                            <>
                              <Sparkle className="w-3.5 h-3.5" />
                              <span>Récupérer le bonus</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClaim(mission, currentProgress)}
                          disabled
                          className="px-3.5 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 text-xs font-bold cursor-not-allowed opacity-60"
                        >
                          Récupérer le bonus
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Progress Bar */}
                  <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-zinc-400">
                        Progression : <strong className="text-zinc-200 font-mono">{currentProgress}/{mission.targetCount}</strong>
                      </span>
                      <span className="text-[11px] font-bold font-mono text-emerald-400">
                        {progressRatio}%
                      </span>
                    </div>

                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isClaimed
                            ? 'bg-emerald-500/50'
                            : isGoalReached
                            ? 'bg-emerald-500'
                            : 'bg-emerald-600/70'
                        }`}
                        style={{ width: `${progressRatio}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
        )}
      </div>

      {/* 3. RULES & EXPLANATIONS CARD */}
      <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800/80 space-y-2 text-xs text-zinc-400">
        <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Target className="w-4 h-4 text-emerald-400" />
          Règles d'attribution des bonus
        </h4>
        <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
          <li>Chaque nouvel investisseur parrainé fait progresser automatiquement votre compteur.</li>
          <li>Le bouton <strong>« Récupérer le bonus »</strong> s'active instantanément dès que l'objectif est atteint.</li>
          <li>Chaque palier de récompense est crédité une seule fois sur votre solde principal en F CFA.</li>
          <li>Les primes obtenues peuvent être immédiatement réinvesties dans les contrats Agroprofit ou retirées.</li>
        </ul>
      </div>
    </div>
  );
}
