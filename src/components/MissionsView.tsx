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
  Sparkle,
  UserCheck
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

  // Calculate actual active investor referrals count
  const activeReferralsCount = referrals.filter(r => r.status === 'active' || (r.commissionEarned && r.commissionEarned > 0)).length;

  // Calculate total rewards already claimed
  const totalEarnedFromMissions = missions
    .filter(m => claimedMissionIds.includes(m.id))
    .reduce((sum, m) => sum + m.rewardAmount, 0);

  const completedCount = missions.filter(m => claimedMissionIds.includes(m.id)).length;

  // Helper to render icon for mission
  const renderMissionIcon = (iconType?: string) => {
    switch (iconType) {
      case 'users':
        return <Users className="w-5 h-5 text-cyan-300" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-amber-300" />;
      case 'award':
        return <Award className="w-5 h-5 text-teal-300" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-cyan-300" />;
      case 'gift':
        return <Gift className="w-5 h-5 text-emerald-300" />;
      default:
        return <Target className="w-5 h-5 text-cyan-300" />;
    }
  };

  const handleClaim = async (mission: Mission, currentProgress: number) => {
    if (claimedMissionIds.includes(mission.id) || claimingId) return;

    if (currentProgress < mission.targetCount) {
      setFeedback({
        type: 'error',
        message: `Objectif non atteint : vous avez actuellement ${currentProgress}/${mission.targetCount} filleuls actifs.`
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
    <div className="space-y-4 w-full max-w-2xl sm:max-w-3xl mx-auto text-left text-cyan-50" id="missions-view-root">
      {/* Header */}
      <PageHeader
        title="Centre de Missions"
        subtitle="Ayez des filleuls actifs et gagnez des primes instantanées"
        onBack={onBack}
        badge="Récompenses VIP"
        icon={<Trophy className="w-5 h-5 text-cyan-400" />}
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-2xl ${
              feedback.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
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
      <div className="aura-glass-card border border-[#0d5969]/70 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-inner">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 font-mono block luminous-text-soft">
                TABLEAU DES MISSIONS
              </span>
              <h2 className="text-base font-black text-white luminous-text">
                Primes Filleuls Actifs
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-cyan-300/80 block font-medium">Missions réussies</span>
            <span className="text-sm font-black font-mono text-emerald-400 luminous-text-emerald">
              {completedCount} / {missions.length}
            </span>
          </div>
        </div>

        {/* Total stats pill grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-[#02242e]/80 border border-[#0a4652]/70 rounded-2xl p-3.5 shadow-inner">
            <span className="text-[11px] text-cyan-300/80 font-medium block">Total Primes Gagnées</span>
            <div className="text-lg font-black text-emerald-400 font-mono mt-0.5 luminous-text-emerald">
              {totalEarnedFromMissions.toLocaleString('fr-FR')} <span className="text-xs text-cyan-300 font-sans font-normal">F CFA</span>
            </div>
          </div>

          <div className="bg-[#02242e]/80 border border-[#0a4652]/70 rounded-2xl p-3.5 shadow-inner">
            <span className="text-[11px] text-cyan-300/80 font-medium block">Filleuls Actifs Actuels</span>
            <div className="text-lg font-black text-white font-mono mt-0.5 flex items-center gap-1.5 luminous-text">
              <span>{activeReferralsCount}</span>
              <span className="text-xs text-cyan-300 font-sans font-medium">actifs</span>
            </div>
          </div>
        </div>

        {/* Fast invite bar */}
        <div className="pt-3 border-t border-[#094754]/60 flex items-center justify-between gap-2">
          <div className="text-xs text-cyan-200 truncate">
            Mon code : <strong className="text-cyan-300 font-mono font-bold">{currentUser.referralCode || currentUser.phoneNumber}</strong>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyInvitation}
              className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-cyan-500/40 shadow-inner"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copié !' : 'Copier lien'}</span>
            </button>
            {onNavigateToReferral && (
              <button
                onClick={onNavigateToReferral}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-lg shadow-cyan-600/20 border border-cyan-400/30"
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
          <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5 luminous-text-cyan">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>MISSIONS : AVOIR DES FILLEULS ACTIFS</span>
          </h3>
          <span className="text-[11px] text-cyan-300/80 font-medium">
            Progression automatique
          </span>
        </div>

        {missions.length === 0 ? (
          <div className="p-8 text-center aura-glass-card border border-[#0d5969]/70 rounded-3xl space-y-2 shadow-2xl">
            <Target className="w-8 h-8 text-cyan-400/60 mx-auto" />
            <p className="text-sm font-semibold text-cyan-300/80">Aucune mission disponible pour le moment.</p>
          </div>
        ) : (
          missions
            .filter(m => m.isActive !== false)
            .sort((a, b) => (Number(a.orderIndex || a.targetCount) - Number(b.orderIndex || b.targetCount)))
            .map((mission) => {
              const isClaimed = claimedMissionIds.includes(mission.id);
              const currentProgress = Math.min(activeReferralsCount, mission.targetCount);
              const progressRatio = Math.min(100, Math.round((activeReferralsCount / mission.targetCount) * 100));
              const isGoalReached = activeReferralsCount >= mission.targetCount;
              const isClaiming = claimingId === mission.id;

              return (
                <motion.div
                  key={mission.id}
                  id={`mission-card-${mission.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`aura-glass-card border rounded-3xl p-4 sm:p-5 transition-all duration-200 shadow-2xl relative overflow-hidden ${
                    isClaimed
                      ? 'border-emerald-500/40 bg-emerald-950/30 opacity-90'
                      : isGoalReached
                      ? 'border-cyan-400/60 shadow-xl shadow-cyan-500/10'
                      : 'border-[#0d5969]/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Icon & Details */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isClaimed
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                          : isGoalReached
                          ? 'bg-cyan-950/90 border-cyan-400/50 text-cyan-300 shadow-inner'
                          : 'bg-[#02242e]/80 border-[#0a4652]/70 text-cyan-300'
                      }`}>
                        {renderMissionIcon(mission.iconType)}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white leading-snug truncate luminous-text-soft">
                            {mission.title}
                          </h4>
                          {isClaimed && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-black font-mono">
                              Récompensé ✓
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-400 font-mono luminous-text-emerald">
                            +{mission.rewardAmount.toLocaleString('fr-FR')} F CFA
                          </span>
                          <span className="text-[11px] text-cyan-300/80">
                            de bonus
                          </span>
                        </div>

                        {mission.description && (
                          <p className="text-[11px] text-cyan-200/80 leading-relaxed line-clamp-2">
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
                          className="px-3.5 py-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1 cursor-default"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Récupéré</span>
                        </button>
                      ) : isGoalReached ? (
                        <button
                          onClick={() => handleClaim(mission, currentProgress)}
                          disabled={isClaiming}
                          id={`btn-claim-${mission.id}`}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/30 flex items-center gap-1.5 cursor-pointer border border-white/20"
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
                          className="px-3.5 py-2 rounded-xl bg-[#02242e]/60 border border-[#0a4652]/50 text-cyan-500/50 text-xs font-bold cursor-not-allowed"
                        >
                          Récupérer le bonus
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Progress Bar */}
                  <div className="mt-3.5 pt-3 border-t border-[#094754]/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-cyan-200">
                        Progression : <strong className="text-white font-mono">{currentProgress}/{mission.targetCount}</strong> <span className="text-cyan-300/80 font-sans">filleuls actifs</span>
                      </span>
                      <span className="text-[11px] font-black font-mono text-cyan-300 luminous-text-cyan">
                        {progressRatio}%
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-[#021f28] rounded-full overflow-hidden border border-cyan-500/30 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isClaimed
                            ? 'bg-emerald-400'
                            : isGoalReached
                            ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                            : 'bg-cyan-500'
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
      <div className="p-5 rounded-3xl aura-glass-card border border-[#0d5969]/70 shadow-2xl space-y-2.5 text-xs text-cyan-200/90">
        <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2 luminous-text-cyan">
          <Target className="w-4 h-4 text-cyan-400" />
          Règles d'attribution des bonus de mission
        </h4>
        <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
          <li>Seuls les <strong>filleuls actifs</strong> (membres ayant souscrit à un contrat d'investissement agricole) sont comptabilisés dans la progression.</li>
          <li>Le bouton <strong>« Récupérer le bonus »</strong> s'active instantanément dès que le nombre de filleuls actifs requis est atteint.</li>
          <li>Chaque bonus de mission est crédité une seule fois sur votre solde principal en F CFA.</li>
          <li>Les primes obtenues sont immédiatement disponibles pour un retrait ou pour l'activation d'autres packs VIP.</li>
        </ul>
      </div>
    </div>
  );
}

