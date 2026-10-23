'use client';

import { Technology } from './HomeSection';
import BankAccountElementsJs from './BankAccountElements/BankAccountElementsJs';
import BankAccountElementsReact from './BankAccountElements/BankAccountElementsReact';

export default function BankAccountFormColumn({
  type,
  allInOne,
}: {
  type: Technology;
  allInOne: boolean;
}) {
  return (
    <div className="space-y-2 rounded-lg bg-white p-4 shadow-sm">
      <h3 className="text-lg font-medium">Bank Account Form</h3>
      <p className="text-sm">This is a form for bank accounts.</p>
      {type === 'react' && <BankAccountElementsReact allInOne={allInOne} />}
      {type === 'javascript' && <BankAccountElementsJs allInOne={allInOne} />}
    </div>
  );
}
