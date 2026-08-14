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

// 1. User Registration / Login Sync
export async function syncUserWithSupabase(user: User): Promise<SupabaseSyncUserResult> {
  try {
    const phoneNumber = user.email.split('@')[0];

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.warn('Supabase fetch user notice:', fetchError);
      return { user };
    }

    if (existingUser) {
      return {
        user: {
          ...user,
          id: existingUser.id || user.id,
          referralCode: existingUser.referral_code || user.referralCode,
          referredBy: existingUser.referred_by || user.referredBy,
          registeredAt: existingUser.created_at || user.registeredAt
        },
        balance: existingUser.balance !== undefined ? Number(existingUser.balance) : undefined
      };
    } else {
      // Create user record in Supabase
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          phone_number: phoneNumber,
          email: user.email,
          full_name: user.fullName,
          balance: 0,
          total_recharged: 0,
          total_withdrawn: 0,
          referral_code: user.referralCode,
          referred_by: user.referredBy,
          is_admin: user.role === 'admin',
          created_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.warn('Supabase insert user notice:', insertError);
        return { user };
      }

      if (newUser) {
        return {
          user: {
            ...user,
            id: newUser.id,
            registeredAt: newUser.created_at
          },
          balance: Number(newUser.balance || 0)
        };
      }
    }
  } catch (e) {
    console.warn('Supabase syncUser caught error:', e);
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

// 4. Server-Side Admin Actions (Calling Express API with Service Role Key)
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
