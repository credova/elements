'use client';
import { usePublicSquare } from '@publicsquare/elements-react';
import { FormEvent, useState } from 'react';
import SubmitButton from '@/components/SubmitButton';
import {
  PaymentIntentResponse,
  StepLog,
  StepLogEntry,
  buildCreateIntentBody,
  useCardForm,
} from './ThreeDSElementsReact';

type Step =
  'idle' | 'tokenizing' | 'creating_intent' | 'confirming' | 'redirecting' | 'done' | 'error';

const STEP_LABELS: Partial<Record<Step, string>> = {
  tokenizing: '1/4 Tokenizing card',
  creating_intent: '2/4 Creating payment intent',
  confirming: '3/4 Confirming (server creates + authenticates session)',
  redirecting: '4/4 Redirecting to ACS challenge',
};

const COMPLETE_PATH = '/three-ds/redirect/complete';
const FAILURE_PATH = '/three-ds/redirect/failure';

export default function RedirectFlow({ allInOne }: { allInOne: boolean }) {
  const { publicsquare } = usePublicSquare();
  const { getCard, fields } = useCardForm(allInOne, 'threeds-redirect');

  const [step, setStep] = useState<Step>('idle');
  const [finalIntent, setFinalIntent] = useState<PaymentIntentResponse>();
  const [error, setError] = useState<string>();
  const [stepLog, setStepLog] = useState<StepLogEntry[]>([]);

  function log(label: string, data: unknown) {
    setStepLog((prev) => [...prev, { label, data }]);
  }

  function fail(label: string, data: unknown) {
    log(label, data);
    setError(typeof data === 'string' ? data : JSON.stringify(data));
    setStep('error');
  }

  function reset() {
    setStep('idle');
    setFinalIntent(undefined);
    setError(undefined);
    setStepLog([]);
  }

  async function run(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step !== 'idle' || !publicsquare) return;
    const card = getCard();
    const cardholderName = new FormData(e.currentTarget).get('cardholder_name') as string;
    if (!cardholderName || !card) return;

    setStep('tokenizing');
    let cardResponse: { id: string; token: string; error?: unknown };
    try {
      cardResponse = (await publicsquare.cards.create({
        cardholder_name: cardholderName,
        card,
      })) as typeof cardResponse;
    } catch (err) {
      return fail('cards.create threw', String(err));
    }
    if (cardResponse.error) return fail('cards.create error', cardResponse.error);
    log('1. cards.create', cardResponse);

    setStep('creating_intent');
    let intentRes: PaymentIntentResponse;
    try {
      const res = await fetch('/api/payment-intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildCreateIntentBody(cardResponse.id)),
      });
      intentRes = await res.json();
      if (!res.ok) return fail('create intent error', intentRes);
    } catch (err) {
      return fail('create intent threw', String(err));
    }
    log('2. create payment intent', intentRes);

    const origin = window.location.origin;
    const successUrl = `${origin}${COMPLETE_PATH}/${intentRes.id}`;
    const failureUrl = `${origin}${FAILURE_PATH}/${intentRes.id}`;

    setStep('confirming');
    let confirmRes: PaymentIntentResponse;
    try {
      const res = await fetch(`/api/payment-intents/${intentRes.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          three_d_secure: {
            transport: 'redirect',
            success_url: successUrl,
            failure_url: failureUrl,
          },
        }),
      });
      confirmRes = await res.json();
      if (!res.ok) return fail('confirm error', confirmRes);
    } catch (err) {
      return fail('confirm threw', String(err));
    }
    log('3. confirm', confirmRes);

    const redirectUrl = confirmRes.next_action?.three_d_secure?.redirect_url;
    if (confirmRes.status === 'requires_action' && redirectUrl) {
      setStep('redirecting');
      window.location.href = redirectUrl;
      return;
    }

    setFinalIntent(confirmRes);
    setStep('done');
  }

  const isLoading = ['tokenizing', 'creating_intent', 'confirming', 'redirecting'].includes(step);

  if (step === 'done' && finalIntent) {
    return (
      <div className="w-full space-y-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-1 font-semibold text-green-800">
            Frictionless — status: <code>{finalIntent.status}</code>
          </div>
        </div>
        <StepLog entries={stepLog} />
        <button
          onClick={reset}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-indigo-500"
        >
          Reset
        </button>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="w-full space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <b>Error:</b> {error}
        </div>
        <StepLog entries={stepLog} />
        <button
          onClick={reset}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-indigo-500"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        Redirect flow navigates this page to the ACS challenge, then returns to
        <code className="mx-1">{COMPLETE_PATH}/&#123;intent&#125;/&#123;session&#125;</code>
        to finish.
      </div>
      {isLoading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          {STEP_LABELS[step]}…
        </div>
      )}
      <form onSubmit={run} name="react-3ds-redirect-form">
        <div className="w-full space-y-4">
          {fields}
          <div className="flex justify-end">
            <SubmitButton loading={isLoading} elementType="card" />
          </div>
        </div>
      </form>
      {stepLog.length > 0 && <StepLog entries={stepLog} />}
    </div>
  );
}
