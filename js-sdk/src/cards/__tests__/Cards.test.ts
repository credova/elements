import { PublicSquare } from '@/index';
import { PublicSquareCards } from '..';
import { getError } from '@/tests/utils';
import { ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE } from '@/constants';
import { generateCardCreateInput } from '@/tests/factories/cards';
import type { BasisTheoryCardTokenUpdateResponse } from '../types';

jest.mock('@basis-theory/basis-theory-js', () => ({
  BasisTheory: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue({
      createElement: jest.fn(),
      client: {
        post: jest.fn().mockResolvedValue({}),
      },
      tokens: {
        update: jest.fn().mockResolvedValue({}),
      },
    }),
  })),
}));

describe('Cards', () => {
  let publicsquare: PublicSquare;
  let cards: PublicSquareCards;
  beforeAll(async () => {
    publicsquare = await new PublicSquare().init('api_key');
    cards = new PublicSquareCards(publicsquare);
  });

  test('constructs', async () => {
    expect(cards).toBeDefined();
    const error = await getError<{ message: string }>(() => new (PublicSquareCards as any)());
    expect(error.message).toEqual(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
  });

  test('create() works', async () => {
    const input = generateCardCreateInput();
    const result = await publicsquare.cards.create(input);
    expect(result).toEqual({});
  });

  test('create() fails with invalid input', async () => {
    const error = await getError<{ message: string }>(() =>
      publicsquare.cards.create({ card: {} } as any),
    );
    expect(error.message).toBe('cardholder_name is required');
  });

  test('create() defaults to TEST environment when apiKey contains "test"', async () => {
    const testPublicsquare = await new PublicSquare().init('key_test_123');
    const testCards = new PublicSquareCards(testPublicsquare);
    const input = generateCardCreateInput();

    await testCards.create(input);

    expect(testPublicsquare.bt?.client?.post).toHaveBeenCalledWith(
      'https://api.test.basistheory.com/proxy',
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          'BT-PROXY-KEY': 'key_test_us_proxy_AaEf6KrqHpa1ur7jyiZcNu',
        }),
      }),
    );
  });

  test('create() defaults to PRODUCTION environment when apiKey does not contain "test"', async () => {
    const input = generateCardCreateInput();

    await publicsquare.cards.create(input);

    expect(publicsquare.bt?.client?.post).toHaveBeenCalledWith(
      'https://api.basistheory.com/proxy',
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          'BT-PROXY-KEY': 'key_prod_us_proxy_HiFqDwW49EZ8szKi8cMvQP',
        }),
      }),
    );
  });

  test('create() uses BASIS_THEORY_KEYS.CREATE_CARD_TEST when apiUrl indicates a STAGING environment, even though the apiKey resolves to TEST', async () => {
    const testPublicsquare = await new PublicSquare().init('key_test_123', {
      apiUrl: 'https://staging.api.publicsquare.com',
    });
    const testCards = new PublicSquareCards(testPublicsquare);
    const input = generateCardCreateInput();

    await testCards.create(input);

    expect(testPublicsquare.bt?.client?.post).toHaveBeenCalledWith(
      'https://api.test.basistheory.com/proxy',
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          'BT-PROXY-KEY': 'key_test_us_proxy_FrL4kJFRXU1AwuYVnMbTnP',
        }),
      }),
    );
  });

  describe('updateCvc()', () => {
    const cvcElement = { targetId: 'cvcElement' } as any;
    // Real BT PATCH /tokens/{id} response for a card token (camelCase top-level keys).
    const btCardTokenUpdateResponse: BasisTheoryCardTokenUpdateResponse = {
      id: '8b0eac76-f566-40b5-8b92-5f0f0e32c014',
      type: 'card',
      tenantId: '2fff47ed-5759-4253-bf0e-fd56fbc20288',
      data: { number: 'XXXXXXXXXXXX4242', expiration_month: 4, expiration_year: 2028 },
      enrichments: { cardDetails: { bin: '424242', last4: '4242' } },
      card: {
        bin: '424242',
        last4: '4242',
        expirationMonth: 4,
        expirationYear: 2028,
        brand: 'visa',
        funding: 'credit',
      },
      createdBy: 'fac9c8ff-b108-40e7-b076-3b1093bbbc70',
      createdAt: '2026-09-22T14:57:03.5381029+00:00',
      modifiedBy: '67936d37-b013-4e6d-a4b0-1517c566455f',
      modifiedAt: '2026-09-22T15:19:40.670571+00:00',
      fingerprint: '5vFj1H8zK9enBAXFp9Er1tbwr6XUJYKRqFw8bJBTYLxh',
      privacy: { classification: 'pci', impactLevel: 'high', restrictionPolicy: 'mask' },
      containers: ['/pci/high/'],
      aliases: ['8b0eac76-f566-40b5-8b92-5f0f0e32c014'],
    };

    test('sends the cvc element straight to the BT tokens.update endpoint', async () => {
      const result = await publicsquare.cards.updateCvc('card_token_123', cvcElement);

      expect(publicsquare.bt?.tokens?.update).toHaveBeenCalledWith(
        'card_token_123',
        { data: { cvc: cvcElement } },
        { apiKey: publicsquare._cvcUpdateAppKey },
      );
      expect(result).toEqual({});
    });

    test('never puts the raw cvc value in a request the merchant/PSQ server can see', async () => {
      await publicsquare.cards.updateCvc('card_token_123', cvcElement);

      const [, model] = (publicsquare.bt?.tokens?.update as jest.Mock).mock.calls[0];
      expect(model.data.cvc).toBe(cvcElement);
    });

    test('maps the BT token response down to CardUpdateCvcResponse', async () => {
      (publicsquare.bt?.tokens?.update as jest.Mock).mockResolvedValueOnce(
        btCardTokenUpdateResponse,
      );

      const result = await publicsquare.cards.updateCvc(btCardTokenUpdateResponse.id, cvcElement);

      expect(result).toEqual({
        id: '8b0eac76-f566-40b5-8b92-5f0f0e32c014',
        type: 'card',
        created_at: '2026-09-22T14:57:03.5381029+00:00',
        modified_at: '2026-09-22T15:19:40.670571+00:00',
      });
    });

    test('returns a CardUpdateCvcResponse error (with error.data) when the BT update fails', async () => {
      (publicsquare.bt?.tokens?.update as jest.Mock).mockResolvedValueOnce({
        error: 'invalid cvc',
        data: { errors: { cvc: ['must be 3 or 4 digits'] } },
      });

      const result = await publicsquare.cards.updateCvc('card_token_123', cvcElement);

      expect(result).toEqual({
        error: {
          error: 'invalid cvc',
          data: { errors: { cvc: ['must be 3 or 4 digits'] } },
        },
      });
    });

    test('resolves with error.data when the BT request itself rejects (e.g. a 404)', async () => {
      const btError = Object.assign(new Error('The API responded with status code 404.'), {
        status: 404,
        data: { errors: { token: ['token not found'] } },
      });
      (publicsquare.bt?.tokens?.update as jest.Mock).mockRejectedValueOnce(btError);

      const result = await publicsquare.cards.updateCvc('card_token_123', cvcElement);

      expect(result).toEqual({
        error: {
          error: 'The API responded with status code 404.',
          data: { errors: { token: ['token not found'] } },
        },
      });
    });

    test('defaults to TEST environment when apiKey contains "test"', async () => {
      const testPublicsquare = await new PublicSquare().init('key_test_123');
      const testCards = new PublicSquareCards(testPublicsquare);

      await testCards.updateCvc('card_token_123', cvcElement);

      expect(testPublicsquare.bt?.tokens?.update).toHaveBeenCalledWith(
        'card_token_123',
        { data: { cvc: cvcElement } },
        { apiKey: testPublicsquare._cvcUpdateTestAppKey },
      );
    });

    test('throws instead of calling BT when the CVC update key was not inlined at build time', async () => {
      const unconfiguredPublicsquare = await new PublicSquare().init('key_test_123');
      unconfiguredPublicsquare._cvcUpdateTestAppKey = undefined;
      const unconfiguredCards = new PublicSquareCards(unconfiguredPublicsquare);

      const error = await getError<{ message: string }>(() =>
        unconfiguredCards.updateCvc('card_token_123', cvcElement),
      );

      expect(error.message).toBe(
        'CVC update key is not configured for the TEST environment; the SDK was built without it',
      );
      expect(unconfiguredPublicsquare.bt?.tokens?.update).not.toHaveBeenCalled();
    });

    test('defaults to PRODUCTION environment when apiKey does not contain "test"', async () => {
      await publicsquare.cards.updateCvc('card_token_123', cvcElement);

      expect(publicsquare.bt?.tokens?.update).toHaveBeenCalledWith(
        'card_token_123',
        { data: { cvc: cvcElement } },
        { apiKey: publicsquare._cvcUpdateAppKey },
      );
    });
  });
});
