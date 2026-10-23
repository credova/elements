'use client';

import { Technology } from './HomeSection';
import BankAccountVerificationElementJs from './BankAccountElements/BankAccountVerificationElementJs';
import BankAccountVerificationElementReact from './BankAccountElements/BankAccountVerificationElementReact';

export default function BankAccountVerificationFormColumn({ type }: { type: Technology }) {
  return (
    <div className="space-y-2 rounded-lg bg-white p-4 shadow-sm">
      <h3 className="text-lg font-medium">Bank Account Form</h3>
      <p className="text-sm">This is a form for bank account verification.</p>

      {type === 'react' && <BankAccountVerificationElementReact />}
      {type === 'javascript' && <BankAccountVerificationElementJs />}
    </div>
  );
}
