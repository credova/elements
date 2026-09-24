'use client';
import { useEffect, useRef, useState } from 'react';
import { PublicSquare } from '@publicsquare/elements-js';
import CaptureModal from '../Modals/CaptureModal';
import { GooglePayButtonWidget } from '@publicsquare/elements-js/googlePay/GooglePayButtonWidget';
import { environment } from '@/config/environments';

export default function GooglePayElementsJs() {
  const [publicsquare, setPublicSquare] = useState<PublicSquare>();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const googlePayButtonRef = useRef<GooglePayButtonWidget>(null);
  const [shippingAddressRequired, setShippingAddressRequired] = useState(false);
  const [message, setMessage] = useState<{
    message?: object;
    error?: boolean;
  }>();

  useEffect(() => {
    new PublicSquare()
      .init(environment.apiKey, { apiUrl: environment.apiUrl })
      .then((_publicsquare) => setPublicSquare(_publicsquare));
  }, []);

  useEffect(() => {
    if (publicsquare && buttonContainerRef.current) {
      buttonContainerRef.current.innerHTML = '';
      googlePayButtonRef.current = publicsquare.googlePay.renderButton(
        buttonContainerRef.current!,
        {
          id: 'google-pay-btn',
          environment: 'TEST',
          merchantName: 'PSQ Merchant Test',
          allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'],
          buttonColor: 'black',
          buttonType: 'buy',
          locale: 'en',
          style: {
            width: '160px',
            height: '40px',
            borderRadius: 4,
            borderType: 'default_border',
          },
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: '1.00',
            currencyCode: 'USD',
            countryCode: 'US',
          },
          shippingAddressRequired,
          onPaymentDataLoaded: async (paymentData) => {
            onPaymentAuthorized(paymentData);
          },
        },
      );
    }
  }, [publicsquare, shippingAddressRequired]);

  async function onPaymentAuthorized(event: any) {
    if (publicsquare && buttonContainerRef.current) {
      googlePayButtonRef.current?.setDisabled(true);

      try {
        const googlePay = await createGooglePay(event);
        if (googlePay) {
          const shippingAddress = event.shippingAddress;
          const shippingAddressPayload = shippingAddress && {
            address_line_1: shippingAddress.address1,
            address_line_2: shippingAddress.address2,
            city: shippingAddress.locality,
            state: shippingAddress.administrativeArea,
            postal_code: shippingAddress.postalCode,
            country_code: shippingAddress.countryCode,
          };
          console.log('shipping_address payload for POST /payments:', shippingAddressPayload);
          setMessage({
            message: {
              ...googlePay,
              billingAddress: event.paymentMethodData?.info?.billingAddress,
              shippingAddress: event.shippingAddress,
              shippingAddressPayload,
              note: shippingAddressPayload
                ? "Pass shippingAddressPayload as shipping_address on POST /payments when creating the payment. This demo stops at payment-method creation, so it's only displayed here."
                : undefined,
            },
            error: !!googlePay.error,
          });
        }
      } catch (e) {
        console.error(e);
      }

      googlePayButtonRef.current?.setDisabled(false);
    }
  }

  async function createGooglePay(event: any) {
    if (publicsquare) {
      try {
        const tokenObj = event.paymentMethodData;
        const response = await publicsquare.googlePay.create({
          google_payment_method_data: tokenObj,
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
      <label>
        <input
          type="checkbox"
          checked={shippingAddressRequired}
          onChange={(e) => setShippingAddressRequired(e.target.checked)}
        />
        Collect shipping address
      </label>
      <div ref={buttonContainerRef}></div>
      <CaptureModal
        message={message?.message}
        onClose={() => setMessage(undefined)}
        error={message?.error}
      />
    </>
  );
}
