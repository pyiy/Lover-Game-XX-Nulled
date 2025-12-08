"use client";

import { Trash2 } from "lucide-react";
import { deleteTheme } from "@/app/themes/actions";

type Props = {
  id: string;
  title?: string;
};

export default function ThemeDeleteButton({ id, title }: Props) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const ok = window.confirm(`确认删除主题“${title || "未命名"}”？该操作不可恢复`);
    if (!ok) {
      e.preventDefault();
    }
  };

  return (
    <form action={deleteTheme} onSubmit={onSubmit} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 active:scale-95"
        title="删除主题"
      >
        <Trash2 className="w-4 h-4" />
        <span>删除</span>
      </button>
    </form>
  );
}