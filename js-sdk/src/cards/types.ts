/**
 * Raw Basis Theory response to `PATCH /tokens/{id}` for a card token, as returned to
 * `cards.updateCvc()`. BT returns camelCase top-level keys; `data` keeps the card's
 * snake_case fields and is masked (the CVC is never echoed back). Only mapped into
 * `CardUpdateCvcResponse` — never returned to merchants as-is,
 * so it is intentionally not exported from the package.
 */
export type BasisTheoryCardTokenUpdateResponse = {
  id: string;
  type: 'card';
  tenantId: string;
  data: {
    number: string;
    expiration_month: number;
    expiration_year: number;
  };
  enrichments?: {
    binDetails?: Record<string, unknown>;
    cardDetails?: {
      bin: string;
      last4: string;
    };
  };
  card?: {
    bin: string;
    last4: string;
    expirationMonth: number;
    expirationYear: number;
    brand: string;
    funding?: string;
    authentication?: string;
    issuer?: { country: string; name: string };
    issuerCountry?: { alpha2: string; name: string; numeric: string };
    segment?: string;
    product?: { code: string };
  };
  createdBy: string;
  createdAt: string;
  modifiedBy?: string;
  modifiedAt?: string;
  fingerprint?: string;
  fingerprintExpression?: string;
  mask?: Record<string, string>;
  privacy?: {
    classification: string;
    impactLevel: string;
    restrictionPolicy: string;
  };
  searchIndexes?: string[];
  containers?: string[];
  aliases?: string[];
};
