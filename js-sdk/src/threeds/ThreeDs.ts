import {
  API_ENDPOINTS,
  BASIS_THEORY_ENDPOINTS,
  BASIS_THEORY_KEYS,
  ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE,
} from '@/constants';
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
    environment =
      environment ?? (this._publicSquare._apiKey?.includes('test') ? 'TEST' : 'PRODUCTION');
    const appKey =
      environment === 'TEST' ? BASIS_THEORY_KEYS.THREE_DS_TEST : BASIS_THEORY_KEYS.THREE_DS;
    const btApiBaseUrl =
      environment === 'TEST'
        ? BASIS_THEORY_ENDPOINTS.API_BASE_URL_TEST
        : BASIS_THEORY_ENDPOINTS.API_BASE_URL;
    if (!this._bt3ds.has(environment)) {
      const { BasisTheory3ds } = await import('@basis-theory/web-threeds');
      this._bt3ds.set(environment, BasisTheory3ds(appKey, { apiBaseUrl: btApiBaseUrl }));
    }
    return this._bt3ds.get(environment);
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

      return fetch(API_ENDPOINTS.THREE_DS_CREATE_SESSION(this._publicSquare._apiUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this._publicSquare._apiKey,
        },
        body: JSON.stringify(transformCreateThreeDsSessionInput(validatedInput)),
      })
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
