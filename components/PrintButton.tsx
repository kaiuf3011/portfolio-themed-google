"use client";

import { Icon } from "@/components/Icon";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="state soft inline-flex h-10 items-center gap-2 rounded-full border border-outline px-4 text-[14px] font-medium text-primary">
      <Icon name="open" size={18} /> Print
    </button>
  );
}
