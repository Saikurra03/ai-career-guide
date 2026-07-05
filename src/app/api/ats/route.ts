import { NextRequest } from "next/server";

const COHERE_KEY = process.env.COHERE_API_KEY!;
const COHERE_URL = "https://api.cohere.com/v2/chat";

function atsPrompt(resume: string, jobDescription: string) {
  return `You are an Applicant Tracking System (ATS) expert. Analyze how well this resume matches the job description and give a detailed ATS compatibility report.

CRITICAL INSTRUCTIONS:
1. Be specific — list exact keywords found and missing
2. Give a realistic ATS score (most resumes score 40-70, only optimized ones score 80+)
3. Format output in clean Markdown with ## headings
4. Compare the resume skills/keywords against what the job description requires

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

GENERATE ALL 10 SECTIONS:

## 1. ATS Score
Give a score out of 100. Explain what the score means (e.g. "Below 50 = likely rejected by ATS, 50-70 = may pass, 70+ = strong match").

## 2. Match Summary
2-3 sentences on how well this resume matches the job.

## 3. Matched Keywords
List every keyword/phrase from the job description that IS found in the resume. Group by category (Skills, Tools, Certifications, etc.)

## 4. Missing Keywords
List every important keyword/phrase from the job description that is NOT in the resume. This is what the ATS will flag as missing.

## 5. Skills Match
Compare skills required vs skills present. Show as: ✅ Found or ❌ Missing for each required skill.

## 6. Experience Match
Does the resume meet the experience requirements? What's aligned and what's lacking?

## 7. Education Match
Does the resume meet the education requirements?

## 8. ATS Formatting Issues
Check for formatting problems that would confuse an ATS (tables, columns, special characters, headers, etc.)

## 9. Top 5 Fixes to Improve Score
List the 5 most impactful changes to boost the ATS score, ranked by impact.

## 10. Optimized Summary
Rewrite the resume's professional summary to better match this specific job description.`;
}

export async function POST(req: NextRequest) {
  try {
    const { resume, jobDescription } = await req.json();

    if (!resume?.trim()) {
      return Response.json({ error: "Resume content is required" }, { status: 400 });
    }

    if (!jobDescription?.trim()) {
      return Response.json({ error: "Job description is required" }, { status: 400 });
    }

    if (!COHERE_KEY || COHERE_KEY === "your-key-here") {
      return Response.json({ error: "Please set your COHERE_API_KEY in .env.local" }, { status: 500 });
    }

    const res = await fetch(COHERE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        messages: [{ role: "user", content: atsPrompt(resume, jobDescription) }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `AI API error (${res.status}): ${err.slice(0, 300)}` }, { status: 500 });
    }

    const data = await res.json();
    const result = data.message?.content?.[0]?.text;

    if (!result) {
      return Response.json({ error: "No response from AI model" }, { status: 500 });
    }

    return Response.json({ result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
