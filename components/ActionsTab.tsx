"use client";

import { Action, Book, ACTIVE_LIMIT, MASTER_COUNT } from "@/lib/types";

type Props = {
  actions: Action[];
  books: Book[];
  onPromote: (actionId: string) => void;
  onDemote: (actionId: string) => void;
  onDelete: (actionId: string) => void;
};

export default function ActionsTab({
  actions,
  books,
  onPromote,
  onDemote,
  onDelete,
}: Props) {
  const active = actions.filter((a) => a.status === "active");
  const stock = actions
    .filter((a) => a.status === "stock")
    .sort((a, b) => b.createdAt - a.createdAt);
  const mastered = actions
    .filter((a) => a.status === "mastered")
    .sort((a, b) => b.createdAt - a.createdAt);

  const bookTitle = (bookId: string) =>
    books.find((b) => b.id === bookId)?.title ?? "";

  const Item = ({
    action,
    children,
  }: {
    action: Action;
    children: React.ReactNode;
  }) => (
    <li className="rounded-xl bg-white p-3 shadow-sm">
      <p className="text-xs text-neutral-400">📖 {bookTitle(action.bookId)}</p>
      <p className="mt-0.5 text-sm font-bold leading-snug">{action.text}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-neutral-500">
          {action.doneCount}/{MASTER_COUNT}回
        </span>
        <span className="ml-auto flex gap-2">{children}</span>
      </div>
    </li>
  );

  return (
    <section className="space-y-6 p-4">
      <div>
        <h2 className="font-bold">
          🔥 アクティブ（{active.length}/{ACTIVE_LIMIT}）
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          今日タブに表示される、いま取り組む行動です。
        </p>
        <ul className="mt-2 space-y-2">
          {active.map((a) => (
            <Item key={a.id} action={a}>
              <button
                onClick={() => onDemote(a.id)}
                className="h-9 rounded-lg bg-neutral-100 px-3 text-xs font-bold text-neutral-500"
              >
                ストックへ
              </button>
            </Item>
          ))}
          {active.length === 0 && (
            <p className="rounded-xl bg-white p-4 text-center text-xs text-neutral-400">
              空きがあります。ストックから昇格させましょう。
            </p>
          )}
        </ul>
      </div>

      <div>
        <h2 className="font-bold">📦 ストック（{stock.length}）</h2>
        <p className="mt-1 text-xs text-neutral-400">
          出番待ちの行動。枠が空いたらアクティブへ。
        </p>
        <ul className="mt-2 space-y-2">
          {stock.map((a) => (
            <Item key={a.id} action={a}>
              <button
                onClick={() => onPromote(a.id)}
                className="h-9 rounded-lg bg-amber-500 px-3 text-xs font-bold text-white"
              >
                アクティブへ
              </button>
              <button
                onClick={() => onDelete(a.id)}
                className="h-9 rounded-lg bg-neutral-100 px-3 text-xs font-bold text-red-400"
              >
                削除
              </button>
            </Item>
          ))}
          {stock.length === 0 && (
            <p className="rounded-xl bg-white p-4 text-center text-xs text-neutral-400">
              ストックは空です。本棚からアクションを追加しましょう。
            </p>
          )}
        </ul>
      </div>

      <div>
        <h2 className="font-bold">🏆 殿堂入り（{mastered.length}）</h2>
        <p className="mt-1 text-xs text-neutral-400">
          {MASTER_COUNT}回やり切って習慣になった行動。あなたの実績です。
        </p>
        <ul className="mt-2 space-y-2">
          {mastered.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm"
            >
              <p className="text-xs text-amber-600">
                📖 {bookTitle(a.bookId)}
              </p>
              <p className="mt-0.5 text-sm font-bold leading-snug">
                🏆 {a.text}
              </p>
            </li>
          ))}
          {mastered.length === 0 && (
            <p className="rounded-xl bg-white p-4 text-center text-xs text-neutral-400">
              まだありません。最初の殿堂入りを目指しましょう。
            </p>
          )}
        </ul>
      </div>
    </section>
  );
}
