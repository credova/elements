import { PublicSquare } from '..';
import { ELEMENTS_INIT_ERROR_MESSAGE, ELEMENTS_TYPE_NOT_SUPPORTED } from '@/constants';
import { getError } from '@/tests/utils';

jest.mock('@basis-theory/basis-theory-js', () => ({
  BasisTheory: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue({
      createElement: jest.fn().mockResolvedValue({}),
      client: {
        post: jest.fn().mockResolvedValue({}),
      },
    }),
  })),
}));

jest.mock('../bankAccounts', () => ({
  PublicSquareBankAccount: jest.fn().mockImplementation(() => {
    function MockPublicSquareBankAccount() {}
    MockPublicSquareBankAccount.prototype.createElement = jest.fn().mockResolvedValue({});
    return {
      createElement: jest.fn().mockResolvedValue({}),
      createRoutingNumberElement: jest.fn().mockResolvedValue({}),
      createAccountNumberElement: jest.fn().mockResolvedValue({}),
    };
  }),
}));

describe('PublicSquare', () => {
  let publicsquare: PublicSquare;
  beforeAll(async () => {
    publicsquare = await new PublicSquare().init('api_key');
  });

  test('constructs', () => {
    expect(publicsquare.bt).toBeDefined();
    expect(typeof publicsquare.init).toEqual('function');
    expect(typeof publicsquare.createElement).toEqual('function');
    expect(typeof publicsquare.createCardElement).toEqual('function');
    expect(typeof publicsquare.createCardExpirationDateElement).toEqual('function');
    expect(typeof publicsquare.createCardNumberElement).toEqual('function');
    expect(typeof publicsquare.createCardVerificationCodeElement).toEqual('function');
    expect(typeof publicsquare.cards.updateCvc).toEqual('function');
    expect(typeof publicsquare.createBankAccountElement).toEqual('function');
    expect(typeof publicsquare.createBankAccountRoutingNumberElement).toEqual('function');
    expect(typeof publicsquare.createBankAccountAccountNumberElement).toEqual('function');
  });

  test('throws error if init is not called', async () => {
    const error = await getError<{ message: string }>(() =>
      new PublicSquare().createElement('card', {}),
    );
    expect(error.message).toEqual(ELEMENTS_INIT_ERROR_MESSAGE);
  });

  test('valid element type returns element', async () => {
    const elementTypes = [
      'card',
      'cardExpirationDate',
      'cardNumber',
      'cardVerificationCode',
      'text',
      'bankAccount',
      'bankAccountRoutingNumber',
      'bankAccountAccountNumber',
    ];
    for (const type of elementTypes) {
      const element = publicsquare.createElement(type as any, {});
      expect(element).toBeDefined();
    }
  });

  test('invalid element type throws element not supported error', async () => {
    const error = await getError<{ message: string }>(() =>
      publicsquare.createElement('cardlkasjdlfk' as any, {}),
    );
    expect(error.message).toEqual(ELEMENTS_TYPE_NOT_SUPPORTED);
  });
});
