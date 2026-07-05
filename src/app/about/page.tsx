"use client";

import { useEffect, useState } from "react";

function Confetti() {
  const [particles, setParticles] = useState<{ id: number; x: number; color: string; delay: number; size: number; rotation: number }[]>([]);

  useEffect(() => {
    const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"];
    const arr = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
    }));
    setParticles(arr);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute confetti-piece"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function AboutPage() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      {showConfetti && <Confetti />}

      <h1 className="text-3xl font-bold mb-2">About</h1>
      <p className="text-text-muted mb-8">The person behind AI Career Guide.</p>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            SK
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">Venkata Sai Baba Kurra</h2>
            <p className="text-text-muted mt-1">Developer & Creator of AI Career Guide</p>
            <div className="flex justify-center sm:justify-start gap-3 mt-4">
              <a
                href="https://github.com/Saikurra03"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/venkata-sai-baba-kurra-694467305/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Built by a Student */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-8 mb-8">
        <h3 className="font-bold text-lg mb-4 text-foreground">Built by a Student, for Students</h3>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            I know what it feels like to stare at a blank resume, wondering if it&apos;s good enough.
            I know the anxiety of applying to hundreds of jobs and hearing nothing back. I know
            the frustration of getting rejected by ATS systems without ever reaching a human.
          </p>
          <p>
            That&apos;s why I built AI Career Guide — not as a company, but as a fellow student who
            wanted to help. Every feature in this tool comes from the real struggles that students
            face every day during job hunting.
          </p>
          <p>
            Whether you&apos;re applying for your first internship or your dream job, this tool is
            here to give you the same advantages that career coaches charge hundreds of dollars for.
            Because everyone deserves a fair shot at their career.
          </p>
          <p className="font-medium text-indigo-700 dark:text-indigo-400">
            You&apos;re not alone in this. We&apos;re all figuring it out together.
          </p>
        </div>
      </div>

      {/* About the Project */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8">
        <h3 className="font-bold text-lg mb-4">About AI Career Guide</h3>
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            AI Career Guide is an AI-powered resume analyzer that helps job seekers optimize their resumes
            and ace their job applications. Built with Next.js and the Cohere API.
          </p>
          <p>
            It features 13 tools including ATS scoring, recruiter analysis, resume parsing, job description
            parsing, resume tailoring, AI chat, interview preparation, skill gap analysis, resume building,
            PDF download, version history, and analytics.
          </p>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-card border border-border rounded-2xl p-8">
        <h3 className="font-bold text-lg mb-4">Tech Stack</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["Next.js", "TypeScript", "Tailwind CSS", "Cohere API", "pdf2json", "jsPDF", "Vercel"].map((tech) => (
            <div key={tech} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-xl text-center text-xs font-medium text-indigo-700 dark:text-indigo-400">
              {tech}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
