import FrameImage from './FrameImage';

const SOURCE_LABELS = {
  openrouter: 'via OpenRouter',
  free: 'free renderer',
};

export default function FrameCard({ frame, index }) {
  const annotations = Array.isArray(frame.annotations) ? frame.annotations.filter(Boolean) : [];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 border border-white/80 rounded-3xl glass-card shadow-sm transition-all hover:shadow-md">
      {/* Frame Image Container */}
      <div
        className="w-full md:w-5/12 bg-slate-50/70 border border-slate-200/70 flex items-center justify-center rounded-2xl overflow-hidden relative shadow-inner"
        style={{ minHeight: 250 }}
      >
        <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md shadow-pink-500/20 z-10 tracking-wider">
          FRAME {(index + 1).toString().padStart(2, '0')}
        </div>
        {SOURCE_LABELS[frame.imageSource] && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-500 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-200 z-10">
            {SOURCE_LABELS[frame.imageSource]}
          </div>
        )}
        <FrameImage
          src={frame.imageUrl}
          alt={frame.action}
          errorMessage={frame.imageError}
          skipped={frame.imageSource === 'skipped'}
        />
      </div>

      {/* Frame Details */}
      <div className="w-full md:w-7/12 flex flex-col gap-4">
        <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-2xl flex-1">
          <div className="text-[11px] font-extrabold uppercase text-pink-600 mb-1.5 tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
            Action
          </div>
          <p className="text-slate-800 text-sm md:text-base whitespace-pre-wrap font-medium leading-relaxed">
            {frame.action}
          </p>
        </div>

        <div className="bg-pink-50/30 p-4 border border-pink-100/70 rounded-2xl flex-1">
          <div className="text-[11px] font-extrabold uppercase text-slate-500 mb-1.5 tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Voiceover
          </div>
          <p className="text-slate-700 text-sm md:text-base whitespace-pre-wrap italic font-serif leading-relaxed">
            "{frame.voiceover || '(No voiceover)'}"
          </p>
        </div>

        {(frame.on_screen_text || frame.speech_bubble || annotations.length > 0) && (
          <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-2xl space-y-2.5">
            <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
              On-Panel Elements
            </div>
            <div className="flex flex-col gap-2">
              {frame.on_screen_text && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase font-bold text-pink-600 shrink-0 w-16">Headline</span>
                  <span className="text-slate-900 font-extrabold text-sm uppercase tracking-wide bg-white px-2 py-0.5 rounded border border-slate-200">{frame.on_screen_text}</span>
                </div>
              )}
              {frame.speech_bubble && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase font-bold text-purple-600 shrink-0 w-16">Bubble</span>
                  <span className="text-slate-800 text-sm bg-purple-50/60 px-2 py-0.5 rounded border border-purple-100">&ldquo;{frame.speech_bubble}&rdquo;</span>
                </div>
              )}
              {annotations.length > 0 && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 w-16">Labels</span>
                  <span className="flex flex-wrap gap-1.5">
                    {annotations.map((label) => (
                      <span
                        key={label}
                        className="text-[11px] uppercase tracking-wide text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-0.5 font-medium"
                      >
                        {label}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

