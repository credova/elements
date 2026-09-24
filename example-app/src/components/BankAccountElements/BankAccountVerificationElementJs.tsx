'use client';
import { FormEvent, useState } from 'react';
import { PublicSquare } from '@publicsquare/elements-js';
import SubmitButton from '@/components/SubmitButton';
import { BankAccountVerificationIdResponse } from '@publicsquare/elements-js/types';
import CaptureModal from '@/components/Modals/CaptureModal';
import Button from '../Buttons/Button';
import { environment } from '@/config/environments';

//Element items
let publicSquare: PublicSquare;
let bankAccountId: BankAccountVerificationIdResponse | undefined;
export default function BankAccountVerificationElementJs() {
  //Used only to refresh the modal to create bank account after verification
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    message?: object;
    error?: boolean;
  }>();

  //Create public square instance and load element
  async function loadElement() {
    //Element Container
    const target = '#bank-account-verification-element';

    //Optional - Clear out container
    const container = document.querySelector(target);
    if (container) {
      container.innerHTML = '';
    }

    //Init public square
    publicSquare = new PublicSquare();
    await publicSquare.init(environment.apiKey, { apiUrl: environment.apiUrl });

    //Open verification element in container and Get data back
    bankAccountId = await publicSquare.bankVerify.openVerification(target);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (!bankAccountId) {
        setMessage({
          message: { message: 'Finish verification steps' },
          error: true,
        });
      } else if (!loading) {
        setLoading(true);
        const bankAccount = await publicSquare?.bankAccounts.create({
          bank_account_verification_id: bankAccountId?.bank_account_verification_id,
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
  }

  return (
    <div className="w-full space-y-4">
      <div className="w-full space-y-4">
        <div className="space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-4">
          <label>Bank Account Verification element</label>
          <div className="w-full overflow-hidden bg-white">
            <div id="bank-account-verification-element">
              <Button onClick={loadElement} className="mb-4">
                Open verification element
              </Button>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={(e) => onSubmit(e)} name="js-form-bank-account-verification-element">
        <div className="flex justify-end">
          <SubmitButton loading={loading} elementType="bankAccount" />
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
