import { NextRequest } from "next/server";

const COHERE_KEY = process.env.COHERE_API_KEY!;
const COHERE_URL = "https://api.cohere.com/v2/chat";

function jdPrompt(jobDescription: string) {
  return `You are an expert job description analyzer. Parse this job posting and extract all structured data. Be thorough.

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "title": "",
  "company": "",
  "location": "",
  "type": "",
  "salary": "",
  "remote": "",
  "summary": "",
  "requirements": {
    "required": [],
    "nice_to_have": []
  },
  "skills": {
    "technical": [],
    "soft": [],
    "tools": [],
    "certifications": [],
    "languages": []
  },
  "experience": {
    "min_years": "",
    "level": "",
    "domains": []
  },
  "education": {
    "degree": "",
    "field": "",
    "alternative": ""
  },
  "responsibilities": [],
  "benefits": [],
  "keywords": [],
  "application": {
    "deadline": "",
    "url": "",
    "notes": ""
  }
}

RULES:
- If a field is not found, use empty string "" or empty array []
- Extract ALL technical skills, tools, frameworks mentioned
- List keywords that ATS systems would scan for
- Identify both required and nice-to-have skills
- For salary, extract the range if mentioned
- For experience, estimate the level (entry, mid, senior, lead, etc.)
- Return ONLY the JSON`;
}

export async function POST(req: NextRequest) {
  try {
    const { jobDescription } = await req.json();

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
        messages: [{ role: "user", content: jdPrompt(jobDescription) }],
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

    let parsed;
    try {
      const cleaned = result.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return Response.json({ error: "Failed to parse AI response as JSON", raw: result }, { status: 500 });
    }

    return Response.json({ parsed });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
