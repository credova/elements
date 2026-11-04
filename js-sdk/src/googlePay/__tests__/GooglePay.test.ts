import { afterAll, beforeAll, beforeEach, describe, expect, mock, test } from 'bun:test';
import { PublicSquare } from '../../index';
import { PublicSquareGooglePay } from '..';
import { getError, mockFetch, type AnyMock } from '@/tests/utils';
import { ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE } from '@/constants';
import { GooglePayCreateInput } from '@/types';

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

const validGooglePayCreateInput: GooglePayCreateInput = {
  google_payment_method_data: {
    type: 'CARD',
    description: 'Visa •••• 1111',
    tokenizationData: {
      type: 'PAYMENT_GATEWAY',
      token: '{"protocolVersion":"ECv2"}',
    },
  },
  customer_id: 'cus_123',
};

describe('GooglePay', () => {
  let publicSquare: PublicSquare;
  let googlePay: PublicSquareGooglePay;
  let originalFetch: typeof global.fetch;
  let fetchMock: AnyMock;

  beforeAll(async () => {
    originalFetch = global.fetch;
    fetchMock = mockFetch();
    publicSquare = await new PublicSquare().init('api_key');
    googlePay = new PublicSquareGooglePay(publicSquare);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('constructs', async () => {
    expect(googlePay).toBeDefined();
    const error = await getError<{ message: string }>(() => new (PublicSquareGooglePay as any)());
    expect(error.message).toEqual(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
  });

  test('create() works', async () => {
    const mockResponse = {
      id: 'googlepay_123',
      ...validGooglePayCreateInput,
    };
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const result = await googlePay.create(validGooglePayCreateInput);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.publicsquare.com/payment-methods/google-pay',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'api_key',
        },
        body: JSON.stringify(validGooglePayCreateInput),
      },
    );
    expect<unknown>(result).toEqual(mockResponse);
  });

  test('create() works with minimal valid input', async () => {
    const mockResponse = {
      id: 'googlepay_123',
    };
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      }),
    );
    const input: GooglePayCreateInput = {
      google_payment_method_data: {
        type: 'CARD',
        description: 'Visa •••• 1111',
        tokenizationData: {
          type: 'PAYMENT_GATEWAY',
          token: '{"protocolVersion":"ECv2"}',
        },
      },
    };
    const result = await googlePay.create(input);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.publicsquare.com/payment-methods/google-pay',
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

  test('create() fails with invalid google_payment_method_data', async () => {
    const error = await getError<{ message: string }>(() => googlePay.create({} as any));
    expect(error.message).toEqual('google_payment_method_data is required');
  });

  test('create() only passes validated input', async () => {
    const mockResponse = {
      id: 'googlepay_123',
    };
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      }),
    );
    const input = {
      google_payment_method_data: {
        type: 'CARD',
        description: 'Visa •••• 1111',
        tokenizationData: {
          type: 'PAYMENT_GATEWAY',
          token: '{"protocolVersion":"ECv2","signature":"abcd1234"}',
        },
      },
      random_value: 'abcdefgh',
    };
    await googlePay.create(input as GooglePayCreateInput);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.publicsquare.com/payment-methods/google-pay',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'api_key',
        },
        body: JSON.stringify({
          google_payment_method_data: {
            type: 'CARD',
            description: 'Visa •••• 1111',
            tokenizationData: {
              type: 'PAYMENT_GATEWAY',
              token: '{"protocolVersion":"ECv2","signature":"abcd1234"}',
            },
          },
        }),
      },
    );
  });
});
