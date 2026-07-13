"use client";

import { Action, Book, MASTER_COUNT, todayStr } from "@/lib/types";

type Props = {
  actions: Action[];
  books: Book[];
  onToggleDone: (actionId: string) => void;
};

export default function TodayTab({ actions, books, onToggleDone }: Props) {
  const active = actions.filter((a) => a.status === "active");
  const mastered = actions.filter((a) => a.status === "mastered");
  const today = todayStr();

  const bookTitle = (bookId: string) =>
    books.find((b) => b.id === bookId)?.title ?? "";

  return (
    <section className="space-y-4 p-4">
      <h2 className="text-lg font-bold">今日のアクション</h2>

      {active.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm leading-6 text-neutral-500">
          アクティブなアクションがありません。
          <br />
          本棚から本を登録して、アクションを
          <br />
          アクティブにしましょう。
        </p>
      )}

      {active.map((action) => {
        const doneToday = action.lastDoneDate === today;
        return (
          <article
            key={action.id}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-neutral-400">
              📖 {bookTitle(action.bookId)}
            </p>
            <p className="mt-1 text-lg font-bold leading-snug">{action.text}</p>

            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{
                    width: `${Math.min(
                      (action.doneCount / MASTER_COUNT) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-xs font-bold text-neutral-500">
                {action.doneCount}/{MASTER_COUNT}
              </span>
            </div>

            <button
              onClick={() => onToggleDone(action.id)}
              className={`mt-3 h-12 w-full rounded-xl text-base font-bold transition-colors ${
                doneToday
                  ? "bg-amber-500 text-white"
                  : "border-2 border-amber-500 bg-white text-amber-600 active:bg-amber-50"
              }`}
            >
              {doneToday ? "✓ 今日やった！（タップで取り消し）" : "今日やった？"}
            </button>
          </article>
        );
      })}

      {/* 実績サマリー */}
      <div className="flex gap-3 pt-2">
        <div className="flex-1 rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{active.length}/3</p>
          <p className="mt-1 text-xs text-neutral-500">アクティブ</p>
        </div>
        <div className="flex-1 rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-600">
            🏆 {mastered.length}
          </p>
          <p className="mt-1 text-xs text-neutral-500">殿堂入り（習慣化済み）</p>
        </div>
      </div>
    </section>
  );
}
