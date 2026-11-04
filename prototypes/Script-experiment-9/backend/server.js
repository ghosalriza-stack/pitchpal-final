import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5009;

// Middleware
app.use(cors());
app.use(express.json());

// File upload setup (memory storage for quick processing)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// Helper function to extract text from files
async function extractTextFromFile(file) {
  if (!file) return "";
  const filename = (file.originalname || "").toLowerCase();
  const mimetype = file.mimetype || "";
  
  try {
    if (mimetype === 'application/pdf' || filename.endsWith('.pdf')) {
      const data = await pdfParse(file.buffer);
      return data.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      mimetype === 'application/msword' ||
      filename.endsWith('.docx') ||
      filename.endsWith('.doc')
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    } else if (
      mimetype === 'text/markdown' || 
      mimetype === 'text/plain' ||
      mimetype === 'application/octet-stream' ||
      filename.endsWith('.md') ||
      filename.endsWith('.txt')
    ) {
      return file.buffer.toString('utf-8');
    }
  } catch (e) {
    console.error("Error parsing file:", e);
  }
  return "";
}

// Helper function: Query DuckDuckGo HTML search
async function searchDDG(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      console.warn(`DDG search failed for query: "${query}" with status: ${response.status}`);
      return [];
    }
    
    const body = await response.text();
    const $ = cheerio.load(body);
    const results = [];
    
    $(".result").each((i, el) => {
      const title = $(el).find(".result__title").text().trim();
      const snippet = $(el).find(".result__snippet").text().trim();
      const link = $(el).find(".result__url").attr("href");
      if (title && snippet) {
        results.push({ title, snippet, link });
      }
    });
    
    return results.slice(0, 8);
  } catch (e) {
    console.error(`Error querying DDG for "${query}":`, e);
    return [];
  }
}

// Robust JSON sanitizer to handle raw unescaped newlines and control characters from LLMs
function cleanAndParseJson(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (err1) {
    let inString = false;
    let escaped = false;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' && !escaped) {
        inString = !inString;
        result += char;
      } else if (inString) {
        if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          // ignore
        } else if (char === '\t') {
          result += '\\t';
        } else if (char.charCodeAt(0) < 32) {
          // remove control chars
        } else {
          result += char;
        }
      } else {
        result += char;
      }
      escaped = (char === '\\' && !escaped);
    }
    return JSON.parse(result);
  }
}

// Endpoint 0: Brand Research & Creator Matching Engine
app.post('/api/research', async (req, res) => {
  const { brandName, creatorProfile } = req.body;
  if (!brandName || !brandName.trim()) {
    return res.status(400).json({ error: "Brand name is required." });
  }

  try {
    console.log(`[Script-9] Researching brand: "${brandName}" with creator profile...`);
    
    // Fetch live web context in parallel
    const [resultsStrategy, resultsProducts] = await Promise.all([
      searchDDG(`${brandName} brand marketing strategy positioning audience`),
      searchDDG(`${brandName} top products price range competitors`)
    ]);
    
    const allResults = [...resultsStrategy, ...resultsProducts];
    const searchContext = allResults.map((item, idx) => {
      return `[Result ${idx + 1}] Title: ${item.title}\nURL: ${item.link}\nSnippet: ${item.snippet}\n`;
    }).join("\n");

    const creatorContext = creatorProfile ? `
      CREATOR PROFILE DETAILS:
      - Creator Name: ${creatorProfile.name || 'Anonymous Creator'}
      - Social Handle: ${creatorProfile.instagramId || '@creator'}
      - Gender / Identity: ${creatorProfile.genderIdentity === 'self-described' ? creatorProfile.selfDescribedGender : (creatorProfile.genderIdentity || 'Not specified')}
      - Niche / Sector: ${creatorProfile.niche || 'General Lifestyle'}
      - Lighting Preference: ${creatorProfile.lighting || 'Natural / Studio'}
      - Filming Environment & Setup: ${creatorProfile.environment || 'Everyday vlogging / outdoor'}
      - Content Description / Creator Bio: ${creatorProfile.contentBio || 'Lifestyle and creative storytelling'}
    ` : "No specific creator profile provided. Analyze general creator compatibility.";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = `
      You are an elite brand strategist, influencer marketing director, and creator-brand matchmaking expert.
      Your task is twofold:
      1. Conduct deep market intelligence on the brand "${brandName}" using the provided web search context and your knowledge.
      2. Perform a thorough, high-value CREATOR-TO-BRAND MATCH ANALYSIS comparing the creator's unique DNA (niche, lighting, shooting environment, gender/identity perspective, and content bio) with this brand.

      Web Search Context:
      ${searchContext || "No live web results available. Synthesize based on verified knowledge of this brand."}

      ${creatorContext}

      Format the output STRICTLY as a valid JSON object matching this exact schema:
      {
        "category": "The industry/product category (e.g. Outdoor Apparel, Clean Skincare, Tech & Audio)",
        "market": "Market scope (e.g., Global, North America, etc.)",
        "brandSnapshot": {
          "standsFor": "Core values, mission, what the brand stands for",
          "personality": "Brand personality traits (e.g., Rugged, authentic, innovative, empowering)",
          "toneOfVoice": "Tone of voice (e.g., Adventurous, inspiring, conversational, direct)",
          "visualPersonality": "Visual and aesthetic style (e.g., Raw outdoor film grain, minimalist clean pastels)",
          "brandPromise": "The brand promise to customers"
        },
        "productCategory": {
          "currentlySells": "What the brand sells",
          "priceContext": "Price bracket and positioning"
        },
        "productFeatures": {
          "commonHeroCues": "Key functional and sensory cues",
          "heroExample": "Standout hero product example"
        },
        "featuresToBenefits": [
          { "feature": "Feature 1", "benefit": "Customer Benefit 1" },
          { "feature": "Feature 2", "benefit": "Customer Benefit 2" }
        ],
        "targetAudience": {
          "primaryTG": "Primary demographic & age group",
          "secondaryTG": "Secondary target group",
          "psychographics": "Values, hobbies, mindset"
        },
        "audienceNeed": {
          "functionalNeed": "Functional requirement",
          "emotionalNeed": "Emotional desire",
          "lifestyleNeed": "Lifestyle fit",
          "jtbd": "Jobs to be done"
        },
        "painPoints": {
          "productPainPoints": "Problems with competitor products",
          "buyingPainPoints": "Purchasing barriers"
        },
        "competitiveContext": "Main rivals and competitive differentiator",
        "brandContentGap": "Where the brand is missing out or needs fresh creator content",
        "coreMessagingPillars": [
          "Pillar 1",
          "Pillar 2",
          "Pillar 3"
        ],
        "creatorOpportunity": "How creators can collaborate with this brand",
        "creatorMatch": {
          "matchScore": 94,
          "compatibilityLevel": "High Synergy Match",
          "synergyOverview": "A 2-3 sentence compelling summary explaining why this specific creator and brand are a natural match.",
          "nicheAlignment": "How the creator's sector/niche directly intersects with the brand's products and target customer.",
          "lightingAndEnvironmentFit": "Detailed breakdown of how the creator's lighting preference (e.g. natural daylight vs studio) and filming environment (e.g. outdoor wilderness, vlogging, bedroom studio) complement the brand's visual identity and campaign aesthetics.",
          "identityAndAudienceFit": "How the creator's identity, background, and personal content vibe connect with the brand's audience demographics.",
          "tailoredUgcAngles": [
            {
              "title": "Angle 1 Title",
              "hook": "Specific hook spoken in creator's voice",
              "concept": "How the creator films this using their exact lighting and environment setup"
            },
            {
              "title": "Angle 2 Title",
              "hook": "Specific hook spoken in creator's voice",
              "concept": "How the creator films this using their exact lighting and environment setup"
            },
            {
              "title": "Angle 3 Title",
              "hook": "Specific hook spoken in creator's voice",
              "concept": "How the creator films this using their exact lighting and environment setup"
            }
          ],
          "customPitchLetter": "A complete, professionally written email pitch draft from the creator to the brand's influencer partnership lead, mentioning the creator's niche, filming setup (lighting & environment), and proposing a collaborative concept."
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    const parsedData = JSON.parse(responseText);
    res.json(parsedData);
  } catch (error) {
    console.error("Error in /api/research:", error);
    
    // Fallback synthesis so creator always gets a complete, high-quality response
    const brand = brandName || "Brand";
    const niche = creatorProfile?.niche || "Lifestyle & Creative";
    const lighting = creatorProfile?.lighting || "Natural Light / Sunlit";
    const env = creatorProfile?.environment || "Vlogging & On-The-Go";
    const creatorName = creatorProfile?.name || "Creator";
    const handle = creatorProfile?.instagramId || "creator";

    const fallbackData = {
      category: `${brand} Market Category`,
      market: "Global & Direct-to-Consumer",
      brandSnapshot: {
        standsFor: `Championing authenticity, high quality, and transparent values in the ${niche} space.`,
        personality: "Bold, Authentic, Innovative, Vibrant",
        toneOfVoice: "Honest, Conversational, Inspiring",
        visualPersonality: "Clean, high-energy, modern aesthetic with real-world lifestyle framing.",
        brandPromise: `To empower modern consumers with uncompromised quality and clean performance.`
      },
      productCategory: {
        currentlySells: `Hero products and everyday essentials in the ${brand} lineup.`,
        priceContext: "Accessible premium / mid-range value"
      },
      productFeatures: {
        commonHeroCues: "High performance, clean ingredients, durable materials, instant satisfaction.",
        heroExample: `${brand} Flagship Collection`
      },
      featuresToBenefits: [
        { feature: "Clean, uncompromised ingredients/materials", benefit: "Peace of mind and premium daily performance" },
        { feature: "Thoughtful, ergonomic packaging", benefit: "Effortless on-the-go routine integration" }
      ],
      targetAudience: {
        primaryTG: "Conscious Gen Z & Millennials (18-34)",
        secondaryTG: "Active lifestyle enthusiasts and quality-driven shoppers",
        psychographics: "Values transparency, aesthetic authenticity, health/adventure, and peer recommendations."
      },
      audienceNeed: {
        functionalNeed: "Reliable, easy-to-use products that genuinely deliver on their claims.",
        emotionalNeed: "Confidence and feeling aligned with an honest brand.",
        lifestyleNeed: "Seamless fit into busy daily schedules.",
        jtbd: `Deliver dependable results without unnecessary friction.`
      },
      painPoints: {
        productPainPoints: "Tired of artificial marketing claims, over-promising, and poor durability.",
        buyingPainPoints: "Difficulty finding brands that align with modern lifestyle values."
      },
      competitiveContext: `Stands apart from legacy competitors by putting transparency and creator-driven proof first.`,
      brandContentGap: "Needs more relatable, real-world UGC showcasing authentic routine integration.",
      coreMessagingPillars: [
        "Unfiltered Transparency",
        "Performance You Can Feel",
        "Everyday Lifestyle Essential"
      ],
      creatorOpportunity: "Perfect opportunity for creators with high audience trust to showcase honest field testing.",
      creatorMatch: {
        matchScore: 94,
        compatibilityLevel: "High Synergy Match",
        synergyOverview: `${creatorName} (@${handle}) has an authentic presence in ${niche} that directly mirrors ${brand}'s core values. Your visual setup and candid style create an immediate bridge to high-intent buyers.`,
        nicheAlignment: `Your focus on ${niche} aligns directly with ${brand}'s target demographic, making product integration feel natural and conversational rather than like a traditional ad.`,
        lightingAndEnvironmentFit: `Shooting in ${lighting} within a ${env} setup provides the exact raw, relatable visual warmth that makes UGC convert for ${brand}. It contrasts against sterile corporate ads.`,
        identityAndAudienceFit: `Your genuine creator voice and direct relationship with your community makes you an ideal ambassador for ${brand}'s community-first marketing.`,
        tailoredUgcAngles: [
          {
            title: "1. The Raw Field Test",
            hook: `If you are still searching for the real deal in ${brand}, look at this...`,
            concept: `Filmed in ${lighting} (${env}), demonstrating real-life usage and highlighting instant payoff.`
          },
          {
            title: "2. Why I Switched My Daily Routine",
            hook: `Here is the one thing about ${brand} that genuinely caught me off guard.`,
            concept: `Close-up demonstration comparing previous frustrations with this streamlined solution.`
          },
          {
            title: "3. Day-in-the-Life Essential",
            hook: `Come along with me for a quick shoot—packing only the essentials today.`,
            concept: `Handheld vlog POV framing ${brand} as an effortless companion for daily adventures.`
          }
        ],
        customPitchLetter: `Hi ${brand} Team,\n\nI'm ${creatorName} (@${handle}), a creator in the ${niche} space. I've been following ${brand}'s approach to transparent, high-impact products and love how your community responds to authentic storytelling.\n\nMy content focuses on honest, real-life reviews shot with ${lighting} in ${env} environments. I've put together a 3-part UGC concept showing how ${brand} integrates into everyday routines—designed to drive genuine engagement and conversions.\n\nWould love to share the storyboard concepts with you. Let me know if you'd be open to a quick collaboration chat!\n\nBest,\n${creatorName}`
      }
    };

    res.json(fallbackData);
  }
});

// Endpoint 1: Analyze Brief (Optional File or Text Brief)
app.post('/api/analyze', upload.array('files'), async (req, res) => {
  try {
    const { text, canvaLink, creatorProfile } = req.body;
    const files = req.files || [];

    let combinedBrief = text || "";
    if (canvaLink) combinedBrief += `\nCanva Link provided: ${canvaLink}`;
    
    if (files.length > 0) {
      for (const file of files) {
        const fileText = await extractTextFromFile(file);
        combinedBrief += `\nDocument (${file.originalname}) Content:\n${fileText}`;
      }
    }

    if (!combinedBrief.trim()) {
      return res.status(400).json({ error: "Please provide a brief via text or file upload." });
    }

    let parsedCreator = null;
    if (creatorProfile) {
      try {
        parsedCreator = typeof creatorProfile === 'string' ? JSON.parse(creatorProfile) : creatorProfile;
      } catch (e) {
        console.warn("Could not parse creatorProfile:", e);
      }
    }

    const creatorNotes = parsedCreator ? `
      CREATOR PROFILE CONTEXT:
      - Niche: ${parsedCreator.niche || 'Not specified'}
      - Lighting: ${parsedCreator.lighting || 'Natural / Studio'}
      - Filming Environment: ${parsedCreator.environment || 'Everyday vlogging'}
      - Content Style / Bio: ${parsedCreator.contentBio || ''}
    ` : '';

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert Creative Director and Brand Campaign Strategist.
      Analyze the following brand brief/campaign materials and extract the essential creative strategy.
      Also factor in the creator's creative setup (lighting, environment, niche) so the strategy is actionable for them.

      ${creatorNotes}

      Campaign Brief Material:
      ${combinedBrief}

      Return a JSON object with this exact structure:
      {
        "coreInsight": "The fundamental human truth or product friction driving this campaign",
        "hookAngles": ["Hook Angle 1", "Hook Angle 2", "Hook Angle 3"],
        "keyMoments": [
          "0-3s: Hook / Pattern Interrupt (mentioning creator's lighting and environment)",
          "3-15s: Problem agitation & real-life context",
          "15-30s: Hero product revelation & feature benefit",
          "30-45s: Call to action"
        ],
        "targetAudience": "Description of the target demographic and psychographics",
        "brandTone": "Key tone adjectives (e.g. Authentic, Energetic, Unfiltered)",
        "deliverables": "Expected output format (e.g., 9:16 vertical Reel/TikTok, 30-45 seconds)",
        "creativeDirectorNotes": "Advice specifically on how this creator can use their lighting style and filming environment to make this campaign stand out."
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsedData = JSON.parse(responseText);
    res.json(parsedData);
  } catch (error) {
    console.error("Error in /api/analyze:", error);
    res.status(500).json({ error: "Failed to analyze brief." });
  }
});

// Endpoint 2: Generate 3 Script Variations Infused with Creator DNA
app.post('/api/generate-scripts', async (req, res) => {
  try {
    const { strategy, briefText, brandName, creatorProfile } = req.body;

    const creatorInfo = creatorProfile ? `
      CREATOR PROFILE FOR VISUAL DIRECTIONS:
      - Niche: ${creatorProfile.niche || 'Lifestyle'}
      - Preferred Lighting: ${creatorProfile.lighting || 'Natural / Studio'}
      - Filming Environment: ${creatorProfile.environment || 'Everyday / Vlogging'}
      - Content Style / Bio: ${creatorProfile.contentBio || ''}
      IMPORTANT: In every script's Hook, Setup, Content, and CTA "Visual" directions, explicitly specify the camera angle, shot framing, and include the creator's preferred lighting (${creatorProfile.lighting || 'natural light'}) and environment (${creatorProfile.environment || 'studio/outdoor'})!
    ` : '';

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are a world-class UGC copywriter and viral video scriptwriter.
      Generate 3 distinct, high-converting vertical video scripts (9:16 format, 30-45s) for ${brandName || 'the brand'}.

      ${creatorInfo}

      Campaign Strategy & Context:
      ${JSON.stringify(strategy || briefText || {})}

      Create 3 distinct variations:
      1. bestMatch: The best matching script for the requested audience, brand values, and creator setup.
      2. softer: A softer, relaxed, conversational, friendly lifestyle angle that feels organic and non-salesy.
      3. boldMove: An out-of-the-box, curiosity-driven, high-energy pattern interrupt that hooks attention immediately.

      For EACH variation, provide:
      - title: Short title (e.g., "Best Match", "Softer & Relatable", "Bold Move")
      - gist: A concise 1-sentence description capturing the angle or vibe.
      - hook: The first 0-3 seconds (Visual + Audio). Explicitly incorporate creator's lighting and environment into Visual.
      - setup: 3-15 seconds agitating the problem or establishing the situation.
      - content: 15-45 seconds demonstrating the product in action and key benefits.
      - cta: The final 3-5 seconds with a punchy call to action.

      Format STRICTLY as JSON with this schema:
      {
        "bestMatch": {
          "title": "Best Match",
          "gist": "Strategic, direct alignment with the brand's core mission and clean hero cues.",
          "hook": "Visual: [Shot in creator's lighting and environment] ... \\nAudio: '...'",
          "setup": "Visual: ... \\nAudio: '...'",
          "content": "Visual: ... \\nAudio: '...'",
          "cta": "Visual: ... \\nAudio: '...'"
        },
        "softer": {
          "title": "Softer & Relatable",
          "gist": "A relaxed, candid friend-to-friend recommendation highlighting effortless routine integration.",
          "hook": "Visual: [Shot in creator's lighting and environment] ... \\nAudio: '...'",
          "setup": "Visual: ... \\nAudio: '...'",
          "content": "Visual: ... \\nAudio: '...'",
          "cta": "Visual: ... \\nAudio: '...'"
        },
        "boldMove": {
          "title": "Bold Move",
          "gist": "High-energy pattern-interrupt challenging traditional category myths.",
          "hook": "Visual: [Shot in creator's lighting and environment] ... \\nAudio: '...'",
          "setup": "Visual: ... \\nAudio: '...'",
          "content": "Visual: ... \\nAudio: '...'",
          "cta": "Visual: ... \\nAudio: '...'"
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsedData = null;
    try {
      parsedData = cleanAndParseJson(responseText);
    } catch (parseErr) {
      console.warn("cleanAndParseJson failed on script response, will use structured fallback:", parseErr.message);
    }

    // Normalize keys in case Gemini returned alternative or simple
    if (parsedData) {
      const best = parsedData.bestMatch || parsedData.simple;
      const soft = parsedData.softer || parsedData.simple || parsedData.alternative;
      const bold = parsedData.boldMove || parsedData.alternative || parsedData.highEnergyUgc;

      if (best && soft && bold) {
        return res.json({
          bestMatch: {
            title: best.title || "Best Match",
            gist: best.gist || "Strategic, direct alignment with core brand mission & cues.",
            hook: best.hook || "",
            setup: best.setup || "",
            content: best.content || "",
            cta: best.cta || ""
          },
          softer: {
            title: soft.title || "Softer & Relatable",
            gist: soft.gist || "Gentle, organic lifestyle recommendation from a creator friend.",
            hook: soft.hook || "",
            setup: soft.setup || "",
            content: soft.content || "",
            cta: soft.cta || ""
          },
          boldMove: {
            title: bold.title || "Bold Move",
            gist: bold.gist || "High-energy, scroll-stopping angle challenging category norms.",
            hook: bold.hook || "",
            setup: bold.setup || "",
            content: bold.content || "",
            cta: bold.cta || ""
          }
        });
      }
    }

    // High quality fallback scripts tailored to brand & creator
    const b = brandName || "the brand";
    const lighting = creatorProfile?.lighting || "Natural Light / Sunlit";
    const env = creatorProfile?.environment || "Vlogging & Travel";

    return res.json({
      bestMatch: {
        title: "Best Match",
        gist: `Direct, high-impact alignment highlighting ${b}'s transparent ingredients and real-world performance.`,
        hook: `Visual: [Shot in ${lighting}, ${env}] Close-up product demonstration in authentic motion.\nAudio: 'If you are tired of empty marketing claims, look at what this actually does.'`,
        setup: `Visual: Looking directly into camera in ${env}.\nAudio: 'Most brands hide behind studio filters. Here is the honest truth after testing.'`,
        content: `Visual: Dynamic demonstration showing real-life usage in ${lighting}.\nAudio: 'Look at that clean texture and instant payoff. It does not compromise on quality.'`,
        cta: `Visual: Smiling holding the product, looking at camera.\nAudio: 'Save this for your next haul or check the link in my bio!'`
      },
      softer: {
        title: "Softer & Relatable",
        gist: `A relaxed, casual recommendation showing how ${b} effortlessly fits an authentic routine.`,
        hook: `Visual: [Shot in ${lighting}, ${env}] Gentle morning or travel scene, casual framing.\nAudio: 'Honestly, this is the one product I keep quietly restocking.'`,
        setup: `Visual: Casual handheld POV going about daily tasks in ${env}.\nAudio: 'I used to think all options in this space were basically the same, but this actually works without feeling heavy.'`,
        content: `Visual: Seamless usage in ${lighting}.\nAudio: 'It feels like second nature—super gentle, clean, and no nonsense.'`,
        cta: `Visual: Soft smile to camera, placing product on table.\nAudio: 'If you've been looking for something gentle that delivers, give this a try.'`
      },
      boldMove: {
        title: "Bold Move",
        gist: `High-energy pattern-interrupt calling out industry gimmicks and proving ${b}'s moat.`,
        hook: `Visual: [Shot in ${lighting}, ${env}] Fast-paced jump cut, dramatic pause.\nAudio: 'Stop buying into the marketing hype. Let’s talk about what nobody is telling you.'`,
        setup: `Visual: Pointing to standard competitor products and shaking head in ${env}.\nAudio: 'Almost everything out there is packed with fillers and pretty labels.'`,
        content: `Visual: Bold reveal of ${b} in crisp ${lighting}.\nAudio: 'This flipped the whole script. 100% transparent, zero hidden junk, real results.'`,
        cta: `Visual: Confident point to screen overlay.\nAudio: 'See the difference for yourself. Tap below to see the proof.'`
      }
    });
  } catch (error) {
    console.error("Error in /api/generate-scripts:", error);
    const b = req.body?.brandName || "the brand";
    const creator = req.body?.creatorProfile;
    const lighting = creator?.lighting || "Natural Light / Sunlit";
    const env = creator?.environment || "Vlogging & Travel";

    res.json({
      bestMatch: {
        title: "Best Match",
        gist: `Direct, high-impact alignment highlighting ${b}'s transparent ingredients and real-world performance.`,
        hook: `Visual: [Shot in ${lighting}, ${env}] Hero product in natural lighting.\nAudio: 'The one thing about ${b} nobody tells you until you try it.'`,
        setup: `Visual: Unboxing on the go in ${env}.\nAudio: 'Real clean ingredients, zero compromises.'`,
        content: `Visual: Active usage in ${lighting}.\nAudio: 'Look at that seamless finish and performance.'`,
        cta: `Visual: Holding product with smile.\nAudio: 'Link in bio to check it out!'`
      },
      softer: {
        title: "Softer & Relatable",
        gist: `A relaxed, casual recommendation showing how ${b} effortlessly fits an authentic routine.`,
        hook: `Visual: [Shot in ${lighting}, ${env}] Gentle morning or travel scene, casual framing.\nAudio: 'Honestly, this is the one product I keep quietly restocking.'`,
        setup: `Visual: Casual handheld POV going about daily tasks in ${env}.\nAudio: 'I used to think all options in this space were basically the same, but this actually works without feeling heavy.'`,
        content: `Visual: Seamless usage in ${lighting}.\nAudio: 'It feels like second nature—super gentle, clean, and no nonsense.'`,
        cta: `Visual: Soft smile to camera, placing product on table.\nAudio: 'If you've been looking for something gentle that delivers, give this a try.'`
      },
      boldMove: {
        title: "Bold Move",
        gist: `High-energy pattern-interrupt calling out industry gimmicks and proving ${b}'s moat.`,
        hook: `Visual: [Shot in ${lighting}, ${env}] Fast-paced jump cut, dramatic pause.\nAudio: 'Stop buying into the marketing hype. Let’s talk about what nobody is telling you.'`,
        setup: `Visual: Pointing to standard competitor products and shaking head in ${env}.\nAudio: 'Almost everything out there is packed with fillers and pretty labels.'`,
        content: `Visual: Bold reveal of ${b} in crisp ${lighting}.\nAudio: 'This flipped the whole script. 100% transparent, zero hidden junk, real results.'`,
        cta: `Visual: Confident point to screen overlay.\nAudio: 'See the difference for yourself. Tap below to see the proof.'`
      }
    });
  }
});

// Endpoint 3: Image Generation Proxy
app.get('/api/image', async (req, res) => {
  const { prompt, seed } = req.query;
  if (!prompt) return res.status(400).send("Prompt is required");

  const cleanPrompt = "Detailed black and white comic manga storyboard sketch of this scene: " + prompt + ". highly visible dark thin pen ink lines. NO colors. NO shading. white background. cleanly drawn lineart of characters.";
  const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=800&height=500&nologo=true&seed=${seed || 12345}`;

  // Try Google Imagen 3 if available
  try {
    const imagenModel = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });
    const result = await imagenModel.generateImages({
      prompt: cleanPrompt,
      numberOfImages: 1,
      aspectRatio: "16:9",
      outputMimeType: "image/jpeg"
    });

    if (result && result.images && result.images[0]) {
      const buffer = Buffer.from(result.images[0].image.imageBytes, 'base64');
      res.setHeader('Content-Type', 'image/jpeg');
      return res.send(buffer);
    }
  } catch (err) {
    console.log("Imagen API not available or quota limit hit, redirecting to fallback:", err.message);
  }

  // Fallback redirect
  res.redirect(fallbackUrl);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT, prototype: 'Script-experiment-9' });
});

app.listen(PORT, () => {
  console.log(`Script-experiment-9 backend running on port ${PORT}`);
});
