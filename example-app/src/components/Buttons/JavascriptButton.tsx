import { HTMLAttributes } from 'react';
import cx from 'classnames';

export default function JavascriptButton(
  props: HTMLAttributes<HTMLButtonElement> & { selected?: boolean },
) {
  return (
    <button
      data-testid="js-type-button"
      className={cx(
        'inline-flex items-center space-x-2 rounded-md border border-yellow-300 bg-yellow-300 px-2 transition-all hover:border-yellow-500',
        props.selected ? 'border-yellow-500 opacity-100' : 'opacity-50 hover:opacity-100',
      )}
      {...props}
    >
      <span className="font-sans font-bold">JS</span>
      <span className="text-sm text-yellow-700 italic">Javascript</span>
    </button>
  );
}
