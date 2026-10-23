import React, { RefObject, useEffect, useRef } from 'react';
import * as Types from '../types';

const updateButtonStyle = (button?: Element | null, disabled?: boolean): void => {
  const cursor = disabled === true ? 'not-allowed' : 'pointer';
  const opacity = disabled === true ? '0.5' : '1';
  button?.setAttribute('style', `cursor: ${cursor}; opacity: ${opacity};`);
};

const ApplePayButtonElement: React.FC<Types.ApplePayButtonElementProps> = ({
  id,
  buttonStyle = 'black',
  type = 'buy',
  locale = 'en-US',
  onClick,
  style,
  disabled,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = 'apple-pay-sdk-script';
    const applePayScriptSrc = 'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js';

    if (document.getElementById(scriptId) !== null) {
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = applePayScriptSrc;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const button = ref.current;
    if (!button) return;

    const handleClick = (): void => {
      if (disabled !== true && onClick !== undefined) {
        onClick();
      }
    };
    button.addEventListener('click', handleClick);

    return () => {
      button.removeEventListener('click', handleClick);
    };
  }, [onClick, disabled]);

  useEffect(() => {
    // This workaround modifies the cursor and opacity of the button. Due to the button being rendered in a Shadow DOM,
    // we face limitations with CSS and element attributes. Direct style application from the parent element,
    // or using pseudo-classes like :hover or :disabled, is not possible.
    let cancelled = false;
    customElements.whenDefined('apple-pay-button').then(() => {
      const shadowRoot = ref.current?.shadowRoot;
      if (!cancelled && shadowRoot) {
        updateButtonStyle(shadowRoot.querySelector('div > button'), disabled);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [disabled]);

  const createApplePayButtonStyle = (style?: Types.ApplePayButtonElementProps['style']): string => `
    apple-pay-button {
        --apple-pay-button-width: ${style?.width ?? '140px'};
        --apple-pay-button-height: ${style?.height ?? '30px'};
        --apple-pay-button-border-radius: ${style?.borderRadius ?? '5px'};
        --apple-pay-button-padding: ${style?.padding ?? '5px 0px'};
    }
`;

  const createApplePayButton = (
    id: string,
    buttonstyle: string,
    type: string,
    locale: string,
    ref: RefObject<HTMLDivElement>,
  ): React.ReactElement<
    {
      id: string;
      buttonstyle: string;
      type: string;
      locale: string;
      ref: RefObject<HTMLDivElement>;
    },
    string | React.JSXElementConstructor<'apple-pay-button'>
  > =>
    React.createElement('apple-pay-button', {
      id,
      buttonstyle,
      type,
      locale,
      ref,
    });

  return (
    <>
      {/* these CSS variables are used to style the button
            more details here https://applepaydemo.apple.com */}
      <style>{createApplePayButtonStyle(style)}</style>
      {/* <apple-pay-button> is not a valid JSX element
            so we need to use React.createElement() to render it
            and pass the props to it */}
      {createApplePayButton(id, buttonStyle, type, locale, ref as RefObject<HTMLDivElement>)}
    </>
  );
};

export default ApplePayButtonElement;
