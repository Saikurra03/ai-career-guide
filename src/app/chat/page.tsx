"use client";

import { useState, useRef, useEffect } from "react";
import { trackAnalysis } from "@/lib/track";

interface Message { role: "user" | "assistant"; content: string; }

function simpleMarkdown(md: string) {
  md = md.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  md = md.replace(/\*(.*?)\*/g, "<em>$1</em>");
  md = md.replace(/`(.*?)`/g, "<code>$1</code>");
  md = md.replace(/^- (.*)/gm, "<li>$1</li>");
  md = md.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  md = md.replace(/<\/ul>\s*<ul>/g, "");
  md = md.replace(/\n\n/g, "<br><br>");
  md = md.replace(/\n/g, "<br>");
  return md;
}

const suggestions = [
  "How can I improve my resume?",
  "What skills am I missing?",
  "Help me prepare for interview questions",
  "Rewrite my summary to be stronger",
  "What are my biggest weaknesses on this resume?",
  "How do my achievements compare to others?",
];

export default function ChatPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) { alert("Only PDF files are supported"); return; }
    setUploading(true);
    setFileName(file.name);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) { alert(data.error); setUploading(false); setFileName(""); return; }
      setResumeText(data.text);
      setFileName(`${file.name} (${data.pages} pages)`);
      setHasResume(true);
    } catch { alert("Upload failed"); }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || sending) return;
    if (!hasResume && !resumeText.trim()) { alert("Please upload or paste your resume first."); return; }

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          resume: resumeText,
          jobDescription: jobDescription || undefined,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.result }]);
        trackAnalysis("chat", "AI Chat");
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Failed to get response. Please try again." }]);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Setup Bar */}
      {!hasResume && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl px-4 py-3 text-center cursor-pointer transition-all ${
                  dragOver ? "border-primary bg-indigo-50" : "border-border hover:border-primary/50"
                }`}
              >
                <p className="text-xs text-text-muted">{fileName || "📁 Drop PDF or click to upload resume"}</p>
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => {
                  if (e.target.files?.length) handleFile(e.target.files[0]);
                }} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <input
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Optional: paste job description for context"
                className="w-full px-3 py-2 border-2 border-border rounded-xl text-xs focus:outline-none focus:border-primary transition-all"
              />
            </div>
            {hasResume && (
              <button onClick={() => { setHasResume(false); setResumeText(""); setFileName(""); setMessages([]); }}
                className="text-xs text-red-500 hover:text-red-700 font-medium">Clear</button>
            )}
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => { setResumeText(e.target.value); setHasResume(!!e.target.value.trim()); }}
            rows={3}
            placeholder="Or paste your resume text here..."
            className="w-full mt-3 px-3 py-2 border-2 border-border rounded-xl text-xs focus:outline-none focus:border-primary transition-all resize-y"
          />
        </div>
      )}

      {/* Compact resume indicator */}
      {hasResume && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-medium mb-4">
          <span>✅</span><span>Resume loaded: {fileName || "Pasted text"}</span>
          {jobDescription && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">+ Job Description</span>}
          <button onClick={() => { setHasResume(false); setResumeText(""); setFileName(""); setMessages([]); }} className="ml-auto text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-2xl p-4 mb-4 space-y-4">
        {messages.length === 0 && hasResume && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-text-muted font-medium mb-6">Ask me anything about your resume!</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {suggestions.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="px-4 py-2.5 border border-border rounded-xl text-xs text-left hover:bg-indigo-50 hover:border-primary/30 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-white rounded-br-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md"
            }`}>
              {msg.role === "assistant" ? (
                <div dangerouslySetInnerHTML={{ __html: simpleMarkdown(msg.content) }} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          rows={1}
          placeholder={hasResume ? "Ask about your resume..." : "Upload a resume first..."}
          className="flex-1 px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-none"
          disabled={!hasResume}
        />
        <button
          onClick={() => sendMessage()}
          disabled={sending || !input.trim() || !hasResume}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
