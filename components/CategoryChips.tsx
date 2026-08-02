"use client";

import { CATEGORIES, CategoryId } from "@/lib/types";

type Props = {
  value: CategoryId | null;
  onChange: (category: CategoryId | null) => void;
  /** 「未分類」を選択肢に含めるか（振り分けの解除用） */
  includeNull?: boolean;
};

export default function CategoryChips({ value, onChange, includeNull }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(active ? null : c.id)}
            className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
              active
                ? "bg-amber-500 text-white"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        );
      })}
      {includeNull && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
            value === null
              ? "bg-neutral-700 text-white"
              : "bg-neutral-100 text-neutral-500"
          }`}
        >
          未分類
        </button>
      )}
    </div>
  );
}
