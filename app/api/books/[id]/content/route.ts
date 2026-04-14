import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase";
import mammoth from "mammoth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // 1. 로그인 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // 2. 구매 확인
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", id)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ error: "구매 후 이용 가능합니다." }, { status: 403 });
  }

  // 3. 책 파일 경로 조회
  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("docx_file_path")
    .eq("id", id)
    .single();

  if (bookError || !book) {
    return NextResponse.json({ error: "책 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  // 4. Supabase Storage에서 .docx 파일 다운로드 (admin client 사용)
  // docx_file_path 형식: "{bucket}/{filePath}"
  const slashIdx = book.docx_file_path.indexOf("/");
  const bucket = slashIdx !== -1 ? book.docx_file_path.slice(0, slashIdx) : "brave";
  const filePath = slashIdx !== -1 ? book.docx_file_path.slice(slashIdx + 1) : book.docx_file_path;

  const admin = createSupabaseAdminClient();
  const { data: fileData, error: storageError } = await admin.storage
    .from(bucket)
    .download(filePath);

  if (storageError || !fileData) {
    return NextResponse.json({ error: "파일을 읽을 수 없습니다." }, { status: 500 });
  }

  // 5. mammoth로 HTML 변환
  try {
    const arrayBuffer = await fileData.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return NextResponse.json({ html: result.value });
  } catch (e) {
    console.error("mammoth 변환 오류:", e);
    return NextResponse.json({ error: `변환 오류: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
  }
}
