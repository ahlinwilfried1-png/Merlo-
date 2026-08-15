import { supabase } from './supabase';
import { User, Transaction } from '../types';

/**
 * Service to manage Supabase database operations on the client side (using Anon Key)
 * and triggering server endpoints for Admin actions (using Service Role Key).
 */

export interface SupabaseSyncUserResult {
  user: User;
  balance?: number;
}

export interface AdminUserRecord {
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

// 1. User Registration / Login Sync (dual server-side & direct client-side fallback)
export async function syncUserWithSupabase(user: User): Promise<SupabaseSyncUserResult> {
  const phoneNumber = user.phoneNumber || user.email.split('@')[0];
  
  // Method A: Server-side sync endpoint using Service Role (immune to client-side RLS restrictions)
  try {
    const res = await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        email: user.email,
        fullName: user.fullName,
        password: user.password,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        isAdmin: user.role === 'admin',
        role: user.role
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.user) {
        const u = json.user;
        return {
          user: {
            ...user,
            id: u.id || user.id,
            phoneNumber: u.phone_number || phoneNumber,
            password: u.password || user.password,
            fullName: u.full_name || user.fullName,
            referralCode: u.referral_code || user.referralCode,
            referredBy: u.referred_by || user.referredBy,
            registeredAt: u.created_at || user.registeredAt,
            balance: u.balance !== undefined ? Number(u.balance) : 0,
            vipTier: u.vip_tier || 'VIP 1 Bronze',
            status: u.status || 'active'
          },
          balance: json.balance !== undefined ? Number(json.balance) : undefined
        };
      }
    }
  } catch (err) {
    console.warn('Server sync notice, falling back to direct Supabase:', err);
  }

  // Method B: Direct Supabase client sync fallback
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    if (existingUser) {
      return {
        user: {
          ...user,
          id: existingUser.id || user.id,
          phoneNumber: existingUser.phone_number || phoneNumber,
          password: existingUser.password || user.password,
          fullName: existingUser.full_name || user.fullName,
          referralCode: existingUser.referral_code || user.referralCode,
          referredBy: existingUser.referred_by || user.referredBy,
          registeredAt: existingUser.created_at || user.registeredAt
        },
        balance: existingUser.balance !== undefined ? Number(existingUser.balance) : undefined
      };
    } else {
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          phone_number: phoneNumber,
          email: user.email,
          full_name: user.fullName,
          password: user.password || 'aura2026',
          balance: 1000,
          total_recharged: 0,
          total_withdrawn: 0,
          vip_level: 1,
          vip_tier: 'VIP 1 Bronze',
          status: 'active',
          referral_code: user.referralCode,
          referred_by: user.referredBy,
          is_admin: user.role === 'admin',
          created_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (newUser) {
        return {
          user: {
            ...user,
            id: newUser.id,
            phoneNumber: newUser.phone_number,
            registeredAt: newUser.created_at
          },
          balance: Number(newUser.balance || 0)
        };
      }
    }
  } catch (e) {
    console.warn('Supabase syncUser fallback caught error:', e);
  }

  return { user };
}

// 2. Submit Transaction (Deposit or Withdrawal request)
export async function submitTransactionToSupabase(tx: Transaction): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('transactions')
      .insert({
        id: tx.id,
        user_id: tx.userId || null,
        phone_number: tx.channelNumber || null,
        user_name: tx.userName || null,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        description: tx.description || null,
        details: tx.details || null,
        channel_name: tx.channelName || null,
        channel_number: tx.channelNumber || null,
        proof_reference: tx.proofReference || null,
        created_at: tx.date || new Date().toISOString()
      });

    if (error) {
      console.warn('Supabase insert transaction notice:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase submitTransaction caught error:', e);
    return false;
  }
}

// 3. Fetch User Transactions
export async function fetchUserTransactionsFromSupabase(phoneNumber: string): Promise<Transaction[] | null> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`phone_number.eq.${phoneNumber},user_id.eq.${phoneNumber}`)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((d: any): Transaction => ({
      id: d.id,
      userId: d.user_id,
      userName: d.user_name,
      type: d.type as Transaction['type'],
      amount: Number(d.amount || 0),
      status: (d.status === 'COMPLETED' ? 'completed' : d.status === 'REJECTED' ? 'failed' : d.status) as Transaction['status'],
      date: d.created_at,
      description: d.description || `Transaction ${d.type}`,
      details: d.details,
      channelName: d.channel_name,
      channelNumber: d.channel_number,
      proofReference: d.proof_reference
    }));
  } catch (e) {
    console.warn('Supabase fetch transactions notice:', e);
    return null;
  }
}

// 4. ADMIN: Fetch ALL Users from Supabase
export async function fetchAdminUsersFromSupabase(): Promise<AdminUserRecord[]> {
  // Method 1: Server endpoint
  try {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.users) && json.users.length > 0) {
        return json.users.map((u: any): AdminUserRecord => ({
          id: u.id,
          name: u.full_name || `Membre ${u.phone_number}`,
          email: u.email || `${u.phone_number}@aurainvest.com`,
          phone: u.phone_number,
          password: u.password || 'aura2026',
          balance: Number(u.balance || 0),
          vipTier: u.vip_tier || `VIP ${u.vip_level || 1} Bronze`,
          status: (u.status || 'active') as 'active' | 'suspended' | 'verified',
          joinedDate: (u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-05-01')
        }));
      }
    }
  } catch (err) {
    console.warn('Admin fetch users endpoint notice, trying direct Supabase query:', err);
  }

  // Method 2: Direct Supabase client query
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((u: any): AdminUserRecord => ({
        id: u.id,
        name: u.full_name || `Membre ${u.phone_number}`,
        email: u.email || `${u.phone_number}@aurainvest.com`,
        phone: u.phone_number,
        password: u.password || 'aura2026',
        balance: Number(u.balance || 0),
        vipTier: u.vip_tier || `VIP ${u.vip_level || 1} Bronze`,
        status: (u.status || 'active') as 'active' | 'suspended' | 'verified',
        joinedDate: (u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-05-01')
      }));
    }
  } catch (err) {
    console.warn('Direct Supabase fetch users notice:', err);
  }

  return [];
}

// 5. ADMIN: Fetch ALL Transactions from Supabase
export async function fetchAdminTransactionsFromSupabase(): Promise<Transaction[]> {
  try {
    const res = await fetch('/api/admin/transactions');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.transactions)) {
        return json.transactions.map((d: any): Transaction => ({
          id: d.id,
          userId: d.user_id,
          userName: d.user_name,
          type: d.type as Transaction['type'],
          amount: Number(d.amount || 0),
          status: (d.status === 'COMPLETED' ? 'completed' : d.status === 'REJECTED' ? 'failed' : d.status) as Transaction['status'],
          date: d.created_at,
          description: d.description || `Transaction ${d.type}`,
          details: d.details,
          channelName: d.channel_name,
          channelNumber: d.channel_number,
          proofReference: d.proof_reference
        }));
      }
    }
  } catch (err) {
    console.warn('Admin fetch transactions notice:', err);
  }
  return [];
}

// 6. Server-Side Admin Actions (Calling Express API with Service Role Key)
export async function adminUpdateBalance(userId: string, phoneNumber: string, amount: number, type: 'credit' | 'debit', reason: string) {
  try {
    const res = await fetch('/api/admin/users/balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phoneNumber, amount, type, reason })
    });
    return await res.json();
  } catch (e) {
    console.error('Admin balance API error:', e);
    return { success: false, error: 'Network error' };
  }
}

export async function adminCreateUser(userPayload: { name: string; phone: string; email?: string; password?: string; balance?: number; vipTier?: string }) {
  try {
    const res = await fetch('/api/admin/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload)
    });
    return await res.json();
  } catch (e) {
    console.error('Admin create user API error:', e);
    return { success: false, error: 'Network error' };
  }
}

export async function adminUpdateUserPassword(userId: string, phoneNumber: string, newPassword: string) {
  try {
    const res = await fetch('/api/admin/users/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phoneNumber, newPassword })
    });
    return await res.json();
  } catch (e) {
    console.error('Admin password API error:', e);
    return { success: false, error: 'Network error' };
  }
}

export async function adminDeleteUser(userId: string, phoneNumber?: string) {
  try {
    const res = await fetch('/api/admin/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phoneNumber })
    });
    return await res.json();
  } catch (e) {
    console.error('Admin delete user API error:', e);
    return { success: false, error: 'Network error' };
  }
}

export async function adminUpdateUserStatus(userId: string, phoneNumber: string, status: string) {
  try {
    const res = await fetch('/api/admin/users/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phoneNumber, status })
    });
    return await res.json();
  } catch (e) {
    console.error('Admin update status API error:', e);
    return { success: false, error: 'Network error' };
  }
}

export async function adminApproveDeposit(transactionId: string, userId?: string, amount?: number) {
  try {
    const res = await fetch('/api/admin/deposits/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, userId, amount })
    });
    return await res.json();
  } catch (e) {
    console.error('Admin approve deposit error:', e);
    return { success: false, error: 'Network error' };
  }
}

export async function adminRejectDeposit(transactionId: string, reason?: string) {
  try {
    const res = await fetch('/api/admin/deposits/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, reason })
    });
    return await res.json();
  } catch (e) {
    console.error('Admin reject deposit error:', e);
    return { success: false, error: 'Network error' };
  }
}

export async function adminApproveWithdrawal(transactionId: string) {
  try {
    const res = await fetch('/api/admin/withdrawals/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId })
    });
    return await res.json();
  } catch (e) {
    console.error('Admin approve withdrawal error:', e);
    return { success: false, error: 'Network error' };
  }
}

export async function adminRejectWithdrawal(transactionId: string, userId?: string, amount?: number, reason?: string) {
  try {
    const res = await fetch('/api/admin/withdrawals/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, userId, amount, reason })
    });
    return await res.json();
  } catch (e) {
    console.error('Admin reject withdrawal error:', e);
    return { success: false, error: 'Network error' };
  }
}

// 7. REFERRALS & TEAM: Fetch real team members for a sponsor
export async function fetchUserReferralTeam(referralCode: string, phoneNumber?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (referralCode) params.append('referralCode', referralCode);
    if (phoneNumber) params.append('phoneNumber', phoneNumber);

    const res = await fetch(`/api/referrals/team?${params.toString()}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.referrals)) {
        return json.referrals;
      }
    }
  } catch (err) {
    console.warn('Error fetching referral team:', err);
  }
  return [];
}

// 8. PRODUCT PURCHASE: Server-side transaction & automatic commission distribution
export async function purchaseVIPProduct(
  userId: string, 
  phoneNumber: string, 
  pack: { id: string; name: string; dailyEarningsAmount: number; durationDays: number }, 
  investAmount: number
): Promise<{ success: boolean; buyerBalance?: number; error?: string; distributedCommissions?: any }> {
  try {
    const res = await fetch('/api/products/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        phoneNumber,
        packageId: pack.id,
        packageName: pack.name,
        price: investAmount,
        dailyEarnings: pack.dailyEarningsAmount,
        durationDays: pack.durationDays
      })
    });
    return await res.json();
  } catch (err: any) {
    console.error('Error in purchaseVIPProduct:', err);
    return { success: false, error: err.message || 'Erreur réseau' };
  }
}

// 9. DEDICATED AUTH: Register & Login (Strictly separate flows)
export async function authRegisterUser(payload: {
  phoneNumber: string;
  password?: string;
  fullName?: string;
  email?: string;
  referralCode?: string;
  referredBy?: string;
}): Promise<{ success: boolean; user?: any; balance?: number; error?: string; isNew?: boolean }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    console.error('Register API error:', err);
    return { success: false, error: err.message || 'Erreur de connexion au serveur.' };
  }
}

export async function authLoginUser(payload: {
  phoneNumber: string;
  password?: string;
}): Promise<{ success: boolean; user?: any; balance?: number; error?: string; isAdmin?: boolean }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    console.error('Login API error:', err);
    return { success: false, error: err.message || 'Erreur de connexion au serveur.' };
  }
}

// 10. REAL-TIME SUPPORT & CHAT MESSAGING SERVICE
export async function fetchAdminSupportTickets(): Promise<any[]> {
  try {
    const res = await fetch('/api/support/tickets');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.tickets)) {
        return json.tickets;
      }
    }
  } catch (err) {
    console.warn('Error fetching support tickets:', err);
  }
  return [];
}

export async function fetchUserSupportTicket(userId: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/support/ticket/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.ticket) {
        return json.ticket;
      }
    }
  } catch (err) {
    console.warn('Error fetching user ticket:', err);
  }
  return null;
}

export async function sendSupportMessage(payload: {
  userId: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  text: string;
  sender: 'user' | 'admin';
  ticketId?: string;
}): Promise<{ success: boolean; ticket?: any; message?: any; error?: string }> {
  try {
    const res = await fetch('/api/support/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    console.error('Error sending support message:', err);
    return { success: false, error: err.message || 'Erreur d\'envoi' };
  }
}

export async function updateSupportTicketStatus(ticketId: string, status: string): Promise<boolean> {
  try {
    const res = await fetch('/api/support/ticket/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, status })
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Error updating ticket status:', err);
    return false;
  }
}

// 11. AUTOMATIC 24H REVENUE PAYOUT
export async function processDailyRevenuePayout(payload: {
  userId: string;
  phoneNumber: string;
  subscriptionId: string;
  packageName: string;
  earnedAmount: number;
  durationDays: number;
  daysCompleted: number;
}): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const res = await fetch('/api/earnings/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    console.error('Error in daily payout API:', err);
    return { success: false, error: err.message };
  }
}

