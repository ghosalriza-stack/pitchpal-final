# Storyboard Studio

A tool for creators who need to turn a brand brief into a shootable video storyboard and a pitch email ready to send - without doing the writing, sketching, or outreach drafting by hand.

## The two apps

The project is two apps that hand off to each other:

- **PitchPal** (`prototypes/Script-experiment-5`) is the gateway - sign-in, onboarding, and a dashboard of past pitches. It runs on port 3002.
- **Storyboard Studio** (`prototypes/creator-storyboard`) is where the work happens - brief, storyboard, pitch. It runs on port 5173.

Start at the gateway. Sign in there, then press **Open Storyboard Studio** on the dashboard and it carries your creator details across, so the pitch step arrives already filled in. The "Sign out" chip in the Studio header takes you back to the gateway.

Storyboard Studio also runs perfectly well on its own - it just starts with an empty pitch form instead of a pre-filled one.

### Signing in

The gateway is a demo and never authenticates against anything. **Continue with demo account** signs you straight in as a sample creator, and the email and phone routes accept whatever you type - any phone number, any verification code. No real account or real data is needed at any point.

## What Storyboard Studio does

The app walks through three steps:

1. **Brief** - describe the content goal, target audience, and a rough script or idea (or pick a ready-made example from the template gallery).
2. **Storyboard** - the script is broken into a shot-by-shot storyboard. Each frame gets an action description, a voiceover/on-screen-text line, and a sketch-style image.
3. **Send pitch** - fill in who is pitching and to which brand, and get a drafted outreach email plus a short direct-message version, ready to copy or download as a text file.

Text generation runs on Google's Gemini API. Every frame is then drawn in a consistent black-and-white storyboard style, with a bold in-panel headline, a speech bubble, annotation labels on leader lines, and the same recurring character in every panel.

Sketches are drawn by OpenRouter first, since it can reach the image models that render in-panel text properly. Gemini's image model backs it up on the same prompt, and a free keyless renderer is the last resort so every frame always gets a picture - though that last tier produces much rougher art that does not reproduce the panel text or labels.

## Tech stack

- **Frontend**: React (Vite), Tailwind CSS, lucide-react icons
- **Backend**: Node.js, Express
- **AI**: Google Gemini API (`@google/genai`) for text and image generation

## Project structure

```
creator-storyboard/
  client/   React frontend (Vite dev server)
  server/   Express backend (talks to the Gemini API)
```

## How to run it

You need two things installed first: [Node.js](https://nodejs.org) (v18 or newer) and a free Google Gemini API key.

### 1. Get a Gemini API key

Go to [aistudio.google.com](https://aistudio.google.com), sign in, click "Get API key", then "Create API key in new project". Copy the key - it should start with `AIzaSy`.

### 2. Set up the shared `.env` file

This project shares one `.env` file with every other prototype in this repo, located at the **repo root** (three folders up from this one). Copy the example file if you haven't already:

```bash
cp ../../.env.example ../../.env
```

Then open the root `.env` and paste your key in:

```
GEMINI_API_KEY=AIzaSy...your-key-here...
```

Text generation works with just that key. To also draw frame sketches, add an OpenRouter key with credit on it (see https://openrouter.ai/settings/credits):

```
OPENROUTER_API_KEY=sk-or-v1-...your-key-here...
```

### 3. Start the backend

```bash
cd server
npm install
npm start
```

This runs the API server on `http://localhost:3001`.

### 4. Start the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173`. That is Storyboard Studio on its own - enough if you only want the storyboard and pitch tools.

### 5. Start the gateway (optional)

To begin at the sign-in and dashboard instead, run PitchPal in a third terminal:

```bash
cd ../Script-experiment-5/frontend
npm install
npm run dev
```

Open `http://localhost:3002`, press **Continue with demo account**, then **Open Storyboard Studio** on the dashboard.

### 6. Use it

Click one of the template cards on the first screen to try it with example content, or fill in your own content goal, audience, and script. Generating a storyboard usually takes 15-30 seconds since it calls the AI model once for the script breakdown and once per frame for the sketch image.

## Notes

- Every backend in this repo (this one included) reads its configuration from the single root `.env` file, so you only ever need to update your API key in one place.
- Frames show "Not sketched" by design for everything after the first frame. To draw every frame, raise `IMAGE_FRAME_LIMIT` in `server/server.js` once the image account has enough quota or credit.
- If frames come back labelled "free renderer", both metered providers were unavailable. OpenRouter needs credit at https://openrouter.ai/settings/credits, and Google's free tier reports zero image quota. Text generation is unaffected either way.
- The free renderer cannot draw in-panel headlines, speech bubbles or annotation labels. Those need OpenRouter or a Gemini account with image quota.
- Provider order lives in the `providers` array in `server/server.js` if you want to reorder or drop one.
- This is a prototype built for exploring the creator-to-brand pitch workflow, not a production application.
