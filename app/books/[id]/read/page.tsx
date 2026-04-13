import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import BookContent from "@/components/BookContent";
import type { Book } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function ReadPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // 로그인 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/books/${id}/read`);
  }

  // 구매 확인
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", id)
    .maybeSingle();

  if (!purchase) {
    redirect(`/books/${id}`);
  }

  // 책 정보 조회
  const { data: book, error } = await supabase
    .from("books")
    .select("id, title, author")
    .eq("id", id)
    .single<Pick<Book, "id" | "title" | "author">>();

  if (error || !book) notFound();

  // 본문 HTML은 클라이언트 컴포넌트에서 API 호출로 가져옴
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{book.title}</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">{book.author}</p>
      </div>
      <BookContent bookId={id} />
    </main>
  );
}
