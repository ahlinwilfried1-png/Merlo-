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
        return res.json({ success: true, users: [], message: error.message });
      }
      return res.json({ success: true, users: data || [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1b. USER: Sync/Register User from any device
  app.post('/api/users/sync', async (req, res) => {
    try {
      const { phoneNumber, email, fullName, password, referralCode, referredBy, isAdmin, role } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ success: false, error: 'Phone number required' });
      }

      // Check if user exists
      const { data: existingUser, error: fetchErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (existingUser) {
        // Return existing user info
        return res.json({
          success: true,
          isNew: false,
          user: existingUser,
          balance: Number(existingUser.balance || 0)
        });
      }

      // Create new user in Supabase
      const insertPayload: any = {
        phone_number: phoneNumber,
        email: email || `${phoneNumber.replace(/\s+/g, '')}@aurainvest.com`,
        full_name: fullName || `Membre ${phoneNumber}`,
        balance: 1000,
        total_recharged: 0,
        total_withdrawn: 0,
        vip_level: 1,
        vip_tier: 'VIP 1 Bronze',
        status: 'active',
        referral_code: referralCode || `AURA-${Math.floor(1000 + Math.random() * 9000)}`,
        referred_by: referredBy || null,
        is_admin: Boolean(isAdmin || role === 'admin'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (password) {
        insertPayload.password = password;
      }

      const { data: createdUser, error: insertErr } = await supabaseAdmin
        .from('users')
        .insert(insertPayload)
        .select()
        .single();

      if (insertErr) {
        console.warn('User insert warning in /api/users/sync:', insertErr);
        return res.json({ success: true, isNew: true, user: insertPayload, balance: 1000 });
      }

      return res.json({
        success: true,
        isNew: true,
        user: createdUser,
        balance: Number(createdUser.balance || 0)
      });
    } catch (err: any) {
      console.error('Error in /api/users/sync:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1c. ADMIN: Create User manually
  app.post('/api/admin/users/create', async (req, res) => {
    try {
      const { name, phone, email, password, balance, vipTier } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Numéro de téléphone requis' });
      }

      const newUserPayload = {
        phone_number: phone,
        full_name: name || `Membre ${phone}`,
        email: email || `${phone.replace(/\s+/g, '')}@aurainvest.com`,
        password: password || 'aura2026',
        balance: Number(balance || 0),
        vip_tier: vipTier || 'VIP 1 Bronze',
        status: 'active',
        referral_code: `AURA-${Math.floor(1000 + Math.random() * 9000)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert(newUserPayload)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      return res.json({ success: true, user: data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1d. ADMIN: Update User Password
  app.post('/api/admin/users/password', async (req, res) => {
    try {
      const { userId, phoneNumber, newPassword } = req.body;
      if ((!userId && !phoneNumber) || !newPassword) {
        return res.status(400).json({ success: false, error: 'Identifiant et nouveau mot de passe requis' });
      }

      const query = supabaseAdmin.from('users').update({
        password: newPassword,
        updated_at: new Date().toISOString()
      });

      if (userId) query.eq('id', userId);
      else if (phoneNumber) query.eq('phone_number', phoneNumber);

      const { data, error } = await query.select().single();
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      return res.json({ success: true, user: data, message: 'Mot de passe mis à jour avec succès' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1e. ADMIN: Delete User
  app.post('/api/admin/users/delete', async (req, res) => {
    try {
      const { userId, phoneNumber } = req.body;
      if (!userId && !phoneNumber) {
        return res.status(400).json({ success: false, error: 'Identifiant requis' });
      }

      const query = supabaseAdmin.from('users').delete();
      if (userId) query.eq('id', userId);
      else if (phoneNumber) query.eq('phone_number', phoneNumber);

      const { error } = await query;
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      return res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1f. ADMIN: Toggle User Status (Active / Suspended)
  app.post('/api/admin/users/status', async (req, res) => {
    try {
      const { userId, phoneNumber, status } = req.body;
      const query = supabaseAdmin.from('users').update({
        status,
        updated_at: new Date().toISOString()
      });
      if (userId) query.eq('id', userId);
      else if (phoneNumber) query.eq('phone_number', phoneNumber);

      const { data, error } = await query.select().single();
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      return res.json({ success: true, user: data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1g. ADMIN: Get All Transactions
  app.get('/api/admin/transactions', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.json({ success: true, transactions: [] });
      }
      return res.json({ success: true, transactions: data || [] });
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

  // 8. REFERRALS: Fetch User's Real Multi-Level Team
  app.get('/api/referrals/team', async (req, res) => {
    try {
      const referralCode = req.query.referralCode as string;
      const phoneNumber = req.query.phoneNumber as string;

      if (!referralCode && !phoneNumber) {
        return res.json({ success: true, referrals: [] });
      }

      // Fetch all users to build hierarchy accurately
      const { data: allUsers, error: usersErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersErr || !allUsers) {
        return res.json({ success: true, referrals: [] });
      }

      // Codes representing the current user
      const currentUserIdentifiers = new Set<string>();
      if (referralCode) currentUserIdentifiers.add(referralCode.trim().toUpperCase());
      if (phoneNumber) {
        currentUserIdentifiers.add(phoneNumber.trim());
        currentUserIdentifiers.add(phoneNumber.replace(/\s+/g, ''));
      }

      // Fetch commissions transactions to map exact earned commission per referral
      const { data: commissionTxs } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('type', 'referral_commission');

      const matchesRef = (refBy: string | null | undefined, idSet: Set<string>) => {
        if (!refBy) return false;
        const normalized = refBy.trim().toUpperCase();
        const unspaced = refBy.replace(/\s+/g, '');
        return idSet.has(normalized) || idSet.has(unspaced) || idSet.has(refBy.trim());
      };

      // Level 1 Referrals
      const level1Users = allUsers.filter(u => matchesRef(u.referred_by, currentUserIdentifiers));
      const level1Identifiers = new Set<string>();
      level1Users.forEach(u => {
        if (u.referral_code) level1Identifiers.add(u.referral_code.trim().toUpperCase());
        if (u.phone_number) {
          level1Identifiers.add(u.phone_number.trim());
          level1Identifiers.add(u.phone_number.replace(/\s+/g, ''));
        }
      });

      // Level 2 Referrals
      const level2Users = allUsers.filter(u => 
        !level1Users.some(l1 => l1.id === u.id) && matchesRef(u.referred_by, level1Identifiers)
      );
      const level2Identifiers = new Set<string>();
      level2Users.forEach(u => {
        if (u.referral_code) level2Identifiers.add(u.referral_code.trim().toUpperCase());
        if (u.phone_number) {
          level2Identifiers.add(u.phone_number.trim());
          level2Identifiers.add(u.phone_number.replace(/\s+/g, ''));
        }
      });

      // Level 3 Referrals
      const level3Users = allUsers.filter(u => 
        !level1Users.some(l1 => l1.id === u.id) && 
        !level2Users.some(l2 => l2.id === u.id) && 
        matchesRef(u.referred_by, level2Identifiers)
      );

      const formatReferral = (u: any, level: 1 | 2 | 3) => {
        // Calculate commissions recorded for this user
        let earned = 0;
        if (commissionTxs) {
          const userMatchingTxs = commissionTxs.filter((tx: any) => 
            (tx.details && (tx.details.includes(u.phone_number) || tx.details.includes(u.full_name))) ||
            (level === 1 && tx.user_id === u.referred_by)
          );
          earned = userMatchingTxs.reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);
        }

        return {
          id: u.id,
          fullName: u.full_name || `Membre ${u.phone_number || ''}`,
          phoneNumber: u.phone_number,
          dateJoined: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-08-01',
          level,
          commissionEarned: earned,
          status: 'active' as const
        };
      };

      const result = [
        ...level1Users.map(u => formatReferral(u, 1)),
        ...level2Users.map(u => formatReferral(u, 2)),
        ...level3Users.map(u => formatReferral(u, 3))
      ];

      return res.json({ success: true, referrals: result });
    } catch (err: any) {
      console.error('Error in /api/referrals/team:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. PRODUCT PURCHASE & AUTOMATIC REFERRAL COMMISSION DISTRIBUTION
  app.post('/api/products/purchase', async (req, res) => {
    try {
      const { userId, phoneNumber, packageId, packageName, price, dailyEarnings, durationDays } = req.body;
      const parsedPrice = Number(price);

      if ((!userId && !phoneNumber) || isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ success: false, error: 'Paramètres d\'achat invalides' });
      }

      // 1. Get Buyer from DB
      const userQuery = supabaseAdmin.from('users').select('*');
      if (userId) userQuery.eq('id', userId);
      else if (phoneNumber) userQuery.eq('phone_number', phoneNumber);

      const { data: buyer, error: buyerErr } = await userQuery.single();
      if (buyerErr || !buyer) {
        return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
      }

      const currentBalance = Number(buyer.balance || 0);
      if (currentBalance < parsedPrice) {
        return res.status(400).json({ 
          success: false, 
          error: `Solde insuffisant (${currentBalance.toLocaleString()} F CFA). Montant requis : ${parsedPrice.toLocaleString()} F CFA.` 
        });
      }

      // 2. Debit Buyer Balance
      const newBuyerBalance = currentBalance - parsedPrice;
      await supabaseAdmin
        .from('users')
        .update({ balance: newBuyerBalance, updated_at: new Date().toISOString() })
        .eq('id', buyer.id);

      // 3. Log Buyer's Purchase Transaction
      const purchaseTxId = `tx-prod-${Date.now()}`;
      await supabaseAdmin.from('transactions').insert({
        id: purchaseTxId,
        user_id: buyer.id,
        phone_number: buyer.phone_number,
        type: 'vip_earning',
        amount: parsedPrice,
        status: 'COMPLETED',
        description: `Acquisition : ${packageName}`,
        details: `Revenu : +${dailyEarnings.toLocaleString()} F CFA chaque 24h pendant ${durationDays} jours`,
        created_at: new Date().toISOString()
      });

      // 4. DISTRIBUTE COMMISSIONS TO SPONSORS (30% Level 1, 2% Level 2, 1% Level 3)
      const distributed = { level1: 0, level2: 0, level3: 0 };

      if (buyer.referred_by) {
        const refBy = buyer.referred_by.trim();
        
        // Find Level 1 Sponsor
        const { data: sponsor1 } = await supabaseAdmin
          .from('users')
          .select('*')
          .or(`referral_code.eq.${refBy},phone_number.eq.${refBy},id.eq.${refBy}`)
          .maybeSingle();

        if (sponsor1) {
          const commL1 = Math.round(parsedPrice * 0.30); // 30%
          distributed.level1 = commL1;
          const newBalL1 = Number(sponsor1.balance || 0) + commL1;

          await supabaseAdmin
            .from('users')
            .update({ balance: newBalL1, updated_at: new Date().toISOString() })
            .eq('id', sponsor1.id);

          await supabaseAdmin.from('transactions').insert({
            id: `tx-comm1-${Date.now()}`,
            user_id: sponsor1.id,
            phone_number: sponsor1.phone_number,
            type: 'referral_commission',
            amount: commL1,
            status: 'COMPLETED',
            description: `Commission de Parrainage (Niveau 1 - 30%)`,
            details: `Achat de ${packageName} (${parsedPrice.toLocaleString()} F CFA) par votre filleul direct ${buyer.full_name || buyer.phone_number}`,
            created_at: new Date().toISOString()
          });

          // Find Level 2 Sponsor
          if (sponsor1.referred_by) {
            const refBy2 = sponsor1.referred_by.trim();
            const { data: sponsor2 } = await supabaseAdmin
              .from('users')
              .select('*')
              .or(`referral_code.eq.${refBy2},phone_number.eq.${refBy2},id.eq.${refBy2}`)
              .maybeSingle();

            if (sponsor2) {
              const commL2 = Math.round(parsedPrice * 0.02); // 2%
              distributed.level2 = commL2;
              const newBalL2 = Number(sponsor2.balance || 0) + commL2;

              await supabaseAdmin
                .from('users')
                .update({ balance: newBalL2, updated_at: new Date().toISOString() })
                .eq('id', sponsor2.id);

              await supabaseAdmin.from('transactions').insert({
                id: `tx-comm2-${Date.now()}`,
                user_id: sponsor2.id,
                phone_number: sponsor2.phone_number,
                type: 'referral_commission',
                amount: commL2,
                status: 'COMPLETED',
                description: `Commission de Parrainage (Niveau 2 - 2%)`,
                details: `Achat de ${packageName} par un membre de niveau 2 de votre équipe`,
                created_at: new Date().toISOString()
              });

              // Find Level 3 Sponsor
              if (sponsor2.referred_by) {
                const refBy3 = sponsor2.referred_by.trim();
                const { data: sponsor3 } = await supabaseAdmin
                  .from('users')
                  .select('*')
                  .or(`referral_code.eq.${refBy3},phone_number.eq.${refBy3},id.eq.${refBy3}`)
                  .maybeSingle();

                if (sponsor3) {
                  const commL3 = Math.round(parsedPrice * 0.01); // 1%
                  distributed.level3 = commL3;
                  const newBalL3 = Number(sponsor3.balance || 0) + commL3;

                  await supabaseAdmin
                    .from('users')
                    .update({ balance: newBalL3, updated_at: new Date().toISOString() })
                    .eq('id', sponsor3.id);

                  await supabaseAdmin.from('transactions').insert({
                    id: `tx-comm3-${Date.now()}`,
                    user_id: sponsor3.id,
                    phone_number: sponsor3.phone_number,
                    type: 'referral_commission',
                    amount: commL3,
                    status: 'COMPLETED',
                    description: `Commission de Parrainage (Niveau 3 - 1%)`,
                    details: `Achat de ${packageName} par un membre de niveau 3 de votre équipe`,
                    created_at: new Date().toISOString()
                  });
                }
              }
            }
          }
        }
      }

      return res.json({
        success: true,
        buyerBalance: newBuyerBalance,
        distributedCommissions: distributed,
        message: 'Achat validé et commissions versées aux parrains'
      });
    } catch (err: any) {
      console.error('Error in /api/products/purchase:', err);
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
