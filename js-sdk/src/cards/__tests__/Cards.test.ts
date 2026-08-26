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
});
