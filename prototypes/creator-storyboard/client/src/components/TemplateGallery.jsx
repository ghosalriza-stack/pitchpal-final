import { TEMPLATES } from '../data/templates';
import { Sparkles } from 'lucide-react';

export default function TemplateGallery({ onSelect, selectedId }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Start from an example template</span>
        </div>
        <span className="text-xs text-slate-400">Auto-fills brief & script</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TEMPLATES.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => onSelect(t)}
            className={`text-left p-4 rounded-2xl border transition-all glass-card hover:border-pink-300 hover:shadow-glow-pink/10 hover:-translate-y-0.5 active:translate-y-0
              ${selectedId === t.id ? 'border-pink-500 ring-2 ring-pink-400/30 bg-pink-50/40 shadow-sm' : 'border-white/80'}`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-sm font-bold text-slate-900">{t.label}</span>
              {selectedId === t.id && (
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{t.blurb}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

