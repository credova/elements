import React, { forwardRef, useEffect } from 'react';
import { usePublicSquare } from '../core/PublicSquareProvider';
import { ElementProps } from '../types';

const PublicSquareElement = forwardRef<any, ElementProps>(function Component(
  { id, type, options = {} },
  ref,
) {
  const { publicsquare, createElement } = usePublicSquare();

  function setRef(element: ReturnType<typeof createElement>) {
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  }

  let init = false;
  useEffect(() => {
    if (!init && publicsquare) {
      init = true;
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

      setRef(element);
    }
  }, [publicsquare]);

  if (!id || !type || !ref) {
    console.error(`PublicSquare element requires an id, type, & ref!`);
    return null;
  } else {
    return <div id={id} />;
  }
});

export default PublicSquareElement;
