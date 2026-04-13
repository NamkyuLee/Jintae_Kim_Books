-- ============================================================
-- 1. books 테이블
-- ============================================================
create table if not exists public.books (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  author        text not null,
  synopsis      text not null,
  author_bio    text not null,
  cover_image_url text,
  price         integer not null,          -- 원 단위 정수 (예: 5000)
  docx_file_path text not null,            -- Supabase Storage 경로 (예: book-files/novel.docx)
  created_at    timestamptz default now()
);

-- ============================================================
-- 2. purchases 테이블
-- ============================================================
create table if not exists public.purchases (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  book_id             uuid not null references public.books(id) on delete cascade,
  toss_payment_key    text not null unique,
  toss_order_id       text not null unique,
  created_at          timestamptz default now(),
  constraint unique_user_book unique (user_id, book_id)
);

-- ============================================================
-- 3. RLS (Row Level Security) 활성화
-- ============================================================
alter table public.books enable row level security;
alter table public.purchases enable row level security;

-- books: 누구나 읽기 가능 (목록, 상세 무료 공개)
create policy "books_public_read" on public.books
  for select using (true);

-- purchases: 본인 구매 내역만 조회 가능
create policy "purchases_own_read" on public.purchases
  for select using (auth.uid() = user_id);

-- purchases: 서버(service role)에서만 insert 가능 (클라이언트 직접 insert 차단)
-- service role은 RLS를 우회하므로 별도 정책 불필요

-- ============================================================
-- 4. Supabase Storage 버킷: book-files (비공개)
-- ============================================================
-- Supabase 대시보드 > Storage > New bucket 에서 직접 생성
-- 설정: Private bucket (공개 읽기 비활성화)
-- 이름: book-files

-- ============================================================
-- 5. 샘플 데이터 INSERT (책 정보는 실제 내용으로 수정)
-- ============================================================
insert into public.books (title, author, synopsis, author_bio, price, docx_file_path)
values (
  '소설 제목을 입력하세요',
  '저자 이름',
  '이 소설의 줄거리를 여기에 입력하세요. 독자의 흥미를 끌 수 있는 내용으로 작성해 주세요.',
  '저자 소개를 여기에 입력하세요. 프로필, 이력, 집필 동기 등을 포함할 수 있습니다.',
  5000,
  'book-files/novel.docx'
);
