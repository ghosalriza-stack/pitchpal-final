# AI Script Generator - Developer Handoff

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Axios, Lucide-React
- **Backend**: Node.js, Express, Multer (File uploads)
- **AI**: Google Generative AI (\`@google/generative-ai\`) for Gemini 1.5 Pro
- **File Parsing**: \`pdf-parse\` (PDFs), \`mammoth\` (Word docs)

## Directory Structure
- \`prototype/backend/\`: Node.js API.
- \`prototype/frontend/\`: React frontend app.

## How to Run

### 1. Backend Setup
1. Ensure Node.js is installed.
2. Navigate to \`prototype/backend\` in terminal: \`cd prototype/backend\`
3. Install dependencies: \`npm install\`
4. Open \`.env\` and replace \`your_gemini_api_key_here\` with a real Google AI Studio API key.
5. Start server: \`npm start\` (Runs on http://localhost:5001)

### 2. Frontend Setup
1. Open a new terminal window.
2. Navigate to \`prototype/frontend\`: \`cd prototype/frontend\`
3. Install dependencies: \`npm install\`
4. Start dev server: \`npm run dev\`
5. Open the displayed local URL in your browser.

## Features Implemented
- **Step 1**: Upload files, paste Canva links, or type the brief.
- **Step 2**: Gemini AI extracts Objective, Audience, and Core Idea. User can edit.
- **Step 3 & 4**: Generates 3 scripts (Simple, Best Match, Bold). Strict text editor UI that preserves Hook, Setup, Content, CTA formatting. Export to clipboard.

## Script-experiment-4: Brand Research Assistant

### Description
A self-contained prototype that does research on behalf of the creator rather than them manually researching and uploading documents. The creator inputs a brand name, and the system pulls real-time brand positioning, product data, competitor context, hook banks, and creator opportunity details from the web, synthesizing them into a multi-tab PitchPal research report.

### How to Run

#### 1. Backend Setup
1. Open a terminal window.
2. Navigate to `prototypes/Script-experiment-4/backend`: `cd prototypes/Script-experiment-4/backend`
3. Run `npm install` (if not done already).
4. Run `npm start` (Runs on http://localhost:5002).

#### 2. Frontend Setup
1. Open a new terminal window.
2. Navigate to `prototypes/Script-experiment-4/frontend`: `cd prototypes/Script-experiment-4/frontend`
3. Run `npm install` (if not done already).
4. Run `npm run dev` (Runs on http://localhost:3001).
5. Open `http://localhost:3001` in your browser.

## Script-experiment-5: Integrated Script & Storyboard Flow

### Description
An integrated prototype that stitches the complete creation flow: **Login -> Brief Input -> AI-powered Brief Analysis & Strategy -> 3-variation Script Editor -> 4-frame Visual Storyboard Generator**. The script generator view features an "Approve & Create Storyboard" button that transitions the approved script (concatenated Hook, Setup, Content, CTA) directly to the Storyboard builder. The Storyboard generator supports generating images via Hugging Face Access Token with a robust, zero-configuration fallback using Pollinations.ai.

### How to Run

#### 1. Backend Setup
1. Open a terminal window.
2. Navigate to `prototypes/Script-experiment-5/backend`: `cd prototypes/Script-experiment-5/backend`
3. Run `npm install` (if not done already).
4. Create a `.env` file containing your `GEMINI_API_KEY`.
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

