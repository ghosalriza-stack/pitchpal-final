import dns from 'node:dns';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Agent, setGlobalDispatcher } from 'undici';
import { GoogleGenAI } from '@google/genai';

// Single shared .env at the repo root - every prototype's backend reads
// from here instead of keeping its own separate .env file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// On networks where IPv6 is advertised but not actually routable, Node's
// fetch (built on undici) races IPv6 addresses alongside IPv4 ones and
// stalls until every attempt times out - surfacing as a generic
// "fetch failed" / ETIMEDOUT error regardless of DNS lookup order.
// Forcing the global dispatcher to connect over IPv4 only avoids that stall.
dns.setDefaultResultOrder('ipv4first');
setGlobalDispatcher(new Agent({ connect: { family: 4 } }));

const app = express();
app.use(cors());
app.use(express.json());

// How many frames a storyboard is broken into.
const FRAME_COUNT = 4;

// How many frames get a drawn sketch. Matches FRAME_COUNT so the whole
// storyboard is illustrated.
const IMAGE_FRAME_LIMIT = FRAME_COUNT;

// House style for every generated panel, modelled on the reference storyboards:
// clean black ink line art, bold in-panel headline text, speech bubbles, and
// annotation labels on leader lines.
const STORYBOARD_STYLE = [
  'Black and white advertising storyboard panel drawn as clean ink line art.',
  'Confident even linework, pure white background, no colour and no grey fills,',
  'light cross-hatching only for depth. Single panel with a thin black border.',
].join(' ');

// Composes the final artist prompt so the style and recurring character stay
// identical across frames instead of relying on the model to repeat them.
function buildImagePrompt(frame, character) {
  // The model's sentences often already end in a period; strip it so composing
  // them together does not produce doubled punctuation.
  const sentence = (value) => String(value || '').trim().replace(/\.+$/, '');
  const parts = [STORYBOARD_STYLE];

  if (character) parts.push(`The recurring character in every panel: ${sentence(character)}.`);
  parts.push(`Scene: ${sentence(frame.scene || frame.action)}.`);

  if (frame.on_screen_text) {
    parts.push(`Bold hand-lettered all-caps headline inside the panel reading "${frame.on_screen_text}".`);
  }
  if (frame.speech_bubble) {
    parts.push(`A speech bubble containing the words "${frame.speech_bubble}".`);
  }

  const annotations = Array.isArray(frame.annotations) ? frame.annotations.filter(Boolean) : [];
  if (annotations.length) {
    const labels = annotations.map((label) => `"${label}"`).join(', ');
    parts.push(`Small hand-lettered annotation labels joined to the drawing by thin leader-line arrows: ${labels}.`);
  }

  return parts.join(' ');
}

// Second image provider, tried when the Google key has no image quota.
const OPENROUTER_IMAGE_MODEL = process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-2.5-flash-image';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Last resort so every frame still gets a sketch when neither metered provider
// has quota or credit. Free and keyless, but slower and lower fidelity - as
// soon as Google or OpenRouter can serve images, this is never reached.
function freeRendererUrl(prompt) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true`;
}

function resolveApiKey(frontendKey) {
  return frontendKey || process.env.GEMINI_API_KEY || '';
}

// OpenRouter returns generated images on the assistant message rather than in
// the text content. The exact shape has moved around between versions, so pull
// the first data: URI we can find instead of trusting one fixed path.
function extractOpenRouterImage(message) {
  const candidates = [];
  for (const entry of message?.images || []) {
    candidates.push(entry?.image_url?.url ?? entry?.url ?? entry);
  }
  if (Array.isArray(message?.content)) {
    for (const part of message.content) {
      candidates.push(part?.image_url?.url ?? part?.url);
    }
  }
  return candidates.find((value) => typeof value === 'string' && value.startsWith('data:')) || null;
}

// Imagen's dedicated generateImages() call is deprecated, so ask an
// image-capable model for a picture straight out of generateContent().
async function generateImageViaGemini(ai, model, prompt) {
  const response = await ai.models.generateContent({ model, contents: prompt });

  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData);
  if (!imagePart) throw new Error('Model response did not include an image.');

  const { mimeType, data } = imagePart.inlineData;
  return `data:${mimeType};base64,${data}`;
}

async function generateImageViaOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('No OPENROUTER_API_KEY set in the root .env file.');

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENROUTER_IMAGE_MODEL,
      modalities: ['image', 'text'],
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || `OpenRouter returned ${response.status}`);
  }

  const imageUrl = extractOpenRouterImage(payload?.choices?.[0]?.message);
  if (!imageUrl) throw new Error('OpenRouter response did not include an image.');
  return imageUrl;
}

// The Gemini SDK throws errors whose .message is itself a raw JSON blob from
// the API (e.g. `{"error":{"code":429,"message":"...spending cap..."}}`).
// Unwrap that so the UI can show a readable sentence instead of raw JSON.
function readableErrorMessage(error) {
  const raw = error?.message || 'Unexpected error';
  try {
    const parsed = JSON.parse(raw);
    return parsed?.error?.message || raw;
  } catch {
    return raw;
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, hasServerKey: Boolean(process.env.GEMINI_API_KEY) });
});

app.post('/api/generate', async (req, res) => {
  const { apiKey: frontendKey, textModel, imageModel, contentGoal, targetAudience, brief, script } = req.body;

  const apiKey = resolveApiKey(frontendKey);
  if (!apiKey) {
    return res.status(400).json({ error: 'No Gemini API key found. Paste one in Advanced Settings or add GEMINI_API_KEY to server/.env.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are an expert advertising storyboard artist turning a creator's script into an annotated shot list.
Break the script into exactly ${FRAME_COUNT} logical visual frames (shots).

First describe 'character': one recurring on-camera person, in a single sentence covering age, hair, build and clothing, specific enough that an artist redraws the same person in every panel. Never change them between frames.

For each frame provide:
1. 'action': what happens visually on screen.
2. 'voiceover': the line spoken over this frame.
3. 'scene': what the artist should draw - camera framing, the character's pose and expression, what they hold, and a simple background.
4. 'on_screen_text': a short punchy ALL-CAPS headline lettered inside the panel, 2 to 5 words. Use "" when a panel needs none.
5. 'speech_bubble': a very short line the character says in a bubble, at most 6 words. Use "" when a panel needs none.
6. 'annotations': 0 to 3 very short labels (1 to 3 words each) that arrows point at, calling out a product feature or detail visible in the drawing.

Keep the language concrete and visual. Return valid JSON only.`;

    const userPrompt = `Content Goal: ${contentGoal || 'N/A'}
Target Audience: ${targetAudience || 'N/A'}
Brief: ${brief || 'N/A'}

Script:
${script}

Output JSON object format:
{
  "character": "Sarah, mid-20s woman with long wavy hair, casual linen shirt",
  "frames": [
    {
      "action": "Description of the action...",
      "voiceover": "Spoken line...",
      "scene": "Close-up of the character looking frustrated at her reflection, bathroom mirror behind her",
      "on_screen_text": "TIRED OF THIS?",
      "speech_bubble": "Sticky and greasy!",
      "annotations": ["HEAVY FORMULA", "NO GLOW"]
    }
  ]
}`;

    const textResponse = await ai.models.generateContent({
      model: textModel || 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const framesText = textResponse.text;
    let parsed;
    try {
      parsed = JSON.parse(framesText);
    } catch (e) {
      console.error('Failed to parse JSON from Gemini:', framesText);
      return res.status(500).json({ error: 'The model returned a response that could not be parsed into frames. Try generating again.' });
    }

    // Accept either the documented { character, frames } object or a bare array,
    // so an older-style response still renders.
    const character = Array.isArray(parsed) ? '' : parsed.character || '';
    let frames = Array.isArray(parsed) ? parsed : parsed.frames;
    if (!Array.isArray(frames) || frames.length === 0) {
      return res.status(500).json({ error: 'The model did not return any storyboard frames. Try generating again.' });
    }

    // The model occasionally returns more frames than asked for; hold it to the
    // agreed count so the storyboard length is predictable.
    frames = frames.slice(0, FRAME_COUNT);

    const imageModelToUse = imageModel || 'gemini-2.5-flash-image';

    const framesWithImages = await Promise.all(
      frames.map(async (frame, index) => {
        if (index >= IMAGE_FRAME_LIMIT) {
          return { ...frame, imageUrl: null, imageSource: 'skipped' };
        }

        // Build the artist prompt here so the house style and the recurring
        // character are identical on every panel.
        const imagePrompt = buildImagePrompt(frame, character);
        const withPrompt = { ...frame, image_prompt: imagePrompt };

        // Tried in order. OpenRouter leads because it can reach the image
        // models that actually render the in-panel text and annotation labels
        // this storyboard style needs; Gemini backs it up on the same prompt.
        const providers = [
          { name: 'openrouter', run: () => generateImageViaOpenRouter(imagePrompt) },
          { name: 'gemini', run: () => generateImageViaGemini(ai, imageModelToUse, imagePrompt) },
        ];

        const failures = [];
        for (const provider of providers) {
          try {
            const imageUrl = await provider.run();
            return { ...withPrompt, imageUrl, imageSource: provider.name };
          } catch (err) {
            const reason = readableErrorMessage(err);
            console.warn(`${provider.name} image generation failed:`, reason);
            failures.push(`${provider.name}: ${reason}`);
          }
        }

        // No metered provider could draw it, so fall back to the free renderer -
        // every frame still comes back with a sketch, just a rougher one.
        return {
          ...withPrompt,
          imageUrl: freeRendererUrl(imagePrompt),
          imageSource: 'free',
          imageError: failures.join(' | '),
        };
      })
    );

    res.json({ frames: framesWithImages });
  } catch (error) {
    console.error('Error generating storyboard:', error);
    res.status(500).json({ error: readableErrorMessage(error) });
  }
});

app.post('/api/pitch', async (req, res) => {
  const {
    apiKey: frontendKey,
    textModel,
    creatorName,
    creatorNiche,
    followers,
    brandName,
    product,
    script,
  } = req.body;

  const apiKey = resolveApiKey(frontendKey);
  if (!apiKey) {
    return res.status(400).json({ error: 'No Gemini API key found. Paste one in Advanced Settings or add GEMINI_API_KEY to server/.env.' });
  }
  if (!script) {
    return res.status(400).json({ error: 'Approve a script before generating a pitch.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You write short, specific, non-cringe brand collaboration pitches on behalf of content creators.
Avoid corporate buzzwords, avoid sounding like a template, and avoid over-using emoji. Reference concrete details
from the script instead of generic praise. Keep the email warm but brief.`;

    const userPrompt = `Creator name: ${creatorName || 'the creator'}
Niche: ${creatorNiche || 'content creation'}
Follower count: ${followers || 'N/A'}
Brand: ${brandName || 'the brand'}
Product / focus: ${product || 'N/A'}

Approved script for the pitch reel:
${script}

Return valid JSON with this exact shape:
{
  "subject": "short email subject line, under 60 characters",
  "email_body": "full pitch email body, 120-180 words, signed off with the creator's name",
  "instagram_dm": "a casual 2-4 sentence Instagram DM version, at most 1 emoji"
}`;

    const response = await ai.models.generateContent({
      model: textModel || 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    let pitch;
    try {
      pitch = JSON.parse(response.text);
    } catch (e) {
      console.error('Failed to parse pitch JSON:', response.text);
      return res.status(500).json({ error: 'The model returned a response that could not be parsed. Try regenerating.' });
    }

    res.json({ pitch });
  } catch (error) {
    console.error('Error generating pitch:', error);
    res.status(500).json({ error: readableErrorMessage(error) });
  }
});

const PORT = process.env.PORT || 3001;
// Report up front whether the preferred image provider can actually draw, so a
// funding problem shows as one line at startup instead of a wall of per-frame
// errors during a generation.
async function reportImageProviderStatus() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.warn('[images] No OPENROUTER_API_KEY set. Falling back to Gemini, then the free renderer.');
    return;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/credits', {
      headers: { Authorization: `Bearer ${key}` },
    });
    const { data } = await response.json();
    const remaining = (data?.total_credits ?? 0) - (data?.total_usage ?? 0);

    if (remaining > 0) {
      console.log(`[images] OpenRouter ready, $${remaining.toFixed(4)} of credit available.`);
    } else {
      console.warn(
        `[images] OpenRouter key has no credit (added $${data?.total_credits ?? 0}, used $${data?.total_usage ?? 0}). ` +
          'Frames will fall back to the free renderer, which cannot draw panel text or labels. ' +
          'Add credit at https://openrouter.ai/settings/credits on the same account that issued this key.'
      );
    }
  } catch (err) {
    console.warn('[images] Could not check OpenRouter credit:', err.message);
  }
}

app.listen(PORT, () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[warning] No GEMINI_API_KEY found in the root .env - the app will require a key pasted in the UI for every request.');
  }
  console.log(`Storyboard API server running on http://localhost:${PORT}`);
  reportImageProviderStatus();
});
setInterval(() => {}, 1000);
