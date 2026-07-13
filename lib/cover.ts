// Google Books APIで表紙画像を検索する（APIキー不要）
// 見つからない・失敗した場合はnullを返し、本の登録は止めない
export async function fetchCover(
  title: string,
  author: string
): Promise<string | null> {
  try {
    const q = author ? `intitle:${title}+inauthor:${author}` : `intitle:${title}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      q
    )}&maxResults=5&country=JP`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    type Item = { volumeInfo?: { imageLinks?: { thumbnail?: string } } };
    const items: Item[] = json.items ?? [];
    const thumb = items
      .map((i) => i.volumeInfo?.imageLinks?.thumbnail)
      .find((t): t is string => Boolean(t));
    return thumb ? thumb.replace(/^http:/, "https:") : null;
  } catch {
    return null;
  }
}
