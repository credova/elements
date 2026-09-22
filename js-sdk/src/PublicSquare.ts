import { BasisTheory } from '@basis-theory/basis-theory-js';
import { ELEMENTS_INIT_ERROR_MESSAGE, ELEMENTS_TYPE_NOT_SUPPORTED } from './constants';
import {
  CardElement,
  CardExpirationDateElement,
  CardNumberElement,
  CardVerificationCodeElement,
  CreateCardExpirationDateElementOptions,
  CreateCardNumberElementOptions,
  CreateCardVerificationCodeElementOptions,
  ElementValue,
} from '@basis-theory/basis-theory-js/types/elements';
import { PublicSquareCards } from './cards';
import { PublicSquareBankAccount } from '@/bankAccounts';
import {
  BasisTheoryInstance,
  CreateBankAccountAccountNumberElementOptions,
  CreateBankAccountElementOptions,
  CreateBankAccountRoutingNumberElementOptions,
  CreateBankAccountVerificationElementOptions,
  CreateCardElementOptions,
  CreateElementOptions,
  ElementType,
  ElementTypeEnum,
  PSQTextElement,
  PublicSquareInitOptions,
} from './types';
import { PublicSquareApplePay } from '@/applePay';
import { PublicSquareBankVerification } from './bankAccounts/BankVerification';
import { PublicSquareGooglePay } from '@/googlePay';
import { PublicSquareThreeDs } from '@/threeds';

export class PublicSquare {
  _apiUrl: string = 'https://api.publicsquare.com';
  _apiKey?: string;
  _proxyKey: string = 'key_prod_us_proxy_HiFqDwW49EZ8szKi8cMvQP';
  _testProxyKey?: string;
  _cardCreateUrl?: string;
  _applePayCreateUrl?: string;
  _applePayCreateSessionUrl?: string;
  _bankAccountCreateUrl?: string;
  _bankAccountVerificationUrl?: string;
  _googlePayCreateUrl?: string;
  _getGooglePayConfiguration?: string;
  _btApiBaseUrl: string = 'https://api.basistheory.com';
  _threeDsCreateSessionUrl?: string;
  _public3dsAppKey: string = 'key_prod_us_pub_7cC6EF431x2rKGwsnnuZPP';
  _public3dsTestAppKey?: string;
  // TODO(sc-89255): replace with the real BT Public Application key (token:update only permission)
  // once it's created — see RFC "CVV Recollection for Saved Card", Next Steps #1.
  _cvcUpdateAppKey: string = 'key_prod_us_pub_REPLACE_WITH_CVC_UPDATE_KEY';
  _cvcUpdateTestAppKey: string = 'key_test_us_pub_E6LAPR7H9heqXCc8ENcACq';

  protected _bt?: BasisTheoryInstance;
  get bt(): BasisTheoryInstance | undefined {
    return this._bt;
  }

  _elements: (ElementValue | PSQTextElement)[] = [];

  public cards = new PublicSquareCards(this);
  public applePay = new PublicSquareApplePay(this);
  public bankAccounts = new PublicSquareBankAccount(this);
  public bankVerify = new PublicSquareBankVerification(this);
  public googlePay = new PublicSquareGooglePay(this);
  public threeDs = new PublicSquareThreeDs(this);

  /**
   * Initialize the PublicSquare sdk. (REQUIRED before calling `createElement`)
   * @param apiKey your PublicSquare public key
   * @param options PublicSquareInitOptions see [docs](https://developers.publicsquare.com)
   * @returns class PublicSquare
   */
  public async init(apiKey: string, options?: PublicSquareInitOptions) {
    this._apiKey = apiKey;
    if (options?.apiUrl) this._apiUrl = options?.apiUrl;
    if (options?.proxyKey) this._proxyKey = options?.proxyKey;
    if (options?.testProxyKey) this._testProxyKey = options?.testProxyKey;
    if (options?.cardCreateUrl) this._cardCreateUrl = options?.cardCreateUrl;
    if (options?.bankAccountCreateUrl) this._bankAccountCreateUrl = options?.bankAccountCreateUrl;
    if (options?.bankAccountVerificationUrl)
      this._bankAccountVerificationUrl = options?.bankAccountVerificationUrl;
    if (options?.applePayCreateUrl) this._applePayCreateUrl = options?.applePayCreateUrl;
    if (options?.applePayCreateSessionUrl)
      this._applePayCreateSessionUrl = options?.applePayCreateSessionUrl;
    if (options?.googlePayCreateUrl) this._googlePayCreateUrl = options?.googlePayCreateUrl;
    if (options?.getGooglePayConfiguration)
      this._getGooglePayConfiguration = options?.getGooglePayConfiguration;
    if (options?.threeDsCreateSessionUrl)
      this._threeDsCreateSessionUrl = options?.threeDsCreateSessionUrl;
    if (options?.btApiBaseUrl) this._btApiBaseUrl = options?.btApiBaseUrl;
    if (options?.public3dsAppKey) this._public3dsAppKey = options?.public3dsAppKey;
    if (options?.public3dsTestAppKey) this._public3dsTestAppKey = options?.public3dsTestAppKey;
    if (options?.cvcUpdateAppKey) this._cvcUpdateAppKey = options?.cvcUpdateAppKey;
    if (options?.cvcUpdateTestAppKey) this._cvcUpdateTestAppKey = options?.cvcUpdateTestAppKey;

    const bt = await new BasisTheory().init((Math.random() + 1).toString(36).substring(7), {
      elements: true,
      apiBaseUrl: this._btApiBaseUrl,
    });
    if (!bt) {
      throw new Error(ELEMENTS_INIT_ERROR_MESSAGE);
    }
    this._bt = bt;
    return this;
  }

  private _createElement(
    type: ElementTypeEnum,
    options: CreateElementOptions,
  ): CardElement | CardExpirationDateElement | CardNumberElement | CardVerificationCodeElement {
    if (!this._bt) {
      throw new Error(ELEMENTS_INIT_ERROR_MESSAGE);
    }
    const element = this._bt.createElement(type as any, options as any);
    this._elements.push(element);
    return element;
  }

  /**
   * Initialize a PublicSquare element.
   * @param type {ElementType} 'card' | 'cardExpirationDate' | 'cardNumber' | 'cardVerificationCode' | 'bankAccount' | 'bankAccountRoutingNumber' | 'bankAccountAccountNumber'
   * @param options CreateCardElementOptions see [docs](https://developers.publicsquare.com)
   * @returns created element
   */
  public createElement(type: ElementType, options: CreateElementOptions) {
    switch (type) {
      case ElementTypeEnum.Text:
        return this._createElement(ElementTypeEnum.Text, options);
      case ElementTypeEnum.Card:
        return this.createCardElement(options as CreateCardElementOptions);
      case ElementTypeEnum.CardExpirationDate:
        return this.createCardExpirationDateElement(
          options as CreateCardExpirationDateElementOptions,
        );
      case ElementTypeEnum.CardNumber:
        return this.createCardNumberElement(options as CreateCardNumberElementOptions);
      case ElementTypeEnum.CardVerificationCode:
        return this.createCardVerificationCodeElement(
          options as CreateCardVerificationCodeElementOptions,
        );
      case ElementTypeEnum.BankAccount:
        return this.createBankAccountElement(options as CreateBankAccountElementOptions);
      case ElementTypeEnum.BankAccountVerification:
        return this.createBankAccountVerificationElement(
          options as CreateBankAccountVerificationElementOptions,
        );
      case ElementTypeEnum.BankAccountRoutingNumber:
        return this.createBankAccountRoutingNumberElement(
          options as CreateBankAccountRoutingNumberElementOptions,
        );
      case ElementTypeEnum.BankAccountAccountNumber:
        return this.createBankAccountAccountNumberElement(
          options as CreateBankAccountAccountNumberElementOptions,
        );
      default:
        throw new Error(ELEMENTS_TYPE_NOT_SUPPORTED);
    }
  }

  public createCardElement(options: CreateCardElementOptions) {
    return this._createElement(ElementTypeEnum.Card, options) as CardElement;
  }

  public createCardExpirationDateElement(
    options: Omit<CreateCardExpirationDateElementOptions, 'targetId'>,
  ) {
    return this._createElement(ElementTypeEnum.CardExpirationDate, {
      ...options,
      targetId: 'elementTypesCardExpirationDateElement',
    }) as CardExpirationDateElement;
  }

  public createCardNumberElement(options: Omit<CreateCardNumberElementOptions, 'targetId'>) {
    return this._createElement(ElementTypeEnum.CardNumber, {
      ...options,
      targetId: 'elementTypesCardNumberElement',
    }) as CardNumberElement;
  }

  public createCardVerificationCodeElement(
    options: Omit<CreateCardVerificationCodeElementOptions, 'targetId'>,
  ) {
    return this._createElement(ElementTypeEnum.CardVerificationCode, {
      ...options,
      targetId: 'elementTypesCardVerificationCodeElement',
    }) as CardVerificationCodeElement;
  }

  public createBankAccountElement(
    options?: Parameters<typeof PublicSquareBankAccount.prototype.createElement>[0],
  ) {
    return new PublicSquareBankAccount(this).createElement(options);
  }

  public createBankAccountRoutingNumberElement(
    options: Parameters<
      typeof PublicSquareBankAccount.prototype.createRoutingNumberElement
    >[0] = {},
  ) {
    return new PublicSquareBankAccount(this).createRoutingNumberElement(options);
  }

  public createBankAccountAccountNumberElement(
    options: Parameters<
      typeof PublicSquareBankAccount.prototype.createAccountNumberElement
    >[0] = {},
  ) {
    return new PublicSquareBankAccount(this).createAccountNumberElement(options);
  }

  public createBankAccountVerificationElement(
    options: CreateBankAccountVerificationElementOptions,
  ) {
    return new PublicSquareBankVerification(this).createVerificationElement(options);
  }
}
