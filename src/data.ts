import { VIPPackage, Transaction, ReferralUser, PaymentChannel, Announcement } from './types';

export const INITIAL_PAYMENT_CHANNELS: PaymentChannel[] = [
  {
    id: 'chan-wave',
    name: 'Wave',
    accountNumber: '+225 07 88 99 00 11',
    accountName: 'Service Financier',
    instructions: '1. Ouvrez votre application Wave.\n2. Effectuez le transfert du montant exact vers le numéro indiqué ci-dessus.\n3. Après validation, copiez la référence de la transaction (ID de transaction) et collez-la dans le formulaire ci-dessous.\n4. Cliquez sur « Soumettre la recharge » pour vérification.',
    isActive: true,
    badge: 'Recommandé',
    createdAt: '2026-05-01'
  },
  {
    id: 'chan-orange',
    name: 'Orange Money',
    accountNumber: '+225 07 12 34 56 78',
    accountName: 'Trésorerie Centrale',
    instructions: '1. Composez le code USSD ou ouvrez l\'application Max it / Orange Money.\n2. Envoyez le montant exact sur le numéro ci-dessus.\n3. Copiez le numéro de référence SMS reçu (ex: CI2605...).\n4. Renseignez la référence dans le champ ci-dessous et validez.',
    isActive: true,
    badge: 'Instantané',
    createdAt: '2026-05-01'
  },
  {
    id: 'chan-mtn',
    name: 'MTN Mobile Money',
    accountNumber: '+225 05 55 44 33 22',
    accountName: 'Comptabilité Générale',
    instructions: '1. Composez le menu MTN MoMo ou utilisez l\'application.\n2. Transférez le montant exact sur le numéro MTN ci-dessus.\n3. Notez la référence de transaction de la confirmation SMS.\n4. Saisissez la référence ci-dessous et soumettez la demande.',
    isActive: true,
    badge: 'Direct',
    createdAt: '2026-05-01'
  },
  {
    id: 'chan-moov',
    name: 'Moov Money',
    accountNumber: '+225 01 22 33 44 55',
    accountName: 'Direction Financière',
    instructions: '1. Transférez le montant par Moov Money vers le numéro ci-dessus.\n2. Récupérez l\'identifiant de transaction figurant dans le SMS de confirmation.\n3. Renseignez-le dans le champ Référence et soumettez votre demande.',
    isActive: true,
    badge: 'Disponible',
    createdAt: '2026-05-01'
  }
];

export const REFERRAL_RATES = {
  level1: 30, // 30%
  level2: 2,  // 2%
  level3: 1   // 1%
};

export const VIP_PACKAGES: VIPPackage[] = [
  {
    id: 'car-1',
    name: 'Petite voiture pas chère',
    level: 1,
    category: 'Véhicules Économiques',
    tag: 'HOT',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    description: 'Investissement automobile d\'entrée de gamme à cycle ultra court et retour rapide.',
    minInvestment: 1000,
    dailyEarningsAmount: 480,
    totalEarningsAmount: 1440,
    durationDays: 3,
    dailyRate: 48.0
  },
  {
    id: 'car-2',
    name: 'Voiture compacte',
    level: 2,
    category: 'Véhicules Compacts',
    tag: 'POPULAIRE',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    description: 'Flotte de citadines compactes pour location urbaine à rendement régulier.',
    minInvestment: 5000,
    dailyEarningsAmount: 720,
    totalEarningsAmount: 21600,
    durationDays: 30,
    dailyRate: 14.4
  },
  {
    id: 'car-3',
    name: 'Carvest Produits populaires 1',
    level: 3,
    category: 'Série Populaire Carvest',
    tag: 'TENDANCE',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    description: 'Véhicules de standing pour transport privé avec très fort rendement sur 7 jours.',
    minInvestment: 50000,
    dailyEarningsAmount: 75000,
    totalEarningsAmount: 525000,
    durationDays: 7,
    dailyRate: 150.0
  },
  {
    id: 'car-4',
    name: 'Berline Économique Confort',
    level: 4,
    category: 'Berlines Économiques',
    tag: 'STABLE',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    description: 'Berlines routières confortables pour trajets interurbains et navettes aéroport.',
    minInvestment: 15000,
    dailyEarningsAmount: 2500,
    totalEarningsAmount: 25000,
    durationDays: 10,
    dailyRate: 16.67
  },
  {
    id: 'car-5',
    name: 'Coupé Sport Urbain',
    level: 5,
    category: 'Coupés Sport',
    tag: 'RENTABLE',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    description: 'Coupé sportif haute performance pour circuits d\'événements et concessions.',
    minInvestment: 30000,
    dailyEarningsAmount: 6000,
    totalEarningsAmount: 90000,
    durationDays: 15,
    dailyRate: 20.0
  },
  {
    id: 'car-6',
    name: 'SUV Familial Confort',
    level: 6,
    category: 'SUV & Crossover',
    tag: 'FAMILLE',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    description: 'SUV spacieux 7 places très demandés pour les locations longue durée et voyages d\'affaires.',
    minInvestment: 80000,
    dailyEarningsAmount: 18000,
    totalEarningsAmount: 360000,
    durationDays: 20,
    dailyRate: 22.5
  },
  {
    id: 'car-7',
    name: 'Berline VIP Luxe Exécutive',
    level: 7,
    category: 'Berlines Exécutives',
    tag: 'VIP',
    image: 'https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=800&q=80',
    description: 'Berlines allemandes de grand standing affectées aux services VTC haut de gamme et délégations.',
    minInvestment: 150000,
    dailyEarningsAmount: 38000,
    totalEarningsAmount: 950000,
    durationDays: 25,
    dailyRate: 25.33
  },
  {
    id: 'car-8',
    name: 'Carvest Produits populaires 2',
    level: 8,
    category: 'Série Populaire Carvest',
    tag: 'ÉCLAIR',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    description: 'Programme populaire à très haut multiplicateur de rendement sur cycle court de 7 jours.',
    minInvestment: 300000,
    dailyEarningsAmount: 420000,
    totalEarningsAmount: 2940000,
    durationDays: 7,
    dailyRate: 140.0
  },
  {
    id: 'car-9',
    name: '4x4 Tout-Terrain Expédition',
    level: 9,
    category: 'Tout-Terrain & 4x4',
    tag: 'ROBUSTE',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    description: 'Véhicules 4x4 tout-terrain robustes loués aux compagnies minières, chantiers et institutions.',
    minInvestment: 500000,
    dailyEarningsAmount: 95000,
    totalEarningsAmount: 2850000,
    durationDays: 30,
    dailyRate: 19.0
  },
  {
    id: 'car-10',
    name: 'Limousine Prestige Éxécutive',
    level: 10,
    category: 'Limousines & Protocole',
    tag: 'PRESTIGE',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    description: 'Parc de prestige réservé aux réceptions officielles, mariages de prestige et VIP internationaux.',
    minInvestment: 1000000,
    dailyEarningsAmount: 210000,
    totalEarningsAmount: 8400000,
    durationDays: 40,
    dailyRate: 21.0
  },
  {
    id: 'car-11',
    name: 'Supercar GT Performance',
    level: 11,
    category: 'Supercars & Hypercars',
    tag: 'ULTIME',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
    description: 'Véhicules d\'exception et supercars de prestige générant des revenus locatifs exceptionnels.',
    minInvestment: 2500000,
    dailyEarningsAmount: 550000,
    totalEarningsAmount: 24750000,
    durationDays: 45,
    dailyRate: 22.0
  },
  {
    id: 'car-12',
    name: 'Flotte Automobile Fondateur',
    level: 12,
    category: 'Programme Fondateur',
    tag: 'PRIVILÈGE',
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80',
    description: 'Participation globale en tant qu\'actionnaire fondateur dans le parc complet de transport et logistique.',
    minInvestment: 5000000,
    dailyEarningsAmount: 1400000,
    totalEarningsAmount: 84000000,
    durationDays: 60,
    dailyRate: 28.0
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
    details: 'Transfert vers compte enregistré +225 05 •••• 44 | Frais: 0 F CFA'
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
    a: 'Le parrainage est 100% automatisé. Dès qu\'un utilisateur s\'inscrit avec votre code ou lien et effectue un investissement, votre compte est crédité instantanément : 30% sur le Niveau 1 (filleuls directs), 2% sur le Niveau 2 (sous-filleuls) et 1% sur le Niveau 3 (filleuls indirects).'
  },
  {
    q: 'Comment s\'inscrire et commencer à investir ?',
    a: 'Il vous suffit de créer votre compte, de recharger votre portefeuille en F CFA et de cliquer sur "INVESTIR" sur le véhicule de votre choix. Vos gains tombent automatiquement toutes les 24 heures.'
  },
  {
    q: 'Quels sont les délais et conditions de retrait ?',
    a: 'Les retraits sont transférés directement vers votre numéro de compte enregistré dès validation.'
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

