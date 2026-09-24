import {
  ELEMENTS_NOM_DOM_ERROR_MESSAGE,
  ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE,
  ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_ROUTING_NUMBER_LOAD_ERROR_MESSAGE,
  ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_ACCOUNT_NUMBER_LOAD_ERROR_MESSAGE,
  ELEMENTS_SCRIPT_UNKNOWN_ERROR_MESSAGE,
  API_ENDPOINTS,
} from '@/constants';
import { PublicSquare } from '@/PublicSquare';
import {
  BankAccountAccountNumberElement,
  BankAccountCreateInput,
  BankAccountCreateResponse,
  BankAccountElement,
  BankAccountRoutingNumberElement,
  CreateBankAccountAccountNumberElementOptions,
  CreateBankAccountElementOptions,
  CreateBankAccountRoutingNumberElementOptions,
  InputElementOptions,
  PSQTextElement,
} from '@/types/sdk';
import { transformCreateBankAccountInput } from '@/utils';
import { validateCreateBankAccountInput, validateRoutingNumber } from '@/validators';

function createInputElement({
  placeholder,
  value,
  className,
  required = true,
  pattern,
  patternError,
  onValidate,
}: InputElementOptions): PSQTextElement {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder ?? '';
  input.value = value ?? '';
  input.className = ['publicsquare-element-input', ...(className?.split(' ') ?? [])].join(' ');
  input.required = required;
  if (pattern) {
    input.pattern = pattern;
  }

  input.addEventListener('invalid', (e) => {
    if (onValidate && !onValidate(input.value)) {
      if (patternError) {
        input.setCustomValidity(patternError);
      }
    }
  });

  input.addEventListener('input', () => {
    input.setCustomValidity('');
  });

  return {
    el: input,
    mount: (id: string) => {
      const target = document.querySelector(id);
      if (target) {
        target.appendChild(input);
      }
    },
  };
}

export class PublicSquareBankAccount {
  private _publicSquare: PublicSquare;

  constructor(psqPointer: PublicSquare) {
    if (!psqPointer) {
      throw Error(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
    }
    this._publicSquare = psqPointer;
  }

  private createBankAccount(input: BankAccountCreateInput) {
    if (!this._publicSquare._apiKey) {
      throw new Error('apiKey must be sent at initialization');
    } else if (!this._publicSquare.bt || !this._publicSquare.bt.client) {
      throw new Error('PublicSquare JS has not be initialized yet');
    } else {
      const validatedInput = validateCreateBankAccountInput(input);
      return fetch(API_ENDPOINTS.BANK_ACCOUNT_CREATE(this._publicSquare._apiUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this._publicSquare._apiKey,
        },
        body: JSON.stringify(transformCreateBankAccountInput(validatedInput)),
      })
        .then((res) => res.json())
        .then((res) => (res.errors ? { error: res } : res));
    }
  }

  /**
   * Create a bank account
   * @param input - The bank account input
   * @returns The bank account create response
   */
  public create(input: BankAccountCreateInput): Promise<BankAccountCreateResponse> {
    return this.createBankAccount(input);
  }

  public createRoutingNumberElement(
    options: CreateBankAccountRoutingNumberElementOptions,
  ): BankAccountRoutingNumberElement {
    return createInputElement({
      ...options,
      pattern: '[0-9]{9}',
      patternError: 'Routing number must be 9 digits',
      onValidate: validateRoutingNumber,
    });
  }

  public createAccountNumberElement(
    options: CreateBankAccountAccountNumberElementOptions,
  ): BankAccountAccountNumberElement {
    return createInputElement({
      ...options,
      pattern: '[0-9]{4,17}',
      patternError: 'Account number must be between 4 and 17 digits',
    });
  }

  public createElement({
    routingNumberOptions,
    accountNumberOptions,
    className,
  }: CreateBankAccountElementOptions = {}): BankAccountElement {
    if (typeof window === 'undefined') {
      throw Error(ELEMENTS_NOM_DOM_ERROR_MESSAGE);
    }

    const container = document.createElement('div');
    container.id = 'psq-bank-account-container';
    container.style.display = 'flex';
    container.className = className ?? '';
    const routingNumberContainer = document.createElement('div');
    routingNumberContainer.id = 'psq-bank-account-routing-number-container';
    routingNumberContainer.style.width = '100%';
    container.appendChild(routingNumberContainer);
    let routingNumberValue = '';
    const routingNumber = this.createRoutingNumberElement({
      placeholder: 'Routing Number',
      value: routingNumberValue,
      ...routingNumberOptions,
    });

    const accountNumberContainer = document.createElement('div');
    accountNumberContainer.id = 'psq-bank-account-account-number-container';
    accountNumberContainer.style.width = '100%';
    container.appendChild(accountNumberContainer);
    let accountNumberValue = '';
    const accountNumber = this.createAccountNumberElement({
      placeholder: 'Account Number',
      value: accountNumberValue,
      ...accountNumberOptions,
    });

    if (!routingNumber) {
      throw new Error(ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_ROUTING_NUMBER_LOAD_ERROR_MESSAGE);
    } else if (!accountNumber) {
      throw new Error(ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_ACCOUNT_NUMBER_LOAD_ERROR_MESSAGE);
    }

    return {
      ...container,
      mount: (id: string) => {
        if (!routingNumber || !accountNumber) {
          throw new Error(ELEMENTS_SCRIPT_UNKNOWN_ERROR_MESSAGE);
        } else {
          const target = document.querySelector(id);
          if (target) {
            target.appendChild(container);

            routingNumber.mount(`#${routingNumberContainer.id}`);
            this._publicSquare._elements.push(routingNumber);

            accountNumber.mount(`#${accountNumberContainer.id}`);
            this._publicSquare._elements.push(accountNumber);
          }
        }
        return this;
      },
      accountNumber,
      routingNumber,
    };
  }
}
