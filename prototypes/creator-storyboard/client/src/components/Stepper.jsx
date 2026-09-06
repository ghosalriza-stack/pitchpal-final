import { Check } from 'lucide-react';

const STEPS = ['Brief', 'Storyboard', 'Send Pitch'];

export default function Stepper({ current }) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-3 md:gap-x-4 bg-white/70 backdrop-blur-md px-6 py-3 rounded-full border border-white/80 shadow-sm max-w-fit mx-auto">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const active = step === current;
        const done = step < current;
        return (
          <div key={label} className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all shadow-sm
                ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-pink-500/25 ring-2 ring-pink-300'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step}
              </span>
              <span className={`text-sm font-semibold tracking-tight ${active ? 'text-slate-900 font-bold' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {step !== STEPS.length && <span className={`w-6 md:w-8 h-0.5 rounded-full ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

