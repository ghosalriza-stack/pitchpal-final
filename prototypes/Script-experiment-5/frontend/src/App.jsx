import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, ChevronRight, CheckCircle, Copy, Edit2, Loader2, Play, Download, 
  Mail, Phone, Lock, User, LogOut, ArrowRight, ArrowLeft, Sparkles, Zap, Laptop, 
  Send, MessageCircle, ExternalLink, RefreshCw, X, Check, FileDown, Layers, ShieldCheck, ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const API_BASE_URL = 'http://localhost:5003/api';

// Where the Storyboard Studio app is served.
const STORYBOARD_STUDIO_URL = 'http://localhost:5173';

// Sample identity matching homescreen.pdf (@rizzzz)
const DEMO_USER = {
  name: 'Riza Ghosal',
  instagramId: 'rizzzz',
  niche: 'Beauty & Lifestyle',
  followers: '45K',
};

// Carries the signed-in creator across to Storyboard Studio
function buildStudioUrl(user) {
  const params = new URLSearchParams({
    creator: user?.name || 'Riza Ghosal',
    handle: user?.instagramId || 'rizzzz',
    niche: user?.niche || 'Beauty & Lifestyle',
    followers: user?.followers || '45K',
  });
  return `${STORYBOARD_STUDIO_URL}/?${params.toString()}`;
}

const AutoResizeTextarea = ({ value, onChange, className }) => {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
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

const COUNTRIES = [
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' }
];

const FrameImage = ({ promptText, hfKey, index }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [promptText, hfKey]);

  const imageUrl = `${API_BASE_URL.replace('/api', '')}/api/image?prompt=${encodeURIComponent(promptText)}&hfKey=${encodeURIComponent(hfKey)}&seed=${index * 100}`;

  return (
    <div className="relative group w-full flex flex-col items-center justify-center p-2">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 space-y-2 rounded-xl">
          <Loader2 className="animate-spin w-6 h-6 text-pink-500" />
          <span className="text-xs text-pink-600 font-semibold">Drawing ink sketch...</span>
        </div>
      )}
      
      {error ? (
        <div className="p-3 text-center text-xs text-rose-500 border border-rose-200 bg-rose-50 rounded-xl">
          Failed to load sketch fallback.
        </div>
      ) : (
        <>
          <img 
            src={imageUrl} 
            alt="Frame scene" 
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            className="max-h-[200px] w-auto object-contain rounded-xl border border-slate-200 shadow-sm"
          />
          <small className="text-[10px] text-slate-500 mt-2 text-center italic block max-w-[280px] px-2 truncate leading-tight group-hover:whitespace-normal group-hover:break-words">
            "{promptText}"
          </small>
        </>
      )}
    </div>
  );
};

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('pitchpal_user');
      return savedUser ? JSON.parse(savedUser) : DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  });

  const [step, setStep] = useState(() => {
    try {
      const savedUser = localStorage.getItem('pitchpal_user');
      return savedUser ? 'welcome' : 'welcome';
    } catch {
      return 'welcome';
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // User Authentication & Onboarding State
  const [selectedEmail, setSelectedEmail] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [onboardingData, setOnboardingData] = useState({ 
    name: 'Riza Ghosal', 
    instagramId: 'rizzzz', 
    niche: 'Beauty & Lifestyle', 
    followers: '45K' 
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Pitches list loaded from localStorage or seeded with mockup data matching homescreen.pdf
  const [pitches, setPitches] = useState(() => {
    try {
      const savedPitches = localStorage.getItem('pitchpal_pitches');
      if (savedPitches) return JSON.parse(savedPitches);
    } catch (e) {
      console.error("Error reading pitches from localStorage:", e);
    }
    return [
      {
        id: 'pitch-1',
        brand: 'Fenty',
        date: 'Aug 28',
        objective: 'Showcase Shade Match for Eaze Drop Skin Tint in everyday routine',
        status: 'NO REPLY',
        emailSubject: 'Collab Idea: Filter-Free Everyday Skin Routine with Eaze Drop',
        emailBody: "Hi Fenty Beauty Team!\n\nI'm Riza (@rizzzz), a beauty creator with 45K engaged followers who's obsessed with lightweight, skin-first makeup.\n\nI put together a punchy 30s Reel concept showing a seamless 10-second shade match test comparing Eaze Drop to heavy foundations, highlighting the natural blurring filter effect.\n\nWould love to collaborate on a sponsored integration for your upcoming campaign!\n\nBest,\nRiza",
        dmText: "Hey Fenty Team! 💖 Riza here (@rizzzz). Put together a 30s viral Reel concept for Eaze Drop Skin Tint that my beauty community would love. Would love to send over the pitch deck!",
        scripts: {
          bestMatch: {
            hook: "Visual: Swatching shades side-by-side on cheek.\nAudio: 'Is this the best lightweight skin tint of the year?'",
            setup: "Pain: Heavy foundations cake after 2 hours.\nBenefit: Eaze Drop looks like real skin, filtered.",
            content: "Visual: Applying half face to show seamless blend.\nVO: 'Look at that instant glow without feeling greasy.'",
            cta: "Visual: Holding bottle with radiant smile.\nVO: 'Drop your shade below & check link in bio!'"
          }
        }
      },
      {
        id: 'pitch-2',
        brand: 'Mokobara',
        date: 'Aug 18',
        objective: 'Promote Cabin Pro Luggage for modern aesthetic weekend getaways',
        status: 'REPLIED',
        emailSubject: 'Creator Collab: Aesthetic Travel Packing with Mokobara Cabin Pro',
        emailBody: "Hi Mokobara Team!\n\nI'm Riza, a lifestyle & travel creator (@rizzzz, 45K followers). I've been using your Transit Backpack on my recent trips and love the clean design.\n\nI drafted a dynamic packing-hack Reel showing how to pack 4 days of chic outfits into the Cabin Pro using compression cubes, with smooth seamless transition cuts.\n\nLooking forward to exploring a partnership!\n\nWarm regards,\nRiza",
        dmText: "Hey Mokobara team! ✨ Huge fan of your travel gear. I designed a high-converting packing reel for the Cabin Pro that fits my aesthetic travel feed. Let's collab!",
        scripts: {
          bestMatch: {
            hook: "Visual: Fast-paced suitcase open with sleek Mokobara branding.\nAudio: 'How I pack 4 days in a carry-on with zero stress.'",
            setup: "Pain: Bulky luggage that breaks wheels.\nBenefit: Whisper-quiet Hinomoto wheels and built-in laundry bag.",
            content: "Visual: Layering outfits effortlessly into compartments.\nVO: 'Everything locks securely into place.'",
            cta: "Visual: Gliding through airport terminal.\nVO: 'Upgrade your travel game with code RIZA10!'"
          }
        }
      },
      {
        id: 'pitch-3',
        brand: 'Rare Beauty',
        date: 'Aug 8',
        objective: 'Promote Soft Pinch Liquid Blush launch targeting Gen Z',
        status: 'OPENED',
        emailSubject: 'Collab Proposal: Soft Pinch Liquid Blush 3-Second Blend Test',
        emailBody: "Hi Rare Beauty PR Team,\n\nI'm Riza (@rizzzz, 45K followers), a creator dedicated to clean girl aesthetic and radiant skin.\n\nI've designed a 3-part Reel series demonstrating the 1-dot blush hack with Soft Pinch Blush, showing its incredible pigment and dewy staying power throughout a full 12-hour day.\n\nLet's connect on a collab!\n\nBest,\nRiza",
        dmText: "Hi Rare Beauty! 💕 Made a high-energy 1-dot Soft Pinch blush concept that my followers will obsess over. Can I send over the pitch storyboard?",
        scripts: {
          bestMatch: {
            hook: "Visual: One tiny dot applied to cheekbone.\nAudio: 'If you are still using powder blush, stop right now.'",
            setup: "Pain: Blushes fade by midday or blend patchy.\nBenefit: One single dot gives all-day dewy flush.",
            content: "Visual: Seamless tapping blend with fingertips.\nVO: 'Look at that pigmented, dewy finish in 3 seconds.'",
            cta: "Visual: Smiling at camera holding the blush bottle.\nVO: 'Tap link in bio to grab your shade!'"
          }
        }
      },
      {
        id: 'pitch-4',
        brand: 'Klook',
        date: 'July 28',
        objective: 'Highlight hassle-free activity bookings for Singapore & Bali trips',
        status: 'NO REPLY',
        emailSubject: 'Partnership Idea: Seamless Southeast Asia Itinerary via Klook',
        emailBody: "Hi Klook Marketing Team,\n\nI'm Riza (@rizzzz), a creator curating aesthetic travel itineraries for Gen Z & millennial explorers.\n\nI created a high-engagement Reel breakdown showing how to book eSIMs, express attraction passes, and private transfers all in one tap via Klook.\n\nExcited to partner up!\n\nCheers,\nRiza",
        dmText: "Hey Klook team! ✈️ Planning an upcoming Southeast Asia travel series and mapped out a dedicated Klook booking workflow reel. Let's make it happen!",
        scripts: {
          bestMatch: {
            hook: "Visual: POV walking past long ticket queue with instant QR scan.\nAudio: 'Never wait in a tourist line again.'",
            setup: "Pain: Confusing booking sites and wasted vacation hours.\nBenefit: Instant confirmation and discounts directly in app.",
            content: "Visual: App screen tapping + gorgeous Bali waterfall shot.\nVO: 'Booked in 30 seconds before breakfast.'",
            cta: "Visual: Enjoying attraction with friends.\nVO: 'Use promo code RIZZKLOOK for 10% off your next adventure!'"
          }
        }
      }
    ];
  });

  const [viewingPitch, setViewingPitch] = useState(null);

  // Step 1 State
  const [briefText, setBriefText] = useState('');
  const [canvaLink, setCanvaLink] = useState('');
  const [brandName, setBrandName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Step 2 State
  const [analysis, setAnalysis] = useState({ objective: '', audience: '', coreIdea: '' });

  // Step 3 State
  const [scripts, setScripts] = useState(null);
  const [selectedScriptType, setSelectedScriptType] = useState('bestMatch');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Storyboard (Step 4) State
  const [storyboardFrames, setStoryboardFrames] = useState(null);
  const [isStoryboardLoading, setIsStoryboardLoading] = useState(false);
  const [storyboardError, setStoryboardError] = useState('');
  const [hfKey, setHfKey] = useState(() => {
    try {
      return localStorage.getItem('pitchpal_hf_key') || '';
    } catch {
      return '';
    }
  });

  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const countryDropdownRef = useRef(null);

  useEffect(() => {
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

  useEffect(() => {
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

  const handleSaveHfKey = (key) => {
    setHfKey(key);
    try {
      localStorage.setItem('pitchpal_hf_key', key);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginWithDemo = () => {
    setUser(DEMO_USER);
    try {
      localStorage.setItem('pitchpal_user', JSON.stringify(DEMO_USER));
    } catch (e) {
      console.error(e);
    }
    setStep('welcome');
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.length < 5) {
      alert('Please enter a valid phone number.');
      return;
    }
    setOtpInput(['', '', '', '']);
    setOtpError('');
    setStep('otp_input');
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpInput];
    newOtp[index] = value.slice(-1);
    setOtpInput(newOtp);

    // Auto-advance focus to next box
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const entered = otpInput.join('');
    if (entered.length < 4) {
      setOtpError('Please enter all 4 verification digits.');
      return;
    }
    setOnboardingData(prev => ({
      ...prev,
      name: prev.name || 'Riza Ghosal',
      instagramId: prev.instagramId || 'rizzzz'
    }));
    setStep('onboarding');
  };

  const handleCompleteOnboarding = (e) => {
    e.preventDefault();
    const newUser = {
      name: onboardingData.name.trim() || 'Riza Ghosal',
      instagramId: (onboardingData.instagramId.trim() || 'rizzzz').replace(/^@/, ''),
      niche: onboardingData.niche || 'Beauty & Lifestyle',
      followers: onboardingData.followers || '45K'
    };
    setUser(newUser);
    try {
      localStorage.setItem('pitchpal_user', JSON.stringify(newUser));
    } catch (err) {
      console.error(err);
    }
    setStep('welcome');
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('files', file));
      formData.append('canvaLink', canvaLink);
      formData.append('text', briefText);
      formData.append('brandName', brandName);

      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        setAnalysis({
          objective: response.data.objective || (brandName ? `Promote ${brandName}` : 'Launch campaign'),
          audience: response.data.audience || 'Gen Z and social media shoppers',
          coreIdea: response.data.coreIdea || briefText || 'High-energy 3-second proof hook'
        });
        if (response.data.brandName && !brandName) {
          setBrandName(response.data.brandName);
        }
        setStep(2);
      }
    } catch (error) {
      console.error('Error analyzing brief:', error);
      // Smart local fallback so demo works even without backend
      setAnalysis({
        objective: brandName ? `Promote ${brandName} with high-converting influencer Reel` : 'Showcase key product benefits and drive engagement',
        audience: 'Gen Z and young millennial shoppers seeking authentic recommendations',
        coreIdea: briefText || 'Demonstrate 3-second application test showing before & after contrast'
      });
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, {
        objective: analysis.objective,
        audience: analysis.audience,
        coreIdea: analysis.coreIdea,
        creatorName: user?.name,
        instagramId: user?.instagramId
      });

      if (response.data && response.data.bestMatch) {
        setScripts(response.data);
        setStep(3);
      } else {
        throw new Error('Invalid format');
      }
    } catch (error) {
      console.error('Error generating scripts:', error);
      // Smart fallback scripts
      setScripts({
        simple: {
          hook: "Visual: Direct product unboxing.\nAudio: 'Here is what nobody tells you about this product.'",
          setup: "Pain: Traditional routines take too long.\nBenefit: Works in under 60 seconds.",
          content: "Visual: Quick application demo.\nVO: 'Just apply a few drops on clean skin.'",
          cta: "Visual: Final polished look.\nVO: 'Check the link in my bio to shop!'"
        },
        bestMatch: {
          hook: `Visual: Fast-paced side-by-side test with ${brandName || 'the product'}.\nAudio: 'Is this the biggest beauty hack of 2026?'`,
          setup: "Pain: Most products feel greasy or fade by 2 PM.\nBenefit: Ultra-lightweight and lasts all day.",
          content: "Visual: Close-up seamless texture blend.\nVO: 'Look at that radiant glass-skin glow in seconds flat.'",
          cta: "Visual: Holding bottle with a confident smile.\nVO: 'Save this post and drop your questions below!'"
        },
        boldMove: {
          hook: "Visual: Tossing old cluttered makeup bag aside.\nAudio: 'I stopped using 5 products after trying this ONE.'",
          setup: "Pain: Spending $200 on multi-step routines that do nothing.\nBenefit: All-in-one minimal powerhouse formula.",
          content: "Visual: Instant before vs after split screen.\nVO: 'The results speak for themselves.'",
          cta: "Visual: Winking at camera.\nVO: 'Tag a friend who needs to try this now!'"
        }
      });
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    setIsStoryboardLoading(true);
    setStoryboardError('');
    setStep(4);

    const activeScript = scripts[selectedScriptType];
    const fullScriptText = `HOOK: ${activeScript.hook}\nSETUP: ${activeScript.setup}\nCONTENT: ${activeScript.content}\nCTA: ${activeScript.cta}`;

    try {
      const response = await axios.post(`${API_BASE_URL}/storyboard`, {
        contentGoal: 'Short-form social pitch video',
        targetAudience: analysis.audience,
        brief: analysis.coreIdea,
        script: fullScriptText
      });

      if (response.data?.frames) {
        setStoryboardFrames(response.data.frames);
      } else {
        throw new Error('No frames returned');
      }
    } catch (error) {
      console.error('Error generating storyboard frames:', error);
      // Smart visual fallback frames
      setStoryboardFrames([
        {
          frame_number: '01',
          action: 'Close-up dynamic hook shot introducing the product with sleek in-panel headline',
          voiceover: activeScript.hook,
          image_prompt: 'Black and white storyboard line art sketch of a smiling beauty creator swatching cosmetics on cheek, clean ink drawing',
          director_notes: 'Fast zoom in (0-3s), high energy lighting'
        },
        {
          frame_number: '02',
          action: 'Medium shot demonstrating pain point vs immediate solution',
          voiceover: activeScript.setup,
          image_prompt: 'Storyboard panel line art of hands demonstrating skincare bottle with speech bubble and label annotations',
          director_notes: 'Split screen comparison'
        },
        {
          frame_number: '03',
          action: 'Over-the-shoulder perspective showing seamless application and radiant texture',
          voiceover: activeScript.content,
          image_prompt: 'Black and white storyboard drawing of creator looking into mirror applying skincare serum, clean ink sketch',
          director_notes: 'Macro focus on finish'
        },
        {
          frame_number: '04',
          action: 'Hero call to action shot holding the product packaging with radiant smile',
          voiceover: activeScript.cta,
          image_prompt: 'Line art advertising storyboard of creator holding product bottle next to smiling face, bold all-caps headline',
          director_notes: 'Outro graphic overlay'
        }
      ]);
    } finally {
      setIsStoryboardLoading(false);
    }
  };

  const handleCopyScript = () => {
    if (!scripts || !scripts[selectedScriptType]) return;
    const s = scripts[selectedScriptType];
    const text = `HOOK:\n${s.hook}\n\nSETUP:\n${s.setup}\n\nCONTENT:\n${s.content}\n\nCTA:\n${s.cta}`;
    navigator.clipboard.writeText(text);
    alert('Full script copied to clipboard!');
  };

  const handleDownloadPDF = () => {
    if (!scripts || !scripts[selectedScriptType]) return;
    const s = scripts[selectedScriptType];
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(`PitchPal — ${selectedScriptType.toUpperCase()} SCRIPT`, 15, 20);
    doc.setFontSize(10);
    doc.text(`Creator: ${user?.name} (@${user?.instagramId}) | Generated on ${new Date().toLocaleDateString()}`, 15, 28);
    doc.line(15, 32, 195, 32);

    let y = 42;
    const sections = [
      { name: 'HOOK (0-3s)', text: s.hook },
      { name: 'SETUP (3-15s)', text: s.setup },
      { name: 'CONTENT (15-45s)', text: s.content },
      { name: 'CTA (Final 3-5s)', text: s.cta }
    ];

    sections.forEach(sec => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(sec.name, 15, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(sec.text, 180);
      doc.text(lines, 15, y);
      y += lines.length * 6 + 8;
    });

    doc.save(`pitchpal-script-${selectedScriptType}.pdf`);
  };

  const handleDownloadDoc = () => {
    if (!scripts || !scripts[selectedScriptType]) return;
    const s = scripts[selectedScriptType];
    const docContent = `
      <html>
      <head><meta charset='utf-8'><title>Script</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>PitchPal Generated Script (${selectedScriptType})</h2>
        <p><b>Creator:</b> ${user?.name} (@${user?.instagramId})</p>
        <hr/>
        <h3>HOOK (0-3s)</h3><p>${s.hook.replace(/\n/g, '<br/>')}</p>
        <h3>SETUP (3-15s)</h3><p>${s.setup.replace(/\n/g, '<br/>')}</p>
        <h3>CONTENT (15-45s)</h3><p>${s.content.replace(/\n/g, '<br/>')}</p>
        <h3>CTA</h3><p>${s.cta.replace(/\n/g, '<br/>')}</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitchpal-script-${selectedScriptType}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPitchesCount = pitches.length;
  const openedPitchesCount = pitches.filter(p => p.status === 'OPENED' || p.status === 'REPLIED' || p.status === '👀 OPENED' || p.status === '✅ REPLIED').length;
  const responsesReceivedCount = pitches.filter(p => p.status === 'REPLIED' || p.status === '✅ REPLIED').length;
  const responseRatePct = totalPitchesCount > 0 ? Math.round((responsesReceivedCount / totalPitchesCount) * 100) : 25;

  const currentHandle = user?.instagramId || 'rizzzz';
  const creatorInitial = (user?.name ? user.name[0] : (currentHandle ? currentHandle[0] : 'R')).toUpperCase();

  const isAuthStep = ['login', 'phone_input', 'otp_input', 'onboarding'].includes(step);

  return (
    <div className="min-h-screen bg-mesh-pastel text-slate-800 flex flex-col font-sans relative">
      {/* Soft decorative background glints & sparkles */}
      <div className="absolute top-28 left-8 text-pink-300 text-2xl select-none pointer-events-none animate-pulse-subtle">✦</div>
      <div className="absolute top-44 right-12 text-purple-300 text-3xl select-none pointer-events-none animate-float">✨</div>
      <div className="absolute bottom-40 left-16 text-sky-300 text-2xl select-none pointer-events-none animate-pulse-subtle">✦</div>
      <div className="absolute bottom-12 right-20 text-pink-300 text-3xl select-none pointer-events-none animate-float">✨</div>

      {/* Global Navigation Header matching homescreen.pdf */}
      <header className="glass-nav sticky top-0 z-50 px-6 md:px-12 py-3.5 flex items-center justify-between shadow-xs">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none" 
          onClick={() => {
            if (user) setStep('welcome');
            else setStep('login');
          }}
        >
          <span className="text-2xl text-pink-500 font-extrabold flex items-center">
            ⚡
          </span>
          <span className="tracking-tight text-slate-900 font-extrabold text-xl">
            PitchPal
          </span>
        </div>

        {/* Center / Right Nav Items */}
        {user && !isAuthStep ? (
          <div className="flex items-center gap-6 md:gap-8">
            <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600">
              <button 
                onClick={() => setStep('welcome')} 
                className={`hover:text-pink-600 transition-colors ${step === 'welcome' ? 'text-pink-600 font-bold' : ''}`}
              >
                Home
              </button>
              <button 
                onClick={() => setStep('welcome')} 
                className="hover:text-pink-600 transition-colors"
              >
                My Pitches
              </button>
              <button 
                onClick={() => {
                  setStep(1);
                  setBriefText('');
                  setCanvaLink('');
                  setBrandName('');
                  setSelectedFiles([]);
                  setScripts(null);
                }} 
                className={`hover:text-pink-600 transition-colors ${step === 1 ? 'text-pink-600 font-bold' : ''}`}
              >
                New Pitch
              </button>
            </nav>
            
            {/* User Profile Avatar with Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-fuchsia-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-pink-500/25 border-2 border-white hover:scale-105 active:scale-95 transition-transform"
              >
                {creatorInitial}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl py-2 z-50 text-slate-800 animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-fuchsia-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {creatorInitial}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-sm text-slate-900 truncate">{user?.name || 'Riza Ghosal'}</p>
                      <p className="text-xs text-pink-600 font-semibold truncate">@{currentHandle}</p>
                    </div>
                  </div>

                  <div className="py-1">
                    <a
                      href={buildStudioUrl(user)}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-700 flex items-center gap-2 transition-colors"
                    >
                      <Laptop className="w-3.5 h-3.5 text-pink-500" />
                      <span>Open Storyboard Studio</span>
                    </a>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button 
                      onClick={() => {
                        setUser(null);
                        try {
                          localStorage.removeItem('pitchpal_user');
                        } catch (e) {
                          console.error(e);
                        }
                        setStep('login');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoginWithDemo}
              className="text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-3.5 py-1.5 border border-pink-200/80 rounded-full transition-colors shadow-xs"
            >
              ✨ Quick Demo Sign In
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 z-10 w-full max-w-6xl mx-auto">
        
        {/* ========================================================= */}
        {/* 1. LOGIN SCREEN */}
        {/* ========================================================= */}
        {step === 'login' && (
          <div className="max-w-md w-full glass-card rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300 my-auto">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-pink-200/80 bg-pink-50 text-xs font-semibold text-pink-600">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />
                <span>AI-Powered Influencer Outreach</span>
              </div>
              
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Pitch to Any Brand <br/> in 10 Minutes
              </h2>
              
              <p className="text-slate-600 text-xs md:text-sm">
                Sign in to manage pitches, generate shootable storyboards, and export custom outreach.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Primary Demo Button */}
              <button
                onClick={handleLoginWithDemo}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white rounded-full font-bold text-sm shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>🚀 Continue with demo account (@rizzzz)</span>
              </button>

              {/* Phone Button */}
              <button
                onClick={() => setStep('phone_input')}
                className="w-full py-3 px-6 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-full font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-pink-500" />
                <span>Continue with Phone Number</span>
              </button>

              {/* Google / Email Button */}
              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full py-3 px-6 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-full font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-pink-500" />
                <span>Continue with Google / Email</span>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] text-slate-400">
                Demo portal: Any test account or number can be entered with instant zero-auth verification.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. PHONE INPUT SCREEN */}
        {/* ========================================================= */}
        {step === 'phone_input' && (
          <div className="max-w-md w-full glass-card rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 my-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto border border-pink-200">
                <Phone className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Login with Phone</h2>
              <p className="text-xs text-slate-500">Enter your mobile number to receive a one-time passcode.</p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  {/* Country Selector Dropdown */}
                  <div className="relative shrink-0" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="h-full bg-white border border-slate-200 rounded-2xl px-3 py-2.5 text-slate-800 flex items-center gap-1.5 focus:outline-none focus:border-pink-500 transition-colors shadow-xs"
                    >
                      <span className="text-base">{selectedCountry.flag}</span>
                      <span className="font-bold text-xs">{selectedCountry.code}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {isCountryDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-52 overflow-y-auto py-1">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsCountryDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-pink-50 hover:text-pink-600 flex items-center justify-between"
                          >
                            <span>{c.flag} {c.name}</span>
                            <span className="font-bold text-slate-400">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium text-slate-900"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white rounded-full font-bold text-sm shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Send OTP Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep('login')}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-700 py-1"
              >
                ← Back to sign in options
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. OTP VERIFICATION SCREEN */}
        {/* ========================================================= */}
        {step === 'otp_input' && (
          <div className="max-w-md w-full glass-card rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 my-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto border border-pink-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Enter Verification Code</h2>
              <p className="text-xs text-slate-500">
                We sent a 4-digit code to <span className="font-bold text-slate-800">{selectedCountry.code} {phoneInput || '555-0199'}</span>.
              </p>
            </div>

            <div className="bg-pink-50/70 border border-pink-200/60 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-pink-700">✨ Demo Mode: Enter any 4 digits to proceed</span>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    id={`otp-digit-${idx}`}
                    type="text"
                    maxLength={1}
                    value={otpInput[idx] || ''}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 border border-slate-200 rounded-2xl text-center text-2xl font-extrabold focus:ring-2 focus:ring-pink-500 bg-white outline-none shadow-xs text-slate-900"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-center text-xs font-semibold text-rose-600">{otpError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white rounded-full font-bold text-sm shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('phone_input')}
                  className="font-bold text-slate-400 hover:text-slate-700"
                >
                  ← Edit Phone
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpInput(['1', '2', '3', '4']);
                    alert('Auto-filled test code: 1234');
                  }}
                  className="font-bold text-pink-600 hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. ONBOARDING SCREEN */}
        {/* ========================================================= */}
        {step === 'onboarding' && (
          <div className="max-w-md w-full glass-card rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 my-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-fuchsia-500 text-white flex items-center justify-center mx-auto shadow-md shadow-pink-500/25 font-bold text-lg">
                ✨
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Setup Creator Profile</h2>
              <p className="text-xs text-slate-500">Personalize your brand outreach emails and video storyboards.</p>
            </div>

            <form onSubmit={handleCompleteOnboarding} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Riza Ghosal"
                  value={onboardingData.name}
                  onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Instagram / TikTok Handle</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500 font-bold text-sm">@</span>
                  <input
                    type="text"
                    placeholder="rizzzz"
                    value={onboardingData.instagramId.replace(/^@/, '')}
                    onChange={(e) => setOnboardingData({ ...onboardingData, instagramId: e.target.value.replace(/^@/, '') })}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-8 pr-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Niche</label>
                  <select
                    value={onboardingData.niche}
                    onChange={(e) => setOnboardingData({ ...onboardingData, niche: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-pink-500 outline-none font-medium text-slate-800"
                  >
                    <option value="Beauty & Lifestyle">Beauty & Lifestyle</option>
                    <option value="Skincare & Wellness">Skincare & Wellness</option>
                    <option value="Fashion & Aesthetics">Fashion & Aesthetics</option>
                    <option value="Travel & Adventure">Travel & Adventure</option>
                    <option value="Tech & Gadgets">Tech & Gadgets</option>
                    <option value="Food & Cooking">Food & Cooking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Follower Count</label>
                  <input
                    type="text"
                    placeholder="45K"
                    value={onboardingData.followers}
                    onChange={(e) => setOnboardingData({ ...onboardingData, followers: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-pink-500 outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white rounded-full font-bold text-sm shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Complete Profile & Start Pitching</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. HOMESCREEN.PDF EXACT HERO & CARDS DASHBOARD VIEW */}
        {/* ========================================================= */}
        {step === 'welcome' && (
          <div className="w-full max-w-4xl flex flex-col gap-8 my-auto animate-in fade-in duration-300">
            
            {/* Hero Section */}
            <div className="text-center space-y-4 pt-2 pb-2 relative">
              {/* Floating Sparkle next to Title */}
              <div className="absolute top-1/2 -right-4 md:right-8 text-sky-400 text-2xl select-none pointer-events-none animate-pulse-subtle">
                ✨
              </div>

              {/* Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-pink-200/80 bg-white/90 shadow-xs text-xs font-semibold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />
                <span>AI - powered influencer outreach</span>
              </div>
              
              {/* Headline */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                Pitch to any brand in 10 minutes
              </h1>
              
              {/* Subtitle */}
              <p className="text-slate-600 text-sm md:text-base font-medium">
                Ready to pitch your next dream brand, <span className="font-bold text-slate-900">@{currentHandle}</span>?
              </p>

              {/* Primary CTA Gradient Button */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <button
                  onClick={() => {
                    setStep(1);
                    setBriefText('');
                    setCanvaLink('');
                    setBrandName('');
                    setSelectedFiles([]);
                    setScripts(null);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white font-extrabold rounded-full transition-all shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 active:scale-95 transform duration-150 text-sm tracking-wide flex items-center justify-center gap-2"
                >
                  <span>Pitch a New Brand</span>
                </button>

                <a
                  href={buildStudioUrl(user)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 font-bold rounded-full transition-all shadow-xs hover:border-pink-300 active:scale-95 transform duration-150 text-sm flex items-center justify-center gap-2"
                >
                  <Laptop className="w-4 h-4 text-pink-500" />
                  <span>Open Storyboard Studio</span>
                </a>
              </div>
            </div>

            {/* Two Side-by-Side Glass Cards exactly matching homescreen.pdf */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* CARD 1: RECENT PITCHES */}
              <div className="glass-card rounded-3xl p-6 md:p-7 flex flex-col space-y-4">
                <h3 className="text-center font-extrabold text-slate-900 text-base md:text-lg tracking-wider uppercase">
                  RECENT PITCHES
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm border-collapse">
                    <thead>
                      <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <th className="pb-3 font-bold">BRAND</th>
                        <th className="pb-3 font-bold">DATE</th>
                        <th className="pb-3 font-bold">STATUS</th>
                        <th className="pb-3 font-bold text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {pitches.map((pitch) => {
                        const statusNormalized = pitch.status.replace(/[^A-Z\s]/g, '').trim();
                        return (
                          <tr key={pitch.id} className="hover:bg-pink-50/20 transition-colors">
                            <td className="py-3 font-bold text-slate-900">{pitch.brand}</td>
                            <td className="py-3 text-slate-500 font-medium">{pitch.date}</td>
                            <td className="py-3">
                              {statusNormalized.includes('NO REPLY') ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200/80">
                                  NO REPLY
                                </span>
                              ) : statusNormalized.includes('REPLIED') ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                                  REPLIED
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200/80">
                                  OPENED
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => setViewingPitch(pitch)}
                                className="text-pink-600 hover:text-pink-700 text-xs font-bold transition-colors hover:underline"
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

              {/* CARD 2: PITCHING STATS */}
              <div className="glass-card rounded-3xl p-6 md:p-7 flex flex-col justify-between space-y-4 relative">
                {/* Decorative sparkle in bottom right */}
                <div className="absolute -bottom-3 -right-3 text-sky-400 text-xl select-none pointer-events-none animate-float">
                  ✨
                </div>

                <div className="space-y-4">
                  <h3 className="text-center font-extrabold text-slate-900 text-base md:text-lg tracking-wider uppercase">
                    PITCHING STATS
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm border-collapse">
                      <thead>
                        <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                          <th className="pb-3 font-bold">BRAND</th>
                          <th className="pb-3 font-bold text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                        <tr>
                          <td className="py-3 text-slate-700">Total Pitches Sent</td>
                          <td className="py-3 text-right font-extrabold text-slate-900">{totalPitchesCount}</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-slate-700">Pitches Opened</td>
                          <td className="py-3 text-right font-extrabold text-slate-900">{openedPitchesCount}</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-slate-700">Responses Received</td>
                          <td className="py-3 text-right font-extrabold text-slate-900">{responsesReceivedCount}</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-slate-700">Response Rate</td>
                          <td className="py-3 text-right font-extrabold text-pink-600">{responseRatePct}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Creator Mini Identity */}
                <div className="bg-pink-50/50 border border-pink-100/80 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-fuchsia-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      {creatorInitial}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-slate-900 truncate">{user?.name || 'Riza Ghosal'}</p>
                      <p className="text-[11px] text-pink-600 font-semibold truncate">@{currentHandle}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                    {user?.followers || '45K'} followers
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. STEP 1: UPLOAD BRIEF & INPUT FORM */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="w-full max-w-3xl glass-card rounded-3xl p-6 md:p-10 space-y-6 my-auto animate-in fade-in duration-200">
            {/* Header / Stepper Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                  Step 1 of 4 — Brief
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Provide Your Brief</h2>
                <p className="text-xs text-slate-500 mt-0.5">Upload a campaign brief or customize talking points manually.</p>
              </div>
              <button
                onClick={() => setStep('welcome')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Quick Template Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Quick Template Presets</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { brand: 'Rare Beauty', goal: 'Soft Pinch Liquid Blush 3s blend test' },
                  { brand: 'Mokobara', goal: 'Cabin Pro carry-on packing hack' },
                  { brand: 'Glossier', goal: 'Cloud Paint everyday dewy routine' },
                  { brand: 'Klook', goal: 'Instant attraction pass booking guide' }
                ].map((preset) => (
                  <button
                    key={preset.brand}
                    type="button"
                    onClick={() => {
                      setBrandName(preset.brand);
                      setBriefText(`Campaign focus: ${preset.goal}. Target audience: Gen Z & millennials. Emphasize fast authentic visual proofs.`);
                    }}
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 text-slate-700 transition-all shadow-xs"
                  >
                    ✨ {preset.brand}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div className="border-2 border-dashed border-pink-200/80 rounded-2xl p-6 text-center hover:bg-pink-50/20 transition-colors bg-slate-50/50">
              <Upload className="w-10 h-10 mx-auto text-pink-500 mb-3" />
              <label className="cursor-pointer bg-white text-pink-700 px-4 py-2 rounded-full font-bold text-xs border border-pink-200 hover:bg-pink-50 transition-colors shadow-xs inline-block">
                Browse Brief Files
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
              <p className="text-xs text-slate-400 mt-2">Supports PDF, Word, TXT, Markdown</p>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2 max-w-md mx-auto text-left">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 truncate">
                        <FileText className="w-4 h-4 text-pink-500 shrink-0"/>
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} 
                        className="text-slate-400 hover:text-rose-500 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Brand Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rare Beauty, Glossier, Mokobara" 
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-pink-500 bg-white font-medium outline-none" 
                  value={brandName} 
                  onChange={e => setBrandName(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Canva / Doc Link (Optional)</label>
                <input 
                  type="text" 
                  placeholder="https://canva.com/..." 
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-pink-500 bg-white font-medium outline-none" 
                  value={canvaLink} 
                  onChange={e => setCanvaLink(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Campaign Brief & Talking Points</label>
              <textarea 
                rows="4" 
                placeholder="Describe product goals, tone of voice, key ingredients or unique selling propositions..." 
                className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-pink-500 bg-white font-medium outline-none resize-none" 
                value={briefText} 
                onChange={e => setBriefText(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button 
                onClick={() => setStep('welcome')} 
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
              >
                ← Back
              </button>
              <button 
                onClick={handleAnalyze} 
                disabled={isLoading || (!briefText && !canvaLink && selectedFiles.length === 0 && !brandName)} 
                className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white px-7 py-3 rounded-full font-bold text-sm disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-pink-500/25 active:scale-95 transition-all"
              >
                {isLoading ? <><Loader2 className="animate-spin w-4 h-4"/> Analyzing Brief...</> : <>Analyze Strategy <ChevronRight className="w-4 h-4"/></>}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. STEP 2: REVIEW STRATEGY */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="w-full max-w-3xl glass-card rounded-3xl p-6 md:p-10 space-y-6 my-auto animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                Step 2 of 4 — Strategy Review
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Review Pitch Strategy</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tweak the extracted objective, audience, and core angle before generating script options.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50/70 border border-slate-200/70 p-4 rounded-2xl space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-pink-600">
                  Campaign Objective
                </label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none" 
                  value={analysis.objective} 
                  onChange={e => setAnalysis({...analysis, objective: e.target.value})} 
                />
              </div>

              <div className="bg-slate-50/70 border border-slate-200/70 p-4 rounded-2xl space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-600">
                  Target Audience
                </label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none" 
                  value={analysis.audience} 
                  onChange={e => setAnalysis({...analysis, audience: e.target.value})} 
                />
              </div>

              <div className="bg-slate-50/70 border border-slate-200/70 p-4 rounded-2xl space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Core Creative Hook / Angle
                </label>
                <textarea 
                  rows="3" 
                  className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none resize-none" 
                  value={analysis.coreIdea} 
                  onChange={e => setAnalysis({...analysis, coreIdea: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button 
                onClick={() => setStep(1)} 
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
              >
                ← Back
              </button>
              <button 
                onClick={handleGenerate} 
                disabled={isLoading} 
                className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white px-7 py-3 rounded-full font-bold text-sm disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-pink-500/25 active:scale-95 transition-all"
              >
                {isLoading ? <><Loader2 className="animate-spin w-4 h-4"/> Generating Script Options...</> : <>Generate Scripts <ChevronRight className="w-4 h-4"/></>}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. STEP 3: SCRIPT SELECTION & STRICT EDITOR */}
        {/* ========================================================= */}
        {step === 3 && scripts && (
          <div className="w-full max-w-4xl glass-card rounded-3xl p-6 md:p-10 space-y-6 my-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                  Step 3 of 4 — Script Selection
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Generated Video Scripts</h2>
                <p className="text-xs text-slate-500">Pick a creative variation and refine any scene line by line.</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopyScript} 
                  className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-pink-500"/> Copy Full Script
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-pink-500"/> Export
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1 overflow-hidden">
                      <button 
                        onClick={() => {
                          handleDownloadPDF();
                          setIsDropdownOpen(false);
                        }} 
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2"
                      >
                        Download PDF (.pdf)
                      </button>
                      <button 
                        onClick={() => {
                          handleDownloadDoc();
                          setIsDropdownOpen(false);
                        }} 
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2 border-t border-slate-100"
                      >
                        Download Word (.doc)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Script Variant Selector */}
            <div className="grid grid-cols-3 gap-3 bg-slate-100/70 p-1.5 rounded-2xl">
              {[
                { id: 'bestMatch', label: '⭐ Best Match' },
                { id: 'simple', label: '🛡️ Simple & Safe' },
                { id: 'boldMove', label: '🔥 Bold Move' }
              ].map(type => (
                <button 
                  key={type.id}
                  onClick={() => setSelectedScriptType(type.id)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all text-center
                    ${selectedScriptType === type.id 
                      ? 'bg-white text-pink-600 shadow-sm ring-1 ring-pink-200' 
                      : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* 4-Part Script Editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'hook', label: 'Hook (0-3s)', desc: 'Scroll-stopping visual & audio prompt', border: 'border-pink-200/80', tag: 'bg-pink-50 text-pink-600' },
                { key: 'setup', label: 'Setup (3-15s)', desc: 'Highlight viewer pain point & solution', border: 'border-purple-200/80', tag: 'bg-purple-50 text-purple-600' },
                { key: 'content', label: 'Value / Content (15-45s)', desc: 'Product demo & core benefit', border: 'border-indigo-200/80', tag: 'bg-indigo-50 text-indigo-600' },
                { key: 'cta', label: 'CTA (Final 3-5s)', desc: 'Clear link-in-bio or comment prompt', border: 'border-rose-200/80', tag: 'bg-rose-50 text-rose-600' }
              ].map(section => (
                <div key={section.key} className={`border ${section.border} rounded-2xl p-4 bg-white/90 shadow-xs space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${section.tag}`}>
                      {section.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{section.desc}</span>
                  </div>
                  <AutoResizeTextarea 
                    className="w-full p-2.5 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-xs md:text-sm text-slate-800 font-medium bg-slate-50/50" 
                    value={scripts[selectedScriptType][section.key]} 
                    onChange={e => {
                      const newScripts = { ...scripts };
                      newScripts[selectedScriptType][section.key] = e.target.value;
                      setScripts(newScripts);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button 
                onClick={() => setStep(2)} 
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
              >
                ← Back to Strategy
              </button>
              <button 
                onClick={handleGenerateStoryboard} 
                className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white px-7 py-3 rounded-full font-bold text-sm shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>Approve & Create Storyboard</span>
                <ArrowRight className="w-4 h-4"/>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 9. STEP 4: STORYBOARD VIEW */}
        {/* ========================================================= */}
        {step === 4 && (
          <div className="w-full max-w-4xl glass-card rounded-3xl p-6 md:p-10 space-y-6 my-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                  Step 4 of 4 — Visual Storyboard
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Your Storyboard Panels</h2>
                <p className="text-xs text-slate-500">Visualizing the script structure with generated line art sketches.</p>
              </div>

              <button 
                onClick={handleGenerateStoryboard}
                disabled={isStoryboardLoading}
                className="text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-3.5 py-2 rounded-full transition-all shadow-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Redraw Frames
              </button>
            </div>

            {/* Hugging Face API Key Config */}
            <div className="bg-white/80 border border-slate-200/80 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Hugging Face Access Token (Optional)</h4>
                  <p className="text-[11px] text-slate-400">Provide an HF token for Stable Diffusion drawing, or leave blank to use the free public fallback renderer.</p>
                </div>
                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-xs text-pink-600 font-bold hover:underline">Get Token ↗</a>
              </div>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                  value={hfKey} 
                  onChange={(e) => handleSaveHfKey(e.target.value)} 
                  className="flex-1 border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-pink-500 bg-white"
                />
                {hfKey && (
                  <button 
                    onClick={() => handleSaveHfKey('')} 
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Storyboard Rendering */}
            {isStoryboardLoading ? (
              <div className="py-16 text-center space-y-4">
                <Loader2 className="animate-spin w-10 h-10 mx-auto text-pink-500" />
                <h3 className="text-base font-bold text-slate-800">⏳ Sketching your storyboard... Please wait...</h3>
              </div>
            ) : storyboardError ? (
              <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center space-y-3">
                <p className="text-rose-700 font-semibold text-sm">⚠️ {storyboardError}</p>
                <button onClick={handleGenerateStoryboard} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-full">
                  Retry Storyboard Generation
                </button>
              </div>
            ) : storyboardFrames ? (
              <div className="space-y-6">
                {storyboardFrames.map((frame, index) => (
                  <div key={index} className="flex flex-col md:flex-row border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-xs">
                    
                    {/* Left Column: Frame & Image */}
                    <div className="md:w-[45%] border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-col bg-slate-50/50">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                        <span className="font-extrabold uppercase text-[11px] tracking-wider text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                          FRAME {frame.frame_number || `0${index + 1}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">Shot {index + 1} of 4</span>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center justify-center p-2 border border-dashed border-slate-200 rounded-2xl bg-white min-h-[200px] relative overflow-hidden">
                        <FrameImage 
                          promptText={frame.image_prompt} 
                          hfKey={hfKey} 
                          index={index + 1}
                        />
                      </div>
                    </div>
                    
                    {/* Right Column: Details */}
                    <div className="flex-1 flex flex-col divide-y divide-slate-100">
                      <div className="p-4 flex-1 space-y-1">
                        <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          SCENE ACTION
                        </div>
                        <p className="text-slate-800 text-xs md:text-sm leading-relaxed whitespace-pre-line font-medium">
                          {frame.action}
                        </p>
                        {frame.director_notes && (
                          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-dashed border-slate-200">
                            <span className="font-bold text-slate-700">Director Notes:</span> {frame.director_notes}
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 bg-pink-50/20 space-y-1">
                        <div className="text-[10px] font-extrabold uppercase text-pink-500 tracking-wider">
                          VOICEOVER / AUDIO CUE
                        </div>
                        <p className="text-slate-800 text-xs md:text-sm leading-relaxed italic font-serif">
                          "{frame.voiceover}"
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : null}

            {/* Navigation Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100 flex-wrap gap-4">
              <button 
                onClick={() => setStep(3)} 
                disabled={isStoryboardLoading} 
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
              >
                ← Back to Script
              </button>
              
              <div className="flex gap-3">
                <a
                  href={buildStudioUrl(user)}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:border-pink-300 text-xs font-bold text-slate-700 rounded-full transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Laptop className="w-3.5 h-3.5 text-pink-500" />
                  <span>Open in Storyboard Studio</span>
                </a>
                
                <button 
                  onClick={() => {
                    // Save newly created pitch into recent pitches list
                    const newPitchObj = {
                      id: `pitch-${Date.now()}`,
                      brand: brandName || 'New Brand',
                      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      objective: analysis.objective || 'Promote product benefits with viral Reel',
                      status: 'NO REPLY',
                      emailSubject: `Collab Idea: ${brandName || 'Brand'} x @${currentHandle}`,
                      emailBody: `Hi ${brandName || 'Brand'} Team!\n\nI'm ${user?.name || 'Riza'} (@${currentHandle}, ${user?.followers || '45K'} followers).\n\nI've produced a storyboard concept showcasing your product with high-energy visual hooks and clear call-to-actions.\n\nLet's collaborate!\n\nBest,\n${user?.name || 'Riza'}`,
                      dmText: `Hey ${brandName || 'Brand'} team! ✨ Riza here (@${currentHandle}). Put together an illustrated storyboard concept for your product. Would love to send over the pitch deck!`,
                      scripts
                    };
                    setPitches(prev => [newPitchObj, ...prev]);
                    setStep('welcome');
                  }} 
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-lg shadow-pink-500/25 active:scale-95 transition-all"
                >
                  Save to My Pitches
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* EMAIL ACCOUNT SELECTOR MODAL */}
      {/* ========================================================= */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 space-y-5 text-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">Choose an Account</h3>
              <p className="text-xs text-slate-500">Select an account to continue to PitchPal</p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden shadow-xs bg-white">
              {[
                { name: 'Riza Ghosal', email: 'riza.ghosal@gmail.com', avatar: 'RG', bg: 'bg-gradient-to-tr from-rose-500 to-pink-500' },
                { name: 'PitchPal Creator', email: 'creator@pitchpal.ai', avatar: 'PP', bg: 'bg-gradient-to-tr from-purple-500 to-indigo-500' },
                { name: 'Collab Studio', email: 'collab@mystudio.co', avatar: 'CS', bg: 'bg-gradient-to-tr from-amber-500 to-rose-500' }
              ].map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setSelectedEmail(account.email);
                    setIsEmailModalOpen(false);
                    setOnboardingData(prev => ({ ...prev, name: account.name }));
                    setStep('onboarding');
                  }}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-pink-50/50 transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-full ${account.bg} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                    {account.avatar}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-xs text-slate-900">{account.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{account.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PITCH DETAILS MODAL (When clicking "View" from Recent Pitches) */}
      {/* ========================================================= */}
      {viewingPitch && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-2xl w-full p-6 md:p-8 flex flex-col max-h-[85vh] text-slate-800 animate-in fade-in zoom-in duration-200 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200 uppercase tracking-wider">
                    {viewingPitch.date}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border
                    ${viewingPitch.status.includes('NO REPLY') ? 'bg-rose-50 text-rose-600 border-rose-200' : viewingPitch.status.includes('REPLIED') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    {viewingPitch.status}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{viewingPitch.brand} Pitch Package</h3>
              </div>
              <button 
                onClick={() => setViewingPitch(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Campaign Objective</h4>
                <p className="text-xs md:text-sm text-slate-700 font-medium bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                  {viewingPitch.objective}
                </p>
              </div>

              {/* Pitch Email Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-pink-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Pitch Email Draft
                  </h4>
                  <button
                    onClick={() => {
                      const text = `Subject: ${viewingPitch.emailSubject || `Collab: ${viewingPitch.brand}`}\n\n${viewingPitch.emailBody || ''}`;
                      navigator.clipboard.writeText(text);
                      alert('Pitch email copied to clipboard!');
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-pink-600 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-xs"
                  >
                    <Copy className="w-3 h-3" /> Copy Email
                  </button>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs md:text-sm space-y-2 text-slate-700 shadow-xs">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                    Subject: {viewingPitch.emailSubject || `Collab Idea — ${user?.name || 'Riza'} x ${viewingPitch.brand}`}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {viewingPitch.emailBody || "Hi team,\n\nI created a custom video storyboard tailored to your upcoming launch. Would love to explore a partnership!\n\nBest,\nRiza"}
                  </p>
                </div>
              </div>

              {/* Instagram DM Version */}
              {viewingPitch.dmText && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" /> Instagram DM Version
                    </h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(viewingPitch.dmText);
                        alert('DM copied to clipboard!');
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-purple-600 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-xs"
                    >
                      <Copy className="w-3 h-3" /> Copy DM
                    </button>
                  </div>
                  <div className="bg-purple-50/40 border border-purple-100 p-3 rounded-2xl text-xs font-medium text-slate-800">
                    "{viewingPitch.dmText}"
                  </div>
                </div>
              )}

              {/* Outreach Scripts if attached */}
              {viewingPitch.scripts && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    Attached Video Script
                  </h4>
                  {Object.entries(viewingPitch.scripts).map(([varKey, script]) => (
                    <div key={varKey} className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 space-y-2 text-xs">
                      <span className="font-extrabold text-pink-600 uppercase text-[10px] tracking-wider">
                        {varKey} Variation
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-400 block text-[10px]">HOOK:</span>
                          <p>{script.hook}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-400 block text-[10px]">SETUP:</span>
                          <p>{script.setup}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-400 block text-[10px]">CONTENT:</span>
                          <p>{script.content}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-400 block text-[10px]">CTA:</span>
                          <p>{script.cta}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <a
                href={buildStudioUrl(user)}
                className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
              >
                <Laptop className="w-3.5 h-3.5" /> Open in Storyboard Studio ↗
              </a>

              <button
                onClick={() => setViewingPitch(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-full transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 z-10 flex items-center justify-center gap-2">
        <span>⚡ PitchPal</span>
        <span>•</span>
        <span>AI-Powered Influencer Outreach & Storyboard Studio</span>
      </footer>
    </div>
  );
}

export default App;
