import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Radio, 
  Send, 
  PlusCircle, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Sparkles,
  Percent,
  Wallet,
  Eye,
  EyeOff,
  Check,
  X,
  CreditCard,
  Edit2,
  Trash2,
  Power,
  Phone,
  Gift,
  ShoppingBag,
  Clock,
  Megaphone,
  BarChart3,
  Copy,
  Plus,
  Minus,
  ArrowRight,
  Filter,
  UserCheck,
  UserX,
  UserPlus,
  Key,
  Lock,
  Unlock,
  MessageSquare,
  MessageCircle,
  Headphones,
  Mail,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, VIPPackage, WalletState, User, PaymentChannel, UserSubscription, SupportTicket, SupportMessage, Announcement, GiftCode } from '../types';
import { VIP_PACKAGES, formatCurrency } from '../data';
import { 
  adminApproveDeposit, 
  adminRejectDeposit, 
  adminApproveWithdrawal, 
  adminRejectWithdrawal, 
  adminUpdateBalance,
  fetchAdminUsersFromSupabase,
  fetchAdminTransactionsFromSupabase,
  fetchAdminSubscriptionsFromSupabase,
  adminCreateUser,
  adminUpdateUserPassword,
  adminDeleteUser,
  adminUpdateUserStatus,
  fetchAdminSupportTickets,
  sendSupportMessage,
  updateSupportTicketStatus,
  AdminUserRecord
} from '../lib/supabaseService';
import { supabase } from '../lib/supabase';

export type AdminTab = 
  | 'total' 
  | 'deposits' 
  | 'withdrawals' 
  | 'channels' 
  | 'users' 
  | 'products' 
  | 'pending_products' 
  | 'gift_codes' 
  | 'messages' 
  | 'announcements';

interface AdminViewProps {
  currentUser: User;
  wallet: WalletState;
  transactions: Transaction[];
  subscriptions?: UserSubscription[];
  packages?: VIPPackage[];
  giftCodes?: GiftCode[];
  paymentChannels?: PaymentChannel[];
  announcements?: Announcement[];
  onUpdateTransactions: (updated: Transaction[]) => void;
  onUpdateWallet: (updated: WalletState) => void;
  onUpdateSubscriptions?: (updated: UserSubscription[]) => void;
  onUpdatePackages?: (updated: VIPPackage[]) => void;
  onUpdateGiftCodes?: (updated: GiftCode[]) => void;
  onUpdatePaymentChannels?: (updated: PaymentChannel[]) => void;
  onPublishAnnouncement?: (newAnn: { title: string; content: string; isNew?: boolean; tag?: string; actionText?: string; actionTab?: string }) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onBroadcastMessage: (msg: string) => void;
  onNavigateToUserDashboard: () => void;
}

interface MockAdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  balance: number;
  vipTier: string;
  status: 'active' | 'suspended' | 'verified';
  joinedDate: string;
}

interface PendingProductOrder {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  packageName: string;
  price: number;
  dailyReturn: number;
  status: 'pending' | 'active' | 'cancelled';
  createdAt: string;
}

const INITIAL_MOCK_USERS: MockAdminUser[] = [
  { id: 'usr-admin-root', name: 'Administrateur Général Aura', email: 'admin@aurainvest.com', phone: '+237 699 00 00 00', password: 'admin2026', balance: 50000000.0, vipTier: 'VIP 5 Obsidian', status: 'verified', joinedDate: '2026-01-01' }
];

const INITIAL_GIFT_CODES: GiftCode[] = [];

const INITIAL_PENDING_ORDERS: PendingProductOrder[] = [];

export default function AdminView({
  currentUser,
  wallet,
  transactions,
  subscriptions = [],
  packages = [],
  giftCodes: initialGiftCodes = [],
  paymentChannels = [],
  announcements = [],
  onUpdateTransactions,
  onUpdateWallet,
  onUpdateSubscriptions,
  onUpdatePackages,
  onUpdateGiftCodes,
  onUpdatePaymentChannels,
  onPublishAnnouncement,
  onDeleteAnnouncement,
  onBroadcastMessage,
  onNavigateToUserDashboard
}: AdminViewProps) {
  // Main Navigation Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('total');

  // State: Users
  const [usersList, setUsersList] = useState<MockAdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('aura_admin_users_list_xof');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [searchUser, setSearchUser] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  // State: Real Transactions across all platform users
  const [adminTransactions, setAdminTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Load Remote Users from Supabase
  const loadRemoteUsers = async (showToast = false) => {
    setIsLoadingUsers(true);
    try {
      const remoteUsers = await fetchAdminUsersFromSupabase();
      if (remoteUsers && remoteUsers.length > 0) {
        setUsersList(remoteUsers);
        localStorage.setItem('aura_admin_users_list_xof', JSON.stringify(remoteUsers));
        setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        if (showToast) {
          showNotice(`Base de données connectée : ${remoteUsers.length} comptes synchronisés.`);
        }
      }
    } catch (e) {
      console.warn('Error loading remote users in admin:', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load Remote Transactions from Supabase
  const loadRemoteTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const remoteTxs = await fetchAdminTransactionsFromSupabase();
      if (remoteTxs && remoteTxs.length > 0) {
        setAdminTransactions(remoteTxs);
      }
    } catch (e) {
      console.warn('Error loading remote transactions:', e);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Load Remote Subscriptions / Active Investments
  const loadRemoteSubscriptions = async () => {
    try {
      const remoteSubs = await fetchAdminSubscriptionsFromSupabase();
      if (remoteSubs && remoteSubs.length > 0) {
        setUserSubscriptions(prev => {
          const map = new Map<string, UserSubscription>();
          (remoteSubs || []).forEach((s: any) => map.set(s.id, s));
          (prev || []).forEach(s => {
            if (!map.has(s.id)) map.set(s.id, s);
          });
          return Array.from(map.values());
        });
      }
    } catch (e) {
      console.warn('Error loading remote subscriptions:', e);
    }
  };

  // Master synchronization routine
  const refreshAllAdminData = async (showToast = false) => {
    await Promise.all([
      loadRemoteUsers(showToast),
      loadRemoteTransactions(),
      loadRemoteSubscriptions()
    ]);
  };

  useEffect(() => {
    // 1. Initial full fetch
    refreshAllAdminData();

    // 2. Continuous real-time polling every 3.5 seconds for cross-device synchronization
    const intervalId = setInterval(() => {
      refreshAllAdminData();
    }, 3500);

    // 3. Supabase Realtime Channels for instant updates
    const usersChannel = supabase
      .channel('admin_users_realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        loadRemoteUsers();
      })
      .subscribe();

    const txChannel = supabase
      .channel('admin_tx_realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        loadRemoteTransactions();
        loadRemoteUsers();
      })
      .subscribe();

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(txChannel);
    };
  }, []);

  // Merge database transactions with any prop transactions (deduplicated by ID)
  const allPlatformTransactions = React.useMemo(() => {
    const map = new Map<string, Transaction>();
    (adminTransactions || []).forEach(t => map.set(t.id, t));
    (transactions || []).forEach(t => {
      if (!map.has(t.id)) map.set(t.id, t);
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [adminTransactions, transactions]);

  // Balance Adjust Modal (+ Ajouter / - Retirer)
  const [adjustingUser, setAdjustingUser] = useState<MockAdminUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Password Modification Modal
  const [passwordModalUser, setPasswordModalUser] = useState<MockAdminUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [showPasswordText, setShowPasswordText] = useState<boolean>(true);

  // User Deletion Modal
  const [deleteUserModalUser, setDeleteUserModalUser] = useState<MockAdminUser | null>(null);

  // New User Creation Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('aura2026');
  const [newUserBalance, setNewUserBalance] = useState('10000');
  const [newUserVipTier, setNewUserVipTier] = useState('VIP 1 Bronze');

  // State: VIP Packages
  const [editablePackages, setEditablePackages] = useState<VIPPackage[]>(() => {
    if (packages !== undefined) return packages;
    try {
      const saved = localStorage.getItem('aura_packages_xof');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return VIP_PACKAGES;
  });

  // State: Add Package Modal
  const [isAddPackageModalOpen, setIsAddPackageModalOpen] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgLevel, setNewPkgLevel] = useState('1');
  const [newPkgPrice, setNewPkgPrice] = useState('10000');
  const [newPkgDailyReturn, setNewPkgDailyReturn] = useState('300');
  const [newPkgDuration, setNewPkgDuration] = useState('45');
  const [newPkgImage, setNewPkgImage] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800');

  // State: User Active Subscriptions (Paid Products on site)
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>(() => {
    if (subscriptions !== undefined) return subscriptions;
    try {
      const saved = localStorage.getItem('aura_subs_xof');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // State: Pending Orders / Products to Pay
  const [pendingOrders, setPendingOrders] = useState<PendingProductOrder[]>(() => {
    try {
      const saved = localStorage.getItem('aura_pending_orders_xof');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PENDING_ORDERS;
  });

  // State: Gift Codes
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>(() => {
    if (initialGiftCodes !== undefined) return initialGiftCodes;
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
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [newGiftCode, setNewGiftCode] = useState('');
  const [newGiftAmount, setNewGiftAmount] = useState('5000');
  const [newGiftMaxUses, setNewGiftMaxUses] = useState('50');

  // State: Payment Channels Modal & Filter
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<PaymentChannel | null>(null);
  const [channelFormCountry, setChannelFormCountry] = useState<'Togo' | 'Cameroun' | 'Burkina Faso'>('Togo');
  const [channelFormName, setChannelFormName] = useState('');
  const [channelFormNumber, setChannelFormNumber] = useState('');
  const [channelFormAccountName, setChannelFormAccountName] = useState('');
  const [channelFormInstructions, setChannelFormInstructions] = useState('');
  const [channelFormBadge, setChannelFormBadge] = useState('');
  const [channelFormIsActive, setChannelFormIsActive] = useState(true);
  const [adminChannelCountryFilter, setAdminChannelCountryFilter] = useState<'all' | 'Togo' | 'Cameroun' | 'Burkina Faso'>('all');

  // State: Broadcasts / Announcements
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastTag, setBroadcastTag] = useState('Offre Spéciale');
  const [broadcastIsNew, setBroadcastIsNew] = useState(true);
  const [broadcastHistory, setBroadcastHistory] = useState<Array<{ id: string; text: string; date: string }>>([
    { id: 'bc-1', text: 'Bienvenue sur Aura Invest ! Les retraits sont traités 24h/24 et 7j/7 sans interruption.', date: '2026-05-25 10:00' },
    { id: 'bc-2', text: 'Mise à jour des canaux de paiement Wave et Orange Money pour des recharges instantanées.', date: '2026-05-26 14:30' }
  ]);

  // State: Support Tickets / Messages System
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem('aura_support_tickets_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'ticket-demo-1',
        userId: 'usr-1002',
        userName: 'Marc Dubois',
        userEmail: 'marc.dubois@gmail.com',
        userPhone: '+225 07 48 12 34',
        subject: 'Délai validation retrait Wave',
        status: 'open',
        unreadByAdmin: true,
        unreadByUser: false,
        createdAt: '2026-05-27 10:14',
        updatedAt: '2026-05-27 10:14',
        messages: [
          {
            id: 'msg-1',
            sender: 'user',
            text: 'Bonjour administrateur, j\'ai effectué un retrait de 50 000 F CFA sur mon compte Wave il y a 10 minutes. Pouvez-vous vérifier ? Merci d\'avance !',
            timestamp: '10:14'
          }
        ]
      },
      {
        id: 'ticket-demo-2',
        userId: 'usr-1003',
        userName: 'Sophia Alami',
        userEmail: 'sophia.alami@outlook.com',
        userPhone: '+237 655 89 21 00',
        subject: 'Souscription VIP 4 et commissions',
        status: 'answered',
        unreadByAdmin: false,
        unreadByUser: false,
        createdAt: '2026-05-26 15:30',
        updatedAt: '2026-05-26 15:45',
        messages: [
          {
            id: 'msg-2',
            sender: 'user',
            text: 'Bonjour, j\'ai parrainé 3 membres de mon équipe pour les camions VIP 3. À quelle heure sont distribuées les commissions de niveau 1 ?',
            timestamp: '15:30'
          },
          {
            id: 'msg-3',
            sender: 'admin',
            text: 'Bonjour Sophia, les commissions de 30% sont créditées immédiatement et automatiquement sur votre solde retirable dès validation du paiement.',
            timestamp: '15:45'
          }
        ]
      }
    ];
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(() => {
    return 'ticket-demo-1';
  });
  const [adminReplyText, setAdminReplyText] = useState('');

  // Sync tickets to localStorage and backend
  const saveSupportTickets = (updated: SupportTicket[]) => {
    setSupportTickets(updated);
    try {
      localStorage.setItem('aura_support_tickets_v1', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Keep state in sync with props and poll remote support tickets
  useEffect(() => {
    if (subscriptions !== undefined) {
      setUserSubscriptions(subscriptions);
    }
  }, [subscriptions]);

  useEffect(() => {
    if (initialGiftCodes !== undefined) {
      setGiftCodes(initialGiftCodes);
    }
  }, [initialGiftCodes]);

  useEffect(() => {
    if (packages !== undefined) {
      setEditablePackages(packages);
    }
  }, [packages]);

  // Load and poll tickets from backend
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const remoteTickets = await fetchAdminSupportTickets();
        if (remoteTickets && remoteTickets.length > 0) {
          setSupportTickets(remoteTickets);
          localStorage.setItem('aura_support_tickets_v1', JSON.stringify(remoteTickets));
          if (!selectedTicketId) {
            setSelectedTicketId(remoteTickets[0].id);
          }
        }
      } catch (err) {
        console.warn('Error polling admin tickets:', err);
      }
    };

    loadTickets();
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen to cross-tab updates
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aura_support_tickets_v1' && e.newValue) {
        try {
          setSupportTickets(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handler: Admin replies to user message
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !adminReplyText.trim()) return;

    const replyText = adminReplyText.trim();
    const replyMsg: SupportMessage = {
      id: `msg-adm-${Date.now()}`,
      sender: 'admin',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = supportTickets.map(t => {
      if (t.id === selectedTicketId) {
        return {
          ...t,
          status: 'answered' as const,
          unreadByAdmin: false,
          unreadByUser: true,
          updatedAt: new Date().toISOString(),
          messages: [...t.messages, replyMsg]
        };
      }
      return t;
    });

    saveSupportTickets(updated);
    setAdminReplyText('');

    // Push to backend API
    try {
      const selectedTicket = supportTickets.find(t => t.id === selectedTicketId);
      await sendSupportMessage({
        ticketId: selectedTicketId,
        userId: selectedTicket?.userId || 'usr-guest',
        userName: selectedTicket?.userName,
        userEmail: selectedTicket?.userEmail,
        userPhone: selectedTicket?.userPhone,
        sender: 'admin',
        text: replyText
      });
    } catch (err) {
      console.warn('Error sending support reply to backend:', err);
    }

    showNotice("Réponse envoyée au client avec succès !");
  };

  // Handler: Toggle ticket status or delete
  const handleToggleTicketStatus = async (ticketId: string, currentStatus: string) => {
    const newStatus: 'open' | 'answered' | 'closed' = currentStatus === 'closed' ? 'open' : 'closed';
    const updated = supportTickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    saveSupportTickets(updated);

    try {
      await updateSupportTicketStatus(ticketId, newStatus);
    } catch (err) {
      console.warn('Error updating ticket status on backend:', err);
    }

    showNotice(`Statut du ticket mis à jour : ${newStatus}`);
  };

  const handleDeleteTicket = (ticketId: string) => {
    const updated = supportTickets.filter(t => t.id !== ticketId);
    saveSupportTickets(updated);
    if (selectedTicketId === ticketId) {
      setSelectedTicketId(updated.length > 0 ? updated[0].id : null);
    }
    showNotice("Ticket supprimé avec succès.");
  };

  // Notifications
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Filter state for deposits/withdrawals tables
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  const showNotice = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // Counts for tabs badges and data lists (Derived from live DB transactions across all users)
  const depositsList = allPlatformTransactions.filter(t => t.type === 'deposit');
  const withdrawalsList = allPlatformTransactions.filter(t => t.type === 'withdrawal');
  const pendingDepositsCount = depositsList.filter(t => t.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawalsList.filter(t => t.status === 'pending').length;
  const pendingOrdersCount = pendingOrders.filter(o => o.status === 'pending').length;
  const pendingTicketsCount = supportTickets.filter(t => t.status === 'open' || t.unreadByAdmin).length;

  // Transactions Filtering
  const filteredDeposits = depositsList.filter(t => depositFilter === 'all' ? true : t.status === depositFilter);
  const filteredWithdrawals = withdrawalsList.filter(t => withdrawalFilter === 'all' ? true : t.status === withdrawalFilter);

  // Total financial calculations (Exact sums computed from 100% real database records)
  const totalApprovedDeposits = depositsList
    .filter(t => t.status === 'completed')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalPaidWithdrawals = withdrawalsList
    .filter(t => t.status === 'completed')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalUsersBalance = usersList
    .reduce((acc, u) => acc + (Number(u.balance) || 0), 0);

  // ACTION: Approve Deposit
  const handleApproveDeposit = (id: string) => {
    const targetTx = allPlatformTransactions.find(t => t.id === id);
    const updated = allPlatformTransactions.map(t => {
      if (t.id === id) {
        return { ...t, status: 'completed' as const, details: `${t.details || ''} [Validé le ${new Date().toLocaleTimeString()}]` };
      }
      return t;
    });

    setAdminTransactions(updated);

    if (targetTx && targetTx.type === 'deposit') {
      onUpdateWallet({
        ...wallet,
        balance: wallet.balance + targetTx.amount,
        totalDeposited: wallet.totalDeposited + targetTx.amount
      });
      showNotice(`Dépôt de ${formatCurrency(targetTx.amount)} approuvé et crédité avec succès !`);
      // Sync with Supabase via Service Role endpoint
      adminApproveDeposit(id, targetTx.userId, targetTx.amount)
        .then(() => refreshAllAdminData())
        .catch(err => console.warn('Supabase deposit sync:', err));
    }

    onUpdateTransactions(updated);
  };

  // ACTION: Reject Deposit
  const handleRejectDeposit = (id: string) => {
    const updated = allPlatformTransactions.map(t => {
      if (t.id === id) {
        return { ...t, status: 'failed' as const, details: `${t.details || ''} [Rejeté par Admin : Référence invalide]` };
      }
      return t;
    });
    setAdminTransactions(updated);
    onUpdateTransactions(updated);
    showNotice(`Dépôt ${id} rejeté.`);
    // Sync with Supabase via Service Role endpoint
    adminRejectDeposit(id, 'Référence invalide')
      .then(() => refreshAllAdminData())
      .catch(err => console.warn('Supabase reject sync:', err));
  };

  // ACTION: Approve Withdrawal
  const handleApproveWithdrawal = (id: string) => {
    const targetTx = allPlatformTransactions.find(t => t.id === id);
    const updated = allPlatformTransactions.map(t => {
      if (t.id === id) {
        return { ...t, status: 'completed' as const, details: `${t.details || ''} [Virement effectué avec succès]` };
      }
      return t;
    });
    setAdminTransactions(updated);
    onUpdateTransactions(updated);
    showNotice(`Retrait de ${formatCurrency(targetTx?.amount || 0)} validé et marqué comme payé.`);
    // Sync with Supabase via Service Role endpoint
    adminApproveWithdrawal(id)
      .then(() => refreshAllAdminData())
      .catch(err => console.warn('Supabase approve withdrawal sync:', err));
  };

  // ACTION: Reject Withdrawal (Refunds user)
  const handleRejectWithdrawal = (id: string) => {
    const targetTx = allPlatformTransactions.find(t => t.id === id);
    const updated = allPlatformTransactions.map(t => {
      if (t.id === id) {
        return { ...t, status: 'failed' as const, details: `${t.details || ''} [Rejeté : Coordonnées incorrectes]` };
      }
      return t;
    });

    setAdminTransactions(updated);

    if (targetTx && targetTx.type === 'withdrawal') {
      onUpdateWallet({
        ...wallet,
        balance: wallet.balance + targetTx.amount,
        totalWithdrawn: Math.max(0, wallet.totalWithdrawn - targetTx.amount)
      });
      showNotice(`Retrait de ${formatCurrency(targetTx.amount)} annulé et remboursé sur le solde.`);
      // Sync with Supabase via Service Role endpoint
      adminRejectWithdrawal(id, targetTx.userId, targetTx.amount, 'Coordonnées incorrectes')
        .then(() => refreshAllAdminData())
        .catch(err => console.warn('Supabase reject withdrawal sync:', err));
    }

    onUpdateTransactions(updated);
  };

  // ACTION: Permanently delete any transaction (Deposit or Withdrawal)
  const handleDeleteTransaction = (id: string, type: 'deposit' | 'withdrawal') => {
    const updated = allPlatformTransactions.filter(t => t.id !== id);
    setAdminTransactions(updated);
    onUpdateTransactions(updated);
    try {
      localStorage.setItem('aura_tx_xof', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showNotice(`Transaction ${type === 'deposit' ? 'de dépôt' : 'de retrait'} (${id}) définitivement supprimée.`);
  };

  // ACTION: Channels Management
  const handleOpenNewChannelModal = () => {
    setEditingChannel(null);
    setChannelFormCountry('Togo');
    setChannelFormName('T-Money');
    setChannelFormNumber('+228 90');
    setChannelFormAccountName('Service Financier Togo');
    setChannelFormInstructions('1. Composez le code *145# ou ouvrez l\'application T-Money.\n2. Effectuez le transfert vers le numéro indiqué ci-dessus.\n3. Copiez la référence de transaction SMS reçue.\n4. Renseignez la référence et validez la recharge.');
    setChannelFormBadge('Recommandé 🇹🇬');
    setChannelFormIsActive(true);
    setIsChannelModalOpen(true);
  };

  const handleOpenEditChannelModal = (channel: PaymentChannel) => {
    setEditingChannel(channel);
    const num = (channel.accountNumber || '').trim();
    const chName = (channel.name || '').toLowerCase();
    const cCode = (channel.countryCode || '').toLowerCase();
    const cName = (channel.country || '').toLowerCase();

    let inferredCountry: 'Togo' | 'Cameroun' | 'Burkina Faso' = 'Togo';
    if (
      cCode === 'cm' || 
      cName.includes('cameroun') || 
      num.startsWith('+237') || 
      chName.includes('cameroun') || 
      channel.id.includes('-cm-')
    ) {
      inferredCountry = 'Cameroun';
    } else if (
      cCode === 'bf' || 
      cName.includes('burkina') || 
      num.startsWith('+226') || 
      chName.includes('burkina') || 
      channel.id.includes('-bf-')
    ) {
      inferredCountry = 'Burkina Faso';
    } else {
      inferredCountry = 'Togo';
    }

    setChannelFormCountry(inferredCountry);
    setChannelFormName(channel.name);
    setChannelFormNumber(channel.accountNumber);
    setChannelFormAccountName(channel.accountName || '');
    setChannelFormInstructions(channel.instructions);
    setChannelFormBadge(channel.badge || '');
    setChannelFormIsActive(channel.isActive);
    setIsChannelModalOpen(true);
  };

  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelFormName.trim() || !channelFormNumber.trim()) {
      alert('Veuillez renseigner le nom et le numéro de paiement.');
      return;
    }

    const countryCode = channelFormCountry === 'Togo' ? 'tg' : channelFormCountry === 'Cameroun' ? 'cm' : 'bf';

    if (editingChannel) {
      const updated = paymentChannels.map(c => {
        if (c.id === editingChannel.id) {
          return {
            ...c,
            country: channelFormCountry,
            countryCode,
            name: channelFormName.trim(),
            accountNumber: channelFormNumber.trim(),
            accountName: channelFormAccountName.trim(),
            instructions: channelFormInstructions.trim(),
            badge: channelFormBadge.trim() || undefined,
            isActive: channelFormIsActive
          };
        }
        return c;
      });
      if (onUpdatePaymentChannels) onUpdatePaymentChannels(updated);
      showNotice(`Canal « ${channelFormName} » (${channelFormCountry}) mis à jour.`);
    } else {
      const newChannel: PaymentChannel = {
        id: `chan-${countryCode}-${Date.now()}`,
        country: channelFormCountry,
        countryCode,
        name: channelFormName.trim(),
        accountNumber: channelFormNumber.trim(),
        accountName: channelFormAccountName.trim(),
        instructions: channelFormInstructions.trim(),
        badge: channelFormBadge.trim() || undefined,
        isActive: channelFormIsActive,
        createdAt: new Date().toISOString().split('T')[0]
      };
      if (onUpdatePaymentChannels) onUpdatePaymentChannels([newChannel, ...paymentChannels]);
      showNotice(`Nouveau canal « ${channelFormName} » (${channelFormCountry}) créé.`);
    }
    setIsChannelModalOpen(false);
  };

  const handleToggleChannelStatus = (channelId: string) => {
    const updated = paymentChannels.map(c => {
      if (c.id === channelId) {
        const nextState = !c.isActive;
        showNotice(`Canal « ${c.name} » ${nextState ? 'activé' : 'désactivé'}.`);
        return { ...c, isActive: nextState };
      }
      return c;
    });
    if (onUpdatePaymentChannels) onUpdatePaymentChannels(updated);
  };

  const handleDeleteChannel = (channelId: string, channelName: string) => {
    const updated = paymentChannels.filter(c => c.id !== channelId);
    if (onUpdatePaymentChannels) onUpdatePaymentChannels(updated);
    try {
      localStorage.setItem('aura_channels_xof', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showNotice(`Canal « ${channelName} » supprimé avec succès.`);
  };

  const updateAndSaveUsers = (newUsers: MockAdminUser[]) => {
    setUsersList(newUsers);
    try {
      localStorage.setItem('aura_admin_users_list_xof', JSON.stringify(newUsers));
    } catch (e) {
      console.error(e);
    }
  };

  // ACTION: Open user adjustment modal (+ Ajouter ou - Retirer)
  const handleOpenAdjustModal = (targetUser: MockAdminUser, type: 'credit' | 'debit') => {
    setAdjustingUser(targetUser);
    setAdjustType(type);
    setAdjustAmount('');
    setAdjustReason(type === 'credit' ? 'Crédit Administrateur / Bonus' : 'Débit Administrateur / Retrait');
  };

  // ACTION: User Adjustment execution
  const handleExecuteUserAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;
    const val = parseFloat(adjustAmount);
    if (isNaN(val) || val <= 0) {
      alert('Veuillez spécifier un montant valide.');
      return;
    }

    const multiplier = adjustType === 'credit' ? 1 : -1;
    const updatedUsers = usersList.map(u => {
      if (u.id === adjustingUser.id) {
        const nextBal = Math.max(0, u.balance + (val * multiplier));
        return { ...u, balance: nextBal };
      }
      return u;
    });
    updateAndSaveUsers(updatedUsers);

    if (adjustingUser.email === currentUser.email || adjustingUser.name === currentUser.fullName) {
      onUpdateWallet({
        ...wallet,
        balance: Math.max(0, wallet.balance + (val * multiplier)),
        totalEarnings: adjustType === 'credit' ? wallet.totalEarnings + val : wallet.totalEarnings
      });
    }

    const adjustTx: Transaction = {
      id: `tx-adj-${Date.now().toString().slice(-5)}`,
      type: adjustType === 'credit' ? 'deposit' : 'withdrawal',
      amount: val,
      status: 'completed',
      date: new Date().toISOString(),
      description: `Ajustement Admin (${adjustType === 'credit' ? 'Crédit / Ajout' : 'Débit / Retrait'})`,
      details: `Régularisation compte pour ${adjustingUser.name} (${adjustingUser.phone}) • Motif: ${adjustReason || 'Manuel'}`
    };

    onUpdateTransactions([adjustTx, ...transactions]);
    showNotice(`Solde de ${adjustingUser.name} ${adjustType === 'credit' ? 'crédité de +' : 'débité de -'}${formatCurrency(val)}.`);
    
    // Sync with Supabase using Service Role Key
    adminUpdateBalance(adjustingUser.id, adjustingUser.phone, val, adjustType, adjustReason)
      .catch(err => console.warn('Supabase balance sync:', err));

    setAdjustingUser(null);
    setAdjustAmount('');
    setAdjustReason('');
  };

  // ACTION: Password Modification
  const handleOpenPasswordModal = (targetUser: MockAdminUser) => {
    setPasswordModalUser(targetUser);
    setNewPasswordInput(targetUser.password || 'aura2026');
    setShowPasswordText(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    if (!newPasswordInput.trim()) {
      alert('Veuillez saisir un mot de passe.');
      return;
    }

    const newPwd = newPasswordInput.trim();
    const updated = usersList.map(u => {
      if (u.id === passwordModalUser.id) {
        return { ...u, password: newPwd };
      }
      return u;
    });
    updateAndSaveUsers(updated);
    showNotice(`Le mot de passe de « ${passwordModalUser.name} » a été modifié avec succès.`);
    
    // Sync with Supabase
    adminUpdateUserPassword(passwordModalUser.id, passwordModalUser.phone, newPwd)
      .then(() => loadRemoteUsers())
      .catch(err => console.warn('Supabase password sync err:', err));

    setPasswordModalUser(null);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(res);
  };

  // ACTION: User Deletion
  const handleOpenDeleteModal = (targetUser: MockAdminUser) => {
    setDeleteUserModalUser(targetUser);
  };

  const handleConfirmDeleteUser = () => {
    if (!deleteUserModalUser) return;
    const target = deleteUserModalUser;
    const updated = usersList.filter(u => u.id !== target.id);
    updateAndSaveUsers(updated);
    showNotice(`Le compte de ${target.name} (${target.phone}) a été définitivement supprimé.`);
    
    // Sync with Supabase
    adminDeleteUser(target.id, target.phone)
      .then(() => loadRemoteUsers())
      .catch(err => console.warn('Supabase delete user err:', err));

    setDeleteUserModalUser(null);
  };

  // ACTION: Toggle user status
  const handleToggleUserStatus = (userId: string) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';

    const updated = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, status: nextStatus as MockAdminUser['status'] };
      }
      return u;
    });
    updateAndSaveUsers(updated);
    showNotice(`Statut de ${targetUser.name} changé en ${nextStatus === 'suspended' ? 'Suspendu' : 'Actif'}.`);
    
    // Sync with Supabase
    adminUpdateUserStatus(targetUser.id, targetUser.phone, nextStatus)
      .then(() => loadRemoteUsers())
      .catch(err => console.warn('Supabase status sync err:', err));
  };

  // ACTION: Create new user manually
  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim()) {
      alert('Veuillez renseigner au moins le nom et le numéro de téléphone.');
      return;
    }
    const created: MockAdminUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newUserName.trim(),
      phone: newUserPhone.trim(),
      email: newUserEmail.trim() || `${newUserPhone.replace(/\s+/g, '')}@aurainvest.com`,
      password: newUserPassword.trim() || 'aura2026',
      balance: parseFloat(newUserBalance) || 0,
      vipTier: newUserVipTier,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    const updated = [created, ...usersList];
    updateAndSaveUsers(updated);
    showNotice(`Utilisateur ${created.name} créé avec succès.`);
    
    // Sync with Supabase
    adminCreateUser({
      name: created.name,
      phone: created.phone,
      email: created.email,
      password: created.password,
      balance: created.balance,
      vipTier: created.vipTier
    })
      .then(() => loadRemoteUsers())
      .catch(err => console.warn('Supabase create user err:', err));

    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserPhone('');
    setNewUserEmail('');
    setNewUserPassword('aura2026');
    setNewUserBalance('10000');
  };

  // ACTION: VIP Package Management (Catalogue)
  const handlePackageFieldChange = (index: number, field: keyof VIPPackage, value: any) => {
    const next = [...editablePackages];
    next[index] = { ...next[index], [field]: value };
    setEditablePackages(next);
  };

  const handleSavePackages = () => {
    if (onUpdatePackages) onUpdatePackages(editablePackages);
    try {
      localStorage.setItem('aura_packages_xof', JSON.stringify(editablePackages));
    } catch (e) {
      console.error(e);
    }
    showNotice('Catalogue et rendements des produits VIP enregistrés avec succès.');
  };

  const handleDeletePackage = (packageId: string, packageName: string) => {
    const updated = editablePackages.filter(p => p.id !== packageId);
    setEditablePackages(updated);
    if (onUpdatePackages) onUpdatePackages(updated);
    try {
      localStorage.setItem('aura_packages_xof', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showNotice(`Produit « ${packageName} » supprimé du site.`);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const priceVal = parseFloat(newPkgPrice);
    const dailyVal = parseFloat(newPkgDailyReturn);
    const durationVal = parseInt(newPkgDuration, 10);
    const levelVal = parseInt(newPkgLevel, 10) || 1;

    if (!newPkgName.trim() || isNaN(priceVal) || priceVal <= 0) {
      alert('Veuillez renseigner un nom valide et un prix supérieur à 0.');
      return;
    }

    const calculatedDailyRate = priceVal > 0 ? Number(((dailyVal / priceVal) * 100).toFixed(2)) : 0;
    const newPackage: VIPPackage = {
      id: `vip-pack-${Date.now()}`,
      name: newPkgName.trim(),
      level: levelVal,
      tag: `VIP ${levelVal}`,
      minInvestment: priceVal,
      dailyRate: calculatedDailyRate,
      dailyEarningsAmount: dailyVal,
      totalEarningsAmount: dailyVal * (durationVal || 45),
      durationDays: durationVal || 45,
      features: [
        `Gain quotidien : ${formatCurrency(dailyVal)}`,
        `Durée : ${durationVal || 45} jours`,
        'Retraits automatisés sans restriction'
      ],
      description: `Véhicule d'investissement performant de niveau VIP ${levelVal}.`,
      image: newPkgImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
    };

    const updated = [...editablePackages, newPackage];
    setEditablePackages(updated);
    if (onUpdatePackages) onUpdatePackages(updated);
    try {
      localStorage.setItem('aura_packages_xof', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setIsAddPackageModalOpen(false);
    setNewPkgName('');
    showNotice(`Produit « ${newPackage.name} » ajouté au catalogue avec succès !`);
  };

  // ACTION: User Subscriptions / Paid Products Removal
  const handleDeleteUserSubscription = (subId: string, subName: string) => {
    const updated = userSubscriptions.filter(s => s.id !== subId);
    setUserSubscriptions(updated);
    if (onUpdateSubscriptions) onUpdateSubscriptions(updated);
    try {
      localStorage.setItem('aura_subs_xof', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showNotice(`Souscription « ${subName} » supprimée avec succès du compte et du site.`);
  };

  // ACTION: Pending Products / Orders
  const handleApproveOrder = (orderId: string) => {
    const updated = pendingOrders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'active' as const };
      }
      return o;
    });
    setPendingOrders(updated);
    showNotice(`Commande ${orderId} validée et produit activé.`);
  };

  const handleCancelOrder = (orderId: string) => {
    const updated = pendingOrders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'cancelled' as const };
      }
      return o;
    });
    setPendingOrders(updated);
    showNotice(`Commande ${orderId} annulée.`);
  };

  const handleDeletePendingOrder = (orderId: string) => {
    const updated = pendingOrders.filter(o => o.id !== orderId);
    setPendingOrders(updated);
    showNotice(`Commande ${orderId} supprimée.`);
  };

  // ACTION: Gift Codes
  const handleCreateGiftCode = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newGiftAmount);
    const usesVal = parseInt(newGiftMaxUses, 10);
    const generatedCode = newGiftCode.trim().toUpperCase() || `AURA-GIFT-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Montant invalide.');
      return;
    }

    const newCodeItem: GiftCode = {
      id: `gc-${Date.now()}`,
      code: generatedCode,
      amount: amountVal,
      maxUses: isNaN(usesVal) || usesVal <= 0 ? 1 : usesVal,
      usedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: '2026-12-31'
    };

    const updated = [newCodeItem, ...giftCodes];
    setGiftCodes(updated);
    if (onUpdateGiftCodes) onUpdateGiftCodes(updated);
    try {
      localStorage.setItem('aura_gift_codes_xof', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setIsGiftModalOpen(false);
    setNewGiftCode('');
    showNotice(`Code cadeau « ${generatedCode} » (${formatCurrency(amountVal)}) généré.`);
  };

  const handleDeleteGiftCode = (codeId: string) => {
    const updated = giftCodes.filter(c => c.id !== codeId);
    setGiftCodes(updated);
    if (onUpdateGiftCodes) onUpdateGiftCodes(updated);
    try {
      localStorage.setItem('aura_gift_codes_xof', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showNotice('Code cadeau supprimé du système.');
  };

  const handleToggleGiftCode = (codeId: string) => {
    const updated = giftCodes.map(c => {
      if (c.id === codeId) {
        const nextActive = !c.isActive;
        showNotice(`Code cadeau ${c.code} ${nextActive ? 'activé' : 'désactivé'}.`);
        return { ...c, isActive: nextActive };
      }
      return c;
    });
    setGiftCodes(updated);
    if (onUpdateGiftCodes) onUpdateGiftCodes(updated);
    try {
      localStorage.setItem('aura_gift_codes_xof', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };


  // ACTION: Broadcast / Announcement
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    const title = broadcastTitle.trim() || broadcastText.trim().slice(0, 50) + (broadcastText.trim().length > 50 ? '...' : '');
    
    if (onPublishAnnouncement) {
      onPublishAnnouncement({
        title,
        content: broadcastText.trim(),
        isNew: broadcastIsNew,
        tag: broadcastTag
      });
    }

    onBroadcastMessage(title);
    setBroadcastHistory([
      { id: `bc-${Date.now()}`, text: `${title} - ${broadcastText.trim()}`, date: new Date().toLocaleString() },
      ...broadcastHistory
    ]);
    showNotice("Annonce officielle publiée et visible immédiatement sur la page Annonces.");
    setBroadcastTitle('');
    setBroadcastText('');
  };

  // Horizontal Navigation tabs definition matching user exact list
  const navTabs: Array<{ id: AdminTab; label: string; badge?: number; color?: string }> = [
    { id: 'total', label: 'Total' },
    { id: 'deposits', label: 'Dépôts', badge: pendingDepositsCount },
    { id: 'withdrawals', label: 'Retraits', badge: pendingWithdrawalsCount },
    { id: 'channels', label: 'Canaux', badge: paymentChannels.length },
    { id: 'users', label: 'Utilisateurs', badge: usersList.length },
    { id: 'products', label: 'Produits', badge: editablePackages.length },
    { id: 'pending_products', label: 'Produits à payer', badge: pendingOrdersCount },
    { id: 'gift_codes', label: 'Codes cadeaux', badge: giftCodes.length },
    { id: 'messages', label: 'Messages Clients', badge: pendingTicketsCount },
    { id: 'announcements', label: 'Annonces' }
  ];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto" id="admin-panel-root">
      
      {/* Toast Notice */}
      <AnimatePresence>
        {saveSuccessNotice && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-3.5 bg-violet-950 border border-violet-500/60 rounded-xl text-violet-200 text-xs font-semibold flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
            <button onClick={() => setSaveSuccessNotice(null)} className="text-violet-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Compact Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">Panneau d'Administration</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Live
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Supervision de la plateforme • Administrateur : <strong className="text-zinc-200">{currentUser.fullName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshAllAdminData(true)}
            disabled={isLoadingUsers || isLoadingTransactions}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 border border-zinc-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            title="Actualiser instantanément toutes les données"
          >
            <Clock className={`w-3.5 h-3.5 ${isLoadingUsers || isLoadingTransactions ? 'animate-spin' : ''}`} />
            <span>Synchroniser</span>
          </button>
          <button
            onClick={onNavigateToUserDashboard}
            id="admin-switch-to-user-btn"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold border border-zinc-700 transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            Aperçu Vue Client
          </button>
        </div>
      </div>

      {/* HORIZONTAL NAVIGATION BAR (Responsive, clean, well-aligned) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 shadow-md">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                    isActive
                      ? 'bg-white text-violet-700'
                      : tab.id === 'deposits' || tab.id === 'withdrawals' || tab.id === 'pending_products'
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT SECTIONS */}

      {/* 1. TOTAL (Overview Dashboard) */}
      {activeTab === 'total' && (
        <div className="space-y-5" id="view-admin-total">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Total Soldes Utilisateurs</span>
                <Wallet className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {formatCurrency(totalUsersBalance)}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <TrendingUp className="w-3 h-3" /> Solde cumulé des membres
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Total Dépôts Validés</span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {formatCurrency(totalApprovedDeposits)}
              </div>
              <div className="text-[10px] text-zinc-400">
                {depositsList.length} transactions de recharge
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Total Retraits Versés</span>
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono">
                {formatCurrency(totalPaidWithdrawals)}
              </div>
              <div className="text-[10px] text-zinc-400">
                {withdrawalsList.length} retraits ordonnés
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Utilisateurs Inscrits</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {usersList.length}
              </div>
              <div className="text-[10px] text-cyan-400 font-bold">
                100% comptes réels en base
              </div>
            </div>
          </div>

          {/* Quick Summary Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Actions Administratives Requises
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-zinc-300">Dépôts en attente</span>
                  <span className="font-bold text-amber-400 font-mono">{pendingDepositsCount}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-zinc-300">Retraits en attente</span>
                  <span className="font-bold text-amber-400 font-mono">{pendingWithdrawalsCount}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-zinc-300">Produits à payer</span>
                  <span className="font-bold text-cyan-400 font-mono">{pendingOrdersCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                Canaux de Paiement Actifs
              </h3>
              <div className="space-y-2 text-xs">
                {paymentChannels.slice(0, 3).map((ch) => (
                  <div key={ch.id} className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="font-medium text-white">{ch.name}</span>
                    <span className="font-mono text-cyan-400 text-[11px]">{ch.accountNumber}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                Derniers Codes Cadeaux
              </h3>
              <div className="space-y-2 text-xs">
                {giftCodes.slice(0, 3).map((gc) => (
                  <div key={gc.id} className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="font-mono text-amber-300 font-bold">{gc.code}</span>
                    <span className="text-zinc-400 font-mono">{formatCurrency(gc.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DÉPÔTS (Deposits Management) */}
      {activeTab === 'deposits' && (
        <div className="space-y-4" id="view-admin-deposits">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                Gestion des Dépôts et Recharges
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Vérifiez les preuves de transfert Mobile Money et créditez les comptes des utilisateurs.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {(['all', 'pending', 'completed', 'failed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setDepositFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    depositFilter === f ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f === 'all' && 'Tous'}
                  {f === 'pending' && `En attente (${pendingDepositsCount})`}
                  {f === 'completed' && 'Validés'}
                  {f === 'failed' && 'Rejetés'}
                </button>
              ))}
            </div>
          </div>

          {filteredDeposits.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 text-xs">
              Aucune transaction de recharge trouvée dans cette catégorie.
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">ID / Date</th>
                      <th className="p-3.5">Montant (F CFA)</th>
                      <th className="p-3.5">Canal & Référence Preuve</th>
                      <th className="p-3.5">Statut</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredDeposits.map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-800/30 transition">
                        <td className="p-3.5">
                          <span className="font-mono text-zinc-400 block">{tx.id}</span>
                          <span className="text-[10px] text-zinc-500">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</span>
                        </td>
                        <td className="p-3.5 font-mono text-sm font-bold text-emerald-400">
                          +{formatCurrency(tx.amount)}
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <span className="font-semibold text-white block">{tx.channelName || tx.description}</span>
                            {tx.proofReference && (
                              <span className="inline-block font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[10px] font-bold">
                                Réf : {tx.proofReference}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            tx.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse' :
                            'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {tx.status === 'completed' && 'Validé'}
                            {tx.status === 'pending' && 'En attente'}
                            {tx.status === 'failed' && 'Rejeté'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {tx.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveDeposit(tx.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Approuver le dépôt"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approuver
                                </button>
                                <button
                                  onClick={() => handleRejectDeposit(tx.id)}
                                  className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                                  title="Rejeter le dépôt"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Rejeter
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Supprimer définitivement ce dépôt (${tx.id}) ?`)) {
                                  handleDeleteTransaction(tx.id, 'deposit');
                                }
                              }}
                              className="p-1.5 bg-zinc-800/80 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-400 border border-zinc-700/60 hover:border-rose-700/60 rounded-lg transition cursor-pointer"
                              title="Supprimer définitivement ce dépôt"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. RETRAITS (Withdrawals Management) */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4" id="view-admin-withdrawals">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
                Gestion des Retraits
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Validez les demandes de transfert vers les comptes Mobile Money des adhérents.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {(['all', 'pending', 'completed', 'failed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setWithdrawalFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    withdrawalFilter === f ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f === 'all' && 'Tous'}
                  {f === 'pending' && `En attente (${pendingWithdrawalsCount})`}
                  {f === 'completed' && 'Payés'}
                  {f === 'failed' && 'Rejetés'}
                </button>
              ))}
            </div>
          </div>

          {filteredWithdrawals.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 text-xs">
              Aucune demande de retrait trouvée dans cette catégorie.
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">ID / Date</th>
                      <th className="p-3.5">Montant (F CFA)</th>
                      <th className="p-3.5">Bénéficiaire / Destination</th>
                      <th className="p-3.5">Statut</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredWithdrawals.map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-800/30 transition">
                        <td className="p-3.5">
                          <span className="font-mono text-zinc-400 block">{tx.id}</span>
                          <span className="text-[10px] text-zinc-500">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</span>
                        </td>
                        <td className="p-3.5 font-mono text-sm font-bold text-rose-400">
                          -{formatCurrency(tx.amount)}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-white block">{tx.description}</span>
                          <span className="text-[10px] text-zinc-400 block">{tx.details || 'Mobile Money'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            tx.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse' :
                            'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {tx.status === 'completed' && 'Payé'}
                            {tx.status === 'pending' && 'En attente'}
                            {tx.status === 'failed' && 'Rejeté / Remboursé'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {tx.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveWithdrawal(tx.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Valider et payer le retrait"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Valider & Payer
                                </button>
                                <button
                                  onClick={() => handleRejectWithdrawal(tx.id)}
                                  className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                                  title="Rejeter le retrait"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Rejeter
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Supprimer définitivement cette demande de retrait (${tx.id}) ?`)) {
                                  handleDeleteTransaction(tx.id, 'withdrawal');
                                }
                              }}
                              className="p-1.5 bg-zinc-800/80 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-400 border border-zinc-700/60 hover:border-rose-700/60 rounded-lg transition cursor-pointer"
                              title="Supprimer définitivement ce retrait"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CANAUX (Payment Channels Management: Togo, Cameroun & Burkina Faso) */}
      {activeTab === 'channels' && (
        <div className="space-y-4" id="view-admin-channels">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                Configuration des Canaux de Dépôt (Togo 🇹🇬, Cameroun 🇨🇲 & Burkina Faso 🇧🇫)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Gérez les numéros de dépôt, opérateurs et consignes affichés aux membres du Togo, Cameroun et Burkina Faso.
              </p>
            </div>

            <button
              onClick={handleOpenNewChannelModal}
              id="btn-admin-add-channel"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              Ajouter un canal
            </button>
          </div>

          {/* Filter by country */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setAdminChannelCountryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                adminChannelCountryFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              <span>🌍 Tous les pays</span>
              <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded-full text-[10px]">
                {paymentChannels.length}
              </span>
            </button>
            <button
              onClick={() => setAdminChannelCountryFilter('Togo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                adminChannelCountryFilter === 'Togo'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              <span>🇹🇬 Togo (+228)</span>
              <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded-full text-[10px]">
                {paymentChannels.filter(c => 
                  c.country === 'Togo' || c.countryCode === 'tg' || c.accountNumber.startsWith('+228') || (c.name || '').toLowerCase().includes('togo') || (c.name || '').toLowerCase().includes('tmoney') || (c.name || '').toLowerCase().includes('flooz') || c.id.includes('-tg-')
                ).length}
              </span>
            </button>
            <button
              onClick={() => setAdminChannelCountryFilter('Cameroun')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                adminChannelCountryFilter === 'Cameroun'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              <span>🇨🇲 Cameroun (+237)</span>
              <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded-full text-[10px]">
                {paymentChannels.filter(c => 
                  c.country === 'Cameroun' || c.countryCode === 'cm' || c.accountNumber.startsWith('+237') || (c.name || '').toLowerCase().includes('cameroun') || c.id.includes('-cm-')
                ).length}
              </span>
            </button>
            <button
              onClick={() => setAdminChannelCountryFilter('Burkina Faso')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                adminChannelCountryFilter === 'Burkina Faso'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              <span>🇧🇫 Burkina Faso (+226)</span>
              <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded-full text-[10px]">
                {paymentChannels.filter(c => 
                  c.country === 'Burkina Faso' || c.countryCode === 'bf' || c.accountNumber.startsWith('+226') || (c.name || '').toLowerCase().includes('burkina') || c.id.includes('-bf-')
                ).length}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentChannels
              .filter(channel => {
                if (adminChannelCountryFilter === 'all') return true;
                const isTg = channel.country === 'Togo' || channel.countryCode === 'tg' || channel.accountNumber.startsWith('+228') || (channel.name || '').toLowerCase().includes('togo') || (channel.name || '').toLowerCase().includes('tmoney') || (channel.name || '').toLowerCase().includes('flooz') || channel.id.includes('-tg-');
                const isCm = channel.country === 'Cameroun' || channel.countryCode === 'cm' || channel.accountNumber.startsWith('+237') || (channel.name || '').toLowerCase().includes('cameroun') || channel.id.includes('-cm-');
                
                if (adminChannelCountryFilter === 'Togo') return isTg;
                if (adminChannelCountryFilter === 'Cameroun') return isCm;
                return !isTg && !isCm;
              })
              .map((channel) => {
                const isTg = channel.country === 'Togo' || channel.countryCode === 'tg' || channel.accountNumber.startsWith('+228') || (channel.name || '').toLowerCase().includes('togo') || (channel.name || '').toLowerCase().includes('tmoney') || (channel.name || '').toLowerCase().includes('flooz') || channel.id.includes('-tg-');
                const isCm = channel.country === 'Cameroun' || channel.countryCode === 'cm' || channel.accountNumber.startsWith('+237') || (channel.name || '').toLowerCase().includes('cameroun') || channel.id.includes('-cm-');
                
                const countryLabel = isTg ? 'Togo' : isCm ? 'Cameroun' : 'Burkina Faso';
                const countryFlag = isTg ? '🇹🇬' : isCm ? '🇨🇲' : '🇧🇫';
                const countryPrefix = isTg ? '+228' : isCm ? '+237' : '+226';

                return (
                  <div
                    key={channel.id}
                    className={`bg-zinc-900 border rounded-2xl p-5 space-y-3 transition relative ${
                      channel.isActive ? 'border-zinc-800' : 'border-zinc-850 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-sm">
                          {countryFlag}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{channel.name}</span>
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
                              {countryFlag} {countryLabel}
                            </span>
                            {channel.badge && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 text-[9px] font-bold border border-cyan-800/60">
                                {channel.badge}
                              </span>
                            )}
                          </div>
                          {channel.accountName && (
                            <span className="text-[10px] text-zinc-400 block">Titulaire : {channel.accountName}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleChannelStatus(channel.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                          channel.isActive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {channel.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-zinc-500 block">
                          Numéro de réception ({countryPrefix})
                        </span>
                        <span className="font-mono text-base font-black text-cyan-400 tracking-wider">
                          {channel.accountNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenEditChannelModal(channel)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer border border-zinc-700"
                        title="Modifier ce numéro"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Changer numéro</span>
                      </button>
                    </div>

                    <div className="bg-zinc-950/60 rounded-xl p-2.5 text-[11px] text-zinc-300 whitespace-pre-line border border-zinc-850">
                      {channel.instructions}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-xs">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ID: {channel.id}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditChannelModal(channel)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-cyan-400" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteChannel(channel.id, channel.name)}
                          className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 5. UTILISATEURS (Users Management) */}
      {activeTab === 'users' && (
        <div className="space-y-4" id="view-admin-users">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Gestion des Comptes Utilisateurs
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                  {usersList.length} membres
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Base de données Supabase synchronisée
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Comptes enregistrés sur tous les téléphones et appareils en temps réel. {lastSyncedAt ? `(Dernière sync : ${lastSyncedAt})` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Nom, tél, email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={() => loadRemoteUsers(true)}
                disabled={isLoadingUsers}
                className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                title="Actualiser depuis la base de données Supabase"
              >
                <Clock className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Créer Utilisateur</span>
                <span className="sm:hidden">Créer</span>
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5">Utilisateur</th>
                    <th className="p-3.5">Date Inscription</th>
                    <th className="p-3.5">Téléphone / Contact</th>
                    <th className="p-3.5">Niveau VIP</th>
                    <th className="p-3.5">Solde Actuel</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {usersList
                    .filter(u => {
                      const q = (searchUser || '').toLowerCase().trim();
                      if (!q) return true;
                      return (
                        (u.name || '').toLowerCase().includes(q) || 
                        (u.email || '').toLowerCase().includes(q) ||
                        (u.phone || '').includes(q) ||
                        (u.id || '').toLowerCase().includes(q)
                      );
                    })
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-800/30 transition">
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{user.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{user.email}</span>
                        </td>
                        <td className="p-3.5 text-zinc-400 font-mono text-[11px]">
                          {user.joinedDate || '—'}
                        </td>
                        <td className="p-3.5 font-mono text-zinc-300 font-semibold">
                          {user.phone}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-cyan-300 text-[10px] font-bold border border-zinc-700">
                            {user.vipTier}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-sm font-black text-emerald-400">
                          {formatCurrency(user.balance)}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.status === 'verified' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                            user.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {user.status === 'verified' && 'Vérifié'}
                            {user.status === 'active' && 'Actif'}
                            {user.status === 'suspended' && 'Suspendu'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Bouton Ajouter de l'argent */}
                            <button
                              onClick={() => handleOpenAdjustModal(user, 'credit')}
                              className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                              title="Ajouter de l'argent (Créditer)"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Ajouter</span>
                            </button>

                            {/* Bouton Retirer de l'argent */}
                            <button
                              onClick={() => handleOpenAdjustModal(user, 'debit')}
                              className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                              title="Retirer de l'argent (Débiter)"
                            >
                              <Minus className="w-3 h-3" />
                              <span>Retirer</span>
                            </button>

                            {/* Modifier Mot de Passe */}
                            <button
                              onClick={() => handleOpenPasswordModal(user)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-lg transition cursor-pointer border border-zinc-700"
                              title="Modifier le mot de passe"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {/* Statut Toggle */}
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                user.status === 'suspended'
                                  ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-amber-400'
                              }`}
                              title={user.status === 'suspended' ? 'Débloquer' : 'Suspendre'}
                            >
                              {user.status === 'suspended' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            </button>

                            {/* Supprimer le compte */}
                            <button
                              onClick={() => handleOpenDeleteModal(user)}
                              className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 rounded-lg transition cursor-pointer"
                              title="Supprimer définitivement le compte"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. PRODUITS (Investment Packages Management) */}
      {activeTab === 'products' && (
        <div className="space-y-4" id="view-admin-products">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-violet-400" />
                Gestion des Produits VIP & Rendements (Catalogue)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ajustez les prix, durées, rendements ou supprimez/ajoutez des véhicules d'investissement.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddPackageModalOpen(true)}
                className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un Produit
              </button>
              <button
                onClick={handleSavePackages}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                Enregistrer les taux
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editablePackages.map((pkg, idx) => (
              <div key={pkg.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">{pkg.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 text-[10px] font-bold border border-violet-500/30">
                      VIP {pkg.level}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                    className="p-1.5 bg-rose-950/50 hover:bg-rose-900 border border-rose-800/60 text-rose-400 rounded-lg transition cursor-pointer"
                    title="Supprimer ce produit du catalogue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono block">Prix d'adhésion (F CFA)</label>
                    <input
                      type="number"
                      value={pkg.minInvestment}
                      onChange={(e) => handlePackageFieldChange(idx, 'minInvestment', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono font-bold text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono block">Taux Quotidien (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={pkg.dailyRate || 0}
                        onChange={(e) => handlePackageFieldChange(idx, 'dailyRate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono block">Gain Journalier (F CFA)</label>
                      <input
                        type="number"
                        value={pkg.dailyEarningsAmount}
                        onChange={(e) => handlePackageFieldChange(idx, 'dailyEarningsAmount', parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono font-bold text-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono block">Durée du cycle (Jours)</label>
                    <input
                      type="number"
                      value={pkg.durationDays}
                      onChange={(e) => handlePackageFieldChange(idx, 'durationDays', parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono font-bold text-zinc-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. PRODUITS À PAYER & SOUSCRIPTIONS (Subscriptions & Orders Management) */}
      {activeTab === 'pending_products' && (
        <div className="space-y-6" id="view-admin-pending-products">
          {/* Section 1: Produits Payés / Souscriptions Actives */}
          <div className="space-y-3">
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Produits Payés & Souscriptions Actives des Utilisateurs
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Liste des produits VIP souscrits par les membres. La suppression ici retire le produit immédiatement du compte de l'utilisateur.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                {userSubscriptions.length} produit(s) payé(s)
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              {userSubscriptions.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  Aucun produit payé ou souscription active pour le moment.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                      <tr>
                        <th className="p-3.5">ID / Date Souscription</th>
                        <th className="p-3.5">Produit VIP</th>
                        <th className="p-3.5">Montant Payé</th>
                        <th className="p-3.5">Gain Quotidien</th>
                        <th className="p-3.5">Progression Cycle</th>
                        <th className="p-3.5">Statut</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {userSubscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-zinc-800/30 transition">
                          <td className="p-3.5 font-mono text-zinc-400">
                            <span className="font-bold text-zinc-300">{sub.id}</span>
                            <span className="text-[10px] text-zinc-500 block">
                              {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('fr-FR') : 'Actif'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 font-bold border border-violet-500/30 text-xs inline-block">
                              {sub.packageName}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-sm font-bold text-white">
                            {formatCurrency(sub.investedAmount)}
                          </td>
                          <td className="p-3.5 font-mono text-emerald-400 font-bold">
                            +{formatCurrency(sub.dailyReturn)}/j
                          </td>
                          <td className="p-3.5 font-mono text-zinc-400 text-xs">
                            {sub.daysCompleted || 0} / {sub.durationDays || 45} j
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.status === 'active' 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}>
                              {sub.status === 'active' ? 'Actif' : 'Terminé'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleDeleteUserSubscription(sub.id, sub.packageName)}
                              className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ml-auto shadow-sm"
                              title="Supprimer ce produit payé du site et du compte de l'utilisateur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Supprimer</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Commandes en attente de règlement */}
          <div className="space-y-3">
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Commandes VIP en Attente de Confirmation
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Demandes d'adhésion en cours de vérification de paiement.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs font-bold">
                {pendingOrdersCount} en attente
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">ID / Date</th>
                      <th className="p-3.5">Membre & Téléphone</th>
                      <th className="p-3.5">Produit Demandé</th>
                      <th className="p-3.5">Montant à régler</th>
                      <th className="p-3.5">Gain Quotidien</th>
                      <th className="p-3.5">Statut</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {pendingOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-800/30 transition">
                        <td className="p-3.5 font-mono text-zinc-400">
                          <span>{ord.id}</span>
                          <span className="text-[10px] text-zinc-500 block">{ord.createdAt}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{ord.userName}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{ord.userPhone}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 font-bold border border-violet-500/30 text-[10px]">
                            {ord.packageName}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-sm font-bold text-white">
                          {formatCurrency(ord.price)}
                        </td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">
                          +{formatCurrency(ord.dailyReturn)}/j
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            ord.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse' :
                            'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {ord.status === 'active' && 'Actif'}
                            {ord.status === 'pending' && 'En attente'}
                            {ord.status === 'cancelled' && 'Annulé'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleApproveOrder(ord.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Activer
                                </button>
                                <button
                                  onClick={() => handleCancelOrder(ord.id)}
                                  className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Annuler
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-zinc-500 mr-2">Traité</span>
                            )}
                            <button
                              onClick={() => handleDeletePendingOrder(ord.id)}
                              className="p-1 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                              title="Supprimer la commande"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* 8. CODES CADEAUX (Gift Codes Management) */}
      {activeTab === 'gift_codes' && (
        <div className="space-y-4" id="view-admin-gift-codes">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                Générateur & Gestion des Codes Cadeaux
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Créez des bons de recharge utilisables par les membres pour recevoir du solde gratuit.
              </p>
            </div>

            <button
              onClick={() => setIsGiftModalOpen(true)}
              id="btn-admin-add-gift"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              Créer un code cadeau
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {giftCodes.map((code) => (
              <div key={code.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-amber-400 tracking-wider">
                    {code.code}
                  </span>
                  <button
                    onClick={() => handleToggleGiftCode(code.id)}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer ${
                      code.isActive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {code.isActive ? 'Actif' : 'Inactif'}
                  </button>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-zinc-500 block">Valeur du bon</span>
                    <span className="text-base font-black font-mono text-white">+{formatCurrency(code.amount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-mono text-zinc-500 block">Utilisations</span>
                    <span className="text-xs font-bold text-zinc-300">{code.usedCount} / {code.maxUses}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                  <span>Créé le {code.createdAt}</span>
                  <button
                    onClick={() => handleDeleteGiftCode(code.id)}
                    className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. ANNONCES (Announcements / Broadcasts) */}
      {activeTab === 'announcements' && (
        <div className="space-y-4" id="view-admin-announcements">
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-violet-400" />
                Diffuser une Annonce Générale
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Publiez une annonce officielle qui apparaîtra directement dans la liste des messages de tous les utilisateurs.
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Titre de l'annonce</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Ex: Récompenser les agents exceptionnels"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Contenu complet</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="Saisissez le texte détaillé de l'annonce..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Catégorie / Tag</label>
                  <select
                    value={broadcastTag}
                    onChange={(e) => setBroadcastTag(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Offre Spéciale">Offre Spéciale</option>
                    <option value="Nouveauté">Nouveauté</option>
                    <option value="Récompense">Récompense</option>
                    <option value="Système">Système</option>
                    <option value="Sécurité">Sécurité</option>
                    <option value="Guide">Guide</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="chk-is-new"
                    checked={broadcastIsNew}
                    onChange={(e) => setBroadcastIsNew(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 bg-zinc-950 border-zinc-700 cursor-pointer"
                  />
                  <label htmlFor="chk-is-new" className="text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    Signaler comme nouvelle (Point rouge)
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publier l'annonce maintenant
                </button>
              </div>
            </form>
          </div>

          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
              Annonces en ligne ({announcements ? announcements.length : broadcastHistory.length})
            </h3>
            <div className="space-y-2">
              {announcements && announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div key={ann.id} className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ann.isNew && (
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                        )}
                        <span className="text-xs font-bold text-white">{ann.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-500 font-mono">{ann.date}</span>
                        {onDeleteAnnouncement && (
                          <button
                            onClick={() => onDeleteAnnouncement(ann.id)}
                            className="text-red-400 hover:text-red-300 p-1 text-xs cursor-pointer"
                            title="Supprimer cette annonce"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-2">{ann.content}</p>
                  </div>
                ))
              ) : (
                broadcastHistory.map((bc) => (
                  <div key={bc.id} className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-violet-400 font-mono font-bold">Aura Diffusion Officielle</span>
                      <span className="text-[10px] text-zinc-500">{bc.date}</span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">{bc.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10. MESSAGES CLIENTS / SUPPORT LIVE (Reçoit les messages et permet de répondre) */}
      {activeTab === 'messages' && (
        <div className="space-y-4" id="view-admin-messages">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Tickets / Conversations List Sidebar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 flex flex-col h-[600px]">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-white">Discussions Utilisateurs</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 text-[10px] font-bold">
                  {supportTickets.length} ticket(s)
                </span>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {supportTickets.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">
                    Aucun message reçu pour le moment.
                  </div>
                ) : (
                  supportTickets.map((ticket) => {
                    const isSelected = selectedTicketId === ticket.id;
                    const lastMsg = ticket.messages[ticket.messages.length - 1];
                    const isPendingReply = ticket.status === 'open' || ticket.unreadByAdmin;

                    return (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-violet-950/50 border-violet-500/60 shadow-md'
                            : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white truncate max-w-[140px]">
                            {ticket.userName}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isPendingReply
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : ticket.status === 'answered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {isPendingReply ? 'En attente' : ticket.status === 'answered' ? 'Répondu' : 'Fermé'}
                          </span>
                        </div>

                        <div className="text-[11px] text-zinc-400 font-medium truncate">
                          {ticket.subject}
                        </div>

                        {lastMsg && (
                          <div className="text-[10px] text-zinc-400 line-clamp-1 italic">
                            <span className="font-bold text-zinc-300">
                              {lastMsg.sender === 'admin' ? 'Admin : ' : 'Client : '}
                            </span>
                            {lastMsg.text}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-1 font-mono">
                          <span>{ticket.userPhone || ticket.userEmail || ticket.userId}</span>
                          <span>{lastMsg ? lastMsg.timestamp : ''}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Chat & Reply Panel */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col h-[600px] text-left">
              {(() => {
                const activeTicket = supportTickets.find(t => t.id === selectedTicketId);
                if (!activeTicket) {
                  return (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-xs space-y-2">
                      <Headphones className="w-8 h-8 text-zinc-600" />
                      <p>Sélectionnez un ticket à gauche pour lire les messages et répondre.</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{activeTicket.userName}</h4>
                          <span className="text-[10px] font-mono text-zinc-400">({activeTicket.userPhone || activeTicket.userEmail || activeTicket.userId})</span>
                        </div>
                        <p className="text-xs text-zinc-400">{activeTicket.subject}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleTicketStatus(activeTicket.id, activeTicket.status)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition cursor-pointer"
                        >
                          {activeTicket.status === 'closed' ? 'Rouvrir' : 'Fermer ticket'}
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(activeTicket.id)}
                          className="p-1.5 bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-300 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-2 my-2">
                      {activeTicket.messages.map((m) => {
                        const isAdmin = m.sender === 'admin';
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                              <span className="text-[10px] font-bold text-zinc-400 font-mono">
                                {isAdmin ? 'Administrateur' : activeTicket.userName}
                              </span>
                              <span className="text-[9px] text-zinc-400 font-mono">{m.timestamp}</span>
                            </div>
                            <div
                              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                                isAdmin
                                  ? 'bg-violet-600 text-white rounded-br-none shadow-md'
                                  : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-bl-none'
                              }`}
                            >
                              {m.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply Form */}
                    <form onSubmit={handleSendAdminReply} className="pt-2 border-t border-zinc-800 flex gap-2">
                      <input
                        type="text"
                        placeholder={`Répondre à ${activeTicket.userName}...`}
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-violet-600/30 active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Envoyer</span>
                      </button>
                    </form>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Balance Adjustment */}
      <AnimatePresence>
        {adjustingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    {adjustType === 'credit' ? 'Ajouter des Fonds (+)' : 'Retirer des Fonds (-)'}
                  </h3>
                  <p className="text-xs text-zinc-400">{adjustingUser.name} ({adjustingUser.phone})</p>
                </div>
                <button onClick={() => setAdjustingUser(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleExecuteUserAdjustment} className="space-y-3.5">
                <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      adjustType === 'credit' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Ajouter (Créditer)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      adjustType === 'debit' ? 'bg-rose-600 text-white shadow-md' : 'text-zinc-400'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>- Retirer (Débiter)</span>
                  </button>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Solde actuel :</span>
                  <span className="text-sm font-black font-mono text-white">{formatCurrency(adjustingUser.balance)}</span>
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">
                    {adjustType === 'credit' ? 'Montant à ajouter (F CFA) *' : 'Montant à déduire (F CFA) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="ex: 50000"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Motif de l'opération</label>
                  <input
                    type="text"
                    placeholder="ex: Recharge manuelle, bonus d'équipe, régularisation..."
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setAdjustingUser(null)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md ${
                      adjustType === 'credit' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                  >
                    {adjustType === 'credit' ? 'Confirmer le Dépôt' : 'Confirmer le Retrait'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Password Modification */}
      <AnimatePresence>
        {passwordModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    Modifier le Mot de Passe
                  </h3>
                  <p className="text-xs text-zinc-400">{passwordModalUser.name} ({passwordModalUser.phone})</p>
                </div>
                <button onClick={() => setPasswordModalUser(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1">
                  <span className="text-[11px] text-zinc-400 block">Identifiant / Téléphone :</span>
                  <span className="text-xs font-bold font-mono text-emerald-400 block">{passwordModalUser.phone}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-zinc-300 font-semibold">Nouveau Mot de Passe *</label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPassword}
                      className="text-[11px] text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Générer auto
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Saisir un nouveau mot de passe..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 pr-10 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setPasswordModalUser(null)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs cursor-pointer transition shadow-md"
                  >
                    Enregistrer le Mot de Passe
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Delete User Account Confirmation */}
      <AnimatePresence>
        {deleteUserModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-rose-900/50 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  Supprimer Définitivement le Compte
                </h3>
                <button onClick={() => setDeleteUserModalUser(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Êtes-vous certain de vouloir supprimer le compte de cet utilisateur ? Cette action est irréversible et effacera toutes ses données.
                </p>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Nom :</span>
                    <span className="font-bold text-white font-sans">{deleteUserModalUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Téléphone :</span>
                    <span className="text-zinc-300">{deleteUserModalUser.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Solde restant :</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(deleteUserModalUser.balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Grade VIP :</span>
                    <span className="text-cyan-400 font-bold">{deleteUserModalUser.vipTier}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setDeleteUserModalUser(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-md flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer le Compte</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Create New User */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 my-8 text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Créer un Nouvel Utilisateur
                </h3>
                <button onClick={() => setIsAddUserModalOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewUser} className="space-y-3.5">
                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Nom complet *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean Dupont"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Numéro de téléphone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+225 07 12 34 56"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Mot de passe de connexion *</label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">Solde initial (F CFA)</label>
                    <input
                      type="number"
                      value={newUserBalance}
                      onChange={(e) => setNewUserBalance(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">Grade VIP</label>
                    <select
                      value={newUserVipTier}
                      onChange={(e) => setNewUserVipTier(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="VIP 1 Bronze">VIP 1 Bronze</option>
                      <option value="VIP 2 Silver">VIP 2 Silver</option>
                      <option value="VIP 3 Gold">VIP 3 Gold</option>
                      <option value="VIP 4 Platinum">VIP 4 Platinum</option>
                      <option value="VIP 5 Obsidian">VIP 5 Obsidian</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-md"
                  >
                    Créer l'Utilisateur
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Payment Channel Creation/Edition */}
      <AnimatePresence>
        {isChannelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4 my-8 text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  {editingChannel ? `Modifier le Canal : ${editingChannel.name}` : 'Ajouter un Nouveau Canal'}
                </h3>
                <button onClick={() => setIsChannelModalOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveChannel} className="space-y-3.5">
                {/* Sélection du Pays */}
                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Pays de destination *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChannelFormCountry('Togo');
                        if (!channelFormNumber || channelFormNumber.startsWith('+237') || channelFormNumber.startsWith('+226')) {
                          setChannelFormNumber('+228 ');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition ${
                        channelFormCountry === 'Togo'
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">🇹🇬</span>
                      <span className="truncate">Togo (+228)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChannelFormCountry('Cameroun');
                        if (!channelFormNumber || channelFormNumber.startsWith('+228') || channelFormNumber.startsWith('+226')) {
                          setChannelFormNumber('+237 ');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition ${
                        channelFormCountry === 'Cameroun'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">🇨🇲</span>
                      <span className="truncate">Cameroun (+237)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChannelFormCountry('Burkina Faso');
                        if (!channelFormNumber || channelFormNumber.startsWith('+228') || channelFormNumber.startsWith('+237')) {
                          setChannelFormNumber('+226 ');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition ${
                        channelFormCountry === 'Burkina Faso'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">🇧🇫</span>
                      <span className="truncate">Burkina (+226)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">Nom du canal / Opérateur *</label>
                    <input
                      type="text"
                      required
                      placeholder="T-Money, Moov Money, MTN MoMo, Orange..."
                      value={channelFormName}
                      onChange={(e) => setChannelFormName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">Badge (optionnel)</label>
                    <input
                      type="text"
                      placeholder="Recommandé, Instantané, 0% Frais..."
                      value={channelFormBadge}
                      onChange={(e) => setChannelFormBadge(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-zinc-300 font-semibold">
                      Numéro de réception / Transfert *
                    </label>
                    <span className="text-[11px] text-cyan-400 font-mono">
                      Indicatif : {channelFormCountry === 'Togo' ? '+228' : channelFormCountry === 'Cameroun' ? '+237' : '+226'}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={channelFormCountry === 'Togo' ? '+228 90 12 34 56' : channelFormCountry === 'Cameroun' ? '+237 670 12 34 56' : '+226 76 12 34 56'}
                    value={channelFormNumber}
                    onChange={(e) => setChannelFormNumber(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Titulaire / Nom de la Caisse</label>
                  <input
                    type="text"
                    placeholder={`Service Financier (${channelFormCountry})`}
                    value={channelFormAccountName}
                    onChange={(e) => setChannelFormAccountName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Instructions de dépôt</label>
                  <textarea
                    rows={3}
                    required
                    value={channelFormInstructions}
                    onChange={(e) => setChannelFormInstructions(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-xs font-bold text-white">Activer ce canal</span>
                  <input
                    type="checkbox"
                    checked={channelFormIsActive}
                    onChange={(e) => setChannelFormIsActive(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsChannelModalOpen(false)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Gift Code Creation */}
      <AnimatePresence>
        {isGiftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  Générer un Nouveau Code Cadeau
                </h3>
                <button onClick={() => setIsGiftModalOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateGiftCode} className="space-y-3.5">
                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Code personnalisé (optionnel)</label>
                  <input
                    type="text"
                    placeholder="ex: BONUS-VIP-2026 (ou laisser vide pour auto)"
                    value={newGiftCode}
                    onChange={(e) => setNewGiftCode(e.target.value.toUpperCase())}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">Montant offert (F CFA) *</label>
                    <input
                      type="number"
                      required
                      value={newGiftAmount}
                      onChange={(e) => setNewGiftAmount(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">Nombre d'utilisations *</label>
                    <input
                      type="number"
                      required
                      value={newGiftMaxUses}
                      onChange={(e) => setNewGiftMaxUses(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsGiftModalOpen(false)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black cursor-pointer shadow-md"
                  >
                    Créer le code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Add New VIP Package */}
      <AnimatePresence>
        {isAddPackageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 my-8 text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-violet-400" />
                  Ajouter un Nouveau Produit VIP au Catalogue
                </h3>
                <button onClick={() => setIsAddPackageModalOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePackage} className="space-y-3.5">
                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Nom du Produit *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Aura Starter VIP, Tesla Model 3..."
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">Niveau VIP (1 - 10)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      value={newPkgLevel}
                      onChange={(e) => setNewPkgLevel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-violet-300 font-mono font-bold focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">Prix d'adhésion (F CFA) *</label>
                    <input
                      type="number"
                      required
                      value={newPkgPrice}
                      onChange={(e) => setNewPkgPrice(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">Gain journalier (F CFA) *</label>
                    <input
                      type="number"
                      required
                      value={newPkgDailyReturn}
                      onChange={(e) => setNewPkgDailyReturn(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">Durée du cycle (Jours) *</label>
                    <input
                      type="number"
                      required
                      value={newPkgDuration}
                      onChange={(e) => setNewPkgDuration(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 font-mono font-bold focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">URL Image du Véhicule (optionnel)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newPkgImage}
                    onChange={(e) => setNewPkgImage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 font-mono text-[11px]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddPackageModalOpen(false)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                  >
                    Ajouter au Catalogue
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
