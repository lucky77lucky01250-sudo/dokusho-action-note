"use client";

import { useState } from "react";
import { Action, Book, Insight } from "@/lib/types";

type Props = {
  books: Book[];
  insights: Insight[];
  actions: Action[];
  selectedBookId: string | null;
  onSelectBook: (bookId: string | null) => void;
  onAddBook: (title: string, author: string) => void;
  onDeleteBook: (bookId: string) => void;
  onRefetchCover: (bookId: string) => void;
  onAddInsight: (bookId: string, text: string) => void;
  onUpdateInsight: (insightId: string, text: string) => void;
  onDeleteInsight: (insightId: string) => void;
  onAddAction: (bookId: string, text: string) => void;
  onDeleteAction: (actionId: string) => void;
  onPromoteAction: (actionId: string) => void;
};

function statusLabel(status: Action["status"]): string {
  if (status === "active") return "アクティブ";
  if (status === "mastered") return "🏆 殿堂入り";
  return "ストック";
}

export default function ShelfTab(props: Props) {
  const {
    books,
    insights,
    actions,
    selectedBookId,
    onSelectBook,
    onAddBook,
    onDeleteBook,
    onRefetchCover,
    onAddInsight,
    onUpdateInsight,
    onDeleteInsight,
    onAddAction,
    onDeleteAction,
    onPromoteAction,
  } = props;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [insightText, setInsightText] = useState("");
  const [actionText, setActionText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const selected = books.find((b) => b.id === selectedBookId) ?? null;

  // ---- 本の詳細ビュー ----
  if (selected) {
    const bookInsights = insights
      .filter((i) => i.bookId === selected.id)
      .sort((a, b) => b.createdAt - a.createdAt);
    const bookActions = actions
      .filter((a) => a.bookId === selected.id)
      .sort((a, b) => b.createdAt - a.createdAt);

    return (
      <section className="space-y-5 p-4">
        <button
          onClick={() => onSelectBook(null)}
          className="text-sm font-bold text-amber-600"
        >
          ← 本棚に戻る
        </button>

        <div className="flex items-center gap-4">
          {selected.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.coverUrl}
              alt={selected.title}
              className="h-24 w-16 rounded object-cover shadow"
            />
          ) : (
            <div className="flex h-24 w-16 items-center justify-center rounded bg-amber-100 text-2xl">
              📖
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-snug">{selected.title}</h2>
            {selected.author && (
              <p className="mt-1 text-sm text-neutral-500">{selected.author}</p>
            )}
            {!selected.coverUrl && (
              <button
                onClick={() => onRefetchCover(selected.id)}
                className="mt-2 rounded-lg bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-500"
              >
                🔄 表紙を再取得
              </button>
            )}
          </div>
        </div>

        {/* 気づき */}
        <div>
          <h3 className="font-bold">💡 気づき（{bookInsights.length}）</h3>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={insightText}
              onChange={(e) => setInsightText(e.target.value)}
              placeholder="一言で言うと？"
              className="h-12 flex-1 rounded-xl border border-neutral-300 bg-white px-3 text-base focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={() => {
                if (!insightText.trim()) return;
                onAddInsight(selected.id, insightText.trim());
                setInsightText("");
              }}
              className="h-12 w-16 rounded-xl bg-amber-500 font-bold text-white active:bg-amber-600"
            >
              追加
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {bookInsights.map((insight) => (
              <li
                key={insight.id}
                className="rounded-xl bg-white p-3 text-sm shadow-sm"
              >
                {editingId === insight.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="h-11 w-full rounded-lg border border-amber-400 bg-white px-3 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (editingText.trim())
                            onUpdateInsight(insight.id, editingText.trim());
                          setEditingId(null);
                        }}
                        className="h-9 flex-1 rounded-lg bg-amber-500 text-sm font-bold text-white"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="h-9 flex-1 rounded-lg bg-neutral-100 text-sm font-bold text-neutral-500"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="leading-relaxed">{insight.text}</p>
                    <span className="flex shrink-0 gap-2 text-xs">
                      <button
                        onClick={() => {
                          setEditingId(insight.id);
                          setEditingText(insight.text);
                        }}
                        className="font-bold text-neutral-400"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => onDeleteInsight(insight.id)}
                        className="font-bold text-red-400"
                      >
                        削除
                      </button>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* アクション */}
        <div>
          <h3 className="font-bold">🔥 アクション（{bookActions.length}）</h3>
          <p className="mt-1 text-xs text-neutral-400">
            追加するとストックに入ります。アクティブ化は各行のボタンから。
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="実行すること（例：朝5分読書）"
              className="h-12 flex-1 rounded-xl border border-neutral-300 bg-white px-3 text-base focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={() => {
                if (!actionText.trim()) return;
                onAddAction(selected.id, actionText.trim());
                setActionText("");
              }}
              className="h-12 w-16 rounded-xl bg-amber-500 font-bold text-white active:bg-amber-600"
            >
              追加
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {bookActions.map((action) => (
              <li
                key={action.id}
                className="rounded-xl bg-white p-3 text-sm shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 leading-relaxed">{action.text}</p>
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                    {statusLabel(action.status)} {action.doneCount > 0 && `${action.doneCount}回`}
                  </span>
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  {action.status === "stock" && (
                    <button
                      onClick={() => onPromoteAction(action.id)}
                      className="h-9 rounded-lg bg-amber-500 px-3 font-bold text-white"
                    >
                      アクティブへ
                    </button>
                  )}
                  {action.status !== "mastered" && (
                    <button
                      onClick={() => onDeleteAction(action.id)}
                      className="h-9 rounded-lg bg-neutral-100 px-3 font-bold text-red-400"
                    >
                      削除
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => onDeleteBook(selected.id)}
          className="w-full pt-2 text-center text-xs font-bold text-red-400"
        >
          この本を削除する（気づき・アクションも消えます）
        </button>
      </section>
    );
  }

  // ---- 本棚一覧ビュー ----
  return (
    <section className="p-4">
      <h2 className="text-lg font-bold">
        本棚 <span className="text-sm text-neutral-400">{books.length}冊</span>
      </h2>

      {/* 本の登録 */}
      <div className="mt-3 space-y-2 rounded-2xl bg-white p-3 shadow-sm">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="本のタイトル"
          className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base focus:border-amber-500 focus:outline-none"
        />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="著者（任意）"
          className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base focus:border-amber-500 focus:outline-none"
        />
        <button
          onClick={() => {
            if (!title.trim()) return;
            onAddBook(title.trim(), author.trim());
            setTitle("");
            setAuthor("");
          }}
          className="h-12 w-full rounded-xl bg-amber-500 text-base font-bold text-white active:bg-amber-600"
        >
          本棚に追加（表紙は自動で探します）
        </button>
      </div>

      {books.length === 0 && (
        <p className="pt-10 text-center text-sm text-neutral-400">
          まだ本がありません。読んだ本を追加しましょう。
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        {books.map((book) => (
          <button
            key={book.id}
            onClick={() => onSelectBook(book.id)}
            className="text-left"
          >
            {book.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.coverUrl}
                alt={book.title}
                className="aspect-[2/3] w-full rounded-lg object-cover shadow"
              />
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-amber-100 p-2 shadow">
                <span className="line-clamp-4 text-center text-xs font-bold text-amber-800">
                  {book.title}
                </span>
              </div>
            )}
            <p className="mt-1 line-clamp-2 text-xs font-bold leading-tight">
              {book.title}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
