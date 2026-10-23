'use client';

import { Field, Label, Switch } from '@headlessui/react';

export default function AllInOneToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Field className="flex items-center space-x-4 text-sm">
      <Label as="span">
        <span className="font-medium text-gray-900">Individual inputs</span>{' '}
      </Label>
      <Switch
        data-testid="all-in-one-toggle"
        checked={value}
        onChange={(checked) => {
          onChange(checked);
        }}
        className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-hidden data-checked:bg-indigo-600"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-5"
        />
      </Switch>
      <Label as="span">
        <span className="font-medium text-gray-900">All in one input</span>{' '}
      </Label>
    </Field>
  );
}
