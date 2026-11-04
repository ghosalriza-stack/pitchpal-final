# Prototype Handoff Notes

This file tracks what's currently in `prototypes/` and how to run each one. Older, superseded prototypes are removed once a newer one replaces them - check git history if you need to recover one.

## How the two prototypes fit together

`Script-experiment-5` (PitchPal, port 3002) is the **gateway**: sign-in, onboarding, and the pitch dashboard. `creator-storyboard` (Storyboard Studio, port 5173) is the **workspace**: brief -> storyboard -> pitch.

The dashboard's "Open Storyboard Studio" button links across, passing the signed-in creator in the query string (`?creator=&handle=&niche=&followers=`). The two apps run on different origins so they cannot share localStorage - the URL is the handoff channel. Storyboard Studio reads those params in `client/src/lib/session.js`, caches them so a refresh stays signed in, then strips the query string from the address bar. Its "Sign out" chip clears that cache and returns to the gateway.

Sign-in is deliberately fake: no backend auth, no real data. "Continue with demo account" uses the `DEMO_USER` constant, and the phone/OTP path accepts any input.

The URLs each app uses to reach the other are the `STORYBOARD_STUDIO_URL` constant in `Script-experiment-5/frontend/src/App.jsx` and `GATEWAY_URL` in `creator-storyboard/client/src/App.jsx`.

## creator-storyboard

The main workspace: brief -> shot-by-shot storyboard -> drafted brand pitch email/DM. See the repo-root `README.md` for what it does and full run instructions.

## Script-experiment-5: Gateway and Integrated Script Flow

### Description
An integrated prototype that stitches the complete creation flow: **Login -> Brief Input -> AI-powered Brief Analysis & Strategy -> 3-variation Script Editor -> 4-frame Visual Storyboard Generator**. The script generator view features an "Approve & Create Storyboard" button that transitions the approved script (concatenated Hook, Setup, Content, CTA) directly to the Storyboard builder. The Storyboard generator supports generating images via Hugging Face Access Token with a robust, zero-configuration fallback using Pollinations.ai.

### How to Run

#### 1. Backend Setup
1. Open a terminal window.
2. Navigate to `prototypes/Script-experiment-5/backend`: `cd prototypes/Script-experiment-5/backend`
3. Run `npm install` (if not done already).
4. Add your `GEMINI_API_KEY` to the shared `.env` file at the repo root (copy `.env.example` to `.env` there if you haven't already).
5. Run `npm start` (Runs on http://localhost:5003).

#### 2. Frontend Setup
1. Open a new terminal window.
2. Navigate to `prototypes/Script-experiment-5/frontend`: `cd prototypes/Script-experiment-5/frontend`
3. Run `npm install` (if not done already).
4. Run `npm run dev` (Runs on http://localhost:3002).
5. Open `http://localhost:3002` in your browser.

## Script-experiment-6: Comprehensive Creator Portal (with Onboarding & Login)

### Description
An advanced, highly styled (pink brand theme) integrated prototype that models the complete creator onboarding experience. The flow contains: **Login -> Verification code (OTP) -> Onboarding profile questions -> Dashboard / Welcome Home -> New Brief Input -> Strategy review -> Script editor -> Storyboard builder**. The image generation model is selectable (Google AI Studio Imagen 3 vs. Pollinations AI).

### How to Run

#### 1. Backend Setup
1. Open a terminal window.
2. Navigate to `prototypes/Script-experiment-6/backend`: `cd prototypes/Script-experiment-6/backend`
3. Run `npm install` (if not done already).
4. Create a `.env` file containing your `GEMINI_API_KEY`.
5. Run `npm start` (Runs on http://localhost:5005).

#### 2. Frontend Setup
1. Open a new terminal window.
2. Navigate to `prototypes/Script-experiment-6/frontend`: `cd prototypes/Script-experiment-6/frontend`
3. Run `npm install` (if not done already).
4. Run `npm run dev` (Runs on http://localhost:3005).
5. Open `http://localhost:3005` in your browser.

## Script-experiment-7: Direct Creator Storyboard Flow (Bypassed Login/Onboarding)

### Description
A variant of the comprehensive creator portal that bypasses the login/OTP and onboarding stages entirely, starting the user directly at the welcome dashboard with a pre-configured mock creator profile. This enables immediate testing of the brand strategy extraction, script variations, and visual storyboard generator (using Google AI Studio Imagen 3 and Pollinations.ai fallback).

### How to Run

#### 1. Backend Setup
1. Open a terminal window.
2. Navigate to `prototypes/Script-experiment-7/backend`: `cd prototypes/Script-experiment-7/backend`
3. Run `npm install` (if not done already).
4. Create a `.env` file containing your `GEMINI_API_KEY`.
5. Run `npm start` (Runs on http://localhost:5006).

#### 2. Frontend Setup
1. Open a new terminal window.
2. Navigate to `prototypes/Script-experiment-7/frontend`: `cd prototypes/Script-experiment-7/frontend`
3. Run `npm install` (if not done already).
4. Run `npm run dev` (Runs on http://localhost:3006).
5. Open `http://localhost:3006` in your browser.

## Script-experiment-8: Integrated Brand Research & Storyboard Flow

### Description
An integrated prototype that seamlessly fuses the deep **Brand Research Assistant** (from `Script-experiment-4`) directly into the creation flow. In Step 1, creators can enter a brand name (e.g., Rare Beauty, Red Bull, Glossier) to scrape live web intelligence and synthesize a 5-tab brand report (Profile, Target Audience, Product Cues, Hook Bank & UGC Angles, Creator Opportunity) with PDF export. Clicking **"Apply to Strategy & Continue"** pre-populates Step 2 (Review Strategy), infuses Step 3 with real brand messaging/hooks to generate 3 custom scripts, and passes the chosen script into Step 4 (Storyboard Studio with sketches). Creators can also choose the traditional brief file upload at any time.

### How to Run

#### 1. Backend Setup
1. Open a terminal window.
2. Navigate to `prototypes/Script-experiment-8/backend`: `cd prototypes/Script-experiment-8/backend`
3. Run `npm install` (if not done already).
4. Ensure `.env` at the repo root contains your `GEMINI_API_KEY`.
5. Run `npm start` (Runs on http://localhost:5007).

#### 2. Frontend Setup
1. Open a new terminal window.
2. Navigate to `prototypes/Script-experiment-8/frontend`: `cd prototypes/Script-experiment-8/frontend`
3. Run `npm install` (if not done already).
4. Run `npm run dev` (Runs on http://localhost:3007).
5. Open `http://localhost:3007` in your browser.

## Script-experiment-9: Creator Profile Onboarding & Intelligent Brand Matching Flow

### Description
A dedicated prototype with an end-to-end flow centered around **Creator Persona & Setup**:
1. **Login & Profile Onboarding**: Creators sign in and fill out detailed inputs about themselves:
   - Sector / Niche (e.g. Travel, Adventure, Lifestyle, Fashion, Beauty & Skincare, Tech & Gadgets, etc.)
   - Gender / Identity Selection (Female, Male, Non-binary, Prefer to self-describe, Prefer not to say)
   - Lighting Style (Natural Light / Golden Hour, Studio Key Light / Softbox, Moody Low Light, Cyberpunk RGB, etc.)
   - Shooting Environment & Style (Outdoor Wilderness, Handheld Vlogging, Home Studio, Pro Studio, Urban Streets, etc.)
   - Content Description & Creator Bio (what kind of content they create)
2. **Brand Research & Creator-Brand Match Matrix**: Creators enter any brand name to scrape live web intelligence. The AI runs a deep Creator-to-Brand match evaluating:
   - Compatibility & Synergy Score (e.g. 94% Synergy)
   - Lighting & Shooting Environment alignment with the brand's aesthetic
   - Sector & Audience fit
   - 3 tailored UGC angles crafted specifically for the creator's setup
   - Ready-to-send custom outreach pitch letter
3. **Strategy, 3-Variation Script Generator, and Storyboard Studio**: Injects creator lighting and environment directly into shot visual cues and audio lines.

### How to Run

#### 1. Backend Setup
1. Open a terminal window.
2. Navigate to `prototypes/Script-experiment-9/backend`: `cd prototypes/Script-experiment-9/backend`
3. Run `npm start` (Runs on http://localhost:5009).

#### 2. Frontend Setup
1. Open a new terminal window.
2. Navigate to `prototypes/Script-experiment-9/frontend`: `cd prototypes/Script-experiment-9/frontend`
3. Run `npm run dev` (Runs on http://localhost:3009).
4. Open `http://localhost:3009` in your browser.

## Script-experiment-10: Visual Storyboard Proposal & Multi-Model Real-Time Brand Research

### Description
A comprehensive production prototype expanding on the creator flow with complete pitch proposal and export capabilities:
1. **Real-Time Live Brand Research & Fact Grounding**:
   - Queries live web search engines (DuckDuckGo + Wikipedia) in parallel.
   - Resilient multi-model Gemini fallback pipeline (`gemini-flash-latest` → `gemini-3.6-flash` → `gemini-3.5-flash` → `gemma-4-26b-a4b-it`).
   - Extracts real product lines, exact hero best-sellers, verified local pricing, and authentic brand founder stories.
2. **Step 5: Tailored Pitch Proposal & Send to Brand Outreach**:
   - Replaces raw ASCII text dumps with a clean, professional collaboration proposal letter.
   - Directly embeds the **Attached Visual Storyboard Deck** (4 visual panels featuring sketches, visual direction, and voiceover audio).
   - Outreach actions: One-click copy for email, Copy for Instagram DM, Open in default Email app (`mailto:`), and Mark as Sent tracker.
3. **Storyboard Export (PDF & Image)**:
   - Available in both Step 4 (Storyboard Studio) and Step 5 (Pitch Outreach).
   - Instant 2x high-resolution export to **PDF** (`PitchPal-[Brand]-Storyboard.pdf`) and **PNG Image** (`PitchPal-[Brand]-Storyboard.png`).

### How to Run

#### 1. Backend Setup
1. Open a terminal window.
2. Navigate to `prototypes/Script-experiment-10/backend`: `cd prototypes/Script-experiment-10/backend`
3. Run `npm start` (Runs on http://localhost:5010).

#### 2. Frontend Setup
1. Open a new terminal window.
2. Navigate to `prototypes/Script-experiment-10/frontend`: `cd prototypes/Script-experiment-10/frontend`
3. Run `npm run dev` (Runs on http://localhost:3010).
4. Open `http://localhost:3010` in your browser.

