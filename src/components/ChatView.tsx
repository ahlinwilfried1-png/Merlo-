import React, { useState } from 'react';
import { MessageSquare, Send, MessageCircle, HelpCircle } from 'lucide-react';
import { FAQS } from '../data';

export default function ChatView() {
  const [messages, setMessages] = useState<Array<{ id: string; user: string; text: string; time: string; isAgent?: boolean }>>([
    { id: '1', user: 'Conseiller Aura', text: 'Bienvenue dans le salon d\'entraide et support client. Posez vos questions ou contactez directement nos conseillers.', time: '10:00', isAgent: true },
    { id: '2', user: 'Kouassi Jean', text: 'Bonjour, mon retrait de 50 000 F CFA est arrivé en 3 minutes ! Merci pour la rapidité.', time: '10:45' },
    { id: '3', user: 'Amina Traoré', text: 'Super, j\'ai réinvesti mes gains sur le VIP 2 Argent aujourd\'hui.', time: '11:10' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      user: 'Vous',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          user: 'Support Automatisé Aura',
          text: 'Merci pour votre message. Un agent du service financier ou un membre de la communauté va vous répondre sous peu.',
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isAgent: true
        }
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-4 text-left max-w-4xl mx-auto text-white" id="chat-view">
      {/* Header without any border or frame traces */}
      <div className="bg-zinc-900 p-5 sm:p-6 rounded-3xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-[10px] font-black uppercase font-mono">
            COMMUNAUTÉ & ASSISTANCE 24/7
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Salon d'Échange & Assistance</h2>
        <p className="text-xs text-zinc-400">
          Échangez avec les autres investisseurs en Franc CFA et recevez une assistance instantanée.
        </p>

        {/* Quick direct buttons - completely borderless and seamless */}
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

      {/* Live Chat Box - completely borderless without frames or traces */}
      <div className="bg-zinc-900 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#22c55e]" /> Flux de discussion en direct
        </h3>

        <div className="bg-zinc-950 rounded-2xl p-4 space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                m.isAgent
                  ? 'bg-zinc-900 text-[#22c55e] ml-0 mr-auto'
                  : m.user === 'Vous'
                  ? 'bg-[#22c55e] text-black font-medium ml-auto mr-0'
                  : 'bg-zinc-900 text-zinc-100 ml-0 mr-auto'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className={`font-bold text-[11px] ${m.isAgent ? 'text-[#22c55e]' : m.user === 'Vous' ? 'text-black' : 'text-zinc-300'}`}>
                  {m.user}
                </span>
                <span className={`text-[9px] font-mono ${m.user === 'Vous' ? 'text-zinc-800' : 'text-zinc-500'}`}>
                  {m.time}
                </span>
              </div>
              <p>{m.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Écrivez votre message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-zinc-950 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-[#22c55e] hover:bg-[#1eb852] text-black font-bold rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" /> Envoyer
          </button>
        </form>
      </div>

      {/* FAQ - completely frameless */}
      <div className="bg-zinc-900 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#22c55e]" /> Réponses Rapides
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
    </div>
  );
}
