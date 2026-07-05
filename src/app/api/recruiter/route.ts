import { NextRequest } from "next/server";

const COHERE_KEY = process.env.COHERE_API_KEY!;
const COHERE_URL = "https://api.cohere.com/v2/chat";

function recruiterPrompt(resume: string, jobDescription: string) {
  return `You are a senior technical recruiter with 15+ years of experience at top tech companies. You have reviewed tens of thousands of resumes. Analyze this resume as if you are the recruiter deciding whether to schedule a phone screen.

CRITICAL INSTRUCTIONS:
1. Be brutally honest — recruiters don't sugarcoat
2. Think like a human recruiter, not a machine
3. Give specific, actionable feedback
4. Consider what would make you pick this resume from a pile of 200
5. Format output in clean Markdown with ## headings

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

GENERATE ALL 10 SECTIONS:

## 1. Recruiter Score
Score out of 100. Break it into sub-scores:
- Content Quality: /20
- Relevance to Role: /20
- Formatting & Readability: /20
- Impact & Achievements: /20
- Overall Impression: /20

## 2. First Impression (6 Seconds Scan)
Recruiters spend ~6 seconds on first scan. What stands out? What's the immediate impression? Would you keep reading?

## 3. Strengths (What Works)
List 3-5 things that are done well and would catch a recruiter's eye.

## 4. Weaknesses (What's Missing)
List 3-5 things that would make a recruiter pass on this resume. Be specific.

## 5. Red Flags
Anything that would make a recruiter concerned? (Gaps, vague descriptions, mismatched experience, etc.)

## 6. What Recruiters Look For
Compare against what top recruiters check:
- Quantified achievements (numbers, %, $)
- Action verbs
- Relevant keywords
- Clear career progression
- Appropriate length

## 7. Competitive Analysis
How does this resume compare to what you'd expect from a strong candidate for this role? What separates top 10% resumes from average ones?

## 8. Recruiter Tips
3-5 specific tips to make this resume stand out to a human recruiter (not just ATS).

## 9. Phone Screen Decision
Would you schedule a phone screen for this candidate? Why or why not? What questions would you ask in the phone screen?

## 10. Rewrite Example
Rewrite ONE bullet point from the resume to show how a recruiter would want to see it. Show before/after.`;
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
        messages: [{ role: "user", content: recruiterPrompt(resume, jobDescription) }],
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
