import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Zap, ArrowRight, ArrowLeft, Sparkles, Film, LogOut, CheckCircle2 } from 'lucide-react';
import Stepper from './components/Stepper';
import TemplateGallery from './components/TemplateGallery';
import FrameCard from './components/FrameCard';
import FrameSkeleton from './components/FrameSkeleton';
import PitchPanel from './components/PitchPanel';
import { loadSignedInCreator, signOutCreator } from './lib/session';

// Read once at module load, before any component renders, so the pitch form can
// start out already filled in for whoever the gateway signed in.
const signedInCreator = loadSignedInCreator();

// Where the gateway app lives, for the "sign out" trip back to it.
const GATEWAY_URL = 'http://localhost:3002';

const LOADING_MESSAGES = [
  'Reading your brief…',
  'Breaking the script into shot panels…',
  'Sketching ink line-art storyboard…',
  'Composing on-screen text & bubbles…',
  'Finalizing shot-by-shot storyboard…',
];

const API_BASE = 'http://localhost:3001';

function App() {
  const [step, setStep] = useState(1);

  // Advanced / technical settings - collapsed by default
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [textModel, setTextModel] = useState('gemini-3.6-flash');
  const [imageModel, setImageModel] = useState('gemini-2.5-flash-image');

  // Step 1: brief
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [contentGoal, setContentGoal] = useState('Brand promotion');
  const [targetAudience, setTargetAudience] = useState('');
  const [brief, setBrief] = useState('');
  const [script, setScript] = useState('');

  // Step 2: storyboard
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Step 3: pitch. Pre-filled from the gateway app's handoff when it sent one.
  const [creatorInfo, setCreatorInfo] = useState(() => ({
    creatorName: signedInCreator.creatorName || 'Rizzzz',
    creatorNiche: signedInCreator.creatorNiche || 'Beauty & Lifestyle',
    followers: signedInCreator.followers || '45K',
    brandName: '',
    product: '',
  }));
  const [pitch, setPitch] = useState(null);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchError, setPitchError] = useState('');

  const loadingTimerRef = useRef(null);

  useEffect(() => {
    if (loading) {
      setLoadingMessageIndex(0);
      loadingTimerRef.current = setInterval(() => {
        setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
      }, 1500);
    } else if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
    }
    return () => clearInterval(loadingTimerRef.current);
  }, [loading]);

  const applyTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setContentGoal(template.contentGoal);
    setTargetAudience(template.targetAudience);
    setBrief(template.brief);
    setScript(template.script);
    // The brand half of a template is always useful, but never overwrite the
    // real signed-in creator with the template's sample persona.
    setCreatorInfo({
      creatorName: signedInCreator.creatorName || template.creatorName || 'Rizzzz',
      creatorNiche: signedInCreator.creatorNiche || template.creatorNiche || 'Beauty & Lifestyle',
      followers: signedInCreator.followers || template.followers || '45K',
      brandName: template.brandName,
      product: template.product,
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!script) {
      setError('Add a script or step-by-step idea before generating.');
      return;
    }

    setLoading(true);
    setError('');
    setFrames([]);
    setStep(2);

    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, textModel, imageModel, contentGoal, targetAudience, brief, script }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate storyboard');

      setFrames(data.frames);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePitch = async () => {
    setPitchLoading(true);
    setPitchError('');
    try {
      const response = await fetch(`${API_BASE}/api/pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, textModel, script, ...creatorInfo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate pitch');
      setPitch(data.pitch);
    } catch (err) {
      setPitchError(err.message);
    } finally {
      setPitchLoading(false);
    }
  };

  const creatorInitial = (creatorInfo.creatorName || signedInCreator.creatorName || 'R')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-mesh-pastel text-slate-800 flex flex-col font-sans relative">
      {/* Sparkle glints in background */}
      <div className="absolute top-24 left-12 text-pink-300 text-xl select-none pointer-events-none animate-pulse-subtle">✦</div>
      <div className="absolute top-48 right-16 text-purple-300 text-2xl select-none pointer-events-none animate-float">✨</div>
      <div className="absolute bottom-32 left-20 text-sky-300 text-xl select-none pointer-events-none animate-pulse-subtle">✦</div>
      <div className="absolute bottom-16 right-24 text-pink-300 text-2xl select-none pointer-events-none animate-float">✨</div>

      {/* Global Navigation Header matching homescreen.pdf */}
      <header className="glass-nav sticky top-0 z-50 px-6 md:px-12 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => (window.location.href = GATEWAY_URL)}>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl text-pink-500 font-extrabold flex items-center">
              ⚡
            </span>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              PitchPal
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200/70">
            Storyboard Studio
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href={GATEWAY_URL} className="hover:text-pink-600 transition-colors">
            Home
          </a>
          <a href={GATEWAY_URL} className="hover:text-pink-600 transition-colors">
            My Pitches
          </a>
          <button onClick={() => setStep(1)} className="text-pink-600 font-bold transition-colors">
            New Storyboard
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={GATEWAY_URL}
            className="text-xs font-bold text-slate-600 hover:text-pink-600 bg-white/80 border border-slate-200 hover:border-pink-200 px-3 py-1.5 rounded-full transition-all shadow-xs"
          >
            ← Gateway Dashboard
          </a>

          {/* User Avatar Circle */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-fuchsia-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-pink-500/20 border-2 border-white">
            {creatorInitial}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-8 flex flex-col gap-8 flex-1 w-full z-10">
        {/* Hero Tagline */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-pink-200/80 bg-white/90 shadow-xs text-xs font-semibold text-pink-600">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />
            <span>AI-Powered Visual Storyboarding</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            From Brief to Shootable Storyboard
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl">
            Break your campaign idea into an illustrated shot-by-shot storyboard with matching pitch outreach.
          </p>

          {signedInCreator.creatorName && (
            <div className="mt-1 inline-flex items-center gap-2 text-xs bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-full pl-3 pr-2 py-1 shadow-xs">
              <span className="text-slate-400 font-medium">Logged in as</span>
              <span className="font-bold text-slate-800">{signedInCreator.creatorName}</span>
              {signedInCreator.handle && <span className="text-pink-600 font-semibold">@{signedInCreator.handle}</span>}
              <button
                type="button"
                onClick={() => {
                  signOutCreator();
                  window.location.href = GATEWAY_URL;
                }}
                className="text-slate-400 hover:text-rose-600 font-semibold text-[11px] px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Stepper */}
        <Stepper current={step} />

        {/* STEP 1: BRIEF */}
        {step === 1 && (
          <div className="space-y-6">
            <TemplateGallery onSelect={applyTemplate} selectedId={selectedTemplateId} />

            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Define Your Creative Brief</h2>
                <p className="text-xs text-slate-500 mt-0.5">Customize your goal, audience, and step-by-step script</p>
              </div>

              <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Content Goal</label>
                    <select
                      value={contentGoal}
                      onChange={(e) => setContentGoal(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-pink-500 bg-white font-medium text-slate-800"
                    >
                      <option value="Brand promotion">Brand promotion</option>
                      <option value="Product review">Product review</option>
                      <option value="Educational Reel">Educational Reel</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Personal/Lifestyle">Personal / lifestyle content</option>
                      <option value="Trend-based content">Trend-based content</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Target Audience</label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Gen Z beauty lovers, busy commuters, skincare beginners"
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-pink-500 bg-white font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Brief / Campaign Requirements</label>
                  <textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Paste the creative brief, key talking points, or requirements here…"
                    className="w-full border border-slate-200 rounded-xl p-3 h-24 text-sm outline-none focus:ring-2 focus:ring-pink-500 resize-none bg-white font-medium text-slate-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Script / Step-by-Step Actions <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">Audio & Visual cues</span>
                  </div>
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Describe each scene, action, hook, and dialogue step-by-step…"
                    className="w-full border border-slate-200 rounded-xl p-3 h-32 text-sm outline-none focus:ring-2 focus:ring-pink-500 resize-none bg-white font-medium text-slate-800"
                  />
                </div>

                {/* Advanced Settings Drawer */}
                <div className="border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-pink-600 transition-colors"
                  >
                    {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    Advanced Model Settings
                  </button>

                  {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          API Key <span className="text-slate-400 font-normal">(optional, server defaults to root .env)</span>
                        </label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="AIzaSy... / leave blank for server default"
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Text Model</label>
                        <select
                          value={textModel}
                          onChange={(e) => setTextModel(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        >
                          <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Image Model</label>
                        <select
                          value={imageModel}
                          onChange={(e) => setImageModel(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        >
                          <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
                          <option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 text-sm font-medium">
                    ⚠️ {error}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading || !script}
                    className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 disabled:opacity-50 text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-lg shadow-pink-500/25 active:scale-95 flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{loading ? 'Generating Storyboard…' : 'Generate Visual Storyboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STEP 2: STORYBOARD VIEW */}
        {step === 2 && (
          <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Your Storyboard</h2>
                <p className="text-sm text-slate-500">Visual shot breakdown generated from your script</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-600 hover:text-pink-600 flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Brief
              </button>
            </div>

            {loading && (
              <div className="flex flex-col gap-6 py-6">
                <div className="flex items-center justify-center gap-2.5 text-sm font-bold text-pink-600 bg-pink-50/70 py-3 px-4 rounded-2xl border border-pink-200/60 max-w-md mx-auto">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{LOADING_MESSAGES[loadingMessageIndex]}</span>
                </div>
                {[0, 1, 2, 3].map((i) => (
                  <FrameSkeleton key={i} index={i} />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col gap-4 items-center text-center py-8">
                <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 text-sm max-w-md">
                  {error}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-full text-xs transition-colors"
                >
                  ← Return to Brief
                </button>
              </div>
            )}

            {!loading && !error && frames.length > 0 && (
              <div className="space-y-6">
                {frames.map((frame, idx) => (
                  <FrameCard key={idx} frame={frame} index={idx} />
                ))}
              </div>
            )}

            {!loading && !error && frames.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
                >
                  ← Edit Script
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-lg shadow-pink-500/25 active:scale-95 flex items-center gap-2 text-sm"
                >
                  <span>Approve & Continue to Pitch</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SEND PITCH */}
        {step === 3 && (
          <div className="space-y-4">
            <PitchPanel
              creatorInfo={creatorInfo}
              onCreatorInfoChange={setCreatorInfo}
              script={script}
              pitch={pitch}
              loading={pitchLoading}
              error={pitchError}
              onGenerate={handleGeneratePitch}
            />
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-500 hover:text-pink-600 flex items-center gap-1 px-4 py-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Storyboard
              </button>
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-slate-400 pt-4 pb-8 flex items-center justify-center gap-2">
          <span>⚡ PitchPal Creative Suite</span>
          <span>•</span>
          <span>AI-Powered Storyboard & Influencer Outreach</span>
        </footer>
      </main>
    </div>
  );
}

export default App;

