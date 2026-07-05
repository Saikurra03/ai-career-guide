const COHERE_KEY = process.env.COHERE_API_KEY!;
const COHERE_URL = "https://api.cohere.com/v2/chat";

function resumePrompt(resume: string, role: string, level: string) {
  const levelNames: Record<string, string> = {
    fresher: "Fresher / Student",
    mid_level: "Mid-Level (2-5 years)",
    experienced: "Senior (5+ years)",
  };
  const levelDisplay = levelNames[level] || "Fresher / Student";

  return `You are an experienced HR professional and career coach who analyzes resumes and gives detailed, actionable feedback.

CRITICAL INSTRUCTIONS:
1. Be honest about weaknesses - don't sugarcoat
2. Give specific, actionable improvements (not generic advice)
3. Score each section fairly
4. Format output in clean Markdown with ## headings

RESUME TO ANALYZE:
${resume}

TARGET JOB ROLE: ${role || "General / Not specified"}
EXPERIENCE LEVEL: ${levelDisplay}

GENERATE ALL 15 SECTIONS:

## 1. Overall Score
Give a score out of 100 with a brief justification.

## 2. Quick Summary
2-3 sentences about what this resume does well and what needs work.

## 3. Contact Information
Check if contact details are complete (name, email, phone, LinkedIn, location). What's missing?

## 4. Professional Summary / Objective
Is there a strong opening summary? Rate it and suggest improvements.

## 5. Skills Assessment
List the key skills found. Rate how well they match the target role. What's missing?

## 6. Work Experience Analysis
Evaluate the work experience section. Are achievements quantified? Is it results-focused?

## 7. Education
Review the education section. Any improvements needed?

## 8. Projects / Portfolio
Are projects relevant and well-described? Suggestions for improvement.

## 9. Formatting & Design
Is the resume well-structured? Check consistency, spacing, fonts, length.

## 10. ATS Compatibility
Will this resume pass Applicant Tracking Systems? Check for keywords, formatting issues.

## 11. Keywords Found
List important keywords found in the resume.

## 12. Missing Keywords
What important keywords for this role are missing?

## 13. Top 5 Improvements
List the 5 most important changes to make, ranked by impact.

## 14. Red Flags
Any issues that might turn off recruiters (typos, gaps, irrelevant info, etc.)

## 15. Improved Version
Rewrite the professional summary and one work experience bullet point in a stronger way.`;
}

export async function POST(req: Request) {
  try {
    const { resume, role, level } = await req.json();

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
        messages: [{ role: "user", content: resumePrompt(resume, role || "", level || "fresher") }],
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
