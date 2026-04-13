"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const bookId = searchParams.get("bookId");

  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount || !bookId) {
      setStatus("error");
      setMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    fetch("/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount), bookId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "승인 실패");
        setStatus("ok");
        setTimeout(() => router.push(`/books/${bookId}/read`), 1500);
      })
      .catch((e: Error) => {
        setStatus("error");
        setMessage(e.message);
      });
  }, [paymentKey, orderId, amount, bookId, router]);

  if (status === "pending") {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">결제 처리 중…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-24">
        <p className="text-xl font-bold text-red-500 mb-2">결제 처리 실패</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{message}</p>
        <button
          onClick={() => router.back()}
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-24">
      <p className="text-4xl mb-4">🎉</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">결제 완료!</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm">잠시 후 소설 페이지로 이동합니다…</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="max-w-lg mx-auto px-4">
      <Suspense>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
