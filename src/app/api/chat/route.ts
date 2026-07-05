import { NextRequest } from "next/server";

const COHERE_KEY = process.env.COHERE_API_KEY!;
const COHERE_URL = "https://api.cohere.com/v2/chat";

function systemPrompt(resume: string, jobDescription?: string) {
  let prompt = `You are an expert career advisor and resume coach. You have the candidate's resume and are helping them improve it, prepare for interviews, and answer questions about their career.

RESUME:
${resume}`;

  if (jobDescription) {
    prompt += `\n\nTARGET JOB DESCRIPTION:\n${jobDescription}`;
  }

  prompt += `\n\nRULES:
- Be helpful, specific, and actionable
- Reference specific details from the resume when answering
- Give concrete examples and suggestions
- Be conversational but professional
- If asked about something not in the resume, say so honestly
- For interview questions, give structured answers with examples
- For resume advice, be specific about what to change and why
- Keep responses concise but thorough (2-4 paragraphs max)`;

  return prompt;
}

export async function POST(req: NextRequest) {
  try {
    const { message, resume, jobDescription, history } = await req.json();

    if (!message?.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    if (!resume?.trim()) {
      return Response.json({ error: "Resume content is required" }, { status: 400 });
    }

    if (!COHERE_KEY || COHERE_KEY === "your-key-here") {
      return Response.json({ error: "Please set your COHERE_API_KEY in .env.local" }, { status: 500 });
    }

    const systemMsg = systemPrompt(resume, jobDescription);
    const messages = [
      { role: "user" as const, content: systemMsg },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const res = await fetch(COHERE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        messages,
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
