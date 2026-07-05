"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/upload", label: "Analyze Resume", icon: "📄" },
  { href: "/ats", label: "ATS Score Check", icon: "🎯" },
  { href: "/recruiter", label: "Recruiter Score", icon: "🧑‍💼" },
  { href: "/parser", label: "Resume Parser", icon: "🔍" },
  { href: "/jd", label: "JD Parser", icon: "💼" },
  { href: "/tailor", label: "Tailor Resume", icon: "✨" },
  { href: "/chat", label: "AI Chat", icon: "💬" },
  { href: "/interview", label: "Interview Prep", icon: "🎤" },
  { href: "/skills", label: "Skill Gaps", icon: "📊" },
  { href: "/builder", label: "Resume Builder", icon: "📝" },
  { href: "/download", label: "Download PDF", icon: "📥" },
  { href: "/history", label: "Version History", icon: "📑" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-white border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">📋</span> ResumeAnalyzer
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              pathname === link.href
                ? "bg-indigo-50 text-primary"
                : "text-text-muted hover:bg-gray-50 hover:text-foreground"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <p className="text-xs text-text-muted text-center">AI Resume Analyzer v1.0</p>
      </div>
    </aside>
  );
}
