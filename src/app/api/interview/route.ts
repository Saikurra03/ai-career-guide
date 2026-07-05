import { NextRequest } from "next/server";

const COHERE_KEY = process.env.COHERE_API_KEY!;
const COHERE_URL = "https://api.cohere.com/v2/chat";

function interviewPrompt(resume: string, jobDescription: string, category: string) {
  const categoryInstructions: Record<string, string> = {
    all: "Generate a comprehensive mix of all interview question types below.",
    behavioral: "Focus on behavioral questions (STAR method). Ask about leadership, teamwork, conflict, failure, and achievement.",
    technical: "Focus on technical questions relevant to the candidate's skills and the job requirements.",
    situational: "Focus on situational/hypothetical questions about how they would handle future scenarios.",
    resume: "Focus on questions about specific items on their resume — projects, experience, gaps, choices.",
    "culture-fit": "Focus on culture fit questions — work style, values, career goals, motivation.",
  };

  return `You are a senior hiring manager and interview coach. Generate interview preparation questions and answers based on this resume and job description.

CATEGORY: ${category} — ${categoryInstructions[category] || categoryInstructions.all}

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Generate ALL 10 SECTIONS:

## 1. Interview Overview
Brief overview of what to expect in this interview. What the interviewer is likely looking for based on this role.

## 2. Likely Questions
List 10-15 specific interview questions most likely to be asked for this role, based on the resume and job description. Number them.

## 3. STAR Method Answers
For 3 of the behavioral questions above, provide full STAR method answers (Situation, Task, Action, Result) tailored to the candidate's experience.

## 4. Technical Deep Dive
If applicable, 5-8 technical questions based on the candidate's tech stack and the job requirements. Include expected answer points.

## 5. Resume Weaknesses to Prepare For
What questions might the interviewer ask about weak points in the resume? How should the candidate address them?

## 6. Questions to Ask the Interviewer
5-7 thoughtful questions the candidate should ask at the end of the interview. Tailored to this specific role and company.

## 7. Red Flags to Avoid
What answers or behaviors would be red flags? What should the candidate definitely NOT say?

## 8. First Impression Tips
Specific advice for this interview — company research, dress code, timing, follow-up.

## 9. Salary Negotiation Tips
If salary comes up, how should the candidate handle it? What's a reasonable range based on the role?

## 10. Confidence Boosters
3-5 reasons based on the resume why this candidate is a strong fit. Remind them of their strengths.`;
}

export async function POST(req: NextRequest) {
  try {
    const { resume, jobDescription, category } = await req.json();

    if (!resume?.trim()) {
      return Response.json({ error: "Resume content is required" }, { status: 400 });
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
        messages: [{ role: "user", content: interviewPrompt(resume, jobDescription || "", category || "all") }],
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
