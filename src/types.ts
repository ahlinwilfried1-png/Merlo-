export interface User {
  id: string;
  email: string;
  fullName: string;
  registeredAt: string;
  referralCode: string;
  referredBy?: string;
  role?: 'admin' | 'user';
  phoneNumber?: string;
  password?: string;
  balance?: number;
  vipTier?: string;
  status?: 'active' | 'suspended' | 'verified';
}

export interface WalletState {
  balance: number;       // Current withdrawable balance
  totalDeposited: number; // Sum of all deposits
  totalWithdrawn: number; // Sum of all withdrawals
  totalEarnings: number;  // Sum of all investment earnings + referral commissions
}

export interface VIPPackage {
  id: string;
  name: string;
  level: number;
  category?: string;
  tag?: string;
  image: string;
  description?: string;
  minInvestment: number;
  dailyRate?: number;     // e.g., 48% or calculated
  dailyEarningsAmount: number;
  totalEarningsAmount: number;
  durationDays: number;
  features?: string[];
  badgeColor?: string;
  glowColor?: string;
}

export interface UserSubscription {
  id: string;
  packageId: string;
  packageName: string;
  amountInvested: number;
  dailyEarnings: number;
  createdAt: string;
  lastClaimedAt: string;
  nextPayoutAt: string;    // Timestamp for the next 24h drop
  durationDays: number;
  daysCompleted: number;
  expiresAt: string;
  isActive: boolean;
}

export interface PaymentChannel {
  id: string;
  name: string;
  country?: string; // 'Togo'
  countryCode?: 'tg' | string;
  accountNumber: string;
  accountName?: string;
  instructions: string;
  isActive: boolean;
  minAmount?: number;
  maxAmount?: number;
  badge?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'vip_earning' | 'referral_commission';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description: string;
  details?: string;
  channelName?: string;
  channelNumber?: string;
  proofReference?: string;
  userId?: string;
  userName?: string;
}

export interface ReferralUser {
  id: string;
  fullName: string;
  level: 1 | 2 | 3;
  dateJoined: string;
  status: 'active' | 'inactive';
  commissionEarned: number;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  subject: string;
  status: 'open' | 'answered' | 'closed';
  unreadByAdmin?: boolean;
  unreadByUser?: boolean;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isNew?: boolean;
  tag?: string;
  actionText?: string;
  actionTab?: string;
}

export interface GiftCode {
  id: string;
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}
