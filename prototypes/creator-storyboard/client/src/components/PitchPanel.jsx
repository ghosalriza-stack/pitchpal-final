import { useState } from 'react';
import { Mail, MessageCircle, Copy, Check, Download, Loader2, RefreshCw, Sparkles, Send, ExternalLink } from 'lucide-react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors shadow-xs"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function PitchPanel({
  creatorInfo,
  onCreatorInfoChange,
  script,
  pitch,
  loading,
  error,
  onGenerate,
}) {
  const [tab, setTab] = useState('email');

  const field = (key, label, placeholder) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</label>
      <input
        type="text"
        value={creatorInfo[key]}
        onChange={(e) => onCreatorInfoChange({ ...creatorInfo, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/90 transition-all font-medium text-slate-800"
      />
    </div>
  );

  const buildBundleText = () => {
    if (!pitch) return '';
    return `PITCH KIT
==========

Creator: ${creatorInfo.creatorName || 'N/A'} (${creatorInfo.creatorNiche || 'N/A'}, ${creatorInfo.followers || 'N/A'} followers)
Brand: ${creatorInfo.brandName || 'N/A'}
Product: ${creatorInfo.product || 'N/A'}

--- APPROVED SCRIPT ---
${script}

--- PITCH EMAIL ---
Subject: ${pitch.subject}

${pitch.email_body}

--- DIRECT MESSAGE VERSION ---
${pitch.instagram_dm}
`;
  };

  const handleDownload = () => {
    const blob = new Blob([buildBundleText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(creatorInfo.brandName || 'pitch').replace(/\s+/g, '-').toLowerCase()}-pitch-kit.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-pink-200 bg-pink-50 text-xs font-bold text-pink-600 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 3 of 3 — Brand Outreach</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Send This Pitch</h2>
        <p className="text-sm text-slate-500 mt-1">
          Tell us who's pitching and to which brand — we'll generate a personalized outreach email and quick direct-message draft.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('creatorName', 'Your Name / Creator Name', 'e.g. Rizzzz')}
        {field('creatorNiche', 'Your Niche', 'e.g. Beauty & Skincare')}
        {field('followers', 'Follower Count', 'e.g. 45K')}
        {field('brandName', "Brand You're Pitching", 'e.g. Rare Beauty')}
        <div className="md:col-span-2">
          {field('product', 'Product / Campaign Focus', 'e.g. Soft Pinch Liquid Blush')}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white font-bold py-3.5 px-7 rounded-full transition-all shadow-lg shadow-pink-500/25 active:scale-95 disabled:opacity-50 text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>{pitch ? 'Regenerate Outreach Pitch' : 'Draft Pitch Email & DM'}</span>
        </button>
      </div>

      {pitch && (
        <div className="mt-8 border-t border-slate-200/80 pt-6 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('email')}
              className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-all
                ${tab === 'email' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              <Mail className="w-3.5 h-3.5" /> Email Version
            </button>
            <button
              type="button"
              onClick={() => setTab('dm')}
              className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-all
                ${tab === 'dm' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> Instagram DM
            </button>
          </div>

          {tab === 'email' ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-pink-600 mb-1">Subject Line</div>
                  <div className="font-bold text-slate-900 text-base">{pitch.subject}</div>
                </div>
                <CopyButton text={`Subject: ${pitch.subject}\n\n${pitch.email_body}`} />
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {pitch.email_body}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-pink-600">Direct Message Draft</div>
                <CopyButton text={pitch.instagram_dm} />
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                "{pitch.instagram_dm}"
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download Pitch Kit (.txt)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

