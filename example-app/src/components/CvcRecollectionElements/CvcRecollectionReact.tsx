'use client';
import {
  PublicSquareProvider,
  CardVerificationCodeElement,
  usePublicSquare,
} from '@publicsquare/elements-react';
import PublicSquareTypes from '@publicsquare/elements-react/types/sdk';
import { FormEvent, useRef, useState } from 'react';
import { environment } from '@/config/environments';
import CaptureModal from '@/components/Modals/CaptureModal';

export default function CvcRecollectionReact() {
  return (
    <PublicSquareProvider apiKey={environment.apiKey} options={{ apiUrl: environment.apiUrl }}>
      <Flow />
    </PublicSquareProvider>
  );
}

function Flow() {
  const { publicsquare } = usePublicSquare();
  const cvcElement = useRef<PublicSquareTypes.CardVerificationCodeElement>(null);

  const [updatingCvc, setUpdatingCvc] = useState(false);
  const [message, setMessage] = useState<{ message?: object; error?: boolean }>();

  async function onUpdateCvc(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (updatingCvc || !publicsquare || !cvcElement.current) return;
    const formData = new FormData(e.currentTarget);
    const cardId = formData.get('card_id') as string;
    if (!cardId) return;

    setUpdatingCvc(true);
    try {
      const response = await publicsquare.cards.updateCvc(cardId, cvcElement.current);
      setMessage({ message: response, error: !!response.error });
    } catch (error) {
      setMessage({ message: { error: String(error) }, error: true });
    }
    setUpdatingCvc(false);
  }

  return (
    <div className="w-full space-y-4">
      <form onSubmit={onUpdateCvc} name="react-cvc-recollection-cvc-form" className="space-y-4">
        <div>
          <label htmlFor="react-cvc-recollection-card-id">Card ID</label>
          <input
            id="react-cvc-recollection-card-id"
            name="card_id"
            placeholder="e.g. card_2f9jGnvKcQz8k1yqQpXqRe"
            required
            className="mt-2 block w-full rounded-lg border-0 bg-white px-4 py-3 shadow placeholder:text-gray-400 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            The card <code>id</code> from the card create/get response. PublicSquare checks the card
            belongs to your account, then authorizes a short-lived session to attach the CVC to it.
          </p>
        </div>
        <div className="space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-4">
          <label>CVV</label>
          <div className="w-full rounded-lg bg-white p-2 shadow">
            <CardVerificationCodeElement id="react-cvc-recollection-cvc-element" ref={cvcElement} />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {updatingCvc ? 'Updating…' : 'Update CVV'}
          </button>
        </div>
      </form>

      <CaptureModal
        message={message?.message}
        error={message?.error}
        onClose={() => setMessage(undefined)}
      />
    </div>
  );
}
