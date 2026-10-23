'use client';

import CardElementsJs from '@/components/CardElements/CardElementsJs';
import CardElementsReact from '@/components/CardElements/CardElementsReact';
import { Technology } from './HomeSection';

export default function DebitCreditFormColumn({
  type,
  allInOne,
}: {
  type: Technology;
  allInOne: boolean;
}) {
  return (
    <div className="space-y-2 rounded-lg bg-white p-4 shadow-sm">
      <h3 className="text-lg font-medium">Debit/Credit Card Form</h3>
      <p className="text-sm">This is a form for debit/credit cards.</p>
      {type === 'react' && <CardElementsReact allInOne={allInOne} />}
      {type === 'javascript' && <CardElementsJs allInOne={allInOne} />}
    </div>
  );
}
