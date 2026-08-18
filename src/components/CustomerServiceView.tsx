import React from 'react';
import { ChevronLeft, Send, MessageCircle, Headphones } from 'lucide-react';
import { User as UserType } from '../types';
import PageHeader from './PageHeader';

interface CustomerServiceViewProps {
  currentUser?: UserType;
  onBack: () => void;
}

export default function CustomerServiceView({ onBack }: CustomerServiceViewProps) {
  const telegramChannelUrl = "https://t.me/+AgroprofitOfficial";
  const whatsappServiceUrl = "https://chat.whatsapp.com/invite/agroprofit";
  const whatsappChannelUrl = "https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e";

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 text-left text-cyan-50" id="customer-service-view">
      
      {/* 1. Header with PageHeader */}
      <PageHeader
        title="Service client"
        subtitle="Assistance 7j/7 et canaux officiels"
        onBack={onBack}
        icon={<Headphones className="w-5 h-5 text-cyan-400" />}
      />

      <div className="space-y-4 pt-1">

        {/* 2. Section des canaux de contact (Sans cadre/bordure) */}
        <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-0 ring-0" id="cs-channels-list">
          <h2 className="text-xs font-black uppercase font-mono tracking-wider text-cyan-300 luminous-text-cyan">
            Canaux d'Assistance Officiels
          </h2>
          
          <div className="space-y-3">
            {/* 1. Chaîne de télégramme */}
            <div className="flex items-center justify-between p-3.5 bg-[#02242e]/80 rounded-2xl shadow-inner border-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#0088cc] flex items-center justify-center text-white shadow-md shrink-0 border-0">
                  <Send className="w-5 h-5 text-white translate-x-[-1px] translate-y-[1px]" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white leading-tight block luminous-text-soft">
                    Chaîne Telegram
                  </span>
                  <span className="text-[11px] text-cyan-300/80 font-mono">
                    Canal officiel d'annonces
                  </span>
                </div>
              </div>
              <a
                href={telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-cs-telegram"
                className="px-4 py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold rounded-xl transition shadow-md active:scale-95 text-center shrink-0 cursor-pointer border-0"
              >
                Rejoindre
              </a>
            </div>

            {/* 2. WhatsApp Service */}
            <div className="flex items-center justify-between p-3.5 bg-[#02242e]/80 rounded-2xl shadow-inner border-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center text-slate-950 shadow-md shrink-0 font-black border-0">
                  <MessageCircle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white leading-tight block luminous-text-soft">
                    WhatsApp Service
                  </span>
                  <span className="text-[11px] text-cyan-300/80 font-mono">
                    Conseiller en ligne direct
                  </span>
                </div>
              </div>
              <a
                href={whatsappServiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-cs-whatsapp-service"
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 text-xs font-black rounded-xl transition shadow-md active:scale-95 text-center shrink-0 cursor-pointer border-0"
              >
                Discuter
              </a>
            </div>

            {/* 3. Chaîne WhatsApp */}
            <div className="flex items-center justify-between p-3.5 bg-[#02242e]/80 rounded-2xl shadow-inner border-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shrink-0 border-0">
                  <MessageCircle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white leading-tight block luminous-text-soft">
                    Chaîne WhatsApp
                  </span>
                  <span className="text-[11px] text-cyan-300/80 font-mono">
                    Suivi des gains & retraits
                  </span>
                </div>
              </div>
              <a
                href={whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-cs-whatsapp-channel"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md active:scale-95 text-center shrink-0 cursor-pointer border-0"
              >
                Suivre
              </a>
            </div>
          </div>
        </div>

        {/* 3. Section Règles du client (Sans cadre/bordure) */}
        <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-0 ring-0" id="cs-rules-section">
          
          <h2 className="text-xs font-black uppercase font-mono tracking-wider text-cyan-300 luminous-text-cyan">
            Règles & Consignes du Service Client
          </h2>

          {/* Numbered Rules List */}
          <div className="space-y-4 text-cyan-100 text-sm leading-relaxed">
            
            {/* Règle 1 */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#02242e]/60 border-0">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl bg-cyan-950 text-cyan-300 text-xs font-mono font-bold shrink-0 mt-0.5 shadow-inner border-0">
                1
              </span>
              <p className="text-cyan-100 font-medium">
                <strong className="text-white luminous-text-soft">Horaires du service :</strong> de 9h30 à 21h30 tous les jours. Nous sommes là pour vous aider à tout moment.
              </p>
            </div>

            {/* Règle 2 */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#02242e]/60 border-0">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl bg-cyan-950 text-cyan-300 text-xs font-mono font-bold shrink-0 mt-0.5 shadow-inner border-0">
                2
              </span>
              <div className="space-y-1">
                <p className="text-cyan-100 font-medium">
                  Pour toute question concernant notre plateforme, veuillez contacter notre service client en ligne.
                </p>
                <p className="text-cyan-300/80 text-xs font-medium">
                  Si notre service client en ligne ne répond pas immédiatement à votre message, veuillez patienter quelques minutes.
                </p>
              </div>
            </div>

            {/* Règle 3 */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#02242e]/60 border-0">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl bg-cyan-950 text-cyan-300 text-xs font-mono font-bold shrink-0 mt-0.5 shadow-inner border-0">
                3
              </span>
              <p className="text-cyan-100 font-medium">
                <strong className="text-white luminous-text-soft">Problèmes de dépôt :</strong> si votre dépôt n'apparaît pas sur votre compte, veuillez envoyer le reçu de paiement au service client dès que possible. Quel que soit le problème rencontré lors de l'utilisation de notre plateforme, notre équipe est là pour vous accompagner.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

