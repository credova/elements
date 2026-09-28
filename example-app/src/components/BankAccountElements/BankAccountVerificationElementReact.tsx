'use client';
import CaptureModal from '@/components/Modals/CaptureModal';
import SubmitButton from '@/components/SubmitButton';
import {
  BankAccountVerificationElement,
  PublicSquareProvider,
  usePublicSquare,
} from '@publicsquare/elements-react';
import PublicSquareTypes from '@publicsquare/elements-react/types/sdk';
import { FormEvent, useRef, useState } from 'react';
import { environment } from '@/config/environments';

export default function BankAccountVerificationElementReact() {
  return (
    <PublicSquareProvider apiKey={environment.apiKey} options={{ apiUrl: environment.apiUrl }}>
      <Elements />
    </PublicSquareProvider>
  );
}

function Elements() {
  //Used only to refresh the modal to create bank account after verification
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    message?: object;
    error?: boolean;
  }>();

  //Element items
  const { publicsquare } = usePublicSquare();
  const [bankAccountVerificationId, setBankAccountVerificationId] = useState<string>();
  const bankAccountVerificationElement =
    useRef<PublicSquareTypes.BankAccountVerificationElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!bankAccountVerificationId) {
        setMessage({
          message: { message: 'Finish verification steps' },
          error: true,
        });
      } else if (!loading) {
        setLoading(true);
        const bankAccount = await publicsquare?.bankAccounts.create({
          bank_account_verification_id: bankAccountVerificationId,
        });
        setMessage({
          message: bankAccount,
          error: false,
        });
      } else {
        setMessage({
          message: { message: 'Verification in progress, please wait' },
          error: true,
        });
      }
    } catch (error) {
      console.error('Error creating bank account:', error);
      setMessage({
        message: error as object,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="w-full space-y-4">
        <div className="space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-4">
          <label>Bank account verification element</label>
          <BankAccountVerificationElement
            ref={bankAccountVerificationElement}
            id="react-bank-account-verification-element"
            className="space-x-4"
            onVerificationComplete={(result) => {
              setBankAccountVerificationId(result.bank_account_verification_id);
            }}
          />
        </div>
        <form onSubmit={handleSubmit} name="react-form-bank-account-verification-element">
          <div className="flex justify-end">
            <SubmitButton loading={loading} elementType="bankAccount" />
          </div>
        </form>
      </div>
      <CaptureModal
        message={message?.message}
        onClose={() => setMessage(undefined)}
        error={message?.error}
      />
    </div>
  );
}
