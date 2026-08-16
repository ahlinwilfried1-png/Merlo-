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
    <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 mb-4 text-left shadow-xl">
      <div className="flex items-center gap-3.5">
        <button
          onClick={onBack}
          id="btn-page-header-back"
          className="w-10 h-10 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 border border-zinc-700"
          aria-label="Retour"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            {icon && <span className="text-emerald-400">{icon}</span>}
            <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight">
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
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-wider shrink-0 font-mono">
          {badge}
        </span>
      )}
    </div>
  );
}


