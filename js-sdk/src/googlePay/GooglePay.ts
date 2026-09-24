import {
  GooglePayButtonWidgetOptions,
  GooglePayEnvironmentsConfiguration,
  GooglePayCreateInput,
  GooglePayCreateResponse,
} from '@/types';
import { PublicSquare } from '..';
import { API_ENDPOINTS, ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE } from '@/constants';
import { transformCreateGooglePayInput, transformGooglePayButtonWidgetOptions } from '@/utils';
import { validateCreateGooglePayInput, validateGooglePayButtonWidgetOptions } from '@/validators';
import { GooglePayButtonWidget } from './GooglePayButtonWidget';

export class PublicSquareGooglePay {
  private _publicSquare: PublicSquare;

  constructor(publicSquarePointer: PublicSquare) {
    if (!publicSquarePointer) {
      throw Error(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
    }
    this._publicSquare = publicSquarePointer;
  }

  public renderButton(container: HTMLElement, options: GooglePayButtonWidgetOptions) {
    const validatedInput = validateGooglePayButtonWidgetOptions(options);
    const widget = new GooglePayButtonWidget(
      {
        ...transformGooglePayButtonWidgetOptions(validatedInput),
        onPaymentDataLoaded: (paymentData) => {
          if (typeof options.onPaymentDataLoaded === 'function') {
            options.onPaymentDataLoaded(paymentData);
          }
        },
      },
      this._publicSquare,
    );
    widget.render(container);
    return widget;
  }

  public getGooglePayConfiguration(): Promise<GooglePayEnvironmentsConfiguration> {
    return fetch(
      API_ENDPOINTS.GOOGLE_PAY_CONFIGURATION(this._publicSquare._apiUrl),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this._publicSquare._apiKey ?? '',
        },
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

  public create(input: GooglePayCreateInput): Promise<GooglePayCreateResponse> {
    if (!this._publicSquare._apiKey) {
      throw new Error('apiKey must be sent at initialization');
    } else if (!this._publicSquare.bt || !this._publicSquare.bt.client) {
      throw new Error('PublicSquare JS has not be initialized yet');
    } else {
      const validatedInput = validateCreateGooglePayInput(input);
      return fetch(
        API_ENDPOINTS.GOOGLE_PAY_CREATE(this._publicSquare._apiUrl),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this._publicSquare._apiKey,
          },
          body: JSON.stringify(transformCreateGooglePayInput(validatedInput)),
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
