'use client';
import { FormEvent, useEffect, useState } from 'react';
import { PublicSquare } from '@publicsquare/elements-js';
import { CardVerificationCodeElement } from '@publicsquare/elements-js/types';
import CaptureModal from '@/components/Modals/CaptureModal';
import { environment } from '@/config/environments';

export default function CvcRecollectionJs() {
  const [publicsquare, setPublicSquare] = useState<PublicSquare>();
  const [cvcElement, setCvcElement] = useState<CardVerificationCodeElement>();

  const [updatingCvc, setUpdatingCvc] = useState(false);
  const [message, setMessage] = useState<{ message?: object; error?: boolean }>();

  useEffect(() => {
    new PublicSquare()
      .init(environment.apiKey, { apiUrl: environment.apiUrl })
      .then((_publicsquare) => setPublicSquare(_publicsquare));
  }, []);

  useEffect(() => {
    if (!publicsquare || cvcElement) return;
    requestAnimationFrame(() => {
      const element = publicsquare.createCardVerificationCodeElement({});
      element.mount('#js-cvc-recollection-cvc-element');
      setCvcElement(element);
    });
  }, [publicsquare, cvcElement]);

  async function onUpdateCvc(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (updatingCvc || !publicsquare || !cvcElement) return;
    const formData = new FormData(e.currentTarget);
    const cardToken = formData.get('card_token') as string;
    if (!cardToken) return;

    setUpdatingCvc(true);
    try {
      const response = await publicsquare.cards.updateCvc(cardToken, cvcElement);
      setMessage({ message: response, error: !!response.error });
    } catch (error) {
      setMessage({ message: { error: String(error) }, error: true });
    }
    setUpdatingCvc(false);
  }

  return (
    <div className="w-full space-y-4">
      <form onSubmit={onUpdateCvc} name="js-cvc-recollection-cvc-form" className="space-y-4">
        <div>
          <label htmlFor="js-cvc-recollection-card-token">Card token</label>
          <input
            id="js-cvc-recollection-card-token"
            name="card_token"
            placeholder="e.g. 20713d75-6764-4818-9394-4ac47f1b4238"
            required
            className="mt-2 block w-full rounded-lg border-0 bg-white px-4 py-3 shadow placeholder:text-gray-400 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            The Basis Theory <code>token</code> from the card create/get response — not the card{' '}
            <code>id</code>. BT needs the token to attach the CVC to the right card.
          </p>
        </div>
        <div className="space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-4">
          <label>CVV</label>
          <div
            className="w-full rounded-lg bg-white p-2 shadow"
            id="js-cvc-recollection-cvc-element"
          ></div>
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
