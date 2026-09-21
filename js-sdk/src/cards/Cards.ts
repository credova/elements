import { CardCreateResponse, CardCreateInput, CardUpdateCvcResponse } from '@/types/sdk/cards';
import type { CardVerificationCodeElement } from '@basis-theory/basis-theory-js/types/elements';
import { PublicSquare } from '..';
import { BASIS_THEORY_ENDPOINTS, ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE } from '@/constants';
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

  public create(
    input: CardCreateInput,
    environment?: 'TEST' | 'PRODUCTION',
  ): Promise<CardCreateResponse> {
    if (!this._publicSquare._apiKey) {
      throw new Error('apiKey must be sent at initialization');
    } else if (!this._publicSquare.bt || !this._publicSquare.bt.client) {
      throw new Error('PublicSquare JS has not be initialized yet');
    } else {
      environment =
        environment ?? (this._publicSquare._apiKey?.includes('test') ? 'TEST' : 'PRODUCTION');
      const validatedInput = validateCreateCardInput(input);
      const cardCreateUrl =
        environment === 'TEST'
          ? BASIS_THEORY_ENDPOINTS.PROXY('https://api.test.basistheory.com')
          : (this._publicSquare._cardCreateUrl ??
            BASIS_THEORY_ENDPOINTS.PROXY(this._publicSquare._btApiBaseUrl));
      const proxyKey =
        environment === 'TEST'
          ? 'key_test_us_proxy_AaEf6KrqHpa1ur7jyiZcNu'
          : this._publicSquare._proxyKey;

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
   * Attaches a re-entered CVC to a saved card's Basis Theory token. The CVC value
   * goes from the browser to Basis Theory directly — it never reaches a PSQ or
   * merchant server. The next charge on this card picks up the CVC automatically.
   * @param cardToken the `token` field from the card create/get response
   * @param cvcElement a mounted `cardVerificationCode` element holding the re-entered CVC
   * @param environment defaults to `TEST` when the initialized apiKey is a test key
   */
  public updateCvc(
    cardToken: string,
    cvcElement: CardVerificationCodeElement,
    environment?: 'TEST' | 'PRODUCTION',
  ): Promise<CardUpdateCvcResponse> {
    if (!this._publicSquare._apiKey) {
      throw new Error('apiKey must be sent at initialization');
    } else if (!this._publicSquare.bt || !this._publicSquare.bt.tokens) {
      throw new Error('PublicSquare JS has not be initialized yet');
    } else {
      environment =
        environment ?? (this._publicSquare._apiKey?.includes('test') ? 'TEST' : 'PRODUCTION');
      const appKey =
        environment === 'TEST'
          ? this._publicSquare._cvcUpdateTestAppKey
          : this._publicSquare._cvcUpdateAppKey;

      return this._publicSquare.bt.tokens
        .update(cardToken, { data: { cvc: cvcElement } }, { apiKey: appKey })
        .then((res: any) =>
          res.error
            ? {
                error: res.error,
              }
            : res,
        );
    }
  }
}
