import { AppData, emptyData } from "./types";

const STORAGE_KEY = "dokusho-action-note";

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      books: parsed.books ?? [],
      insights: (parsed.insights ?? []).map((i) => ({
        ...i,
        category: i.category ?? null,
      })),
      actions: parsed.actions ?? [],
    };
  } catch {
    return emptyData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
