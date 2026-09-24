import {
  BankAccountVerificationUrlResponse,
  BankAccountVerificationIdRequest,
  BankAccountVerificationIdResponse,
  CreateBankAccountVerificationElementOptions,
  BankAccountVerificationElement,
} from '@/types';
import { PublicSquare } from '@/PublicSquare';
import {
  ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE,
  ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_VERIFICATION_NOT_ENABLED,
  API_ENDPOINTS,
} from '@/constants';

export class PublicSquareBankVerification {
  private _publicSquare: PublicSquare;
  private _messageHandler: ((e: MessageEvent) => void) | null = null;

  constructor(psqPointer: PublicSquare) {
    if (!psqPointer) {
      throw Error(ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE);
    }
    this._publicSquare = psqPointer;
  }

  public createVerificationElement(
    options: CreateBankAccountVerificationElementOptions,
  ): BankAccountVerificationElement {
    const { onVerificationComplete } = options;

    return {
      mount: (id: string) => {
        this.openVerification(id, (verificationId) => {
          if (onVerificationComplete) {
            onVerificationComplete({
              bank_account_verification_id: verificationId,
            });
          }
        }).catch((error) => {
          console.error('Verification failed:', error);
        });
      },
    };
  }

  public openVerification(
    target?: string,
    onVerificationComplete?: (verificationId: string) => void,
  ): Promise<BankAccountVerificationIdResponse> {
    return new Promise((resolve, reject) => {
      this.open(target)
        .then((res) => {
          if (onVerificationComplete) {
            onVerificationComplete(res.bank_account_verification_id);
          }
          resolve({
            bank_account_verification_id: res.bank_account_verification_id,
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public open(target?: string): Promise<BankAccountVerificationIdResponse> {
    return this.getAuthorizationUrl()
      .then((response) => {
        this.buildContainer(response.authorization_url, target);
        return this._setupMessageListener();
      })
      .catch((err) => {
        this.buildErrorContainer(err.message, target);
        throw err;
      });
  }

  private _setupMessageListener(): Promise<BankAccountVerificationIdResponse> {
    this.removeEventListener();
    return new Promise((resolve, reject) => {
      this._messageHandler = (e: MessageEvent) => {
        const data = e.data;
        if (data && typeof data === 'object') {
          if (data.step === 'REDIRECT' && data.loginId && data.requestId) {
            // Handle redirect event with loginId and requestId
            this.saveBankAccountVerification({
              verification_code: data.loginId,
              request_id: data.requestId,
              bank_account_id: data.accountId,
            })
              .then(resolve)
              .catch(reject);
          }
        }
      };
      window.addEventListener('message', this._messageHandler);
    });
  }

  public removeEventListener() {
    if (this._messageHandler) {
      window.removeEventListener('message', this._messageHandler);
      this._messageHandler = null;
    }
  }

  public async saveBankAccountVerification(
    request: BankAccountVerificationIdRequest,
  ): Promise<BankAccountVerificationIdResponse> {
    return fetch(API_ENDPOINTS.BANK_ACCOUNT_VERIFICATION(this._publicSquare._apiUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this._publicSquare._apiKey!,
      },
      body: JSON.stringify(request),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => (res.errors ? { error: res } : res));
  }

  private buildContainer(url: string, target?: string) {
    const targetContainer = target ? document.querySelector(target) : document.body;
    if (!targetContainer) {
      throw Error('Target container not found');
    }

    const container = document.createElement('div');
    container.id = 'publicsquare-verification-widget';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.height = '100%';
    container.style.width = '100%';
    targetContainer.appendChild(container);

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '768px';
    iframe.style.border = '1px solid #d1d5dc';
    iframe.style.borderRadius = '4px';
    container.appendChild(iframe);
  }

  private buildErrorContainer(error: string, target?: string) {
    const targetContainer = target ? document.querySelector(target) : document.body;
    if (!targetContainer) {
      throw Error('Target container not found');
    }

    const container = document.createElement('div');
    container.id = 'publicsquare-verification-widget';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.height = '100%';
    container.style.width = '100%';
    container.textContent = error;
    targetContainer.appendChild(container);
  }

  private async getAuthorizationUrl(): Promise<BankAccountVerificationUrlResponse> {
    const res = await fetch(API_ENDPOINTS.BANK_ACCOUNT_VERIFICATION(this._publicSquare._apiUrl), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this._publicSquare._apiKey!,
      },
    });

    if (!res.ok) {
      throw Error(ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_VERIFICATION_NOT_ENABLED);
    }

    return await res.json();
  }
}
