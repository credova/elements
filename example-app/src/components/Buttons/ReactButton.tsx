import Image from 'next/image';
import ReactLogo from '../../../public/react.svg';
import { HTMLAttributes } from 'react';
import cx from 'classnames';

export default function ReactButton(
  props: HTMLAttributes<HTMLButtonElement> & { selected?: boolean },
) {
  return (
    <button
      data-testid="react-type-button"
      className={cx(
        'inline-flex items-center space-x-2 rounded-md border border-cyan-300 bg-cyan-300 px-2 transition-all hover:border-cyan-500',
        props.selected ? 'border-cyan-500 opacity-100' : 'opacity-50 hover:opacity-100',
      )}
      {...props}
    >
      <span className="inline-flex items-center font-sans font-bold" style={{ height: 24 }}>
        <Image src={ReactLogo} alt="React Logo" width={20} height={20} />
      </span>
      <span className="text-sm text-cyan-700 italic">React</span>
    </button>
  );
}
