import { NextRequest } from "next/server";

const COHERE_KEY = process.env.COHERE_API_KEY!;
const COHERE_URL = "https://api.cohere.com/v2/chat";

function skillsPrompt(resume: string, jobDescription: string, targetRole?: string) {
  let context = `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}`;
  if (targetRole) context += `\n\nTARGET ROLE:\n${targetRole}`;

  return `You are a career development expert and skills analyst. Analyze the gap between the candidate's current skills and what's needed for their target role.

${context}

CRITICAL INSTRUCTIONS:
1. Be specific about which skills are missing or weak
2. Prioritize skills by market demand and importance for the role
3. Provide actionable learning paths, not vague advice
4. Consider both hard skills and soft skills
5. Estimate time to learn each skill

GENERATE ALL 10 SECTIONS:

## 1. Skill Match Score
Overall match percentage. Break down into:
- Technical Skills Match: /100
- Soft Skills Match: /100
- Tools & Technologies Match: /100
- Overall Readiness: /100

## 2. Skills You Have (Matched)
List all skills from the resume that match the job requirements. Categorize by type. Rate confidence level for each (Strong, Moderate, Basic).

## 3. Critical Missing Skills
Skills the job requires that are completely absent from the resume. Rank by importance for the role. Explain WHY each is critical.

## 4. Weak Skills
Skills mentioned in the resume but seem underdeveloped based on experience. What level are they at vs what's needed?

## 5. Skill Priority Matrix
Categorize all missing/weak skills into:
- 🔴 Urgent (must learn before applying)
- 🟡 Important (should learn soon)
- 🟢 Nice to have (can learn later)

## 6. Learning Paths
For the top 5 most important missing skills, provide:
- What to learn specifically
- Recommended free/paid resources (courses, tutorials, projects)
- Estimated time to reach competency
- How to practice/apply

## 7. Portfolio Projects
3-5 project ideas the candidate could build to demonstrate missing skills. Each should:
- Target specific missing skills
- Be realistic to complete
- Be impressive to employers
- Include tech stack to use

## 8. Transferable Skills
Skills from the candidate's current experience that can be pivoted to this role. How to frame them.

## 9. Industry Trends
What skills are trending in this field? What should the candidate learn to stay competitive in the next 2-3 years?

## 10. 30-60-90 Day Learning Plan
A structured plan:
- 30 days: Quick wins, most urgent gaps
- 60 days: Core skill development
- 90 days: Advanced skills and portfolio projects`;
}

export async function POST(req: NextRequest) {
  try {
    const { resume, jobDescription, targetRole } = await req.json();

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
        messages: [{ role: "user", content: skillsPrompt(resume, jobDescription || "", targetRole || "") }],
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
