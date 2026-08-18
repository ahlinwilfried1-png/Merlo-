import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  MessageCircle, 
  X, 
  RefreshCw, 
  Eye, 
  Camera
} from 'lucide-react';
import { User as UserType, SupportTicket, SupportMessage } from '../types';
import { fetchUserSupportTicket, sendSupportMessage, markSupportTicketRead } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';

interface ChatViewProps {
  currentUser?: UserType;
}

export default function ChatView({ currentUser }: ChatViewProps) {
  const currentUserId = currentUser?.id || currentUser?.phoneNumber || 'usr-guest';
  const currentUserName = currentUser?.fullName || (currentUser?.phoneNumber ? `Membre ${currentUser.phoneNumber}` : 'Investisseur Agroprofit');
  const currentUserPhone = currentUser?.phoneNumber || '';
  const currentUserEmail = currentUser?.email || '';

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

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
        if (data.unreadByUser && data.id) {
          markSupportTicketRead(data.id, 'user').catch(e => console.warn(e));
        }
      } else {
        setMessages([
          {
            id: 'msg-welcome',
            sender: 'admin',
            text: 'Bonjour et bienvenue sur le salon d\'échange & assistance officielle Agroprofit ! Un conseiller administratif est en ligne et vous répondra sous quelques instants.',
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

  // Initial fetch and 2-second live polling + Supabase Realtime channel
  useEffect(() => {
    loadConversation();
    const interval = setInterval(() => {
      loadConversation(true);
    }, 2000);

    const chatChannel = supabase
      .channel(`chatview_realtime_${currentUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
        if (payload.new && (payload.new as any).type === 'chat_msg') {
          loadConversation(true);
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(chatChannel);
    };
  }, [currentUserId]);

  // Scroll down when messages change
  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

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
    setTimeout(() => scrollToBottom(true), 50);

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
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  return (
    <div className="space-y-4 text-left max-w-2xl mx-auto text-cyan-50 pb-32 sm:pb-36" id="chat-view">
      
      {/* 1. Header Information Section (Sans bordure/contour) */}
      <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-0 ring-0">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-[10px] font-bold uppercase font-mono flex items-center gap-1.5 luminous-text-cyan">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            LIAISON DIRECTE ADMIN 24/7
          </span>

          <button
            onClick={() => loadConversation()}
            disabled={isRefreshing}
            className="p-2 bg-[#02242e]/80 hover:bg-[#032d39] rounded-xl text-cyan-200 hover:text-white text-xs flex items-center gap-1.5 transition cursor-pointer border-0"
            title="Rafraîchir les messages"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="text-[10px] font-mono font-bold">Sync</span>
          </button>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight luminous-text">Salon d'Échange & Assistance</h2>
          <p className="text-xs text-cyan-200/80 mt-1">
            Vos messages sont transmis en direct aux administrateurs. Les réponses apparaissent instantanément.
          </p>
        </div>

        {/* Quick direct official buttons (Sans contour) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-[#02242e]/80 hover:bg-[#032d39] text-white rounded-2xl flex items-center justify-between transition cursor-pointer shadow-inner border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white luminous-text-soft">Canal WhatsApp Aura Invest</span>
                <span className="text-[10px] text-cyan-300/80 font-semibold">Suivre les gains & annonces 24h</span>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-xl shadow-sm border-0">Suivre</span>
          </a>

          <a
            href="https://chat.whatsapp.com/invite/agroprofit"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-[#02242e]/80 hover:bg-[#032d39] text-white rounded-2xl flex items-center justify-between transition cursor-pointer shadow-inner border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#032c20] text-[#25D366] flex items-center justify-center shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white luminous-text-soft">Groupe de discussion</span>
                <span className="text-[10px] text-cyan-300/80 font-semibold">Échanges & Partages d'expériences</span>
              </div>
            </div>
            <span className="text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-slate-950 px-3 py-1 rounded-xl font-black shadow-sm border-0">Rejoindre</span>
          </a>
        </div>
      </div>

      {/* 2. Messages Thread Container (Sans contour) */}
      <div className="aura-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-0 ring-0">
        <div className="flex items-center justify-between pb-3 border-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white luminous-text">Discussion en direct</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg font-semibold">
              {currentUserPhone || currentUserName}
            </span>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-3 pr-0.5" id="chat-messages-container">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-cyan-300/70 text-xs bg-[#02242e]/60 rounded-2xl border-0">
              Aucun message pour le moment. Écrivez ci-dessous pour démarrer l'échange avec un administrateur.
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.sender === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-mono text-cyan-400/70">{msg.timestamp}</span>
                    <span className={`text-[10px] font-black uppercase font-mono ${isAdmin ? 'text-amber-300' : 'text-cyan-300'}`}>
                      {isAdmin ? '🛡️ Support Aura Invest' : 'Vous'}
                    </span>
                  </div>

                  <div
                    className={`max-w-[88%] sm:max-w-[78%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 shadow-md border-0 ${
                      isAdmin
                        ? 'bg-[#02242e]/90 text-cyan-100 rounded-tl-xs'
                        : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-xs font-medium shadow-cyan-600/20'
                    }`}
                  >
                    {msg.imageUrl && (
                      <div className="relative group cursor-pointer" onClick={() => setPreviewModalImage(msg.imageUrl || null)}>
                        <img 
                          src={msg.imageUrl} 
                          alt="Capture jointe" 
                          className="rounded-xl max-h-56 w-full object-cover border-0" 
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center text-white text-xs gap-1 font-bold">
                          <Eye className="w-4 h-4" /> Agrandir
                        </div>
                      </div>
                    )}
                    {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. FIXED BOTTOM INPUT BAR (Sans contour lourd) */}
      <div 
        id="chat-fixed-input-bar"
        className="fixed bottom-[58px] left-0 right-0 z-20 bg-[#01141c]/95 backdrop-blur-md shadow-2xl px-2 py-2.5 sm:py-3 border-0"
      >
        <div className="max-w-2xl mx-auto px-1 sm:px-3 space-y-2">
          {/* Selected Image Thumbnail Preview */}
          {selectedImage && (
            <div className="relative inline-block bg-[#02242e] p-1.5 rounded-xl shadow-md max-w-xs border-0">
              <img src={selectedImage} alt="Aperçu" className="h-16 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow-md cursor-pointer border-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form with Camera, Input, and Send button */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
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
              className="p-2.5 sm:p-3 bg-[#02242e] hover:bg-[#032d39] text-cyan-300 hover:text-white rounded-2xl transition cursor-pointer shrink-0 border-0"
              title="Joindre une capture / photo"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              type="text"
              placeholder="Écrivez votre message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#021f28]/90 rounded-2xl px-4 py-2.5 sm:py-3 text-xs text-white placeholder-cyan-500/50 focus:outline-none transition shadow-inner border-0"
            />

            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && !selectedImage)}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/30 shrink-0 active:scale-95 border-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </form>
        </div>
      </div>

      {/* Image Full-Size Modal */}
      {previewModalImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-2xl w-full aura-glass-card p-3 rounded-3xl shadow-2xl border-0" onClick={e => e.stopPropagation()}>
            <img src={previewModalImage} alt="Capture plein écran" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute top-4 right-4 p-2 bg-cyan-950/90 text-cyan-300 hover:text-white rounded-full transition cursor-pointer border-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
