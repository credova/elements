'use client';
import { useEffect, useRef, useState } from 'react';
import { PublicSquareProvider, usePublicSquare } from '@publicsquare/elements-react';
import GooglePayButtonElement from '@publicsquare/elements-react/elements/GooglePayButtonElement';
import CaptureModal from '../Modals/CaptureModal';
import { environment } from '@/config/environments';

export default function GooglePayElementsReact() {
  return (
    <PublicSquareProvider apiKey={environment.apiKey} options={{ apiUrl: environment.apiUrl }}>
      <Elements />
    </PublicSquareProvider>
  );
}

function Elements() {
  const { publicsquare } = usePublicSquare();
  const [loading, setLoading] = useState(false);
  const [shippingAddressRequired, setShippingAddressRequired] = useState(false);
  const [message, setMessage] = useState<{
    message?: object;
    error?: boolean;
  }>();

  const publicsquareRef = useRef(publicsquare);
  useEffect(() => {
    publicsquareRef.current = publicsquare;
  }, [publicsquare]);

  async function createGooglePay(event: any) {
    const psq = publicsquareRef.current;
    if (psq) {
      try {
        const tokenObj = event.paymentMethodData;
        const response = await psq.googlePay.create({
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

  async function onPaymentAuthorized(event: any) {
    setLoading(true);
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
    setLoading(false);
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
      <GooglePayButtonElement
        id="google-pay-element"
        environment="TEST"
        merchantName="PSQ Merchant Test"
        allowedCardAuthMethods={['PAN_ONLY', 'CRYPTOGRAM_3DS']}
        allowedCardNetworks={['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']}
        buttonColor="black"
        buttonType="buy"
        locale="en"
        style={{
          width: '160px',
          height: '40px',
          borderRadius: 4,
          borderType: 'default_border',
        }}
        transactionInfo={{
          totalPriceStatus: 'FINAL',
          totalPrice: '1.00',
          currencyCode: 'USD',
          countryCode: 'US',
        }}
        shippingAddressRequired={shippingAddressRequired}
        disabled={loading}
        onPaymentDataLoaded={async (paymentData: any) => {
          onPaymentAuthorized(paymentData);
        }}
      />
      <CaptureModal
        message={message?.message}
        onClose={() => setMessage(undefined)}
        error={message?.error}
      />
    </>
  );
}
