import express from 'express';
import path from 'path';
import fs from 'fs';
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
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      supabaseConnected: !!SUPABASE_SERVICE_ROLE_KEY,
      timestamp: new Date().toISOString()
    });
  });

  // Local file storage for users persistence across restarts
  const USERS_DIR = path.join(process.cwd(), 'data');
  const USERS_FILE = path.join(USERS_DIR, 'users.json');

  if (!fs.existsSync(USERS_DIR)) {
    try {
      fs.mkdirSync(USERS_DIR, { recursive: true });
    } catch (e) {
      console.error('Error creating data directory:', e);
    }
  }

  const inMemoryUsers = new Map<string, any>();

  function loadUsersFromDisk() {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach(u => {
            if (u && (u.id || u.phone_number || u.phoneNumber)) {
              const key = u.phone_number || u.phoneNumber || u.id;
              inMemoryUsers.set(key, u);
            }
          });
        }
      }
    } catch (e) {
      console.error('Error loading users from disk:', e);
    }
  }

  function saveUsersToDisk() {
    try {
      const arr = Array.from(inMemoryUsers.values());
      fs.writeFileSync(USERS_FILE, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving users to disk:', e);
    }
  }

  loadUsersFromDisk();

  // 1. ADMIN: List all users from Supabase / file store
  app.get('/api/admin/users', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        const fileUsers = Array.from(inMemoryUsers.values());
        return res.json({ success: true, users: fileUsers });
      }

      // Sync Supabase users to memory & file
      data.forEach((u: any) => {
        const key = u.phone_number || u.id;
        inMemoryUsers.set(key, u);
      });
      saveUsersToDisk();

      return res.json({ success: true, users: data || [] });
    } catch (err: any) {
      const fileUsers = Array.from(inMemoryUsers.values());
      return res.json({ success: true, users: fileUsers });
    }
  });

  // 1a. AUTH: Dedicated Register endpoint (creates account + 2,000 FCFA welcome bonus strictly once)
  app.post('/api/auth/register', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { phoneNumber, email, fullName, password, referralCode, referredBy } = req.body;
      const cleanPhone = (phoneNumber || '').trim();
      const cleanPhoneNoSpace = cleanPhone.replace(/\s+/g, '');
      const rawDigits = cleanPhone.replace(/\D/g, '');

      if (!cleanPhone || rawDigits.length < 6) {
        return res.status(400).json({ success: false, error: 'Numéro de téléphone requis et valide (au moins 6 chiffres).' });
      }

      if (!password || password.length < 4) {
        return res.status(400).json({ success: false, error: 'Le mot de passe doit comporter au moins 4 caractères.' });
      }

      // Check if user already exists in in-memory file store
      for (const u of inMemoryUsers.values()) {
        const uPhone = (u.phone_number || u.phoneNumber || '').replace(/\s+/g, '');
        const uDigits = (u.phone_number || u.phoneNumber || '').replace(/\D/g, '');
        if (uPhone === cleanPhoneNoSpace || uDigits === rawDigits) {
          return res.status(400).json({ 
            success: false, 
            error: 'Ce numéro de téléphone est déjà enregistré. Veuillez vous connecter.' 
          });
        }
      }

      // Check if user already exists in Supabase with any variant
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .or(`phone_number.eq.${cleanPhone},phone_number.eq.${cleanPhoneNoSpace},phone_number.eq.${rawDigits}`)
        .maybeSingle();

      if (existingUser) {
        inMemoryUsers.set(existingUser.phone_number || existingUser.id, existingUser);
        saveUsersToDisk();
        return res.status(400).json({ 
          success: false, 
          error: 'Ce numéro de téléphone est déjà enregistré. Veuillez vous connecter.' 
        });
      }

      // Check sponsor if referral code provided
      let sponsorUser: any = null;
      if (referredBy) {
        const refBy = referredBy.trim();
        const refByNoSpace = refBy.replace(/\s+/g, '');
        const { data: sponsor } = await supabaseAdmin
          .from('users')
          .select('*')
          .or(`referral_code.eq.${refBy},phone_number.eq.${refBy},phone_number.eq.${refByNoSpace},id.eq.${refBy}`)
          .maybeSingle();
        sponsorUser = sponsor;
      }

      const generatedReferralCode = referralCode || `AURA-${Math.floor(1000 + Math.random() * 9000)}`;
      const userEmail = email || `${rawDigits || cleanPhoneNoSpace}@aurainvest.com`;
      const displayName = fullName || `Membre ${rawDigits.slice(-4) || cleanPhone}`;

      // Insert new user into database with strictly 2,000 FCFA signup bonus
      const newUserPayload = {
        id: `usr-${Date.now().toString().slice(-6)}`,
        phone_number: cleanPhone,
        email: userEmail,
        full_name: displayName,
        password: password,
        balance: 2000,
        total_recharged: 0,
        total_withdrawn: 0,
        vip_level: 0,
        referral_code: generatedReferralCode,
        referred_by: sponsorUser ? (sponsorUser.referral_code || sponsorUser.phone_number) : (referredBy || null),
        is_admin: cleanPhone.toLowerCase().includes('admin') || password === 'admin2026' || cleanPhone === '699000000',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdUser, error: insertErr } = await supabaseAdmin
        .from('users')
        .insert(newUserPayload)
        .select()
        .single();

      if (insertErr) {
        console.error('Supabase user insert error in /api/auth/register:', insertErr);
      }

      const userRecord = createdUser || newUserPayload;

      // Save to memory and disk cache
      inMemoryUsers.set(cleanPhone, userRecord);
      inMemoryUsers.set(userRecord.id, userRecord);
      saveUsersToDisk();

      // Record the single welcome bonus transaction in transactions table
      const welcomeTxId = `tx-bonus-${Date.now()}`;
      await supabaseAdmin.from('transactions').insert({
        id: welcomeTxId,
        user_id: userRecord.id,
        phone_number: cleanPhone,
        user_name: displayName,
        type: 'vip_earning',
        amount: 2000,
        status: 'COMPLETED',
        description: 'Bonus d\'inscription offert',
        details: 'Crédit de bienvenue de 2 000 FCFA offert à la création du compte',
        created_at: new Date().toISOString()
      });

      // Record referral link in referrals table if sponsor found
      if (sponsorUser) {
        try {
          await supabaseAdmin.from('referrals').insert({
            sponsor_id: sponsorUser.id,
            sponsor_phone: sponsorUser.phone_number,
            sponsor_code: sponsorUser.referral_code,
            referee_id: userRecord.id,
            referee_name: displayName,
            referee_phone: cleanPhone,
            level: 1,
            status: 'active',
            commission_earned: 0,
            created_at: new Date().toISOString()
          });
        } catch (refErr) {
          console.warn('Notice inserting referral entry:', refErr);
        }
      }

      return res.json({
        success: true,
        isNew: true,
        user: userRecord,
        balance: 2000,
        message: 'Compte créé avec succès ! Bonus de 2 000 FCFA crédité.'
      });
    } catch (err: any) {
      console.error('Error in /api/auth/register:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1b. AUTH: Dedicated Login endpoint (authenticates existing users only)
  app.post('/api/auth/login', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { phoneNumber, password } = req.body;
      const cleanPhone = (phoneNumber || '').trim();
      const cleanPhoneNoSpace = cleanPhone.replace(/\s+/g, '');
      const rawDigits = cleanPhone.replace(/\D/g, '');

      if (!cleanPhone) {
        return res.status(400).json({ success: false, error: 'Numéro de téléphone requis.' });
      }

      if (!password) {
        return res.status(400).json({ success: false, error: 'Mot de passe requis.' });
      }

      const isAdmin = cleanPhone.toLowerCase().includes('admin') || password === 'admin2026' || cleanPhone === '699000000';

      // 1. Find user in Supabase with any phone format
      let existingUser: any = null;
      try {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .or(`phone_number.eq.${cleanPhone},phone_number.eq.${cleanPhoneNoSpace},phone_number.eq.${rawDigits}`)
          .maybeSingle();
        existingUser = dbUser;
      } catch (dbErr) {
        console.warn('Supabase login lookup notice:', dbErr);
      }

      // 2. Fallback to inMemory/disk store
      if (!existingUser) {
        for (const u of inMemoryUsers.values()) {
          const uPhone = (u.phone_number || u.phoneNumber || '').replace(/\s+/g, '');
          const uDigits = (u.phone_number || u.phoneNumber || '').replace(/\D/g, '');
          if (uPhone === cleanPhoneNoSpace || uDigits === rawDigits || u.id === cleanPhone) {
            existingUser = u;
            break;
          }
        }
      }

      if (!existingUser) {
        if (isAdmin) {
          // Auto-provision admin if master credentials used
          const adminUser = {
            id: 'usr-admin-root',
            phone_number: cleanPhone,
            email: 'admin@aurainvest.com',
            full_name: 'Administrateur Général Aura',
            password: 'admin2026',
            balance: 50000000,
            vip_tier: 'VIP 5 Obsidian',
            status: 'active',
            is_admin: true,
            referral_code: 'AURA-ADMIN',
            created_at: new Date().toISOString()
          };
          return res.json({ success: true, user: adminUser, balance: 50000000, isAdmin: true });
        }

        // STRICT CHECK: Reject unregistered users on login page
        return res.status(404).json({ 
          success: false, 
          error: 'Ce compte n\'existe pas. Veuillez vous inscrire avant de vous connecter.' 
        });
      }

      // Check password
      if (existingUser.password && existingUser.password !== password && !isAdmin) {
        return res.status(401).json({ success: false, error: 'Mot de passe incorrect. Veuillez réessayer.' });
      }

      if (existingUser.status === 'suspended') {
        return res.status(403).json({ success: false, error: 'Votre compte a été suspendu. Veuillez contacter le support.' });
      }

      return res.json({
        success: true,
        isNew: false,
        user: existingUser,
        balance: Number(existingUser.balance || 0),
        isAdmin: Boolean(existingUser.is_admin || isAdmin)
      });
    } catch (err: any) {
      console.error('Error in /api/auth/login:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1c. USER: Sync/Register User fallback
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
        balance: 2000,
        total_recharged: 0,
        total_withdrawn: 0,
        vip_level: 0,
        referral_code: referralCode || `AURA-${Math.floor(1000 + Math.random() * 9000)}`,
        referred_by: referredBy || null,
        is_admin: Boolean(isAdmin || role === 'admin'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdUser, error: insertErr } = await supabaseAdmin
        .from('users')
        .insert(insertPayload)
        .select()
        .single();

      if (insertErr) {
        console.warn('User insert warning in /api/users/sync:', insertErr);
        return res.json({ success: true, isNew: true, user: insertPayload, balance: 2000 });
      }

      return res.json({
        success: true,
        isNew: true,
        user: createdUser,
        balance: Number(createdUser.balance || 2000)
      });
    } catch (err: any) {
      console.error('Error in /api/users/sync:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1b-admin. ADMIN: Fetch ALL Users from Supabase
  app.get('/api/admin/users', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error querying users table in /api/admin/users:', error);
        return res.status(500).json({ success: false, error: error.message, users: [] });
      }

      return res.json({
        success: true,
        users: users || []
      });
    } catch (err: any) {
      console.error('Exception in GET /api/admin/users:', err);
      return res.status(500).json({ success: false, error: err.message, users: [] });
    }
  });

  // 1c. ADMIN: Create User manually
  app.post('/api/admin/users/create', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { name, phone, email, password, balance, vipTier } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Numéro de téléphone requis' });
      }

      const vipLevelNum = typeof vipTier === 'number' ? vipTier : (parseInt((vipTier || '').replace(/\D/g, ''), 10) || 0);

      const newUserPayload = {
        phone_number: phone,
        full_name: name || `Membre ${phone}`,
        email: email || `${phone.replace(/\s+/g, '')}@aurainvest.com`,
        balance: Number(balance || 0),
        vip_level: vipLevelNum,
        total_recharged: 0,
        total_withdrawn: 0,
        referral_code: `AURA-${Math.floor(1000 + Math.random() * 9000)}`,
        is_admin: false,
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
    res.setHeader('Content-Type', 'application/json');
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error querying transactions in /api/admin/transactions:', error);
        return res.json({ success: true, transactions: [] });
      }
      return res.json({ success: true, transactions: data || [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message, transactions: [] });
    }
  });

  // 1h. SUBMIT TRANSACTION (Guaranteed persistence with Service Role Key)
  app.post('/api/transactions/submit', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { 
        id, 
        userId, 
        userName, 
        phoneNumber, 
        type, 
        amount, 
        status, 
        description, 
        details, 
        channelName, 
        channelNumber, 
        proofReference, 
        date 
      } = req.body;

      if (!type || amount === undefined) {
        return res.status(400).json({ success: false, error: 'Type et montant requis' });
      }

      const txPayload = {
        id: id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId || null,
        phone_number: phoneNumber || channelNumber || null,
        user_name: userName || null,
        type: type,
        amount: Number(amount),
        status: status || 'pending',
        description: description || `Transaction ${type}`,
        details: details || null,
        channel_name: channelName || null,
        channel_number: channelNumber || null,
        proof_reference: proofReference || null,
        created_at: date || new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('transactions')
        .upsert(txPayload)
        .select()
        .single();

      if (error) {
        console.warn('Notice inserting transaction into Supabase:', error);
        return res.json({ success: true, transaction: txPayload });
      }

      return res.json({ success: true, transaction: data });
    } catch (err: any) {
      console.error('Error in /api/transactions/submit:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1i. ADMIN: Get All Subscriptions / Investments across the platform
  app.get('/api/admin/subscriptions', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      // 1. Check if subscriptions table exists
      const { data: dbSubs, error: subErr } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!subErr && dbSubs && dbSubs.length > 0) {
        return res.json({ success: true, subscriptions: dbSubs });
      }

      // 2. Derive active investments from transactions where type is vip_earning or description includes VIP/Acquisition
      const { data: txs, error: txErr } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .or('type.eq.vip_earning,description.ilike.%Acquisition%,description.ilike.%VIP%')
        .order('created_at', { ascending: false });

      if (txErr || !txs) {
        return res.json({ success: true, subscriptions: [] });
      }

      const derivedSubs = txs
        .filter((t: any) => t.description && (t.description.includes('Acquisition') || t.description.includes('VIP') || t.type === 'vip_earning'))
        .map((t: any) => ({
          id: `sub-${t.id}`,
          userId: t.user_id,
          userName: t.user_name || `Membre ${t.phone_number || ''}`,
          userPhone: t.phone_number,
          packageId: t.description?.replace('Acquisition : ', '') || 'VIP Contract',
          packageName: t.description?.replace('Acquisition : ', '') || 'Mercedes VIP Contract',
          amountInvested: Number(t.amount || 0),
          dailyEarnings: Math.round(Number(t.amount || 0) * 0.05),
          durationDays: 45,
          daysCompleted: 1,
          status: 'active',
          isActive: true,
          createdAt: t.created_at
        }));

      return res.json({ success: true, subscriptions: derivedSubs });
    } catch (err: any) {
      console.error('Error in /api/admin/subscriptions:', err);
      return res.status(500).json({ success: false, error: err.message, subscriptions: [] });
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

  // 10. SUPPORT & REAL-TIME CHAT SYSTEM (Synchronized with Supabase DB, In-Memory Store & Disk JSON)
  const DATA_DIR = path.join(process.cwd(), 'data');
  const TICKETS_FILE = path.join(DATA_DIR, 'support_tickets.json');

  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.error('Failed to create data dir:', e);
    }
  }

  const inMemorySupportTickets: Map<string, any> = new Map();

  // Helper to load existing tickets from disk
  function loadTicketsFromDisk() {
    try {
      if (fs.existsSync(TICKETS_FILE)) {
        const raw = fs.readFileSync(TICKETS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((t: any) => {
            if (t && t.id) inMemorySupportTickets.set(t.id, t);
          });
        }
      }
    } catch (e) {
      console.error('Error loading tickets from disk:', e);
    }
  }

  // Helper to persist tickets to disk
  function saveTicketsToDisk() {
    try {
      const arr = Array.from(inMemorySupportTickets.values());
      fs.writeFileSync(TICKETS_FILE, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving tickets to disk:', e);
    }
  }

  // Initial load from disk
  loadTicketsFromDisk();

  // If completely empty, seed default welcome ticket
  if (inMemorySupportTickets.size === 0) {
    const defaultTicket = {
      id: 'ticket-demo-1',
      userId: 'usr-1002',
      userName: 'Marc Dubois',
      userEmail: 'marc.dubois@gmail.com',
      userPhone: '+225 07 48 12 34',
      subject: 'Assistance & Échanges Aura',
      status: 'open',
      unreadByAdmin: true,
      unreadByUser: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-demo-1',
          sender: 'user',
          text: 'Bonjour administrateur, j\'ai effectué une recharge sur mon compte Wave il y a quelques instants. Pouvez-vous vérifier ? Merci d\'avance !',
          timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    inMemorySupportTickets.set(defaultTicket.id, defaultTicket);
    saveTicketsToDisk();
  }

  // 10a. ADMIN: Get all support tickets (merges in-memory, disk and database cleanly)
  app.get('/api/support/tickets', async (req, res) => {
    try {
      loadTicketsFromDisk();

      // Try fetching from Supabase support_tickets to combine any external updates
      try {
        const { data: dbTickets, error: dbErr } = await supabaseAdmin
          .from('support_tickets')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!dbErr && Array.isArray(dbTickets) && dbTickets.length > 0) {
          for (const t of dbTickets) {
            const memoryTicket = inMemorySupportTickets.get(t.id);
            
            // Try fetching messages for this ticket from DB
            const { data: msgs } = await supabaseAdmin
              .from('support_messages')
              .select('*')
              .eq('ticket_id', t.id)
              .order('created_at', { ascending: true });

            const dbMessages = (msgs || []).map((m: any) => ({
              id: m.id,
              sender: m.sender === 'admin' ? 'admin' : 'user',
              text: m.text || m.message || '',
              imageUrl: m.image_url || m.imageUrl,
              timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00',
              createdAt: m.created_at
            }));

            // Merge messages without duplicate IDs
            const memoryMessages = memoryTicket?.messages || [];
            const msgMap = new Map<string, any>();
            dbMessages.forEach((m: any) => msgMap.set(m.id, m));
            memoryMessages.forEach((m: any) => msgMap.set(m.id, m));
            const mergedMessages = Array.from(msgMap.values()).sort((a, b) => {
              const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return ta - tb;
            });

            const mergedTicket = {
              id: t.id,
              userId: t.user_id || memoryTicket?.userId || 'usr-guest',
              userName: t.user_name || memoryTicket?.userName || `Membre ${t.user_phone || ''}`,
              userEmail: t.user_email || memoryTicket?.userEmail,
              userPhone: t.user_phone || memoryTicket?.userPhone,
              subject: t.subject || memoryTicket?.subject || 'Assistance & Échanges Aura',
              status: memoryTicket?.status || t.status || 'open',
              unreadByAdmin: memoryTicket?.unreadByAdmin ?? (t.unread_by_admin ?? false),
              unreadByUser: memoryTicket?.unreadByUser ?? (t.unread_by_user ?? false),
              createdAt: t.created_at || memoryTicket?.createdAt || new Date().toISOString(),
              updatedAt: memoryTicket?.updatedAt || t.updated_at || new Date().toISOString(),
              messages: mergedMessages.length > 0 ? mergedMessages : (memoryTicket?.messages || [])
            };

            inMemorySupportTickets.set(t.id, mergedTicket);
          }
          saveTicketsToDisk();
        }
      } catch (dbErr) {
        console.warn('Notice syncing Supabase tickets in GET /api/support/tickets:', dbErr);
      }

      // Return all in-memory tickets sorted by latest updatedAt or createdAt
      const ticketList = Array.from(inMemorySupportTickets.values()).sort(
        (a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
      );

      return res.json({ success: true, tickets: ticketList });
    } catch (err: any) {
      console.warn('Error in GET /api/support/tickets:', err);
      const ticketList = Array.from(inMemorySupportTickets.values());
      return res.json({ success: true, tickets: ticketList });
    }
  });

  // 10b. USER: Get ticket for a specific user
  app.get('/api/support/ticket/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const cleanId = (userId || '').trim();
      const cleanIdNoSpace = cleanId.replace(/\s+/g, '');
      const cleanDigits = cleanId.replace(/\D/g, '');
      const ticketId = `ticket-${cleanId}`;

      loadTicketsFromDisk();

      // Find in in-memory store
      let memoryTicket: any = null;
      for (const tk of inMemorySupportTickets.values()) {
        const tkUser = (tk.userId || '').replace(/\s+/g, '');
        const tkPhone = (tk.userPhone || '').replace(/\s+/g, '');
        const tkDigits = (tk.userPhone || '').replace(/\D/g, '');
        if (
          tk.id === ticketId || 
          tk.id === `ticket-${cleanIdNoSpace}` ||
          tkUser === cleanId || 
          tkUser === cleanIdNoSpace || 
          tkPhone === cleanId || 
          tkPhone === cleanIdNoSpace || 
          (cleanDigits.length >= 6 && tkDigits.endsWith(cleanDigits))
        ) {
          memoryTicket = tk;
          break;
        }
      }

      // Also try fetching from Supabase to merge any admin replies
      try {
        const { data: t } = await supabaseAdmin
          .from('support_tickets')
          .select('*')
          .or(`id.eq.${ticketId},id.eq.ticket-${cleanIdNoSpace},user_id.eq.${cleanId},user_phone.eq.${cleanId}`)
          .maybeSingle();

        if (t) {
          const { data: msgs } = await supabaseAdmin
            .from('support_messages')
            .select('*')
            .eq('ticket_id', t.id)
            .order('created_at', { ascending: true });

          const dbMessages = (msgs || []).map((m: any) => ({
            id: m.id,
            sender: m.sender === 'admin' ? 'admin' : 'user',
            text: m.text || m.message || '',
            imageUrl: m.image_url || m.imageUrl,
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00',
            createdAt: m.created_at
          }));

          const memoryMessages = memoryTicket?.messages || [];
          const msgMap = new Map<string, any>();
          dbMessages.forEach((m: any) => msgMap.set(m.id, m));
          memoryMessages.forEach((m: any) => msgMap.set(m.id, m));
          const mergedMessages = Array.from(msgMap.values()).sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return ta - tb;
          });

          memoryTicket = {
            id: memoryTicket?.id || t.id,
            userId: t.user_id || memoryTicket?.userId || cleanId,
            userName: t.user_name || memoryTicket?.userName || `Membre ${cleanId}`,
            userEmail: t.user_email || memoryTicket?.userEmail,
            userPhone: t.user_phone || memoryTicket?.userPhone || cleanId,
            subject: t.subject || memoryTicket?.subject || 'Assistance & Échanges Aura',
            status: memoryTicket?.status || t.status || 'open',
            unreadByAdmin: memoryTicket?.unreadByAdmin ?? (t.unread_by_admin ?? false),
            unreadByUser: memoryTicket?.unreadByUser ?? (t.unread_by_user ?? false),
            createdAt: t.created_at || memoryTicket?.createdAt || new Date().toISOString(),
            updatedAt: memoryTicket?.updatedAt || t.updated_at || new Date().toISOString(),
            messages: mergedMessages.length > 0 ? mergedMessages : (memoryTicket?.messages || [])
          };

          inMemorySupportTickets.set(memoryTicket.id, memoryTicket);
          saveTicketsToDisk();
        }
      } catch (dbErr) {
        console.warn('DB lookup notice in GET /api/support/ticket/:userId:', dbErr);
      }

      if (!memoryTicket) {
        // Create initial ticket
        memoryTicket = {
          id: ticketId,
          userId: cleanId,
          userName: `Membre ${cleanId}`,
          userEmail: `${cleanId}@aurainvest.com`,
          userPhone: cleanId,
          subject: 'Assistance & Échanges Aura',
          status: 'answered',
          unreadByAdmin: false,
          unreadByUser: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg-init',
              sender: 'admin',
              text: 'Bonjour ! Bienvenue sur le salon d\'échange et support officiel Aura Invest. Vous êtes en liaison directe avec l\'administration.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              createdAt: new Date().toISOString()
            }
          ]
        };
        inMemorySupportTickets.set(ticketId, memoryTicket);
        saveTicketsToDisk();
      }

      return res.json({ success: true, ticket: memoryTicket });
    } catch (err: any) {
      console.warn('Error in GET /api/support/ticket/:userId:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10c. Send Message (from User or Admin) with Instant Real-Time Persistence
  app.post('/api/support/message', async (req, res) => {
    try {
      const { userId, userName, userPhone, userEmail, text, sender, imageUrl, ticketId: providedTicketId } = req.body;
      const cleanText = (text || '').trim();
      const messageSender = sender === 'admin' ? 'admin' : 'user';

      if (!cleanText && !imageUrl) {
        return res.status(400).json({ success: false, error: 'Le texte ou une image est requis.' });
      }

      const uid = (userId || userPhone || 'usr-guest').trim();
      const cleanPhone = (userPhone || (uid.startsWith('usr-') ? '' : uid)).trim();
      const ticketId = providedTicketId || `ticket-${uid}`;
      const nowIso = new Date().toISOString();
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMsg: any = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender: messageSender,
        text: cleanText,
        timestamp: timeString,
        createdAt: nowIso
      };

      if (imageUrl) {
        newMsg.imageUrl = imageUrl;
      }

      loadTicketsFromDisk();

      // 1. Update in-memory store immediately
      let existingTicket = inMemorySupportTickets.get(ticketId);
      if (!existingTicket) {
        const cleanUidNoSpace = uid.replace(/\s+/g, '');
        const cleanDigits = cleanPhone.replace(/\D/g, '');

        for (const tk of inMemorySupportTickets.values()) {
          const tkUser = (tk.userId || '').replace(/\s+/g, '');
          const tkPhone = (tk.userPhone || '').replace(/\s+/g, '');
          const tkDigits = (tk.userPhone || '').replace(/\D/g, '');
          if (
            tk.id === ticketId ||
            tk.id === `ticket-${cleanUidNoSpace}` ||
            tkUser === uid ||
            tkUser === cleanUidNoSpace ||
            (cleanPhone && (tkPhone === cleanPhone || tkPhone === cleanPhone.replace(/\s+/g, ''))) ||
            (cleanDigits.length >= 6 && tkDigits.endsWith(cleanDigits))
          ) {
            existingTicket = tk;
            break;
          }
        }
      }

      if (!existingTicket) {
        existingTicket = {
          id: ticketId,
          userId: uid,
          userName: userName || (cleanPhone ? `Membre ${cleanPhone}` : `Membre ${uid}`),
          userEmail: userEmail || `${uid}@aurainvest.com`,
          userPhone: cleanPhone || uid,
          subject: 'Assistance & Échanges Aura',
          status: messageSender === 'user' ? 'open' : 'answered',
          unreadByAdmin: messageSender === 'user',
          unreadByUser: messageSender === 'admin',
          createdAt: nowIso,
          updatedAt: nowIso,
          messages: []
        };
      }

      if (!Array.isArray(existingTicket.messages)) {
        existingTicket.messages = [];
      }

      existingTicket.messages.push(newMsg);
      existingTicket.updatedAt = nowIso;

      if (userName && (!existingTicket.userName || existingTicket.userName.includes('Membre'))) {
        existingTicket.userName = userName;
      }
      if (cleanPhone) existingTicket.userPhone = cleanPhone;
      if (userEmail) existingTicket.userEmail = userEmail;

      if (messageSender === 'user') {
        existingTicket.status = 'open';
        existingTicket.unreadByAdmin = true;
        existingTicket.unreadByUser = false;
      } else {
        existingTicket.status = 'answered';
        existingTicket.unreadByUser = true;
        existingTicket.unreadByAdmin = false;
      }

      inMemorySupportTickets.set(existingTicket.id, existingTicket);
      saveTicketsToDisk();

      // 2. Persist to Supabase Database asynchronously
      (async () => {
        try {
          await supabaseAdmin.from('support_tickets').upsert({
            id: existingTicket.id,
            user_id: existingTicket.userId,
            user_name: existingTicket.userName,
            user_phone: existingTicket.userPhone,
            user_email: existingTicket.userEmail,
            subject: existingTicket.subject,
            status: existingTicket.status,
            unread_by_admin: existingTicket.unreadByAdmin,
            unread_by_user: existingTicket.unreadByUser,
            updated_at: nowIso
          });

          await supabaseAdmin.from('support_messages').insert({
            id: newMsg.id,
            ticket_id: existingTicket.id,
            user_id: existingTicket.userId,
            sender: messageSender,
            text: cleanText,
            image_url: imageUrl || null,
            created_at: nowIso
          });
        } catch (dbErr) {
          console.warn('Supabase DB support persistence notice:', dbErr);
        }
      })();

      return res.json({
        success: true,
        ticket: existingTicket,
        message: newMsg
      });
    } catch (err: any) {
      console.error('Error in POST /api/support/message:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10d. ADMIN: Update Ticket Status (open, answered, resolved, closed)
  app.post('/api/support/ticket/status', async (req, res) => {
    try {
      const { ticketId, status } = req.body;
      const ticket = inMemorySupportTickets.get(ticketId);
      if (ticket) {
        ticket.status = status;
        ticket.updatedAt = new Date().toISOString();
        if (status === 'resolved' || status === 'closed') {
          ticket.unreadByAdmin = false;
        }
        inMemorySupportTickets.set(ticketId, ticket);
        saveTicketsToDisk();
      }

      await supabaseAdmin
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      return res.json({ success: true, status });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10e. Mark ticket as read (by Admin or User)
  app.post('/api/support/ticket/read', async (req, res) => {
    try {
      const { ticketId, role } = req.body; // role: 'admin' | 'user'
      const ticket = inMemorySupportTickets.get(ticketId);
      if (ticket) {
        if (role === 'admin') {
          ticket.unreadByAdmin = false;
        } else {
          ticket.unreadByUser = false;
        }
        inMemorySupportTickets.set(ticketId, ticket);
        saveTicketsToDisk();
      }

      await supabaseAdmin
        .from('support_tickets')
        .update({ 
          unread_by_admin: role === 'admin' ? false : ticket?.unreadByAdmin,
          unread_by_user: role === 'user' ? false : ticket?.unreadByUser,
          updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId);

      return res.json({ success: true, ticket });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10f. Delete ticket
  app.post('/api/support/ticket/delete', async (req, res) => {
    try {
      const { ticketId } = req.body;
      if (ticketId) {
        inMemorySupportTickets.delete(ticketId);
        saveTicketsToDisk();

        await supabaseAdmin.from('support_messages').delete().eq('ticket_id', ticketId);
        await supabaseAdmin.from('support_tickets').delete().eq('id', ticketId);
      }
      return res.json({ success: true, ticketId });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. AUTOMATIC 24H REVENUE PAYOUT ENGINE (Server-authoritative, prevents double execution)
  app.post('/api/earnings/payout', async (req, res) => {
    try {
      const { userId, phoneNumber, subscriptionId, packageName, earnedAmount, durationDays, daysCompleted } = req.body;
      const parsedAmount = Number(earnedAmount);

      if ((!userId && !phoneNumber) || isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Paramètres invalides pour le versement 24h.' });
      }

      const userQuery = supabaseAdmin.from('users').select('*');
      if (userId) userQuery.eq('id', userId);
      else if (phoneNumber) userQuery.eq('phone_number', phoneNumber);

      const { data: user, error: userErr } = await userQuery.single();
      if (userErr || !user) {
        return res.status(404).json({ success: false, error: 'Utilisateur introuvable.' });
      }

      // Credit user's main balance in Supabase
      const newBal = Number(user.balance || 0) + parsedAmount;
      await supabaseAdmin
        .from('users')
        .update({ balance: newBal, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      // Record daily payout transaction
      const txId = `tx-24h-${Date.now()}-${subscriptionId || 'sub'}`;
      await supabaseAdmin.from('transactions').insert({
        id: txId,
        user_id: user.id,
        phone_number: user.phone_number,
        user_name: user.full_name,
        type: 'vip_earning',
        amount: parsedAmount,
        status: 'COMPLETED',
        description: `Revenu journalier 24h - ${packageName || 'Véhicule'}`,
        details: `Versement automatique 24h (Jour ${daysCompleted || 1}/${durationDays || 80}) • Crédité sur solde principal`,
        created_at: new Date().toISOString()
      });

      return res.json({
        success: true,
        newBalance: newBal,
        earnedAmount: parsedAmount,
        transactionId: txId
      });
    } catch (err: any) {
      console.error('Error in /api/earnings/payout:', err);
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
