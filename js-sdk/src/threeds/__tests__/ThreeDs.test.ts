import { PublicSquare } from '@/index';
import { PublicSquareThreeDs } from '..';
import { getError } from '@/tests/utils';
import { ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE } from '@/constants';

const mockBtCreateSession = jest.fn();
const mockBtStartChallenge = jest.fn();

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

jest.mock('@basis-theory/web-threeds', () => ({
  BasisTheory3ds: jest.fn(() => ({
    createSession: (...args: unknown[]) => mockBtCreateSession(...args),
    startChallenge: (...args: unknown[]) => mockBtStartChallenge(...args),
  })),
}));

describe('ThreeDs', () => {
  let publicsquare: PublicSquare;

  beforeEach(async () => {
    jest.clearAllMocks();
    publicsquare = await new PublicSquare().init('pk_test_123');
  });

  test('constructs', async () => {
    expect(publicsquare.threeDs).toBeDefined();
    const error = await getError<{ message: string }>(() => new (PublicSquareThreeDs as any)());
    expect(error.message).toEqual(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
  });

  test('createSession() creates a BT session and registers it with the API', async () => {
    mockBtCreateSession.mockResolvedValue({
      id: 'bt_session_123',
      additionalCardBrands: [],
    });
    const apiResponse = {
      id: 'tds_abc',
      bt_session_id: 'bt_session_123',
      card_brand: 'visa',
      acs_transaction_id: 'acs_tx_1',
      additional_card_brands: [],
    };
    const fetchMock = jest.fn().mockResolvedValue({ json: () => Promise.resolve(apiResponse) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await publicsquare.threeDs.createSession({
      token_id: 'tok_123',
      payment_intent_id: 'pmt_int_1',
      challenge_preference: 'no-preference',
    });

    // BT session is created from the card token
    expect(mockBtCreateSession).toHaveBeenCalledWith({ tokenId: 'tok_123' });

    // The BT session id + intent are registered with the PSQ API
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit.method).toBe('POST');
    expect(requestInit.headers['X-API-KEY']).toBe('pk_test_123');
    expect(JSON.parse(requestInit.body)).toEqual({
      bt_session_id: 'bt_session_123',
      payment_intent_id: 'pmt_int_1',
      challenge_preference: 'no-preference',
    });

    // The API response (including bt_session_id) is returned to the caller
    expect(result).toEqual(apiResponse);
  });

  test('createSession() surfaces API validation errors', async () => {
    mockBtCreateSession.mockResolvedValue({
      id: 'bt_session_123',
      additionalCardBrands: [],
    });
    const errorBody = { errors: { payment_intent_id: ["'payment_intent_id' is required"] } };
    global.fetch = jest
      .fn()
      .mockResolvedValue({ json: () => Promise.resolve(errorBody) }) as unknown as typeof fetch;

    const result = await publicsquare.threeDs.createSession({
      token_id: 'tok_123',
      payment_intent_id: '',
      challenge_preference: 'no-preference',
    });

    expect(result).toEqual({ error: errorBody });
  });

  test('createSession() throws when the BT session has no id', async () => {
    mockBtCreateSession.mockResolvedValue({ id: '', additionalCardBrands: [] });
    global.fetch = jest.fn() as unknown as typeof fetch;

    const error = await getError<{ message: string }>(() =>
      publicsquare.threeDs.createSession({
        token_id: 'tok_123',
        payment_intent_id: 'pmt_int_1',
        challenge_preference: 'no-preference',
      }),
    );

    expect(error.message).toBe('bt_session_id is required');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('createSession() throws before the SDK is initialized', async () => {
    const uninitialized = new PublicSquare();
    const error = await getError<{ message: string }>(() =>
      uninitialized.threeDs.createSession({
        token_id: 'tok_123',
        payment_intent_id: 'pmt_int_1',
        challenge_preference: 'no-preference',
      }),
    );

    expect(error.message).toBe('apiKey must be sent at initialization');
  });

  test("createSession() always uses the SDK's fixed TEST 3ds key in TEST mode, regardless of init options", async () => {
    mockBtCreateSession.mockResolvedValue({ id: 'bt_session_123', additionalCardBrands: [] });
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          id: 'tds_abc',
          bt_session_id: 'bt_session_123',
          card_brand: 'visa',
          acs_transaction_id: 'acs_tx_1',
          additional_card_brands: [],
        }),
    }) as unknown as typeof fetch;

    const testPublicsquare = await new PublicSquare().init('pk_test_123', {
      apiUrl: 'https://staging.api.publicsquare.com',
    });
    const { BasisTheory3ds } = jest.requireMock('@basis-theory/web-threeds');

    await testPublicsquare.threeDs.createSession({
      token_id: 'tok_123',
      payment_intent_id: 'pmt_int_1',
      challenge_preference: 'no-preference',
      environment: 'TEST',
    });

    expect(BasisTheory3ds).toHaveBeenCalledWith('key_test_us_pub_Tkia8nWTAWwFZ8QJyUJvES', {
      apiBaseUrl: 'https://api.test.basistheory.com',
    });
  });

  test('startChallenge() delegates to BasisTheory with mapped params', async () => {
    const challengeResult = {
      id: 'tds_abc',
      isCompleted: true,
      authenticationStatus: 'successful',
    };
    mockBtStartChallenge.mockResolvedValue(challengeResult);

    const result = await publicsquare.threeDs.startChallenge({
      sessionId: 'bt_session_123',
      acsChallengeUrl: 'https://acs.example.com/challenge',
      acsTransactionId: 'acs_tx_1',
      threeDsVersion: '2.2.0',
      containerId: 'challenge-container',
    });

    expect(mockBtStartChallenge).toHaveBeenCalledWith({
      sessionId: 'bt_session_123',
      acsChallengeUrl: 'https://acs.example.com/challenge',
      acsTransactionId: 'acs_tx_1',
      threeDSVersion: '2.2.0',
      windowSize: '03',
      containerId: 'challenge-container',
    });
    expect(result).toEqual(challengeResult);
  });
});
