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
      {/* DRAGGABLE BLUE HEADSET FLOATING BUTTON */}
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
          {/* Pulsing Blue Aura / Ring */}
          <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 opacity-75 blur-xs animate-pulse group-hover:opacity-100 transition duration-500"></span>

          {/* Main Blue Headset Button */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 border-2 border-cyan-300/80 shadow-2xl shadow-blue-500/40 flex flex-col items-center justify-center text-white transition-all transform group-hover:scale-105 group-active:scale-95">
            {/* WhatsApp Mini Indicator */}
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#25D366] border-2 border-zinc-950 flex items-center justify-center shadow-md">
              <MessageCircle className="w-3 h-3 text-white fill-white" />
            </span>

            {/* Blue Headset Icon */}
            <Headphones className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md" />

            {/* Micro Badge */}
            <span className="text-[7px] font-black uppercase tracking-tight text-cyan-100 leading-none mt-0.5 font-mono">
              WhatsApp
            </span>
          </div>

          {/* Tooltip with hint */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2.5 py-1 bg-zinc-900/95 border border-blue-500/40 rounded-xl text-[10px] font-bold text-white whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center gap-1.5">
            <Move className="w-3 h-3 text-cyan-400" />
            <span>Déplaçable • Chaîne WhatsApp</span>
          </div>
        </div>
      </motion.div>

      {/* WHATSAPP MODAL POPUP */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            id="whatsapp-headset-modal-overlay"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-left text-white overflow-hidden"
              id="whatsapp-headset-modal"
            >
              {/* Decorative top blue banner */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-[#25D366]"></div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer z-10"
                id="btn-close-whatsapp-modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 mb-5 pr-8">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 border border-cyan-300/40 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
                  <Headphones className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Casque d'Assistance
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                      Direct
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">
                    Chaîne officielle WhatsApp & Support 24/7
                  </p>
                </div>
              </div>

              {/* PRIMARY WHATSAPP CHANNEL CARD */}
              <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 border border-emerald-500/40 rounded-2xl p-4.5 sm:p-5 mb-4 relative overflow-hidden shadow-lg">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-[#25D366]/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-[#25D366]/25 shrink-0">
                      <MessageCircle className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-sm">Aura Car - Chaîne Officielle</span>
                        <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                      </div>
                      <span className="text-[11px] text-emerald-400 font-mono font-bold block">
                        +35 000 Abonnés Actifs
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                  Suivre la chaîne Aura car sur WhatsApp pour recevoir en temps réel les annonces de gains 24h, les codes cadeaux exclusifs, les preuves de retraits et les nouvelles offres VIP.
                </p>

                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-join-whatsapp-channel"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/30 active:scale-98 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>Suivre la Chaîne Aura Car</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* SECONDARY WHATSAPP DIRECT SUPPORT CARD */}
              <div className="space-y-2.5">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Service Client WhatsApp</span>
                      <span className="text-[10px] text-zinc-400 block">Assistance Dépôts & Retraits 24h/24</span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="btn-contact-whatsapp-support"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <span>Écrire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Community Perks Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex items-center gap-2 text-[11px] text-zinc-300">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">Signaux de gains 24h</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex items-center gap-2 text-[11px] text-zinc-300">
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
