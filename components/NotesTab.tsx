"use client";

import { useState } from "react";
import { Book, CATEGORIES, CategoryId, Insight, categoryMeta } from "@/lib/types";
import CategoryChips from "./CategoryChips";

type Props = {
  books: Book[];
  insights: Insight[];
  onSetCategory: (insightId: string, category: CategoryId | null) => void;
};

type Filter = CategoryId | "all" | "uncategorized";

export default function NotesTab({ books, insights, onSetCategory }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const bookTitle = (bookId: string) =>
    books.find((b) => b.id === bookId)?.title ?? "（削除された本）";

  const countFor = (f: Filter) =>
    insights.filter((i) => {
      if (f === "all") return true;
      if (f === "uncategorized") return !i.category;
      return i.category === f;
    }).length;

  const visible = insights
    .filter((i) => {
      if (filter === "all") return true;
      if (filter === "uncategorized") return !i.category;
      return i.category === filter;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const uncategorized = countFor("uncategorized");

  return (
    <section className="p-4">
      <h2 className="text-lg font-bold">
        分類 <span className="text-sm text-neutral-400">気づき{insights.length}件</span>
      </h2>
      <p className="mt-1 text-xs text-neutral-400">
        気づきをカテゴリの「箱」に振り分けて、関連づけて記憶に定着させる。
      </p>

      {/* フィルタ */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <FilterChip
          label={`すべて ${insights.length}`}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.id}
            label={`${c.emoji} ${c.label} ${countFor(c.id)}`}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
          />
        ))}
        {uncategorized > 0 && (
          <FilterChip
            label={`未分類 ${uncategorized}`}
            active={filter === "uncategorized"}
            onClick={() => setFilter("uncategorized")}
          />
        )}
      </div>

      {visible.length === 0 ? (
        <p className="pt-10 text-center text-sm text-neutral-400">
          {insights.length === 0
            ? "まだ気づきがありません。本棚で本を開いて記録しましょう。"
            : "このカテゴリの気づきはありません。"}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {visible.map((insight) => {
            const meta = categoryMeta(insight.category);
            const open = openId === insight.id;
            return (
              <li
                key={insight.id}
                className="rounded-xl bg-white p-3 shadow-sm"
              >
                <p className="text-sm leading-relaxed">{insight.text}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-xs text-neutral-400">
                    📖 {bookTitle(insight.bookId)}
                  </span>
                  <button
                    onClick={() => setOpenId(open ? null : insight.id)}
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      meta
                        ? "bg-amber-50 text-amber-700"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {meta ? `${meta.emoji} ${meta.label}` : "未分類"} ▾
                  </button>
                </div>
                {open && (
                  <div className="mt-2 border-t border-neutral-100 pt-2">
                    <CategoryChips
                      value={insight.category}
                      onChange={(category) => {
                        onSetCategory(insight.id, category);
                        setOpenId(null);
                      }}
                      includeNull
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
        active ? "bg-amber-500 text-white" : "bg-white text-neutral-500 shadow-sm"
      }`}
    >
      {label}
    </button>
  );
}
