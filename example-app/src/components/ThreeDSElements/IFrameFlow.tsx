'use client';
import { ThreeDSChallengeElement, usePublicSquare } from '@publicsquare/elements-react';
import { FormEvent, useState } from 'react';
import SubmitButton from '@/components/SubmitButton';
import {
  PaymentIntentResponse,
  StepLog,
  StepLogEntry,
  ThreeDSChallengeResult,
  ThreeDsNextAction,
  buildCreateIntentBody,
  useCardForm,
} from './ThreeDSElementsReact';

type Step =
  | 'idle'
  | 'tokenizing'
  | 'creating_intent'
  | 'creating_session'
  | 'confirming'
  | 'challenge'
  | 'completing'
  | 'done'
  | 'error';

const STEP_LABELS: Partial<Record<Step, string>> = {
  tokenizing: '1/5 Tokenizing card',
  creating_intent: '2/5 Creating payment intent',
  creating_session: '3/5 Creating 3DS session',
  confirming: '4/5 Confirming payment intent',
  completing: '5/5 Completing 3DS challenge',
};

export default function IFrameFlow({ allInOne }: { allInOne: boolean }) {
  const { publicsquare } = usePublicSquare();
  const { getCard, fields } = useCardForm(allInOne, 'threeds-iframe');

  const [step, setStep] = useState<Step>('idle');
  const [intentId, setIntentId] = useState<string>();
  const [btSessionId, setBtSessionId] = useState<string>();
  const [nextAction, setNextAction] = useState<ThreeDsNextAction>();
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
    setIntentId(undefined);
    setBtSessionId(undefined);
    setNextAction(undefined);
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
    setIntentId(intentRes.id);

    setStep('creating_session');
    let sessionRes: {
      id: string;
      bt_session_id: string;
      acs_transaction_id: string;
      error?: unknown;
    };
    try {
      sessionRes = (await publicsquare.threeDs.createSession({
        token_id: cardResponse.token,
        payment_intent_id: intentRes.id,
        challenge_preference: 'no-preference',
      })) as typeof sessionRes;
    } catch (err) {
      return fail('createSession threw', String(err));
    }
    if (sessionRes.error) return fail('createSession error', sessionRes.error);
    if (!sessionRes.id) return fail('createSession error', sessionRes);
    log('3. threeDs.createSession', sessionRes);

    setBtSessionId(sessionRes.bt_session_id);

    setStep('confirming');
    let confirmRes: PaymentIntentResponse;
    try {
      const res = await fetch(`/api/payment-intents/${intentRes.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          three_d_secure: {
            session_id: sessionRes.id,
            transport: 'iframe',
          },
        }),
      });
      confirmRes = await res.json();
      if (!res.ok) return fail('confirm error', confirmRes);
    } catch (err) {
      return fail('confirm threw', String(err));
    }
    log('4. confirm', confirmRes);

    if (confirmRes.status === 'requires_action' && confirmRes.next_action?.three_d_secure) {
      setNextAction(confirmRes.next_action.three_d_secure);
      setStep('challenge');
    } else {
      setFinalIntent(confirmRes);
      setStep('done');
    }
  }

  async function onChallengeComplete(result: ThreeDSChallengeResult) {
    log('5. challenge complete', result);
    if (!intentId || !nextAction) return;

    setStep('completing');
    let completeRes: PaymentIntentResponse;
    try {
      const res = await fetch(`/api/payment-intents/${intentId}/three_d_secure/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ three_d_secure: { session_id: nextAction.session_id } }),
      });
      completeRes = await res.json();
      if (!res.ok) return fail('complete error', completeRes);
    } catch (err) {
      return fail('complete threw', String(err));
    }
    log('6. complete', completeRes);
    setFinalIntent(completeRes);
    setStep('done');
  }

  function onChallengeFailure(err: Error) {
    fail('challenge failure', err.message);
  }

  const isLoading = [
    'tokenizing',
    'creating_intent',
    'creating_session',
    'confirming',
    'completing',
  ].includes(step);

  if (step === 'challenge' && nextAction && btSessionId) {
    return (
      <div className="w-full space-y-4">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm">
          <b>3DS Challenge</b> — complete the authentication below
        </div>
        <ThreeDSChallengeElement
          sessionId={btSessionId}
          acsChallengeUrl={nextAction.acs_challenge_url!}
          acsTransactionId={nextAction.acs_transaction_id!}
          threeDsVersion={nextAction.three_ds_version!}
          onComplete={onChallengeComplete}
          onFailure={onChallengeFailure}
        />
      </div>
    );
  }

  if (step === 'done' && finalIntent) {
    return (
      <div className="w-full space-y-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-1 font-semibold text-green-800">
            Flow complete — status: <code>{finalIntent.status}</code>
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
      {isLoading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          {STEP_LABELS[step]}…
        </div>
      )}
      <form onSubmit={run} name="react-3ds-iframe-form">
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
