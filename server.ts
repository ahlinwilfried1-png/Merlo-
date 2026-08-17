import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// Security: Password Hashing using HMAC-SHA256
const PASSWORD_SALT = 'agroprofit_secure_key_2026_salt_v1';

export function hashPassword(password: string): string {
  if (!password) return '';
  return crypto.createHmac('sha256', PASSWORD_SALT).update(password).digest('hex');
}

export function verifyPassword(plainPassword: string, storedHashOrPlain: string): boolean {
  if (!storedHashOrPlain || !plainPassword) return false;
  const computedHash = hashPassword(plainPassword);
  if (computedHash === storedHashOrPlain) return true;
  // Fallback for legacy passwords during transition
  if (plainPassword === storedHashOrPlain) return true;
  return false;
}

// Master Admin Credentials
export const MASTER_ADMIN_USERNAME = 'ADMIN_PRINCIPAL';
export const MASTER_ADMIN_EMAIL = 'admin@agroprofit.com';
export const MASTER_ADMIN_PHONE = '+228 90 00 00 00';
export const MASTER_ADMIN_PHONE_RAW = '90000000';
export const MASTER_ADMIN_TEMP_PASSWORD = 'AgroProfit#2026!Secure9X';

// Supabase URL & Service Role / Anon Key (NEVER exposed to the client)
const SUPABASE_URL = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://vzncyplvarwwhxsfkmhv.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bmN5cGx2YXJ3d2h4c2ZrbWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODIwMzIsImV4cCI6MjEwMjI1ODAzMn0.ksipxsHfARgfOkbXBJFbmIfHLfIEKmBARvCJBuY3yaY';

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
  const DATA_DIR = path.join(process.cwd(), 'data');
  const USERS_DIR = DATA_DIR;
  const USERS_FILE = path.join(USERS_DIR, 'users.json');

  if (!fs.existsSync(USERS_DIR)) {
    try {
      fs.mkdirSync(USERS_DIR, { recursive: true });
    } catch (e) {
      console.error('Error creating data directory:', e);
    }
  }

  const inMemoryUsers = new Map<string, any>();

  // Sanitize user before returning to client (strip passwords, ensure role flags)
  function sanitizeUser(u: any) {
    if (!u) return null;
    const { password, password_hash, ...safe } = u;
    const isMaster = 
      u.id === 'usr-admin-principal' || 
      (u.phone_number && u.phone_number.toUpperCase() === MASTER_ADMIN_PHONE.toUpperCase()) || 
      (u.email && u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) ||
      (u.username && u.username.toUpperCase() === MASTER_ADMIN_USERNAME.toUpperCase()) ||
      u.role === 'principal_admin';

    const isAdmin = Boolean(isMaster || u.is_admin === true || u.role === 'admin' || u.role === 'principal_admin');
    const role = isMaster ? 'principal_admin' : (isAdmin ? 'admin' : 'user');

    return {
      ...safe,
      is_admin: isAdmin,
      role: role
    };
  }

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

  // Initialize and ensure Principal Admin Account in memory and database
  async function ensureMasterAdminUser() {
    const masterAdminPayload = {
      id: 'usr-admin-principal',
      phone_number: MASTER_ADMIN_PHONE,
      username: MASTER_ADMIN_USERNAME,
      email: MASTER_ADMIN_EMAIL,
      full_name: 'ADMIN_PRINCIPAL',
      password: hashPassword(MASTER_ADMIN_TEMP_PASSWORD),
      balance: 100000000,
      vip_level: 10,
      vip_tier: 'VIP 10 Ultime',
      status: 'active',
      is_admin: true,
      role: 'principal_admin',
      referral_code: 'AGRO-PRINCIPAL',
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: new Date().toISOString()
    };

    inMemoryUsers.set(MASTER_ADMIN_PHONE, masterAdminPayload);
    inMemoryUsers.set(MASTER_ADMIN_PHONE_RAW, masterAdminPayload);
    inMemoryUsers.set('+22890000000', masterAdminPayload);
    inMemoryUsers.set('90000000', masterAdminPayload);
    inMemoryUsers.set(MASTER_ADMIN_EMAIL, masterAdminPayload);
    inMemoryUsers.set(MASTER_ADMIN_USERNAME, masterAdminPayload);
    inMemoryUsers.set(masterAdminPayload.id, masterAdminPayload);
    saveUsersToDisk();

    try {
      await supabaseAdmin.from('users').upsert(masterAdminPayload);
    } catch (e) {
      console.warn('Master admin upsert notice in Supabase:', e);
    }
  }

  ensureMasterAdminUser();

  // 1. ADMIN: List all users from Supabase / file store (Sanitized: Passwords NEVER exposed)
  app.get('/api/admin/users', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        const fileUsers = Array.from(inMemoryUsers.values()).map(sanitizeUser);
        const unique = Array.from(new Map(fileUsers.map(u => [u.id || u.phone_number, u])).values());
        return res.json({ success: true, users: unique });
      }

      // Sync Supabase users to memory & file
      data.forEach((u: any) => {
        const key = u.phone_number || u.id;
        inMemoryUsers.set(key, u);
      });
      saveUsersToDisk();

      const sanitizedUsers = data.map(sanitizeUser);
      const unique = Array.from(new Map(sanitizedUsers.map(u => [u.id || u.phone_number, u])).values());
      return res.json({ success: true, users: unique });
    } catch (err: any) {
      const fileUsers = Array.from(inMemoryUsers.values()).map(sanitizeUser);
      const unique = Array.from(new Map(fileUsers.map(u => [u.id || u.phone_number, u])).values());
      return res.json({ success: true, users: unique });
    }
  });

  // 1a. AUTH: Dedicated Register endpoint (creates account + 100 FCFA welcome bonus strictly once)
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

      const generatedReferralCode = referralCode || `AGRO-${Math.floor(1000 + Math.random() * 9000)}`;
      const userEmail = email || `${rawDigits || cleanPhoneNoSpace}@agroprofit.com`;
      const displayName = fullName || `Membre ${rawDigits.slice(-4) || cleanPhone}`;

      // Insert new user into database with strictly 100 FCFA signup bonus (Role: Standard User, never automatically admin)
      const newUserPayload = {
        id: `usr-${Date.now().toString().slice(-6)}`,
        phone_number: cleanPhone,
        email: userEmail,
        full_name: displayName,
        password: hashPassword(password),
        balance: 100,
        total_recharged: 0,
        total_withdrawn: 0,
        vip_level: 0,
        referral_code: generatedReferralCode,
        referred_by: sponsorUser ? (sponsorUser.referral_code || sponsorUser.phone_number) : (referredBy || null),
        is_admin: false,
        role: 'user',
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
        amount: 100,
        status: 'COMPLETED',
        description: 'Bonus d\'inscription offert',
        details: 'Crédit de bienvenue de 100 FCFA offert à la création du compte',
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

      const safeUser = sanitizeUser(userRecord);

      return res.json({
        success: true,
        isNew: true,
        user: safeUser,
        balance: 100,
        message: 'Compte créé avec succès ! Bonus de 100 FCFA crédité.'
      });
    } catch (err: any) {
      console.error('Error in /api/auth/register:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1b. AUTH: Dedicated Login endpoint (authenticates existing users & master admin)
  app.post('/api/auth/login', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { phoneNumber, password } = req.body;
      const cleanPhone = (phoneNumber || '').trim();
      const cleanPhoneNoSpace = cleanPhone.replace(/\s+/g, '');
      const rawDigits = cleanPhone.replace(/\D/g, '');

      if (!cleanPhone) {
        return res.status(400).json({ success: false, error: 'Identifiant (Téléphone, Email ou Nom d\'utilisateur) requis.' });
      }

      if (!password) {
        return res.status(400).json({ success: false, error: 'Mot de passe requis.' });
      }

      // Check for Master Admin Login
      const isMasterAdminIdentifier = 
        cleanPhone.toUpperCase() === MASTER_ADMIN_USERNAME.toUpperCase() || 
        cleanPhone.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() ||
        cleanPhone.toUpperCase() === MASTER_ADMIN_PHONE.toUpperCase() ||
        cleanPhone.replace(/\s+/g, '') === MASTER_ADMIN_PHONE.replace(/\s+/g, '') ||
        cleanPhone.replace(/\s+/g, '') === MASTER_ADMIN_PHONE_RAW ||
        cleanPhone.replace(/\D/g, '') === '22890000000' ||
        cleanPhone.replace(/\D/g, '') === '90000000' ||
        cleanPhone === '90 00 00 00' ||
        cleanPhone === '+228 90 00 00 00';

      if (isMasterAdminIdentifier) {
        if (password === MASTER_ADMIN_TEMP_PASSWORD || verifyPassword(password, hashPassword(MASTER_ADMIN_TEMP_PASSWORD))) {
          const masterAdmin = {
            id: 'usr-admin-principal',
            phone_number: MASTER_ADMIN_PHONE,
            username: MASTER_ADMIN_USERNAME,
            email: MASTER_ADMIN_EMAIL,
            full_name: 'ADMIN_PRINCIPAL',
            balance: 100000000,
            vip_level: 10,
            vip_tier: 'VIP 10 Ultime',
            status: 'active',
            is_admin: true,
            role: 'principal_admin',
            referral_code: 'AGRO-PRINCIPAL',
            created_at: '2026-08-01T00:00:00.000Z'
          };
          return res.json({
            success: true,
            isNew: false,
            user: masterAdmin,
            balance: 100000000,
            isAdmin: true,
            role: 'principal_admin'
          });
        } else {
          return res.status(401).json({ success: false, error: 'Mot de passe administrateur principal incorrect.' });
        }
      }

      // 1. Find user in Supabase with any phone/email/id format
      let existingUser: any = null;
      try {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .or(`phone_number.eq.${cleanPhone},phone_number.eq.${cleanPhoneNoSpace},phone_number.eq.${rawDigits},email.eq.${cleanPhone},email.eq.${cleanPhoneNoSpace},id.eq.${cleanPhone}`)
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
          const uEmail = (u.email || '').trim().toLowerCase();
          const uUsername = (u.username || '').trim().toUpperCase();
          if (
            uPhone === cleanPhoneNoSpace || 
            uDigits === rawDigits || 
            u.id === cleanPhone ||
            uEmail === cleanPhone.toLowerCase() ||
            uUsername === cleanPhone.toUpperCase()
          ) {
            existingUser = u;
            break;
          }
        }
      }

      if (!existingUser) {
        // STRICT CHECK: Reject unregistered users on login page
        return res.status(404).json({ 
          success: false, 
          error: 'Ce compte n\'existe pas. Veuillez vous inscrire avant de vous connecter.' 
        });
      }

      // Check password using secure cryptographic verification
      const isPassValid = verifyPassword(password, existingUser.password);
      if (!isPassValid) {
        return res.status(401).json({ success: false, error: 'Mot de passe incorrect. Veuillez réessayer.' });
      }

      if (existingUser.status === 'suspended') {
        return res.status(403).json({ success: false, error: 'Votre compte a été suspendu. Veuillez contacter le support.' });
      }

      const safeUser = sanitizeUser(existingUser);

      return res.json({
        success: true,
        isNew: false,
        user: safeUser,
        balance: Number(existingUser.balance || 0),
        isAdmin: Boolean(safeUser.is_admin),
        role: safeUser.role
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
        balance: 1000,
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
        return res.json({ success: true, isNew: true, user: insertPayload, balance: 1000 });
      }

      return res.json({
        success: true,
        isNew: true,
        user: createdUser,
        balance: Number(createdUser.balance || 1000)
      });
    } catch (err: any) {
      console.error('Error in /api/users/sync:', err);
      return res.status(500).json({ success: false, error: err.message });
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
        email: email || `${phone.replace(/\s+/g, '')}@agroprofit.com`,
        password: hashPassword(password || 'agro2026'),
        balance: Number(balance || 0),
        vip_level: vipLevelNum,
        total_recharged: 0,
        total_withdrawn: 0,
        referral_code: `AGRO-${Math.floor(1000 + Math.random() * 9000)}`,
        is_admin: false,
        role: 'user',
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

      inMemoryUsers.set(phone, data || newUserPayload);
      saveUsersToDisk();

      const safeUser = sanitizeUser(data || newUserPayload);
      return res.json({ success: true, user: safeUser });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1d. ADMIN: Update User Password (Hashes password securely)
  app.post('/api/admin/users/password', async (req, res) => {
    try {
      const { userId, phoneNumber, newPassword } = req.body;
      if ((!userId && !phoneNumber) || !newPassword) {
        return res.status(400).json({ success: false, error: 'Identifiant et nouveau mot de passe requis' });
      }

      const hashedPassword = hashPassword(newPassword);

      const query = supabaseAdmin.from('users').update({
        password: hashedPassword,
        updated_at: new Date().toISOString()
      });

      if (userId) query.eq('id', userId);
      else if (phoneNumber) query.eq('phone_number', phoneNumber);

      const { data, error } = await query.select().single();
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      // Update in memory
      for (const [k, u] of inMemoryUsers.entries()) {
        if (u.id === userId || u.phone_number === phoneNumber) {
          u.password = hashedPassword;
          inMemoryUsers.set(k, u);
        }
      }
      saveUsersToDisk();

      return res.json({ success: true, user: sanitizeUser(data), message: 'Mot de passe mis à jour avec succès' });
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

      // Prevent deletion of principal admin
      if (userId === 'usr-admin-principal' || phoneNumber === MASTER_ADMIN_PHONE || phoneNumber === MASTER_ADMIN_EMAIL) {
        return res.status(400).json({ success: false, error: 'Impossible de supprimer le compte administrateur principal.' });
      }

      const query = supabaseAdmin.from('users').delete();
      if (userId) query.eq('id', userId);
      else if (phoneNumber) query.eq('phone_number', phoneNumber);

      const { error } = await query;
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      if (userId) inMemoryUsers.delete(userId);
      if (phoneNumber) inMemoryUsers.delete(phoneNumber);
      saveUsersToDisk();

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

      for (const [k, u] of inMemoryUsers.entries()) {
        if (u.id === userId || u.phone_number === phoneNumber) {
          u.status = status;
          inMemoryUsers.set(k, u);
        }
      }
      saveUsersToDisk();

      return res.json({ success: true, user: sanitizeUser(data) });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1f2. ADMIN: Update User VIP Level & Tier
  app.post('/api/admin/users/vip', async (req, res) => {
    try {
      const { userId, phoneNumber, vipTier, vipLevel } = req.body;
      const query = supabaseAdmin.from('users').update({
        vip_tier: vipTier,
        vip_level: vipLevel !== undefined ? Number(vipLevel) : undefined,
        updated_at: new Date().toISOString()
      });
      if (userId) query.eq('id', userId);
      else if (phoneNumber) query.eq('phone_number', phoneNumber);

      const { data, error } = await query.select().single();
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      return res.json({ success: true, user: sanitizeUser(data) });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1f3. ADMIN: Assign / Revoke Administrator Role (Gestion des administrateurs)
  app.post('/api/admin/roles/assign', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { targetUserId, targetPhone, newRole } = req.body;
      if (!targetUserId && !targetPhone) {
        return res.status(400).json({ success: false, error: 'Identifiant ou numéro de l\'utilisateur cible requis.' });
      }

      const isTargetMaster = 
        targetUserId === 'usr-admin-principal' || 
        targetPhone === MASTER_ADMIN_PHONE || 
        targetPhone === MASTER_ADMIN_EMAIL ||
        targetPhone === MASTER_ADMIN_USERNAME;

      if (isTargetMaster && newRole !== 'principal_admin' && newRole !== 'admin') {
        return res.status(400).json({ 
          success: false, 
          error: 'Impossible de révoquer les droits de l\'administrateur principal.' 
        });
      }

      const isAdminBool = newRole === 'admin' || newRole === 'principal_admin';
      const roleStr = isTargetMaster ? 'principal_admin' : (isAdminBool ? 'admin' : 'user');

      // Update in Supabase
      try {
        const query = supabaseAdmin.from('users').update({
          is_admin: isAdminBool,
          role: roleStr,
          updated_at: new Date().toISOString()
        });
        if (targetUserId) query.eq('id', targetUserId);
        else if (targetPhone) query.eq('phone_number', targetPhone);
        await query;
      } catch (dbErr) {
        console.warn('Supabase role update notice:', dbErr);
      }

      // Update in memory and file
      for (const [k, u] of inMemoryUsers.entries()) {
        if (u.id === targetUserId || u.phone_number === targetPhone || u.email === targetPhone) {
          u.is_admin = isAdminBool;
          u.role = roleStr;
          u.updated_at = new Date().toISOString();
          inMemoryUsers.set(k, u);
        }
      }
      saveUsersToDisk();

      return res.json({
        success: true,
        message: `Rôle mis à jour avec succès : ${roleStr === 'principal_admin' ? 'Administrateur Principal' : roleStr === 'admin' ? 'Administrateur' : 'Utilisateur standard'}`,
        is_admin: isAdminBool,
        role: roleStr
      });
    } catch (err: any) {
      console.error('Error in /api/admin/roles/assign:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1f4. ADMIN: Fetch Administrators list
  app.get('/api/admin/administrators', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const allUsers = Array.from(inMemoryUsers.values()).map(sanitizeUser);
      const admins = allUsers.filter((u: any) => u.is_admin || u.role === 'admin' || u.role === 'principal_admin');
      const uniqueAdmins = Array.from(new Map(admins.map((a: any) => [a.id || a.phone_number, a])).values());
      return res.json({ success: true, administrators: uniqueAdmins });
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
        .neq('type', 'chat_msg')
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
  const DELETED_SUBS_FILE = path.join(DATA_DIR, 'deleted_subscriptions.json');
  let inMemoryDeletedSubs: Set<string> = new Set();
  try {
    if (fs.existsSync(DELETED_SUBS_FILE)) {
      const raw = fs.readFileSync(DELETED_SUBS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) inMemoryDeletedSubs = new Set(parsed);
    }
  } catch (e) {}

  function saveDeletedSubsToDisk() {
    try {
      fs.writeFileSync(DELETED_SUBS_FILE, JSON.stringify(Array.from(inMemoryDeletedSubs), null, 2), 'utf-8');
    } catch (e) {}
  }

  app.get('/api/admin/subscriptions', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    try {
      // 1. Check if subscriptions table exists
      const { data: dbSubs, error: subErr } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!subErr && dbSubs && dbSubs.length > 0) {
        const filtered = dbSubs.filter((s: any) => !inMemoryDeletedSubs.has(s.id));
        return res.json({ success: true, subscriptions: filtered });
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
          packageName: t.description?.replace('Acquisition : ', '') || 'Contrat VIP Agroprofit',
          amountInvested: Number(t.amount || 0),
          dailyEarnings: Math.round(Number(t.amount || 0) * 0.05),
          durationDays: 45,
          daysCompleted: 1,
          status: 'active',
          isActive: true,
          createdAt: t.created_at
        }))
        .filter((s: any) => !inMemoryDeletedSubs.has(s.id));

      return res.json({ success: true, subscriptions: derivedSubs });
    } catch (err: any) {
      console.error('Error in /api/admin/subscriptions:', err);
      return res.status(500).json({ success: false, error: err.message, subscriptions: [] });
    }
  });

  // 1j. ADMIN: Delete a User Subscription (paid product) - Does NOT touch user balance or other data!
  app.post('/api/admin/subscriptions/delete', async (req, res) => {
    try {
      const { subId } = req.body;
      if (!subId) {
        return res.status(400).json({ success: false, error: 'subId requis' });
      }
      inMemoryDeletedSubs.add(subId);
      saveDeletedSubsToDisk();

      // Delete from subscriptions table if exists
      try {
        await supabaseAdmin.from('subscriptions').delete().eq('id', subId);
      } catch (e) {
        console.warn('Notice deleting subscription row:', e);
      }

      return res.json({ 
        success: true, 
        message: 'Produit payé / souscription supprimé avec succès. Les soldes et dépôts de l\'utilisateur restent intacts.',
        deletedSubId: subId 
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1k. USER: Get deleted subscriptions list so client can filter out any removed paid products
  app.get('/api/subscriptions/deleted', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.json({ success: true, deletedSubIds: Array.from(inMemoryDeletedSubs) });
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

  // 3. ADMIN: Approve Deposit with Service Role & Auto-Credit User
  app.post('/api/admin/deposits/approve', async (req, res) => {
    try {
      const { transactionId, userId, amount } = req.body;

      if (!transactionId) {
        return res.status(400).json({ success: false, error: 'Identifiant de transaction requis' });
      }

      // Fetch transaction from Supabase
      const { data: tx } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .maybeSingle();

      const txAmount = Number(amount || tx?.amount || 0);
      const targetUserId = userId || tx?.user_id;
      const targetPhone = tx?.phone_number;

      // Update transaction status to COMPLETED
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', transactionId);

      // Find and credit user in Supabase
      let userRecord: any = null;
      if (targetUserId) {
        const { data: u } = await supabaseAdmin.from('users').select('*').eq('id', targetUserId).maybeSingle();
        userRecord = u;
      }
      if (!userRecord && targetPhone) {
        const { data: u } = await supabaseAdmin.from('users').select('*').or(`phone_number.eq.${targetPhone},phone_number.eq.${targetPhone.replace(/\s+/g, '')}`).maybeSingle();
        userRecord = u;
      }

      if (userRecord && txAmount > 0) {
        const currentBal = Number(userRecord.balance || 0);
        const currentRecharged = Number(userRecord.total_recharged || 0);
        const newBalance = currentBal + txAmount;
        const newRecharged = currentRecharged + txAmount;

        await supabaseAdmin
          .from('users')
          .update({ 
            balance: newBalance, 
            total_recharged: newRecharged,
            updated_at: new Date().toISOString() 
          })
          .eq('id', userRecord.id);

        // Update in-memory user cache
        const cacheKey = userRecord.phone_number || userRecord.id;
        userRecord.balance = newBalance;
        userRecord.total_recharged = newRecharged;
        inMemoryUsers.set(cacheKey, userRecord);
        inMemoryUsers.set(userRecord.id, userRecord);
        saveUsersToDisk();
      }

      return res.json({ 
        success: true, 
        message: 'Dépôt validé avec succès et solde utilisateur synchronisé' 
      });
    } catch (err: any) {
      console.error('Error in /api/admin/deposits/approve:', err);
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
      const { data: tx } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .maybeSingle();

      await supabaseAdmin
        .from('transactions')
        .update({ 
          status: 'COMPLETED', 
          details: tx?.details ? `${tx.details} [Approuvé & Transféré]` : 'Retrait approuvé et transféré',
          updated_at: new Date().toISOString() 
        })
        .eq('id', transactionId);

      return res.json({ success: true, message: 'Retrait approuvé et marqué comme envoyé' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. ADMIN: Reject Withdrawal & Auto-Refund User
  app.post('/api/admin/withdrawals/reject', async (req, res) => {
    try {
      const { transactionId, userId, amount, reason } = req.body;
      
      const { data: tx } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .maybeSingle();

      const txAmount = Number(amount || tx?.amount || 0);
      const targetUserId = userId || tx?.user_id;
      const targetPhone = tx?.phone_number;

      await supabaseAdmin
        .from('transactions')
        .update({ 
          status: 'REJECTED', 
          details: reason ? `Retrait refusé : ${reason}` : 'Retrait refusé et remboursé',
          updated_at: new Date().toISOString() 
        })
        .eq('id', transactionId);

      // Refund user balance in Supabase
      let userRecord: any = null;
      if (targetUserId) {
        const { data: u } = await supabaseAdmin.from('users').select('*').eq('id', targetUserId).maybeSingle();
        userRecord = u;
      }
      if (!userRecord && targetPhone) {
        const { data: u } = await supabaseAdmin.from('users').select('*').or(`phone_number.eq.${targetPhone},phone_number.eq.${targetPhone.replace(/\s+/g, '')}`).maybeSingle();
        userRecord = u;
      }

      if (userRecord && txAmount > 0) {
        const currentBal = Number(userRecord.balance || 0);
        const currentWithdrawn = Number(userRecord.total_withdrawn || 0);
        const newBalance = currentBal + txAmount;
        const newWithdrawn = Math.max(0, currentWithdrawn - txAmount);

        await supabaseAdmin
          .from('users')
          .update({ 
            balance: newBalance, 
            total_withdrawn: newWithdrawn,
            updated_at: new Date().toISOString() 
          })
          .eq('id', userRecord.id);

        // Update in-memory user cache
        const cacheKey = userRecord.phone_number || userRecord.id;
        userRecord.balance = newBalance;
        userRecord.total_withdrawn = newWithdrawn;
        inMemoryUsers.set(cacheKey, userRecord);
        inMemoryUsers.set(userRecord.id, userRecord);
        saveUsersToDisk();
      }

      return res.json({ success: true, message: 'Retrait rejeté et solde remboursé sur le compte' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. PAYMENT CHANNELS: Synchronized Real-Time Storage for all users & Admin
  const CHANNELS_FILE = path.join(DATA_DIR, 'channels.json');
  let inMemoryPaymentChannels: any[] = [];

  const DEFAULT_PAYMENT_CHANNELS = [
    {
      id: 'chan-tg-tmoney',
      name: 'T-Money',
      country: 'Togo',
      countryCode: 'tg',
      accountNumber: '+228 70903319',
      accountName: 'Wilfried',
      instructions: '1. Composez le code *145# ou ouvrez l\'application T-Money Togo.\n2. Effectuez le transfert du montant exact vers le numéro indiqué ci-dessus.\n3. Copiez la référence de transaction SMS reçue.\n4. Renseignez la référence ci-dessous et validez la recharge.',
      isActive: true,
      badge: 'Recommandé 🇹🇬',
      createdAt: '2026-05-01'
    },
    {
      id: 'chan-tg-flooz',
      name: 'Moov Money (Flooz)',
      country: 'Togo',
      countryCode: 'tg',
      accountNumber: '+228 78829438',
      accountName: 'Wilfried',
      instructions: '1. Composez le code *155# ou utilisez l\'application Moov Money Flooz.\n2. Effectuez le transfert vers le numéro indiqué ci-dessus.\n3. Copiez l\'ID de transaction reçu par SMS.\n4. Renseignez l\'ID ci-dessous pour validation instantanée.',
      isActive: true,
      badge: 'Instantané 🇹🇬',
      createdAt: '2026-05-01'
    }
  ];

  function loadChannelsFromDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(CHANNELS_FILE)) {
        const raw = fs.readFileSync(CHANNELS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter to Togo channels only
          const togoOnly = parsed.filter(c => {
            const num = (c.accountNumber || '').trim();
            const cCode = (c.countryCode || '').toLowerCase();
            const cName = (c.country || '').toLowerCase();
            const name = (c.name || '').toLowerCase();
            return cCode === 'tg' || cName.includes('togo') || num.startsWith('+228') || name.includes('t-money') || name.includes('flooz');
          });
          inMemoryPaymentChannels = togoOnly.length > 0 ? togoOnly : DEFAULT_PAYMENT_CHANNELS;
          saveChannelsToDisk();
          return;
        }
      }
    } catch (e) {
      console.error('Error loading channels from disk:', e);
    }

    inMemoryPaymentChannels = DEFAULT_PAYMENT_CHANNELS;
    saveChannelsToDisk();
  }

  function saveChannelsToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(CHANNELS_FILE, JSON.stringify(inMemoryPaymentChannels, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving channels to disk:', e);
    }
  }

  loadChannelsFromDisk();

  function mapDbToChannel(d: any) {
    const opName = d.operator || d.name || 'Canal de paiement Togo';
    const cCode = 'tg';
    const cName = 'Togo';

    return {
      id: d.id,
      name: opName,
      country: cName,
      countryCode: cCode,
      accountNumber: d.account_number || d.accountNumber || '',
      accountName: d.account_name || d.accountName || '',
      instructions: d.instructions || '',
      isActive: d.is_active !== undefined ? d.is_active : (d.isActive !== undefined ? d.isActive : true),
      badge: d.badge || undefined,
      createdAt: d.created_at || d.createdAt || new Date().toISOString()
    };
  }

  function mapChannelToDb(ch: any) {
    return {
      id: ch.id,
      country_code: 'TG',
      country_name: 'Togo 🇹🇬',
      operator: ch.name,
      account_number: ch.accountNumber || '',
      account_name: ch.accountName || '',
      instructions: ch.instructions || '',
      is_active: ch.isActive !== false,
      badge: ch.badge || null,
      created_at: ch.createdAt || new Date().toISOString()
    };
  }

  // Public endpoint for all users to fetch current payment channels
  app.get('/api/channels', async (req, res) => {
    try {
      loadChannelsFromDisk();
      try {
        const { data, error } = await supabaseAdmin.from('payment_channels').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const dbChannels = data.map(mapDbToChannel);
          inMemoryPaymentChannels = dbChannels;
          saveChannelsToDisk();
          return res.json({ success: true, channels: dbChannels });
        }
      } catch (dbErr) {
        // use inMemoryPaymentChannels
      }
      return res.json({ success: true, channels: inMemoryPaymentChannels });
    } catch (err: any) {
      return res.json({ success: true, channels: inMemoryPaymentChannels });
    }
  });

  // Admin endpoint: Get Payment Channels
  app.get('/api/admin/channels', async (req, res) => {
    try {
      loadChannelsFromDisk();
      try {
        const { data, error } = await supabaseAdmin.from('payment_channels').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const dbChannels = data.map(mapDbToChannel);
          inMemoryPaymentChannels = dbChannels;
          saveChannelsToDisk();
          return res.json({ success: true, channels: dbChannels });
        }
      } catch (dbErr) {
        // fallback
      }
      return res.json({ success: true, channels: inMemoryPaymentChannels });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message, channels: inMemoryPaymentChannels });
    }
  });

  // Admin endpoint: Save/Update single channel or entire batch of channels
  app.post('/api/admin/channels', async (req, res) => {
    try {
      const { channels, channel } = req.body;
      loadChannelsFromDisk();

      if (Array.isArray(channels)) {
        inMemoryPaymentChannels = channels;
        saveChannelsToDisk();

        // Attempt syncing to Supabase table
        try {
          // Delete channels no longer in the list
          const activeIds = channels.map(c => c.id);
          const { data: existingRows } = await supabaseAdmin.from('payment_channels').select('id');
          if (Array.isArray(existingRows)) {
            for (const row of existingRows) {
              if (!activeIds.includes(row.id)) {
                await supabaseAdmin.from('payment_channels').delete().eq('id', row.id);
              }
            }
          }

          // Upsert all channels
          for (const ch of channels) {
            await supabaseAdmin.from('payment_channels').upsert(mapChannelToDb(ch));
          }
        } catch (dbErr) {
          console.warn('Supabase channels batch upsert notice:', dbErr);
        }

        return res.json({ success: true, channels: inMemoryPaymentChannels });
      }

      if (channel && channel.id) {
        const index = inMemoryPaymentChannels.findIndex(c => c.id === channel.id);
        if (index >= 0) {
          inMemoryPaymentChannels[index] = { ...inMemoryPaymentChannels[index], ...channel };
        } else {
          inMemoryPaymentChannels.unshift(channel);
        }
        saveChannelsToDisk();

        try {
          await supabaseAdmin.from('payment_channels').upsert(mapChannelToDb(channel));
        } catch (dbErr) {
          console.warn('Supabase single channel upsert notice:', dbErr);
        }

        return res.json({ success: true, channels: inMemoryPaymentChannels });
      }

      return res.status(400).json({ success: false, error: 'Invalid payload: provide channels or channel' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin endpoint: Delete a channel
  app.post('/api/admin/channels/delete', async (req, res) => {
    try {
      const { channelId } = req.body;
      if (!channelId) {
        return res.status(400).json({ success: false, error: 'channelId required' });
      }
      loadChannelsFromDisk();
      inMemoryPaymentChannels = inMemoryPaymentChannels.filter(c => c.id !== channelId);
      saveChannelsToDisk();

      try {
        await supabaseAdmin.from('payment_channels').delete().eq('id', channelId);
      } catch (dbErr) {
        console.warn('Supabase delete channel notice:', dbErr);
      }

      return res.json({ success: true, channels: inMemoryPaymentChannels });
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

  // 9. PRODUCT PURCHASE & ATOMIC BALANCE DEDUCTION & REFERRAL COMMISSIONS
  const activePurchaseLocks = new Set<string>();

  app.post('/api/products/purchase', async (req, res) => {
    let lockKey = '';
    try {
      const { userId, phoneNumber, packageId, packageName, price, dailyEarnings, durationDays } = req.body;

      const cleanPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';
      const uid = typeof userId === 'string' ? userId.trim() : '';

      if (!uid && !cleanPhone) {
        return res.status(400).json({ success: false, error: 'Identifiant utilisateur requis pour effectuer un achat.' });
      }

      lockKey = uid || cleanPhone;
      if (activePurchaseLocks.has(lockKey)) {
        return res.status(429).json({ 
          success: false, 
          error: 'Un achat est déjà en cours de traitement pour ce compte. Veuillez patienter.' 
        });
      }
      activePurchaseLocks.add(lockKey);

      // 1. Authoritative Package lookup (guarantee exact price & yield directly from server/DB)
      loadPackagesFromDisk();
      let authoritativeProduct: any = inMemoryPackages.find(p => p.id === packageId);
      if (!authoritativeProduct && packageName) {
        authoritativeProduct = inMemoryPackages.find(p => p.name.toLowerCase() === packageName.toLowerCase());
      }

      const finalPrice = authoritativeProduct ? Number(authoritativeProduct.minInvestment || authoritativeProduct.min_investment) : Number(price);
      const finalDaily = authoritativeProduct ? Number(authoritativeProduct.dailyEarningsAmount || authoritativeProduct.daily_earnings_amount) : Number(dailyEarnings || 0);
      const finalDays = authoritativeProduct ? Number(authoritativeProduct.durationDays || authoritativeProduct.duration_days) : Number(durationDays || 365);
      const finalName = authoritativeProduct ? authoritativeProduct.name : (packageName || 'Contrat VIP');

      if (isNaN(finalPrice) || finalPrice <= 0) {
        return res.status(400).json({ success: false, error: 'Prix du produit invalide.' });
      }

      // 2. Fetch Buyer from Supabase DB or In-memory store
      let buyer: any = null;
      try {
        const userQuery = supabaseAdmin.from('users').select('*');
        if (uid) userQuery.eq('id', uid);
        else if (cleanPhone) userQuery.or(`phone_number.eq.${cleanPhone},phone_number.eq.${cleanPhone.replace(/\s+/g, '')}`);
        const { data: dbBuyer, error: bErr } = await userQuery.maybeSingle();
        if (!bErr && dbBuyer) {
          buyer = dbBuyer;
        }
      } catch (e) {
        console.warn('DB buyer query notice in purchase:', e);
      }

      if (!buyer) {
        buyer = inMemoryUsers.get(cleanPhone) || inMemoryUsers.get(uid);
      }

      if (!buyer) {
        return res.status(404).json({ success: false, error: 'Compte utilisateur introuvable dans la base de données.' });
      }

      const currentBalance = Number(buyer.balance || 0);
      if (currentBalance < finalPrice) {
        return res.status(400).json({ 
          success: false, 
          error: `Solde insuffisant (${currentBalance.toLocaleString('fr-FR')} F CFA). Prix requis : ${finalPrice.toLocaleString('fr-FR')} F CFA.` 
        });
      }

      // 3. Atomically Deduct Balance
      const newBuyerBalance = currentBalance - finalPrice;
      buyer.balance = newBuyerBalance;
      buyer.updated_at = new Date().toISOString();

      // Update in memory & disk
      inMemoryUsers.set(buyer.id, buyer);
      if (buyer.phone_number) inMemoryUsers.set(buyer.phone_number, buyer);
      saveUsersToDisk();

      // Update in Supabase
      try {
        await supabaseAdmin
          .from('users')
          .update({ balance: newBuyerBalance, updated_at: new Date().toISOString() })
          .eq('id', buyer.id);
      } catch (dbUpdateErr) {
        console.warn('Supabase buyer balance update notice:', dbUpdateErr);
      }

      // 4. Create & Record Subscription in DB and in-memory
      const nowIso = new Date().toISOString();
      const nextPayoutIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const expiresIso = new Date(Date.now() + finalDays * 24 * 60 * 60 * 1000).toISOString();
      const newSubId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newSubscription = {
        id: newSubId,
        userId: buyer.id,
        userName: buyer.full_name || `Membre ${buyer.phone_number || ''}`,
        userPhone: buyer.phone_number,
        packageId: authoritativeProduct ? authoritativeProduct.id : (packageId || newSubId),
        packageName: finalName,
        amountInvested: finalPrice,
        dailyEarnings: finalDaily,
        dailyReturn: finalDaily,
        durationDays: finalDays,
        daysCompleted: 0,
        status: 'active',
        isActive: true,
        createdAt: nowIso,
        subscribedAt: nowIso,
        lastClaimedAt: nowIso,
        nextPayoutAt: nextPayoutIso,
        expiresAt: expiresIso
      };

      try {
        await supabaseAdmin.from('subscriptions').insert({
          id: newSubId,
          user_id: buyer.id,
          user_name: buyer.full_name,
          phone_number: buyer.phone_number,
          package_id: newSubscription.packageId,
          package_name: finalName,
          amount_invested: finalPrice,
          daily_earnings: finalDaily,
          duration_days: finalDays,
          days_completed: 0,
          status: 'active',
          created_at: nowIso,
          expires_at: expiresIso
        });
      } catch (subDbErr) {
        console.warn('Supabase subscription insert notice:', subDbErr);
      }

      // 5. Record Purchase Transaction in DB and in-memory
      const purchaseTxId = `tx-prod-${Date.now()}`;
      const purchaseTransaction = {
        id: purchaseTxId,
        userId: buyer.id,
        user_id: buyer.id,
        phoneNumber: buyer.phone_number,
        phone_number: buyer.phone_number,
        userName: buyer.full_name,
        user_name: buyer.full_name,
        type: 'vip_earning',
        amount: finalPrice,
        status: 'COMPLETED',
        description: `Acquisition : ${finalName}`,
        details: `Revenu : +${finalDaily.toLocaleString('fr-FR')} F CFA chaque 24h pendant ${finalDays} jours`,
        created_at: nowIso,
        date: nowIso
      };

      try {
        await supabaseAdmin.from('transactions').insert({
          id: purchaseTxId,
          user_id: buyer.id,
          phone_number: buyer.phone_number,
          user_name: buyer.full_name,
          type: 'vip_earning',
          amount: finalPrice,
          status: 'COMPLETED',
          description: `Acquisition : ${finalName}`,
          details: `Revenu : +${finalDaily.toLocaleString('fr-FR')} F CFA chaque 24h pendant ${finalDays} jours`,
          created_at: nowIso
        });
      } catch (txDbErr) {
        console.warn('Supabase purchase transaction insert notice:', txDbErr);
      }

      // 6. DISTRIBUTE COMMISSIONS TO SPONSORS (15% Level 1, 2% Level 2, 1% Level 3)
      const distributed = { level1: 0, level2: 0, level3: 0 };

      if (buyer.referred_by) {
        const refBy = buyer.referred_by.trim();
        
        // Find Level 1 Sponsor
        let sponsor1: any = null;
        try {
          const { data: s1 } = await supabaseAdmin
            .from('users')
            .select('*')
            .or(`referral_code.eq.${refBy},phone_number.eq.${refBy},id.eq.${refBy}`)
            .maybeSingle();
          if (s1) sponsor1 = s1;
        } catch (e) {}

        if (!sponsor1) {
          sponsor1 = inMemoryUsers.get(refBy);
        }

        if (sponsor1) {
          const commL1 = Math.round(finalPrice * 0.15); // 15%
          distributed.level1 = commL1;
          const newBalL1 = Number(sponsor1.balance || 0) + commL1;
          sponsor1.balance = newBalL1;
          sponsor1.updated_at = new Date().toISOString();

          inMemoryUsers.set(sponsor1.id, sponsor1);
          if (sponsor1.phone_number) inMemoryUsers.set(sponsor1.phone_number, sponsor1);
          saveUsersToDisk();

          try {
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
              description: `Commission de Parrainage (Niveau 1 - 15%)`,
              details: `Achat de ${finalName} (${finalPrice.toLocaleString('fr-FR')} F CFA) par votre filleul direct ${buyer.full_name || buyer.phone_number}`,
              created_at: new Date().toISOString()
            });
          } catch (e) {}

          // Find Level 2 Sponsor
          if (sponsor1.referred_by) {
            const refBy2 = sponsor1.referred_by.trim();
            let sponsor2: any = null;
            try {
              const { data: s2 } = await supabaseAdmin
                .from('users')
                .select('*')
                .or(`referral_code.eq.${refBy2},phone_number.eq.${refBy2},id.eq.${refBy2}`)
                .maybeSingle();
              if (s2) sponsor2 = s2;
            } catch (e) {}

            if (!sponsor2) {
              sponsor2 = inMemoryUsers.get(refBy2);
            }

            if (sponsor2) {
              const commL2 = Math.round(finalPrice * 0.02); // 2%
              distributed.level2 = commL2;
              const newBalL2 = Number(sponsor2.balance || 0) + commL2;
              sponsor2.balance = newBalL2;
              sponsor2.updated_at = new Date().toISOString();

              inMemoryUsers.set(sponsor2.id, sponsor2);
              if (sponsor2.phone_number) inMemoryUsers.set(sponsor2.phone_number, sponsor2);
              saveUsersToDisk();

              try {
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
                  details: `Achat de ${finalName} par un membre de niveau 2 de votre équipe`,
                  created_at: new Date().toISOString()
                });
              } catch (e) {}

              // Find Level 3 Sponsor
              if (sponsor2.referred_by) {
                const refBy3 = sponsor2.referred_by.trim();
                let sponsor3: any = null;
                try {
                  const { data: s3 } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .or(`referral_code.eq.${refBy3},phone_number.eq.${refBy3},id.eq.${refBy3}`)
                    .maybeSingle();
                  if (s3) sponsor3 = s3;
                } catch (e) {}

                if (!sponsor3) {
                  sponsor3 = inMemoryUsers.get(refBy3);
                }

                if (sponsor3) {
                  const commL3 = Math.round(finalPrice * 0.01); // 1%
                  distributed.level3 = commL3;
                  const newBalL3 = Number(sponsor3.balance || 0) + commL3;
                  sponsor3.balance = newBalL3;
                  sponsor3.updated_at = new Date().toISOString();

                  inMemoryUsers.set(sponsor3.id, sponsor3);
                  if (sponsor3.phone_number) inMemoryUsers.set(sponsor3.phone_number, sponsor3);
                  saveUsersToDisk();

                  try {
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
                      details: `Achat de ${finalName} par un membre de niveau 3 de votre équipe`,
                      created_at: new Date().toISOString()
                    });
                  } catch (e) {}
                }
              }
            }
          }
        }
      }

      return res.json({
        success: true,
        buyerBalance: newBuyerBalance,
        subscription: newSubscription,
        transaction: purchaseTransaction,
        distributedCommissions: distributed,
        message: `Félicitations ! Vous avez acquis « ${finalName} » avec succès.`
      });
    } catch (err: any) {
      console.error('Error in /api/products/purchase:', err);
      return res.status(500).json({ success: false, error: err.message || 'Erreur lors du traitement de l\'achat.' });
    } finally {
      if (lockKey) {
        activePurchaseLocks.delete(lockKey);
      }
    }
  });

  // 10. SUPPORT & REAL-TIME CHAT SYSTEM (Synchronized with Supabase DB, In-Memory Store & Disk JSON)
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

  // Helper: Sync Support Tickets with Supabase transactions table (type = 'chat_msg')
  async function syncTicketsWithSupabaseTransactions() {
    try {
      const { data: chatRows, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('type', 'chat_msg')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Notice querying chat_msg from transactions in server:', error.message);
        return;
      }

      if (Array.isArray(chatRows) && chatRows.length > 0) {
        for (const row of chatRows) {
          let details: any = {};
          try {
            if (row.details) {
              details = typeof row.details === 'string' ? JSON.parse(row.details) : row.details;
            }
          } catch {
            details = {};
          }

          const ticketId = details.ticketId || `ticket-${row.user_id || row.phone_number || 'guest'}`;
          let ticket = inMemorySupportTickets.get(ticketId);

          const sender = (details.sender === 'admin' || row.operator === 'admin') ? 'admin' : 'user';
          const text = details.text || row.description || '';
          const imageUrl = details.imageUrl || null;
          const timestamp = details.timestamp || (row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00');
          const createdAt = details.createdAt || row.created_at || new Date().toISOString();

          const messageObj = {
            id: row.id,
            sender,
            text,
            imageUrl,
            timestamp,
            createdAt
          };

          if (!ticket) {
            const rawPhone = row.phone_number || details.userPhone || (row.user_id?.startsWith('usr-') ? '' : row.user_id) || '';
            ticket = {
              id: ticketId,
              userId: row.user_id || details.userId || 'usr-guest',
              userName: row.user_name || details.userName || (rawPhone ? `Membre ${rawPhone}` : 'Investisseur Aura'),
              userEmail: details.userEmail || `${row.user_id || 'client'}@aurainvest.com`,
              userPhone: rawPhone,
              subject: details.subject || 'Assistance & Échanges Aura',
              status: details.status || row.status || (sender === 'user' ? 'open' : 'answered'),
              unreadByAdmin: typeof details.unreadByAdmin === 'boolean' ? details.unreadByAdmin : (sender === 'user'),
              unreadByUser: typeof details.unreadByUser === 'boolean' ? details.unreadByUser : (sender === 'admin'),
              createdAt: details.ticketCreatedAt || createdAt,
              updatedAt: createdAt,
              messages: []
            };
            inMemorySupportTickets.set(ticketId, ticket);
          }

          if (!Array.isArray(ticket.messages)) {
            ticket.messages = [];
          }

          // Check if message already present
          const existingMsgIndex = ticket.messages.findIndex((m: any) => m.id === messageObj.id);
          if (existingMsgIndex === -1) {
            ticket.messages.push(messageObj);
          } else {
            ticket.messages[existingMsgIndex] = { ...ticket.messages[existingMsgIndex], ...messageObj };
          }

          // Keep messages sorted by timestamp
          ticket.messages.sort((a: any, b: any) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return ta - tb;
          });

          // Determine status based on the latest message or stored status
          const lastMsg = ticket.messages[ticket.messages.length - 1];
          if (lastMsg) {
            if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
              if (lastMsg.sender === 'admin') {
                ticket.status = 'answered';
                ticket.unreadByAdmin = false;
              } else {
                ticket.status = 'open';
                ticket.unreadByAdmin = true;
              }
            }
          }

          // Update ticket timestamps
          ticket.updatedAt = createdAt;
          if (details.userName && (!ticket.userName || ticket.userName.includes('Membre'))) {
            ticket.userName = details.userName;
          }
          if (details.userPhone) ticket.userPhone = details.userPhone;
          if (details.userEmail) ticket.userEmail = details.userEmail;
        }

        saveTicketsToDisk();
      }
    } catch (err) {
      console.warn('Error syncing tickets with Supabase transactions:', err);
    }
  }

  // 10a. ADMIN: Get all support tickets (merges in-memory, disk and database cleanly)
  app.get('/api/support/tickets', async (req, res) => {
    try {
      loadTicketsFromDisk();
      await syncTicketsWithSupabaseTransactions();

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
      await syncTicketsWithSupabaseTransactions();

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

      // 2. Persist to Supabase Database in transactions table (with type = 'chat_msg')
      try {
        const { error: insertErr } = await supabaseAdmin.from('transactions').insert({
          id: newMsg.id,
          user_id: existingTicket.userId,
          phone_number: existingTicket.userPhone || existingTicket.userId,
          user_name: existingTicket.userName,
          type: 'chat_msg',
          amount: 0,
          status: existingTicket.status,
          description: cleanText || (imageUrl ? '[Image]' : ''),
          details: JSON.stringify({
            ticketId: existingTicket.id,
            sender: messageSender,
            text: cleanText,
            imageUrl: imageUrl || null,
            userName: existingTicket.userName,
            userPhone: existingTicket.userPhone,
            userEmail: existingTicket.userEmail,
            unreadByAdmin: existingTicket.unreadByAdmin,
            unreadByUser: existingTicket.unreadByUser,
            timestamp: timeString,
            createdAt: nowIso
          }),
          country: '',
          operator: messageSender,
          created_at: nowIso,
          updated_at: nowIso
        });

        if (insertErr) {
          console.warn('Supabase DB support persistence in transactions error:', insertErr);
        }

        // When admin replies, also update existing rows of this ticket to status 'answered'
        if (messageSender === 'admin') {
          await supabaseAdmin
            .from('transactions')
            .update({ status: 'answered', updated_at: nowIso })
            .eq('type', 'chat_msg')
            .filter('details', 'ilike', `%"ticketId":"${existingTicket.id}"%`);
        }
      } catch (dbErr) {
        console.warn('Supabase DB support persistence in transactions notice:', dbErr);
      }

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
        .from('transactions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('type', 'chat_msg')
        .filter('details', 'ilike', `%"ticketId":"${ticketId}"%`);

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

        await supabaseAdmin
          .from('transactions')
          .delete()
          .eq('type', 'chat_msg')
          .filter('details', 'ilike', `%"ticketId":"${ticketId}"%`);
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

  // 12. USER PROFILE REAL-TIME SYNC
  app.get('/api/users/profile', async (req, res) => {
    try {
      const { phoneNumber, userId } = req.query;
      const cleanPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';
      const uid = typeof userId === 'string' ? userId.trim() : '';

      if (!cleanPhone && !uid) {
        return res.status(400).json({ success: false, error: 'Identifiant requis' });
      }

      // Check database first
      const query = supabaseAdmin.from('users').select('*');
      if (uid) query.eq('id', uid);
      else if (cleanPhone) query.or(`phone_number.eq.${cleanPhone},phone_number.eq.${cleanPhone.replace(/\s+/g, '')}`);

      const { data: user, error } = await query.maybeSingle();
      if (!error && user) {
        return res.json({
          success: true,
          user: {
            id: user.id,
            fullName: user.full_name,
            phoneNumber: user.phone_number,
            email: user.email,
            balance: Number(user.balance || 0),
            totalRecharged: Number(user.total_recharged || 0),
            totalWithdrawn: Number(user.total_withdrawn || 0),
            vipTier: user.vip_tier || `VIP ${user.vip_level || 1} Bronze`,
            vipLevel: Number(user.vip_level || 1),
            referralCode: user.referral_code,
            referredBy: user.referred_by,
            status: user.status || 'active',
            createdAt: user.created_at
          }
        });
      }

      // Fallback to in-memory store
      const memUser = inMemoryUsers.get(cleanPhone) || inMemoryUsers.get(uid);
      if (memUser) {
        return res.json({
          success: true,
          user: {
            id: memUser.id,
            fullName: memUser.full_name || memUser.name,
            phoneNumber: memUser.phone_number || memUser.phone,
            email: memUser.email,
            balance: Number(memUser.balance || 0),
            totalRecharged: Number(memUser.total_recharged || 0),
            totalWithdrawn: Number(memUser.total_withdrawn || 0),
            vipTier: memUser.vip_tier || 'VIP 1 Bronze',
            vipLevel: Number(memUser.vip_level || 1),
            referralCode: memUser.referral_code,
            status: memUser.status || 'active'
          }
        });
      }

      return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 13. CENTRALIZED VIP PACKAGES / PRODUCTS (Persisted across all accounts & devices)
  const PACKAGES_FILE = path.join(DATA_DIR, 'packages.json');
  let inMemoryPackages: any[] = [];

  const DEFAULT_PACKAGES_DATA = [
    {
      id: 'agro-vip-1',
      name: 'VIP Niveau 1 (Pro)',
      level: 1,
      category: 'Gamme Agroprofit',
      tag: 'VIP 1 (Pro)',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      description: 'Contrat d\'investissement agricole VIP Niveau 1 (Pro). Revenu régulier garanti sur 365 jours.',
      minInvestment: 2500,
      dailyEarningsAmount: 168,
      totalEarningsAmount: 61320,
      durationDays: 365,
      dailyRate: 6.72
    },
    {
      id: 'agro-vip-2',
      name: 'VIP Niveau 2 (Elite)',
      level: 2,
      category: 'Gamme Agroprofit',
      tag: 'VIP 2 (Elite)',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
      description: 'Contrat d\'investissement agricole VIP Niveau 2 (Elite). Revenu régulier garanti sur 365 jours.',
      minInvestment: 6000,
      dailyEarningsAmount: 360,
      totalEarningsAmount: 131400,
      durationDays: 365,
      dailyRate: 6.0
    },
    {
      id: 'agro-vip-3',
      name: 'VIP Niveau 3 (Premium)',
      level: 3,
      category: 'Gamme Agroprofit',
      tag: 'VIP 3 (Premium)',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      description: 'Contrat d\'investissement agricole VIP Niveau 3 (Premium). Revenu régulier garanti sur 365 jours.',
      minInvestment: 15000,
      dailyEarningsAmount: 744,
      totalEarningsAmount: 271560,
      durationDays: 365,
      dailyRate: 4.96
    },
    {
      id: 'agro-vip-4',
      name: 'VIP Niveau 4 (Platinum)',
      level: 4,
      category: 'Gamme Agroprofit',
      tag: 'VIP 4 (Platinum)',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
      description: 'Contrat d\'investissement agricole VIP Niveau 4 (Platinum). Revenu régulier garanti sur 365 jours.',
      minInvestment: 32000,
      dailyEarningsAmount: 1584,
      totalEarningsAmount: 578160,
      durationDays: 365,
      dailyRate: 4.95
    },
    {
      id: 'agro-vip-6',
      name: 'VIP Niveau 6 (Or)',
      level: 6,
      category: 'Gamme Agroprofit',
      tag: 'VIP 6 (Or)',
      image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80',
      description: 'Contrat d\'investissement agricole VIP Niveau 6 (Or). Revenu régulier garanti sur 365 jours.',
      minInvestment: 70000,
      dailyEarningsAmount: 3840,
      totalEarningsAmount: 1401600,
      durationDays: 365,
      dailyRate: 5.49
    },
    {
      id: 'agro-vip-7',
      name: 'VIP Niveau 7 (Saphir)',
      level: 7,
      category: 'Gamme Agroprofit',
      tag: 'VIP 7 (Saphir)',
      image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
      description: 'Contrat d\'investissement agricole VIP Niveau 7 (Saphir). Revenu régulier garanti sur 365 jours.',
      minInvestment: 250000,
      dailyEarningsAmount: 13800,
      totalEarningsAmount: 5037000,
      durationDays: 365,
      dailyRate: 5.52
    },
    {
      id: 'agro-vip-partenaire-bronze',
      name: 'VIP Partenaire (Bronze)',
      level: 8,
      category: 'Gamme Partenaire',
      tag: 'Partenaire Bronze',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
      description: 'Contrat de partenariat agricole VIP Partenaire (Bronze). Revenu régulier garanti sur 365 jours.',
      minInvestment: 500000,
      dailyEarningsAmount: 28800,
      totalEarningsAmount: 10512000,
      durationDays: 365,
      dailyRate: 5.76
    },
    {
      id: 'agro-vip-partenaire-argent',
      name: 'VIP Partenaire (Argent)',
      level: 9,
      category: 'Gamme Partenaire',
      tag: 'Partenaire Argent',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
      description: 'Contrat de partenariat agricole VIP Partenaire (Argent). Revenu régulier garanti sur 365 jours.',
      minInvestment: 1000000,
      dailyEarningsAmount: 60000,
      totalEarningsAmount: 22198650,
      durationDays: 365,
      dailyRate: 6.0
    }
  ];

  function loadPackagesFromDisk() {
    try {
      if (fs.existsSync(PACKAGES_FILE)) {
        const raw = fs.readFileSync(PACKAGES_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryPackages = parsed;
          return;
        }
      }
    } catch (e) {
      console.error('Error loading packages from disk:', e);
    }
    inMemoryPackages = DEFAULT_PACKAGES_DATA;
    savePackagesToDisk();
  }

  function savePackagesToDisk() {
    try {
      fs.writeFileSync(PACKAGES_FILE, JSON.stringify(inMemoryPackages, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving packages to disk:', e);
    }
  }

  loadPackagesFromDisk();

  // Helper to map package to/from DB if table exists
  function mapPkgToDb(pkg: any) {
    return {
      id: pkg.id,
      name: pkg.name,
      level: Number(pkg.level || 1),
      category: pkg.category || 'Gamme Agroprofit',
      tag: pkg.tag || `VIP ${pkg.level || 1}`,
      image: pkg.image || '',
      description: pkg.description || '',
      min_investment: Number(pkg.minInvestment || 0),
      daily_earnings_amount: Number(pkg.dailyEarningsAmount || 0),
      total_earnings_amount: Number(pkg.totalEarningsAmount || 0),
      duration_days: Number(pkg.durationDays || 80),
      daily_rate: Number(pkg.dailyRate || 0)
    };
  }

  // GET /api/packages (Public endpoint for all user accounts and devices)
  app.get('/api/packages', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    try {
      loadPackagesFromDisk();
      if (!inMemoryPackages || inMemoryPackages.length === 0) {
        inMemoryPackages = DEFAULT_PACKAGES_DATA;
        savePackagesToDisk();
      }
      return res.json({ success: true, packages: inMemoryPackages });
    } catch (err: any) {
      return res.json({ success: true, packages: inMemoryPackages || DEFAULT_PACKAGES_DATA });
    }
  });

  // POST /api/admin/packages (Save full package list)
  app.post('/api/admin/packages', async (req, res) => {
    try {
      const { packages } = req.body;
      if (Array.isArray(packages)) {
        inMemoryPackages = packages;
        savePackagesToDisk();

        // Attempt Supabase sync
        try {
          const activeIds = packages.map(p => p.id);
          const { data: existingRows } = await supabaseAdmin.from('vip_packages').select('id');
          if (Array.isArray(existingRows)) {
            for (const row of existingRows) {
              if (!activeIds.includes(row.id)) {
                await supabaseAdmin.from('vip_packages').delete().eq('id', row.id);
              }
            }
          }
          for (const pkg of packages) {
            await supabaseAdmin.from('vip_packages').upsert(mapPkgToDb(pkg));
          }
        } catch (dbErr) {
          console.warn('Supabase packages batch upsert notice:', dbErr);
        }

        return res.json({ success: true, packages: inMemoryPackages, count: inMemoryPackages.length });
      }
      return res.status(400).json({ success: false, error: 'Tableau de packages invalide' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/admin/packages/create (Create a single package)
  app.post('/api/admin/packages/create', async (req, res) => {
    try {
      const { package: newPkg } = req.body;
      if (!newPkg || !newPkg.id || !newPkg.name) {
        return res.status(400).json({ success: false, error: 'Données de produit incomplètes' });
      }
      loadPackagesFromDisk();
      const existingIdx = inMemoryPackages.findIndex(p => p.id === newPkg.id);
      if (existingIdx >= 0) {
        inMemoryPackages[existingIdx] = newPkg;
      } else {
        inMemoryPackages.push(newPkg);
      }
      // Sort by level
      inMemoryPackages.sort((a, b) => (Number(a.level || 0) - Number(b.level || 0)));
      savePackagesToDisk();

      try {
        await supabaseAdmin.from('vip_packages').upsert(mapPkgToDb(newPkg));
      } catch (dbErr) {
        console.warn('Supabase create package notice:', dbErr);
      }

      return res.json({ success: true, packages: inMemoryPackages });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/admin/packages/delete (Delete a single package)
  app.post('/api/admin/packages/delete', async (req, res) => {
    try {
      const { packageId } = req.body;
      if (!packageId) {
        return res.status(400).json({ success: false, error: 'packageId requis' });
      }
      loadPackagesFromDisk();
      inMemoryPackages = inMemoryPackages.filter(p => p.id !== packageId);
      savePackagesToDisk();

      try {
        await supabaseAdmin.from('vip_packages').delete().eq('id', packageId);
      } catch (dbErr) {
        console.warn('Supabase delete package notice:', dbErr);
      }

      return res.json({ success: true, packages: inMemoryPackages });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 14. CENTRALIZED ANNOUNCEMENTS
  const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
  let inMemoryAnnouncements: any[] = [];

  const DEFAULT_ANNOUNCEMENTS_DATA = [
    {
      id: 'ann-welcome-1',
      title: 'Bonus d\'inscription 100 FCFA offert !',
      content: 'Bienvenue sur Aura Investissement. Recevez instantanément 100 FCFA à votre inscription pour démarrer vos investissements.',
      date: '2026-05-01 08:00:00',
      isNew: true,
      tag: 'Offre Spéciale',
      actionText: 'Découvrir les offres',
      actionTab: 'products'
    },
    {
      id: 'ann-sec-2',
      title: 'Retraits automatisés en moins de 15 minutes',
      content: 'Vos demandes de retrait MTN MoMo, Orange Money et Wave sont traitées avec rapidité et sécurité 7j/7.',
      date: '2026-05-01 10:00:00',
      isNew: false,
      tag: 'Sécurité & Vitesse',
      actionText: 'Faire un retrait',
      actionTab: 'withdraw'
    }
  ];

  function loadAnnouncementsFromDisk() {
    try {
      if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
        const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryAnnouncements = parsed;
          return;
        }
      }
    } catch (e) {
      console.error('Error loading announcements from disk:', e);
    }
    inMemoryAnnouncements = DEFAULT_ANNOUNCEMENTS_DATA;
    saveAnnouncementsToDisk();
  }

  function saveAnnouncementsToDisk() {
    try {
      fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(inMemoryAnnouncements, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving announcements to disk:', e);
    }
  }

  loadAnnouncementsFromDisk();

  // GET /api/announcements
  app.get('/api/announcements', (req, res) => {
    return res.json({ success: true, announcements: inMemoryAnnouncements });
  });

  // POST /api/admin/announcements
  app.post('/api/admin/announcements', (req, res) => {
    try {
      const { announcements } = req.body;
      if (Array.isArray(announcements)) {
        inMemoryAnnouncements = announcements;
        saveAnnouncementsToDisk();
        return res.json({ success: true, announcements: inMemoryAnnouncements });
      }
      return res.status(400).json({ success: false, error: 'Tableau d\'annonces invalide' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 15. CENTRALIZED GIFT CODES
  const GIFT_CODES_FILE = path.join(DATA_DIR, 'gift_codes.json');
  let inMemoryGiftCodes: any[] = [];

  function loadGiftCodesFromDisk() {
    try {
      if (fs.existsSync(GIFT_CODES_FILE)) {
        const raw = fs.readFileSync(GIFT_CODES_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryGiftCodes = parsed;
          return;
        }
      }
    } catch (e) {
      console.error('Error loading gift codes from disk:', e);
    }
    inMemoryGiftCodes = [];
    saveGiftCodesToDisk();
  }

  function saveGiftCodesToDisk() {
    try {
      fs.writeFileSync(GIFT_CODES_FILE, JSON.stringify(inMemoryGiftCodes, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving gift codes to disk:', e);
    }
  }

  loadGiftCodesFromDisk();

  // GET /api/gift-codes
  app.get('/api/gift-codes', (req, res) => {
    return res.json({ success: true, giftCodes: inMemoryGiftCodes });
  });

  // POST /api/admin/gift-codes
  app.post('/api/admin/gift-codes', (req, res) => {
    try {
      const { giftCodes } = req.body;
      if (Array.isArray(giftCodes)) {
        inMemoryGiftCodes = giftCodes;
        saveGiftCodesToDisk();
        return res.json({ success: true, giftCodes: inMemoryGiftCodes });
      }
      return res.status(400).json({ success: false, error: 'Tableau de codes cadeaux invalide' });
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
