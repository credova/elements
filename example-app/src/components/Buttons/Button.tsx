import { ButtonProps, Button as HeadlessButton } from '@headlessui/react';
import cx from 'classnames';
export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <HeadlessButton
      {...props}
      className={cx(
        'rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
        className,
      )}
    >
      {children}
    </HeadlessButton>
  );
}
