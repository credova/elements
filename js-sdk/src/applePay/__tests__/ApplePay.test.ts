import { PublicSquare } from '../../index';
import { PublicSquareApplePay } from '..';
import { getError, mockFetch, type AnyMock, mock } from '../../tests/utils';
import { ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE } from '../../constants';
import { ApplePayCreateInput } from '../../types';

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

const validApplePayCreateInput: ApplePayCreateInput = {
  apple_payment_data: {},
  customer_id: 'cus_123',
};

describe('ApplePay', () => {
  let publicSquare: PublicSquare;
  let applePay: PublicSquareApplePay;
  let originalFetch: typeof global.fetch;
  let fetchMock: AnyMock;

  beforeAll(async () => {
    originalFetch = global.fetch;
    fetchMock = mockFetch();
    publicSquare = await new PublicSquare().init('api_key');
    applePay = new PublicSquareApplePay(publicSquare);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('constructs', async () => {
    expect(applePay).toBeDefined();
    const error = await getError<{ message: string }>(() => new (PublicSquareApplePay as any)());
    expect(error.message).toEqual(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
  });

  test('create() works', async () => {
    const mockResponse = {
      id: 'applepay_123',
      ...validApplePayCreateInput,
    };
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const result = await applePay.create(validApplePayCreateInput);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.publicsquare.com/payment-methods/apple-pay',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'api_key',
        },
        body: JSON.stringify(validApplePayCreateInput),
      },
    );
    expect<unknown>(result).toEqual(mockResponse);
  });

  test('create() works with minimal valid input', async () => {
    const mockResponse = {
      id: 'applepay_123',
    };
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      }),
    );
    const input = {
      apple_payment_data: {},
    };
    const result = await applePay.create(input);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.publicsquare.com/payment-methods/apple-pay',
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

  test('create() fails with invalid apple_payment_data', async () => {
    const error = await getError<{ message: string }>(() => applePay.create({} as any));
    expect(error.message).toEqual('apple_payment_data is required');
  });

  test('create() only passes validated input', async () => {
    const mockResponse = {
      id: 'applepay_123',
    };
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      }),
    );
    const input = {
      apple_payment_data: {
        token: {
          paymentData: {
            data: 'abcd1234',
          },
        },
      },
      random_value: 'abcdefgh',
    };
    await applePay.create(input);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.publicsquare.com/payment-methods/apple-pay',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'api_key',
        },
        body: JSON.stringify({
          apple_payment_data: {
            token: {
              paymentData: {
                data: 'abcd1234',
              },
            },
          },
        }),
      },
    );
  });
});
