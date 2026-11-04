import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, ChevronRight, CheckCircle, Copy, Edit2, Loader2, 
  Play, Download, Mail, Phone, Lock, User, LogOut, ArrowRight, Sparkles, 
  Zap, Laptop, Search, Target, Compass, BookOpen, Lightbulb, MessageSquare, 
  RefreshCw, Eye, Shield, Award, Sun, Video
} from 'lucide-react';
import { jsPDF } from 'jspdf';

import logoImg from './assets/logo.png';
import profileGradientImg from './assets/profile_gradient.png';
import starPinkImg from './assets/star_pink.png';
import starBlueImg from './assets/star_blue.png';

const API_BASE_URL = 'http://localhost:5009/api';

const AutoResizeTextarea = ({ value, onChange, className, placeholder, rows = 1, style = {} }) => {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 24)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    const raf = requestAnimationFrame(adjustHeight);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={className}
      value={value || ''}
      placeholder={placeholder}
      onChange={(e) => {
        if (onChange) onChange(e);
        adjustHeight();
      }}
      rows={rows}
      style={{
        overflow: 'hidden',
        resize: 'none',
        ...style
      }}
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

const NICHE_OPTIONS = [
  'Travel',
  'Adventure',
  'Travel & Adventure',
  'Lifestyle',
  'Fashion & Styling',
  'Beauty & Skincare',
  'Tech & Gadgets',
  'Fitness & Wellness',
  'Food & Culinary',
  'Gaming & Entertainment',
  'Other / Custom'
];

const GENDER_OPTIONS = [
  'Female',
  'Male',
  'Non-binary',
  'Prefer to self-describe',
  'Prefer not to say'
];

const LIGHTING_OPTIONS = [
  'Natural Light / Golden Hour / Sunlit',
  'Studio Light / Key Light / Ring Light / Softbox',
  'Moody / Low Light / Cinematic Shadow',
  'Neon / RGB / Cyberpunk Glow',
  'Bright Commercial High-Key',
  'Clean Ambient / Soft Window Light'
];

const ENVIRONMENT_OPTIONS = [
  'Outdoor & Adventure (Wilderness, Trails, Nature)',
  'Vlogging & Travel (Handheld POV, On-The-Go)',
  'Home Studio & Aesthetic Bedroom Setup',
  'Professional Studio & Cyclorama',
  'Urban & City Streets (Run-and-Gun)',
  'Overhead Desk / Workspace Setup'
];

const primaryButtonStyle = {
  background: 'radial-gradient(circle at bottom left, #F65C43 0%, #DB1888 100%)'
};

const FrameImage = ({ promptText, redrawTrigger, index }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

  const fetchImage = async () => {
    setLoading(true);
    setError(false);
    setImgUrl('');
    
    const seed = Math.floor(Math.random() * 1000000);
    const finalPrompt = "Detailed black and white comic manga storyboard sketch of this scene: " + promptText + ". highly visible dark thin pen ink lines. NO colors. NO shading. white background. cleanly drawn lineart of characters.";
    const url = `${API_BASE_URL.replace('/api', '')}/api/image?prompt=${encodeURIComponent(promptText)}&seed=${seed}`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('image/svg+xml')) {
          const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=500&nologo=true&seed=${seed}`;
          setImgUrl(fallbackUrl);
        } else {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setImgUrl(objectUrl);
        }
      } else {
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=500&nologo=true&seed=${seed}`;
        setImgUrl(fallbackUrl);
      }
    } catch (err) {
      console.error("Backend fetch error, falling back to Pollinations:", err);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=500&nologo=true&seed=${seed}`;
      setImgUrl(fallbackUrl);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [promptText, redrawTrigger]);

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
            <small className="text-[10px] text-slate-400 italic block truncate max-w-[80%]">
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

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('pitchpal_user_exp9');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Creator Profile State: START COMPLETELY EMPTY (NOT PRE-FILLED)
  const [creatorProfile, setCreatorProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('pitchpal_creator_profile_exp9');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      name: '',
      instagramId: '',
      genderIdentity: '',
      selfDescribedGender: '',
      niche: '',
      customNiche: '',
      lighting: '',
      environment: '',
      contentBio: ''
    };
  });

  const [step, setStep] = useState(() => {
    try {
      const savedUser = localStorage.getItem('pitchpal_user_exp9');
      return savedUser ? 'welcome' : 'login';
    } catch {
      return 'login';
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // User Authentication State
  const [selectedEmail, setSelectedEmail] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ name: 'United States', code: '+1', flag: '🇺🇸' });
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Pitches list
  const [pitches, setPitches] = useState(() => {
    try {
      const saved = localStorage.getItem('pitchpal_pitches_exp9');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'mock-1',
        brand: 'Rare Beauty',
        date: 'Aug 15',
        objective: 'Promote Soft Pinch Liquid Blush',
        status: '👀 OPENED',
        scripts: {
          bestMatch: {
            hook: "Visual: Swipe-applying liquid blush on cheek in natural golden hour light.\nAudio: 'If you are still using powder blush, stop right now.'",
            setup: "Visual: Showing natural, skin-like texture.\nAudio: 'Liquid blushes are normally patchy. This blends in 3 seconds flat.'",
            content: "Visual: Blending seamlessly with fingertips.\nAudio: 'Look at that pigmented, dewy finish.'",
            cta: "Visual: Smiling holding the blush bottle.\nAudio: 'Link in bio to try it out!'"
          }
        }
      },
      {
        id: 'mock-2',
        brand: 'Patagonia',
        date: 'Aug 04',
        objective: 'Showcase Torrentshell 3L in rugged mountain conditions',
        status: '✅ REPLIED',
        scripts: {
          bestMatch: {
            hook: "Visual: Outdoor rain-soaked hike on a trail.\nAudio: 'The only rain jacket that has survived 300+ miles with me.'",
            setup: "Visual: Waterproof bead-up on sleeve.\nAudio: 'Most jackets wet out after 20 minutes in a downpour.'",
            content: "Visual: Demonstrating durable ripstop fabric.\nAudio: 'H2No Performance standard that actually keeps you completely dry.'",
            cta: "Visual: Reaching summit in rain.\nAudio: 'Check out the new seasonal colorways!'"
          }
        }
      },
      {
        id: 'mock-3',
        brand: 'Glossier',
        date: 'Jul 22',
        objective: 'Promote Cloud Paint Seamless Cheek Color',
        status: '😶 NO REPLY',
        scripts: {
          bestMatch: {
            hook: "Visual: Clean minimal window light, applying tiny drop.\nAudio: 'Is this the easiest blush to apply without looking like too much?'",
            setup: "Visual: Natural dewy finish on cheek.\nAudio: 'You cannot mess this formula up.'",
            content: "Visual: Blending into bare skin.\nAudio: 'Pillowy, gel-cream formula that melts right in.'",
            cta: "Visual: Showing the tube.\nAudio: 'Drop your favorite shade in the comments!'"
          }
        }
      }
    ];
  });

  const [viewingPitch, setViewingPitch] = useState(null);

  // Step 1 State: Research vs Upload
  const [inputMode, setInputMode] = useState('research');
  const [researchBrandName, setResearchBrandName] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchStep, setResearchStep] = useState(0);
  const [brandResearch, setBrandResearch] = useState(null);
  const [researchTab, setResearchTab] = useState('match'); // 'match' | 'profile' | 'audience' | 'products' | 'hooks' | 'creator'
  const [copyFeedback, setCopyFeedback] = useState('');

  // Brief Upload State
  const [briefText, setBriefText] = useState('');
  const [canvaLink, setCanvaLink] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Strategy & Scripts State
  const [strategy, setStrategy] = useState({
    brandName: '',
    coreInsight: '',
    hookAngles: ['', '', ''],
    keyMoments: ['', '', '', ''],
    targetAudience: '',
    brandTone: '',
    deliverables: '',
    creativeDirectorNotes: ''
  });

  const [scripts, setScripts] = useState(null);
  const [selectedScriptKey, setSelectedScriptKey] = useState('bestMatch');
  const [approvedScriptType, setApprovedScriptType] = useState('bestMatch');
  const [frames, setFrames] = useState([]);
  const [redrawTrigger, setRedrawTrigger] = useState(0);

  // Research loading steps
  const RESEARCH_STEPS = [
    "Scraping live brand marketing intelligence & products...",
    "Extracting brand positioning, visual cues & target audience...",
    "Analyzing Creator-to-Brand synergy & lighting compatibility...",
    "Synthesizing tailored UGC concepts & campaign angles..."
  ];

  useEffect(() => {
    let interval;
    if (isResearching) {
      interval = setInterval(() => {
        setResearchStep((prev) => (prev + 1) % RESEARCH_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isResearching]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Demo Login: Signs in and directs to onboarding so creator can enter their own inputs
  const handleDemoLogin = () => {
    const demoUser = {
      name: creatorProfile.name || 'Demo Creator',
      instagramId: creatorProfile.instagramId || 'democreator',
      email: 'creator.demo@pitchpal.ai',
      phone: '+1 555-0199'
    };
    setUser(demoUser);
    localStorage.setItem('pitchpal_user_exp9', JSON.stringify(demoUser));
    // Direct directly to profile flow
    setStep('onboarding');
  };

  // Complete Profile Onboarding
  const handleCompleteOnboarding = () => {
    const updatedUser = {
      name: creatorProfile.name.trim(),
      instagramId: creatorProfile.instagramId.replace(/^@/, '').trim(),
      email: selectedEmail || user?.email || '',
      phone: phoneInput || user?.phone || ''
    };
    setUser(updatedUser);
    try {
      localStorage.setItem('pitchpal_user_exp9', JSON.stringify(updatedUser));
      localStorage.setItem('pitchpal_creator_profile_exp9', JSON.stringify(creatorProfile));
    } catch (e) {
      console.error(e);
    }
    setStep('welcome');
  };

  // Instant Logout Handler: Clears session and returns to login flow
  const handleLogout = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    try {
      localStorage.removeItem('pitchpal_user_exp9');
      localStorage.removeItem('pitchpal_creator_profile_exp9');
    } catch (err) {
      console.error("Error during logout:", err);
    }
    setUser(null);
    setStep('login');
    setIsProfileOpen(false);
    setBrandResearch(null);
    setResearchBrandName('');
    setScripts(null);
    setFrames([]);
    setCreatorProfile({
      name: '',
      instagramId: '',
      genderIdentity: '',
      selfDescribedGender: '',
      niche: '',
      customNiche: '',
      lighting: '',
      environment: '',
      contentBio: ''
    });
  };

  // Run Brand Research
  const handleRunResearch = async (e) => {
    if (e) e.preventDefault();
    if (!researchBrandName.trim()) return;

    setIsResearching(true);
    setResearchStep(0);
    setBrandResearch(null);

    try {
      const activeNiche = creatorProfile.niche === 'Other / Custom' ? creatorProfile.customNiche : creatorProfile.niche;
      const response = await axios.post(`${API_BASE_URL}/research`, {
        brandName: researchBrandName.trim(),
        creatorProfile: {
          ...creatorProfile,
          niche: activeNiche
        }
      });

      setBrandResearch(response.data);
      setResearchTab('match'); // Focus on Creator Match tab first!
    } catch (error) {
      console.error("Brand research failed:", error);
      alert(error.response?.data?.error || "Failed to research brand. Please ensure backend is running on port 5009.");
    } finally {
      setIsResearching(false);
    }
  };

  // Apply Research to Strategy (Step 1 -> Step 2)
  const handleApplyResearchToStrategy = () => {
    if (!brandResearch) return;
    const match = brandResearch.creatorMatch;
    
    setStrategy({
      brandName: researchBrandName.trim(),
      coreInsight: brandResearch.brandSnapshot?.brandPromise || brandResearch.oneThingToRemember || "Deliver authentic, high-impact creator storytelling.",
      hookAngles: match?.tailoredPitchHooks || [
        brandResearch.previousHookBank?.[0] || `The one thing about ${researchBrandName} nobody tells you`,
        brandResearch.previousHookBank?.[1] || `Why I bring ${researchBrandName} on every shoot`,
        brandResearch.previousHookBank?.[2] || `Is this the best investment for 2026?`
      ],
      keyMoments: [
        `0-3s: Visual shot in ${creatorProfile.lighting || 'natural light'} (${creatorProfile.environment || 'vlog style'}) with strong hook`,
        `3-15s: Demonstrating real-world problem and category frustration`,
        `15-30s: Hero product revelation with features and benefits`,
        `30-45s: Authentic creator sign-off & call to action`
      ],
      targetAudience: `${brandResearch.targetAudience?.primaryTG || ''} | ${brandResearch.targetAudience?.psychographics || ''}`,
      brandTone: `${brandResearch.brandSnapshot?.toneOfVoice || 'Authentic, Conversational, Dynamic'}`,
      deliverables: '9:16 Vertical Video (30-45s Reels/TikTok)',
      creativeDirectorNotes: match?.lightingAndEnvironmentFit || `Shoot with ${creatorProfile.lighting || 'natural light'} to complement ${researchBrandName}'s brand aesthetic.`
    });

    setStep(2);
  };

  // Generate Scripts (Step 2 -> Step 3)
  const handleGenerateScripts = async () => {
    setIsLoading(true);
    try {
      const activeNiche = creatorProfile.niche === 'Other / Custom' ? creatorProfile.customNiche : creatorProfile.niche;
      const response = await axios.post(`${API_BASE_URL}/generate-scripts`, {
        strategy,
        brandName: researchBrandName.trim() || strategy.brandName,
        creatorProfile: {
          ...creatorProfile,
          niche: activeNiche
        }
      });
      setScripts(response.data);
      const firstKey = response.data?.bestMatch ? 'bestMatch' : Object.keys(response.data || {})[0] || 'bestMatch';
      setSelectedScriptKey(firstKey);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Failed to generate scripts. Please check backend on port 5009.");
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Script Field Editing
  const handleScriptFieldChange = (field, value) => {
    setScripts(prev => {
      if (!prev) return prev;
      const key = selectedScriptKey || 'bestMatch';
      const targetScript = prev[key] || {};
      return {
        ...prev,
        [key]: {
          ...targetScript,
          [field]: value
        }
      };
    });
  };

  // Copy Complete Formatted Script to Clipboard
  const handleCopyFullScript = () => {
    if (!scripts) return;
    const current = scripts[selectedScriptKey] || scripts.bestMatch || Object.values(scripts)[0];
    if (!current) return;
    const fullText = `${current.title || 'Script'}
${current.gist ? `Gist: ${current.gist}\n` : ''}
--- HOOK (0-3s) ---
${current.hook || ''}

--- SETUP (3-15s) ---
${current.setup || ''}

--- VALUE / CONTENT (15-45s) ---
${current.content || ''}

--- CTA (Final 3-5s) ---
${current.cta || ''}`;

    navigator.clipboard.writeText(fullText.trim());
    setCopyFeedback('fullScript');
    setTimeout(() => setCopyFeedback(''), 2500);
  };

  // Download Script as .txt File
  const handleDownloadScript = () => {
    if (!scripts) return;
    const current = scripts[selectedScriptKey] || scripts.bestMatch || Object.values(scripts)[0];
    if (!current) return;
    const brand = (researchBrandName || strategy.brandName || 'Brand').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fullText = `PITCHPAL GENERATED SCRIPT - ${brand.toUpperCase()}
Variation: ${current.title || 'Script'}
${current.gist ? `Gist: ${current.gist}\n` : ''}
==================================================
1. HOOK (0-3s)
Impactful, scroll-stopping, addresses audience
--------------------------------------------------
${current.hook || ''}

==================================================
2. SETUP (3-15s)
Pain points, viewer benefits
--------------------------------------------------
${current.setup || ''}

==================================================
3. VALUE / CONTENT (15-45s)
Fast tips, product demo
--------------------------------------------------
${current.content || ''}

==================================================
4. CTA (Final 3-5s)
Follow, comment, share
--------------------------------------------------
${current.cta || ''}
`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PitchPal-${brand}-${current.title?.replace(/\s+/g, '_') || 'script'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Approve Script & Move to Storyboard
  const handleApproveScript = (scriptType) => {
    const key = scriptType || selectedScriptKey || 'bestMatch';
    setApprovedScriptType(key);
    const chosenScript = scripts ? (scripts[key] || scripts.bestMatch || Object.values(scripts)[0]) : null;
    if (!chosenScript) return;

    const parsePrompt = (line) => {
      if (!line) return '';
      const vMatch = line.match(/Visual:\s*(.*?)(?=\s*(?:Audio|VO):|$)/is);
      return vMatch ? vMatch[1].trim() : line.trim();
    };

    const parseAudio = (line) => {
      if (!line) return '';
      const aMatch = line.match(/(?:Audio|VO):\s*(.*)$/is);
      return aMatch ? aMatch[1].trim() : '';
    };

    const newFrames = [
      {
        id: 1,
        title: "Frame 1: Hook (0-3s)",
        action: parsePrompt(chosenScript.hook),
        voiceover: parseAudio(chosenScript.hook)
      },
      {
        id: 2,
        title: "Frame 2: Setup & Problem (3-12s)",
        action: parsePrompt(chosenScript.setup),
        voiceover: parseAudio(chosenScript.setup)
      },
      {
        id: 3,
        title: "Frame 3: Content & Demo (12-30s)",
        action: parsePrompt(chosenScript.content),
        voiceover: parseAudio(chosenScript.content)
      },
      {
        id: 4,
        title: "Frame 4: Call to Action (30-45s)",
        action: parsePrompt(chosenScript.cta),
        voiceover: parseAudio(chosenScript.cta)
      }
    ];

    setFrames(newFrames);
    setRedrawTrigger(prev => prev + 1);
    setStep(4);
  };

  // Export PDF with Brand Intelligence & Creator Match
  const exportResearchPDF = () => {
    if (!brandResearch) return;
    const doc = new jsPDF();
    const brand = (researchBrandName || 'BRAND').toUpperCase();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(219, 24, 136);
    doc.text(`PITCHPAL BRAND RESEARCH & CREATOR MATCH: ${brand}`, 14, 20);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Creator: ${creatorProfile.name || user?.name || 'Creator'} (@${creatorProfile.instagramId || user?.instagramId || ''}) | Generated on ${new Date().toLocaleDateString()}`, 14, 26);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 29, 196, 29);
    
    let y = 36;
    const addSectionHeader = (title) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(219, 24, 136);
      doc.text(title, 14, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
    };

    const addKeyValue = (key, value) => {
      if (!value) return;
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(key + ":", 14, y);
      
      const splitValue = doc.splitTextToSize(String(value), 130);
      doc.setFont("helvetica", "normal");
      doc.text(splitValue, 60, y);
      y += (splitValue.length * 4.5) + 3;
    };

    const match = brandResearch.creatorMatch;
    if (match) {
      addSectionHeader("1. CREATOR-BRAND MATCH & SYNERGY");
      addKeyValue("Match Synergy", `${match.matchScore}% - ${match.compatibilityLevel}`);
      addKeyValue("Creator Setup", `Niche: ${creatorProfile.niche || 'N/A'} | Lighting: ${creatorProfile.lighting || 'N/A'} | Environment: ${creatorProfile.environment || 'N/A'}`);
      addKeyValue("Synergy Overview", match.synergyOverview);
      addKeyValue("Lighting & Aesthetic Fit", match.lightingAndEnvironmentFit);
      addKeyValue("Niche Alignment", match.nicheAlignment);
      if (match.tailoredUgcAngles?.length) {
        addKeyValue("Tailored UGC Concept 1", `${match.tailoredUgcAngles[0].title}: "${match.tailoredUgcAngles[0].hook}"`);
        addKeyValue("Tailored UGC Concept 2", `${match.tailoredUgcAngles[1].title}: "${match.tailoredUgcAngles[1].hook}"`);
      }
      addKeyValue("Custom Pitch Proposal", match.customPitchLetter);
    }

    addSectionHeader("2. BRAND PROFILE & IDENTITY");
    addKeyValue("Category", brandResearch.category);
    addKeyValue("Market Scope", brandResearch.market);
    addKeyValue("What it stands for", brandResearch.brandSnapshot?.standsFor);
    addKeyValue("Personality", brandResearch.brandSnapshot?.personality);
    addKeyValue("Tone of Voice", brandResearch.brandSnapshot?.toneOfVoice);
    addKeyValue("Brand Promise", brandResearch.brandSnapshot?.brandPromise);

    addSectionHeader("3. TARGET AUDIENCE & PSYCHOGRAPHICS");
    addKeyValue("Primary Target Group", brandResearch.targetAudience?.primaryTG);
    addKeyValue("Psychographics", brandResearch.targetAudience?.psychographics);
    addKeyValue("Functional Need", brandResearch.audienceNeed?.functionalNeed);
    addKeyValue("Emotional Need", brandResearch.audienceNeed?.emotionalNeed);

    addSectionHeader("4. PRODUCTS & HERO CUES");
    addKeyValue("Currently Sells", brandResearch.productCategory?.currentlySells);
    addKeyValue("Price Context", brandResearch.productCategory?.priceContext);
    addKeyValue("Hero Example", brandResearch.productFeatures?.heroExample);

    addSectionHeader("5. CREATOR OPPORTUNITY");
    addKeyValue("Content Gap", brandResearch.brandContentGap);
    addKeyValue("Collaboration Angles", brandResearch.creatorOpportunity);

    doc.save(`${brand}_PitchPal_Creator_Match.pdf`);
  };

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const totalPitchesCount = pitches.length;
  const openedPitchesCount = pitches.filter(p => p.status === '👀 OPENED' || p.status === '✅ REPLIED').length;
  const responsesReceivedCount = pitches.filter(p => p.status === '✅ REPLIED').length;
  const responseRatePct = totalPitchesCount > 0 ? Math.round((responsesReceivedCount / totalPitchesCount) * 100) : 0;

  return (
    <div 
      className="min-h-screen text-slate-800 flex flex-col font-sans relative overflow-x-hidden" 
      style={{ background: 'linear-gradient(90deg, #FCE5E6 0%, #FCE5E6 35%, #DDEEF8 75%, #DDEEF8 100%)' }}
    >
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
      <header className="bg-white/30 backdrop-blur-md border-b border-white/50 text-slate-800 px-8 md:px-12 py-5 flex items-center justify-between shrink-0 rounded-b-3xl relative z-50">
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={() => user && setStep('welcome')}
        >
          <img src={logoImg} alt="PitchPal" className="h-9 object-contain" />
        </div>

        {user && !['login', 'phone_input', 'otp_input', 'onboarding'].includes(step) ? (
          <div className="flex items-center gap-8">
            <nav className="flex items-center gap-8 text-sm font-semibold text-slate-500">
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
                  setResearchBrandName('');
                  setBrandResearch(null);
                  setScripts(null);
                }} 
                className={`transition-colors pb-1 ${[1, 2, 3, 4].includes(step) ? 'text-[#db1888] border-b-2 border-[#db1888]' : 'hover:text-[#db1888]'}`}
              >
                New Pitch
              </button>
            </nav>

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full text-white font-extrabold flex items-center justify-center text-base border border-white/60 hover:scale-105 active:scale-95 transition-transform shadow-xs cursor-pointer"
                style={{ backgroundImage: `url(${profileGradientImg})`, backgroundSize: 'cover' }}
              >
                {creatorProfile.name ? creatorProfile.name[0].toUpperCase() : (user?.name ? user.name[0].toUpperCase() : 'R')}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl py-2 z-50 text-slate-800 shadow-2xl">
                  <div className="px-4 py-2.5 border-b border-gray-150">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {creatorProfile.name || user?.name || 'Creator'}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      @{creatorProfile.instagramId || user?.instagramId || 'creator'}
                    </p>
                    {creatorProfile.niche && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-pink-50 text-[#db1888] text-[10px] font-bold">
                        {creatorProfile.niche}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                      setStep('onboarding');
                      setIsProfileOpen(false);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit Creator Profile</span>
                  </button>

                  <button 
                    type="button"
                    onClick={handleLogout}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleLogout(e);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold border-t border-gray-150 mt-1 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-500 bg-slate-100/90 px-3.5 py-2 border border-gray-200/80 rounded-full">
            Outreach Portal
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto relative z-10">
        
        {/* LOGIN SCREEN */}
        {step === 'login' && (
          <div className="max-w-md w-full bg-white/85 backdrop-blur-md border border-gray-200/50 rounded-3xl p-8 text-center space-y-8 animate-in fade-in zoom-in duration-300 shadow-sm">
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
                onClick={handleDemoLogin}
                className="w-full py-3.5 px-4 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-[0.98]"
                style={primaryButtonStyle}
              >
                <span>Continue with Demo Account</span>
              </button>

              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-gray-200 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <Mail className="w-5 h-5 text-slate-500" />
                <span>Login with Email</span>
              </button>
              
              <button
                onClick={() => setStep('phone_input')}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-gray-200 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <Phone className="w-5 h-5 text-slate-500" />
                <span>Login with Phone Number</span>
              </button>
            </div>
          </div>
        )}

        {/* PHONE NUMBER INPUT SCREEN */}
        {step === 'phone_input' && (
          <div className="max-w-md w-full bg-white/85 backdrop-blur-md border border-gray-200/50 rounded-3xl p-8 space-y-6 animate-in fade-in zoom-in duration-200 shadow-sm">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Login with Phone</h2>
              <p className="text-slate-600 text-sm">Enter your phone number to receive a verification OTP code.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="h-12 px-3 bg-white border border-gray-200 rounded-xl flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.code}</span>
                    </button>
                    {isCountryDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                        {countries.map(c => (
                          <div
                            key={c.code + c.name}
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsCountryDropdownOpen(false);
                            }}
                            className="px-3 py-2 text-xs flex items-center justify-between hover:bg-pink-50 cursor-pointer"
                          >
                            <span>{c.flag} {c.name}</span>
                            <span className="text-slate-400">{c.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. 98765 43210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="flex-1 h-12 bg-white border border-gray-200 rounded-xl px-4 text-slate-800 text-sm focus:outline-none focus:border-[#db1888]"
                  />
                </div>
              </div>

              <button
                disabled={!phoneInput}
                onClick={() => setStep('otp_input')}
                className="w-full py-3.5 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                style={primaryButtonStyle}
              >
                <span>Send Verification Code &rarr;</span>
              </button>

              <button
                onClick={() => { setStep('login'); setPhoneInput(''); }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium py-1"
              >
                &larr; Back to login options
              </button>
            </div>
          </div>
        )}

        {/* OTP INPUT SCREEN */}
        {step === 'otp_input' && (
          <div className="max-w-md w-full bg-white/85 backdrop-blur-md border border-gray-200/50 rounded-3xl p-8 space-y-6 text-center animate-in fade-in zoom-in duration-200 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Verify Code</h2>
              <p className="text-slate-600 text-sm">
                Enter the 4-digit code sent to <span className="font-semibold text-slate-800">{selectedCountry.code} {phoneInput}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                {otpInput.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value;
                      const newOtp = [...otpInput];
                      newOtp[idx] = val;
                      setOtpInput(newOtp);
                      if (val && idx < 3) {
                        document.getElementById(`otp-${idx + 1}`)?.focus();
                      }
                    }}
                    className="w-12 h-14 text-center text-xl font-bold bg-white border border-gray-200 rounded-xl focus:border-[#db1888] focus:outline-none"
                  />
                ))}
              </div>

              {otpError && <p className="text-xs text-red-500 font-medium">{otpError}</p>}

              <button
                onClick={() => {
                  const entered = otpInput.join('');
                  if (entered.length < 4) {
                    setOtpError('Please enter all 4 digits');
                    return;
                  }
                  const newUser = {
                    name: creatorProfile.name || '',
                    instagramId: creatorProfile.instagramId || '',
                    phone: `${selectedCountry.code} ${phoneInput}`
                  };
                  setUser(newUser);
                  localStorage.setItem('pitchpal_user_exp9', JSON.stringify(newUser));
                  setStep('onboarding');
                }}
                className="w-full py-3.5 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={primaryButtonStyle}
              >
                <span>Continue &rarr;</span>
              </button>

              <button
                onClick={() => { setStep('phone_input'); setOtpInput(['','','','']); setOtpError(''); }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium py-1"
              >
                &larr; Change phone number
              </button>
            </div>
          </div>
        )}

        {/* ONBOARDING CREATOR PROFILE DETAILS SCREEN (ALL FIELDS START EMPTY - NOT PRE-FILLED) */}
        {step === 'onboarding' && (
          <div className="max-w-xl w-full bg-white/85 backdrop-blur-md border border-gray-200/50 rounded-3xl p-8 space-y-6 animate-in fade-in zoom-in duration-200 shadow-sm text-slate-800 my-auto">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Create Your Profile</h2>
              <p className="text-slate-600 text-sm">Tell us a bit about yourself so we can match it with the brands you research.</p>
            </div>

            <div className="space-y-4">
              {/* Row 1: Name & Instagram Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Riza Ghosal"
                      value={creatorProfile.name}
                      onChange={(e) => setCreatorProfile({ ...creatorProfile, name: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-[#db1888] transition-colors text-sm"
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
                      value={creatorProfile.instagramId}
                      onChange={(e) => setCreatorProfile({ ...creatorProfile, instagramId: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-[#db1888] transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Gender Identity (Female, Male, Non-binary, Prefer to self-describe, Prefer not to say) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Gender Identity (Optional)
                  </label>
                  <span className="text-[11px] text-slate-400">Helps match with demographic campaigns</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map((g) => {
                    const isSelected = creatorProfile.genderIdentity === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setCreatorProfile({ ...creatorProfile, genderIdentity: g })}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected 
                            ? 'bg-[#db1888] text-white font-semibold shadow-xs' 
                            : 'bg-white border border-gray-200 text-slate-700 hover:border-pink-300'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
                {creatorProfile.genderIdentity === 'Prefer to self-describe' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      placeholder="How do you identify? (e.g. genderfluid, woman of color, etc.)"
                      value={creatorProfile.selfDescribedGender}
                      onChange={(e) => setCreatorProfile({ ...creatorProfile, selfDescribedGender: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-[#db1888]"
                    />
                  </div>
                )}
              </div>

              {/* Row 3: Sector or Niche Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Which Sector or Niche are you from?
                </label>
                <select
                  value={creatorProfile.niche}
                  onChange={(e) => setCreatorProfile({ ...creatorProfile, niche: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-[#db1888] transition-colors text-sm"
                >
                  <option value="">Select your sector or niche...</option>
                  {NICHE_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                {creatorProfile.niche === 'Other / Custom' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Type your niche (e.g. Van Life, Street Photography, Specialty Coffee)..."
                      value={creatorProfile.customNiche}
                      onChange={(e) => setCreatorProfile({ ...creatorProfile, customNiche: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-[#db1888]"
                    />
                  </div>
                )}
              </div>

              {/* Row 4: Lighting & Filming Environment Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Lighting Setup</span>
                  </label>
                  <select
                    value={creatorProfile.lighting}
                    onChange={(e) => setCreatorProfile({ ...creatorProfile, lighting: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-3 text-slate-800 focus:outline-none focus:border-[#db1888] transition-colors text-xs sm:text-sm"
                  >
                    <option value="">Select lighting setup...</option>
                    {LIGHTING_OPTIONS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#db1888]" />
                    <span>Filming Environment</span>
                  </label>
                  <select
                    value={creatorProfile.environment}
                    onChange={(e) => setCreatorProfile({ ...creatorProfile, environment: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-3 text-slate-800 focus:outline-none focus:border-[#db1888] transition-colors text-xs sm:text-sm"
                  >
                    <option value="">Select filming environment...</option>
                    {ENVIRONMENT_OPTIONS.map(env => (
                      <option key={env} value={env}>{env}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Content Description / Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  What kind of content do you create / Bio
                </label>
                <AutoResizeTextarea
                  placeholder="Tell us a little bit about what kind of content you create or a brief bio about yourself so we can match it with the brand..."
                  value={creatorProfile.contentBio}
                  onChange={(e) => setCreatorProfile({ ...creatorProfile, contentBio: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-[#db1888] transition-colors text-sm leading-relaxed"
                />
              </div>

              <button
                disabled={!creatorProfile.name || !creatorProfile.instagramId}
                onClick={handleCompleteOnboarding}
                className="w-full py-3.5 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                style={primaryButtonStyle}
              >
                <span>Complete Onboarding &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* WELCOME DASHBOARD SCREEN (MATCHING homescreen.pdf & Script-experiment-8) */}
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
                  Ready to pitch your next dream brand, <span className="font-bold text-[#db1888]">@{creatorProfile.instagramId || user?.instagramId || 'rizzzz'}</span>?
                </p>
              </div>

              <div className="pt-2 max-w-xs mx-auto">
                <button
                  onClick={() => {
                    setStep(1);
                    setResearchBrandName('');
                    setBrandResearch(null);
                    setScripts(null);
                  }}
                  className="px-8 py-3.5 text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-transform text-base flex items-center justify-center gap-2 mx-auto shadow-md"
                  style={primaryButtonStyle}
                >
                  <span>Pitch a New Brand</span>
                </button>
              </div>
            </div>

            {/* Bottom Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Recent Pitches Widget */}
              <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 flex flex-col space-y-6 shadow-sm">
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
              <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-sm">
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
                <div className="bg-white/70 border border-white/60 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 truncate">
                    <div 
                      className="w-11 h-11 rounded-full text-white font-extrabold flex items-center justify-center text-base shrink-0 shadow-xs"
                      style={{ backgroundImage: `url(${profileGradientImg})`, backgroundSize: 'cover' }}
                    >
                      {creatorProfile.name ? creatorProfile.name[0].toUpperCase() : (user?.name ? user.name[0].toUpperCase() : 'R')}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-800 text-sm truncate">{creatorProfile.name || user?.name || 'Creator'}</p>
                      <p className="text-xs text-slate-500 truncate">@{creatorProfile.instagramId || user?.instagramId || 'rizzzz'}</p>
                      {creatorProfile.niche && (
                        <p className="text-[10px] text-[#db1888] font-semibold truncate mt-0.5">
                          {creatorProfile.niche} {creatorProfile.lighting ? `• ${creatorProfile.lighting.split('/')[0]}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('onboarding')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-gray-200 text-xs font-semibold text-slate-700 rounded-xl shrink-0 transition-colors shadow-xs"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCRIPT GENERATOR VIEWS (STEPS 1, 2, 3, 4) */}
        {(step === 1 || step === 2 || step === 3 || step === 4) && (
          <div className="max-w-4xl w-full bg-white/70 backdrop-blur-md rounded-3xl border border-white/60 overflow-hidden text-gray-800 my-auto animate-in fade-in duration-200 shadow-md">
            
            {/* Progress Bar */}
            <div className="flex border-b border-gray-200/50">
              {['Brand & Match', 'Review Strategy', 'Select & Edit Script', 'Storyboard'].map((title, i) => (
                <div key={i} className={`flex-1 text-center py-4 text-xs sm:text-sm font-semibold transition-all ${step >= i+1 ? 'text-[#db1888] border-b-2 border-[#db1888] bg-pink-50/20' : 'text-slate-400'}`}>
                  Step {i+1}: {title}
                </div>
              ))}
            </div>

            <div className="p-6 md:p-8">
              {/* STEP 1: BRAND RESEARCH & CREATOR MATCHING */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-800">Start Your Pitch</h2>
                      <p className="text-slate-500 text-sm">Research any brand in seconds and match it with your creator setup.</p>
                    </div>
                    
                    {/* Method Selector Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
                      <button
                        onClick={() => setInputMode('research')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${inputMode === 'research' ? 'bg-white text-[#db1888] shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" /> AI Brand Research
                      </button>
                      <button
                        onClick={() => setInputMode('upload')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${inputMode === 'upload' ? 'bg-white text-[#db1888] shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Brief
                      </button>
                    </div>
                  </div>

                  {/* OPTION A: AI BRAND RESEARCH */}
                  {inputMode === 'research' && (
                    <div className="space-y-6">
                      <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-slate-800">
                            Enter Brand Name
                          </label>
                          {creatorProfile.niche && (
                            <span className="text-xs text-[#db1888] font-semibold bg-pink-50 px-2.5 py-0.5 rounded-full">
                              Matching: {creatorProfile.niche} • {creatorProfile.lighting ? creatorProfile.lighting.split('/')[0] : 'Natural'}
                            </span>
                          )}
                        </div>

                        {/* Clean Brand Input (No quick try chips per user instruction) */}
                        <div className="flex gap-3 flex-col sm:flex-row">
                          <div className="relative flex-1">
                            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                              type="text"
                              placeholder="e.g. Rare Beauty, Red Bull, Patagonia, Glossier, Gymshark, Nike..."
                              value={researchBrandName}
                              onChange={(e) => setResearchBrandName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleRunResearch(e); }}
                              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#db1888] outline-none text-sm text-slate-800 font-medium"
                            />
                          </div>
                          <button
                            onClick={handleRunResearch}
                            disabled={isResearching || !researchBrandName.trim()}
                            className="px-6 py-3 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-sm shrink-0"
                            style={primaryButtonStyle}
                          >
                            {isResearching ? (
                              <>
                                <Loader2 className="animate-spin w-4 h-4" />
                                <span>Researching...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span>Research & Match</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Loading Progress State */}
                      {isResearching && (
                        <div className="bg-white/90 border border-pink-100 rounded-2xl p-8 text-center space-y-4 shadow-sm animate-in fade-in">
                          <Loader2 className="animate-spin w-9 h-9 mx-auto text-[#db1888]" />
                          <div className="space-y-1">
                            <h3 className="font-bold text-slate-800 text-base">Gathering Real-Time Brand Intelligence...</h3>
                            <p className="text-sm text-slate-500 font-medium">
                              {RESEARCH_STEPS[researchStep]}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Brand Research & Creator Match Results */}
                      {brandResearch && !isResearching && (
                        <div className="bg-white/90 border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm space-y-0 animate-in fade-in">
                          {/* Card Header */}
                          <div className="p-6 bg-gradient-to-r from-pink-50/60 to-white border-b border-slate-150 flex items-center justify-between flex-wrap gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#db1888] bg-pink-100/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                  {brandResearch.category || 'Brand Report'}
                                </span>
                                {brandResearch.market && (
                                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {brandResearch.market}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                                {researchBrandName} Intelligence & Creator Match
                              </h3>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={exportResearchPDF}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl transition-all shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5 text-[#db1888]" /> Export Report PDF
                              </button>
                            </div>
                          </div>

                          {/* Tab Navigation */}
                          <div className="flex border-b border-slate-150 bg-slate-50/50 px-6 overflow-x-auto">
                            {[
                              { id: 'match', label: '🎯 Creator Match', icon: Target },
                              { id: 'profile', label: 'Brand Profile', icon: Shield },
                              { id: 'audience', label: 'Target Audience', icon: User },
                              { id: 'products', label: 'Product & Pricing', icon: BookOpen },
                              ...(brandResearch.previousHookBank && brandResearch.previousHookBank.length > 0 ? [
                                { id: 'hooks', label: 'Hook Bank & UGC', icon: Lightbulb }
                              ] : []),
                              { id: 'creator', label: 'Creator Opportunity', icon: Award }
                            ].map((t) => {
                              const Icon = t.icon;
                              const isActive = researchTab === t.id;
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => setResearchTab(t.id)}
                                  className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${isActive ? 'border-[#db1888] text-[#db1888] bg-white font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  {t.label}
                                </button>
                              );
                            })}
                          </div>

                          {/* Tab Content */}
                          <div className="p-6">
                            {/* TAB: CREATOR MATCH */}
                            {researchTab === 'match' && brandResearch.creatorMatch && (
                              <div className="space-y-6">
                                {/* Synergy Banner */}
                                <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 border border-pink-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[#db1888] text-xs font-bold shadow-xs">
                                      <Award className="w-3.5 h-3.5" />
                                      <span>{brandResearch.creatorMatch.compatibilityLevel || 'High Synergy Match'}</span>
                                    </div>
                                    <h4 className="text-base font-extrabold text-slate-900">
                                      Creator Synergy for {creatorProfile.name || 'You'} &times; {researchBrandName}
                                    </h4>
                                    <p className="text-xs text-slate-700 leading-relaxed max-w-xl">
                                      {brandResearch.creatorMatch.synergyOverview}
                                    </p>
                                  </div>

                                  <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-pink-200 min-w-[100px] shadow-xs">
                                    <span className="text-2xl font-black text-[#db1888]">
                                      {brandResearch.creatorMatch.matchScore}%
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Match Score</span>
                                  </div>
                                </div>

                                {/* Breakdown Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Lighting & Filming Environment Fit</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed">
                                      {brandResearch.creatorMatch.lightingAndEnvironmentFit}
                                    </p>
                                  </div>

                                  <div className="p-4 bg-pink-50/50 rounded-xl border border-pink-200/60 space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold text-[#db1888]">
                                      <Target className="w-3.5 h-3.5" />
                                      <span>Sector & Niche Alignment</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed">
                                      {brandResearch.creatorMatch.nicheAlignment}
                                    </p>
                                  </div>
                                </div>

                                {/* 3 Tailored UGC Angles */}
                                {brandResearch.creatorMatch.tailoredUgcAngles?.length > 0 && (
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-[#db1888]" />
                                      <span>3 Tailored UGC Angles for Your Setup</span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      {brandResearch.creatorMatch.tailoredUgcAngles.map((angle, idx) => (
                                        <div key={idx} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2 text-xs flex flex-col justify-between">
                                          <div>
                                            <span className="text-[10px] font-bold text-[#db1888] block uppercase">Angle {idx + 1}</span>
                                            <h5 className="font-bold text-slate-900 text-xs mt-0.5">{angle.title}</h5>
                                            <p className="text-slate-600 italic mt-1.5 font-medium">"{angle.hook}"</p>
                                          </div>
                                          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">{angle.concept}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* TAB: BRAND PROFILE */}
                            {researchTab === 'profile' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">What It Stands For</span>
                                  <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.brandSnapshot?.standsFor || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tone of Voice</span>
                                  <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.brandSnapshot?.toneOfVoice || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personality</span>
                                  <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.brandSnapshot?.personality || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand Promise</span>
                                  <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.brandSnapshot?.brandPromise || 'N/A'}</p>
                                </div>
                              </div>
                            )}

                            {/* TAB: TARGET AUDIENCE */}
                            {researchTab === 'audience' && (
                              <div className="space-y-4 text-sm">
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Target Group</span>
                                  <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.targetAudience?.primaryTG}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Psychographics</span>
                                    <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.targetAudience?.psychographics}</p>
                                  </div>
                                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jobs To Be Done (JTBD)</span>
                                    <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.audienceNeed?.jtbd || brandResearch.audienceNeed?.functionalNeed}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TAB: PRODUCTS */}
                            {researchTab === 'products' && (
                              <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog & Products</span>
                                    <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.productCategory?.currentlySells}</p>
                                  </div>
                                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Positioning</span>
                                    <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.productCategory?.priceContext}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TAB: HOOKS */}
                            {researchTab === 'hooks' && (
                              <div className="space-y-4 text-sm">
                                <div className="space-y-2">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hook Bank</span>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(brandResearch.previousHookBank || []).map((hook, i) => (
                                      <div key={i} className="bg-slate-50/80 p-3 rounded-xl border border-slate-150 text-xs font-medium text-slate-700 italic">
                                        "{hook}"
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TAB: CREATOR OPPORTUNITY */}
                            {researchTab === 'creator' && (
                              <div className="space-y-4 text-sm">
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand Content Gap</span>
                                  <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.brandContentGap}</p>
                                </div>
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-150 space-y-1">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Creator Opportunities</span>
                                  <p className="text-slate-800 font-medium leading-relaxed">{brandResearch.creatorOpportunity}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Card Footer: Apply & Continue */}
                          <div className="p-6 bg-slate-50/80 border-t border-slate-150 flex items-center justify-between flex-wrap gap-4">
                            <p className="text-xs text-slate-500 font-medium">
                              Ready to turn these insights into custom pitch scripts?
                            </p>
                            <button
                              onClick={handleApplyResearchToStrategy}
                              className="px-6 py-2.5 text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-sm shadow-md"
                              style={primaryButtonStyle}
                            >
                              <span>Apply to Strategy & Continue</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* OPTION B: FILE UPLOAD */}
                  {inputMode === 'upload' && (
                    <div className="space-y-6">
                      <div className="border border-dashed border-slate-200 bg-white/80 rounded-2xl p-8 text-center hover:bg-white/90 transition-colors">
                        <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                        <label className="cursor-pointer bg-pink-50 text-[#db1888] border border-[#db1888]/30 px-4 py-2 rounded-xl font-semibold hover:bg-pink-100 transition-colors inline-block">
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
                        <p className="text-xs text-slate-400 mt-3">Supports PDF, Word, TXT, MD</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Brief Details</label>
                        <AutoResizeTextarea 
                          placeholder="Tell us about the product, campaign goals, vibe..." 
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-[#db1888] outline-none text-sm" 
                          value={briefText} 
                          onChange={e => setBriefText(e.target.value)} 
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setStrategy(prev => ({ ...prev, brandName: 'Custom Brief', coreInsight: briefText }));
                            setStep(2);
                          }}
                          className="px-6 py-3 text-white rounded-xl font-bold text-sm shadow-md"
                          style={primaryButtonStyle}
                        >
                          Continue to Strategy &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: REVIEW STRATEGY */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-gray-150 pb-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Review Strategy</h2>
                      <p className="text-xs text-slate-500">
                        Tailored for {creatorProfile.name || 'You'} ({creatorProfile.lighting || 'Natural light'} • {creatorProfile.environment || 'Outdoor'})
                      </p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
                      &larr; Back to Research
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={strategy.brandName}
                        onChange={(e) => setStrategy({ ...strategy, brandName: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Core Insight</label>
                      <AutoResizeTextarea
                        value={strategy.coreInsight}
                        onChange={(e) => setStrategy({ ...strategy, coreInsight: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-slate-800 leading-relaxed focus:outline-none focus:border-[#db1888]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Creative Director Notes (Lighting & Environment)</label>
                      <AutoResizeTextarea
                        value={strategy.creativeDirectorNotes}
                        onChange={(e) => setStrategy({ ...strategy, creativeDirectorNotes: e.target.value })}
                        className="w-full bg-pink-50/40 border border-pink-200 rounded-xl p-3 text-sm text-slate-800 leading-relaxed focus:outline-none focus:border-[#db1888]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-gray-150">
                    <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
                      Back
                    </button>

                    <button
                      onClick={handleGenerateScripts}
                      disabled={isLoading}
                      className="py-3 px-6 text-white rounded-xl font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                      style={primaryButtonStyle}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating 3 Scripts...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate 3 Script Variations &rarr;</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SCRIPT GENERATOR & EDITOR */}
              {step === 3 && scripts && (() => {
                const variationConfigs = [
                  {
                    key: 'bestMatch',
                    badgeNumber: 'Script 1',
                    defaultTitle: 'Best Match',
                    fallbackGist: `Strategic, direct alignment with the brand's core mission and clean hero cues.`
                  },
                  {
                    key: scripts.softer ? 'softer' : (scripts.alternative ? 'alternative' : 'softer'),
                    badgeNumber: 'Script 2',
                    defaultTitle: 'Softer & Relatable',
                    fallbackGist: 'A relaxed, candid friend-to-friend recommendation highlighting effortless routine integration.'
                  },
                  {
                    key: scripts.boldMove ? 'boldMove' : (scripts.highEnergyUgc ? 'highEnergyUgc' : 'boldMove'),
                    badgeNumber: 'Script 3',
                    defaultTitle: 'Bold Move',
                    fallbackGist: 'High-energy pattern-interrupt challenging traditional category myths.'
                  }
                ];

                const activeKey = (scripts[selectedScriptKey] ? selectedScriptKey : null) || 
                  (scripts.bestMatch ? 'bestMatch' : Object.keys(scripts)[0]);
                const activeScript = scripts[activeKey] || {};

                return (
                  <div className="space-y-6 animate-in fade-in">
                    {/* Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Generated Scripts</h2>
                        <p className="text-xs text-slate-500 mt-1">Select a variation and edit the text directly.</p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={handleCopyFullScript}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all hover:scale-102 active:scale-98"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copyFeedback === 'fullScript' ? 'Copied!' : 'Copy Full Script'}</span>
                        </button>
                        <button
                          onClick={handleDownloadScript}
                          className="px-3.5 py-2 bg-[#5046E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all hover:scale-102 active:scale-98"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Script</span>
                        </button>
                      </div>
                    </div>

                    {/* Compact Variation Selector Cards with Gist */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {variationConfigs.map((cfg) => {
                        const scriptData = scripts[cfg.key] || {};
                        const isSelected = activeKey === cfg.key;
                        const displayTitle = scriptData.title || cfg.defaultTitle;
                        const gist = scriptData.gist || cfg.fallbackGist;

                        return (
                          <button
                            key={cfg.key}
                            type="button"
                            onClick={() => setSelectedScriptKey(cfg.key)}
                            className={`p-3.5 rounded-xl text-left border transition-all relative flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-white border-[#5046E5] ring-2 ring-[#5046E5]/20 shadow-sm'
                                : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1.5">
                              <span className={`text-xs font-bold ${isSelected ? 'text-[#5046E5]' : 'text-slate-800'}`}>
                                {cfg.badgeNumber}: {displayTitle}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5046E5]/10 text-[#5046E5]">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {gist}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {/* 4 Segregated Editable Script Sections */}
                    <div className="space-y-4">
                      {/* 1. Hook (0-3s) */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-gray-150 flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Hook (0-3s)</h3>
                            <p className="text-[11px] text-slate-400 font-medium">Impactful, scroll-stopping, addresses audience</p>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Edit2 className="w-2.5 h-2.5" /> Editable
                          </span>
                        </div>
                        <div className="p-4">
                          <AutoResizeTextarea
                            value={activeScript.hook || ''}
                            onChange={(e) => handleScriptFieldChange('hook', e.target.value)}
                            placeholder="Enter Hook visual & audio directions..."
                            className="w-full bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white rounded-lg p-3 text-xs text-slate-700 font-medium leading-relaxed border border-slate-200/60 focus:border-[#5046E5] focus:ring-1 focus:ring-[#5046E5]/30 outline-none transition-all resize-none"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* 2. Setup (3-15s) */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-gray-150 flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Setup (3-15s)</h3>
                            <p className="text-[11px] text-slate-400 font-medium">Pain points, viewer benefits</p>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Edit2 className="w-2.5 h-2.5" /> Editable
                          </span>
                        </div>
                        <div className="p-4">
                          <AutoResizeTextarea
                            value={activeScript.setup || ''}
                            onChange={(e) => handleScriptFieldChange('setup', e.target.value)}
                            placeholder="Enter Setup visual & audio directions..."
                            className="w-full bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white rounded-lg p-3 text-xs text-slate-700 font-medium leading-relaxed border border-slate-200/60 focus:border-[#5046E5] focus:ring-1 focus:ring-[#5046E5]/30 outline-none transition-all resize-none"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* 3. Value/Content (15-45s) */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-gray-150 flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Value/Content (15-45s)</h3>
                            <p className="text-[11px] text-slate-400 font-medium">Fast tips, product demo</p>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Edit2 className="w-2.5 h-2.5" /> Editable
                          </span>
                        </div>
                        <div className="p-4">
                          <AutoResizeTextarea
                            value={activeScript.content || ''}
                            onChange={(e) => handleScriptFieldChange('content', e.target.value)}
                            placeholder="Enter Content/Demo visual & audio directions..."
                            className="w-full bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white rounded-lg p-3 text-xs text-slate-700 font-medium leading-relaxed border border-slate-200/60 focus:border-[#5046E5] focus:ring-1 focus:ring-[#5046E5]/30 outline-none transition-all resize-none"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* 4. CTA (Final 3-5s) */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-gray-150 flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">CTA (Final 3-5s)</h3>
                            <p className="text-[11px] text-slate-400 font-medium">Follow, comment, share</p>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Edit2 className="w-2.5 h-2.5" /> Editable
                          </span>
                        </div>
                        <div className="p-4">
                          <AutoResizeTextarea
                            value={activeScript.cta || ''}
                            onChange={(e) => handleScriptFieldChange('cta', e.target.value)}
                            placeholder="Enter Call-to-action visual & audio directions..."
                            className="w-full bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white rounded-lg p-3 text-xs text-slate-700 font-medium leading-relaxed border border-slate-200/60 focus:border-[#5046E5] focus:ring-1 focus:ring-[#5046E5]/30 outline-none transition-all resize-none"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-150">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        &larr; Back to Strategy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveScript(activeKey)}
                        className="px-6 py-2.5 bg-[#5046E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-xs hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Approve & Create Storyboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* STEP 4: STORYBOARD */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-gray-150 pb-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Your Storyboard</h2>
                      <p className="text-xs text-slate-500">
                        Visualizing shot breakdown for {researchBrandName.toUpperCase() || 'the brand'} • Script: {approvedScriptType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setStep(3)} className="px-3 py-1.5 border border-gray-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50">
                        &larr; Back to Scripts
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {frames.map((f, idx) => (
                      <div key={f.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                          <span className="text-xs font-bold text-slate-900">{f.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Panel {idx + 1}
                          </span>
                        </div>

                        <div className="border border-gray-150 rounded-xl overflow-hidden bg-slate-50">
                          <FrameImage promptText={f.action} redrawTrigger={redrawTrigger} index={idx} />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Visual Shot Direction</label>
                          <AutoResizeTextarea
                            value={f.action}
                            onChange={(e) => {
                              const updated = [...frames];
                              updated[idx].action = e.target.value;
                              setFrames(updated);
                            }}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:border-[#db1888]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Voiceover / Audio Line</label>
                          <AutoResizeTextarea
                            value={f.voiceover}
                            onChange={(e) => {
                              const updated = [...frames];
                              updated[idx].voiceover = e.target.value;
                              setFrames(updated);
                            }}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:border-[#db1888]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-4">
                    <button
                      onClick={() => setStep('welcome')}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      &larr; Return to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* EMAIL SIGN IN MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <h3 className="font-bold text-base text-slate-900">Login with Email</h3>
            <input
              type="email"
              placeholder="name@example.com"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-[#db1888]"
            />
            <button
              disabled={!selectedEmail}
              onClick={() => {
                const newUser = {
                  name: creatorProfile.name || '',
                  instagramId: creatorProfile.instagramId || '',
                  email: selectedEmail
                };
                setUser(newUser);
                localStorage.setItem('pitchpal_user_exp9', JSON.stringify(newUser));
                setIsEmailModalOpen(false);
                setStep('onboarding');
              }}
              className="w-full py-3 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
              style={primaryButtonStyle}
            >
              Continue to Profile Setup &rarr;
            </button>
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* VIEW PAST PITCH MODAL */}
      {viewingPitch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-150 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{viewingPitch.date}</span>
                <h3 className="text-xl font-black text-slate-900">{viewingPitch.brand}</h3>
              </div>
              <button
                onClick={() => setViewingPitch(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">{viewingPitch.objective}</p>

            {viewingPitch.scripts?.bestMatch && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-gray-150 text-xs">
                <span className="text-[10px] font-bold text-[#db1888] uppercase">Approved Pitch Script</span>
                <p className="whitespace-pre-line text-slate-700 font-medium">{viewingPitch.scripts.bestMatch.hook}</p>
              </div>
            )}

            <button
              onClick={() => setViewingPitch(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
