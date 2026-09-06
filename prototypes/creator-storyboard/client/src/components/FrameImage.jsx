import { useEffect, useState } from 'react';
import { ImageOff, PencilLine } from 'lucide-react';
import { enqueueImage } from '../lib/imageQueue';

export default function FrameImage({ src, alt, errorMessage, skipped }) {
  const [status, setStatus] = useState(src ? 'pending' : 'failed');
  const [resolvedSrc, setResolvedSrc] = useState(null);

  useEffect(() => {
    if (!src) {
      setStatus('failed');
      return undefined;
    }

    let cancelled = false;
    setStatus('pending');
    setResolvedSrc(null);

    enqueueImage(src)
      .then((finalSrc) => {
        if (cancelled) return;
        setResolvedSrc(finalSrc);
        setStatus('loaded');
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  // A deliberately undrawn frame is a normal outcome, not a failure - the
  // frame's action and voiceover are still there to shoot from.
  if (skipped) {
    return (
      <div className="flex flex-col items-center justify-center text-ink/35 p-4 text-center gap-2">
        <PencilLine className="w-9 h-9 opacity-60" />
        <span className="text-sm font-medium text-ink/50">Not sketched</span>
        <span className="text-xs leading-relaxed max-w-[180px]">
          Only the opening frame is drawn to stay inside the free image quota.
        </span>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="absolute inset-0 shimmer flex items-end justify-center pb-3">
        <span className="text-[11px] text-ink/40">Drawing frame…</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center text-ink/40 p-4 text-center">
        <ImageOff className="w-10 h-10 mb-2 opacity-60" />
        <span className="text-sm">Sketch unavailable</span>
        {errorMessage && (
          <span className="text-xs text-rust/80 mt-2 max-w-[200px] leading-relaxed break-words">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }

  return <img src={resolvedSrc} alt={alt} className="w-full h-full object-cover grayscale" />;
}
