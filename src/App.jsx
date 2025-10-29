import React from "react";
import UnifiedProfileComposer from "./components/UnifiedProfileComposer";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700" />
            <h1 className="text-lg font-semibold tracking-tight">Profile Badge Composer</h1>
          </div>
          <div className="text-xs text-zinc-500">v3.0</div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <UnifiedProfileComposer />
      </main>
      <footer className="py-8 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Profile Badge Composer
      </footer>
    </div>
  );
}
