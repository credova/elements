'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Status = 'completing' | 'done' | 'error';

export default function RedirectCompletePage() {
  const params = useParams<{ intentId: string; sessionId: string }>();
  const [status, setStatus] = useState<Status>('completing');
  const [result, setResult] = useState<{ status?: string; [key: string]: unknown }>();
  const [error, setError] = useState<string>();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const { intentId, sessionId } = params;
    fetch(`/api/payment-intents/${intentId}/three_d_secure/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ three_d_secure: { session_id: sessionId } }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(JSON.stringify(data));
          setStatus('error');
          return;
        }
        setResult(data);
        setStatus('done');
      })
      .catch((err) => {
        setError(String(err));
        setStatus('error');
      });
  }, [params]);

  return (
    <div className="container mx-auto max-w-xl space-y-4 py-8">
      <h2 className="text-xl font-semibold">3DS Redirect — Complete</h2>
      <p className="text-sm text-slate-600">
        Returned from the ACS challenge. Intent <code>{params.intentId}</code>, session{' '}
        <code>{params.sessionId}</code>.
      </p>

      {status === 'completing' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          Completing 3DS challenge…
        </div>
      )}

      {status === 'done' && result && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-2 font-semibold text-green-800">
            Flow complete — status: <code>{result.status}</code>
          </div>
          <pre className="overflow-x-auto text-xs break-all whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <b>Error:</b> {error}
        </div>
      )}

      <Link
        href="/three-ds"
        className="inline-block rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-xs hover:bg-indigo-500"
      >
        Back to 3DS
      </Link>
    </div>
  );
}
