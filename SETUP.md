# Setup Guide

Step-by-step guide to install and run AI Career Guide.

## Prerequisites

- **Node.js** (v18 or higher) — [Download here](https://nodejs.org)
- **npm** (comes with Node.js)
- **Git** — [Download here](https://git-scm.com)

## Installation

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ai-career-guide.git
cd ai-career-guide
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get a Cohere API Key

1. Go to [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)
2. Sign up for free (no credit card needed)
3. Click "Create API Key"
4. Copy the key

### 4. Create environment file

Create a file called `.env.local` in the project root:

```
COHERE_API_KEY=paste-your-key-here
```

### 5. Start the app

```bash
npm run dev
```

### 6. Open in browser

Go to [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### "Turbopack is not supported on this platform"

The dev server already uses webpack. If you see this error during build:

```bash
npm run build
```

It should work. If not, the app still runs fine with `npm run dev`.

### "AI API error (400)"

Your API key might be invalid. Check `.env.local` and make sure the key is correct.

### "PDF parsing failed"

Make sure you're uploading a valid PDF file (not a scanned image).

### Port already in use

```bash
npx next dev -p 3001
```

Then open [http://localhost:3001](http://localhost:3001).

## Features Overview

| Page | What it does |
|------|-------------|
| Dashboard | Home page with all features |
| Analyze Resume | Upload PDF or paste text for AI analysis |
| ATS Score Check | Score resume against a job description |
| Recruiter Score | AI recruiter review with sub-scores |
| Resume Parser | Extract structured data from resume |
| JD Parser | Parse job descriptions |
| Tailor Resume | Rewrite resume for a specific job |
| AI Chat | Ask questions about your resume |
| Interview Prep | Practice interview questions |
| Skill Gaps | Find missing skills + learning plan |
| Resume Builder | Pick template, AI formats resume |
| Download PDF | Export resume as PDF |
| Version History | Save and compare versions |
| Analytics | Track usage |
