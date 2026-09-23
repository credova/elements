'use client';
import { FormEvent, useEffect, useState } from 'react';
import { PublicSquare } from '@publicsquare/elements-js';
import SubmitButton from '@/components/SubmitButton';
import {
  CardElement,
  CardExpirationDateElement,
  CardNumberElement,
  CardVerificationCodeElement,
  CardsCreateInput,
} from '@publicsquare/elements-js/types';
import NameInput from '@/components/Form/NameInput';
import CaptureModal from '@/components/Modals/CaptureModal';
import { environment } from '@/config/environments';

export default function CardElementsJs({ allInOne }: { allInOne: boolean }) {
  const [publicsquare, setPublicSquare] = useState<PublicSquare>();
  const [cardElement, setCardElement] = useState<CardElement>();
  const [cardNumberElement, setCardNumberElement] = useState<CardNumberElement>();
  const [cardExpirationDateElement, setCardExpirationDateElement] =
    useState<CardExpirationDateElement>();
  const [cardVerificationCodeElement, setCardVerificationCodeElement] =
    useState<CardVerificationCodeElement>();
  const [message, setMessage] = useState<{
    message?: object;
    error?: boolean;
  }>();
  const [loading, setLoading] = useState(false);

  function unmountElements() {
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

  useEffect(() => {
    /**
     * Step 1: Init the PublicSquare sdk
     */
    new PublicSquare()
      .init(environment.apiKey, { apiUrl: environment.apiUrl })
      .then((_publicsquare) => setPublicSquare(_publicsquare));
  }, []);

  useEffect(() => {
    if (publicsquare) {
      // This is to make sure the DOM is updated before we mount the elements
      requestAnimationFrame(() => {
        unmountElements();
        if (allInOne) {
          /**
           * Step 2: Initialize the elements you want to use
           */
          // The whole card
          const cardElement = publicsquare.createCardElement({});
          cardElement.mount('#card-element');
          setCardElement(cardElement);
        } else {
          // Just the number
          const cardNumberElement = publicsquare.createCardNumberElement({});
          cardNumberElement.mount('#card-number-element');
          setCardNumberElement(cardNumberElement);
          // Just the expiration date
          const cardExpirationDateElement = publicsquare.createCardExpirationDateElement({});
          cardExpirationDateElement.mount('#card-expiration-date-element');
          setCardExpirationDateElement(cardExpirationDateElement);
          // Just the verification code
          const cardVerificationCodeElement = publicsquare.createCardVerificationCodeElement({});
          cardVerificationCodeElement.mount('#card-verification-code-element');
          setCardVerificationCodeElement(cardVerificationCodeElement);
        }
      });
    }
  }, [publicsquare, allInOne]);

  function onSubmitCardElement(e: FormEvent<HTMLFormElement>) {
    if (cardElement) {
      onSubmit(e, cardElement);
    }
  }

  function onSubmitCardElements(e: FormEvent<HTMLFormElement>) {
    if (cardNumberElement && cardExpirationDateElement && cardVerificationCodeElement) {
      onSubmit(e, {
        number: cardNumberElement!,
        expirationMonth: cardExpirationDateElement!.month(),
        expirationYear: cardExpirationDateElement!.year(),
        cvc: cardVerificationCodeElement!,
      });
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>, card: CardsCreateInput['card']) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formProps = Object.fromEntries(formData);
    if (loading) return;
    if (formProps.cardholder_name && card) {
      setLoading(true);
      try {
        const response = await publicsquare?.cards.create(
          {
            cardholder_name: formProps.cardholder_name as string,
            card,
          },
        );
        if (response) {
          setMessage({
            message: response,
            error: !!response.error,
          });
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <form
        onSubmit={(e) => (allInOne ? onSubmitCardElement(e) : onSubmitCardElements(e))}
        name="js-form-cardelement"
      >
        <div className="w-full space-y-4">
          <NameInput />
          {allInOne ? (
            <div className="space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-4">
              <label>Card element</label>
              <div className="w-full rounded-lg bg-white p-2 shadow" id="card-element"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 items-start gap-4 rounded-lg border-2 border-dashed border-gray-300 p-4">
              <div>
                <label>Card number element</label>
                <div
                  className="w-full rounded-lg bg-white p-2 shadow"
                  id="card-number-element"
                ></div>
              </div>
              <div className="grid grid-cols-2 items-start gap-4">
                <div>
                  <label>Expiration</label>
                  <div
                    className="w-full rounded-lg bg-white p-2 shadow"
                    id="card-expiration-date-element"
                  ></div>
                </div>
                <div>
                  <label>CVC</label>
                  <div
                    className="w-full rounded-lg bg-white p-2 shadow"
                    id="card-verification-code-element"
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <SubmitButton loading={loading} elementType="card" />
          </div>
        </div>
      </form>
      <CaptureModal
        message={message?.message}
        onClose={() => setMessage(undefined)}
        error={message?.error}
      />
    </div>
  );
}
