export type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  createdAt: number;
};

export type Insight = {
  id: string;
  bookId: string;
  text: string;
  createdAt: number;
};

export type ActionStatus = "active" | "stock" | "mastered";

export type Action = {
  id: string;
  bookId: string;
  text: string;
  status: ActionStatus;
  doneCount: number;
  lastDoneDate: string | null; // "YYYY-MM-DD"
  createdAt: number;
};

export type AppData = {
  books: Book[];
  insights: Insight[];
  actions: Action[];
};

export const ACTIVE_LIMIT = 3;
export const MASTER_COUNT = 30;

export function emptyData(): AppData {
  return { books: [], insights: [], actions: [] };
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
