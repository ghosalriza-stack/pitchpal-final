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

