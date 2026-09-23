import { CardCreateResponse, CardCreateInput, CardUpdateCvcResponse } from '@/types/sdk/cards';
import type { BasisTheoryCardTokenUpdateResponse } from './types';
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
          ? (this._publicSquare._testProxyKey ?? 'key_test_us_proxy_AaEf6KrqHpa1ur7jyiZcNu')
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
        .then(
          (res: any): CardUpdateCvcResponse => {
            if (res.error) return { error: { error: res.error, data: res.data } };
            const token = res as BasisTheoryCardTokenUpdateResponse;
            return {
              id: token.id,
              type: token.type,
              created_at: token.createdAt,
              modified_at: token.modifiedAt,
            };
          },
          (error: any): CardUpdateCvcResponse => ({
            error: {
              error: error?.message ?? 'Failed to update CVC',
              data: error?.data,
            },
          }),
        );
    }
  }
}
