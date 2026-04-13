"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get("message") || "결제가 취소되었거나 실패했습니다.";
  const bookId = searchParams.get("bookId");

  return (
    <div className="text-center py-24">
      <p className="text-4xl mb-4">😞</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">결제 실패</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{message}</p>
      <button
        onClick={() => router.push(bookId ? `/books/${bookId}` : "/")}
        className="rounded-xl bg-indigo-600 px-6 py-2.5 text-white font-semibold hover:bg-indigo-500 transition-colors text-sm"
      >
        다시 시도하기
      </button>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <main className="max-w-lg mx-auto px-4">
      <Suspense>
        <FailContent />
      </Suspense>
    </main>
  );
}
