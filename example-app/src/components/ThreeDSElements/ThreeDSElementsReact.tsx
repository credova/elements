'use client';
import {
  PublicSquareProvider,
  CardElement,
  CardNumberElement,
  CardExpirationDateElement,
  CardVerificationCodeElement,
} from '@publicsquare/elements-react';
import PublicSquareTypes from '@publicsquare/elements-react/types/sdk';
import { ReactNode, useRef } from 'react';
import { environment } from '@/config/environments';
import NameInput from '@/components/Form/NameInput';

export type PaymentIntentResponse = {
  id: string;
  status: string;
  next_action?: {
    type: string;
    three_d_secure?: ThreeDsNextAction;
  };
  [key: string]: unknown;
};

export type ThreeDsNextAction = {
  session_id: string;
  acs_challenge_url?: string;
  acs_transaction_id?: string;
  three_ds_version?: string;
  transport?: string;
  redirect_url?: string;
};

export type ThreeDSChallengeResult = {
  id: string;
  isCompleted: boolean;
  authenticationStatus: string;
};

export type StepLogEntry = { label: string; data: unknown };

export function ThreeDsProvider({ children }: { children: ReactNode }) {
  return (
    <PublicSquareProvider
      apiKey={environment.apiKey}
      options={{ ...environment.card, ...environment.threeDs }}
    >
      {children}
    </PublicSquareProvider>
  );
}

export function buildCreateIntentBody(cardId: string) {
  return {
    amount: 100,
    currency: 'USD',
    capture_method: 'Automatic',
    payment_method: { card: cardId },
    customer: {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@example.com',
    },
    billing_details: {
      address_line_1: '111 Colorado Ave',
      city: 'Des Moines',
      state: 'IA',
      postal_code: '51111',
      country: 'US',
    },
  };
}

// Card field refs + getCard() reader + rendered fields, shared by both flows.
export function useCardForm(allInOne: boolean, idPrefix: string) {
  const cardElement = useRef<PublicSquareTypes.CardElement>(null);
  const cardNumberElement = useRef<PublicSquareTypes.CardNumberElement>(null);
  const cardExpirationDateElement = useRef<PublicSquareTypes.CardExpirationDateElement>(null);
  const cardVerificationCodeElement = useRef<PublicSquareTypes.CardVerificationCodeElement>(null);

  function getCard(): PublicSquareTypes.CardCreateInput['card'] | null {
    if (allInOne) return cardElement.current;
    if (
      cardNumberElement.current &&
      cardExpirationDateElement.current &&
      cardVerificationCodeElement.current
    ) {
      return {
        number: cardNumberElement.current,
        expirationMonth: cardExpirationDateElement.current.month(),
        expirationYear: cardExpirationDateElement.current.year(),
        cvc: cardVerificationCodeElement.current,
      };
    }
    return null;
  }

  const fields = (
    <div className="w-full space-y-4">
      <NameInput required />
      {allInOne ? (
        <div className="space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-4">
          <label>Card element</label>
          <div className="w-full rounded-lg bg-white p-2 shadow">
            <CardElement id={`${idPrefix}-card-element`} ref={cardElement} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 items-start gap-4 rounded-lg border-2 border-dashed border-gray-300 p-4">
          <div>
            <label>Card number</label>
            <div className="w-full rounded-lg bg-white p-2 shadow">
              <CardNumberElement id={`${idPrefix}-card-number`} ref={cardNumberElement} />
            </div>
          </div>
          <div className="grid grid-cols-2 items-start gap-4">
            <div>
              <label>Expiration</label>
              <div className="w-full rounded-lg bg-white p-2 shadow">
                <CardExpirationDateElement
                  id={`${idPrefix}-card-exp`}
                  ref={cardExpirationDateElement}
                />
              </div>
            </div>
            <div>
              <label>CVC</label>
              <div className="w-full rounded-lg bg-white p-2 shadow">
                <CardVerificationCodeElement
                  id={`${idPrefix}-card-cvc`}
                  ref={cardVerificationCodeElement}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return { getCard, fields };
}

export function StepLog({ entries }: { entries: StepLogEntry[] }) {
  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <details key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
          <summary className="cursor-pointer font-medium">{entry.label}</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(entry.data, null, 2)}
          </pre>
        </details>
      ))}
    </div>
  );
}
