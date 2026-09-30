"use client";

import * as React from "react";
import { create } from "zustand";

type Toast = {
  id: number;
  title: string;
  description?: string;
};

type ToastStore = {
  toasts: Toast[];
  addToast: (t: Omit<Toast, "id">) => void;
  removeToast: (id: number) => void;
};

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 3000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export function useToast() {
  return useToastStore((s) => ({ addToast: s.addToast }));
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fade-in rounded-lg border bg-card p-4 shadow-lg min-w-[280px]"
          onClick={() => removeToast(t.id)}
        >
          <p className="font-semibold text-sm">{t.title}</p>
          {t.description && (
            <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
