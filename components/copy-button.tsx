"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CopyButton({ value, label = "复制" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // ignore
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} aria-live="polite">
      {copied ? "已复制" : label}
    </Button>
  );
}