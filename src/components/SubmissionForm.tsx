'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORY_LABELS, type SubmissionCategory } from '@/lib/types';
import {
  Upload,
  X,
  Loader2,
  FileText,
  Image as ImageIcon,
  Film,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const MAX_FILES = 6;
const MAX_BYTES_PER_FILE = 25 * 1024 * 1024;

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

interface PickedFile {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  // Filled in once the upload completes
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw';
  format?: string;
  bytes?: number;
}

function fileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.startsWith('video/')) return Film;
  return FileText;
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Upload a single file to Cloudinary using the unsigned upload preset.
 * Uses XHR so we can stream upload progress.
 */
function uploadToCloudinary(
  file: File,
  onProgress: (pct: number) => void
): Promise<{
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
}> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(
      new Error('Cloudinary is not configured. Please contact the admin.')
    );
  }

  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const r = JSON.parse(xhr.responseText);
          resolve({
            publicId: r.public_id,
            resourceType: r.resource_type,
            format: r.format,
            bytes: r.bytes
          });
        } catch {
          reject(new Error('Bad upload response'));
        }
      } else {
        let msg = 'Upload failed';
        try {
          const r = JSON.parse(xhr.responseText);
          if (r?.error?.message) msg = r.error.message;
        } catch {
          /* ignore */
        }
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(fd);
  });
}

export default function SubmissionForm() {
  const router = useRouter();
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const picked = Array.from(e.target.files ?? []);
    const next = [...files];
    for (const f of picked) {
      if (next.length >= MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }
      if (f.size > MAX_BYTES_PER_FILE) {
        setError(`${f.name} is bigger than 25 MB.`);
        continue;
      }
      next.push({
        id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2)}`,
        file: f,
        status: 'pending',
        progress: 0
      });
    }
    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Kick off uploads for any pending files
    next.forEach((pf) => {
      if (pf.status === 'pending') void startUpload(pf.id);
    });
  }

  function updateFile(id: string, patch: Partial<PickedFile>) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  async function startUpload(id: string) {
    const pf = (() => {
      let found: PickedFile | undefined;
      setFiles((prev) => {
        found = prev.find((x) => x.id === id);
        return prev;
      });
      return found;
    })();
    if (!pf || pf.status === 'uploading' || pf.status === 'done') return;

    updateFile(id, { status: 'uploading', progress: 0, error: undefined });
    try {
      const result = await uploadToCloudinary(pf.file, (pct) =>
        updateFile(id, { progress: pct })
      );
      updateFile(id, {
        status: 'done',
        progress: 100,
        publicId: result.publicId,
        resourceType: result.resourceType,
        format: result.format,
        bytes: result.bytes
      });
    } catch (err) {
      updateFile(id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Upload failed'
      });
    }
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function retryFile(id: string) {
    void startUpload(id);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError('At least one proof file is required.');
      return;
    }
    if (files.some((f) => f.status !== 'done')) {
      setError(
        'Please wait for all files to finish uploading (or remove failed ones).'
      );
      return;
    }

    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const payload = {
        name: String(fd.get('name') ?? ''),
        phone: String(fd.get('phone') ?? ''),
        email: String(fd.get('email') ?? ''),
        village: String(fd.get('village') ?? ''),
        district: String(fd.get('district') ?? ''),
        state: String(fd.get('state') ?? ''),
        pincode: String(fd.get('pincode') ?? ''),
        category: String(fd.get('category') ?? ''),
        accused: String(fd.get('accused') ?? ''),
        subject: String(fd.get('subject') ?? ''),
        description: String(fd.get('description') ?? ''),
        shareConsent: String(fd.get('shareConsent') ?? ''),
        proofs: files.map((f) => ({
          publicId: f.publicId!,
          resourceType: f.resourceType!,
          format: f.format!,
          bytes: f.bytes!,
          originalName: f.file.name,
          mimeType: f.file.type
        }))
      };

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed. Try again.');

      router.push(`/thank-you?ticket=${encodeURIComponent(data.ticketId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  const allDone = files.length > 0 && files.every((f) => f.status === 'done');

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!cloudinaryConfigured && (
        <div className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent-glow">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">File uploads are not configured</div>
            <div className="mt-1 text-accent-glow/80">
              The site admin needs to set
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5">
                NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
              </code>
              and
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5">
                NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
              </code>
              in environment variables.
            </div>
          </div>
        </div>
      )}

      {/* Personal details */}
      <section className="card">
        <h2 className="mb-1 font-display text-xl font-bold">
          1. आपकी पहचान <span className="text-cream/55">/ Your details</span>
        </h2>
        <p className="mb-5 text-sm text-cream/60">
          Hum aapse confirm karne ke liye sampark karenge. Aap ki anumati ke
          bina kuch public nahi hoga.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">Pura naam / Full name *</label>
            <input
              name="name"
              required
              maxLength={120}
              className="input"
              placeholder="Jaise: Ramesh Kumar"
            />
          </div>
          <div>
            <label className="field-label">Mobile number *</label>
            <input
              name="phone"
              required
              inputMode="tel"
              pattern="[0-9+\-\s]{7,16}"
              maxLength={16}
              className="input"
              placeholder="10-digit mobile number"
            />
            <div className="field-hint">Verification ke liye, kabhi public nahi hota.</div>
          </div>
          <div>
            <label className="field-label">Email (optional)</label>
            <input
              name="email"
              type="email"
              maxLength={160}
              className="input"
              placeholder="aap@example.com"
            />
          </div>
          <div>
            <label className="field-label">Pincode (optional)</label>
            <input
              name="pincode"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              className="input"
              placeholder="6-digit pincode"
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="card">
        <h2 className="mb-1 font-display text-xl font-bold">
          2. आप कहाँ से हैं? <span className="text-cream/55">/ Your location</span>
        </h2>
        <p className="mb-5 text-sm text-cream/60">
          Yeh batao ki samasya kahaan hui hai.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="field-label">Gaon / Shehar / Town *</label>
            <input
              name="village"
              required
              maxLength={120}
              className="input"
              placeholder="Apne gaon ya shehar ka naam"
            />
          </div>
          <div>
            <label className="field-label">District / Zila *</label>
            <input
              name="district"
              required
              maxLength={120}
              className="input"
              placeholder="Jaise: Varanasi"
            />
          </div>
          <div>
            <label className="field-label">Rajya / State *</label>
            <select name="state" required defaultValue="" className="select">
              <option value="" disabled>
                — Select state —
              </option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="card">
        <h2 className="mb-1 font-display text-xl font-bold">
          3. क्या समस्या है? <span className="text-cream/55">/ Your complaint</span>
        </h2>
        <p className="mb-5 text-sm text-cream/60">
          Jitna detail mein likhoge, utni achhi tarah samjha jaa sakega.
        </p>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="field-label">Category *</label>
              <select name="category" required defaultValue="" className="select">
                <option value="" disabled>
                  — Choose category —
                </option>
                {(Object.keys(CATEGORY_LABELS) as SubmissionCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k].hi} — {CATEGORY_LABELS[k].en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Kis ke khilaf? (optional)</label>
              <input
                name="accused"
                maxLength={200}
                className="input"
                placeholder="Vyakti / Vibhag / Department"
              />
              <div className="field-hint">
                Khali chod sakte ho agar pata nahi hai.
              </div>
            </div>
          </div>

          <div>
            <label className="field-label">Samasya ka short title *</label>
            <input
              name="subject"
              required
              maxLength={160}
              className="input"
              placeholder="Ek line mein samasya"
            />
          </div>

          <div>
            <label className="field-label">Pura vivaran / Full description *</label>
            <textarea
              name="description"
              required
              minLength={40}
              maxLength={4000}
              className="textarea"
              placeholder="Kya hua, kab hua, kaun involve tha, ab tak kya kiya — sab kuch likho. Jitna saaf, utna behtar."
            />
            <div className="field-hint">Minimum 40 characters · Maximum 4000</div>
          </div>
        </div>
      </section>

      {/* Proof upload */}
      <section className="card">
        <h2 className="mb-1 font-display text-xl font-bold">
          4. सबूत / Proof *
        </h2>
        <p className="mb-5 text-sm text-cream/60">
          Photos, videos, FIR copy, documents — kuch bhi jo aap ki baat sahi
          saabit kare. Max {MAX_FILES} files, har file 25 MB tak. Files seedhe
          secure storage par upload hote hain.
        </p>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-ink-muted/50 px-6 py-10 text-center transition hover:border-accent/50 hover:bg-ink-muted">
          <Upload className="mb-3 h-7 w-7 text-accent-glow" />
          <span className="font-semibold text-cream">Click to upload files</span>
          <span className="mt-1 text-xs text-cream/60">
            JPG, PNG, MP4, MOV, WEBM, PDF
          </span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            className="sr-only"
            onChange={onPickFiles}
            disabled={!cloudinaryConfigured}
          />
        </label>

        {files.length > 0 && (
          <ul className="mt-5 space-y-2">
            {files.map((pf) => {
              const Icon = fileIcon(pf.file.type);
              return (
                <li
                  key={pf.id}
                  className="rounded-xl border border-white/10 bg-ink-muted px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0 text-cream/70" />
                      <div className="min-w-0">
                        <div className="truncate text-sm text-cream">{pf.file.name}</div>
                        <div className="text-xs text-cream/55">{humanSize(pf.file.size)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pf.status === 'uploading' && (
                        <span className="text-xs text-cream/65">{pf.progress}%</span>
                      )}
                      {pf.status === 'done' && (
                        <CheckCircle2 className="h-4 w-4 text-leaf" aria-label="Uploaded" />
                      )}
                      {pf.status === 'error' && (
                        <button
                          type="button"
                          onClick={() => retryFile(pf.id)}
                          className="rounded-md border border-accent/40 px-2 py-0.5 text-xs text-accent-glow hover:bg-accent/10"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(pf.id)}
                        className="rounded-full p-1.5 text-cream/55 hover:bg-white/10 hover:text-cream"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {(pf.status === 'uploading' || pf.status === 'done') && (
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full transition-all ${
                          pf.status === 'done' ? 'bg-leaf' : 'bg-accent'
                        }`}
                        style={{ width: `${pf.status === 'done' ? 100 : pf.progress}%` }}
                      />
                    </div>
                  )}
                  {pf.status === 'error' && pf.error && (
                    <div className="mt-2 text-xs text-accent-glow">{pf.error}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Consent */}
      <section className="card">
        <h2 className="mb-1 font-display text-xl font-bold">
          5. अनुमति / Your consent
        </h2>
        <p className="mb-5 text-sm text-cream/60">
          Aap chuno ki story share karte waqt aap ka naam dikhana chahte ho ya
          nahi.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="cursor-pointer rounded-2xl border border-white/10 bg-ink-muted p-4 transition has-[:checked]:border-accent has-[:checked]:bg-accent/10">
            <input
              type="radio"
              name="shareConsent"
              value="public"
              required
              className="sr-only peer"
              defaultChecked
            />
            <div className="font-semibold text-cream">Mera naam public kar sakte ho</div>
            <div className="mt-1 text-sm text-cream/65">
              YouTube / social media par mere naam aur story dono share kiye jaa
              sakte hain. Maximum impact.
            </div>
          </label>
          <label className="cursor-pointer rounded-2xl border border-white/10 bg-ink-muted p-4 transition has-[:checked]:border-accent has-[:checked]:bg-accent/10">
            <input
              type="radio"
              name="shareConsent"
              value="anonymous"
              className="sr-only peer"
            />
            <div className="font-semibold text-cream">Sirf anonymously share karo</div>
            <div className="mt-1 text-sm text-cream/65">
              Sirf story public hogi, mera naam, gaon ya pehchan reveal nahi hogi.
            </div>
          </label>
        </div>

        <label className="mt-4 flex items-start gap-3 text-sm text-cream/75">
          <input type="checkbox" required className="mt-1 h-4 w-4 accent-accent" />
          <span>
            Main confirm karta hoon ki upar di gayi jaankari sach hai. Mujhe pata
            hai ki jhooti complaint dene par mera account block ho sakta hai aur
            kanooni karwai bhi ho sakti hai.
          </span>
        </label>
      </section>

      {error && (
        <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-glow">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-cream/55">
          Submit karte hi aap ko ek ticket ID milegi. Use save kar lena.
        </p>
        <button
          type="submit"
          disabled={submitting || !allDone}
          className="btn-primary px-8 py-3.5 text-base disabled:cursor-not-allowed disabled:bg-accent/40 disabled:shadow-none"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Bhej raha hoon…
            </>
          ) : (
            <>Submit complaint</>
          )}
        </button>
      </div>
      {!allDone && (
        <div className="-mt-4 text-right text-xs text-cream/55">
          {files.length === 0
            ? 'At least 1 proof file required.'
            : 'Waiting for files to finish uploading…'}
        </div>
      )}
    </form>
  );
}
