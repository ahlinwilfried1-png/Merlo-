import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  badge?: string;
  icon?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, onBack, badge, icon }: PageHeaderProps) {
  return (
    <div className="aura-glass-card rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 mb-4 text-left shadow-2xl border-0 ring-0">
      <div className="flex items-center gap-3.5">
        <button
          onClick={onBack}
          id="btn-page-header-back"
          className="w-10 h-10 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 border-0"
          aria-label="Retour"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            {icon && <span className="text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]">{icon}</span>}
            <h1 className="text-base sm:text-lg font-black text-white leading-tight luminous-text">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-xs text-cyan-200/80 font-medium mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {badge && (
        <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-[11px] font-bold uppercase tracking-wider shrink-0 font-mono luminous-text-cyan border-0">
          {badge}
        </span>
      )}
    </div>
  );
}




