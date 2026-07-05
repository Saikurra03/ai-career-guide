import { NextRequest } from "next/server";

const COHERE_KEY = process.env.COHERE_API_KEY!;
const COHERE_URL = "https://api.cohere.com/v2/chat";

function tailorPrompt(resume: string, jobDescription: string) {
  return `You are an expert resume writer who specializes in tailoring resumes for specific job postings. Rewrite this resume to maximize its match for the target job while keeping it honest and professional.

CRITICAL RULES:
1. DO NOT fabricate experience or skills the candidate doesn't have
2. DO rewrite bullet points to emphasize relevant achievements
3. DO use keywords from the job description naturally
4. DO quantify achievements where possible
5. DO reorder sections to highlight most relevant experience first
6. DO rewrite the summary to target this specific role

RESUME:
${resume}

TARGET JOB DESCRIPTION:
${jobDescription}

GENERATE ALL 8 SECTIONS:

## 1. Tailored Summary
Rewrite the professional summary to specifically target this role. Mirror the language from the job description. Keep it 3-4 sentences.

## 2. Optimized Bullet Points
For each job in the experience section, rewrite the bullet points to:
- Start with strong action verbs
- Include relevant keywords from the job description
- Quantify achievements with numbers/percentages where possible
- Focus on impact and results that match what the employer wants
Show BEFORE and AFTER for each bullet.

## 3. Skills Reordering
List skills in order of relevance to this specific job. Put the most important ones first. Separate into:
- Must-highlight skills (directly mentioned in JD)
- Supporting skills (complementary)
- Bonus skills (additional value)

## 4. Keywords to Add
List specific keywords and phrases from the job description that should be woven into the resume. Group by section where they should appear.

## 5. Section Reordering
Recommend the optimal order of resume sections for this specific application. Explain why.

## 6. Weaknesses to Address
What gaps or weaknesses exist in the resume for THIS specific role? How can they be minimized?

## 7. Cover Letter Talking Points
5 key points to include in a cover letter for this specific role, based on the resume-job match.

## 8. Complete Tailored Resume
Output the FULL rewritten resume text, properly formatted, that the candidate can copy and use. Use clean text formatting with clear section headers.`;
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
        messages: [{ role: "user", content: tailorPrompt(resume, jobDescription) }],
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
