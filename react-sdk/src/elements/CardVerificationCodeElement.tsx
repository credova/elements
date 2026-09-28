import React, { forwardRef } from 'react';
import PublicSquareElement from './PublicSquareElement';
import * as Types from '../types';

export const CardVerificationCodeElement = forwardRef<
  Types.CardVerificationCodeElement,
  Types.CardVerificationCodeElementProps
>(function Component(props, ref) {
  return <PublicSquareElement type="cardVerificationCode" {...props} ref={ref} />;
});

/** @deprecated Use `CardVerificationCodeElement` instead. */
export const CardVerifcationCodeElement = CardVerificationCodeElement;
