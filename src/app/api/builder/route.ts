import { NextRequest } from "next/server";

const COHERE_KEY = process.env.COHERE_API_KEY!;
const COHERE_URL = "https://api.cohere.com/v2/chat";

function buildPrompt(resumeText: string, template: string, instructions?: string) {
  const templateDescriptions: Record<string, string> = {
    professional: "Clean, traditional format. Single column, clear section headers, reverse chronological. Best for corporate, finance, government roles.",
    modern: "Two-column layout with a sidebar for skills/contact. Clean typography. Best for tech, startups, creative roles.",
    minimal: "Very clean, lots of whitespace. Simple section dividers. No graphics. Best for conservative industries.",
    creative: "Unique layout with color accents and visual hierarchy. Best for design, marketing, media roles.",
  };

  let prompt = `You are an expert resume formatter. Take this resume content and reformat it using the "${template}" template style.

TEMPLATE STYLE: ${templateDescriptions[template] || templateDescriptions.professional}

RESUME CONTENT:
${resumeText}`;

  if (instructions) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS:\n${instructions}`;
  }

  prompt += `\n\nRULES:
1. Keep ALL content from the original resume - do not remove anything
2. Reformat to match the template style described above
3. Use clean text formatting with clear section headers
4. Use proper indentation and bullet points
5. Make it ATS-friendly (no tables, no columns in text output)
6. Format contact info on a single line at the top
7. Use consistent date formatting throughout
8. Add clear section dividers
9. Make achievements quantified and impactful where possible
10. Output the complete formatted resume text

Return ONLY the formatted resume text, no markdown code blocks, no explanation.`;

  return prompt;
}

export async function POST(req: NextRequest) {
  try {
    const { resumeText, template, instructions } = await req.json();

    if (!resumeText?.trim()) {
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
        messages: [{ role: "user", content: buildPrompt(resumeText, template || "professional", instructions) }],
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

    return Response.json({ result: result.replace(/```/g, "").trim() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
