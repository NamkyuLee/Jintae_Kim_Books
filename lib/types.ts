export type Book = {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  author_bio: string;
  cover_image_url: string | null;
  price: number;
  docx_file_path: string;
  created_at: string;
};

export type Purchase = {
  id: string;
  user_id: string;
  book_id: string;
  toss_payment_key: string;
  toss_order_id: string;
  created_at: string;
};
