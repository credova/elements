'use client';

import { Technology } from './HomeSection';
import ApplePayElementsJs from './ApplePayElements/ApplePayElementsJs';
import ApplePayElementsReact from './ApplePayElements/ApplePayElementsReact';

export default function ApplePayFormColumn({ type }: { type: Technology }) {
  return (
    <div className="space-y-2 rounded-lg bg-white p-4 shadow-sm">
      <h3 className="text-lg font-medium">Apple Pay</h3>
      <p className="text-sm">Generated Apple Pay button from PublicSquare elements.</p>
      {type === 'react' && <ApplePayElementsReact />}
      {type === 'javascript' && <ApplePayElementsJs />}
    </div>
  );
}
