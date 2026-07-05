# AI Career Guide

AI-powered resume analyzer with 13 features to help you build, optimize, and ace your job application.

## Features

- **Resume Analysis** — AI-powered resume review with detailed feedback
- **ATS Score Check** — Check if your resume passes Applicant Tracking Systems
- **Recruiter Score** — Get rated by an AI recruiter with sub-scores
- **Resume Parser** — Extract structured data (skills, experience, education)
- **JD Parser** — Parse job descriptions into structured requirements
- **Tailor Resume** — Rewrite your resume for a specific job
- **AI Chat** — Ask questions about your resume
- **Interview Prep** — Practice questions by category (behavioral, technical, etc.)
- **Skill Gap Analysis** — Find missing skills with a learning plan
- **Resume Builder** — Pick a template, AI formats your resume
- **Download PDF** — Export your resume as a clean PDF
- **Version History** — Save, compare, and diff resume versions
- **Analytics** — Track all your analyses

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Cohere API (Command A model)
- pdf2json (PDF parsing)
- jsPDF (PDF download)

## Setup

See [SETUP.md](SETUP.md) for detailed installation instructions.

Quick start:

```bash
git clone https://github.com/YOUR_USERNAME/ai-career-guide.git
cd ai-career-guide
npm install
```

Create `.env.local`:
```
COHERE_API_KEY=your-key-here
```

Get your free API key at [cohere.com](https://dashboard.cohere.com/api-keys)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── upload/page.tsx       # Resume upload & analysis
│   ├── results/page.tsx      # Analysis results
│   ├── ats/page.tsx          # ATS score check
│   ├── recruiter/page.tsx    # Recruiter scoring
│   ├── parser/page.tsx       # Resume parser
│   ├── jd/page.tsx           # JD parser
│   ├── tailor/page.tsx       # Resume tailoring
│   ├── chat/page.tsx         # AI chat
│   ├── interview/page.tsx    # Interview prep
│   ├── skills/page.tsx       # Skill gap analysis
│   ├── builder/page.tsx      # Resume builder
│   ├── download/page.tsx     # PDF download
│   ├── history/page.tsx      # Version history
│   ├── analytics/page.tsx    # Usage analytics
│   └── api/                  # API routes
├── components/
│   └── Sidebar.tsx           # Navigation sidebar
└── lib/
    └── track.ts              # Analytics tracking
```

## License

MIT
