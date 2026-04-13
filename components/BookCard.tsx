import Link from "next/link";
import BookCover from "./BookCover";
import type { Book } from "@/lib/types";

type BookCardProps = {
  book: Book;
};

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="group block">
      <div className="overflow-hidden rounded-lg shadow-md transition-shadow group-hover:shadow-xl">
        <BookCover
          title={book.title}
          author={book.author}
          coverImageUrl={book.cover_image_url}
          className="w-full h-auto"
        />
      </div>
      <div className="mt-3 px-1">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {book.title}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
        <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {book.price.toLocaleString("ko-KR")}원
        </p>
      </div>
    </Link>
  );
}
