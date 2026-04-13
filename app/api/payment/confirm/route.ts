import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const { paymentKey, orderId, amount, bookId } = await req.json();

  if (!paymentKey || !orderId || !amount || !bookId) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 1. 로그인 확인
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // 2. 책 가격과 amount 검증
  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("price")
    .eq("id", bookId)
    .single();

  if (bookError || !book || book.price !== Number(amount)) {
    return NextResponse.json({ error: "결제 금액이 올바르지 않습니다." }, { status: 400 });
  }

  // 3. 이미 구매했는지 확인
  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ alreadyPurchased: true });
  }

  // 4. 토스페이먼츠 결제 승인 요청
  const credentials = Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64");
  const tossResponse = await fetch(
    "https://api.tosspayments.com/v1/payments/confirm",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    }
  );

  if (!tossResponse.ok) {
    const errBody = await tossResponse.json().catch(() => ({}));
    return NextResponse.json(
      { error: errBody.message || "결제 승인에 실패했습니다." },
      { status: tossResponse.status }
    );
  }

  // 5. 구매 기록 저장 (admin client: RLS 우회)
  const admin = createSupabaseAdminClient();
  const { error: insertError } = await admin.from("purchases").insert({
    user_id: user.id,
    book_id: bookId,
    toss_payment_key: paymentKey,
    toss_order_id: orderId,
  });

  if (insertError) {
    console.error("purchases insert error:", insertError.message);
    return NextResponse.json({ error: "구매 저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
