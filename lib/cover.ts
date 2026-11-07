// 表紙をサーバー側ヘルパー（/api/cover）経由で取得する
// サーバーがGoogle Books APIをキー付きで叩くため、キー無し共有枠の上限超過(429)を避けられる
// 見つからない・失敗した場合は coverUrl: null を返し、本の登録は止めない

export type CoverResult = {
  coverUrl: string | null;
  title?: string;
  author?: string;
};

export async function fetchCoverInfo(params: {
  title?: string;
  author?: string;
  isbn?: string;
}): Promise<CoverResult> {
  try {
    const sp = new URLSearchParams();
    if (params.isbn) sp.set("isbn", params.isbn);
    if (params.title) sp.set("title", params.title);
    if (params.author) sp.set("author", params.author);
    const res = await fetch(`/api/cover?${sp.toString()}`);
    if (!res.ok) return { coverUrl: null };
    return (await res.json()) as CoverResult;
  } catch {
    return { coverUrl: null };
  }
}

// 既存の呼び出し互換：タイトル＋著者から表紙URLだけ返す
export async function fetchCover(
  title: string,
  author: string
): Promise<string | null> {
  const r = await fetchCoverInfo({ title, author });
  return r.coverUrl;
}
