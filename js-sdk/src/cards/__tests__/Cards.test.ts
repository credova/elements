import { PublicSquare } from '@/index';
import { PublicSquareCards } from '..';
import { getError } from '@/tests/utils';
import { ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE } from '@/constants';
import { generateCardCreateInput } from '@/tests/factories/cards';

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

  test('create() does not override an explicitly passed environment', async () => {
    const testPublicsquare = await new PublicSquare().init('key_test_123');
    const testCards = new PublicSquareCards(testPublicsquare);
    const input = generateCardCreateInput();

    await testCards.create(input, 'PRODUCTION');

    expect(testPublicsquare.bt?.client?.post).toHaveBeenCalledWith(
      'https://api.basistheory.com/proxy',
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          'BT-PROXY-KEY': 'key_prod_us_proxy_HiFqDwW49EZ8szKi8cMvQP',
        }),
      }),
    );
  });

  test('create() uses an explicitly configured testProxyKey even though the apiKey resolves to TEST', async () => {
    const testPublicsquare = await new PublicSquare().init('key_test_123', {
      testProxyKey: 'key_test_us_proxy_FrL4kJFRXU1AwuYVnMbTnP',
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

  test('create() never leaks the production-branch proxyKey into the TEST branch', async () => {
    // Guards the "production test mode" scenario from PR #28: a pk_test_ apiKey used together
    // with a configured (production) proxyKey must still fall back to the SDK's own hardcoded
    // TEST-tenant key, not the configured production key, unless testProxyKey is also set.
    const testPublicsquare = await new PublicSquare().init('key_test_123', {
      proxyKey: 'key_prod_us_proxy_HiFqDwW49EZ8szKi8cMvQP',
    });
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

  describe('updateCvc()', () => {
    const cvcElement = { targetId: 'cvcElement' } as any;

    test('sends the cvc element straight to the BT tokens.update endpoint', async () => {
      const result = await publicsquare.cards.updateCvc('card_token_123', cvcElement);

      expect(publicsquare.bt?.tokens?.update).toHaveBeenCalledWith(
        'card_token_123',
        { data: { cvc: cvcElement } },
        expect.objectContaining({ apiKey: expect.any(String) }),
      );
      expect(result).toEqual({});
    });

    test('never puts the raw cvc value in a request the merchant/PSQ server can see', async () => {
      await publicsquare.cards.updateCvc('card_token_123', cvcElement);

      const [, model] = (publicsquare.bt?.tokens?.update as jest.Mock).mock.calls[0];
      expect(model.data.cvc).toBe(cvcElement);
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

    test('defaults to PRODUCTION environment when apiKey does not contain "test"', async () => {
      await publicsquare.cards.updateCvc('card_token_123', cvcElement);

      expect(publicsquare.bt?.tokens?.update).toHaveBeenCalledWith(
        'card_token_123',
        { data: { cvc: cvcElement } },
        { apiKey: publicsquare._cvcUpdateAppKey },
      );
    });

    test('does not override an explicitly passed environment', async () => {
      const testPublicsquare = await new PublicSquare().init('key_test_123');
      const testCards = new PublicSquareCards(testPublicsquare);

      await testCards.updateCvc('card_token_123', cvcElement, 'PRODUCTION');

      expect(testPublicsquare.bt?.tokens?.update).toHaveBeenCalledWith(
        'card_token_123',
        { data: { cvc: cvcElement } },
        { apiKey: testPublicsquare._cvcUpdateAppKey },
      );
    });

    test('respects cvcUpdateAppKey/cvcUpdateTestAppKey init overrides', async () => {
      const overriddenPublicsquare = await new PublicSquare().init('api_key', {
        cvcUpdateAppKey: 'key_prod_us_pub_custom',
        cvcUpdateTestAppKey: 'key_test_us_pub_custom',
      });
      const overriddenCards = new PublicSquareCards(overriddenPublicsquare);

      await overriddenCards.updateCvc('card_token_123', cvcElement);
      expect(overriddenPublicsquare.bt?.tokens?.update).toHaveBeenCalledWith(
        'card_token_123',
        expect.anything(),
        { apiKey: 'key_prod_us_pub_custom' },
      );

      await overriddenCards.updateCvc('card_token_123', cvcElement, 'TEST');
      expect(overriddenPublicsquare.bt?.tokens?.update).toHaveBeenCalledWith(
        'card_token_123',
        expect.anything(),
        { apiKey: 'key_test_us_pub_custom' },
      );
    });
  });
});
