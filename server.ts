import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// Supabase URL & Service Role Key (NEVER exposed to the client)
const SUPABASE_URL = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://vzncyplvarwwhxsfkmhv.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bmN5cGx2YXJ3d2h4c2ZrbWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODIwMzIsImV4cCI6MjEwMjI1ODAzMn0.6rCDT_YsSPT82bbe_xAzgueHAVhsXF9kLLM_MQ5QChw';

// Secure Server-side Admin Client with Service Role privileges
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      supabaseConnected: !!SUPABASE_SERVICE_ROLE_KEY,
      timestamp: new Date().toISOString()
    });
  });

  // 1. ADMIN: List all users from Supabase
  app.get('/api/admin/users', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If table does not exist or empty, return gracefully
        return res.json({ success: true, users: [], message: error.message });
      }
      return res.json({ success: true, users: data || [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. ADMIN: Update user balance securely
  app.post('/api/admin/users/balance', async (req, res) => {
    try {
      const { userId, phoneNumber, amount, type, reason } = req.body;
      if (!userId && !phoneNumber) {
        return res.status(400).json({ success: false, error: 'User identifier required' });
      }

      // Query user
      const query = supabaseAdmin.from('users').select('*');
      if (userId) query.eq('id', userId);
      else if (phoneNumber) query.eq('phone_number', phoneNumber);

      const { data: userData, error: userError } = await query.single();
      if (userError || !userData) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const currentBal = Number(userData.balance || 0);
      const adjustment = Number(amount || 0);
      const newBal = type === 'debit' ? Math.max(0, currentBal - adjustment) : currentBal + adjustment;

      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ balance: newBal, updated_at: new Date().toISOString() })
        .eq('id', userData.id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ success: false, error: updateError.message });
      }

      // Log transaction
      await supabaseAdmin.from('transactions').insert({
        user_id: userData.id,
        phone_number: userData.phone_number,
        type: type === 'debit' ? 'ADMIN_DEBIT' : 'ADMIN_CREDIT',
        amount: adjustment,
        status: 'COMPLETED',
        details: reason || `Ajustement administratif (${type})`,
        created_at: new Date().toISOString()
      });

      return res.json({ success: true, user: updatedUser, newBalance: newBal });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. ADMIN: Approve Deposit with Service Role
  app.post('/api/admin/deposits/approve', async (req, res) => {
    try {
      const { transactionId, userId, amount } = req.body;

      // Update transaction status
      const { error: txError } = await supabaseAdmin
        .from('transactions')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', transactionId);

      if (txError) {
        console.warn('Tx update warn:', txError);
      }

      // Credit user if userId and amount provided
      if (userId && amount) {
        const { data: user } = await supabaseAdmin.from('users').select('balance').eq('id', userId).single();
        if (user) {
          const newBalance = Number(user.balance || 0) + Number(amount);
          await supabaseAdmin.from('users').update({ balance: newBalance }).eq('id', userId);
        }
      }

      return res.json({ success: true, message: 'Dépôt validé avec succès' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. ADMIN: Reject Deposit
  app.post('/api/admin/deposits/reject', async (req, res) => {
    try {
      const { transactionId, reason } = req.body;
      await supabaseAdmin
        .from('transactions')
        .update({ 
          status: 'REJECTED', 
          details: reason ? `Refusé : ${reason}` : 'Refusé par l\'administrateur',
          updated_at: new Date().toISOString() 
        })
        .eq('id', transactionId);

      return res.json({ success: true, message: 'Dépôt rejeté' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. ADMIN: Approve Withdrawal
  app.post('/api/admin/withdrawals/approve', async (req, res) => {
    try {
      const { transactionId } = req.body;
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', transactionId);

      return res.json({ success: true, message: 'Retrait approuvé et marqué comme envoyé' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. ADMIN: Reject Withdrawal & Refund
  app.post('/api/admin/withdrawals/reject', async (req, res) => {
    try {
      const { transactionId, userId, amount, reason } = req.body;
      
      await supabaseAdmin
        .from('transactions')
        .update({ 
          status: 'REJECTED', 
          details: reason ? `Retrait refusé : ${reason}` : 'Retrait refusé et remboursé',
          updated_at: new Date().toISOString() 
        })
        .eq('id', transactionId);

      // Refund user balance
      if (userId && amount) {
        const { data: user } = await supabaseAdmin.from('users').select('balance').eq('id', userId).single();
        if (user) {
          const newBalance = Number(user.balance || 0) + Number(amount);
          await supabaseAdmin.from('users').update({ balance: newBalance }).eq('id', userId);
        }
      }

      return res.json({ success: true, message: 'Retrait rejeté et solde remboursé' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. ADMIN: Manage Payment Channels
  app.get('/api/admin/channels', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('payment_channels').select('*').order('created_at', { ascending: false });
      if (error) {
        return res.json({ success: true, channels: [], error: error.message });
      }
      return res.json({ success: true, channels: data || [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/channels', async (req, res) => {
    try {
      const { channel } = req.body;
      const { data, error } = await supabaseAdmin.from('payment_channels').upsert(channel).select();
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      return res.json({ success: true, channel: data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} with Supabase configured.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
