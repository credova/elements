'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import SubmitButton from '@/components/SubmitButton';
import { PublicSquare } from '@publicsquare/elements-js';
import {
  BankAccountCreateInput,
  BankAccountElement,
  BankAccountRoutingNumberElement,
  BankAccountAccountNumberElement,
} from '@publicsquare/elements-js/types/sdk';
import NameInput from '@/components/Form/NameInput';
import CaptureModal from '@/components/Modals/CaptureModal';
import { environment } from '@/config/environments';

export default function BankAccountElementsJs({ allInOne }: { allInOne: boolean }) {
  const [publicsquare, setPublicSquare] = useState<PublicSquare>();
  const bankAccountRef = useRef<HTMLDivElement>(null);
  const [bankAccountElement, setBankAccountElement] = useState<BankAccountElement>();
  const [routingNumberElement, setRoutingNumberElement] =
    useState<BankAccountRoutingNumberElement>();
  const [accountNumberElement, setAccountNumberElement] =
    useState<BankAccountAccountNumberElement>();
  const [message, setMessage] = useState<{
    message?: object;
    error?: boolean;
  }>();
  const [loading, setLoading] = useState(false);

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
      if (allInOne && !bankAccountRef.current?.children.length) {
        /**
         * Step 2: Initialize the elements you want to use
         */
        // The whole card
        const bankAccountElement = publicsquare.createBankAccountElement({
          routingNumberOptions: {
            className:
              'block w-full border-0 px-4 py-3 placeholder:text-gray-400 focus:outline-none',
          },
          accountNumberOptions: {
            className:
              'block w-full border-0 px-4 py-3 placeholder:text-gray-400 focus:outline-none',
          },
        });
        bankAccountElement.mount('#bank-account-element');
        setBankAccountElement(bankAccountElement);
      } else if (!allInOne) {
        const routingNumberElement = publicsquare.createBankAccountRoutingNumberElement({
          placeholder: 'Routing number',
          className:
            'block w-full border-0 px-4 py-3 placeholder:text-gray-400 rounded-lg bg-white shadow focus:outline-none',
        });
        routingNumberElement.mount('#routing-number-element');
        setRoutingNumberElement(routingNumberElement);

        const accountNumberElement = publicsquare.createBankAccountAccountNumberElement({
          placeholder: 'Account number',
          className:
            'block w-full border-0 px-4 py-3 placeholder:text-gray-400 rounded-lg bg-white shadow focus:outline-none',
        });
        accountNumberElement.mount('#account-number-element');
        setAccountNumberElement(accountNumberElement);
      }
    }
  }, [publicsquare, allInOne]);

  function onSubmitBankAccountElement(e: FormEvent<HTMLFormElement>) {
    if (bankAccountElement) {
      onSubmit(e, {
        account_number: bankAccountElement.accountNumber.el.value,
        routing_number: bankAccountElement.routingNumber.el.value,
      });
    }
  }

  function onSubmitBankAccountElements(e: FormEvent<HTMLFormElement>) {
    if (accountNumberElement && routingNumberElement) {
      onSubmit(e, {
        account_number: accountNumberElement.el.value,
        routing_number: routingNumberElement.el.value,
      });
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>, data: BankAccountCreateInput) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formProps = Object.fromEntries(formData);

    if (loading) return;
    if (publicsquare && 'account_number' in data && 'routing_number' in data) {
      setLoading(true);
      try {
        const response = await publicsquare.bankAccounts.create({
          ...data,
          account_holder_name: formProps.name as string,
        });
        setMessage({
          message: response.error ? response.error : response,
          error: !!response.error,
        });
      } catch (error) {
        console.error('Error creating bank account:', error);
      }
      setLoading(false);
    }
  }
  return (
    <div className="w-full space-y-4">
      <form
        onSubmit={(e) =>
          allInOne ? onSubmitBankAccountElement(e) : onSubmitBankAccountElements(e)
        }
        name="js-form-bank-account-element"
      >
        <div className="w-full space-y-4">
          <NameInput />
          {allInOne ? (
            <div className="space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-4">
              <label>Bank Account element</label>
              <div className="w-full overflow-hidden rounded-lg bg-white shadow">
                <div id="bank-account-element" ref={bankAccountRef}></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 items-start gap-4 rounded-lg border-2 border-dashed border-gray-300 p-4">
              <div className="space-y-2">
                <label>Bank Account routing number element</label>
                <div id="routing-number-element"></div>
              </div>
              <div className="space-y-2">
                <label>Bank Account account number element</label>
                <div id="account-number-element"></div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <SubmitButton loading={loading} elementType="bankAccount" />
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
