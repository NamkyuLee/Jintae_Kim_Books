"use client";

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { v4 as uuidv4 } from "uuid";
import type { Book } from "@/lib/types";

type PaymentButtonProps = {
  book: Book;
  userId: string;
};

export default function PaymentButton({ book, userId }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    setLoading(true);
    try {
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      );

      const orderId = uuidv4();

      // API 개별 연동 키 방식: payment() 사용
      const payment = tossPayments.payment({ customerKey: userId });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: book.price },
        orderId,
        orderName: book.title,
        successUrl: `${window.location.origin}/payment/success?bookId=${book.id}`,
        failUrl: `${window.location.origin}/payment/fail?bookId=${book.id}`,
      });
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err as { code?: string }).code !== "USER_CANCEL"
      ) {
        alert("결제 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold text-base hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "결제창 열기 중…" : `${book.price.toLocaleString("ko-KR")}원 구매하기`}
    </button>
  );
}

