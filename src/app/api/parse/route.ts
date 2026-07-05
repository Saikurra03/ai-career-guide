import { NextRequest } from "next/server";

const COHERE_KEY = process.env.COHERE_API_KEY!;
const COHERE_URL = "https://api.cohere.com/v2/chat";

function parserPrompt(resume: string) {
  return `You are an expert resume parser. Extract ALL structured data from this resume and return it as clean JSON. Be thorough — extract every detail you can find.

RESUME TEXT:
${resume}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "contact": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": "",
    "github": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "title": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "bullets": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "gpa": "",
      "details": []
    }
  ],
  "skills": {
    "programming": [],
    "frameworks": [],
    "tools": [],
    "databases": [],
    "cloud": [],
    "soft": [],
    "other": []
  },
  "certifications": [],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "link": ""
    }
  ],
  "languages": [],
  "awards": [],
  "publications": [],
  "volunteer": []
}

RULES:
- If a field is not found, use empty string "" or empty array []
- For dates, use the format found in the resume (e.g. "Jan 2023", "2022-2024", "Present")
- Extract ALL skills and categorize them properly
- For experience bullets, extract each bullet point as a separate string
- If no LinkedIn/website found, use ""
- Return ONLY the JSON, no markdown formatting`;
}

export async function POST(req: NextRequest) {
  try {
    const { resume } = await req.json();

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
        messages: [{ role: "user", content: parserPrompt(resume) }],
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

    // Try to extract JSON from the response
    let parsed;
    try {
      // Remove markdown code blocks if present
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
