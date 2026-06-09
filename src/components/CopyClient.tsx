'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyClient({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
    }
  }

  return (
    <button
      onClick={onCopy}
      className="rounded-md p-1 text-cream/60 hover:bg-white/10 hover:text-cream"
      aria-label="Copy ticket id"
      type="button"
    >
      {copied ? (
        <Check className="h-4 w-4 text-leaf" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
