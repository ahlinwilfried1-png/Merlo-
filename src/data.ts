import { VIPPackage, Transaction, ReferralUser, PaymentChannel, Announcement, GiftCode } from './types';

export const INITIAL_PAYMENT_CHANNELS: PaymentChannel[] = [
  {
    id: 'chan-cm-mtn',
    name: 'MTN Mobile Money',
    country: 'Cameroun',
    countryCode: 'cm',
    accountNumber: '+237 670 12 34 56',
    accountName: 'Service Financier Cameroun',
    instructions: '1. Composez le code *126# ou ouvrez votre application MTN MoMo.\n2. Effectuez le transfert du montant exact vers le numéro indiqué ci-dessus.\n3. Après validation, copiez la référence de transaction SMS (ID de transaction) et collez-la dans le formulaire ci-dessous.\n4. Cliquez sur « Soumettre la recharge » pour validation immédiate.',
    isActive: true,
    badge: 'Recommandé 🇨🇲',
    createdAt: '2026-05-01'
  },
  {
    id: 'chan-cm-orange',
    name: 'Orange Money',
    country: 'Cameroun',
    countryCode: 'cm',
    accountNumber: '+237 690 12 34 56',
    accountName: 'Trésorerie Cameroun',
    instructions: '1. Composez le code *150# ou ouvrez l\'application Max it / Orange Money Cameroun.\n2. Envoyez le montant exact sur le numéro ci-dessus.\n3. Copiez le numéro de référence SMS reçu (ex: MP2605...).\n4. Renseignez la référence dans le champ ci-dessous et validez.',
    isActive: true,
    badge: 'Instantané 🇨🇲',
    createdAt: '2026-05-01'
  },
  {
    id: 'chan-bf-orange',
    name: 'Orange Money',
    country: 'Burkina Faso',
    countryCode: 'bf',
    accountNumber: '+226 76 12 34 56',
    accountName: 'Service Financier Burkina',
    instructions: '1. Composez *144# ou ouvrez l\'application Orange Money Burkina.\n2. Transférez le montant exact sur le numéro Orange ci-dessus.\n3. Notez la référence de transaction de la confirmation SMS.\n4. Saisissez la référence ci-dessous et soumettez la demande.',
    isActive: true,
    badge: 'Recommandé 🇧🇫',
    createdAt: '2026-05-01'
  },
  {
    id: 'chan-bf-moov',
    name: 'Moov Money',
    country: 'Burkina Faso',
    countryCode: 'bf',
    accountNumber: '+226 70 12 34 56',
    accountName: 'Direction Financière Burkina',
    instructions: '1. Composez *555# ou effectuez le transfert Moov Money vers le numéro ci-dessus.\n2. Récupérez l\'identifiant de transaction figurant dans le SMS de confirmation.\n3. Renseignez-le dans le champ Référence et soumettez votre demande.',
    isActive: true,
    badge: 'Direct 🇧🇫',
    createdAt: '2026-05-01'
  },
  {
    id: 'chan-bf-wave',
    name: 'Wave',
    country: 'Burkina Faso',
    countryCode: 'bf',
    accountNumber: '+226 55 12 34 56',
    accountName: 'Caisse Wave Burkina',
    instructions: '1. Ouvrez l\'application Wave Burkina.\n2. Effectuez le transfert gratuit vers le numéro Wave ci-dessus.\n3. Renseignez l\'ID de transaction dans le champ ci-dessous et validez.',
    isActive: true,
    badge: '0% Frais 🇧🇫',
    createdAt: '2026-05-01'
  },
  {
    id: 'chan-tg-tmoney',
    name: 'T-Money',
    country: 'Togo',
    countryCode: 'tg',
    accountNumber: '+228 90 12 34 56',
    accountName: 'Service Financier Togo',
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
    accountNumber: '+228 96 12 34 56',
    accountName: 'Trésorerie Flooz Togo',
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
    id: 'mercedes-vip-1',
    name: 'Mercedes VIP 1',
    level: 1,
    category: 'Gamme Mercedes-Benz',
    tag: 'POPULAIRE',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement Mercedes-Benz VIP 1. Revenu régulier garanti sur 80 jours.',
    minInvestment: 4000,
    dailyEarningsAmount: 1000,
    totalEarningsAmount: 80000,
    durationDays: 80,
    dailyRate: 25.0
  },
  {
    id: 'mercedes-vip-2',
    name: 'Mercedes VIP 2',
    level: 2,
    category: 'Gamme Mercedes-Benz',
    tag: 'TENDANCE',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement Mercedes-Benz VIP 2. Revenu régulier garanti sur 80 jours.',
    minInvestment: 10000,
    dailyEarningsAmount: 2550,
    totalEarningsAmount: 204000,
    durationDays: 80,
    dailyRate: 25.5
  },
  {
    id: 'mercedes-vip-4',
    name: 'Mercedes VIP 4',
    level: 4,
    category: 'Gamme Mercedes-Benz',
    tag: 'RENTABLE',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement Mercedes-Benz VIP 4. Revenu régulier garanti sur 80 jours.',
    minInvestment: 20000,
    dailyEarningsAmount: 5200,
    totalEarningsAmount: 416000,
    durationDays: 80,
    dailyRate: 26.0
  },
  {
    id: 'mercedes-vip-5',
    name: 'Mercedes VIP 5',
    level: 5,
    category: 'Gamme Mercedes-Benz',
    tag: 'ÉCLAIR',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement Mercedes-Benz VIP 5. Revenu régulier garanti sur 80 jours.',
    minInvestment: 120000,
    dailyEarningsAmount: 37500,
    totalEarningsAmount: 3000000,
    durationDays: 80,
    dailyRate: 31.25
  },
  {
    id: 'mercedes-vip-6',
    name: 'Mercedes VIP 6',
    level: 6,
    category: 'Gamme Mercedes-Benz',
    tag: 'PRESTIGE',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement Mercedes-Benz VIP 6. Revenu régulier garanti sur 80 jours.',
    minInvestment: 220000,
    dailyEarningsAmount: 71000,
    totalEarningsAmount: 5680000,
    durationDays: 80,
    dailyRate: 32.27
  },
  {
    id: 'mercedes-vip-7',
    name: 'Mercedes VIP 7',
    level: 7,
    category: 'Gamme Mercedes-Benz',
    tag: 'VIP LUXE',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement Mercedes-Benz VIP 7. Revenu régulier garanti sur 80 jours.',
    minInvestment: 400000,
    dailyEarningsAmount: 154000,
    totalEarningsAmount: 12320000,
    durationDays: 80,
    dailyRate: 38.5
  },
  {
    id: 'mercedes-vip-8',
    name: 'Mercedes VIP 8',
    level: 8,
    category: 'Gamme Mercedes-Benz',
    tag: 'EXCLUSIF',
    image: 'https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement Mercedes-Benz VIP 8. Revenu régulier garanti sur 80 jours.',
    minInvestment: 800000,
    dailyEarningsAmount: 348000,
    totalEarningsAmount: 27840000,
    durationDays: 80,
    dailyRate: 43.5
  },
  {
    id: 'mercedes-vip-9',
    name: 'Mercedes VIP 9',
    level: 9,
    category: 'Gamme Mercedes-Benz',
    tag: 'ROYAL',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement Mercedes-Maybach VIP 9. Revenu régulier garanti sur 80 jours.',
    minInvestment: 1500000,
    dailyEarningsAmount: 715000,
    totalEarningsAmount: 57200000,
    durationDays: 80,
    dailyRate: 47.67
  },
  {
    id: 'mercedes-vip-10',
    name: 'Mercedes VIP 10',
    level: 10,
    category: 'Gamme Mercedes-Benz',
    tag: 'ULTIME',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement Mercedes-AMG VIP 10. Revenu régulier garanti sur 80 jours.',
    minInvestment: 2000000,
    dailyEarningsAmount: 100000,
    totalEarningsAmount: 8000000,
    durationDays: 80,
    dailyRate: 5.0
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'deposit',
    amount: 100000,
    status: 'completed',
    date: '2026-05-20T10:14:22Z',
    description: 'Recharge de compte principal',
    details: 'Crédité directement sur le portefeuille • Référence: DEP-892104'
  },
  {
    id: 'tx-2',
    type: 'referral_commission',
    amount: 30000,
    status: 'completed',
    date: '2026-05-21T12:30:00Z',
    description: 'Commission Parrainage Automatique Niveau 1 (30%)',
    details: 'Filleul direct: Marc Dubois (Investissement 100 000 F CFA)'
  },
  {
    id: 'tx-3',
    type: 'vip_earning',
    amount: 720,
    status: 'completed',
    date: '2026-05-22T12:00:00Z',
    description: 'Rendement 24h - Voiture compacte',
    details: 'Dividende quotidien automatique de 720 F CFA versé sur le solde'
  },
  {
    id: 'tx-4',
    type: 'referral_commission',
    amount: 2000,
    status: 'completed',
    date: '2026-05-22T15:30:10Z',
    description: 'Commission Parrainage Automatique Niveau 2 (2%)',
    details: 'Sous-filleul: Sophia Alami (Investissement 100 000 F CFA)'
  },
  {
    id: 'tx-5',
    type: 'withdrawal',
    amount: 15000,
    status: 'completed',
    date: '2026-05-23T08:45:00Z',
    description: 'Retrait de fonds',
    details: 'Transfert vers compte enregistré +237 67 •••• 44 | Frais: 0 F CFA'
  }
];

export const INITIAL_REFERRALS: ReferralUser[] = [
  {
    id: 'ref-1',
    fullName: 'Marc Dubois',
    level: 1,
    dateJoined: '2026-05-21',
    status: 'active',
    commissionEarned: 30000
  },
  {
    id: 'ref-2',
    fullName: 'Sophia Alami',
    level: 2,
    dateJoined: '2026-05-22',
    status: 'active',
    commissionEarned: 4000
  },
  {
    id: 'ref-3',
    fullName: 'Amadou Diallo',
    level: 1,
    dateJoined: '2026-05-23',
    status: 'active',
    commissionEarned: 15000
  },
  {
    id: 'ref-4',
    fullName: 'Léonard Perez',
    level: 3,
    dateJoined: '2026-05-24',
    status: 'active',
    commissionEarned: 1000
  }
];

export const FAQS = [
  {
    q: 'Comment fonctionne le système de parrainage automatique ?',
    a: 'Le parrainage est 100% automatisé. Dès qu\'un utilisateur s\'inscrit avec votre code ou lien et effectue un investissement, votre compte est crédité instantanément : 35% sur le Niveau 1 (filleuls directs), 2% sur le Niveau 2 (sous-filleuls) et 1% sur le Niveau 3 (filleuls indirects).'
  },
  {
    q: 'Comment s\'inscrire et commencer à investir ?',
    a: 'Il vous suffit de créer votre compte (bonus d\'inscription offert), de recharger votre portefeuille en F CFA (minimum 4 000 F CFA) et de choisir votre contrat Mercedes VIP. Vos gains quotidiens tombent automatiquement chaque 24 heures.'
  },
  {
    q: 'Quels sont les délais et conditions de retrait ?',
    a: '1 retrait autorisé par jour, disponible 24h/24 et 7j/7. Le montant minimum de retrait est de 2 000 F CFA avec des frais de retrait de 18% pour les opérations de réseau.'
  }
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0
  }).format(Math.round(amount)) + ' F CFA';
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
    title: 'Bonjour, bienvenue chez Veko !',
    date: '2026-08-02 07:49:06',
    isNew: false,
    tag: 'Bienvenue',
    content: `Bienvenue sur la plateforme officielle d'investissement automobile !

Notre mission est de vous offrir des rendements journaliers stables et garantis grâce à l'exploitation de flottes de véhicules modernes.

Points clés pour bien débuter :
1. Choisissez un véhicule dans l'onglet Produit
2. Vos gains quotidiens sont crédités automatiquement toutes les 24h
3. Retirez vos gains 24h/24 et 7j/7 sans frais de retrait.`
  },
  {
    id: 'ann-3',
    title: 'Preuve de retrait',
    date: '2026-08-01 17:30:34',
    isNew: false,
    tag: 'Paiements',
    content: `Transparence totale sur nos opérations financières.

Tous les retraits demandés par les membres au Cameroun (MTN, Orange), au Togo (T-Money, Flooz) et au Burkina Faso (Orange, Moov) sont traités avec succès sous 1 à 15 minutes.

Vous pouvez consulter votre historique de paiement personnel à tout moment dans la rubrique « Registre de retrait » de votre profil.`
  },
  {
    id: 'ann-4',
    title: 'Les 3 voitures ayant bénéficié du plus grand investissement des utilisateurs',
    date: '2026-08-01 15:20:52',
    isNew: true,
    tag: 'Top Véhicules',
    content: `Voici le classement hebdomadaire des flottes préférées de nos investisseurs :

1. Petite voiture pas chère (Niveau 1) - Rendement 48% / 3 jours
2. Voiture compacte (Niveau 2) - Stabilité & Rendement 30 jours
3. Carvest Produits populaires 1 (Niveau 3) - Rendement exceptionnel 150%

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
    title: "Si vous invitez avec succès 6 utilisateurs réels à rejoindre notre entreprise, l'entreprise vous offrira une voiture d'une valeur de 100 000 XAF pour vous aider à gagner de l'argent.",
    date: '2026-07-31 16:48:21',
    isNew: true,
    tag: 'Offre Spéciale',
    content: `Offre spéciale de parrainage communautaire :

Invitez 6 personnes réelles qui activent au moins un contrat d'investissement sur la plateforme. Une fois les 6 filleuls actifs confirmés, contactez le support ou recevez directement l'allocation d'un véhicule VIP d'une valeur de 100 000 F CFA générant des revenus quotidiens réguliers.

Partagez dès maintenant votre code d'invitation disponible dans l'onglet Équipe !`
  },
  {
    id: 'ann-7',
    title: "Deux façons de gagner de l'argent",
    date: '2026-07-31 08:07:32',
    isNew: false,
    tag: 'Guide',
    content: `Deux méthodes simples pour maximiser vos revenus sur la plateforme :

1. L'investissement direct : Choisissez vos véhicules et collectez vos gains automatiques toutes les 24h.
2. Le programme de parrainage à 3 niveaux : Gagnez 30% de commission immédiate sur le Niveau 1, 2% sur le Niveau 2 et 1% sur le Niveau 3.`
  },
  {
    id: 'ann-8',
    title: "Emprunter de l'argent pour investir dans des produits de niveau supérieur et gagner plus d'argent",
    date: '2026-07-30 17:05:50',
    isNew: true,
    tag: 'Stratégie',
    content: `Découvrez les stratégies d'optimisation financière pour accéder aux véhicules haut de gamme. Les paliers VIP supérieurs offrent des ratios de rentabilité journalière accélérés.`
  }
];

export const OFFICIAL_WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e';
export const OFFICIAL_WHATSAPP_CHANNEL_NAME = 'Aura Car';

export const INITIAL_GIFT_CODES: GiftCode[] = [
  {
    id: 'gc-1',
    code: 'BONUS-BIENVENUE-5K',
    amount: 5000,
    maxUses: 100,
    usedCount: 34,
    isActive: true,
    createdAt: '2026-05-20',
    expiresAt: '2026-12-31'
  },
  {
    id: 'gc-2',
    code: 'AURA-VIP-SPECIAL-10K',
    amount: 10000,
    maxUses: 50,
    usedCount: 18,
    isActive: true,
    createdAt: '2026-05-22',
    expiresAt: '2026-12-31'
  },
  {
    id: 'gc-3',
    code: 'AURA-RECOMPENSE-2K',
    amount: 2000,
    maxUses: 200,
    usedCount: 89,
    isActive: true,
    createdAt: '2026-05-25',
    expiresAt: '2026-12-31'
  }
];

