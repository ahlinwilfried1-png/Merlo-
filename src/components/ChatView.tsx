import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  MessageCircle, 
  HelpCircle, 
  Image as ImageIcon, 
  X, 
  Clock, 
  CheckCheck, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  Eye,
  Camera
} from 'lucide-react';
import { FAQS } from '../data';
import { User as UserType, SupportTicket, SupportMessage } from '../types';
import { fetchUserSupportTicket, sendSupportMessage, markSupportTicketRead } from '../lib/supabaseService';

interface ChatViewProps {
  currentUser?: UserType;
}

export default function ChatView({ currentUser }: ChatViewProps) {
  const currentUserId = currentUser?.id || currentUser?.phoneNumber || 'usr-guest';
  const currentUserName = currentUser?.fullName || (currentUser?.phoneNumber ? `Membre ${currentUser.phoneNumber}` : 'Investisseur Aura');
  const currentUserPhone = currentUser?.phoneNumber || '';
  const currentUserEmail = currentUser?.email || '';

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load ticket and messages from backend
  const loadConversation = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await fetchUserSupportTicket(currentUserId);
      if (data) {
        setTicket(data);
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        // If there were unread messages for user, mark read
        if (data.unreadByUser && data.id) {
          markSupportTicketRead(data.id, 'user').catch(e => console.warn(e));
        }
      } else {
        // Default initial welcome message if no ticket yet
        setMessages([
          {
            id: 'msg-welcome',
            sender: 'admin',
            text: 'Bonjour et bienvenue sur le salon d\'échange & assistance officielle Aura Invest ! Un conseiller administratif est en ligne et vous répondra sous quelques instants.',
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.warn('Error loading chat:', err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Initial fetch and 3-second live polling
  useEffect(() => {
    loadConversation();
    const interval = setInterval(() => {
      loadConversation(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("L'image est trop volumineuse (maximum 8 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = inputText.trim();
    const imgToSend = selectedImage;

    if (!textToSend && !imgToSend) return;

    setIsSending(true);

    const tempId = `msg-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const optimisticMsg: SupportMessage = {
      id: tempId,
      sender: 'user',
      text: textToSend,
      imageUrl: imgToSend || undefined,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setInputText('');
    setSelectedImage(null);

    try {
      const res = await sendSupportMessage({
        ticketId: ticket?.id || `ticket-${currentUserId}`,
        userId: currentUserId,
        userName: currentUserName,
        userPhone: currentUserPhone,
        userEmail: currentUserEmail,
        text: textToSend,
        imageUrl: imgToSend || undefined,
        sender: 'user'
      });

      if (res && res.ticket) {
        setTicket(res.ticket);
        if (Array.isArray(res.ticket.messages)) {
          setMessages(res.ticket.messages);
        }
      }
    } catch (err) {
      console.error('Error sending support message:', err);
    } finally {
      setIsSending(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="space-y-4 text-left max-w-4xl mx-auto text-white" id="chat-view">
      {/* Header */}
      <div className="bg-zinc-900 p-5 sm:p-6 rounded-3xl space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-[10px] font-black uppercase font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              LIAISON DIRECTE ADMIN 24/7
            </span>
          </div>

          <button
            onClick={() => loadConversation()}
            disabled={isRefreshing}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white text-xs flex items-center gap-1 transition"
            title="Rafraîchir les messages"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#22c55e]' : ''}`} />
            <span className="text-[10px] font-mono">Sync</span>
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Salon d'Échange & Assistance</h2>
        <p className="text-xs text-zinc-400">
          Vos messages sont transmis en direct aux administrateurs. Les réponses apparaissent instantanément.
        </p>

        {/* Quick direct official buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
          <a
            href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e] text-black flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Chaîne WhatsApp Aura Car</span>
                <span className="text-[10px] text-[#22c55e]">Suivre les gains & annonces 24h</span>
              </div>
            </div>
            <span className="text-xs font-bold bg-[#22c55e] text-black px-2.5 py-1 rounded-lg">Suivre</span>
          </a>

          <a
            href="https://t.me/AuraInvestOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Canal Officiel Telegram</span>
                <span className="text-[10px] text-blue-400">Annonces & Preuves de paiements</span>
              </div>
            </div>
            <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg">Rejoindre</span>
          </a>
        </div>
      </div>

      {/* Live Synchronized Chat Box */}
      <div className="bg-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#22c55e]" />
            <h3 className="text-sm font-extrabold text-white">Discussion en direct avec le Support</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md">
              {currentUserPhone || currentUserName}
            </span>
          </div>
        </div>

        {/* Message history */}
        <div className="bg-zinc-950 rounded-2xl p-4 space-y-3.5 min-h-[340px] max-h-[460px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-zinc-700 animate-bounce" />
              <p>Envoyez votre message ci-dessous pour démarrer l'échange avec l'administration.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className={`text-[10px] font-bold ${isMe ? 'text-[#22c55e]' : 'text-zinc-300'}`}>
                      {isMe ? 'Vous' : 'Administration Aura'}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">{m.timestamp}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed break-words ${
                      isMe
                        ? 'bg-[#22c55e] text-black font-medium rounded-tr-none shadow-md'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none'
                    }`}
                  >
                    {/* Attached Image if any */}
                    {m.imageUrl && (
                      <div className="mb-2 relative rounded-xl overflow-hidden cursor-pointer group">
                        <img 
                          src={m.imageUrl} 
                          alt="Capture envoyée" 
                          className="max-h-60 rounded-xl object-contain bg-black/40 w-full"
                          onClick={() => setPreviewModalImage(m.imageUrl || null)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Image Preview before send */}
        {selectedImage && (
          <div className="relative inline-block bg-zinc-950 p-2 rounded-2xl border border-zinc-800 max-w-xs">
            <img src={selectedImage} alt="Aperçu" className="h-20 rounded-xl object-cover" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition shadow-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Box & Action Buttons */}
        <form onSubmit={handleSend} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-[#22c55e] rounded-2xl transition cursor-pointer shrink-0"
              title="Joindre une capture / photo"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              type="text"
              placeholder="Écrivez votre message à l'administration..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-zinc-950 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#22c55e]"
            />

            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && !selectedImage)}
              className="px-5 py-3 bg-[#22c55e] hover:bg-[#1eb852] disabled:opacity-50 text-black font-bold rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
        </form>
      </div>

      {/* FAQ & Réponses Rapides */}
      <div className="bg-zinc-900 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#22c55e]" /> Questions Fréquentes & Réponses Rapides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FAQS.slice(0, 4).map((faq, i) => (
            <div key={i} className="p-3.5 bg-zinc-950 rounded-2xl space-y-1">
              <h4 className="text-xs font-bold text-white">{faq.q}</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Image Full-Size Modal */}
      {previewModalImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-zinc-900 p-2 rounded-2xl border border-zinc-800" onClick={e => e.stopPropagation()}>
            <img src={previewModalImage} alt="Capture plein écran" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute top-4 right-4 p-2 bg-zinc-950/80 hover:bg-zinc-800 text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
