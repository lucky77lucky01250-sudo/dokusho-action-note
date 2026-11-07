// 表紙取得のサーバー側ヘルパー（Google Books APIをサーバーから呼ぶ）
// - APIキーは環境変数 GOOGLE_BOOKS_API_KEY に置く（ブラウザには出さない）
// - キー付きで呼ぶことで、キー無し共有枠の「1日の上限超過(429)」を回避する
// - 見つからない・失敗した場合は coverUrl: null を返し、本の登録は止めない

export const dynamic = "force-dynamic";

type GoogleItem = {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

type CoverResult = {
  coverUrl: string | null;
  title?: string;
  author?: string;
};

function normalizeCover(raw: string): string {
  // httpをhttpsへ、edge=curl（本の折り目加工）を外してきれいな表紙にする
  return raw.replace(/^http:/, "https:").replace(/&edge=curl/, "");
}

function pickCover(items: GoogleItem[]): CoverResult {
  for (const it of items) {
    const vi = it.volumeInfo;
    const raw = vi?.imageLinks?.thumbnail ?? vi?.imageLinks?.smallThumbnail;
    if (raw) {
      return {
        coverUrl: normalizeCover(raw),
        title: vi?.title,
        author: vi?.authors?.join(", "),
      };
    }
  }
  // 画像は無くても、書名・著者だけ拾えれば返す（ISBN登録時の自動入力に使う）
  const first = items[0]?.volumeInfo;
  return {
    coverUrl: null,
    title: first?.title,
    author: first?.authors?.join(", "),
  };
}

async function queryGoogle(
  q: string,
  key: string | undefined
): Promise<GoogleItem[]> {
  const params = new URLSearchParams({ q, maxResults: "5", country: "JP" });
  if (key) params.set("key", key);
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: GoogleItem[] };
  return json.items ?? [];
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "").trim();
  const author = (searchParams.get("author") ?? "").trim();
  const isbn = (searchParams.get("isbn") ?? "").replace(/[^0-9Xx]/g, "");
  const key = process.env.GOOGLE_BOOKS_API_KEY;

  try {
    let items: GoogleItem[] = [];
    if (isbn) {
      items = await queryGoogle(`isbn:${isbn}`, key);
    } else if (title) {
      const q = author
        ? `intitle:${title} inauthor:${author}`
        : `intitle:${title}`;
      items = await queryGoogle(q, key);
      // 厳密検索で0件なら、ゆるい全文検索でもう一度だけ探す
      if (items.length === 0) items = await queryGoogle(title, key);
    }
    const result = pickCover(items);
    return Response.json(result, {
      // 同じ本の再取得はキャッシュで軽く（1日）
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return Response.json({ coverUrl: null } satisfies CoverResult);
  }
}
