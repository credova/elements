import type {
  CreateCardElementOptions as BTCreateCardElementOptions,
  CreateCardExpirationDateElementOptions,
  CreateCardNumberElementOptions,
  CreateCardVerificationCodeElementOptions,
  ElementType as BTElementType,
  BasisTheoryElements,
} from '@basis-theory/basis-theory-js/types/elements';
import { BasisTheory as IBasisTheory } from '@basis-theory/basis-theory-js/types/sdk';
import {
  CreateBankAccountAccountNumberElementOptions,
  CreateBankAccountElementOptions,
  CreateBankAccountRoutingNumberElementOptions,
  CreateBankAccountVerificationElementOptions,
} from '@/types';

export { ElementWrapper } from '@basis-theory/basis-theory-js/types/elements';
export * from '@basis-theory/basis-theory-js/types/elements';

export interface ApplicationInfo {
  name?: string;
  version?: string;
  url?: string;
}

export interface PublicSquareInitOptions {
  apiUrl?: string;
  appInfo?: ApplicationInfo;
}

export type Environment = 'test' | 'production';

export type BankAccountElementTypes =
  | 'bankAccount'
  | 'bankAccountRoutingNumber'
  | 'bankAccountAccountNumber'
  | 'bankAccountVerification';
export type ElementType = BTElementType | BankAccountElementTypes;

export enum ElementTypeEnum {
  Text = 'text',
  Card = 'card',
  CardExpirationDate = 'cardExpirationDate',
  CardNumber = 'cardNumber',
  CardVerificationCode = 'cardVerificationCode',
  BankAccount = 'bankAccount',
  BankAccountRoutingNumber = 'bankAccountRoutingNumber',
  BankAccountAccountNumber = 'bankAccountAccountNumber',
  BankAccountVerification = 'bankAccountVerification',
}

export type CreateCardElementOptions = BTCreateCardElementOptions;

export type CreateElementOptions =
  | CreateCardElementOptions
  | CreateCardExpirationDateElementOptions
  | CreateCardNumberElementOptions
  | CreateCardVerificationCodeElementOptions
  | CreateBankAccountElementOptions
  | CreateBankAccountRoutingNumberElementOptions
  | CreateBankAccountAccountNumberElementOptions
  | CreateBankAccountVerificationElementOptions;

export type BasisTheoryInstance = IBasisTheory & BasisTheoryElements;
