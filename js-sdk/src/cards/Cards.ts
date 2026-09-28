import { CardCreateResponse, CardCreateInput, CardUpdateCvcResponse } from '@/types/sdk/cards';
import type { BasisTheoryCardTokenUpdateResponse, CardCvcSessionResponse } from './types';
import type { CardVerificationCodeElement } from '@basis-theory/basis-theory-js/types/elements';
import { PublicSquare } from '..';
import {
  API_ENDPOINTS,
  BASIS_THEORY_ENDPOINTS,
  BASIS_THEORY_KEYS,
  ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE,
} from '@/constants';
import { transformCreateCardInput } from '@/utils';
import { validateCreateCardInput } from '@/validators';

export class PublicSquareCards {
  private _publicSquare: PublicSquare;

  constructor(publicSquarePointer: PublicSquare) {
    if (!publicSquarePointer) {
      throw Error(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
    }
    this._publicSquare = publicSquarePointer;
  }

  public create(input: CardCreateInput): Promise<CardCreateResponse> {
    if (!this._publicSquare._apiKey) {
      throw new Error('apiKey must be sent at initialization');
    } else if (!this._publicSquare.bt || !this._publicSquare.bt.client) {
      throw new Error('PublicSquare JS has not be initialized yet');
    } else {
      const environment = this._publicSquare._environment;
      const validatedInput = validateCreateCardInput(input);

      const apiUrlEnvironment = this._publicSquare._apiUrl?.toLowerCase().includes('staging')
        ? 'STAGING'
        : 'PRODUCTION';

      const proxyKey =
        environment === 'TEST'
          ? apiUrlEnvironment === 'STAGING'
            ? BASIS_THEORY_KEYS.CREATE_CARD_TEST
            : BASIS_THEORY_KEYS.CREATE_CARD_PRODUCTION_TEST_MODE
          : BASIS_THEORY_KEYS.CREATE_CARD_PRODUCTION;
      const cardCreateUrl = BASIS_THEORY_ENDPOINTS.PROXY(
        environment === 'TEST'
          ? BASIS_THEORY_ENDPOINTS.API_BASE_URL_TEST
          : BASIS_THEORY_ENDPOINTS.API_BASE_URL,
      );

      return this._publicSquare.bt.client
        .post(cardCreateUrl, transformCreateCardInput(validatedInput), {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this._publicSquare._apiKey,
            'BT-PROXY-KEY': proxyKey,
          },
        })
        .then((res: any) =>
          res.error
            ? {
                error: res.error,
              }
            : res,
        );
    }
  }

  /**
   * Attaches a re-entered CVC to a saved card. The CVC goes from the Elements iframe straight to
   * Basis Theory, authenticated with a short-lived BT session that payments-api authorizes for this
   * card's token only (`token:update`), so no BT key with token permissions ships in the SDK.
   */
  public updateCvc(
    cardId: string,
    cvcElement: CardVerificationCodeElement,
  ): Promise<CardUpdateCvcResponse> {
    if (!this._publicSquare._apiKey) {
      throw new Error('apiKey must be sent at initialization');
    } else if (
      !this._publicSquare.bt ||
      !this._publicSquare.bt.sessions ||
      !this._publicSquare.bt.tokens
    ) {
      throw new Error('PublicSquare JS has not be initialized yet');
    } else {
      return this._updateCvcWithSession(cardId, cvcElement).catch(
        (error: any): CardUpdateCvcResponse => ({
          error: {
            error: error?.message ?? 'Failed to update CVC',
            data: error?.data,
          },
        }),
      );
    }
  }

  private async _updateCvcWithSession(
    cardId: string,
    cvcElement: CardVerificationCodeElement,
  ): Promise<CardUpdateCvcResponse> {
    const bt = this._publicSquare.bt!;

    // 1. Create a BT session with a public key that has no token permissions. The session has no
    //    access until payments-api authorizes it.
    const { sessionKey, nonce } = await bt.sessions.create({
      apiKey:
        this._publicSquare._environment === 'TEST'
          ? BASIS_THEORY_KEYS.CVC_SESSION_TEST
          : BASIS_THEORY_KEYS.CVC_SESSION,
    });

    // 2. payments-api checks the card belongs to this merchant and authorizes the session for
    //    token:update on that card's token only.
    const sessionResponse = await fetch(
      API_ENDPOINTS.CARD_CVC_SESSION(this._publicSquare._apiUrl, cardId),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this._publicSquare._apiKey!,
        },
        body: JSON.stringify({ nonce }),
      },
    );
    const session = await sessionResponse.json().catch(() => undefined);
    if (!sessionResponse.ok || !session?.token) {
      return {
        error: {
          error: `Failed to authorize CVC update session (status ${sessionResponse.status})`,
          data: session,
        },
      };
    }

    // 3. Attach the CVC with the session key. The CVC goes from the Elements iframe to BT only.
    const res: any = await bt.tokens.update(
      (session as CardCvcSessionResponse).token,
      { data: { cvc: cvcElement } },
      { apiKey: sessionKey },
    );
    if (res.error) return { error: { error: res.error, data: res.data } };
    const token = res as BasisTheoryCardTokenUpdateResponse;
    return {
      id: cardId,
      type: token.type,
      created_at: token.createdAt,
      modified_at: token.modifiedAt,
    };
  }
}
