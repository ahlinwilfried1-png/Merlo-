import React from 'react';
import { ArrowLeft, ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  badge?: string;
  icon?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, onBack, badge, icon }: PageHeaderProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 mb-4 text-left">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          id="btn-page-header-back"
          className="w-10 h-10 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
          aria-label="Retour"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            {icon && <span className="text-[#22c55e]">{icon}</span>}
            <h1 className="text-base sm:text-lg font-black text-white leading-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-xs text-zinc-400 font-medium mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {badge && (
        <span className="px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#22c55e] text-[11px] font-black uppercase tracking-wider shrink-0 font-mono">
          {badge}
        </span>
      )}
    </div>
  );
}

