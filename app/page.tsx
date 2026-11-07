"use client";

import { useEffect, useRef, useState } from "react";
import TodayTab from "@/components/TodayTab";
import ShelfTab from "@/components/ShelfTab";
import ActionsTab from "@/components/ActionsTab";
import NotesTab from "@/components/NotesTab";
import { loadData, saveData } from "@/lib/storage";
import { fetchCover, fetchCoverInfo } from "@/lib/cover";
import {
  Action,
  AppData,
  ACTIVE_LIMIT,
  CategoryId,
  MASTER_COUNT,
  emptyData,
  todayStr,
} from "@/lib/types";

type Tab = "today" | "shelf" | "notes" | "actions";

export default function Home() {
  const [data, setData] = useState<AppData>(emptyData());
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setData(loadData());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveData(data);
  }, [data, loaded]);

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }

  // ---- 本 ----
  function addBook(title: string, author: string, isbn: string) {
    const id = crypto.randomUUID();
    // ISBNだけでタイトル未入力のときは仮の表示名を置き、取得後に本名へ差し替える
    const displayTitle = title || (isbn ? `ISBN: ${isbn}` : title);
    setData((prev) => ({
      ...prev,
      books: [
        { id, title: displayTitle, author, coverUrl: null, createdAt: Date.now() },
        ...prev.books,
      ],
    }));
    showToast(`📚『${displayTitle}』を本棚に追加しました`);
    // 表紙は裏で検索（失敗しても登録は止めない）
    fetchCoverInfo(isbn ? { isbn } : { title, author }).then((info) => {
      setData((prev) => ({
        ...prev,
        books: prev.books.map((b) =>
          b.id === id
            ? {
                ...b,
                coverUrl: info.coverUrl ?? b.coverUrl,
                // タイトル・著者が未入力ならISBN検索結果で補う
                title: title ? b.title : info.title ?? b.title,
                author: author ? b.author : info.author ?? b.author,
              }
            : b
        ),
      }));
    });
  }

  function refetchCover(bookId: string) {
    const book = data.books.find((b) => b.id === bookId);
    if (!book) return;
    showToast("表紙を探しています…");
    fetchCover(book.title, book.author).then((coverUrl) => {
      if (coverUrl) {
        setData((prev) => ({
          ...prev,
          books: prev.books.map((b) =>
            b.id === bookId ? { ...b, coverUrl } : b
          ),
        }));
        showToast("表紙を設定しました");
      } else {
        showToast("見つかりませんでした。時間をおいて再度どうぞ");
      }
    });
  }

  // 表紙が無い本をまとめて取得する
  async function refetchAllCovers() {
    const targets = data.books.filter((b) => !b.coverUrl);
    if (targets.length === 0) {
      showToast("表紙が無い本はありません");
      return;
    }
    showToast(`表紙を探しています…（${targets.length}冊）`);
    let found = 0;
    for (const book of targets) {
      const info = await fetchCoverInfo({ title: book.title, author: book.author });
      if (info.coverUrl) {
        found++;
        const url = info.coverUrl;
        setData((prev) => ({
          ...prev,
          books: prev.books.map((b) =>
            b.id === book.id ? { ...b, coverUrl: url } : b
          ),
        }));
      }
    }
    showToast(`表紙を${found}冊に設定しました`);
  }

  function deleteBook(bookId: string) {
    const book = data.books.find((b) => b.id === bookId);
    if (!book) return;
    if (!confirm(`『${book.title}』を削除しますか？\n気づき・アクションも消えます。`))
      return;
    setData((prev) => ({
      books: prev.books.filter((b) => b.id !== bookId),
      insights: prev.insights.filter((i) => i.bookId !== bookId),
      actions: prev.actions.filter((a) => a.bookId !== bookId),
    }));
    setSelectedBookId(null);
  }

  // ---- 気づき ----
  function addInsight(bookId: string, text: string, category: CategoryId | null) {
    setData((prev) => ({
      ...prev,
      insights: [
        { id: crypto.randomUUID(), bookId, text, category, createdAt: Date.now() },
        ...prev.insights,
      ],
    }));
  }

  function updateInsight(insightId: string, text: string) {
    setData((prev) => ({
      ...prev,
      insights: prev.insights.map((i) =>
        i.id === insightId ? { ...i, text } : i
      ),
    }));
  }

  function setInsightCategory(insightId: string, category: CategoryId | null) {
    setData((prev) => ({
      ...prev,
      insights: prev.insights.map((i) =>
        i.id === insightId ? { ...i, category } : i
      ),
    }));
  }

  function deleteInsight(insightId: string) {
    setData((prev) => ({
      ...prev,
      insights: prev.insights.filter((i) => i.id !== insightId),
    }));
  }

  // ---- アクション ----
  const activeCount = data.actions.filter((a) => a.status === "active").length;

  function addAction(bookId: string, text: string) {
    const action: Action = {
      id: crypto.randomUUID(),
      bookId,
      text,
      status: "stock",
      doneCount: 0,
      lastDoneDate: null,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, actions: [action, ...prev.actions] }));
    showToast("ストックに追加しました");
  }

  function promoteAction(actionId: string) {
    if (activeCount >= ACTIVE_LIMIT) {
      showToast(`アクティブは${ACTIVE_LIMIT}個までです。先にどれかをストックへ`);
      return;
    }
    setData((prev) => ({
      ...prev,
      actions: prev.actions.map((a) =>
        a.id === actionId ? { ...a, status: "active" as const } : a
      ),
    }));
    showToast("アクティブにしました。今日タブに表示されます");
  }

  function demoteAction(actionId: string) {
    setData((prev) => ({
      ...prev,
      actions: prev.actions.map((a) =>
        a.id === actionId ? { ...a, status: "stock" as const } : a
      ),
    }));
  }

  function deleteAction(actionId: string) {
    const action = data.actions.find((a) => a.id === actionId);
    if (!action) return;
    if (!confirm(`「${action.text}」を削除しますか？`)) return;
    setData((prev) => ({
      ...prev,
      actions: prev.actions.filter((a) => a.id !== actionId),
    }));
  }

  function toggleDone(actionId: string) {
    const today = todayStr();
    const action = data.actions.find((a) => a.id === actionId);
    if (!action) return;

    if (action.lastDoneDate === today) {
      // 同日タップは取り消し
      setData((prev) => ({
        ...prev,
        actions: prev.actions.map((a) =>
          a.id === actionId
            ? {
                ...a,
                doneCount: Math.max(a.doneCount - 1, 0),
                lastDoneDate: null,
              }
            : a
        ),
      }));
      return;
    }

    const newCount = action.doneCount + 1;
    const mastered = newCount >= MASTER_COUNT;
    setData((prev) => ({
      ...prev,
      actions: prev.actions.map((a) =>
        a.id === actionId
          ? {
              ...a,
              doneCount: newCount,
              lastDoneDate: today,
              status: mastered ? ("mastered" as const) : a.status,
            }
          : a
      ),
    }));
    showToast(
      mastered
        ? `🎉「${action.text}」が殿堂入り！枠が1つ空きました`
        : `いいね！ ${newCount}回目を記録しました`
    );
  }

  const stockCount = data.actions.filter((a) => a.status === "stock").length;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-[#faf6ef] pb-24 text-neutral-900">
      <header className="px-4 pb-1 pt-5">
        <h1 className="text-xl font-bold">📚 読書アクションノート</h1>
        <p className="mt-0.5 text-xs text-neutral-400">
          学びを行動に変えて、定着させる
        </p>
      </header>

      {tab === "today" && (
        <TodayTab
          actions={data.actions}
          books={data.books}
          onToggleDone={toggleDone}
        />
      )}
      {tab === "shelf" && (
        <ShelfTab
          books={data.books}
          insights={data.insights}
          actions={data.actions}
          selectedBookId={selectedBookId}
          onSelectBook={setSelectedBookId}
          onAddBook={addBook}
          onDeleteBook={deleteBook}
          onRefetchCover={refetchCover}
          onRefetchAllCovers={refetchAllCovers}
          onAddInsight={addInsight}
          onUpdateInsight={updateInsight}
          onSetInsightCategory={setInsightCategory}
          onDeleteInsight={deleteInsight}
          onAddAction={addAction}
          onDeleteAction={deleteAction}
          onPromoteAction={promoteAction}
        />
      )}
      {tab === "notes" && (
        <NotesTab
          books={data.books}
          insights={data.insights}
          onSetCategory={setInsightCategory}
        />
      )}
      {tab === "actions" && (
        <ActionsTab
          actions={data.actions}
          books={data.books}
          onPromote={promoteAction}
          onDemote={demoteAction}
          onDelete={deleteAction}
        />
      )}

      {/* 下部タブバー */}
      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md border-t border-neutral-200 bg-white">
        {(
          [
            ["today", "☀️", "今日"],
            ["shelf", "📚", "本棚"],
            ["notes", "🗂", "分類"],
            ["actions", "🔥", "アクション"],
          ] as const
        ).map(([id, emoji, label]) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              if (id !== "shelf") setSelectedBookId(null);
            }}
            className={`flex flex-1 flex-col items-center gap-1 px-0.5 py-3 text-xs font-bold ${
              tab === id ? "text-amber-600" : "text-neutral-400"
            }`}
          >
            <span className="relative whitespace-nowrap">
              <span aria-hidden>{emoji}</span> {label}
              {id === "actions" && stockCount > 0 && (
                <span className="absolute -right-3.5 -top-1.5 rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {stockCount}
                </span>
              )}
            </span>
            <span
              className={`h-1 w-8 rounded-full ${
                tab === id ? "bg-amber-500" : "bg-transparent"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* トースト */}
      {toast && (
        <div className="fixed inset-x-4 bottom-20 z-20 mx-auto max-w-md rounded-2xl bg-neutral-900/90 px-4 py-3 text-center text-sm font-bold text-white">
          {toast}
        </div>
      )}
    </main>
  );
}
