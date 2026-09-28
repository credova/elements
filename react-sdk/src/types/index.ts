import {
  ApplePayCreateResponse,
  ApplePayCreateErrorResponse,
  ApplePayCreateInput,
  ApplePayCreateSessionInput,
  ApplePayPayment,
  ApplePayPaymentToken,
  ApplePayPaymentData,
  ApplePayPaymentMethod,
  ApplePayPaymentDataHeader,
  ApplePayPaymentContact,
  ApplePayPaymentPass,
  BankAccountAccountNumberElement,
  BankAccountCreateErrorResponse,
  BankAccountCreateResponse,
  BankAccountCreateInput,
  BankAccountElement,
  BankAccountHolderType,
  BankAccountRoutingNumberElement,
  BankAccountVerificationElement,
  BankAccountVerificationIdResponse,
  Card,
  CardBillingDetails,
  CardErrorResponse,
  CardCreateErrorResponse,
  CardCreateInput,
  CardCreateResponse,
  CardUpdateCvcResponse,
  CardElement,
  CardExpirationDateElement,
  CardNumberElement,
  CardVerificationCodeElement,
  CreateBankAccountAccountNumberElementOptions,
  CreateBankAccountElementOptions,
  CreateBankAccountRoutingNumberElementOptions,
  CreateBankAccountVerificationElementOptions,
  CreateCardExpirationDateElementOptions,
  CreateCardNumberElementOptions,
  CreateCardVerificationCodeElementOptions,
  CreateElementOptions,
  ElementType,
  PublicSquareInitOptions,
  ValidatedApplePayCreateInput,
  ValidatedApplePayCreateSessionInput,
  ValidatedCardCreateInput,
  ValidatedCardsCreateInput,
  CardsCreateInput,
  GooglePayCreateInput,
  ValidatedGooglePayCreateInput,
  ValidateGooglePayButtonWidgetOptions,
  GooglePaymentMethodData,
  GooglePayCreateResponse,
  GooglePayCreateErrorResponse,
} from '@publicsquare/elements-js/types';
import { PublicSquare } from '@publicsquare/elements-js';

export type PublicSquareProviderValue = {
  publicsquare?: PublicSquare;
  createElement(
    type: ElementType,
    options: CreateElementOptions,
  ): ReturnType<InstanceType<typeof PublicSquare>['createElement']>;
};

export type PublicSquareProviderProps = {
  apiKey: string;
  options?: PublicSquareInitOptions;
};

export type ElementProps = {
  id: string;
  type: ElementType;
  options?: CreateElementOptions;
};

export type CardElementProps = {
  id: string;
};

export type CardNumberElementProps = {
  id: string;
};

export type CardExpirationDateElementProps = {
  id: string;
};

export type CardVerificationCodeElementProps = {
  id: string;
};

export type BankAccountElementProps = {
  id: string;
} & CreateBankAccountElementOptions;

export type BankAccountVerificationElementProps = {
  id: string;
  onVerificationComplete?: (result: BankAccountVerificationIdResponse) => void;
} & CreateBankAccountVerificationElementOptions;

export type BankAccountRoutingNumberElementProps = {
  id: string;
} & CreateBankAccountRoutingNumberElementOptions;

export type BankAccountAccountNumberElementProps = {
  id: string;
} & CreateBankAccountAccountNumberElementOptions;

export type ApplePayButtonElement = React.Ref<HTMLDivElement>;

export type ApplePayButtonElementProps = {
  id: string;
  buttonStyle?: 'black' | 'white' | 'white-outline';
  type?:
    | 'plain'
    | 'add-money'
    | 'book'
    | 'buy'
    | 'check-out'
    | 'continue'
    | 'contribute'
    | 'donate'
    | 'order'
    | 'pay'
    | 'reload'
    | 'rent'
    | 'set-up'
    | 'subscribe'
    | 'support'
    | 'tip'
    | 'top-up';
  locale?: string;
  onClick?: () => void;
  style?: {
    width?: string;
    height?: string;
    borderRadius?: string;
    padding?: string;
  };
  disabled?: boolean;
};

export type GooglePayButtonElement = React.Ref<HTMLDivElement>;

export {
  ApplePayCreateResponse,
  ApplePayCreateErrorResponse,
  ApplePayCreateInput,
  ApplePayCreateSessionInput,
  ApplePayPayment,
  ApplePayPaymentToken,
  ApplePayPaymentData,
  ApplePayPaymentMethod,
  ApplePayPaymentDataHeader,
  ApplePayPaymentContact,
  ApplePayPaymentPass,
  CardElement,
  CreateBankAccountAccountNumberElementOptions,
  BankAccountAccountNumberElement,
  BankAccountElement,
  BankAccountVerificationElement,
  CreateBankAccountElementOptions,
  BankAccountRoutingNumberElement,
  CreateBankAccountRoutingNumberElementOptions,
  CardExpirationDateElement,
  CreateCardExpirationDateElementOptions,
  CardNumberElement,
  CreateCardNumberElementOptions,
  CardVerificationCodeElement,
  CreateCardVerificationCodeElementOptions,
  ElementType,
  CreateElementOptions,
  PublicSquareInitOptions,
  Card,
  CardCreateInput,
  CardsCreateInput,
  CardCreateResponse,
  CardUpdateCvcResponse,
  CardBillingDetails,
  ValidatedApplePayCreateInput,
  ValidatedApplePayCreateSessionInput,
  ValidatedCardCreateInput,
  ValidatedCardsCreateInput,
  CardErrorResponse,
  CardCreateErrorResponse,
  BankAccountCreateErrorResponse,
  BankAccountCreateResponse,
  BankAccountCreateInput,
  BankAccountHolderType,
  CreateBankAccountVerificationElementOptions,
  GooglePayCreateInput,
  ValidatedGooglePayCreateInput,
  ValidateGooglePayButtonWidgetOptions,
  GooglePaymentMethodData,
  GooglePayCreateResponse,
  GooglePayCreateErrorResponse,
};
