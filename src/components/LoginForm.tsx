'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password') ?? '');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!res.ok) {
      let msg = 'Incorrect password.';
      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
        if (typeof data?.attemptsRemaining === 'number' && data.attemptsRemaining > 0) {
          msg += ` (${data.attemptsRemaining} attempt${
            data.attemptsRemaining === 1 ? '' : 's'
          } before lockout.)`;
        }
      } catch {
        /* ignore parse errors */
      }
      setError(msg);
      setSubmitting(false);
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="field-label">Password</label>
        <input
          name="password"
          type="password"
          required
          className="input"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent-glow">
          {error}
        </div>
      )}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
      </button>
    </form>
  );
}
