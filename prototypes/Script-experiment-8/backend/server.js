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
const PORT = process.env.PORT || 5007;

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

// Endpoint 0: Brand Research Assistant
app.post('/api/research', async (req, res) => {
  const { brandName } = req.body;
  if (!brandName || !brandName.trim()) {
    return res.status(400).json({ error: "Brand name is required." });
  }

  try {
    console.log(`Researching brand: "${brandName}"...`);
    
    // Fetch context in parallel
    const [resultsStrategy, resultsProducts] = await Promise.all([
      searchDDG(`${brandName} brand marketing strategy positioning audience`),
      searchDDG(`${brandName} top products price range competitors`)
    ]);
    
    const allResults = [...resultsStrategy, ...resultsProducts];
    console.log(`Gathered ${allResults.length} search results for "${brandName}"`);
    
    const searchContext = allResults.map((item, idx) => {
      return `[Result ${idx + 1}] Title: ${item.title}\nURL: ${item.link}\nSnippet: ${item.snippet}\n`;
    }).join("\n");
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = `
      You are an expert market researcher and brand strategist.
      Your task is to conduct deep research on the brand "${brandName}" based on the following real web search results and your own knowledge.
      
      Web Search Context:
      ${searchContext || "No search results available. Synthesize based on your own knowledge of this brand."}
      
      You must construct a complete, detailed brand research report.
      Format the output STRICTLY as a JSON object. Ensure every field is filled with real, high-quality information (no placeholders, no mock data, make logical inferences if needed).
      
      The JSON structure MUST follow this exact schema:
      {
        "researchPurpose": "A clear description of the research purpose for this brand.",
        "category": "The industry/product category (e.g. Beauty/Cosmetics, Skincare, Athleisure, Tech, Energy Drinks, etc.)",
        "market": "Market scope (e.g., Global, primarily US & India, etc.)",
        "brandSnapshot": {
          "standsFor": "What does the brand stand for? Core values, mission statement.",
          "personality": "Brand personality adjectives (e.g., Bold, energetic, inclusive, authentic)",
          "toneOfVoice": "Description of the tone of voice (e.g., Warm, friendly, empowering, witty)",
          "visualPersonality": "Visual style details (e.g., Vibrant colors, clean minimalist, neon energy, pastel tones)",
          "brandPromise": "The core promise to the customer"
        },
        "productCategory": {
          "currentlySells": "What the brand currently sells (types of products)",
          "priceContext": "Price context (e.g., mid-range premium, drugstore, luxury) and general price point examples"
        },
        "productFeatures": {
          "commonHeroCues": "Common or hero functional cues",
          "heroExample": "Specific hero example product detailing its standout features"
        },
        "featuresToBenefits": [
          { "feature": "Name of Feature 1", "benefit": "Customer Benefit 1" },
          { "feature": "Name of Feature 2", "benefit": "Customer Benefit 2" }
        ],
        "targetAudience": {
          "primaryTG": "Primary Target Group (demographics, age group, e.g. Gen Z & Millennials)",
          "secondaryTG": "Secondary Target Group",
          "psychographics": "Interests, lifestyle, values"
        },
        "audienceNeed": {
          "functionalNeed": "Functional needs",
          "emotionalNeed": "Emotional needs",
          "lifestyleNeed": "Lifestyle needs",
          "jtbd": "Jobs To Be Done: What is the customer hiring this brand to do?"
        },
        "audienceBehaviour": {
          "typicalBehaviours": "How they buy, use, or think about products",
          "contentBehaviour": "Where they hang out and how they consume content (e.g., active on TikTok/Reels)"
        },
        "painPoints": {
          "productPainPoints": "Common complaints or issues with products in this category",
          "buyingPainPoints": "Buying friction"
        },
        "purchaseMotivation": {
          "primary": "Primary reason they buy this brand",
          "keyTrigger": "Key psychological trigger"
        },
        "competitiveContext": "Who are their main competitors and how does this brand stand out?",
        "brandContentGap": "Where are they missing out or what is the gap in their content marketing?",
        "contentObjective": {
          "primary": "Primary content marketing objective",
          "secondary": "Secondary content marketing objective",
          "possibleKpi": "Possible KPIs"
        },
        "oneThingToRemember": "The one key takeaway the audience should remember after seeing content for this brand.",
        "coreMessagingPillars": [
          "Core Messaging Pillar 1",
          "Core Messaging Pillar 2",
          "Core Messaging Pillar 3"
        ],
        "previousReelUgcAngles": [
          "UGC/Reel Angle 1",
          "UGC/Reel Angle 2",
          "UGC/Reel Angle 3"
        ],
        "previousHookBank": [
          "Hook 1",
          "Hook 2",
          "Hook 3"
        ],
        "visualStoryboardDirection": "Visual and aesthetic direction for content",
        "previousCta": [
          "CTA 1",
          "CTA 2",
          "CTA 3"
        ],
        "creatorOpportunity": "How can a content creator partner with this brand? What angles are they looking for?"
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
    res.status(500).json({ error: "Failed to generate brand research." });
  }
});

// Endpoint 1: Analyze Brief (Step 1 -> Step 2)
app.post('/api/analyze', upload.array('files'), async (req, res) => {
    try {
        const { text, canvaLink } = req.body;
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

        // Call Gemini to analyze the brief
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });
        const prompt = `
            Analyze the following brand/product brief and extract the key information.
            Format the output STRICTLY as a JSON object with the following keys:
            - "brandName": The name of the brand or product being pitched (e.g. Rare Beauty, Gatorade). If not explicitly mentioned, make an educated guess. Keep it very short (1-3 words max).
            - "objective": The main goal or why they are doing this (e.g. Launch new product).
            - "audience": Define the target audience (e.g. Gen Z, tech savvy).
            - "coreIdea": The core idea or main message (e.g. Make it look cool and effortless).
            
            Keep the extracted text short and concise. If the brief doesn't explicitly state one of them, make an educated guess based on the context.

            Brief Content:
            ${combinedBrief}
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        let analysisData;
        try {
            analysisData = JSON.parse(responseText);
        } catch (parseErr) {
            console.error("Failed to parse Gemini JSON:", responseText);
            // Fallback object if parsing fails
            analysisData = { brandName: "Unknown Brand", objective: "Unknown", audience: "Unknown", coreIdea: "Unknown" };
        }

        res.json(analysisData);

    } catch (error) {
        console.error("Error in /api/analyze:", error);
        res.status(500).json({ error: "Failed to analyze brief." });
    }
});

// Endpoint 2: Generate Scripts (Step 2 -> Step 3)
app.post('/api/generate', async (req, res) => {
    try {
        const { objective, audience, coreIdea, creatorName, instagramId, brandResearch } = req.body;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });
        
        let personalizationInstruction = "";
        if (creatorName || instagramId) {
            personalizationInstruction = `
            The script is written for the creator: ${creatorName || 'a creator'} (Instagram handle: @${instagramId || 'handle'}).
            Tailor the outreach script to speak from their perspective. Make sure the scripts naturally fit their voice.
            Feel free to suggest references to their handle @${instagramId || 'handle'} in visual cues or CTA sign-offs (e.g. "Head to my link in bio @${instagramId || 'handle'}" or similar) when relevant.
            `;
        }

        let researchInstruction = "";
        if (brandResearch) {
            researchInstruction = `
            Deep Brand Intelligence Context:
            - Brand Tone of Voice: ${brandResearch.brandSnapshot?.toneOfVoice || ''}
            - Visual Personality: ${brandResearch.brandSnapshot?.visualPersonality || ''}
            - Brand Promise: ${brandResearch.brandSnapshot?.brandPromise || ''}
            - Suggested Hook Ideas: ${JSON.stringify(brandResearch.previousHookBank || [])}
            - Creator UGC Angles: ${JSON.stringify(brandResearch.previousReelUgcAngles || [])}
            - Core Messaging Pillars: ${JSON.stringify(brandResearch.coreMessagingPillars || [])}
            - Creator Opportunity: ${brandResearch.creatorOpportunity || ''}
            Naturally infuse these verified brand hooks, tone of voice, and creator angles into the 3 script variations!
            `;
        }

        const prompt = `
            You are an expert short-form video scriptwriter (e.g., for Instagram Reels, TikTok).
            Based on the following parameters:
            - Objective: ${objective}
            - Target Audience: ${audience}
            - Core Idea: ${coreIdea}
            ${personalizationInstruction}
            ${researchInstruction}

            Generate 3 distinct script variations:
            1. "simple": A simple, safe, and direct script.
            2. "bestMatch": The best matching script for the requested audience and idea.
            3. "boldMove": An out-of-the-box, highly engaging, risky/bold script.

            EACH script MUST strictly follow this exact 4-part structure (with the exact keys):
            - "hook": 0-3 seconds. Impactful, scroll-stopping, addresses the target audience, or asks a shocking question. Include what we see (Visual/B-roll) and hear (VO/Dialogue).
            - "setup": 3-15 seconds. Pain points, benefits for viewers, why the audience should care.
            - "content": 15-45 seconds. Fast tips, product demo, fast angle changes.
            - "cta": Final 3-5 seconds. Ask to follow, comment/save/share, or read caption.

            Format the ENTIRE output STRICTLY as a JSON object matching this structure:
            {
              "simple": { "hook": "...", "setup": "...", "content": "...", "cta": "..." },
              "bestMatch": { "hook": "...", "setup": "...", "content": "...", "cta": "..." },
              "boldMove": { "hook": "...", "setup": "...", "content": "...", "cta": "..." }
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        let scriptsData;
        try {
            scriptsData = JSON.parse(responseText);
        } catch (parseErr) {
            console.error("Failed to parse Gemini scripts JSON:", responseText);
            throw new Error("Invalid output format from AI");
        }

        res.json(scriptsData);

    } catch (error) {
        console.error("Error in /api/generate:", error);
        res.status(500).json({ error: "Failed to generate scripts." });
    }
});

// Endpoint 3: Generate Storyboard (Step 3 -> Step 4)
app.post('/api/storyboard', async (req, res) => {
    try {
        const { contentGoal, targetAudience, brief, script } = req.body;

        if (!script) {
            return res.status(400).json({ error: "Script text is required to generate a storyboard." });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

        const benchmarkStyle = "Detailed manga anime comic style line art, ink drawing, thin black lines, pure white background, no shading, clean lineart.";

        const prompt = `You are a master Content Creator Storyboard Artist.
            I need you to generate exactly 4 frames based on the following inputs:
            - Content Goal: ${contentGoal || "Short-form video"}
            - Target Audience: ${targetAudience || "General audience"}
            - Requirements/Brief: ${brief || ""}
            - Script/Idea: ${script}

            You MUST output your response as a valid JSON object. Do not include any markdown formatting or extra text outside the JSON.
            The JSON must match this exact structure:
            {
              "frames": [
                {
                  "frame_number": "01",
                  "action": "Description of the physical action happening in this frame.",
                  "voiceover": "Dialogue or narration script for this frame.",
                  "director_notes": "Camera angle, shot type, or visual notes.",
                  "image_prompt": "Detailed description of the visual scene (e.g. 'A young man in a clean co-working space holding a key card')."
                },
                {
                  "frame_number": "02",
                  "action": "Description of the physical action.",
                  "voiceover": "Dialogue or narration.",
                  "director_notes": "Camera angle or visual notes.",
                  "image_prompt": "Detailed description of the visual scene."
                },
                {
                  "frame_number": "03",
                  "action": "Description of the physical action.",
                  "voiceover": "Dialogue or narration.",
                  "director_notes": "Camera angle or visual notes.",
                  "image_prompt": "Detailed description of the visual scene."
                },
                {
                  "frame_number": "04",
                  "action": "Description of the physical action.",
                  "voiceover": "Dialogue or narration.",
                  "director_notes": "Camera angle or visual notes.",
                  "image_prompt": "Detailed description of the visual scene."
                }
              ]
            }
            
            IMPORTANT: For each frame, replace the placeholder descriptions in "action", "voiceover", "director_notes", and "image_prompt" with the actual generated details of your storyboard scene. do not copy the instructions.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        let storyboardData;
        try {
            storyboardData = JSON.parse(responseText);
        } catch (parseErr) {
            console.error("Failed to parse Gemini storyboard JSON:", responseText);
            throw new Error("Invalid output format from AI");
        }

        res.json(storyboardData);

    } catch (error) {
        console.error("Error in /api/storyboard:", error);
        res.status(500).json({ error: "Failed to generate storyboard." });
    }
});

// Endpoint 4: Proxy/Generate Storyboard Image (handles retry logic, imageModel selection, and line-art styling)
app.post('/api/image', async (req, res) => { res.status(405).send("Use GET /api/image"); });
app.get('/api/image', async (req, res) => {
    try {
        const { prompt, imageModel, seed } = req.query;

        if (!prompt) {
            return res.status(400).send("Prompt is required");
        }

        // Decided illustration style: pure line illustration, outline only, zero shading
        const finalPrompt = "Detailed black and white comic manga storyboard sketch of this scene: " + prompt + ". highly visible dark thin pen ink lines. NO colors. NO shading. white background. cleanly drawn lineart of characters.";

        const targetModel = imageModel || 'google-imagen';
        const apiKey = process.env.GEMINI_API_KEY || '';

        if (targetModel === 'google-imagen' && apiKey && !apiKey.startsWith('dummy_key')) {
            console.log("Generating image via Google AI Studio Imagen...");
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: finalPrompt }] }],
                        generationConfig: {
                            responseModalities: ["IMAGE"]
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    let base64Data = '';
                    let mimeType = 'image/jpeg';

                    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                        for (const part of data.candidates[0].content.parts) {
                            if (part.inlineData) {
                                base64Data = part.inlineData.data;
                                mimeType = part.inlineData.mimeType;
                                break;
                            }
                        }
                    }

                    if (base64Data) {
                        const buffer = Buffer.from(base64Data, 'base64');
                        res.setHeader('Content-Type', mimeType);
                        return res.send(buffer);
                    } else {
                        console.warn("Gemini Imagen API returned successfully but without inlineData image parts.");
                    }
                } else {
                    const errText = await response.text();
                    console.error(`Google Imagen API returned status ${response.status}:`, errText);
                }
            } catch (err) {
                console.error("Google Imagen fetch error, falling back:", err);
            }
        }

        // Fallback or explicit choice: Pollinations.ai with line art styling
        console.log("Generating image via Pollinations.ai fallback...");
        let pRetries = 3;
        while (pRetries > 0) {
            try {
                const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=500&nologo=true&seed=${seed || Math.floor(Math.random() * 1000000)}`;
                const response = await fetch(pollinationsUrl);
                if (response.ok) {
                    const buffer = Buffer.from(await response.arrayBuffer());
                    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
                    return res.send(buffer);
                } else {
                    console.warn(`Pollinations.ai returned status ${response.status}. Retrying in 1.5s... (${pRetries - 1} left)`);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    pRetries--;
                }
            } catch (err) {
                console.error("Pollinations fallback error, retrying...", err);
                await new Promise(resolve => setTimeout(resolve, 1500));
                pRetries--;
            }
        }

        // Final Fallback: Return a clean SVG placeholder card matching the sketch outline style
        res.setHeader('Content-Type', 'image/svg+xml');
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
                <rect width="400" height="300" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" rx="8"/>
                <path d="M 0,0 L 400,300 M 400,0 L 0,300" stroke="#f1f5f9" stroke-width="2"/>
                <circle cx="200" cy="130" r="30" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4"/>
                <text x="50%" y="195" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="#64748b">SKETCH PLACEHOLDER</text>
                <text x="50%" y="225" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#94a3b8">Model loading or unavailable</text>
            </svg>
        `;
        res.send(svg);

    } catch (error) {
        console.error("Error in /api/image endpoint:", error);
        res.status(500).send("Error generating image");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
