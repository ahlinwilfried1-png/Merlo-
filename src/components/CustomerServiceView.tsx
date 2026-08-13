import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Send, 
  MessageCircle, 
  Clock, 
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  User,
  AlertCircle
} from 'lucide-react';
import PageHeader from './PageHeader';
import { User as UserType, SupportTicket, SupportMessage } from '../types';

interface CustomerServiceViewProps {
  currentUser?: UserType;
  onBack: () => void;
}

const STORAGE_KEY = 'aura_support_tickets_v1';

export default function CustomerServiceView({ currentUser, onBack }: CustomerServiceViewProps) {
  const currentUserId = currentUser?.id || 'usr-guest';
  const currentUserName = currentUser?.fullName || 'Utilisateur';

  // Load user ticket from localStorage
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: `ticket-${currentUserId}`,
        userId: currentUserId,
        userName: currentUserName,
        userEmail: currentUser?.email || 'client@aurainvest.com',
        userPhone: '+225 07 00 00 00',
        subject: 'Assistance générale & Retraits',
        status: 'answered',
        unreadByAdmin: false,
        unreadByUser: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-init',
            sender: 'admin',
            text: 'Bonjour ! Bienvenue au service d’assistance officiel Aura Invest. Vous êtes en liaison directe avec l\'équipe d\'administration. Comment pouvons-nous vous aider ?',
            timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Sync to localStorage
  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Listen to cross-tab or admin storage updates
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setTickets(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Get current user's ticket
  const userTicket = tickets.find(t => t.userId === currentUserId) || {
    id: `ticket-${currentUserId}`,
    userId: currentUserId,
    userName: currentUserName,
    userEmail: currentUser?.email || 'client@aurainvest.com',
    subject: 'Assistance générale',
    status: 'open' as const,
    unreadByAdmin: false,
    unreadByUser: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg-init',
        sender: 'admin' as const,
        text: 'Bonjour ! Bienvenue au support Aura Invest. Un conseiller de l\'administration est à votre écoute.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputVal.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentText = inputVal.trim();
    setInputVal('');

    const existingIndex = tickets.findIndex(t => t.userId === currentUserId);
    let updatedTickets: SupportTicket[];

    if (existingIndex >= 0) {
      const updated = { ...tickets[existingIndex] };
      updated.messages = [...updated.messages, newMsg];
      updated.status = 'open';
      updated.unreadByAdmin = true;
      updated.updatedAt = new Date().toISOString();
      updatedTickets = [...tickets];
      updatedTickets[existingIndex] = updated;
    } else {
      const newTicket: SupportTicket = {
        id: `ticket-${currentUserId}`,
        userId: currentUserId,
        userName: currentUserName,
        userEmail: currentUser?.email || 'client@aurainvest.com',
        userPhone: '+225 07 00 00 00',
        subject: 'Demande d\'assistance',
        status: 'open',
        unreadByAdmin: true,
        unreadByUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-init',
            sender: 'admin',
            text: 'Bonjour ! Bienvenue au support Aura Invest. Un conseiller de l\'administration est à votre écoute.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          newMsg
        ]
      };
      updatedTickets = [newTicket, ...tickets];
    }

    saveTickets(updatedTickets);

    // Optional simulated intelligent auto-reply if admin doesn't respond instantly
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let autoReplyText = "Votre message a été transmis à l'administrateur en charge. Un agent répond dans les plus brefs délais.";
      const lower = currentText.toLowerCase();
      if (lower.includes('retrait') || lower.includes('retirer')) {
        autoReplyText = "Concernant vos retraits : ils sont traités automatiquement vers votre compte de retrait. Un administrateur consulte votre dossier.";
      } else if (lower.includes('recharge') || lower.includes('dépôt') || lower.includes('depot')) {
        autoReplyText = "Pour les recharges, assurez-vous d'avoir saisi la référence de transaction. Votre compte sera crédité sous peu.";
      }

      const autoMsg: SupportMessage = {
        id: `msg-auto-${Date.now()}`,
        sender: 'admin',
        text: autoReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalTickets = updatedTickets.map(t => {
        if (t.userId === currentUserId) {
          return {
            ...t,
            messages: [...t.messages, autoMsg],
            status: 'answered' as const,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      saveTickets(finalTickets);
    }, 1200);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 text-left text-white" id="page-customer-service-container">
      <PageHeader
        title="Service Client 24/7"
        subtitle="Assistance directe avec l'équipe d'administration"
        onBack={onBack}
        badge="En Ligne"
        icon={<Headphones className="w-5 h-5 text-[#22c55e]" />}
      />

      {/* External Fast Channels - borderless */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href="https://wa.me/2250700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-white text-xs font-bold transition"
        >
          <MessageCircle className="w-4 h-4 text-[#22c55e] shrink-0" />
          <span>WhatsApp Direct</span>
        </a>

        <a
          href="https://t.me/AuraInvestOfficial"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-white text-xs font-bold transition"
        >
          <Send className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Canal Telegram VIP</span>
        </a>
      </div>

      {/* Live Chat Box without frames or outline traces */}
      <div className="bg-zinc-900 rounded-3xl p-4 sm:p-5 space-y-3 flex flex-col">
        <div className="flex items-center justify-between pb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></span>
            <span className="font-bold text-white">Support Administrateur en direct</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">ID Ticket : {userTicket.id.slice(-8)}</span>
        </div>

        {/* Message Feed */}
        <div className="bg-zinc-950 rounded-2xl p-3.5 space-y-3 overflow-y-auto min-h-[260px] max-h-[360px]">
          {userTicket.messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#22c55e] text-black font-medium rounded-br-none'
                    : 'bg-zinc-900 text-zinc-100 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-zinc-500 mt-1 px-1 font-mono">{m.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1 bg-zinc-900 p-2.5 rounded-2xl text-zinc-400 text-xs w-20">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
        </div>

        {/* Form Input without borders */}
        <form onSubmit={handleSend} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Écrivez votre message à l'administration..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-zinc-950 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="p-3 bg-[#22c55e] hover:bg-[#1eb852] text-black rounded-2xl transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
