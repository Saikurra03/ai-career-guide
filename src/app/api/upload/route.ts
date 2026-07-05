import { NextRequest } from "next/server";

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return Response.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const PDFParser = (await import("pdf2json")).default;
    const parser = new PDFParser();

    const text = await new Promise<string>((resolve, reject) => {
      parser.on("pdfParser_dataError", (err: unknown) => reject(err));
      parser.on("pdfParser_dataReady", (pdfData: unknown) => {
        const data = pdfData as { Pages?: Array<{ Texts?: Array<{ R?: Array<{ T?: string }> }> }> };
        let extracted = "";
        if (data.Pages) {
          for (const page of data.Pages) {
            if (page.Texts) {
              for (const t of page.Texts) {
                if (t.R) {
                  for (const r of t.R) {
                    if (r.T) {
                      extracted += safeDecode(r.T) + " ";
                    }
                  }
                }
              }
            }
            extracted += "\n";
          }
        }
        resolve(extracted);
      });
      parser.parseBuffer(buffer);
    });

    const pages = text.split("\n").filter((l: string) => l.trim()).length;

    if (!text.trim() || text.trim().length < 30) {
      return Response.json({ error: "Could not extract enough text from PDF" }, { status: 400 });
    }

    return Response.json({ text, pages });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `Failed to read PDF: ${msg}` }, { status: 500 });
  }
}
