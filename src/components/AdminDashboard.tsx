'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  LogOut,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  FileText,
  Image as ImageIcon,
  Film,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type {
  ProofFile,
  Submission,
  SubmissionCategory,
  SubmissionStatus
} from '@/lib/types';

export interface ProofWithUrls extends ProofFile {
  viewUrl: string;
  downloadUrl: string;
}

export interface SubmissionWithUrls extends Omit<Submission, 'proofs'> {
  proofs: ProofWithUrls[];
}

interface Props {
  submissions: SubmissionWithUrls[];
  stats: { total: number; newCount: number; reviewing: number; published: number };
  categories: Record<SubmissionCategory, { en: string; hi: string }>;
  currentStatus: string;
  currentCategory: string;
  currentQuery: string;
  connectError: string | null;
}

const STATUS_OPTIONS: { value: 'all' | SubmissionStatus; label: string; tone: string }[] = [
  { value: 'all', label: 'All', tone: 'bg-white/10 text-cream' },
  { value: 'new', label: 'New', tone: 'bg-accent/20 text-accent-glow' },
  { value: 'reviewing', label: 'Reviewing', tone: 'bg-saffron/20 text-saffron' },
  { value: 'published', label: 'Published', tone: 'bg-leaf/20 text-leaf' },
  { value: 'archived', label: 'Archived', tone: 'bg-white/10 text-cream/60' }
];

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const opt = STATUS_OPTIONS.find((o) => o.value === status);
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${opt?.tone ?? 'bg-white/10'}`}>
      {opt?.label ?? status}
    </span>
  );
}

function formatDate(d: Date | string) {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function fileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.startsWith('video/')) return Film;
  return FileText;
}

export default function AdminDashboard({
  submissions,
  stats,
  categories,
  currentStatus,
  currentCategory,
  currentQuery,
  connectError
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(currentQuery);
  const [openId, setOpenId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function applyFilters(next: Partial<{ status: string; category: string; q: string }>) {
    const params = new URLSearchParams();
    const status = next.status ?? currentStatus;
    const category = next.category ?? currentCategory;
    const q = next.q ?? query;
    if (status && status !== 'all') params.set('status', status);
    if (category && category !== 'all') params.set('category', category);
    if (q) params.set('q', q);
    startTransition(() => {
      router.replace(`/admin?${params.toString()}`);
    });
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/');
    router.refresh();
  }

  const categoryEntries = useMemo(
    () => Object.entries(categories) as [SubmissionCategory, { en: string; hi: string }][],
    [categories]
  );

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="chip mb-2">Admin</div>
            <h1 className="font-display text-3xl font-bold">All complaints</h1>
            <p className="text-sm text-cream/65">
              Sabhi submissions yahan dekho. Status update karke track karo.
            </p>
          </div>
          <button onClick={logout} className="btn-ghost text-sm">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {connectError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent-glow">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <div className="font-semibold">Could not connect to MongoDB</div>
              <div className="mt-1 text-accent-glow/80">{connectError}</div>
              <div className="mt-2 text-cream/70">
                Check <code className="rounded bg-white/10 px-1.5 py-0.5">MONGODB_URI</code> in
                your <code className="rounded bg-white/10 px-1.5 py-0.5">.env.local</code>.
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total" value={stats.total} tone="bg-white/5" />
          <StatCard label="New" value={stats.newCount} tone="bg-accent/15 text-accent-glow" />
          <StatCard label="Reviewing" value={stats.reviewing} tone="bg-saffron/15 text-saffron" />
          <StatCard label="Published" value={stats.published} tone="bg-leaf/15 text-leaf" />
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-ink-soft px-3 py-2">
            <Search className="h-4 w-4 text-cream/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters({ q: query });
              }}
              placeholder="Search name, ticket, village, district…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-cream/40"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  applyFilters({ q: '' });
                }}
                className="text-xs text-cream/60 hover:text-cream"
              >
                clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-soft px-3 py-2">
            <Filter className="h-4 w-4 text-cream/60" />
            <select
              value={currentStatus}
              onChange={(e) => applyFilters({ status: e.target.value })}
              className="bg-transparent text-sm text-cream outline-none"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-ink-soft">
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-soft px-3 py-2">
            <Filter className="h-4 w-4 text-cream/60" />
            <select
              value={currentCategory}
              onChange={(e) => applyFilters({ category: e.target.value })}
              className="bg-transparent text-sm text-cream outline-none"
            >
              <option value="all" className="bg-ink-soft">All categories</option>
              {categoryEntries.map(([k, v]) => (
                <option key={k} value={k} className="bg-ink-soft">
                  {v.en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-ink-soft px-4 py-3 text-xs uppercase tracking-wider text-cream/55">
            <div className="col-span-3">Submitter</div>
            <div className="col-span-3">Subject</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2 text-right">Status · Time</div>
          </div>

          {submissions.length === 0 ? (
            <div className="px-4 py-16 text-center text-sm text-cream/55">
              {connectError ? 'No data to show.' : 'Koi complaint nahi mili. Jab user form bharega, yahan dikhega.'}
            </div>
          ) : (
            <ul>
              {submissions.map((s) => {
                const open = openId === s._id;
                return (
                  <li key={s._id} className="border-b border-white/5 last:border-0">
                    <button
                      onClick={() => setOpenId(open ? null : (s._id ?? null))}
                      className="grid w-full grid-cols-12 items-start gap-3 px-4 py-4 text-left text-sm transition hover:bg-white/5"
                    >
                      <div className="col-span-3 flex items-start gap-2">
                        {open ? (
                          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-cream/55" />
                        ) : (
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cream/55" />
                        )}
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-cream">{s.name}</div>
                          <div className="font-mono text-[11px] text-cream/55">{s.ticketId}</div>
                        </div>
                      </div>
                      <div className="col-span-3 min-w-0">
                        <div className="truncate text-cream">{s.subject}</div>
                        <div className="truncate text-xs text-cream/55">{s.description.slice(0, 80)}…</div>
                      </div>
                      <div className="col-span-2 min-w-0">
                        <div className="truncate">{s.village}</div>
                        <div className="truncate text-xs text-cream/55">
                          {s.district}, {s.state}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="chip">{categories[s.category]?.en ?? s.category}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <StatusBadge status={s.status} />
                        <div className="mt-1 text-[11px] text-cream/55">
                          {formatDate(s.createdAt)}
                        </div>
                      </div>
                    </button>

                    {open && (
                      <SubmissionDetail
                        s={s}
                        onUpdated={() => {
                          startTransition(() => router.refresh());
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 p-4 ${tone}`}>
      <div className="text-xs uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

function SubmissionDetail({
  s,
  onUpdated
}: {
  s: SubmissionWithUrls;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState<SubmissionStatus>(s.status);
  const [notes, setNotes] = useState(s.adminNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/submissions/${s._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes: notes })
    });
    if (!res.ok) {
      setError('Could not save. Try again.');
    } else {
      onUpdated();
    }
    setSaving(false);
  }

  return (
    <div className="bg-ink-soft/50 px-4 py-6">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="md:col-span-2 space-y-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-cream/55">Description</div>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-cream/85">
              {s.description}
            </p>
          </div>

          {s.accused && (
            <div>
              <div className="text-xs uppercase tracking-wider text-cream/55">Accused</div>
              <p className="mt-1 text-sm text-cream/85">{s.accused}</p>
            </div>
          )}

          <div>
            <div className="text-xs uppercase tracking-wider text-cream/55">
              Proof files ({s.proofs.length})
            </div>
            <ul className="mt-2 space-y-2">
              {s.proofs.map((p) => {
                const Icon = fileIcon(p.mimeType);
                return (
                  <li
                    key={p.publicId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-ink-muted px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-cream/70" />
                      {p.viewUrl ? (
                        <a
                          href={p.viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm text-cream hover:text-accent-glow"
                        >
                          {p.originalName}
                        </a>
                      ) : (
                        <span className="truncate text-sm text-cream/60">
                          {p.originalName} (storage not configured)
                        </span>
                      )}
                      <span className="shrink-0 text-xs text-cream/55">
                        {(p.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    {p.downloadUrl && (
                      <a
                        href={p.downloadUrl}
                        className="rounded-md p-1.5 text-cream/60 hover:bg-white/10 hover:text-cream"
                        aria-label={`Download ${p.originalName}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-ink p-4">
            <div className="text-xs uppercase tracking-wider text-cream/55">Submitter</div>
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-cream/60" />
                <a href={`tel:${s.phone}`} className="text-cream hover:text-accent-glow">
                  {s.phone}
                </a>
              </div>
              {s.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-cream/60" />
                  <a href={`mailto:${s.email}`} className="text-cream hover:text-accent-glow">
                    {s.email}
                  </a>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 text-cream/60" />
                <div>
                  {s.village}, {s.district}, {s.state}
                  {s.pincode ? ` — ${s.pincode}` : ''}
                </div>
              </div>
              <div className="mt-2 inline-block rounded-md bg-white/5 px-2 py-0.5 text-xs">
                Consent:{' '}
                <span className={s.shareConsent === 'public' ? 'text-leaf' : 'text-saffron'}>
                  {s.shareConsent === 'public' ? 'Public OK' : 'Anonymous only'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-ink p-4">
            <div className="text-xs uppercase tracking-wider text-cream/55">Update</div>
            <label className="mt-3 block">
              <div className="field-label">Status</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
                className="select"
              >
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="mt-3 block">
              <div className="field-label">Notes</div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="textarea min-h-[100px]"
                placeholder="Internal notes (only you can see this)"
                maxLength={2000}
              />
            </label>
            {error && (
              <div className="mt-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent-glow">
                {error}
              </div>
            )}
            <button onClick={save} disabled={saving} className="btn-primary mt-3 w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
