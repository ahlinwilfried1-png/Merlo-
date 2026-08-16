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
import { fetchUserSupportTicket, sendSupportMessage } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';

interface CustomerServiceViewProps {
  currentUser?: UserType;
  onBack: () => void;
}

const STORAGE_KEY = 'aura_support_tickets_v1';

export default function CustomerServiceView({ currentUser, onBack }: CustomerServiceViewProps) {
  const currentUserId = currentUser?.id || currentUser?.phoneNumber || 'usr-guest';
  const currentUserName = currentUser?.fullName || (currentUser?.phoneNumber ? `Membre ${currentUser.phoneNumber}` : 'Investisseur Aura');

  // Load user ticket from localStorage or backend
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
        userPhone: currentUser?.phoneNumber || '+228 90 00 00 00',
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

  // Poll backend for real admin replies + Supabase realtime subscription
  useEffect(() => {
    const pollTicket = async () => {
      try {
        const remoteTicket = await fetchUserSupportTicket(currentUserId);
        if (remoteTicket) {
          setTickets(prev => {
            const index = prev.findIndex(t => t.userId === currentUserId || t.id === remoteTicket.id);
            if (index >= 0) {
              const copy = [...prev];
              copy[index] = remoteTicket;
              return copy;
            }
            return [remoteTicket, ...prev];
          });
        }
      } catch (err) {
        console.warn('Error polling user ticket:', err);
      }
    };

    pollTicket();
    const interval = setInterval(pollTicket, 2500);

    const chatChannel = supabase
      .channel(`cs_chat_realtime_${currentUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
        if (payload.new && (payload.new as any).type === 'chat_msg') {
          pollTicket();
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(chatChannel);
    };
  }, [currentUserId]);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const currentText = inputVal.trim();
    setInputVal('');

    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: currentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const existingIndex = tickets.findIndex(t => t.userId === currentUserId);
    let updatedTickets: SupportTicket[];
    const targetTicketId = userTicket.id;

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
        userPhone: currentUser?.phoneNumber || '+228 90 00 00 00',
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

    // Send to backend API
    try {
      await sendSupportMessage({
        ticketId: targetTicketId,
        userId: currentUserId,
        userName: currentUserName,
        userEmail: currentUser?.email,
        userPhone: currentUser?.phoneNumber,
        sender: 'user',
        text: currentText
      });
    } catch (err) {
      console.warn('Error sending support message to backend:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 text-left text-zinc-100" id="page-customer-service-container">
      <PageHeader
        title="Service Client 24/7"
        subtitle="Assistance directe avec l'équipe d'administration"
        onBack={onBack}
        badge="En Ligne"
        icon={<Headphones className="w-5 h-5 text-emerald-400" />}
      />

      {/* External Fast Channels */}
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 bg-[#121215] hover:bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold transition text-center shadow-xl"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Chaîne WhatsApp</span>
        </a>

        <a
          href="https://t.me/AuraInvestOfficial"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 bg-[#121215] hover:bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-sky-400 text-xs font-bold transition text-center shadow-xl"
        >
          <Send className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Canal Telegram</span>
        </a>
      </div>

      {/* Live Chat Box */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-4 sm:p-5 space-y-3 flex flex-col shadow-xl">
        <div className="flex items-center justify-between pb-2 text-xs border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white">Support Administrateur en direct</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">ID Ticket : {userTicket.id.slice(-8)}</span>
        </div>

        {/* Message Feed */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-3.5 space-y-3 overflow-y-auto min-h-[260px] max-h-[360px]">
          {userTicket.messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-br-none shadow-lg'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-zinc-500 mt-1 px-1 font-mono">{m.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-2.5 rounded-2xl text-zinc-400 text-xs w-20">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
        </div>

        {/* Form Input */}
        <form onSubmit={handleSend} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Écrivez votre message à l'administration..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition"
          />
          <button
            type="submit"
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition cursor-pointer active:scale-95 shadow-lg flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
