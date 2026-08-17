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

  // Load ticket and messages from backend (NO automatic scrolling, scrolling is user-controlled only)
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
    }
  };

  return (
    <div className="space-y-4 text-left max-w-4xl mx-auto text-zinc-100" id="chat-view">
      {/* Header */}
      <div className="bg-[#121215] border border-zinc-800/90 p-5 sm:p-6 rounded-3xl space-y-2 relative shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIAISON DIRECTE ADMIN 24/7
            </span>
          </div>

          <button
            onClick={() => loadConversation()}
            disabled={isRefreshing}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 hover:text-white text-xs flex items-center gap-1 transition cursor-pointer border border-zinc-700"
            title="Rafraîchir les messages"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="text-[10px] font-mono font-bold">Sync</span>
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
            className="p-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 text-zinc-100 rounded-2xl flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Canal WhatsApp Agroprofit</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Suivre les gains & annonces 24h</span>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-lg shadow-md">Suivre</span>
          </a>

          <a
            href="https://t.me/AuraInvestOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 text-zinc-100 rounded-2xl flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-lg">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Canal Officiel Telegram</span>
                <span className="text-[10px] text-sky-400 font-semibold">Annonces & Preuves de paiements</span>
              </div>
            </div>
            <span className="text-xs font-bold bg-sky-600 text-white px-2.5 py-1 rounded-lg shadow-md">Rejoindre</span>
          </a>
        </div>
      </div>

      {/* Live Synchronized Chat Box */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Discussion en direct avec le Support</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-md font-semibold">
              {currentUserPhone || currentUserName}
            </span>
          </div>
        </div>

        {/* Messages List - Strictly user-controlled scroll container */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
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
                    <span className="text-[10px] font-mono text-zinc-500">{msg.timestamp}</span>
                    <span className={`text-[10px] font-black uppercase font-mono ${isAdmin ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {isAdmin ? '🛡️ Administration Agroprofit' : 'Vous'}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                      isAdmin
                        ? 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-sm'
                        : 'bg-emerald-600 text-white rounded-tr-sm shadow-md font-medium'
                    }`}
                  >
                    {msg.imageUrl && (
                      <div className="relative group cursor-pointer" onClick={() => setPreviewModalImage(msg.imageUrl || null)}>
                        <img 
                          src={msg.imageUrl} 
                          alt="Capture jointe" 
                          className="rounded-xl max-h-56 w-full object-cover border border-white/10" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center text-white text-xs gap-1 font-bold">
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
        </div>

        {/* Selected Image Preview before send */}
        {selectedImage && (
          <div className="relative inline-block bg-zinc-900 p-2 rounded-2xl border border-zinc-800 max-w-xs">
            <img src={selectedImage} alt="Aperçu" className="h-20 rounded-xl object-cover" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition shadow-md cursor-pointer"
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
              className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 rounded-2xl transition cursor-pointer shrink-0 border border-zinc-800"
              title="Joindre une capture / photo"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              type="text"
              placeholder="Écrivez votre message à l'administration..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />

            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && !selectedImage)}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
        </form>
      </div>

      {/* Image Full-Size Modal */}
      {previewModalImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-zinc-900 p-2 rounded-2xl border border-zinc-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={previewModalImage} alt="Capture plein écran" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition cursor-pointer border border-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
