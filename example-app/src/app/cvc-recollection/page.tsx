'use client';
import SubSection from '@/components/SubSection';
import CvcRecollectionFormColumn from '@/components/CvcRecollectionFormColumn';

export default function Page() {
  return (
    <div className="container mx-auto">
      <SubSection
        title="CVV Recollection Element"
        description="This example shows how to attach a re-entered CVV to a saved card's token with publicsquare.cards.updateCvc(). The CVV goes straight to Basis Theory and never touches a PSQ or merchant server."
        getStarted={{
          href: 'https://www.npmjs.com/package/@publicsquare/elements-js',
          label: 'Get Started',
        }}
        rightColumn={(type) => <CvcRecollectionFormColumn type={type} />}
      />
    </div>
  );
}
