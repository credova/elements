import { API_ENDPOINTS, ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE } from '@/constants';
import type { PublicSquare } from '@/PublicSquare';
import type {
  ThreeDsCreateSessionResponse,
  SaveThreeDsSessionResponse,
  ThreeDsStartChallengeInput,
  ThreeDsStartChallengeResponse,
} from '@/types';
import { validateSaveThreeDsSessionRequest } from '@/validators';
import { transformCreateThreeDsSessionInput } from '@/utils';

export class PublicSquareThreeDs {
  private _publicSquare: PublicSquare;
  private _bt3ds: Map<string, any> = new Map();

  constructor(publicSquarePointer: PublicSquare) {
    if (!publicSquarePointer) {
      throw new Error(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
    }
    this._publicSquare = publicSquarePointer;
  }

  private async _getBt3ds(environment?: 'TEST' | 'PRODUCTION') {
    const env = environment ?? 'PRODUCTION';
    if (!this._bt3ds.has(env)) {
      const { BasisTheory3ds } = await import('@basis-theory/web-threeds');
      if (env === 'TEST') {
        this._bt3ds.set(
          env,
          BasisTheory3ds(
            this._publicSquare._public3dsTestAppKey ?? 'key_test_us_pub_Tkia8nWTAWwFZ8QJyUJvES',
            {
              apiBaseUrl: 'https://api.test.basistheory.com',
            },
          ),
        );
      } else {
        this._bt3ds.set(
          env,
          BasisTheory3ds(this._publicSquare._public3dsAppKey, {
            apiBaseUrl: this._publicSquare._btApiBaseUrl,
          }),
        );
      }
    }
    return this._bt3ds.get(env);
  }

  public async createSession(input: {
    token_id: string;
    payment_intent_id: string;
    challenge_preference?: string;
    exemption_request_reason?: string;
    environment?: 'TEST' | 'PRODUCTION';
  }): Promise<SaveThreeDsSessionResponse> {
    if (!this._publicSquare._apiKey) {
      throw new Error('apiKey must be sent at initialization');
    } else if (!this._publicSquare.bt || !this._publicSquare.bt.client) {
      throw new Error('PublicSquare JS has not be initialized yet');
    } else {
      const bt3ds = await this._getBt3ds(input.environment ?? 'PRODUCTION');
      const btSession = (await bt3ds.createSession({
        tokenId: input.token_id,
      })) as ThreeDsCreateSessionResponse;

      const validatedInput = validateSaveThreeDsSessionRequest({
        bt_session_id: btSession.id,
        payment_intent_id: input.payment_intent_id,
        challenge_preference: input.challenge_preference,
        exemption_request_reason: input.exemption_request_reason,
      });

      return fetch(
        this._publicSquare._threeDsCreateSessionUrl ??
          API_ENDPOINTS.THREE_DS_CREATE_SESSION(this._publicSquare._apiUrl),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this._publicSquare._apiKey,
          },
          body: JSON.stringify(transformCreateThreeDsSessionInput(validatedInput)),
        },
      )
        .then((res) => res.json())
        .then((res) => (res.errors ? { error: res } : res));
    }
  }

  public async startChallenge(
    input: ThreeDsStartChallengeInput,
  ): Promise<ThreeDsStartChallengeResponse> {
    const bt3ds = await this._getBt3ds(input.environment ?? 'PRODUCTION');
    const result = await bt3ds.startChallenge({
      sessionId: input.sessionId,
      acsChallengeUrl: input.acsChallengeUrl,
      acsTransactionId: input.acsTransactionId,
      threeDSVersion: input.threeDsVersion,
      windowSize: '03',
      containerId: input.containerId,
    });
    return result as ThreeDsStartChallengeResponse;
  }
}
