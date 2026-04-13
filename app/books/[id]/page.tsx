import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import BookCover from "@/components/BookCover";
import PaymentButton from "@/components/PaymentButton";
import type { Book } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: book, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single<Book>();

  if (error || !book) notFound();

  // 현재 로그인 사용자
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 이미 구매했는지 확인
  let alreadyPurchased = false;
  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", id)
      .maybeSingle();
    alreadyPurchased = !!purchase;
  }

  if (alreadyPurchased) {
    redirect(`/books/${id}/read`);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-10">
        {/* 표지 */}
        <div className="flex-shrink-0 w-48 mx-auto md:mx-0">
          <BookCover
            title={book.title}
            author={book.author}
            coverImageUrl={book.cover_image_url}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* 상세 정보 */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{book.title}</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{book.author}</p>
          </div>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              줄거리
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {book.synopsis}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              지은이 소개
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {book.author_bio}
            </p>
          </section>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-auto">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              {book.price.toLocaleString("ko-KR")}원
            </p>

            {user ? (
              <PaymentButton book={book} userId={user.id} />
            ) : (
              <a
                href={`/login?redirect=/books/${id}`}
                className="block w-full text-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold text-base hover:bg-indigo-500 transition-colors"
              >
                로그인 후 구매하기
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
