'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { PublicSquare } from '@publicsquare/elements-js';
import {
  CardElement,
  CardExpirationDateElement,
  CardNumberElement,
  CardVerificationCodeElement,
  CardsCreateInput,
} from '@publicsquare/elements-js/types';
import NameInput from '@/components/Form/NameInput';
import SubmitButton from '@/components/SubmitButton';
import { environment } from '@/config/environments';
import {
  PaymentIntentResponse,
  StepLog,
  StepLogEntry,
  ThreeDsNextAction,
  buildCreateIntentBody,
} from './ThreeDSElementsReact';

type Flow = 'iframe' | 'redirect';

type Step =
  | 'idle'
  | 'tokenizing'
  | 'creating_intent'
  | 'creating_session'
  | 'confirming'
  | 'challenge'
  | 'completing'
  | 'redirecting'
  | 'done'
  | 'error';

const CHALLENGE_CONTAINER_ID = 'js-threeds-challenge';
const COMPLETE_PATH = '/three-ds/redirect/complete';
const FAILURE_PATH = '/three-ds/redirect/failure';

const LOADING_STEPS: Step[] = [
  'tokenizing',
  'creating_intent',
  'creating_session',
  'confirming',
  'completing',
  'redirecting',
];

const STEP_LABELS: Partial<Record<Step, string>> = {
  tokenizing: 'Tokenizing card',
  creating_intent: 'Creating payment intent',
  creating_session: 'Creating 3DS session',
  confirming: 'Confirming payment intent',
  completing: 'Completing 3DS challenge',
  redirecting: 'Redirecting to ACS challenge',
};

export default function ThreeDSElementsJs({ flow, allInOne }: { flow: Flow; allInOne: boolean }) {
  const [publicsquare, setPublicSquare] = useState<PublicSquare>();
  const [cardElement, setCardElement] = useState<CardElement>();
  const [cardNumberElement, setCardNumberElement] = useState<CardNumberElement>();
  const [cardExpirationDateElement, setCardExpirationDateElement] =
    useState<CardExpirationDateElement>();
  const [cardVerificationCodeElement, setCardVerificationCodeElement] =
    useState<CardVerificationCodeElement>();

  const [step, setStep] = useState<Step>('idle');
  const [intentId, setIntentId] = useState<string>();
  const [btSessionId, setBtSessionId] = useState<string>();
  const [nextAction, setNextAction] = useState<ThreeDsNextAction>();
  const [finalIntent, setFinalIntent] = useState<PaymentIntentResponse>();
  const [error, setError] = useState<string>();
  const [stepLog, setStepLog] = useState<StepLogEntry[]>([]);
  const challengeStarted = useRef(false);

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
    challengeStarted.current = false;
  }

  useEffect(() => {
    new PublicSquare()
      .init(environment.apiKey, { apiUrl: environment.apiUrl })
      .then((instance) => setPublicSquare(instance));
  }, []);

  useEffect(() => {
    if (!publicsquare) return;

    function unmount() {
      try {
        cardElement?.unmount();
      } catch {}
      try {
        cardNumberElement?.unmount();
      } catch {}
      try {
        cardExpirationDateElement?.unmount();
      } catch {}
      try {
        cardVerificationCodeElement?.unmount();
      } catch {}
    }

    requestAnimationFrame(() => {
      unmount();
      if (allInOne) {
        const element = publicsquare.createCardElement({});
        element.mount('#js-threeds-card-element');
        setCardElement(element);
      } else {
        const number = publicsquare.createCardNumberElement({});
        number.mount('#js-threeds-card-number');
        setCardNumberElement(number);
        const expiration = publicsquare.createCardExpirationDateElement({});
        expiration.mount('#js-threeds-card-exp');
        setCardExpirationDateElement(expiration);
        const cvc = publicsquare.createCardVerificationCodeElement({});
        cvc.mount('#js-threeds-card-cvc');
        setCardVerificationCodeElement(cvc);
      }
    });
  }, [publicsquare, allInOne]);

  function getCard(): CardsCreateInput['card'] | null {
    if (allInOne) return cardElement ?? null;
    if (cardNumberElement && cardExpirationDateElement && cardVerificationCodeElement) {
      return {
        number: cardNumberElement,
        expirationMonth: cardExpirationDateElement.month(),
        expirationYear: cardExpirationDateElement.year(),
        cvc: cardVerificationCodeElement,
      };
    }
    return null;
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

    if (flow === 'iframe') {
      await runIframe(cardResponse.token, intentRes.id);
    } else {
      await runRedirect(intentRes.id);
    }
  }

  async function runIframe(tokenId: string, paymentIntentId: string) {
    setStep('creating_session');
    let sessionRes: {
      id: string;
      bt_session_id: string;
      acs_transaction_id: string;
      error?: unknown;
    };
    try {
      sessionRes = (await publicsquare!.threeDs.createSession({
        token_id: tokenId,
        payment_intent_id: paymentIntentId,
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
      const res = await fetch(`/api/payment-intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          three_d_secure: { session_id: sessionRes.id, transport: 'iframe' },
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

  async function runRedirect(paymentIntentId: string) {
    const origin = window.location.origin;
    const successUrl = `${origin}${COMPLETE_PATH}/${paymentIntentId}`;
    const failureUrl = `${origin}${FAILURE_PATH}/${paymentIntentId}`;

    setStep('confirming');
    let confirmRes: PaymentIntentResponse;
    try {
      const res = await fetch(`/api/payment-intents/${paymentIntentId}/confirm`, {
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

  useEffect(() => {
    if (step !== 'challenge' || !publicsquare || !nextAction || !btSessionId) return;
    if (challengeStarted.current) return;
    challengeStarted.current = true;

    publicsquare.threeDs
      .startChallenge({
        sessionId: btSessionId,
        acsChallengeUrl: nextAction.acs_challenge_url!,
        acsTransactionId: nextAction.acs_transaction_id!,
        threeDsVersion: nextAction.three_ds_version!,
        containerId: CHALLENGE_CONTAINER_ID,
      })
      .then((result) => onChallengeComplete(result))
      .catch((err) => fail('challenge failure', err instanceof Error ? err.message : String(err)));
  }, [step, publicsquare, nextAction, btSessionId]);

  async function onChallengeComplete(result: unknown) {
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

  const isLoading = LOADING_STEPS.includes(step);

  return (
    <div className="w-full space-y-4">
      {flow === 'redirect' && step !== 'done' && step !== 'error' && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Redirect flow navigates this page to the ACS challenge, then returns to
          <code className="mx-1">{COMPLETE_PATH}/&#123;intent&#125;/&#123;session&#125;</code>
          to finish.
        </div>
      )}
      {isLoading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          {STEP_LABELS[step]}…
        </div>
      )}

      {step === 'challenge' && (
        <div className="w-full space-y-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm">
            <b>3DS Challenge</b> — complete the authentication below
          </div>
          <div id={CHALLENGE_CONTAINER_ID} />
        </div>
      )}

      {step === 'done' && finalIntent && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-1 font-semibold text-green-800">
            Flow complete — status: <code>{finalIntent.status}</code>
          </div>
        </div>
      )}

      {step === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <b>Error:</b> {error}
        </div>
      )}

      <form onSubmit={run} name="js-3ds-form" className={step === 'idle' ? '' : 'hidden'}>
        <div className="w-full space-y-4">
          <NameInput required />
          {allInOne ? (
            <div className="space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-4">
              <label>Card element</label>
              <div className="w-full rounded-lg bg-white p-2 shadow" id="js-threeds-card-element" />
            </div>
          ) : (
            <div className="grid grid-cols-2 items-start gap-4 rounded-lg border-2 border-dashed border-gray-300 p-4">
              <div>
                <label>Card number</label>
                <div
                  className="w-full rounded-lg bg-white p-2 shadow"
                  id="js-threeds-card-number"
                />
              </div>
              <div className="grid grid-cols-2 items-start gap-4">
                <div>
                  <label>Expiration</label>
                  <div className="w-full rounded-lg bg-white p-2 shadow" id="js-threeds-card-exp" />
                </div>
                <div>
                  <label>CVC</label>
                  <div className="w-full rounded-lg bg-white p-2 shadow" id="js-threeds-card-cvc" />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <SubmitButton loading={isLoading} elementType="card" />
          </div>
        </div>
      </form>

      {(step === 'done' || step === 'error') && (
        <button
          onClick={reset}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-indigo-500"
        >
          Reset
        </button>
      )}

      {stepLog.length > 0 && <StepLog entries={stepLog} />}
    </div>
  );
}
