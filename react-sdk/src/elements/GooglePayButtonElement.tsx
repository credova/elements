import React, { useEffect, useRef } from 'react';
import type {
  GooglePayConfiguration,
  GooglePayButtonWidgetOptions,
} from '@publicsquare/elements-js/types';
import { validateGooglePayButtonWidgetOptions } from '@publicsquare/elements-js/validators/index.js';
import { usePublicSquare } from '../core/PublicSquareProvider';

const GooglePayButtonElement: React.FC<GooglePayButtonWidgetOptions> = (props) => {
  const { validated } = validateGooglePayButtonWidgetOptions(props);
  const {
    id,
    environment,
    merchantId,
    merchantName,
    allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
    allowedCardNetworks = ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'],
    buttonColor = 'black',
    buttonType = 'buy',
    locale = 'en',
    style = { width: '160px', height: '40px', borderRadius: 4, borderType: 'default_border' },
    transactionInfo,
    shippingAddressRequired = false,
    shippingAddressParameters,
    disabled = false,
    onClick,
    onPaymentDataLoaded,
  } = validated;
  const containerRef = useRef<HTMLDivElement>(null);
  const { publicsquare } = usePublicSquare();
  const publicSquareRef = useRef(publicsquare);
  useEffect(() => {
    publicSquareRef.current = publicsquare;
  }, [publicsquare]);

  useEffect(() => {
    let paymentsClient: any;

    const baseRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
    };
    const baseCardPaymentMethod = {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks,
        billingAddressRequired: true,
        billingAddressParameters: { format: 'FULL', phoneNumberRequired: true },
      },
    };

    async function setupGooglePayConfiguration(): Promise<GooglePayConfiguration> {
      const psq = publicSquareRef.current;
      if (!psq) {
        throw new Error('PublicSquare SDK not initialized');
      }
      try {
        const config = (await psq.googlePay.getGooglePayConfiguration()) as any;
        if (config.error || !config[environment]) {
          throw new Error('Failed to retrieve Google Pay configuration');
        }
        return config[environment];
      } catch (error) {
        console.error('Error fetching Google Pay configuration:', error);
        throw error;
      }
    }

    async function onGooglePayLoaded() {
      paymentsClient = new (window as any).google.payments.api.PaymentsClient({
        environment: environment,
      });
      const isReadyToPayRequest = Object.assign({}, baseRequest, {
        allowedPaymentMethods: [baseCardPaymentMethod],
      });
      try {
        const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
        if (response.result) {
          createAndAddButton();
        } else {
          console.error('Google Pay is not available.');
        }
      } catch (error) {
        console.error('Error checking readiness:', error);
      }
    }

    function createAndAddButton() {
      if (!paymentsClient || !containerRef.current) return;
      const button = paymentsClient.createButton({
        buttonColor: buttonColor,
        buttonType: buttonType,
        buttonRadius: style.borderRadius,
        buttonBorderType: style.borderType,
        locale: locale,
        buttonSizeMode: 'fill',
        onClick: onGooglePaymentButtonClicked,
        allowedPaymentMethods: [baseCardPaymentMethod],
      });
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(button);

      const actualButton = button.querySelector('button');
      if (actualButton && disabled !== true && typeof onClick === 'function') {
        actualButton.addEventListener('click', onClick);
      }
    }

    async function onGooglePaymentButtonClicked() {
      const googlePayconfiguration = await setupGooglePayConfiguration();
      const tokenizationSpecification = {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: googlePayconfiguration.gateway,
          gatewayMerchantId: googlePayconfiguration.gatewayMerchantId,
        },
      };

      const paymentDataRequest = Object.assign({}, baseRequest, {
        allowedPaymentMethods: [
          Object.assign({}, baseCardPaymentMethod, {
            tokenizationSpecification: tokenizationSpecification,
          }),
        ],
        transactionInfo: {
          totalPriceStatus: transactionInfo.totalPriceStatus,
          totalPrice: transactionInfo.totalPrice,
          currencyCode: transactionInfo.currencyCode,
          countryCode: transactionInfo.countryCode,
        },
        merchantInfo: {
          merchantId: merchantId,
          merchantName: merchantName,
        },
        ...(shippingAddressRequired && {
          shippingAddressRequired: true,
          ...(shippingAddressParameters && { shippingAddressParameters }),
        }),
      });

      try {
        const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
        if (onPaymentDataLoaded) {
          onPaymentDataLoaded(paymentData);
        }
      } catch (error) {
        console.error('Error loading payment data:', error);
      }
    }

    const scriptId = 'google-pay-sdk-script';
    let script: HTMLScriptElement | null = null;
    let createdScript = false;
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existingScript) {
      if ((window as any).google?.payments?.api) {
        onGooglePayLoaded();
      } else {
        existingScript.addEventListener('load', onGooglePayLoaded, { once: true });
      }
    } else {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = onGooglePayLoaded;
      document.body.appendChild(script);
      createdScript = true;
    }

    return () => {
      if (createdScript && script) {
        document.body.removeChild(script);
      }
      if (containerRef.current) {
        const button = containerRef.current.querySelector('button');
        if (button && typeof onClick === 'function') {
          button.removeEventListener('click', onClick);
        }
        containerRef.current.innerHTML = '';
      }
    };
  }, [shippingAddressRequired, shippingAddressParameters]);

  const updateButtonStyle = (button?: Element | null, disabled?: boolean): void => {
    const cursor = disabled === true ? 'not-allowed' : 'pointer';
    const opacity = disabled === true ? '0.5' : '1';
    button?.setAttribute('style', `cursor: ${cursor}; opacity: ${opacity};`);
    if (disabled) {
      button?.setAttribute('disabled', 'true');
    } else {
      button?.removeAttribute('disabled');
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const button = containerRef.current.querySelector('div > div > button');
      updateButtonStyle(button, disabled);
    }
  }, [disabled, containerRef.current]);

  return (
    <div ref={containerRef} id={id} style={{ width: style.width, height: style.height }}></div>
  );
};

export default GooglePayButtonElement;
