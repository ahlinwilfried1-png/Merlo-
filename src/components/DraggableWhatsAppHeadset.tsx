import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Headphones, 
  MessageCircle, 
  Send, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Bell, 
  Radio,
  ArrowRight,
  Move
} from 'lucide-react';

interface DraggableWhatsAppHeadsetProps {
  channelUrl?: string;
  supportPhone?: string;
}

export default function DraggableWhatsAppHeadset({
  channelUrl = 'https://whatsapp.com/channel/0029Vb9STdz1dAw7n6r4EU3e',
  supportPhone = '+237670123456'
}: DraggableWhatsAppHeadsetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - dragStartPos.current.x);
    const dy = Math.abs(e.clientY - dragStartPos.current.y);
    // If movement is less than 6px, treat as a click
    if (dx < 6 && dy < 6) {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* DRAGGABLE HEADSET FLOATING BUTTON */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.08}
        dragConstraints={{
          top: 10,
          left: 10,
          right: typeof window !== 'undefined' ? window.innerWidth - 80 : 300,
          bottom: typeof window !== 'undefined' ? window.innerHeight - 100 : 600
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        initial={{ x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 85) : 280, y: 220 }}
        className="fixed z-50 cursor-grab active:cursor-grabbing select-none touch-none"
        id="draggable-blue-headset-widget"
      >
        <div className="relative group">
          {/* Pulsing Cyan / Emerald Aura Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-70 blur-xs animate-pulse group-hover:opacity-100 transition duration-500"></span>

          {/* Main Headset Button */}
          <div className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-[#003847] via-[#025262] to-[#046e82] border-2 border-cyan-300 shadow-2xl shadow-cyan-500/40 flex flex-col items-center justify-center text-white transition-all transform group-hover:scale-105 group-active:scale-95">
            {/* WhatsApp Mini Indicator */}
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#002b36] flex items-center justify-center shadow-md">
              <MessageCircle className="w-3 h-3 text-[#002b36] fill-[#002b36]" />
            </span>

            {/* Headset Icon */}
            <Headphones className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-200 drop-shadow" />

            {/* Micro Badge */}
            <span className="text-[7px] font-black uppercase tracking-tight text-cyan-200 leading-none mt-0.5 font-mono">
              WhatsApp
            </span>
          </div>

          {/* Tooltip with hint */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-3 py-1.5 aura-glass-card border border-cyan-500/40 rounded-xl text-[10px] font-bold text-cyan-100 whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center gap-1.5 luminous-text-soft">
            <Move className="w-3 h-3 text-cyan-300" />
            <span>Déplaçable • Chaîne WhatsApp</span>
          </div>
        </div>
      </motion.div>

      {/* WHATSAPP MODAL POPUP */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            id="whatsapp-headset-modal-overlay"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="aura-glass-card border border-[#0d5969]/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-left text-cyan-50 overflow-hidden"
              id="whatsapp-headset-modal"
            >
              {/* Decorative top cyan/emerald glow banner */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400"></div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-full bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 transition cursor-pointer z-10 border border-cyan-500/30"
                id="btn-close-whatsapp-modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 mb-5 pr-8">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-inner shrink-0">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight luminous-text">
                      Casque d'Assistance
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold font-mono luminous-text-emerald">
                      Direct
                    </span>
                  </div>
                  <p className="text-xs text-cyan-300/80 font-medium">
                    Chaîne officielle WhatsApp & Support 24/7
                  </p>
                </div>
              </div>

              {/* PRIMARY WHATSAPP CHANNEL CARD */}
              <div className="bg-[#02242e]/90 border border-[#0a4652]/80 rounded-2xl p-4.5 sm:p-5 mb-4 relative overflow-hidden shadow-inner space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                      <MessageCircle className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-white text-sm luminous-text-soft">Aura Invest - Chaîne Officielle</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-[11px] text-emerald-400 font-mono font-bold block luminous-text-emerald">
                        +35 000 Abonnés Actifs
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-cyan-200/90 leading-relaxed">
                  Suivre la chaîne Aura Invest sur WhatsApp pour recevoir en temps réel les annonces de gains 24h, les codes cadeaux exclusifs, les preuves de retraits et les nouvelles opportunités d'investissement.
                </p>

                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-join-whatsapp-channel"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-600/30 active:scale-98 cursor-pointer border border-white/20"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Suivre la Chaîne WhatsApp</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* SECONDARY WHATSAPP DIRECT SUPPORT CARD */}
              <div className="space-y-2.5">
                <div className="bg-[#02242e]/80 border border-[#0a4652]/70 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block luminous-text-soft">Service Client WhatsApp</span>
                      <span className="text-[10px] text-cyan-300/80 block">Assistance Dépôts & Retraits 24h/24</span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="btn-contact-whatsapp-support"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-md border border-cyan-400/30"
                  >
                    <span>Écrire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Community Perks Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#02242e]/70 border border-[#0a4652]/60 flex items-center gap-2 text-[11px] text-cyan-200">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">Signaux de gains 24h</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#02242e]/70 border border-[#0a4652]/60 flex items-center gap-2 text-[11px] text-cyan-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Sécurité garantie</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

