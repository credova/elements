import { GooglePayButtonWidget } from '../GooglePayButtonWidget';
import { PublicSquare } from '@/PublicSquare';

const baseOptions = {
  id: 'gpay',
  environment: 'TEST' as const,
  merchantName: 'Test Merchant',
  transactionInfo: {
    totalPriceStatus: 'FINAL' as const,
    totalPrice: '1.00',
    currencyCode: 'USD',
    countryCode: 'US',
  },
};

const tokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: { gateway: 'basistheory', gatewayMerchantId: 'gw-123' },
};

function widget(options: Record<string, unknown> = {}) {
  return new GooglePayButtonWidget({ ...baseOptions, ...options } as any, new PublicSquare());
}

describe('GooglePayButtonWidget request building', () => {
  it('always requests a FULL billing address', () => {
    const card = widget().buildCardPaymentMethod();
    expect(card.parameters.billingAddressRequired).toBe(true);
    expect(card.parameters.billingAddressParameters).toEqual({
      format: 'FULL',
      phoneNumberRequired: true,
    });
  });

  it('does not request shipping by default', () => {
    const w = widget();
    const request = w.buildPaymentDataRequest(
      w.buildCardPaymentMethod(),
      tokenizationSpecification,
    );
    expect(request.shippingAddressRequired).toBeUndefined();
  });

  it('requests shipping when enabled', () => {
    const w = widget({
      shippingAddressRequired: true,
      shippingAddressParameters: { allowedCountryCodes: ['US'], phoneNumberRequired: true },
    });
    const request = w.buildPaymentDataRequest(
      w.buildCardPaymentMethod(),
      tokenizationSpecification,
    );
    expect(request.shippingAddressRequired).toBe(true);
    expect(request.shippingAddressParameters).toEqual({
      allowedCountryCodes: ['US'],
      phoneNumberRequired: true,
    });
  });

  it('keeps existing request fields intact', () => {
    const w = widget();
    const request = w.buildPaymentDataRequest(
      w.buildCardPaymentMethod(),
      tokenizationSpecification,
    );
    expect(request.apiVersion).toBe(2);
    expect(request.transactionInfo.totalPrice).toBe('1.00');
    expect(request.allowedPaymentMethods[0].tokenizationSpecification).toBe(
      tokenizationSpecification,
    );
    expect(request.allowedPaymentMethods[0].parameters.billingAddressRequired).toBe(true);
    expect(request.merchantInfo.merchantName).toBe('Test Merchant');
  });
});
