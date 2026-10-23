'use client';

import { Technology } from './HomeSection';
import GooglePayElementsJs from './GooglePayElements/GooglePayElementsJs';
import GooglePayElementsReact from './GooglePayElements/GooglePayElementsReact';

export default function GooglePayFormColumn({ type }: { type: Technology }) {
  return (
    <div className="space-y-2 rounded-lg bg-white p-4 shadow-sm">
      <h3 className="text-lg font-medium">Google Pay</h3>
      <p className="text-sm">Generated Google Pay button from PublicSquare elements.</p>
      {type === 'react' && <GooglePayElementsReact />}
      {type === 'javascript' && <GooglePayElementsJs />}
    </div>
  );
}
