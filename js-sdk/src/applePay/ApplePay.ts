import {
  ApplePayButtonWidgetOptions,
  ApplePayCreateInput,
  ApplePayCreateResponse,
  ApplePayCreateSessionInput,
} from '@/types';
import { PublicSquare } from '..';
import { API_ENDPOINTS, ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE } from '@/constants';
import { transformCreateApplePayInput, transformCreateApplePaySessionInput } from '@/utils';
import { validateCreateApplePayInput, validateCreateApplePaySessionInput } from '@/validators';
import { ApplePayButtonWidget } from './ApplePayButtonWidget';

export class PublicSquareApplePay {
  private _publicSquare: PublicSquare;

  constructor(publicSquarePointer: PublicSquare) {
    if (!publicSquarePointer) {
      throw Error(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
    }
    this._publicSquare = publicSquarePointer;
  }

  public renderButton(container: HTMLElement, options: ApplePayButtonWidgetOptions = {}) {
    const widget = new ApplePayButtonWidget({
      ...options,
      onClick: () => {
        if (typeof options.onClick === 'function') {
          options.onClick();
        }
      },
    });
    widget.render(container);
    return widget;
  }

  public create(input: ApplePayCreateInput): Promise<ApplePayCreateResponse> {
    if (!this._publicSquare._apiKey) {
      throw new Error('apiKey must be sent at initialization');
    } else if (!this._publicSquare.bt || !this._publicSquare.bt.client) {
      throw new Error('PublicSquare JS has not be initialized yet');
    } else {
      const validatedInput = validateCreateApplePayInput(input);
      return fetch(
        API_ENDPOINTS.APPLE_PAY_CREATE(this._publicSquare._apiUrl),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this._publicSquare._apiKey,
          },
          body: JSON.stringify(transformCreateApplePayInput(validatedInput)),
        },
      )
        .then((res) => res.json())
        .then((res) =>
          res.errors
            ? {
                error: res,
              }
            : res,
        );
    }
  }

  public createSession(input: ApplePayCreateSessionInput): Promise<any> {
    if (!this._publicSquare._apiKey) {
      throw new Error('apiKey must be sent at initialization');
    } else if (!this._publicSquare.bt || !this._publicSquare.bt.client) {
      throw new Error('PublicSquare JS has not be initialized yet');
    } else {
      const validatedInput = validateCreateApplePaySessionInput(input);
      return fetch(
        API_ENDPOINTS.APPLE_PAY_CREATE_SESSION(this._publicSquare._apiUrl),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this._publicSquare._apiKey,
          },
          body: JSON.stringify(transformCreateApplePaySessionInput(validatedInput)),
        },
      )
        .then((res) => res.json())
        .then((res) =>
          res.errors
            ? {
                error: res,
              }
            : res,
        );
    }
  }
}
