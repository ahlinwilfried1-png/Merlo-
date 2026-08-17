import { VIPPackage, Transaction, ReferralUser, PaymentChannel, Announcement, GiftCode } from './types';

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
    name: 'Agroprofit VIP 1',
    level: 1,
    category: 'Gamme Agroprofit',
    tag: 'POPULAIRE',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement agricole Agroprofit VIP 1 (Maraîchage Bio). Revenu régulier garanti sur 80 jours.',
    minInvestment: 4000,
    dailyEarningsAmount: 1000,
    totalEarningsAmount: 80000,
    durationDays: 80,
    dailyRate: 25.0
  },
  {
    id: 'agro-vip-2',
    name: 'Agroprofit VIP 2',
    level: 2,
    category: 'Gamme Agroprofit',
    tag: 'TENDANCE',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement agricole Agroprofit VIP 2 (Serre Hydroponique). Revenu régulier garanti sur 80 jours.',
    minInvestment: 10000,
    dailyEarningsAmount: 2550,
    totalEarningsAmount: 204000,
    durationDays: 80,
    dailyRate: 25.5
  },
  {
    id: 'agro-vip-4',
    name: 'Agroprofit VIP 4',
    level: 4,
    category: 'Gamme Agroprofit',
    tag: 'RENTABLE',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement agricole Agroprofit VIP 4 (Mécanisation & Tracteurs). Revenu régulier garanti sur 80 jours.',
    minInvestment: 20000,
    dailyEarningsAmount: 5200,
    totalEarningsAmount: 416000,
    durationDays: 80,
    dailyRate: 26.0
  },
  {
    id: 'agro-vip-5',
    name: 'Agroprofit VIP 5',
    level: 5,
    category: 'Gamme Agroprofit',
    tag: 'ÉCLAIR',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement agricole Agroprofit VIP 5 (Plantations Cacao & Café). Revenu régulier garanti sur 80 jours.',
    minInvestment: 120000,
    dailyEarningsAmount: 37500,
    totalEarningsAmount: 3000000,
    durationDays: 80,
    dailyRate: 31.25
  },
  {
    id: 'agro-vip-6',
    name: 'Agroprofit VIP 6',
    level: 6,
    category: 'Gamme Agroprofit',
    tag: 'PRESTIGE',
    image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement agricole Agroprofit VIP 6 (Élevage Moderne & Ferme Smart). Revenu régulier garanti sur 80 jours.',
    minInvestment: 220000,
    dailyEarningsAmount: 71000,
    totalEarningsAmount: 5680000,
    durationDays: 80,
    dailyRate: 32.27
  },
  {
    id: 'agro-vip-7',
    name: 'Agroprofit VIP 7',
    level: 7,
    category: 'Gamme Agroprofit',
    tag: 'VIP LUXE',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement agricole Agroprofit VIP 7 (Arboriculture Fruitière & Vergers). Revenu régulier garanti sur 80 jours.',
    minInvestment: 400000,
    dailyEarningsAmount: 154000,
    totalEarningsAmount: 12320000,
    durationDays: 80,
    dailyRate: 38.5
  },
  {
    id: 'agro-vip-8',
    name: 'Agroprofit VIP 8',
    level: 8,
    category: 'Gamme Agroprofit',
    tag: 'EXCLUSIF',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement agricole Agroprofit VIP 8 (Silos de Stockage & Agro-Export). Revenu régulier garanti sur 80 jours.',
    minInvestment: 800000,
    dailyEarningsAmount: 348000,
    totalEarningsAmount: 27840000,
    durationDays: 80,
    dailyRate: 43.5
  },
  {
    id: 'agro-vip-9',
    name: 'Agroprofit VIP 9',
    level: 9,
    category: 'Gamme Agroprofit',
    tag: 'ROYAL',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement agricole Agroprofit VIP 9 (Unité Industrielle Agro-Alimentaire). Revenu régulier garanti sur 80 jours.',
    minInvestment: 1500000,
    dailyEarningsAmount: 715000,
    totalEarningsAmount: 57200000,
    durationDays: 80,
    dailyRate: 47.67
  },
  {
    id: 'agro-vip-10',
    name: 'Agroprofit VIP 10',
    level: 10,
    category: 'Gamme Agroprofit',
    tag: 'ULTIME',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    description: 'Contrat d\'investissement agricole Agroprofit VIP 10 (Méga-Domaine Agro-Industriel). Revenu régulier garanti sur 80 jours.',
    minInvestment: 2000000,
    dailyEarningsAmount: 100000,
    totalEarningsAmount: 8000000,
    durationDays: 80,
    dailyRate: 5.0
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

