import { createSupabaseServerClient } from "@/lib/supabase";
import BookCard from "@/components/BookCard";
import type { Book } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let books: Book[] = [];

  // 환경변수가 없으면 (빌드 타임) DB 조회 건너뜀
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      books = data ?? [];
    } catch {
      // 런타임 에러는 빈 목록으로 처리
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          📚 소설 서재
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
          개인 창작 소설을 만나보세요
        </p>
      </header>

      {books.length === 0 ? (
        <p className="text-center text-gray-400 py-24">등록된 소설이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {books.map((book: Book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </main>
  );
}
