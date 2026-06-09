import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { getSubmissionsCollection } from '@/lib/mongodb';
import { signedDeliveryUrl } from '@/lib/cloudinary';
import { CATEGORY_LABELS, type Submission, type SubmissionStatus } from '@/lib/types';
import AdminDashboard, { type SubmissionWithUrls } from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin · Awaaz Uthao'
};

export default async function AdminPage({
  searchParams
}: {
  searchParams: { status?: string; category?: string; q?: string };
}) {
  if (!(await isAdmin())) redirect('/admin/login');

  const filter: Record<string, unknown> = {};
  if (searchParams.status && searchParams.status !== 'all') {
    filter.status = searchParams.status as SubmissionStatus;
  }
  if (searchParams.category && searchParams.category !== 'all') {
    filter.category = searchParams.category;
  }
  if (searchParams.q) {
    const q = searchParams.q.trim();
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { ticketId: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { village: { $regex: q, $options: 'i' } },
        { district: { $regex: q, $options: 'i' } },
        { state: { $regex: q, $options: 'i' } }
      ];
    }
  }

  let submissions: SubmissionWithUrls[] = [];
  let connectError: string | null = null;

  try {
    const col = await getSubmissionsCollection();
    const docs = await col.find(filter).sort({ createdAt: -1 }).limit(200).toArray();

    submissions = docs.map((d) => {
      const sub = d as unknown as Submission;
      return {
        ...sub,
        _id: String(d._id),
        proofs: (sub.proofs ?? []).map((p) => ({
          ...p,
          viewUrl: tryUrl(p, false),
          downloadUrl: tryUrl(p, true)
        }))
      };
    });
  } catch (e) {
    connectError = e instanceof Error ? e.message : 'Could not connect to MongoDB';
  }

  let stats = { total: 0, newCount: 0, reviewing: 0, published: 0 };
  if (!connectError) {
    try {
      const col = await getSubmissionsCollection();
      const [total, newCount, reviewing, published] = await Promise.all([
        col.countDocuments({}),
        col.countDocuments({ status: 'new' }),
        col.countDocuments({ status: 'reviewing' }),
        col.countDocuments({ status: 'published' })
      ]);
      stats = { total, newCount, reviewing, published };
    } catch {
      /* ignore */
    }
  }

  return (
    <AdminDashboard
      submissions={submissions}
      stats={stats}
      categories={CATEGORY_LABELS}
      currentStatus={searchParams.status ?? 'all'}
      currentCategory={searchParams.category ?? 'all'}
      currentQuery={searchParams.q ?? ''}
      connectError={connectError}
    />
  );
}

function tryUrl(
  proof: { publicId: string; resourceType: 'image' | 'video' | 'raw'; format: string; originalName: string },
  download: boolean
): string {
  try {
    return signedDeliveryUrl(proof, { download, expiresInSeconds: 3600 });
  } catch {
    return '';
  }
}
