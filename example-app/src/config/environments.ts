import { PublicSquareInitOptions } from '@publicsquare/elements-js/types';

type EnvironmentOptions = {
  bankAccount: Pick<PublicSquareInitOptions, 'bankAccountCreateUrl'>;
  bankVerification: Pick<
    PublicSquareInitOptions,
    'bankAccountCreateUrl' | 'bankAccountVerificationUrl'
  >;
  applePay: Pick<PublicSquareInitOptions, 'applePayCreateSessionUrl' | 'applePayCreateUrl'>;
  googlePay: Pick<PublicSquareInitOptions, 'googlePayCreateUrl' | 'getGooglePayConfiguration'>;
  threeDs: Pick<
    PublicSquareInitOptions,
    'threeDsCreateSessionUrl' | 'btApiBaseUrl' | 'public3dsAppKey' | 'public3dsTestAppKey'
  >;
  apiKey: string;
  apiUrl: string;
};

const staging: EnvironmentOptions = {
  apiUrl: 'https://staging.api.publicsquare.com',
  apiKey: process.env.NEXT_PUBLIC_PUBLICSQUARE_KEY!,
  bankAccount: {
    bankAccountCreateUrl: 'https://staging.api.publicsquare.com/payment-methods/bank-accounts',
  },
  bankVerification: {
    bankAccountCreateUrl: 'https://staging.api.publicsquare.com/payment-methods/bank-accounts',
    bankAccountVerificationUrl:
      'https://staging.api.publicsquare.com/payment-methods/bank-accounts/verification',
  },
  applePay: {
    applePayCreateSessionUrl:
      'https://staging.api.publicsquare.com/payment-methods/apple-pay/session',
    applePayCreateUrl: 'https://staging.api.publicsquare.com/payment-methods/apple-pay',
  },
  googlePay: {
    googlePayCreateUrl: 'https://staging.api.publicsquare.com/payment-methods/google-pay',
    getGooglePayConfiguration:
      'https://staging.api.publicsquare.com/.well-known/google-pay-configuration',
  },
  threeDs: {
    btApiBaseUrl: 'https://api.test.basistheory.com',
    public3dsTestAppKey: 'key_test_us_pub_Tkia8nWTAWwFZ8QJyUJvES',
    threeDsCreateSessionUrl: 'https://staging.api.publicsquare.com/three-d-secure/sessions',
  },
};

const production: EnvironmentOptions = {
  apiUrl: 'https://api.publicsquare.com',
  apiKey: process.env.NEXT_PUBLIC_PUBLICSQUARE_KEY!,
  bankAccount: {
    bankAccountCreateUrl: 'https://api.publicsquare.com/payment-methods/bank-accounts',
  },
  bankVerification: {
    bankAccountCreateUrl: 'https://api.publicsquare.com/payment-methods/bank-accounts',
    bankAccountVerificationUrl:
      'https://api.publicsquare.com/payment-methods/bank-accounts/verification',
  },
  applePay: {
    applePayCreateSessionUrl: 'https://api.publicsquare.com/payment-methods/apple-pay/session',
    applePayCreateUrl: 'https://api.publicsquare.com/payment-methods/apple-pay',
  },
  googlePay: {
    googlePayCreateUrl: 'https://api.publicsquare.com/payment-methods/google-pay',
    getGooglePayConfiguration: 'https://api.publicsquare.com/.well-known/google-pay-configuration',
  },
  threeDs: {
    btApiBaseUrl: 'https://api.basistheory.com',
    public3dsAppKey: 'key_prod_us_pub_7cC6EF431x2rKGwsnnuZPP',
    threeDsCreateSessionUrl: 'https://api.publicsquare.com/three-d-secure/sessions',
  },
};

// Switch between 'staging' and 'production' here to change all payment method URLs at once
//NEXT_PUBLIC_PUBLICSQUARE_KEY - change for staging or production value in the .env
export const environment = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' ? staging : production;
