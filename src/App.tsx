import React, { useState, useEffect, useRef } from 'react';
import { 
  Home,
  Layers,
  Users, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  Sparkles, 
  ClipboardList, 
  MessageSquare, 
  Wallet as WalletIcon, 
  LayoutGrid, 
  Trophy, 
  ShoppingBag,
  CreditCard,
  FileText,
  Gift,
  Bell,
  Lock,
  Headphones,
  FileCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Type definitions
import { User, WalletState, VIPPackage, UserSubscription, Transaction, ReferralUser, PaymentChannel, Announcement, GiftCode } from './types';

// Static initial data & currency formatter
import { INITIAL_TRANSACTIONS, INITIAL_REFERRALS, INITIAL_PAYMENT_CHANNELS, INITIAL_ANNOUNCEMENTS, VIP_PACKAGES, INITIAL_GIFT_CODES, formatCurrency } from './data';

// Component Views
import Auth from './components/Auth';
import DashboardView from './components/DashboardView';
import VIPView from './components/VIPView';
import ReferralView from './components/ReferralView';
import ProfileView from './components/ProfileView';
import ChatView from './components/ChatView';
import DepositView from './components/DepositView';
import WithdrawView from './components/WithdrawView';
import PaymentMethodsView from './components/PaymentMethodsView';
import HistoryView from './components/HistoryView';
import PointageView from './components/PointageView';
import AnnoncesView from './components/AnnoncesView';
import SecurityView from './components/SecurityView';
import CustomerServiceView from './components/CustomerServiceView';
import GiftCodeView from './components/GiftCodeView';
import AccountDetailsView from './components/AccountDetailsView';
import PaymentRecordsView from './components/PaymentRecordsView';
import WithdrawalRecordsView from './components/WithdrawalRecordsView';
import AboutUsView from './components/AboutUsView';
import PlatformRulesView from './components/PlatformRulesView';
import AdminView from './components/AdminView';
import { 
  syncUserWithSupabase, 
  submitTransactionToSupabase, 
  fetchUserTransactionsFromSupabase, 
  fetchUserReferralTeam, 
  purchaseVIPProduct,
  fetchPaymentChannelsFromSupabase,
  savePaymentChannelsToSupabase,
  fetchUserProfileFromSupabase,
  fetchVIPPackagesFromSupabase,
  saveVIPPackagesToSupabase,
  fetchAnnouncementsFromSupabase,
  saveAnnouncementsToSupabase,
  fetchGiftCodesFromSupabase,
  saveGiftCodesToSupabase
} from './lib/supabaseService';
import DraggableWhatsAppHeadset from './components/DraggableWhatsAppHeadset';

export type AppTab = 
  | 'accueil' 
  | 'produit' 
  | 'equipe' 
  | 'chat' 
  | 'profil' 
  | 'recharge' 
  | 'retrait' 
  | 'carte_bancaire' 
  | 'historique' 
  | 'pointage' 
  | 'annonces' 
  | 'securite' 
  | 'service_client'
  | 'code_cadeau'
  | 'details_compte'
  | 'registre_paiement'
  | 'registre_retrait'
  | 'a_propos'
  | 'regles_plateforme'
  | 'admin';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('aura_user_xof');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  
  // Navigation State with history stack support
  const [activeTab, setActiveTab] = useState<AppTab>('accueil');
  const [navHistory, setNavHistory] = useState<AppTab[]>(['accueil']);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Core financial state in XOF (F CFA) with synchronous lazy loading
  const [wallet, setWallet] = useState<WalletState>(() => {
    try {
      const saved = localStorage.getItem('aura_wallet_xof');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      balance: 100,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEarnings: 100
    };
  });

  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(() => {
    try {
      const saved = localStorage.getItem('aura_subs_xof');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((s: any) => s.id !== 'sub-demo-1');
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('aura_tx_xof');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [referrals, setReferrals] = useState<ReferralUser[]>(() => {
    try {
      const saved = localStorage.getItem('aura_refs_xof');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((r: any) => !['ref-1', 'ref-2', 'ref-3', 'ref-4'].includes(r.id));
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>(() => {
    try {
      const saved = localStorage.getItem('aura_channels_xof');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PAYMENT_CHANNELS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('aura_announcements_xof');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  const [packages, setPackages] = useState<VIPPackage[]>(VIP_PACKAGES);

  const [giftCodes, setGiftCodes] = useState<GiftCode[]>(() => {
    try {
      const saved = localStorage.getItem('aura_gift_codes_xof');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_GIFT_CODES;
  });

  // References for subscriptions & wallet in intervals
  const subsRef = useRef(subscriptions);
  const walletRef = useRef(wallet);
  const txRef = useRef(transactions);
  subsRef.current = subscriptions;
  walletRef.current = wallet;
  txRef.current = transactions;

  // 1. Initial LocalStorage Restoration
  useEffect(() => {
    const savedUser = localStorage.getItem('aura_user_xof');
    const savedWallet = localStorage.getItem('aura_wallet_xof');
    const savedSubs = localStorage.getItem('aura_subs_xof');
    const savedTx = localStorage.getItem('aura_tx_xof');
    const savedRefs = localStorage.getItem('aura_refs_xof');
    const savedChannels = localStorage.getItem('aura_channels_xof');
    const savedAnnouncements = localStorage.getItem('aura_announcements_xof');
    const savedPackages = localStorage.getItem('aura_packages_xof');
    const savedGiftCodes = localStorage.getItem('aura_gift_codes_xof');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedWallet) {
      try {
        const parsedWallet = JSON.parse(savedWallet);
        setWallet(parsedWallet);
      } catch (e) {
        console.error(e);
      }
    }
    if (savedTx) setTransactions(JSON.parse(savedTx));
    if (savedRefs) {
      try {
        const parsedRefs = JSON.parse(savedRefs);
        if (Array.isArray(parsedRefs)) {
          setReferrals(parsedRefs.filter((r: any) => !['ref-1', 'ref-2', 'ref-3', 'ref-4'].includes(r.id)));
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (savedSubs) {
      try {
        const parsedSubs = JSON.parse(savedSubs);
        if (Array.isArray(parsedSubs)) {
          setSubscriptions(parsedSubs.filter((s: any) => s.id !== 'sub-demo-1'));
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (savedChannels) setPaymentChannels(JSON.parse(savedChannels));
    if (savedAnnouncements) setAnnouncements(JSON.parse(savedAnnouncements));
    if (savedPackages) {
      try {
        const parsed = JSON.parse(savedPackages);
        if (Array.isArray(parsed)) setPackages(parsed);
      } catch (e) {
        console.error(e);
      }
    }
    if (savedGiftCodes) {
      try {
        const parsed = JSON.parse(savedGiftCodes);
        if (Array.isArray(parsed)) setGiftCodes(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch real referral team from Supabase whenever user logs in or updates
  useEffect(() => {
    if (!user) return;
    const cleanPhone = user.phoneNumber || user.email.split('@')[0];
    fetchUserReferralTeam(user.referralCode, cleanPhone).then(team => {
      if (team && Array.isArray(team)) {
        setReferrals(team);
        localStorage.setItem('aura_refs_xof', JSON.stringify(team));
      }
    }).catch(err => console.warn('Error fetching referrals:', err));
  }, [user?.id, user?.referralCode, user?.phoneNumber]);

  // Periodic sync of user transactions & status updates from Supabase/Backend
  useEffect(() => {
    if (!user) return;
    const cleanPhone = user.phoneNumber || user.email.split('@')[0];

    const syncUserTransactions = async () => {
      try {
        const remoteTx = await fetchUserTransactionsFromSupabase(cleanPhone);
        if (remoteTx && Array.isArray(remoteTx) && remoteTx.length > 0) {
          setTransactions(prev => {
            const remoteMap = new Map(remoteTx.map(t => [t.id, t]));
            // Merge with local recent ones
            const merged = remoteTx.slice();
            prev.forEach(localT => {
              if (!remoteMap.has(localT.id)) {
                merged.push(localT);
              }
            });
            localStorage.setItem('aura_tx_xof', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (e) {
        console.warn('Error during periodic transactions sync:', e);
      }
    };

    syncUserTransactions();
    const interval = setInterval(syncUserTransactions, 4000);
    return () => clearInterval(interval);
  }, [user?.id, user?.phoneNumber, user?.email]);

  // Periodic & realtime synchronization of user balance, VIP tier, status and transactions from Supabase
  useEffect(() => {
    if (!user) return;
    const cleanPhone = user.phoneNumber || user.email.split('@')[0];

    const syncUserProfile = async () => {
      try {
        const [profile, remoteTxs] = await Promise.all([
          fetchUserProfileFromSupabase(cleanPhone, user.id),
          fetchUserTransactionsFromSupabase(cleanPhone)
        ]);

        if (profile) {
          setWallet(prev => {
            const nextBal = profile.balance !== undefined ? Number(profile.balance) : prev.balance;
            const nextDeposited = profile.totalRecharged !== undefined ? Number(profile.totalRecharged) : prev.totalDeposited;
            const nextWithdrawn = profile.totalWithdrawn !== undefined ? Number(profile.totalWithdrawn) : prev.totalWithdrawn;

            if (prev.balance !== nextBal || prev.totalDeposited !== nextDeposited || prev.totalWithdrawn !== nextWithdrawn) {
              const updated = {
                ...prev,
                balance: nextBal,
                totalDeposited: nextDeposited,
                totalWithdrawn: nextWithdrawn
              };
              localStorage.setItem('aura_wallet_xof', JSON.stringify(updated));
              return updated;
            }
            return prev;
          });

          setUser(prev => {
            if (!prev) return null;
            const nextVipTier = profile.vipTier || prev.vipTier;
            const nextVipLevel = profile.vipLevel !== undefined ? Number(profile.vipLevel) : prev.vipLevel;
            const nextStatus = profile.status || prev.status;

            if (prev.vipTier !== nextVipTier || prev.vipLevel !== nextVipLevel || prev.status !== nextStatus) {
              const updatedUser = {
                ...prev,
                vipTier: nextVipTier,
                vipLevel: nextVipLevel,
                status: nextStatus
              };
              localStorage.setItem('aura_user_xof', JSON.stringify(updatedUser));
              return updatedUser;
            }
            return prev;
          });
        }

        if (remoteTxs && Array.isArray(remoteTxs) && remoteTxs.length > 0) {
          setTransactions(prev => {
            // Check if there are updates in status or length
            const hasChange = remoteTxs.length !== prev.length || remoteTxs.some((rt, idx) => {
              const pt = prev[idx];
              return !pt || pt.status !== rt.status || pt.amount !== rt.amount;
            });
            if (hasChange) {
              localStorage.setItem('aura_transactions_xof', JSON.stringify(remoteTxs));
              return remoteTxs;
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('Error during user profile live sync:', err);
      }
    };

    syncUserProfile();
    const interval = setInterval(syncUserProfile, 2500);
    const handleFocus = () => syncUserProfile();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id, user?.phoneNumber, user?.email]);

  // Periodic & initial synchronization of packages (products) from central database/server
  useEffect(() => {
    let isMounted = true;
    const syncPackages = async () => {
      try {
        const remotePkgs = await fetchVIPPackagesFromSupabase();
        if (remotePkgs && Array.isArray(remotePkgs) && remotePkgs.length > 0 && isMounted) {
          setPackages(remotePkgs);
        }
      } catch (err) {
        console.warn('Error syncing packages from server:', err);
      }
    };

    syncPackages();
    const interval = setInterval(syncPackages, 2000);
    const handleFocus = () => syncPackages();
    const handleCustomSync = (e: any) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setPackages(e.detail);
      } else {
        syncPackages();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('aura_packages_updated', handleCustomSync);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('aura_packages_updated', handleCustomSync);
    };
  }, []);

  // Periodic & initial synchronization of announcements
  useEffect(() => {
    const syncAnnouncements = async () => {
      try {
        const remoteAnn = await fetchAnnouncementsFromSupabase();
        if (remoteAnn && Array.isArray(remoteAnn)) {
          setAnnouncements(remoteAnn);
          localStorage.setItem('aura_announcements_xof', JSON.stringify(remoteAnn));
        }
      } catch (err) {
        console.warn('Error syncing announcements:', err);
      }
    };

    syncAnnouncements();
    const interval = setInterval(syncAnnouncements, 2500);
    const handleFocus = () => syncAnnouncements();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Periodic & initial synchronization of gift codes
  useEffect(() => {
    const syncGiftCodes = async () => {
      try {
        const remoteCodes = await fetchGiftCodesFromSupabase();
        if (remoteCodes && Array.isArray(remoteCodes)) {
          setGiftCodes(remoteCodes);
          localStorage.setItem('aura_gift_codes_xof', JSON.stringify(remoteCodes));
        }
      } catch (err) {
        console.warn('Error syncing gift codes:', err);
      }
    };

    syncGiftCodes();
    const interval = setInterval(syncGiftCodes, 3000);
    const handleFocus = () => syncGiftCodes();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Periodic & initial synchronization of payment channels for ALL users across the platform
  useEffect(() => {
    const syncChannels = async () => {
      try {
        const remoteChannels = await fetchPaymentChannelsFromSupabase();
        if (remoteChannels && Array.isArray(remoteChannels)) {
          setPaymentChannels(remoteChannels);
          localStorage.setItem('aura_channels_xof', JSON.stringify(remoteChannels));
        }
      } catch (e) {
        console.warn('Error syncing payment channels:', e);
      }
    };

    syncChannels();
    const interval = setInterval(syncChannels, 2000);

    const handleFocus = () => {
      syncChannels();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aura_channels_xof' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setPaymentChannels(parsed);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Storage sync helper
  const syncToStorage = (
    updatedWallet: WalletState,
    updatedSubs: UserSubscription[],
    updatedTx: Transaction[],
    updatedRefs: ReferralUser[],
    updatedChannels?: PaymentChannel[],
    updatedAnnouncements?: Announcement[]
  ) => {
    localStorage.setItem('aura_wallet_xof', JSON.stringify(updatedWallet));
    localStorage.setItem('aura_subs_xof', JSON.stringify(updatedSubs));
    localStorage.setItem('aura_tx_xof', JSON.stringify(updatedTx));
    localStorage.setItem('aura_refs_xof', JSON.stringify(updatedRefs));
    if (updatedChannels) {
      localStorage.setItem('aura_channels_xof', JSON.stringify(updatedChannels));
    }
    if (updatedAnnouncements) {
      localStorage.setItem('aura_announcements_xof', JSON.stringify(updatedAnnouncements));
    }
  };

  const handleUpdatePaymentChannels = (updatedChannels: PaymentChannel[]) => {
    setPaymentChannels(updatedChannels);
    localStorage.setItem('aura_channels_xof', JSON.stringify(updatedChannels));
    savePaymentChannelsToSupabase(updatedChannels).catch(e => console.warn('Supabase channel sync notice:', e));
  };

  const handleUpdatePackages = (updatedPackages: VIPPackage[]) => {
    setPackages(updatedPackages);
    localStorage.setItem('aura_packages_xof', JSON.stringify(updatedPackages));
    window.dispatchEvent(new CustomEvent('aura_packages_updated', { detail: updatedPackages }));
    saveVIPPackagesToSupabase(updatedPackages).catch(e => console.warn('Supabase packages sync notice:', e));
  };

  const handleUpdateSubscriptions = (updatedSubs: UserSubscription[]) => {
    setSubscriptions(updatedSubs);
    localStorage.setItem('aura_subs_xof', JSON.stringify(updatedSubs));
    syncToStorage(wallet, updatedSubs, transactions, referrals, paymentChannels, announcements);
  };

  const handleUpdateGiftCodes = (updatedCodes: GiftCode[]) => {
    setGiftCodes(updatedCodes);
    localStorage.setItem('aura_gift_codes_xof', JSON.stringify(updatedCodes));
    saveGiftCodesToSupabase(updatedCodes).catch(e => console.warn('Supabase gift codes sync notice:', e));
  };

  const handlePublishAnnouncement = (newAnn: { title: string; content: string; isNew?: boolean; tag?: string; actionText?: string; actionTab?: string }) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const created: Announcement = {
      id: `ann-${Date.now()}`,
      title: newAnn.title,
      content: newAnn.content,
      date: formattedDate,
      isNew: newAnn.isNew !== undefined ? newAnn.isNew : true,
      tag: newAnn.tag || 'Offre Spéciale',
      actionText: newAnn.actionText,
      actionTab: newAnn.actionTab
    };

    const updated = [created, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('aura_announcements_xof', JSON.stringify(updated));
    saveAnnouncementsToSupabase(updated).catch(e => console.warn('Supabase announcement sync notice:', e));
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem('aura_announcements_xof', JSON.stringify(updated));
    saveAnnouncementsToSupabase(updated).catch(e => console.warn('Supabase announcement delete notice:', e));
    showNotice("Annonce supprimée avec succès.");
  };

  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 4500);
  };

  // 2. AUTOMATIC 24H REVENUE ENGINE: Checks if 24 hours have elapsed for each active contract
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const currentSubs = subsRef.current;
      const currentWallet = walletRef.current;
      const currentTx = txRef.current;
      const nowTime = Date.now();

      let hasPayout = false;
      let addedRevenue = 0;
      const newTransactions: Transaction[] = [];

      const updatedSubs = currentSubs.map(sub => {
        if (!sub.isActive) return sub;

        const nextPayoutTime = sub.nextPayoutAt ? new Date(sub.nextPayoutAt).getTime() : 0;

        // If 24h cycle reached, drop the daily revenue!
        if (nowTime >= nextPayoutTime && nextPayoutTime > 0) {
          hasPayout = true;
          const timeDiff = Math.max(0, nowTime - nextPayoutTime);
          const cyclesElapsed = 1 + Math.floor(timeDiff / (24 * 60 * 60 * 1000));
          const maxRemaining = (sub.durationDays || 30) - (sub.daysCompleted || 0);
          const cyclesToPay = Math.min(cyclesElapsed, maxRemaining);

          if (cyclesToPay > 0) {
            const earnedAmount = sub.dailyEarnings * cyclesToPay;
            addedRevenue += earnedAmount;
            const nextCompleted = (sub.daysCompleted || 0) + cyclesToPay;
            const isStillActive = nextCompleted < (sub.durationDays || 30);

            newTransactions.push({
              id: `tx-24h-${Date.now()}-${sub.id}`,
              type: 'vip_earning',
              amount: earnedAmount,
              status: 'completed',
              date: new Date().toISOString(),
              description: `Revenu 24h - ${sub.packageName}`,
              details: `Versement automatique des 24h (${cyclesToPay > 1 ? `${cyclesToPay} cycles` : 'Cycle 24h'} • Jour ${nextCompleted}/${sub.durationDays || 30}) • Crédité sur solde disponible`
            });

            return {
              ...sub,
              daysCompleted: nextCompleted,
              lastClaimedAt: new Date().toISOString(),
              nextPayoutAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              isActive: isStillActive
            };
          }
        }

        return sub;
      });

      if (hasPayout && addedRevenue > 0) {
        const updatedWallet: WalletState = {
          ...currentWallet,
          balance: currentWallet.balance + addedRevenue,
          totalEarnings: currentWallet.totalEarnings + addedRevenue
        };
        const updatedTxList = [...newTransactions, ...currentTx];

        setWallet(updatedWallet);
        setSubscriptions(updatedSubs);
        setTransactions(updatedTxList);
        syncToStorage(updatedWallet, updatedSubs, updatedTxList, referrals);
        showNotice(`💰 Revenu 24h versé automatiquement ! +${formatCurrency(addedRevenue)} ajoutés à votre solde.`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, referrals]);

  // Test / Fast-forward 24h Cycle simulation for users to verify 24h earnings immediately
  const handleTrigger24hCycle = () => {
    const activeSubs = subscriptions.filter(s => s.isActive);
    if (activeSubs.length === 0) {
      showNotice("Aucun contrat actif pour le moment. Investissez dans un produit Agroprofit pour activer les gains 24h.");
      return;
    }

    let addedRevenue = 0;
    const newTransactions: Transaction[] = [];

    const updatedSubs = subscriptions.map(sub => {
      if (!sub.isActive) return sub;

      addedRevenue += sub.dailyEarnings;
      const nextCompleted = (sub.daysCompleted || 0) + 1;
      const isStillActive = nextCompleted < (sub.durationDays || 30);

      newTransactions.push({
        id: `tx-24h-${Date.now()}-${sub.id}`,
        type: 'vip_earning',
        amount: sub.dailyEarnings,
        status: 'completed',
        date: new Date().toISOString(),
        description: `Rendement 24h - ${sub.packageName}`,
        details: `Cycle 24h validé (Jour ${nextCompleted}/${sub.durationDays || 30}) • Crédité sur le solde`
      });

      return {
        ...sub,
        daysCompleted: nextCompleted,
        lastClaimedAt: new Date().toISOString(),
        nextPayoutAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isActive: isStillActive
      };
    });

    const updatedWallet: WalletState = {
      ...wallet,
      balance: wallet.balance + addedRevenue,
      totalEarnings: wallet.totalEarnings + addedRevenue
    };
    const updatedTxList = [...newTransactions, ...transactions];

    setWallet(updatedWallet);
    setSubscriptions(updatedSubs);
    setTransactions(updatedTxList);
    syncToStorage(updatedWallet, updatedSubs, updatedTxList, referrals);
    showNotice(`⚡ Cycle 24h exécuté ! +${formatCurrency(addedRevenue)} versés sur votre solde.`);
  };

  // Navigation handlers
  const navigateTo = (tab: string) => {
    const targetTab = tab as AppTab;
    setNavHistory((prev) => [...prev, targetTab]);
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (navHistory.length > 1) {
      const newHistory = [...navHistory];
      newHistory.pop();
      const previous = newHistory[newHistory.length - 1];
      setNavHistory(newHistory);
      setActiveTab(previous);
    } else {
      setActiveTab('accueil');
      setNavHistory(['accueil']);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Login Action
  const handleLoginSuccess = (
    email: string, 
    fullName: string, 
    referrerCode?: string, 
    role: 'admin' | 'user' = 'user',
    phoneNumber?: string,
    password?: string,
    initialBalance?: number
  ) => {
    const cleanPhone = phoneNumber || email.split('@')[0];
    const randomCode = `AURA-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser: User = {
      id: role === 'admin' ? 'usr-admin-root' : `usr-${Date.now().toString().slice(-6)}`,
      email,
      fullName,
      phoneNumber: cleanPhone,
      password: password || 'aura2026',
      registeredAt: new Date().toISOString(),
      referralCode: randomCode,
      referredBy: referrerCode,
      role,
      vipTier: 'VIP 1 Bronze',
      status: 'active'
    };

    setUser(newUser);
    localStorage.setItem('aura_user_xof', JSON.stringify(newUser));

    let currentTxs = transactions;
    if (initialBalance !== undefined) {
      const updatedWallet: WalletState = {
        ...wallet,
        balance: initialBalance,
        totalEarnings: Math.max(wallet.totalEarnings, initialBalance)
      };
      const welcomeTx: Transaction = {
        id: `tx-bonus-${Date.now()}`,
        type: 'vip_earning',
        amount: initialBalance,
        status: 'completed',
        date: new Date().toISOString(),
        description: "Bonus d'inscription offert",
        details: "Crédit de bienvenue de 100 FCFA offert à la création du compte"
      };
      currentTxs = transactions.some(t => t.id.startsWith('tx-bonus-') || (t.description && t.description.includes("Bonus d'inscription")))
        ? transactions
        : [welcomeTx, ...transactions];

      setWallet(updatedWallet);
      setTransactions(currentTxs);
      syncToStorage(updatedWallet, subscriptions, currentTxs, referrals);
    }

    // Supabase sync in background
    syncUserWithSupabase(newUser).then((synced) => {
      if (synced && synced.user) {
        setUser(prev => prev ? { ...prev, ...synced.user } : synced.user);
      }
      if (synced && synced.balance !== undefined) {
        setWallet(prev => ({ ...prev, balance: Number(synced.balance) }));
      }
    }).catch(err => console.warn('Supabase sync user notice:', err));

    // Fetch user transactions from Supabase
    fetchUserTransactionsFromSupabase(cleanPhone).then(remoteTx => {
      if (remoteTx && remoteTx.length > 0) {
        setTransactions(remoteTx);
      }
    }).catch(err => console.warn('Supabase fetch tx notice:', err));

    if (role === 'admin') {
      navigateTo('admin');
      showNotice("Session Administrateur active — Accès complet à la gestion.");
      return;
    }

    showNotice(`Bienvenue ${fullName} sur Aura Invest !`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aura_user_xof');
    setActiveTab('accueil');
    setNavHistory(['accueil']);
  };

  // Financial Operation: Recharge (Manual Deposit via configured payment channels)
  const handleManualDepositSubmit = (data: {
    amount: number;
    channelId: string;
    channelName: string;
    channelNumber: string;
    proofReference: string;
  }) => {
    const newTx: Transaction = {
      id: `tx-dep-${Date.now().toString().slice(-6)}`,
      type: 'deposit',
      amount: data.amount,
      status: 'pending',
      date: new Date().toISOString(),
      description: `Recharge (${data.channelName})`,
      channelName: data.channelName,
      channelNumber: data.channelNumber,
      proofReference: data.proofReference,
      userId: user?.id,
      userName: user?.fullName,
      details: `Recharge manuelle soumise via ${data.channelName} (${data.channelNumber}) • Réf: ${data.proofReference}`
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    syncToStorage(wallet, subscriptions, updatedTx, referrals, paymentChannels);
    submitTransactionToSupabase(newTx).catch(e => console.warn('Supabase submit tx notice:', e));
    showNotice(`Demande de recharge de ${formatCurrency(data.amount)} enregistrée avec succès ! Statut : En attente.`);
  };

  // Financial Operation: Recharge Direct (Legacy / Direct)
  const handleAddDeposit = (amount: number, detailsInfo: string) => {
    const newTx: Transaction = {
      id: `tx-dep-${Date.now()}`,
      type: 'deposit',
      amount,
      status: 'completed',
      date: new Date().toISOString(),
      description: 'Recharge de compte',
      details: detailsInfo || 'Crédité instantanément sur votre solde principal'
    };

    const updatedWallet: WalletState = {
      ...wallet,
      balance: wallet.balance + amount,
      totalDeposited: wallet.totalDeposited + amount
    };

    const updatedTx = [newTx, ...transactions];
    setWallet(updatedWallet);
    setTransactions(updatedTx);
    syncToStorage(updatedWallet, subscriptions, updatedTx, referrals, paymentChannels);
    submitTransactionToSupabase(newTx).catch(e => console.warn('Supabase submit tx notice:', e));
    showNotice(`+${formatCurrency(amount)} crédités sur votre portefeuille avec succès !`);
  };

  // Financial Operation: Retrait (Without specific payment operator)
  const handleAddWithdrawal = (amount: number, destinationAddress: string) => {
    const hasActiveProduct = subscriptions.some(s => s.isActive);
    if (!hasActiveProduct) {
      showNotice("Retrait refusé : Vous devez posséder au moins un contrat/produit VIP actif pour pouvoir retirer.");
      return;
    }

    if (wallet.balance < amount) {
      showNotice("Erreur : Solde disponible insuffisant pour ce retrait.");
      return;
    }

    const cleanPhone = user?.phoneNumber || user?.email?.split('@')[0] || '';

    const newTx: Transaction = {
      id: `tx-wdr-${Date.now()}`,
      userId: user?.id || cleanPhone,
      userName: user?.name || `Adhérent ${cleanPhone}`,
      channelNumber: cleanPhone,
      type: 'withdrawal',
      amount,
      status: 'pending', // Initial status: EN ATTENTE de validation administrative
      date: new Date().toISOString(),
      description: 'Demande de retrait',
      details: destinationAddress || 'En attente d\'approbation par l\'administration'
    };

    const updatedWallet: WalletState = {
      ...wallet,
      balance: wallet.balance - amount
    };

    const updatedTx = [newTx, ...transactions];
    setWallet(updatedWallet);
    setTransactions(updatedTx);
    syncToStorage(updatedWallet, subscriptions, updatedTx, referrals);
    submitTransactionToSupabase(newTx).catch(e => console.warn('Supabase submit tx notice:', e));
    showNotice(`Demande de retrait de ${formatCurrency(amount)} enregistrée avec succès ! Elle est actuellement en attente d'approbation par l'administration.`);
  };

  // Subscription / Investment in a VIP Package (Server-Authoritative & Atomic)
  const handleSubscribeVIP = async (pack: VIPPackage, investAmount: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      showNotice("Veuillez vous connecter pour effectuer un investissement.");
      return { success: false, error: "Non connecté" };
    }

    if (wallet.balance < investAmount) {
      showNotice(`Solde insuffisant pour souscrire à ${pack.name}. Veuillez recharger votre compte.`);
      navigateTo('recharge');
      return { 
        success: false, 
        error: `Solde insuffisant (${wallet.balance.toLocaleString('fr-FR')} F CFA). Prix : ${investAmount.toLocaleString('fr-FR')} F CFA.` 
      };
    }

    try {
      const userPhone = user.phoneNumber || user.email.split('@')[0];
      const res = await purchaseVIPProduct(user.id, userPhone, pack, investAmount);

      if (!res.success) {
        showNotice(res.error || "Échec de l'achat. Veuillez réessayer.");
        return { success: false, error: res.error || "Erreur de validation de l'achat." };
      }

      const authoritativeBalance = res.buyerBalance !== undefined ? res.buyerBalance : Math.max(0, wallet.balance - investAmount);

      const newSub: UserSubscription = res.subscription ? {
        id: res.subscription.id,
        packageId: res.subscription.packageId || pack.id,
        packageName: res.subscription.packageName || pack.name,
        amountInvested: res.subscription.amountInvested || investAmount,
        dailyEarnings: res.subscription.dailyEarnings || pack.dailyEarningsAmount,
        createdAt: res.subscription.createdAt || new Date().toISOString(),
        lastClaimedAt: res.subscription.lastClaimedAt || new Date().toISOString(),
        nextPayoutAt: res.subscription.nextPayoutAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationDays: res.subscription.durationDays || pack.durationDays,
        daysCompleted: res.subscription.daysCompleted || 0,
        expiresAt: res.subscription.expiresAt || new Date(Date.now() + pack.durationDays * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      } : {
        id: `sub-${Date.now()}`,
        packageId: pack.id,
        packageName: pack.name,
        amountInvested: investAmount,
        dailyEarnings: pack.dailyEarningsAmount,
        createdAt: new Date().toISOString(),
        lastClaimedAt: new Date().toISOString(),
        nextPayoutAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationDays: pack.durationDays,
        daysCompleted: 0,
        expiresAt: new Date(Date.now() + pack.durationDays * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      };

      const subTx: Transaction = res.transaction ? {
        id: res.transaction.id,
        type: 'vip_earning',
        amount: investAmount,
        status: 'completed',
        date: res.transaction.date || new Date().toISOString(),
        description: res.transaction.description || `Acquisition : ${pack.name}`,
        details: res.transaction.details || `Revenu : +${formatCurrency(pack.dailyEarningsAmount)} chaque 24h pendant ${pack.durationDays} jours`
      } : {
        id: `tx-vip-${Date.now()}`,
        type: 'vip_earning',
        amount: investAmount,
        status: 'completed',
        date: new Date().toISOString(),
        description: `Acquisition : ${pack.name}`,
        details: `Revenu : +${formatCurrency(pack.dailyEarningsAmount)} chaque 24h pendant ${pack.durationDays} jours`
      };

      const updatedWallet: WalletState = {
        ...wallet,
        balance: authoritativeBalance
      };

      const updatedSubs = [newSub, ...subscriptions];
      const updatedTx = [subTx, ...transactions];

      setWallet(updatedWallet);
      setSubscriptions(updatedSubs);
      setTransactions(updatedTx);
      syncToStorage(updatedWallet, updatedSubs, updatedTx, referrals);

      showNotice(`Félicitations ! Vous avez acquis « ${pack.name} ». Vos gains tomberont toutes les 24h.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || "Erreur de connexion au serveur d'achat.";
      showNotice(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Claim Pointage bonus (strictement 20 F CFA chaque 24h)
  const handleClaimPointage = () => {
    const bonusPointage = 20;
    const pointageTx: Transaction = {
      id: `tx-ptg-${Date.now()}`,
      type: 'vip_earning',
      amount: bonusPointage,
      status: 'completed',
      date: new Date().toISOString(),
      description: 'Pointage Journalier (24h)',
      details: 'Prime de présence quotidienne • +20 F CFA crédités'
    };

    const updatedWallet: WalletState = {
      ...wallet,
      balance: wallet.balance + bonusPointage,
      totalEarnings: wallet.totalEarnings + bonusPointage
    };

    const updatedTx = [pointageTx, ...transactions];
    setWallet(updatedWallet);
    setTransactions(updatedTx);
    syncToStorage(updatedWallet, subscriptions, updatedTx, referrals);
    showNotice(`+${formatCurrency(bonusPointage)} crédités pour votre pointage du jour !`);
  };

  // Gift Code Redemption Engine
  const handleRedeemGiftCode = (codeText: string): { success: boolean; message: string; amount?: number } => {
    const rawCode = codeText.trim().toUpperCase();
    const currentList = giftCodes;

    const matched = currentList.find(c => c.code.toUpperCase() === rawCode && c.isActive);
    if (!matched) {
      return { success: false, message: 'Code cadeau invalide, expiré ou inexistant.' };
    }
    if (matched.usedCount >= matched.maxUses) {
      return { success: false, message: 'Ce code cadeau a atteint sa limite maximale d\'utilisations.' };
    }

    const bonus = matched.amount;
    const updatedWallet: WalletState = {
      ...wallet,
      balance: wallet.balance + bonus,
      totalEarnings: wallet.totalEarnings + bonus
    };

    const giftTx: Transaction = {
      id: `tx-gift-${Date.now()}`,
      type: 'referral_commission',
      amount: bonus,
      status: 'completed',
      date: new Date().toISOString(),
      description: `Code Cadeau : ${rawCode}`,
      details: `Bon d'échange activé • +${formatCurrency(bonus)} crédités au portefeuille`
    };

    const updatedTx = [giftTx, ...transactions];
    const updatedCodes = currentList.map(c => 
      c.code.toUpperCase() === rawCode ? { ...c, usedCount: c.usedCount + 1 } : c
    );

    setWallet(updatedWallet);
    setTransactions(updatedTx);
    setGiftCodes(updatedCodes);
    localStorage.setItem('aura_gift_codes_xof', JSON.stringify(updatedCodes));
    syncToStorage(updatedWallet, subscriptions, updatedTx, referrals);
    showNotice(`Code cadeau validé ! +${formatCurrency(bonus)} ajoutés à votre solde.`);

    return { success: true, message: `Succès ! +${formatCurrency(bonus)} ont été crédités sur votre solde.`, amount: bonus };
  };

  // Referral Simulation Helper
  const handleAddAutoReferral = (level: 1 | 2 | 3, memberName: string, investedAmount: number) => {
    const rate = level === 1 ? 0.15 : level === 2 ? 0.02 : 0.01;
    const commissionTotal = Math.round(investedAmount * rate);

    const newRef: ReferralUser = {
      id: `ref-${Date.now()}`,
      fullName: memberName,
      level,
      dateJoined: new Date().toISOString(),
      status: 'active',
      commissionEarned: commissionTotal
    };

    const commTx: Transaction = {
      id: `tx-comm-${Date.now()}`,
      type: 'referral_commission',
      amount: commissionTotal,
      status: 'completed',
      date: new Date().toISOString(),
      description: `Commission Parrainage (${memberName})`,
      details: `Niveau ${level} (${rate * 100}%) - Investissement ${formatCurrency(investedAmount)}`
    };

    const updatedRefs = [newRef, ...referrals];
    const updatedWallet: WalletState = {
      ...wallet,
      balance: wallet.balance + commissionTotal,
      totalEarnings: wallet.totalEarnings + commissionTotal
    };
    const updatedTx = [commTx, ...transactions];

    setReferrals(updatedRefs);
    setWallet(updatedWallet);
    setTransactions(updatedTx);
    syncToStorage(updatedWallet, subscriptions, updatedTx, updatedRefs);
    showNotice(`Nouveau filleul actif ! +${formatCurrency(commissionTotal)} de commission perçus.`);
  };

  // If user is not authenticated, show modern Auth Screen
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Bottom Navigation 5 Primary Items
  const navigationItems = [
    { id: 'accueil' as AppTab, name: 'Maison', icon: Home },
    { id: 'produit' as AppTab, name: 'Produit', icon: Layers },
    { id: 'equipe' as AppTab, name: 'Équipe', icon: Users },
    { id: 'chat' as AppTab, name: 'Chat', icon: MessageSquare },
    { id: 'profil' as AppTab, name: 'Portefeuille', icon: WalletIcon }
  ];

  // Helper to determine active bottom bar button
  const getActiveNavId = (): AppTab => {
    if (activeTab === 'accueil') return 'accueil';
    if (activeTab === 'produit') return 'produit';
    if (activeTab === 'equipe') return 'equipe';
    if (activeTab === 'chat') return 'chat';
    if (activeTab === 'profil' || activeTab === 'recharge' || activeTab === 'retrait' || activeTab === 'carte_bancaire' || activeTab === 'historique' || activeTab === 'securite') {
      return 'profil';
    }
    return 'accueil';
  };

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-white pb-20 md:pb-6 transition-colors duration-200" id="aura-app-root">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {bannerNotice && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 bg-[#121215] border border-zinc-800 text-white rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold"
            id="app-toast-notice"
          >
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="flex-1 text-zinc-100">{bannerNotice}</span>
            <button
              onClick={() => setBannerNotice(null)}
              className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Dedicated Page Routing Container */}
      <main className="flex-1 p-3 sm:p-5 max-w-2xl mx-auto w-full pb-24" id="main-content-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. Page MAISON (Accueil) */}
            {activeTab === 'accueil' && (
              <DashboardView
                wallet={wallet}
                subscriptions={subscriptions}
                transactions={transactions}
                onNavigate={navigateTo}
                onSubscribeVIP={handleSubscribeVIP}
                onClaimDaily={handleTrigger24hCycle}
                hasClaimable={subscriptions.some(s => s.isActive)}
                claimableAmount={subscriptions.filter(s => s.isActive).reduce((acc, curr) => acc + curr.dailyEarnings, 0)}
              />
            )}

            {/* 2. Page PRODUIT (Catalogue des engins & investissements) */}
            {activeTab === 'produit' && (
              <VIPView
                wallet={wallet}
                activeSubscriptions={subscriptions}
                packages={packages}
                onSubscribe={handleSubscribeVIP}
                onOpenRecharge={() => navigateTo('recharge')}
                onOpenCustomerService={() => navigateTo('service_client')}
              />
            )}

            {/* 3. Page ÉQUIPE (Parrainage 15% L1, 2% L2, 1% L3) */}
            {activeTab === 'equipe' && (
              <ReferralView
                referralCode={user.referralCode}
                referrals={referrals}
                onAddAutoReferral={handleAddAutoReferral}
              />
            )}

            {/* 4. Page CHAT (Salon d'Échange & Assistance) */}
            {activeTab === 'chat' && (
              <ChatView currentUser={user} />
            )}

            {/* 5. Page PORTEFEUILLE (Profil & Hub financier) */}
            {activeTab === 'profil' && (
              <ProfileView
                user={user}
                wallet={wallet}
                transactions={transactions}
                subscriptions={subscriptions}
                onLogout={handleLogout}
                onNavigate={navigateTo}
                onOpenAdmin={user.role === 'admin' ? () => navigateTo('admin') : undefined}
                onRedeemGiftCode={handleRedeemGiftCode}
                onClaimReward={handleClaimPointage}
              />
            )}

            {/* 6. Page DÉDIÉE : RECHARGE DE COMPTE */}
            {activeTab === 'recharge' && (
              <DepositView
                channels={paymentChannels}
                packages={packages}
                onBack={goBack}
                balance={wallet.balance}
                onSubmitManualDeposit={handleManualDepositSubmit}
                transactions={transactions}
              />
            )}

            {/* 7. Page DÉDIÉE : RETRAIT DE FONDS */}
            {activeTab === 'retrait' && (
              <WithdrawView
                wallet={wallet}
                activeProductsCount={subscriptions.filter(s => s.isActive).length}
                onAddWithdrawal={(amt, addr) => {
                  handleAddWithdrawal(amt, addr);
                }}
                onBack={goBack}
                onGoToProducts={() => navigateTo('produit')}
              />
            )}

            {/* 8. Page DÉDIÉE : COORDONNÉES DE RETRAIT & COMPTE */}
            {activeTab === 'carte_bancaire' && (
              <PaymentMethodsView
                onBack={goBack}
              />
            )}

            {/* 9. Page DÉDIÉE : HISTORIQUE COMPLET DES TRANSACTIONS */}
            {activeTab === 'historique' && (
              <HistoryView
                transactions={transactions}
                onBack={goBack}
              />
            )}

            {/* 10. Page DÉDIÉE : POINTAGE QUOTIDIEN */}
            {activeTab === 'pointage' && (
              <PointageView
                onBack={goBack}
                onClaimDaily={handleClaimPointage}
              />
            )}

            {/* 11. Page DÉDIÉE : CENTRE D'ANNONCES & ALERTES */}
            {activeTab === 'annonces' && (
              <AnnoncesView
                announcements={announcements}
                onBack={goBack}
                onNavigate={navigateTo}
              />
            )}

            {/* 12. Page DÉDIÉE : CENTRE DE SÉCURITÉ & MOT DE PASSE */}
            {activeTab === 'securite' && (
              <SecurityView
                onBack={goBack}
              />
            )}

            {/* 13. Page DÉDIÉE : SERVICE CLIENT & SAV 24/7 */}
            {activeTab === 'service_client' && (
              <CustomerServiceView
                currentUser={user}
                onBack={goBack}
              />
            )}

            {/* 14. Page DÉDIÉE : CODE CADEAU */}
            {activeTab === 'code_cadeau' && (
              <GiftCodeView
                onBack={goBack}
                giftCodes={giftCodes}
                onRedeemCode={handleRedeemGiftCode}
              />
            )}

            {/* 15. Page DÉDIÉE : DÉTAILS DU COMPTE */}
            {activeTab === 'details_compte' && (
              <AccountDetailsView
                wallet={wallet}
                transactions={transactions}
                subscriptions={subscriptions}
                onBack={goBack}
              />
            )}

            {/* 16. Page DÉDIÉE : REGISTRES DE PAIEMENT */}
            {activeTab === 'registre_paiement' && (
              <PaymentRecordsView
                transactions={transactions}
                onBack={goBack}
              />
            )}

            {/* 17. Page DÉDIÉE : REGISTRES DE RETRAIT */}
            {activeTab === 'registre_retrait' && (
              <WithdrawalRecordsView
                transactions={transactions}
                onBack={goBack}
              />
            )}

            {/* 18. Page DÉDIÉE : À PROPOS DE NOUS */}
            {activeTab === 'a_propos' && (
              <AboutUsView
                onBack={goBack}
              />
            )}

            {/* 19. Page DÉDIÉE : RÈGLES DE LA PLATEFORME */}
            {activeTab === 'regles_plateforme' && (
              <PlatformRulesView
                onBack={goBack}
              />
            )}

            {/* 20. Page DÉDIÉE : CONSOLE ADMINISTRATEUR */}
            {activeTab === 'admin' && (
              <AdminView
                currentUser={user}
                wallet={wallet}
                transactions={transactions}
                subscriptions={subscriptions}
                packages={packages}
                giftCodes={giftCodes}
                paymentChannels={paymentChannels}
                announcements={announcements}
                onUpdateTransactions={(updatedTx) => {
                  setTransactions(updatedTx);
                  syncToStorage(wallet, subscriptions, updatedTx, referrals, paymentChannels, announcements);
                }}
                onUpdateWallet={(updatedWallet) => {
                  setWallet(updatedWallet);
                  syncToStorage(updatedWallet, subscriptions, transactions, referrals, paymentChannels, announcements);
                }}
                onUpdateSubscriptions={handleUpdateSubscriptions}
                onUpdatePackages={handleUpdatePackages}
                onUpdateGiftCodes={handleUpdateGiftCodes}
                onUpdatePaymentChannels={(updatedChannels) => {
                  handleUpdatePaymentChannels(updatedChannels);
                }}
                onPublishAnnouncement={handlePublishAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onBroadcastMessage={(msg) => showNotice(`[ANNONCE SYSTÈME] ${msg}`)}
                onNavigateToUserDashboard={() => navigateTo('accueil')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* CASQUE DÉPLAÇABLE / DRAGGABLE HEADSET WHATSAPP WIDGET */}
      <DraggableWhatsAppHeadset />

      {/* FIXED 5-ITEMS BOTTOM NAVIGATION BAR */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-30 bg-[#09090b]/95 border-zinc-800/90 text-zinc-400 backdrop-blur-xl px-2 py-1.5 shadow-2xl border-t transition-colors duration-200"
        id="mobile-bottom-nav"
      >
        <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = getActiveNavId() === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                id={`mobile-nav-${item.id}`}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                  active 
                    ? 'text-emerald-400' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${
                  active ? 'text-emerald-400' : ''
                }`}>
                  <IconComponent className={`h-5 w-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>
                <span className={`text-[10px] font-bold tracking-tight ${
                  active 
                    ? 'text-emerald-400 font-black' 
                    : 'text-zinc-500'
                }`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
