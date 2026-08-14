import React, { useState } from 'react';
import { Headphones, MessageCircle, Send, PhoneCall, Clock, CheckCircle2, X, Shield, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface CustomerServiceModalProps {
  onClose: () => void;
}

export default function CustomerServiceModal({ onClose }: CustomerServiceModalProps) {
  const [messages, setMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Bonjour et bienvenue sur le Service Client Aura Invest & Nutrien Ag Solutions. Comment pouvons-nous vous assister aujourd\'hui ?',
      time: '11:20'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: inputVal.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: 'Merci pour votre message. Un agent du support financier prend en charge votre demande. Les recharges et retraits Mobile Money (Wave, Orange, MTN, Moov) sont traités instantanément.',
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="customer-service-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white text-zinc-900 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] flex flex-col text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md relative">
              <Headphones className="w-6 h-6" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -top-0.5 -right-0.5"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-zinc-900 text-sm">Support Client SAV 24/7</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">En ligne</span>
              </div>
              <p className="text-[11px] text-zinc-500">Temps de réponse moyen : &lt; 2 minutes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels bar */}
        <div className="grid grid-cols-2 gap-2 py-2.5">
          <a
            href="https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition text-center"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Chaîne WhatsApp
          </a>
          <a
            href="https://t.me/AuraInvestOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 transition text-center"
          >
            <Send className="w-4 h-4 text-blue-600 shrink-0" /> Canal Telegram
          </a>
        </div>

        {/* Chat message box */}
        <div className="flex-1 bg-zinc-50 rounded-2xl p-3.5 space-y-3 overflow-y-auto min-h-[220px] max-h-[280px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-zinc-800 shadow-sm rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-zinc-400 mt-1 px-1 font-mono">{m.time}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1 bg-white p-2 rounded-xl text-zinc-400 text-xs w-20 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
        </div>

        {/* Send message form */}
        <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Écrivez votre message à notre conseiller..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-zinc-100 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
