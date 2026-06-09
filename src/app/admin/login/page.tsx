import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';
import { Lock } from 'lucide-react';

export const metadata = {
  title: 'Admin Login · Awaaz Uthao'
};

export default async function AdminLoginPage() {
  if (await isAdmin()) {
    redirect('/admin');
  }
  return (
    <section className="relative">
      <div className="mx-auto max-w-md px-5 py-20">
        <div className="card">
          <div className="mb-5 inline-grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent-glow">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-cream/65">
            Enter the admin password to see all submissions.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </section>
  );
}
