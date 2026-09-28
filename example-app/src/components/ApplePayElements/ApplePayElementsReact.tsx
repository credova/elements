'use client';
import { useState } from 'react';
import { PublicSquareProvider, usePublicSquare } from '@publicsquare/elements-react';
import ApplePayButtonElement from '@publicsquare/elements-react/elements/ApplePayButtonElement';
import CaptureModal from '../Modals/CaptureModal';
import { environment } from '@/config/environments';

declare global {
  interface Window {
    ApplePaySession: any;
  }
}

export default function ApplePayElementsReact() {
  return (
    /*
     * Step 1: Init the PublicSquare sdk
     */
    <PublicSquareProvider apiKey={environment.apiKey} options={{ apiUrl: environment.apiUrl }}>
      <Elements />
    </PublicSquareProvider>
  );
}

function Elements() {
  const { publicsquare } = usePublicSquare();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    message?: object;
    error?: boolean;
  }>();

  async function onSubmitApplePay() {
    if (!window.ApplePaySession) {
      return;
    }

    /*
     * Step 2: Create an Apple Pay session
     */
    const session = createApplePaySession();

    session.onvalidatemerchant = async () => {
      /*
       * Step 3: Validate merchant's CSR with Apple Pay session
       */
      const merchantSession = await validateMerchant();
      session.completeMerchantValidation(merchantSession);
    };

    session.onpaymentauthorized = async (event: any) => {
      if (publicsquare) {
        setLoading(true);

        try {
          /*
           * Step 4: Create an Apple Pay payment method
           */
          const applePay = await createApplePay(event);
          if (applePay) {
            setMessage({
              message: applePay,
              error: !!applePay.error,
            });
          }

          /*
           * Step 5: Complete the Apple Pay session
           */
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
        } catch (e) {
          console.error(e);
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        }

        setLoading(false);
      }
    };

    session.begin();
  }

  function createApplePaySession() {
    return new window.ApplePaySession(3, {
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ['supports3DS'],
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
      requiredBillingContactFields: ['postalAddress', 'phone'],
      requiredShippingContactFields: ['postalAddress', 'phone'],
      total: {
        label: 'Demo (Card is not charged)',
        type: 'final',
        amount: '1.00',
      },
    });
  }

  async function validateMerchant() {
    try {
      return await publicsquare?.applePay.createSession({
        display_name: 'PublicSquare Payments Demo',
        domain: window.location.host,
      });
    } catch (error) {
      console.error('Error validating merchant:', error);
      throw error;
    }
  }

  async function createApplePay(event: any) {
    if (publicsquare) {
      try {
        const response = await publicsquare.applePay.create({
          apple_payment_data: event.payment,
        });
        if (response) {
          return response;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <>
      <ApplePayButtonElement id="apple-pay-element" disabled={loading} onClick={onSubmitApplePay} />
      <CaptureModal
        message={message?.message}
        onClose={() => setMessage(undefined)}
        error={message?.error}
      />
    </>
  );
}
