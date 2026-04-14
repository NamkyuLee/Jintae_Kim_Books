"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="font-bold text-lg text-indigo-600 dark:text-indigo-400 tracking-tight">
          📚 소설 서재
        </a>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="text-gray-500 dark:text-gray-400 hidden sm:block truncate max-w-[160px]">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                로그인
              </a>
              <a href="/signup" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500 transition-colors">
                회원가입
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
