import React from 'react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Target, 
  Sparkles, 
  Users, 
  Building2, 
  CheckCircle2, 
  Lock,
  Layers,
  HeartHandshake
} from 'lucide-react';
import PageHeader from './PageHeader';

interface AboutUsViewProps {
  onBack: () => void;
}

export default function AboutUsView({ onBack }: AboutUsViewProps) {
  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-cyan-50" id="page-about-us-container">
      
      {/* 1. Header with PageHeader */}
      <PageHeader
        title="À propos de nous"
        subtitle="Présentation officielle de la plateforme et gouvernance"
        onBack={onBack}
        badge="Certifié"
        icon={<Building2 className="w-5 h-5 text-cyan-400" />}
      />

      <div className="space-y-4 pt-1">
        
        {/* Official Presentation Manifesto Text (Sans cadre/bordure) */}
        <div className="aura-glass-card p-5 sm:p-6 rounded-3xl shadow-2xl space-y-3 border-0 ring-0">
          <h2 className="text-xs font-black uppercase font-mono tracking-wider text-cyan-300 luminous-text-cyan">
            Manifeste & Engagement Officiel
          </h2>
          <p className="text-cyan-100 text-sm sm:text-base leading-relaxed italic bg-[#02242e]/80 p-4 rounded-2xl border-0">
            « Nous sommes une plateforme numérique dédiée à proposer des solutions et services accessibles à nos utilisateurs dans un environnement simple, moderne et sécurisé. Notre objectif est de développer une expérience transparente, intuitive et adaptée aux besoins de notre communauté. Nous accordons une importance particulière à la qualité de nos services, à l'innovation, à la sécurité des données et à l'accompagnement de nos utilisateurs. »
          </p>
        </div>

        {/* Image du Contrat de Partenariat (Sans cadre/bordure) */}
        <div className="w-full aura-glass-card p-3 rounded-3xl shadow-2xl border-0 ring-0">
          <img
            src="/contrat-partenariat-officiel.svg"
            alt="Contrat de partenariat officiel Nutrien avec Corteva, Bayer, Syngenta, Yara, ADM"
            className="w-full h-auto object-contain rounded-2xl block shadow-lg border-0"
            referrerPolicy="no-referrer"
            loading="eager"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith('file_00000000adf0820ca9d27d84de3bdf50.png')) {
                target.src = '/file_00000000adf0820ca9d27d84de3bdf50.png';
              }
            }}
          />
        </div>

        {/* 1. Notre Identité (Sans cadre/bordure) */}
        <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-2 border-0 ring-0">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/90 text-cyan-300 flex items-center justify-center shrink-0 border-0">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="luminous-text">Notre Identité</h3>
          </div>
          <p className="text-sm text-cyan-200/90 leading-relaxed pl-10.5">
            Une entreprise technologique et financière axée sur l'inclusion économique, proposant des outils de valorisation et des opportunités d'investissements durables, transparents et accessibles à tous.
          </p>
        </div>

        {/* 2. Notre Mission (Sans cadre/bordure) */}
        <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-2 border-0 ring-0">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/90 text-emerald-300 flex items-center justify-center shrink-0 border-0">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="luminous-text">Notre Mission</h3>
          </div>
          <p className="text-sm text-cyan-200/90 leading-relaxed pl-10.5">
            Démocratiser l'accès aux revenus automatisés et au matériel agricole productif à travers une interface fluide, des transactions instantanées et une clarté totale à chaque étape.
          </p>
        </div>

        {/* 3. Nos Activités (Sans cadre/bordure) */}
        <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3 border-0 ring-0">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-amber-950/90 text-amber-300 flex items-center justify-center shrink-0 border-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="luminous-text">Nos Activités</h3>
          </div>
          <ul className="text-sm text-cyan-200/90 leading-relaxed pl-10.5 space-y-2 list-disc list-inside">
            <li>Gestion et déploiement de solutions d'investissement en matériel agricole et industriel de pointe.</li>
            <li>Distribution automatisée des rendements quotidiens sur les comptes utilisateurs toutes les 24 heures.</li>
            <li>Programme d'affiliation et d'accompagnement pour les partenaires et leaders de communauté.</li>
          </ul>
        </div>

        {/* 4. Nos Valeurs (Sans cadre/bordure) */}
        <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-0 ring-0">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/90 text-cyan-300 flex items-center justify-center shrink-0 border-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="luminous-text">Nos Valeurs</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 sm:pl-10.5">
            <div className="p-3.5 bg-[#02242e]/80 rounded-2xl space-y-1 border-0">
              <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-2 luminous-text-soft">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Transparence Totale
              </span>
              <p className="text-xs text-cyan-300/80">Règles claires, dépôts et retraits traçables en temps réel.</p>
            </div>

            <div className="p-3.5 bg-[#02242e]/80 rounded-2xl space-y-1 border-0">
              <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-2 luminous-text-soft">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                Sécurité des Données
              </span>
              <p className="text-xs text-cyan-300/80">Protection rigoureuse des accès, des soldes et des transactions.</p>
            </div>

            <div className="p-3.5 bg-[#02242e]/80 rounded-2xl space-y-1 border-0">
              <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-2 luminous-text-soft">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                Innovation Continue
              </span>
              <p className="text-xs text-cyan-300/80">Développement de fonctionnalités modernes adaptées aux besoins mobiles.</p>
            </div>

            <div className="p-3.5 bg-[#02242e]/80 rounded-2xl space-y-1 border-0">
              <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-2 luminous-text-soft">
                <HeartHandshake className="w-4 h-4 text-teal-400 shrink-0" />
                Accompagnement
              </span>
              <p className="text-xs text-cyan-300/80">Assistance disponible et écoute continue de notre communauté.</p>
            </div>
          </div>
        </div>

        {/* 5. Notre Objectif envers les utilisateurs (Sans cadre/bordure) */}
        <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-2 pb-6 border-0 ring-0">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-teal-950/90 text-teal-300 flex items-center justify-center shrink-0 border-0">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="luminous-text">Notre Objectif envers nos utilisateurs</h3>
          </div>
          <p className="text-sm text-cyan-200/90 leading-relaxed pl-10.5">
            Bâtir une relation de confiance durable en garantissant une expérience sereine, des paiements réguliers et un service d'assistance de premier ordre pour chacun de nos membres.
          </p>
        </div>

      </div>
    </div>
  );
}

