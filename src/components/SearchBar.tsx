"use client";

import { FormEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  isLoading = false
}: SearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full min-w-0 flex-col gap-2 sm:flex-row">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "제목, 본문, 태그로 검색"}
        className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-300 focus:ring"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        검색
      </button>
    </form>
  );
}
