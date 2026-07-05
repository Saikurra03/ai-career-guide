"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
  { href: "/about", label: "About", icon: "👤" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <aside className="w-64 h-full bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">📋</span> AI Career Guide
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              pathname === link.href
                ? "bg-indigo-50 dark:bg-indigo-950 text-primary"
                : "text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border space-y-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <p className="text-xs text-text-muted text-center">AI Career Guide v1.0</p>
      </div>
    </aside>
  );
}
