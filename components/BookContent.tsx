"use client";

import { useEffect, useState } from "react";

type BookContentProps = { bookId: string };

export default function BookContent({ bookId }: BookContentProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/books/${bookId}/content`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "본문을 불러올 수 없습니다.");
        }
        return res.json();
      })
      .then((data) => setHtml(data.html))
      .catch((e: Error) => setError(e.message));
  }, [bookId]);

  if (error) {
    return <p className="text-red-500 text-sm text-center py-16">{error}</p>;
  }

  if (!html) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <article
      className="novel-content max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
