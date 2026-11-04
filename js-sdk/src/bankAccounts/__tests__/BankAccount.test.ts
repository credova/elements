import { afterAll, beforeAll, beforeEach, describe, expect, mock, test } from 'bun:test';
import { PublicSquare } from '../../index';
import { PublicSquareBankAccount } from '..';
import { getError, mockFetch, type AnyMock } from '../../tests/utils';
import { ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE } from '../../constants';
import { BankAccountCreateInput } from '../../types';

mock.module('@basis-theory/basis-theory-js', () => ({
  BasisTheory: mock().mockImplementation(() => ({
    init: mock().mockResolvedValue({
      createElement: mock(),
      client: {
        post: mock().mockResolvedValue({}),
      },
    }),
  })),
}));

const validBankAccountCreateInput: BankAccountCreateInput = {
  routing_number: '123456789',
  account_number: '987654321',
  account_holder_name: 'John Doe',
  account_holder_type: 'individual',
  account_type: 'checking',
  customer_id: 'cus_123',
  billing_details: {
    address_line_1: '123 Main St',
    address_line_2: 'Apt 1',
    city: 'Anytown',
    state: 'CA',
    postal_code: '12345',
    country: 'US',
  },
};

describe('BankAccounts', () => {
  let publicSquare: PublicSquare;
  let bankAccount: PublicSquareBankAccount;
  let originalFetch: typeof global.fetch;
  let fetchMock: AnyMock;

  beforeAll(async () => {
    originalFetch = global.fetch;
    fetchMock = mockFetch();
    publicSquare = await new PublicSquare().init('api_key');
    bankAccount = new PublicSquareBankAccount(publicSquare);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('constructs', async () => {
    expect(bankAccount).toBeDefined();
    const error = await getError<{ message: string }>(() => new (PublicSquareBankAccount as any)());
    expect(error.message).toEqual(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
  });

  test('create() works', async () => {
    const mockResponse = {
      id: 'bank_123',
      ...validBankAccountCreateInput,
    };
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const result = await bankAccount.create(validBankAccountCreateInput);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.publicsquare.com/payment-methods/bank-accounts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'api_key',
        },
        body: JSON.stringify(validBankAccountCreateInput),
      },
    );
    expect<unknown>(result).toEqual(mockResponse);
  });

  test('create() works with minimal valid input', async () => {
    const mockResponse = {
      id: 'bank_123',
      routing_number: '123456789',
      account_number: '987654321',
    };
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      }),
    );
    const input = {
      routing_number: '123456789',
      account_number: '987654321',
    };
    const result = await bankAccount.create(input);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.publicsquare.com/payment-methods/bank-accounts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'api_key',
        },
        body: JSON.stringify(input),
      },
    );
    expect<unknown>(result).toEqual(mockResponse);
  });

  test('create() fails with invalid routing number', async () => {
    const error = await getError<{ message: string }>(() =>
      bankAccount.create({ card: {} } as any),
    );
    expect(error.message).toEqual(
      'routing_number is required when bank_account_verification_id is not provided',
    );
  });

  test('create() fails with invalid account number', async () => {
    const error = await getError<{ message: string }>(() =>
      bankAccount.create({ routing_number: '123456789' } as any),
    );
    expect(error.message).toEqual(
      'account_number is required when bank_account_verification_id is not provided',
    );
  });

  test('create() only passes validated input', async () => {
    const mockResponse = {
      id: 'bank_123',
      routing_number: '123456789',
      account_number: '987654321',
    };
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      }),
    );
    const input = {
      routing_number: '123456789',
      account_number: '987654321',
      invalid_key: 'invalid_value',
    };
    await bankAccount.create(input);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.publicsquare.com/payment-methods/bank-accounts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'api_key',
        },
        body: JSON.stringify({
          routing_number: '123456789',
          account_number: '987654321',
        }),
      },
    );
  });
});
