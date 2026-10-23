import React, { forwardRef, useEffect, useRef } from 'react';
import { usePublicSquare } from '../core/PublicSquareProvider';
import { ElementProps } from '../types';

const PublicSquareElement = forwardRef<any, ElementProps>(function Component(
  { id, type, options = {} },
  ref,
) {
  const { publicsquare, createElement } = usePublicSquare();

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current && publicsquare) {
      mounted.current = true;
      const element = createElement(type, options);
      const mountResult = element.mount(`#${id}`);

      // Handle both synchronous and asynchronous mount functions
      // Only check for Promise if the mount result is not undefined/void
      if (mountResult !== undefined && mountResult !== null) {
        const result = mountResult as any;
        if (typeof result.then === 'function') {
          result.catch((error: any) => {
            console.error('Failed to mount element:', error);
          });
        }
      }

      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    }
  }, [publicsquare, createElement, type, options, id, ref]);

  if (!id || !type || !ref) {
    console.error(`PublicSquare element requires an id, type, & ref!`);
    return null;
  } else {
    return <div id={id} />;
  }
});

export default PublicSquareElement;
