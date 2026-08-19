import { VIPPackage, Transaction, ReferralUser, PaymentChannel, Announcement, GiftCode, Mission } from './types';

export const INITIAL_PAYMENT_CHANNELS: PaymentChannel[] = [
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

export const REFERRAL_RATES = {
  level1: 35, // 35%
  level2: 2,  // 2%
  level3: 1   // 1%
};

export const VIP_PACKAGES: VIPPackage[] = [
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

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-welcome-bonus',
    type: 'vip_earning',
    amount: 100,
    status: 'completed',
    date: new Date().toISOString(),
    description: "Bonus d'inscription offert",
    details: 'Crédit de bienvenue offert à la création du compte (+100 F CFA)'
  }
];

export const INITIAL_REFERRALS: ReferralUser[] = [];

export const FAQS = [
  {
    q: 'Comment fonctionne le système de parrainage automatique ?',
    a: 'Le parrainage est 100% automatisé. Dès qu\'un utilisateur s\'inscrit avec votre code ou lien et effectue un investissement, votre compte est crédité instantanément : 15% sur le Niveau 1 (filleuls directs), 2% sur le Niveau 2 (sous-filleuls) et 1% sur le Niveau 3 (filleuls indirects).'
  },
  {
    q: 'Comment s\'inscrire et commencer à investir ?',
    a: 'Il vous suffit de créer votre compte (bonus d\'inscription de 100 F CFA offert), de recharger votre portefeuille en F CFA et de choisir votre produit d\'investissement Agroprofit. Vos gains quotidiens tombent automatiquement chaque 24 heures sans aucune action manuelle requise.'
  },
  {
    q: 'Quels sont les délais et conditions de retrait ?',
    a: '1 retrait autorisé par jour, disponible 24h/24 et 7j/7. Le montant minimum de retrait est de 1 000 F CFA avec des frais de retrait de 10% pour les opérations de réseau.'
  }
];

export function formatCurrency(amount: number | string | undefined | null): string {
  const num = typeof amount === 'number' ? amount : Number(amount || 0);
  if (isNaN(num) || num === undefined || num === null) return '0 F CFA';
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0
  }).format(Math.round(num)) + ' F CFA';
}

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Récompenser les agents exceptionnels',
    date: '2026-08-02 08:33:32',
    isNew: true,
    tag: 'Récompense',
    content: `Chers partenaires et investisseurs,

Nous tenons à féliciter chaleureusement l'ensemble de nos agents et leaders de communauté pour leurs performances exceptionnelles ce mois-ci.

Les primes de performance ainsi que les bonus d'excellence ont été automatiquement versés sur vos portefeuilles respectifs. Continuez à développer vos équipes et à générer des revenus passifs quotidiens !`
  },
  {
    id: 'ann-2',
    title: 'Bonjour, bienvenue sur Agroprofit !',
    date: '2026-08-02 07:49:06',
    isNew: false,
    tag: 'Bienvenue',
    content: `Bienvenue sur la plateforme officielle d'investissement agricole Agroprofit !

Notre mission est de vous offrir des rendements journaliers stables et garantis grâce à l'exploitation de projets agro-industriels modernes.

Points clés pour bien débuter :
1. Bonus d'inscription de 100 F CFA offert dès la création de votre compte.
2. Choisissez un contrat Agroprofit dans l'onglet Produit pour activer vos revenus chaque 24h.
3. Retirez vos gains 24h/24 et 7j/7 dès 1 000 F CFA (frais de réseau 10%).`
  },
  {
    id: 'ann-3',
    title: 'Preuve de retrait',
    date: '2026-08-01 17:30:34',
    isNew: true,
    tag: 'Témoignage',
    content: `Transparence totale sur nos opérations financières.

Tous les retraits demandés par les membres au Togo (T-Money, Flooz) sont traités avec succès dès 1 000 F CFA avec 10% de frais de réseau.`
  },
  {
    id: 'ann-4',
    title: 'Les 3 produits agricoles ayant bénéficié du plus grand investissement des utilisateurs',
    date: '2026-08-01 15:20:52',
    isNew: true,
    tag: 'Top Produits',
    content: `Voici le classement hebdomadaire des projets agro-industriels préférés de nos investisseurs :

1. Agroprofit VIP 1 (Maraîchage Bio) - Rendement élevé & accessible
2. Agroprofit VIP 2 (Serre Hydroponique) - Stabilité & Rendement régulier
3. Agroprofit VIP 4 (Mécanisation Agricole) - Rendement accéléré

Consultez l'onglet Produit pour réserver vos parts sur la prochaine série.`
  },
  {
    id: 'ann-5',
    title: 'La meilleure preuve',
    date: '2026-07-31 17:52:01',
    isNew: true,
    tag: 'Sécurité',
    content: `La confiance de nos investisseurs est notre plus grande force.

Plus de 50 000 000 F CFA de retraits cumulés ont été honorés avec succès au cours de la semaine écoulée. Notre système de distribution automatique 24h assure une disponibilité immédiate de vos bénéfices.`
  },
  {
    id: 'ann-6',
    title: "Si vous invitez avec succès 6 utilisateurs réels à rejoindre notre entreprise, l'entreprise vous offrira un contrat Agroprofit d'une valeur de 100 000 XAF pour vous aider à gagner de l'argent.",
    date: '2026-07-31 16:48:21',
    isNew: true,
    tag: 'Offre Spéciale',
    content: `Offre spéciale de parrainage communautaire :

Invitez 6 personnes réelles qui activent au moins un contrat d'investissement sur la plateforme. Une fois les 6 filleuls actifs confirmés, contactez le support ou recevez directement l'allocation d'un contrat VIP Agroprofit d'une valeur de 100 000 F CFA générant des revenus quotidiens réguliers.

Partagez dès maintenant votre code d'invitation disponible dans l'onglet Équipe !`
  },
  {
    id: 'ann-7',
    title: "Deux façons de gagner de l'argent",
    date: '2026-07-31 08:07:32',
    isNew: false,
    tag: 'Guide',
    content: `Deux méthodes simples pour maximiser vos revenus sur la plateforme :

1. L'investissement direct : Choisissez vos contrats Agroprofit et collectez vos gains automatiques toutes les 24h.
2. Le programme de parrainage à 3 niveaux : Gagnez 15% de commission immédiate sur le Niveau 1, 2% sur le Niveau 2 et 1% sur le Niveau 3.`
  },
  {
    id: 'ann-8',
    title: "Emprunter de l'argent pour investir dans des produits de niveau supérieur et gagner plus d'argent",
    date: '2026-07-30 17:05:50',
    isNew: true,
    tag: 'Stratégie',
    content: `Découvrez les stratégies d'optimisation financière pour accéder aux contrats Agroprofit haut de gamme. Les paliers VIP supérieurs offrent des ratios de rentabilité journalière accélérés.`
  }
];

export const OFFICIAL_WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e';
export const OFFICIAL_WHATSAPP_CHANNEL_NAME = 'Agroprofit';

export const INITIAL_GIFT_CODES: GiftCode[] = [];

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'mission-invite-10',
    title: 'Inviter 10 investisseurs',
    description: 'Parrainez 10 investisseurs ayant activé un contrat VIP pour débloquer votre prime.',
    type: 'invite_investors',
    targetCount: 10,
    rewardAmount: 1000,
    iconType: 'users',
    isActive: true,
    orderIndex: 1,
    createdAt: '2026-05-01'
  },
  {
    id: 'mission-invite-30',
    title: 'Inviter 30 investisseurs',
    description: 'Développez votre équipe avec 30 investisseurs actifs pour obtenir une prime de 3 500 F CFA.',
    type: 'invite_investors',
    targetCount: 30,
    rewardAmount: 3500,
    iconType: 'trophy',
    isActive: true,
    orderIndex: 2,
    createdAt: '2026-05-01'
  },
  {
    id: 'mission-invite-50',
    title: 'Inviter 50 investisseurs',
    description: 'Atteignez 50 investisseurs actifs pour débloquer le super bonus VIP de 7 000 F CFA.',
    type: 'invite_investors',
    targetCount: 50,
    rewardAmount: 7000,
    iconType: 'sparkles',
    isActive: true,
    orderIndex: 3,
    createdAt: '2026-05-01'
  }
];

/**
 * Generates a unique 5-character referral code composed of exactly 3 letters and 2 digits mixed (e.g. "A7K2M", "K3B9P")
 */
export function generateReferralCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';

  // Exactly 3 random letters
  const l1 = letters.charAt(Math.floor(Math.random() * letters.length));
  const l2 = letters.charAt(Math.floor(Math.random() * letters.length));
  const l3 = letters.charAt(Math.floor(Math.random() * letters.length));

  // Exactly 2 random digits
  const d1 = digits.charAt(Math.floor(Math.random() * digits.length));
  const d2 = digits.charAt(Math.floor(Math.random() * digits.length));

  // Interleave and shuffle for a mixed alphanumeric code
  const chars = [l1, d1, l2, d2, l3];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

