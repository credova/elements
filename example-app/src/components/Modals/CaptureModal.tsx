import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import cx from 'classnames';

type Props = {
  message?: object;
  onClose: () => void;
  error?: boolean;
};

export default function CaptureModal({ message, error, onClose }: Props) {
  return (
    <Dialog className="relative z-10" open={!!message} onClose={onClose}>
      <DialogBackdrop
        transition
        className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-100 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-xl sm:p-6 sm:data-closed:translate-y-0 sm:data-closed:scale-95"
          >
            <div>
              <div
                className={cx(
                  'mx-auto flex h-12 w-12 items-center justify-center rounded-full',
                  error ? 'bg-red-100' : 'bg-green-100',
                )}
              >
                {error ? (
                  <XMarkIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                ) : (
                  <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                )}
              </div>
              <div className="mt-3 text-center sm:mt-5" data-testid="capture-modal">
                <DialogTitle as="h3" className="text-base leading-6 font-semibold text-gray-900">
                  {error ? 'Capture failed' : 'Capture successful'}
                </DialogTitle>
                <div className="mt-2 space-y-1 text-left">
                  <p>Response data:</p>
                  {message &&
                    Object.entries(message).map(([key, value], i) => (
                      <div key={i} className="flex items-center justify-between">
                        <b>{key}</b>
                        <div className="mx-4 grow border-4 border-b border-dotted border-gray-100" />
                        <span className="text-sm text-gray-700">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 focus-visible:outline-solid"
                onClick={() => onClose()}
              >
                Go back to examples
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
