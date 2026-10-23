'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function RedirectFailurePage() {
  const params = useParams<{ intentId: string; sessionId: string }>();

  return (
    <div className="container mx-auto max-w-xl space-y-4 py-8">
      <h2 className="text-xl font-semibold">3DS Redirect — Failed</h2>
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        The 3DS challenge did not succeed. Intent <code>{params.intentId}</code>, session{' '}
        <code>{params.sessionId}</code>.
      </div>
      <p className="text-sm text-slate-600">
        The card was not authenticated, so the payment was not submitted. Start over to try again.
      </p>
      <Link
        href="/three-ds"
        className="inline-block rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-xs hover:bg-indigo-500"
      >
        Back to 3DS
      </Link>
    </div>
  );
}
