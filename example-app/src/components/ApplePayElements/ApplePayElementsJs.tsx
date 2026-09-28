'use client';
import { useEffect, useRef, useState } from 'react';
import { PublicSquare } from '@publicsquare/elements-js';
import CaptureModal from '../Modals/CaptureModal';
import { environment } from '@/config/environments';

declare global {
  var ApplePaySession: any;
}

export default function ApplePayElementsJs() {
  const [publicsquare, setPublicSquare] = useState<PublicSquare>();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<{
    message?: object;
    error?: boolean;
  }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    /*
     * Step 1: Init the PublicSquare sdk
     */
    new PublicSquare()
      .init(environment.apiKey, { apiUrl: environment.apiUrl })
      .then((_publicsquare) => setPublicSquare(_publicsquare));
  }, []);

  useEffect(() => {
    if (publicsquare && buttonContainerRef.current) {
      /*
       * Step 2: Render the Apple Pay button
       */
      publicsquare.applePay.renderButton(buttonContainerRef.current!, {
        id: 'apple-pay-btn',
        buttonStyle: 'black',
        type: 'buy',
        locale: 'en-US',
        disabled: loading,
        onClick: onSubmitApplePay,
      });
    }
  }, [publicsquare]);

  function onSubmitApplePay() {
    if (!ApplePaySession) {
      return;
    }

    /*
     * Step 3: Create an Apple Pay session
     */
    const session = createApplePaySession();

    session.onvalidatemerchant = async () => {
      /*
       * Step 4: Validate merchant's CSR with Apple Pay session
       */
      const merchantSession = await validateMerchant();
      session.completeMerchantValidation(merchantSession);
    };

    session.onpaymentauthorized = async (event: any) => {
      if (publicsquare && buttonContainerRef.current) {
        setLoading(true);

        try {
          /*
           * Step 5: Create an Apple Pay payment method
           */
          const applePay = await createApplePay(event);
          if (applePay) {
            setMessage({
              message: applePay,
              error: !!applePay.error,
            });
          }

          /*
           * Step 6: Complete the Apple Pay session
           */
          session.completePayment(ApplePaySession.STATUS_SUCCESS);
        } catch (e) {
          console.error(e);
          session.completePayment(ApplePaySession.STATUS_FAILURE);
        }

        setLoading(false);
      }
    };

    session.begin();
  }

  function createApplePaySession() {
    return new ApplePaySession(3, {
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
      <div ref={buttonContainerRef}></div>
      <CaptureModal
        message={message?.message}
        onClose={() => setMessage(undefined)}
        error={message?.error}
      />
    </>
  );
}
