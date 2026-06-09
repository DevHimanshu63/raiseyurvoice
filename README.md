# Awaaz Uthao — Raise Your Voice

A Next.js 14 platform where citizens can submit complaints — corruption, government-official misconduct, police issues, civic problems, anything — along with proof (photos, videos, PDF). All submissions land in **MongoDB Atlas**, proof files in **Cloudinary**, and you review everything on a password-protected admin dashboard at `/admin`.

Built for a YouTuber who wants to amplify the stories nobody else listens to.

---

## What's inside

- **Home (`/`)** — Hindi + English hero, "how it works", categories, privacy, social, CTA.
- **Submit form (`/submit`)** — name, mobile, email, village, district, state, pincode, category, accused, subject, description, **direct browser uploads** to Cloudinary (max 6 files, 25 MB each), and a public/anonymous consent toggle.
- **Thank-you (`/thank-you?ticket=…`)** — confirms the ticket ID.
- **Admin login (`/admin/login`)** — password from env, rate-limit + 15-min lockout after 5 failed attempts.
- **Admin dashboard (`/admin`)** — list, search, filter by status & category, expand a row to see full details, view/download proof files via signed URLs, update status and notes.

## Architecture

| Concern | Service |
|---|---|
| Form data, statuses, lockouts | **MongoDB Atlas** |
| Proof files (images / videos / PDFs) | **Cloudinary** (uploaded directly from browser, served via signed authenticated URLs) |
| Admin session | JWT cookie signed with `ADMIN_JWT_SECRET` |
| Hosting | **Vercel** (works on hobby tier) |

Because file uploads go browser → Cloudinary directly, the Vercel serverless function (`/api/submit`) only receives JSON references — no large payloads, no 4.5 MB body limit issues.

---

## Local setup

### 1. Install

```bash
cd raiseyurvoice
npm install
```

### 2. Cloudinary — one-time setup (~5 minutes)

1. Sign up for free at <https://cloudinary.com>.
2. From the **Dashboard**, copy:
   - **Cloud name** (top of the page, e.g. `dxyz123`)
   - **API Key**
   - **API Secret** (click "reveal")
3. Create an **unsigned upload preset**:
   - Go to **Settings → Upload → Add upload preset**.
   - **Signing Mode**: `Unsigned`
   - **Folder**: `ryv_proofs` (must match — this is what the server validates against)
   - **Access Mode**: `authenticated` (so files can't be viewed without a signed URL)
   - **Max file size**: `25000000` (25 MB)
   - **Allowed formats**: `jpg,jpeg,png,webp,gif,heic,heif,mp4,mov,webm,pdf`
   - Save and copy the **preset name** (something like `ml_default` by default, or pick your own).

### 3. MongoDB Atlas

1. Create a free cluster at <https://cloud.mongodb.com> (M0 free tier is fine).
2. Database Access → add a user, save the password.
3. Network Access → add IP `0.0.0.0/0` (required so Vercel can connect).
4. Copy the connection string (starts with `mongodb+srv://`).

### 4. Create `.env.local`

```bash
cp .env.local.example .env.local
```

Fill in:

```ini
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority
MONGODB_DB=raiseyurvoice
ADMIN_PASSWORD=pick-a-strong-password
ADMIN_JWT_SECRET=<paste output of: openssl rand -hex 32>

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your cloud name>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your unsigned preset name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>
```

### 5. Initialize MongoDB indexes (optional but recommended)

```bash
node scripts/init-db.mjs
```

### 6. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to <https://vercel.com/new> and import the repo.
3. In the project settings → **Environment Variables**, add all the keys from your `.env.local`:
   - `MONGODB_URI`
   - `MONGODB_DB`
   - `ADMIN_PASSWORD`
   - `ADMIN_JWT_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Click **Deploy**.
5. After deploy, in MongoDB Atlas → **Network Access** confirm `0.0.0.0/0` is allowed (Vercel uses dynamic IPs).
6. Visit your Vercel URL and verify:
   - `/submit` accepts a form + file uploads
   - `/admin/login` accepts your password
   - `/admin` shows the new submission with working "view" and "download" links

---

## Data model

MongoDB collection `submissions`:

```ts
{
  ticketId: 'RYV-AB3X9K',
  name, phone, email?, village, district, state, pincode?,
  category: 'corruption' | 'government_official' | 'police' | …,
  subject, description, accused?,
  shareConsent: 'public' | 'anonymous',
  proofs: [{ publicId, resourceType, format, originalName, size, mimeType }],
  status: 'new' | 'reviewing' | 'published' | 'archived',
  adminNotes?,
  createdAt, updatedAt,
  ipHash?
}
```

A second collection `admin_login_attempts` tracks failed login attempts per IP for rate limiting (TTL-cleaned automatically).

---

## Security

| Layer | Status |
|---|---|
| Constant-time admin password compare | ✅ |
| Per-IP rate limit + 15 min lockout after 5 fails | ✅ |
| JWT cookie session (HS256, 8h, httpOnly, sameSite, secure-in-prod) | ✅ |
| Proof files private — signed Cloudinary URLs only | ✅ |
| `.env.local` gitignored | ✅ |
| Server validates that uploaded proofs come from the configured folder | ✅ |

What you still need to do:

- Use a **strong** `ADMIN_PASSWORD` and a 32+ byte `ADMIN_JWT_SECRET`.
- Rotate the MongoDB password if it has ever been shared.
- Restrict your Cloudinary upload preset (folder, allowed formats, max size) so it can't be abused.

---

## Customising

- Brand / tagline → [`src/components/Header.tsx`](src/components/Header.tsx), [`src/components/Footer.tsx`](src/components/Footer.tsx).
- Hero copy → [`src/components/Hero.tsx`](src/components/Hero.tsx).
- Social links → [`src/components/Socials.tsx`](src/components/Socials.tsx).
- Theme colours → [`tailwind.config.ts`](tailwind.config.ts).
- Categories → [`src/lib/types.ts`](src/lib/types.ts) — add/remove and the form + admin filters pick it up automatically.

---

## Important — what this platform is NOT

This is a citizen storytelling platform. It is not the police, not a court, and it does not file FIRs. The footer makes this clear; for emergencies, dial **112**. Treat every submission as a lead that still needs ground verification before publishing.
