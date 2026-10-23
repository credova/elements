import type { ApplePayButtonWidgetOptions } from '@/types';

export class ApplePayButtonWidget {
  private options: Required<ApplePayButtonWidgetOptions>;
  private ref: HTMLElement | null;

  constructor(options: ApplePayButtonWidgetOptions = {}) {
    this.options = {
      id: options.id || 'apple-pay-btn',
      buttonStyle: options.buttonStyle || 'black',
      type: options.type || 'buy',
      locale: options.locale || 'en-US',
      style: options.style || {},
      disabled: options.disabled ?? false,
      onClick: options.onClick || (() => {}),
    };
    this.ref = null;
  }

  createApplePayButton(): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptId = 'apple-pay-sdk-script';
      const src = 'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js';
      if (document.getElementById(scriptId)) return resolve();
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  createApplePayButtonStyle(style: ApplePayButtonWidgetOptions['style'] = {}): string {
    return `
      apple-pay-button {
        --apple-pay-button-width: ${style?.width || '140px'};
        --apple-pay-button-height: ${style?.height || '30px'};
        --apple-pay-button-border-radius: ${style?.borderRadius || '5px'};
        --apple-pay-button-padding: ${style?.padding || '5px 0px'};
      }
    `;
  }

  render(container: HTMLElement): void {
    this.createApplePayButton().then(() => {
      const styleTag = document.createElement('style');
      styleTag.textContent = this.createApplePayButtonStyle(this.options.style);
      container.appendChild(styleTag);

      const btn = document.createElement('apple-pay-button');
      btn.id = this.options.id;
      btn.setAttribute('buttonstyle', this.options.buttonStyle);
      btn.setAttribute('type', this.options.type);
      btn.setAttribute('locale', this.options.locale);
      if (this.options.disabled) {
        btn.setAttribute('disabled', 'true');
      }
      this.ref = btn;
      container.appendChild(btn);

      btn.addEventListener('click', () => {
        if (!this.options.disabled && typeof this.options.onClick === 'function') {
          this.options.onClick();
        }
      });

      this.updateButtonStyle(btn, this.options.disabled);
    });
  }

  updateButtonStyle(button: HTMLElement, disabled: boolean): void {
    const cursor = disabled ? 'not-allowed' : 'pointer';
    const opacity = disabled ? '0.5' : '1';
    button.style.cursor = cursor;
    button.style.opacity = opacity;
  }

  setDisabled(disabled: boolean): void {
    this.options.disabled = disabled;
    if (this.ref) {
      if (disabled) {
        this.ref.setAttribute('disabled', 'true');
      } else {
        this.ref.removeAttribute('disabled');
      }
      this.updateButtonStyle(this.ref, disabled);
    }
  }
}
