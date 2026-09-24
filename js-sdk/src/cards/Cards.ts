import { CardCreateResponse, CardCreateInput, CardUpdateCvcResponse } from '@/types/sdk/cards';
import type { BasisTheoryCardTokenUpdateResponse } from './types';
import type { CardVerificationCodeElement } from '@basis-theory/basis-theory-js/types/elements';
import { PublicSquare } from '..';
import {
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

  public updateCvc(
    cardToken: string,
    cvcElement: CardVerificationCodeElement,
  ): Promise<CardUpdateCvcResponse> {
    if (!this._publicSquare._apiKey) {
      throw new Error('apiKey must be sent at initialization');
    } else if (!this._publicSquare.bt || !this._publicSquare.bt.tokens) {
      throw new Error('PublicSquare JS has not be initialized yet');
    } else {
      const appKey =
        this._publicSquare._environment === 'TEST'
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
