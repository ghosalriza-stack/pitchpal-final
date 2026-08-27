import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, ChevronRight, CheckCircle, Copy, Edit2, Loader2, Play, Download, Mail, Phone, Lock, User, LogOut, ArrowRight, Sparkles, Zap, Laptop } from 'lucide-react';
import { jsPDF } from 'jspdf';

import logoImg from './assets/logo.png';
import profileGradientImg from './assets/profile_gradient.png';
import starPinkImg from './assets/star_pink.png';
import starBlueImg from './assets/star_blue.png';

const API_BASE_URL = 'http://localhost:5006/api';

const AutoResizeTextarea = ({ value, onChange, className }) => {
  const textareaRef = React.useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  React.useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={className}
      value={value}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      rows={1}
    />
  );
};

const countries = [
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' }
];

const FrameImage = ({ promptText, imageModel, redrawTrigger, index }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

  const fetchImage = async () => {
    setLoading(true);
    setError(false);
    setImgUrl('');
    
    const seed = Math.floor(Math.random() * 1000000);
    const finalPrompt = "Detailed black and white comic manga storyboard sketch of this scene: " + promptText + ". highly visible dark thin pen ink lines. NO colors. NO shading. white background. cleanly drawn lineart of characters.";

    if (imageModel === 'pollinations') {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=500&nologo=true&seed=${seed}`;
      setImgUrl(url);
      // Note: we let the <img> onLoad and onError handlers toggle loading to false
      return;
    }

    // Google Imagen goes through the backend proxy
    const url = `${API_BASE_URL.replace('/api', '')}/api/image?prompt=${encodeURIComponent(promptText)}&imageModel=${imageModel}&seed=${seed}`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('image/svg+xml')) {
          console.warn("Backend returned SVG placeholder. Falling back to Pollinations AI client-side.");
          const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=500&nologo=true&seed=${seed}`;
          setImgUrl(fallbackUrl);
        } else {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setImgUrl(objectUrl);
        }
      } else {
        console.warn("Backend image generation failed. Falling back to Pollinations AI client-side.");
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=500&nologo=true&seed=${seed}`;
        setImgUrl(fallbackUrl);
      }
    } catch (err) {
      console.error("Backend fetch error, falling back to Pollinations AI client-side:", err);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=500&nologo=true&seed=${seed}`;
      setImgUrl(fallbackUrl);
    }
  };

  React.useEffect(() => {
    fetchImage();
  }, [promptText, imageModel, redrawTrigger]);

  return (
    <div className="relative group w-full flex flex-col items-center justify-center p-2 min-h-[220px]">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 space-y-2">
          <Loader2 className="animate-spin w-6 h-6 text-[#db1888]" />
          <span className="text-xs text-slate-400 font-medium">Drawing frame...</span>
        </div>
      )}
      
      {error ? (
        <div className="p-3 text-center text-xs text-red-550 border border-red-200 bg-red-50 rounded flex flex-col items-center gap-2">
          <span>Failed to load sketch.</span>
          <button onClick={fetchImage} className="bg-red-600 hover:bg-red-750 text-white text-[10px] px-2.5 py-1 rounded transition-colors font-semibold">
            Retry
          </button>
        </div>
      ) : imgUrl ? (
        <div className="w-full flex flex-col items-center">
          <img 
            src={imgUrl} 
            alt="Frame scene" 
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            className="max-h-[220px] w-full object-contain rounded border border-gray-150"
          />
          <div className="flex gap-2 items-center mt-2 w-full justify-between">
            <small className="text-[10px] text-slate-455 italic block truncate max-w-[80%]">
              "{promptText}"
            </small>
            <button 
              onClick={fetchImage}
              className="text-[10px] text-[#db1888] hover:text-[#be185d] font-bold flex items-center gap-0.5 shrink-0"
              title="Redraw this frame"
            >
              🔄 Redraw
            </button>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-400 py-10 flex flex-col items-center gap-2">
          <span>No image generated yet.</span>
          <button onClick={fetchImage} className="text-white text-xs px-4 py-1.5 rounded-xl font-semibold hover:scale-105 active:scale-95 transition-transform" style={primaryButtonStyle}>
            Generate Frame
          </button>
        </div>
      )}
    </div>
  );
};

const primaryButtonStyle = {
  background: 'radial-gradient(circle at bottom left, #F65C43 0%, #DB1888 100%)'
};

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('pitchpal_user');
      return savedUser ? JSON.parse(savedUser) : { name: 'PitchPal Creator', instagramId: 'creator' };
    } catch {
      return { name: 'PitchPal Creator', instagramId: 'creator' };
    }
  });

  const [step, setStep] = useState('welcome');

  const [isLoading, setIsLoading] = useState(false);

  // User Authentication & Onboarding State
  const [selectedEmail, setSelectedEmail] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [onboardingData, setOnboardingData] = useState({ name: '', instagramId: '' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ name: 'United States', code: '+1', flag: '🇺🇸' });
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Pitches list loaded from localStorage or seeded with mockup data
  const [pitches, setPitches] = useState(() => {
    try {
      const savedPitches = localStorage.getItem('pitchpal_pitches');
      if (savedPitches) return JSON.parse(savedPitches);
    } catch (e) {
      console.error("Error reading pitches from localStorage:", e);
    }
    return [
      {
        id: 'mock-1',
        brand: 'Rare Beauty',
        date: 'Aug 15',
        objective: 'Promote Liquid Blush launch targeting Gen Z',
        status: '👀 OPENED',
        scripts: {
          bestMatch: {
            hook: "Visual: Swipe-applying liquid blush on cheek.\nAudio: 'If you are still using powder blush, stop right now.'",
            setup: "Pain: Liquid blushes are normally patchy.\nBenefit: This one blends in 3 seconds flat.",
            content: "Visual: Blending it seamlessly with a brush.\nVO: 'Look at that pigmented, dewy finish.'",
            cta: "Visual: Smiling at the camera, holding the blush bottle.\nVO: 'Link in bio to try it out!'"
          }
        }
      },
      {
        id: 'mock-2',
        brand: 'The Ordinary',
        date: 'Jul 30',
        objective: 'Educate on Salicylic Acid 2% Serum benefits',
        status: '✅ REPLIED',
        scripts: {
          bestMatch: {
            hook: "Visual: Close up of glass serum dropper.\nAudio: 'The one skincare step you cannot skip.'",
            setup: "Pain: Clogged pores and breakouts.\nBenefit: Clear skin in under a week.",
            content: "Visual: Gently applying serum.\nVO: 'Apply 3 drops at night to clean skin.'",
            cta: "Visual: Holding serum bottle.\nVO: 'Save this for your next skincare run!'"
          }
        }
      },
      {
        id: 'mock-3',
        brand: 'Fenty Beauty',
        date: 'Jul 22',
        objective: 'Showcase Shade Match for Eaze Drop Tint',
        status: '😶 NO REPLY',
        scripts: {
          bestMatch: {
            hook: "Visual: Swatching shades side-by-side.\nAudio: 'Is this the best skin tint of 2026?'",
            setup: "Pain: Foundation feels too heavy.\nBenefit: Light, natural blurring skin tint.",
            content: "Visual: Applying half face to show comparison.\nVO: 'It looks exactly like skin, but filtered.'",
            cta: "Visual: Winking.\nVO: 'Drop your shade in the comments!'"
          }
        }
      }
    ];
  });

  const [viewingPitch, setViewingPitch] = useState(null);

  // Step 1 State
  const [briefText, setBriefText] = useState('');
  const [canvaLink, setCanvaLink] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Step 2 State
  const [analysis, setAnalysis] = useState({ objective: '', audience: '', coreIdea: '' });

  // Step 3 State
  const [scripts, setScripts] = useState(null);
  const [selectedScriptType, setSelectedScriptType] = useState('bestMatch'); // simple, bestMatch, boldMove
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Storyboard (Step 4) State
  const [storyboardFrames, setStoryboardFrames] = useState(null);
  const [isStoryboardLoading, setIsStoryboardLoading] = useState(false);
  const [storyboardError, setStoryboardError] = useState('');
  const [imageModel, setImageModel] = useState('google-imagen'); // google-imagen, pollinations
  const [redrawTrigger, setRedrawTrigger] = useState(0);
  const dropdownRef = React.useRef(null);
  const profileDropdownRef = React.useRef(null);
  const countryDropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutsideCountry = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideCountry);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideCountry);
    };
  }, []);

  React.useEffect(() => {
    const handleClickOutsideProfile = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideProfile);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideProfile);
    };
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem('pitchpal_pitches', JSON.stringify(pitches));
    } catch (e) {
      console.error("Failed to save pitches to localStorage:", e);
    }
  }, [pitches]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (briefText) formData.append('text', briefText);
      if (canvaLink) formData.append('canvaLink', canvaLink);
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysis(response.data);
      setStep(2);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze brief. Ensure the backend is running and you have internet access.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, {
        ...analysis,
        creatorName: user?.name,
        instagramId: user?.instagramId
      });
      setScripts(response.data);
      
      // Append the new pitch to our pitches list
      const newPitch = {
        id: `pitch-${Date.now()}`,
        brand: analysis.brandName || "New Pitch",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        objective: analysis.objective || "Brand outreach campaign",
        status: '😶 NO REPLY',
        scripts: response.data
      };
      
      setPitches(prev => [newPitch, ...prev]);
      setStep(3);
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate scripts.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    if (!scripts || !scripts[selectedScriptType]) {
      alert("No script selected.");
      return;
    }
    
    setIsStoryboardLoading(true);
    setStoryboardError('');
    setStep(4);
    
    const s = scripts[selectedScriptType];
    const fullScript = `[Hook] ${s.hook}\n[Setup] ${s.setup}\n[Content] ${s.content}\n[CTA] ${s.cta}`;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/storyboard`, {
        contentGoal: analysis.objective,
        targetAudience: analysis.audience,
        brief: analysis.coreIdea,
        script: fullScript
      });
      setStoryboardFrames(response.data.frames);
    } catch (error) {
      console.error("Storyboard generation failed", error);
      setStoryboardError(error.response?.data?.error || "Failed to generate storyboard.");
    } finally {
      setIsStoryboardLoading(false);
    }
  };

  const handleBulkRegenerate = () => {
    setRedrawTrigger(prev => prev + 1);
  };

  const handleCopyScript = () => {
    const s = scripts[selectedScriptType];
    const textToCopy = `HOOK (0-3s):\n${s.hook}\n\nSETUP (3-15s):\n${s.setup}\n\nCONTENT (15-45s):\n${s.content}\n\nCTA (3-5s):\n${s.cta}`;
    navigator.clipboard.writeText(textToCopy);
    alert("Script copied to clipboard!");
  };

  const handleDownloadPDF = () => {
    const s = scripts[selectedScriptType];
    const doc = new jsPDF();
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("AI Generated Script", 20, 20);
    
    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105); // slate-600
    const readableType = selectedScriptType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    doc.text(`Variation: ${readableType}`, 20, 30);
    
    // Line Divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, 35, 190, 35);
    
    let yOffset = 48;
    const sections = [
      { label: "HOOK (0-3s)", text: s.hook },
      { label: "SETUP (3-15s)", text: s.setup },
      { label: "VALUE/CONTENT (15-45s)", text: s.content },
      { label: "CTA (Final 3-5s)", text: s.cta }
    ];
    
    sections.forEach(section => {
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
      
      // Section title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(219, 24, 136); // brand pink #db1888
      doc.text(section.label, 20, yOffset);
      yOffset += 8;
      
      // Section text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59); // slate-800
      
      const lines = doc.splitTextToSize(section.text, 170);
      lines.forEach(line => {
        if (yOffset > 280) {
          doc.addPage();
          yOffset = 20;
        }
        doc.text(line, 20, yOffset);
        yOffset += 6;
      });
      
      yOffset += 10;
    });
    
    doc.save(`script-${selectedScriptType}.pdf`);
  };

  const handleDownloadDoc = () => {
    const s = scripts[selectedScriptType];
    const scriptTitle = `Script - ${selectedScriptType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`;
    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${scriptTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; padding: 20px; }
          h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 24px; }
          h2 { color: #4f46e5; margin-top: 24px; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
          p { margin-bottom: 12px; font-size: 14px; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${scriptTitle}</h1>
        
        <h2>HOOK (0-3s)</h2>
        <p>${s.hook.replace(/\n/g, '<br/>')}</p>
        
        <h2>SETUP (3-15s)</h2>
        <p>${s.setup.replace(/\n/g, '<br/>')}</p>
        
        <h2>VALUE/CONTENT (15-45s)</h2>
        <p>${s.content.replace(/\n/g, '<br/>')}</p>
        
        <h2>CTA (Final 3-5s)</h2>
        <p>${s.cta.replace(/\n/g, '<br/>')}</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + docContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${selectedScriptType}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalPitchesCount = pitches.length;
  const openedPitchesCount = pitches.filter(p => p.status === '👀 OPENED' || p.status === '✅ REPLIED').length;
  const responsesReceivedCount = pitches.filter(p => p.status === '✅ REPLIED').length;
  const responseRatePct = totalPitchesCount > 0 ? Math.round((responsesReceivedCount / totalPitchesCount) * 100) : 0;

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans relative overflow-x-hidden" style={{ background: 'linear-gradient(90deg, #FCE5E6 0%, #FCE5E6 35%, #DDEEF8 75%, #DDEEF8 100%)' }}>
      {/* Decorative Background Stars */}
      <img 
        src={starPinkImg} 
        alt="Pink star" 
        className="absolute left-[4%] top-[20%] w-14 md:w-20 aspect-square object-contain pointer-events-none select-none z-0 opacity-80" 
      />
      <img 
        src={starBlueImg} 
        alt="Blue star" 
        className="absolute right-[4%] top-[40%] w-14 md:w-20 aspect-square object-contain pointer-events-none select-none z-0 opacity-80" 
      />

      {/* Global Navigation Header */}
      <header className="bg-white/30 backdrop-blur-md border-b border-white/50 text-slate-800 px-12 py-5 flex items-center justify-between shrink-0 rounded-b-3xl relative z-10">
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={() => user && setStep('welcome')}
        >
          <img src={logoImg} alt="PitchPal" className="h-9 object-contain" />
        </div>

        {user && !['login', 'phone_input', 'otp_input', 'onboarding'].includes(step) ? (
          <div className="flex items-center gap-8">
            <nav className="flex items-center gap-10 text-sm font-semibold text-slate-500">
              <button 
                onClick={() => setStep('welcome')} 
                className={`transition-colors pb-1 ${step === 'welcome' ? 'text-[#db1888] border-b-2 border-[#db1888]' : 'hover:text-[#db1888]'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setStep('welcome')} 
                className="hover:text-[#db1888] transition-colors pb-1"
              >
                My Pitches
              </button>
              <button 
                onClick={() => {
                  setStep(1);
                  setBriefText('');
                  setCanvaLink('');
                  setSelectedFiles([]);
                  setScripts(null);
                }} 
                className={`transition-colors pb-1 ${[1, 2, 3, 4].includes(step) ? 'text-[#db1888] border-b-2 border-[#db1888]' : 'hover:text-[#db1888]'}`}
              >
                New Pitch
              </button>
            </nav>

            {/* Profile Avatar */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full text-white font-extrabold flex items-center justify-center text-base border border-white/60 hover:scale-105 active:scale-95 transition-transform"
                style={{ backgroundImage: `url(${profileGradientImg})`, backgroundSize: 'cover' }}
              >
                {user?.name ? user.name[0].toUpperCase() : 'R'}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl py-2 z-50 text-slate-800">
                  <div className="px-4 py-2.5 border-b border-gray-150">
                    <p className="font-semibold text-sm text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">@{user?.instagramId}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setUser({ name: 'PitchPal Creator', instagramId: 'creator' });
                      try {
                        localStorage.removeItem('pitchpal_user');
                      } catch (e) {
                        console.error(e);
                      }
                      setStep('welcome');
                      setIsProfileOpen(false);
                      setPhoneInput('');
                      setSelectedEmail('');
                      setOtpInput(['','','','']);
                      setOnboardingData({ name: '', instagramId: '' });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium mt-1 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3.5 py-2 border border-gray-200 rounded-full">
            Outreach Portal
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto relative z-10">
        {/* LOGIN OPTIONS SCREEN */}
        {step === 'login' && (
          <div className="max-w-md w-full bg-white/85 backdrop-blur-md border border-gray-200/50 rounded-3xl p-8 text-center space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="space-y-4">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-200/60 bg-white/80 text-xs font-semibold text-slate-750">
                <Sparkles className="w-3.5 h-3.5 text-[#db1888] fill-pink-500/10" />
                <span>AI - powered influencer outreach</span>
              </div>
              
              {/* Headline */}
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-855 leading-tight">
                Pitch to any brand <br/> in 10 minutes
              </h2>
              
              {/* Tagline */}
              <p className="text-slate-600 text-sm">
                Ready to pitch your next dream brand?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full py-3.5 px-4 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-[0.98]"
                style={primaryButtonStyle}
              >
                <Mail className="w-5 h-5" />
                <span>Login with Email</span>
              </button>
              
              <button
                onClick={() => setStep('phone_input')}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-gray-200 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <Phone className="w-5 h-5" />
                <span>Login with Phone Number</span>
              </button>
            </div>
          </div>
        )}

        {/* PHONE NUMBER INPUT SCREEN */}
        {step === 'phone_input' && (
          <div className="max-w-md w-full bg-white/85 backdrop-blur-md border border-gray-200/50 rounded-3xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Login with Phone</h2>
              <p className="text-slate-600 text-sm">Enter your phone number to receive a verification OTP code.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="flex gap-2">
                  {/* Country Selector Dropdown */}
                  <div className="relative shrink-0" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="h-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-slate-800 flex items-center gap-1.5 focus:outline-none focus:border-[#db1888] transition-colors"
                    >
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span className="font-semibold text-sm">{selectedCountry.code}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    {isCountryDropdownOpen && (
                      <div className="absolute left-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-xl py-1.5 z-50 max-h-60 overflow-y-auto">
                        {countries.map((c) => (
                          <button
                            key={c.name + c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsCountryDropdownOpen(false);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-100 transition-colors flex items-center gap-3"
                          >
                            <span className="text-lg">{c.flag}</span>
                            <span className="font-semibold text-sm text-slate-800 shrink-0">{c.code}</span>
                            <span className="text-xs text-slate-500 truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Phone input */}
                  <input
                    type="tel"
                    placeholder={selectedCountry.code === '+1' ? '(555) 000-0000' : 'Enter number'}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-[#db1888] transition-colors"
                  />
                </div>
              </div>

              <button
                disabled={!phoneInput}
                onClick={() => setStep('otp_input')}
                className="w-full py-3.5 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                style={primaryButtonStyle}
              >
                <span>Send OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => { setStep('login'); setPhoneInput(''); }}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors text-center block"
              >
                Back to login options
              </button>
            </div>
          </div>
        )}

        {/* OTP VERIFICATION SCREEN */}
        {step === 'otp_input' && (
          <div className="max-w-md w-full bg-white/85 backdrop-blur-md border border-gray-200/50 rounded-3xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Enter Verification Code</h2>
              <p className="text-slate-600 text-sm">We've sent a 4-digit verification code to <span className="text-slate-800 font-semibold">{selectedCountry.code} {phoneInput}</span>.</p>
            </div>

            <div className="bg-slate-50 border border-dashed border-gray-200 p-4 rounded-xl text-center space-y-1">
              <p className="text-xs text-slate-500 font-semibold tracking-wider">DEMO VERIFICATION CODE</p>
              <p className="text-xl font-bold text-[#db1888] tracking-widest">4821</p>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between gap-3 max-w-[240px] mx-auto">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={otpInput[idx] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[0-9]$/.test(val) || val === '') {
                        const newOtp = [...otpInput];
                        newOtp[idx] = val;
                        setOtpInput(newOtp);
                        setOtpError('');
                        // Auto-focus next input
                        if (val !== '' && idx < 3) {
                          const nextInput = document.getElementById(`otp-input-${idx + 1}`);
                          if (nextInput) nextInput.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && otpInput[idx] === '' && idx > 0) {
                        const prevInput = document.getElementById(`otp-input-${idx - 1}`);
                        if (prevInput) {
                          prevInput.focus();
                          const newOtp = [...otpInput];
                          newOtp[idx - 1] = '';
                          setOtpInput(newOtp);
                        }
                      }
                    }}
                    className="w-12 h-14 bg-white border border-gray-200 rounded-xl text-center text-xl font-bold text-slate-800 focus:outline-none focus:border-[#db1888] transition-colors"
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-red-600 text-xs text-center font-semibold">{otpError}</p>
              )}

              <button
                onClick={() => {
                  const code = otpInput.join('');
                  if (code === '4821') {
                    setStep('onboarding');
                  } else {
                    setOtpError('Invalid code. Please enter the demo code 4821.');
                  }
                }}
                className="w-full py-3.5 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={primaryButtonStyle}
              >
                Verify & Proceed
              </button>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <button 
                  onClick={() => { setStep('phone_input'); setOtpInput(['','','','']); setOtpError(''); }} 
                  className="hover:text-slate-800 transition-colors"
                >
                  Change phone number
                </button>
                <button 
                  onClick={() => { alert('Mock OTP code reset!'); setOtpInput(['','','','']); setOtpError(''); }} 
                  className="hover:text-[#db1888] text-[#db1888] transition-colors"
                >
                  Resend Code
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ONBOARDING PROFILE DETAILS SCREEN */}
        {step === 'onboarding' && (
          <div className="max-w-md w-full bg-white/85 backdrop-blur-md border border-gray-200/50 rounded-3xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Create Your Profile</h2>
              <p className="text-slate-600 text-sm">Tell us a bit about yourself to customize your outreach campaigns.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Riza Ghosal"
                    value={onboardingData.name}
                    onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-[#db1888] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Instagram Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                  <input
                    type="text"
                    placeholder="e.g. Septumringvali"
                    value={onboardingData.instagramId}
                    onChange={(e) => setOnboardingData({ ...onboardingData, instagramId: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-[#db1888] transition-colors"
                  />
                </div>
              </div>

              <button
                disabled={!onboardingData.name || !onboardingData.instagramId}
                onClick={() => {
                  const newUser = {
                    name: onboardingData.name,
                    instagramId: onboardingData.instagramId,
                    email: selectedEmail,
                    phone: phoneInput
                  };
                  setUser(newUser);
                  try {
                    localStorage.setItem('pitchpal_user', JSON.stringify(newUser));
                  } catch (e) {
                    console.error("Failed to save user to localStorage:", e);
                  }
                  setStep('welcome');
                }}
                className="w-full py-3.5 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                style={primaryButtonStyle}
              >
                <span>Complete Onboarding &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* WELCOME DASHBOARD SCREEN */}
        {step === 'welcome' && (
          <div className="max-w-4xl w-full flex flex-col gap-8 animate-in fade-in zoom-in duration-300 my-auto text-slate-800">
            {/* Tagline Card */}
            <div className="text-center space-y-6 py-6">
              <div className="space-y-4">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-200/60 bg-white/70 text-xs font-semibold text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-[#db1888] fill-pink-500/10" />
                  <span>AI - powered influencer outreach</span>
                </div>
                
                {/* Headline */}
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Pitch to any brand in 10 minutes
                </h2>
                
                {/* Tagline */}
                <p className="text-slate-600 text-lg">
                  Ready to pitch your next dream brand, <span className="font-bold text-[#db1888]">@{user?.instagramId || 'rizzzz'}</span>?
                </p>
              </div>

              <div className="pt-2 max-w-xs mx-auto">
                <button
                  onClick={() => {
                    setStep(1);
                    setBriefText('');
                    setCanvaLink('');
                    setSelectedFiles([]);
                    setScripts(null);
                  }}
                  className="px-8 py-3.5 text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-transform text-base flex items-center justify-center gap-2 mx-auto"
                  style={primaryButtonStyle}
                >
                  <span>Pitch a New Brand</span>
                </button>
              </div>
            </div>

            {/* Bottom Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Recent Pitches Widget */}
              <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 flex flex-col space-y-6">
                <div className="text-center">
                  <h3 className="font-bold text-slate-800 text-lg uppercase tracking-wider">Recent Pitches</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 font-semibold">Brand</th>
                        <th className="py-3 font-semibold">Date</th>
                        <th className="py-3 font-semibold">Status</th>
                        <th className="py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150/20 text-slate-700 font-semibold">
                      {pitches.map((pitch) => {
                        const rawStatus = pitch.status.replace(/[^\w\s]/g, '').trim();
                        let statusColor = "bg-gray-100 text-gray-700 border-gray-200/50";
                        if (rawStatus === "REPLIED") statusColor = "bg-[#e8fbf0] text-[#16a34a] border-[#bbf7d0]/60";
                        else if (rawStatus === "OPENED") statusColor = "bg-[#fffbeb] text-[#d97706] border-[#fef3c7]/60";
                        else if (rawStatus === "NO REPLY") statusColor = "bg-[#fff5f5] text-[#e11d48] border-[#fecaca]/60";

                        return (
                          <tr key={pitch.id} className="hover:bg-white/20 transition-colors">
                            <td className="py-4 font-bold text-slate-900">{pitch.brand}</td>
                            <td className="py-4 text-slate-500">{pitch.date}</td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                                {rawStatus}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => {
                                  setViewingPitch(pitch);
                                  if (pitch.status === '😶 NO REPLY') {
                                    setPitches(prev => prev.map(p => p.id === pitch.id ? { ...p, status: '😶 OPENED' } : p));
                                  }
                                }}
                                className="text-[#db1888] hover:text-[#be185d] text-sm font-bold transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pitching Stats Widget */}
              <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-bold text-slate-800 text-lg uppercase tracking-wider">Pitching Stats</h3>
                  </div>

                  <div className="space-y-4 text-sm font-semibold text-slate-600">
                    <div className="flex justify-between border-b border-gray-150/40 pb-3">
                      <span>Total Pitches Sent</span>
                      <span className="text-slate-900 font-bold">{totalPitchesCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-150/40 pb-3">
                      <span>Pitches Opened</span>
                      <span className="text-[#16a34a] font-bold">{openedPitchesCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-150/40 pb-3">
                      <span>Responses Received</span>
                      <span className="text-[#16a34a] font-bold">{responsesReceivedCount}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span>Response Rate</span>
                      <span className="text-[#db1888] font-extrabold text-base">{responseRatePct}%</span>
                    </div>
                  </div>
                </div>

                {/* Active Creator Profile Section */}
                <div className="bg-white/60 border border-white/50 rounded-2xl p-4 flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full text-white font-extrabold flex items-center justify-center text-lg"
                    style={{ backgroundImage: `url(${profileGradientImg})`, backgroundSize: 'cover' }}
                  >
                    {user?.name ? user.name[0].toUpperCase() : 'R'}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 text-base truncate">{user?.name || 'Riza Ghosal'}</p>
                    <p className="text-sm text-slate-500 truncate">@{user?.instagramId || 'rizzzz'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCRIPT GENERATOR VIEWS */}
        {(step === 1 || step === 2 || step === 3 || step === 4) && (
          <div className="max-w-4xl w-full bg-white/70 backdrop-blur-md rounded-3xl border border-white/60 overflow-hidden text-gray-800 my-auto animate-in fade-in duration-200">
            
            {/* Progress Bar */}
            <div className="flex border-b border-gray-200/50">
                {['Upload Brief', 'Review Strategy', 'Select & Edit Script', 'Storyboard'].map((title, i) => (
                    <div key={i} className={`flex-1 text-center py-4 text-sm font-semibold transition-all ${step >= i+1 ? 'text-[#db1888] border-b-2 border-[#db1888] bg-pink-50/20' : 'text-slate-400'}`}>
                        Step {i+1}: {title}
                    </div>
                ))}
            </div>

            <div className="p-8">
              {/* STEP 1: INPUT */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  <h2 className="text-2xl font-extrabold text-slate-800">Provide Your Brief</h2>
                  <p className="text-slate-500 text-sm">Upload documents, paste a Canva link, or type the brief manually.</p>
                  
                  <div className="border border-dashed border-slate-200 bg-white/80 rounded-2xl p-8 text-center hover:bg-white/90 transition-colors">
                      <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                      <label className="cursor-pointer bg-pink-55/20 text-[#db1888] border border-[#db1888]/30 px-4 py-2 rounded-xl font-semibold hover:bg-pink-50 transition-colors inline-block">
                          Browse Files
                          <input 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.doc,.docx,.txt,.md" 
                              multiple 
                              onChange={(e) => {
                                  const files = Array.from(e.target.files);
                                  setSelectedFiles(prev => [...prev, ...files]);
                              }} 
                          />
                      </label>
                      <p className="text-xs text-slate-405 mt-3">Supports PDF, Word, TXT, MD</p>
                      
                      {selectedFiles.length > 0 && (
                          <div className="mt-4 space-y-2 max-w-md mx-auto text-left">
                              {selectedFiles.map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-150">
                                      <div className="flex items-center gap-2 text-sm text-slate-700 truncate">
                                          <FileText className="w-4 h-4 text-[#db1888] shrink-0"/>
                                          <span className="truncate">{file.name}</span>
                                      </div>
                                      <button 
                                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} 
                                          className="text-slate-400 hover:text-red-500 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                                      >
                                          ✕
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Canva / Doc Link (Optional)</label>
                      <input type="text" placeholder="https://canva.com/..." className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-[#db1888] outline-none" value={canvaLink} onChange={e => setCanvaLink(e.target.value)} />
                  </div>

                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Brief Details (Optional if file uploaded)</label>
                      <textarea rows="5" placeholder="Tell us about the product, campaign goals, vibe..." className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-[#db1888] outline-none" value={briefText} onChange={e => setBriefText(e.target.value)}></textarea>
                  </div>

                  <div className="flex justify-end pt-4">
                      <button onClick={handleAnalyze} disabled={isLoading || (!briefText && !canvaLink && selectedFiles.length === 0)} className="hover:scale-105 active:scale-95 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 transition-transform" style={primaryButtonStyle}>
                          {isLoading ? <><Loader2 className="animate-spin w-5 h-5"/> Analyzing...</> : <>Analyze Brief <ChevronRight className="w-5 h-5"/></>}
                      </button>
                  </div>
                </div>
              )}

              {/* STEP 2: BEFORE SCRIPT REVIEW (Screenshot 3, Card 1 style) */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold text-slate-800">Review Strategy</h2>
                    <p className="text-slate-500 text-sm">The AI extracted the following from your brief. Feel free to tweak these before generating scripts.</p>
                  </div>
                  
                  {/* Strategy inputs matching Card 1 in Screenshot 3 */}
                  <div className="bg-white/80 border border-white/50 p-6 rounded-3xl space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-slate-700 font-semibold mb-2 text-sm">Content goal:</label>
                              <input type="text" placeholder="Inputs" className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:border-[#db1888] outline-none text-sm text-slate-800" value={analysis.objective} onChange={e => setAnalysis({...analysis, objective: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-slate-700 font-semibold mb-2 text-sm">Target Audience:</label>
                              <input type="text" placeholder="Inputs" className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:border-[#db1888] outline-none text-sm text-slate-800" value={analysis.audience} onChange={e => setAnalysis({...analysis, audience: e.target.value})} />
                          </div>
                      </div>
                      <div>
                          <label className="block text-slate-700 font-semibold mb-2 text-sm">The Brief/Requirements</label>
                          <textarea rows="4" placeholder="The Brief/Requirements" className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:border-[#db1888] outline-none text-sm text-slate-800" value={analysis.coreIdea} onChange={e => setAnalysis({...analysis, coreIdea: e.target.value})}></textarea>
                      </div>
                  </div>

                  <div className="flex justify-between pt-4">
                      <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2">Back</button>
                      <button onClick={handleGenerate} disabled={isLoading} className="hover:scale-105 active:scale-95 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 transition-transform" style={primaryButtonStyle}>
                          {isLoading ? <><Loader2 className="animate-spin w-5 h-5"/> Generating...</> : <>Generate Scripts <ChevronRight className="w-5 h-5"/></>}
                      </button>
                  </div>
                </div>
              )}

              {/* STEP 3 & 4 COMBINED: SELECTION & EDITOR */}
              {step === 3 && scripts && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Your Generated Scripts</h2>
                        <p className="text-slate-550 text-sm">Select a variation and edit the text directly.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={handleCopyScript} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-semibold text-sm">
                          <Copy className="w-4 h-4"/> Copy Full Script
                      </button>
                      <div className="relative" ref={dropdownRef}>
                        <button 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-2 bg-[#db1888] text-white px-4 py-2 rounded-xl hover:bg-[#be185d] font-semibold text-sm"
                        >
                            <Download className="w-4 h-4"/> Download Script
                        </button>
                        {isDropdownOpen && (
                          <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl z-50 py-1">
                            <button 
                              onClick={() => {
                                handleDownloadPDF();
                                setIsDropdownOpen(false);
                              }} 
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                                Download PDF
                            </button>
                            <button 
                              onClick={() => {
                                handleDownloadDoc();
                                setIsDropdownOpen(false);
                              }} 
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100"
                            >
                                Download Word (.doc)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Script Type Selector */}
                  <div className="flex gap-4 mb-6 bg-slate-100 p-1.5 rounded-xl">
                      {[
                          {id: 'simple', label: 'Simple & Safe'},
                          {id: 'bestMatch', label: 'Best Match'},
                          {id: 'boldMove', label: 'Bold Move'}
                      ].map(type => (
                          <button 
                              key={type.id}
                              onClick={() => setSelectedScriptType(type.id)}
                              className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${selectedScriptType === type.id ? 'bg-white text-[#db1888]' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                              {type.label}
                          </button>
                      ))}
                  </div>

                  {/* Layout styled matching Screenshot 3, Card 2 */}
                  <div className="bg-white/80 border border-white/50 p-6 rounded-3xl space-y-6">
                      <div>
                          <label className="block text-slate-700 font-semibold mb-2 text-sm">The Brief/Requirements</label>
                          <input 
                              type="text" 
                              className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:border-[#db1888] outline-none text-sm text-slate-800" 
                              value={analysis.coreIdea} 
                              onChange={e => setAnalysis({...analysis, coreIdea: e.target.value})} 
                          />
                      </div>
                      
                      {/* Active split script section editor */}
                      <div className="space-y-4 pt-2">
                          <label className="block text-slate-700 font-bold text-sm">Script Sections</label>
                          {[
                              {key: 'hook', label: 'Hook (0-3s)', desc: 'Impactful, scroll-stopping, addresses audience'},
                              {key: 'setup', label: 'Setup (3-15s)', desc: 'Pain points, viewer benefits'},
                              {key: 'content', label: 'Value/Content (15-45s)', desc: 'Fast tips, product demo'},
                              {key: 'cta', label: 'CTA (Final 3-5s)', desc: 'Follow, comment, share'}
                          ].map(section => (
                              <div key={section.key} className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-[#db1888] transition-all">
                                  <div className="bg-slate-50/50 px-4 py-2 border-b flex justify-between items-center">
                                      <div>
                                        <h3 className="font-bold text-slate-750 text-xs flex items-center gap-2">
                                            {section.label} <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                        </h3>
                                        <p className="text-[10px] text-slate-450">{section.desc}</p>
                                      </div>
                                  </div>
                                  <AutoResizeTextarea 
                                      className="w-full p-4 outline-none resize-none overflow-hidden min-h-[90px] text-slate-700 text-sm font-medium" 
                                      value={scripts[selectedScriptType][section.key]} 
                                      onChange={e => {
                                          const newScripts = {...scripts};
                                          newScripts[selectedScriptType][section.key] = e.target.value;
                                          setScripts(newScripts);
                                      }}
                                  />
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="pt-6 flex justify-between">
                      <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2">Back to Strategy</button>
                      <button onClick={handleGenerateStoryboard} className="hover:scale-105 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl transition-transform flex items-center gap-2" style={primaryButtonStyle}>
                          Approve & Create Storyboard <ArrowRight className="w-4 h-4"/>
                      </button>
                  </div>

                </div>
              )}

              {/* STEP 4: STORYBOARD VIEW */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200/50 pb-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Your Storyboard</h2>
                      <p className="text-slate-500 text-sm">Visualizing the script structure with generated line art sketches.</p>
                    </div>
                    {storyboardFrames && (
                      <button 
                        onClick={handleBulkRegenerate}
                        className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 border border-slate-250 rounded-xl text-sm transition-all flex items-center gap-1.5 active:scale-[0.98]"
                      >
                        🔄 Redraw All Frames
                      </button>
                    )}
                  </div>

                  {/* Image Generation Model Config */}
                  <div className="bg-white/80 border border-slate-200/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-slate-800">Image Generation Model</h4>
                      <p className="text-xs text-slate-500">Choose between Google Imagen 3 (fast, high quality) and Pollinations AI (free backup).</p>
                    </div>
                    <div className="w-full md:w-64">
                      <select 
                        value={imageModel} 
                        onChange={(e) => setImageModel(e.target.value)} 
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:border-[#db1888] outline-none font-semibold text-slate-700"
                      >
                        <option value="google-imagen">Google AI Studio Imagen 3</option>
                        <option value="pollinations">Pollinations AI (Free)</option>
                      </select>
                    </div>
                  </div>

                  {/* Storyboard Rendering matching Screenshot 2 */}
                  {isStoryboardLoading ? (
                    <div className="py-16 text-center space-y-4">
                      <Loader2 className="animate-spin w-10 h-10 mx-auto text-[#db1888]" />
                      <h3 className="text-lg font-bold text-slate-800">⏳ Sketching your storyboard... Please wait...</h3>
                    </div>
                  ) : storyboardError ? (
                    <div className="bg-red-50/50 border border-red-150 p-6 rounded-2xl text-center space-y-3">
                      <p className="text-red-700 font-medium">⚠️ {storyboardError}</p>
                      <button onClick={handleGenerateStoryboard} className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                        Retry Storyboard Generation
                      </button>
                    </div>
                  ) : storyboardFrames ? (
                    <div className="space-y-8">
                      {storyboardFrames.map((frame, index) => {
                        const sectionLabels = ["Hook", "Setup", "Content", "CTA"];
                        const labelType = sectionLabels[index] || "Scene";

                        return (
                          <div key={index} className="flex flex-col md:flex-row gap-6 items-stretch">
                            
                            {/* Left Column: Script details (ACTION & VOICEOVER cards) */}
                            <div className="flex-1 flex flex-col space-y-4">
                              <div className="font-extrabold text-slate-800 uppercase text-xs tracking-wider">
                                SCENE {index + 1}
                              </div>
                              
                              {/* ACTION sub-card with gradient */}
                              <div className="bg-gradient-to-r from-blue-50/70 to-white border border-blue-100/80 rounded-2xl p-5 flex flex-col">
                                <div className="font-bold text-slate-400 uppercase text-[9px] tracking-widest mb-1.5">
                                  ACTION
                                </div>
                                <p className="text-slate-805 text-sm font-medium leading-relaxed">
                                  {frame.action}
                                </p>
                              </div>

                              {/* VOICEOVER sub-card with gradient */}
                              <div className="bg-gradient-to-r from-blue-50/70 to-white border border-blue-100/80 rounded-2xl p-5 flex flex-col">
                                <div className="font-bold text-slate-400 uppercase text-[9px] tracking-widest mb-1.5">
                                  VOICEOVER
                                </div>
                                <p className="text-slate-805 text-sm font-serif italic leading-relaxed">
                                  "{frame.voiceover}"
                                </p>
                              </div>
                            </div>
                            
                            {/* Right Column: Sketch Frame panel */}
                            <div className="w-full md:w-[350px] shrink-0 flex flex-col space-y-2 justify-between">
                              <div className="font-bold text-slate-700 text-sm">
                                Scene {index + 1}: {labelType}
                              </div>
                              
                              <div className="flex-1 border border-slate-200/80 rounded-2xl overflow-hidden bg-white p-2 flex flex-col items-center justify-center min-h-[220px] relative">
                                <FrameImage 
                                  promptText={frame.image_prompt} 
                                  imageModel={imageModel} 
                                  redrawTrigger={redrawTrigger}
                                  index={index + 1}
                                />
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200/80 rounded-2xl bg-white">
                      No storyboard generated. Please click below to generate.
                    </div>
                  )}

                  {/* Navigation Footer */}
                  <div className="pt-6 flex justify-between border-t border-gray-250/50 flex-wrap gap-4">
                    <button 
                      onClick={() => setStep(3)} 
                      disabled={isStoryboardLoading} 
                      className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2 border border-slate-250 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Back to Script Editor
                    </button>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleGenerateStoryboard} 
                        disabled={isStoryboardLoading || !storyboardFrames} 
                        className="text-[#db1888] hover:text-[#be185d] font-semibold px-4 py-2 border border-pink-200 rounded-xl hover:bg-pink-50 transition-colors"
                      >
                        Regenerate Storyboard
                      </button>
                      <button 
                        onClick={() => {
                          setStep('welcome');
                          setStoryboardFrames(null);
                          setScripts(null);
                        }} 
                        className="text-white font-semibold px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform"
                        style={primaryButtonStyle}
                      >
                        Create New Pitch
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* EMAIL SELECTOR MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-gray-100 space-y-6 text-gray-800 animate-in fade-in zoom-in duration-200">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Choose an account</h3>
              <p className="text-sm text-gray-500">to continue to PitchPal</p>
            </div>

            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {[
                { name: 'Riza Ghosal', email: 'riza.ghosal@gmail.com', avatar: 'RG', bg: 'bg-teal-600' },
                { name: 'PitchPal Creator', email: 'creator@pitchpal.ai', avatar: 'PP', bg: 'bg-[#db1888]' },
                { name: 'Collab Studio', email: 'collab@mystudio.co', avatar: 'CS', bg: 'bg-amber-600' }
              ].map((account) => (
                <button
                  key={account.email}
                  onClick={() => {
                    setSelectedEmail(account.email);
                    setIsEmailModalOpen(false);
                    setOnboardingData(prev => ({ ...prev, name: account.name }));
                    setStep('onboarding');
                  }}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-full ${account.bg} text-white font-semibold flex items-center justify-center text-sm shrink-0`}>
                    {account.avatar}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-sm text-gray-800">{account.name}</p>
                    <p className="text-xs text-gray-500 truncate">{account.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PITCH DETAILS MODAL */}
      {viewingPitch && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-gray-100 flex flex-col max-h-[85vh] text-gray-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150">
              <div>
                <span className="text-xs font-semibold text-[#db1888] bg-pink-50 px-2 py-0.5 rounded border border-pink-100/50 uppercase tracking-wider">{viewingPitch.date}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{viewingPitch.brand}</h3>
              </div>
              <button 
                onClick={() => setViewingPitch(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Campaign Objective</h4>
                <p className="text-sm text-slate-700 font-medium">{viewingPitch.objective}</p>
              </div>

              {viewingPitch.scripts && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-gray-100 pb-1">AI Generated Outreach Script</h4>
                  {Object.entries(viewingPitch.scripts).map(([varKey, script]) => {
                    const readableName = varKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={varKey} className="bg-slate-50 border border-gray-150 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[#db1888] bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100">{readableName} Script</span>
                          <button
                            onClick={() => {
                              const text = `HOOK (0-3s):\n${script.hook}\n\nSETUP (3-15s):\n${script.setup}\n\nCONTENT (15-45s):\n${script.content}\n\nCTA (3-5s):\n${script.cta}`;
                              navigator.clipboard.writeText(text);
                              alert("Script copied!");
                            }}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            Copy
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed text-slate-700">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-500 block">HOOK (0-3s):</span>
                            <p className="bg-white border border-gray-100 p-2.5 rounded-lg whitespace-pre-wrap">{script.hook}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-slate-500 block">SETUP (3-15s):</span>
                            <p className="bg-white border border-gray-100 p-2.5 rounded-lg whitespace-pre-wrap">{script.setup}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-slate-500 block">CONTENT (15-45s):</span>
                            <p className="bg-white border border-gray-100 p-2.5 rounded-lg whitespace-pre-wrap">{script.content}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-slate-500 block">CTA (3-5s):</span>
                            <p className="bg-white border border-gray-100 p-2.5 rounded-lg whitespace-pre-wrap">{script.cta}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-150">
              <button
                onClick={() => setViewingPitch(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 rounded-xl transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
