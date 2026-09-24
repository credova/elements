'use client';

import { Technology } from './HomeSection';
import CvcRecollectionJs from './CvcRecollectionElements/CvcRecollectionJs';
import CvcRecollectionReact from './CvcRecollectionElements/CvcRecollectionReact';

export default function CvcRecollectionFormColumn({ type }: { type: Technology }) {
  return (
    <div className="space-y-2 rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-medium">CVV Recollection Form</h3>
      <p className="text-sm">
        Enter an existing card token and a freshly re-entered CVV to attach it to that saved card,
        without the value ever reaching the merchant or PSQ servers.
      </p>
      {type === 'react' && <CvcRecollectionReact />}
      {type === 'javascript' && <CvcRecollectionJs />}
    </div>
  );
}
