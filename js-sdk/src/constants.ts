const ELEMENTS_INIT_ERROR_MESSAGE = 'PublicSquare Elements was not properly initialized.';

const ELEMENTS_TYPE_NOT_SUPPORTED =
  'PublicSquare Elements does not support the type of element specified.';

const ELEMENTS_NOM_DOM_ERROR_MESSAGE =
  'Tried to load PublicSquare Elements in a non-DOM environment. Only client-side environments are supported.';

const ELEMENTS_SCRIPT_LOAD_ERROR_MESSAGE = 'PublicSquare Elements did not load properly.';

const ELEMENTS_SCRIPT_UNKNOWN_ERROR_MESSAGE =
  'There was an unknown error when loading PublicSquare Elements. Check the console for details.';

const ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE =
  'PublicSquare SDK requires a pointer when initializing any element';

const ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_VERIFICATION_NOT_ENABLED =
  'Bank account verification is not enabled for this account. Please request access at https://portal.publicsquare.com/settings';

const ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_VERIFICATION_SAVE_ERROR_MESSAGE =
  'PublicSquare Elements did not save the bank account verification properly.';

const ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_ROUTING_NUMBER_LOAD_ERROR_MESSAGE =
  'PublicSquare Elements did not load the routing number element properly.';

const ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_ACCOUNT_NUMBER_LOAD_ERROR_MESSAGE =
  'PublicSquare Elements did not load the account number element properly.';

const CARD_BRANDS = [
  'visa',
  'mastercard',
  'american-express',
  'discover',
  'diners-club',
  'jcb',
  'unionpay',
  'maestro',
  'elo',
  'hiper',
  'hipercard',
  'mir',
  'unknown',
] as const;

const CARD_ICON_POSITIONS = ['left', 'right', 'none'] as const;

const AUTOCOMPLETE_VALUES = ['off', 'on'] as const;

const API_ENDPOINTS = {
  API_BASE_URL: `https://api.publicsquare.com`,
  APPLE_PAY_CREATE: (baseUrl: string) => `${baseUrl}/payment-methods/apple-pay`,
  APPLE_PAY_CREATE_SESSION: (baseUrl: string) => `${baseUrl}/payment-methods/apple-pay/session`,
  GOOGLE_PAY_CREATE: (baseUrl: string) => `${baseUrl}/payment-methods/google-pay`,
  GOOGLE_PAY_CONFIGURATION: (baseUrl: string) => `${baseUrl}/.well-known/google-pay-configuration`,
  BANK_ACCOUNT_CREATE: (baseUrl: string) => `${baseUrl}/payment-methods/bank-accounts`,
  BANK_ACCOUNT_VERIFICATION: (baseUrl: string) =>
    `${baseUrl}/payment-methods/bank-accounts/verification`,
  THREE_DS_CREATE_SESSION: (baseUrl: string) => `${baseUrl}/three-d-secure/sessions`,
};

const BASIS_THEORY_ENDPOINTS = {
  API_BASE_URL: `https://api.basistheory.com`,
  API_BASE_URL_TEST: `https://api.test.basistheory.com`,
  PROXY: (baseUrl: string) => `${baseUrl}/proxy`,

};

const BASIS_THEORY_KEYS = {
  CREATE_CARD_PRODUCTION: `key_prod_us_proxy_HiFqDwW49EZ8szKi8cMvQP`,
  CREATE_CARD_PRODUCTION_TEST_MODE: `key_test_us_proxy_AaEf6KrqHpa1ur7jyiZcNu`,
  CREATE_CARD_TEST: `key_test_us_proxy_FrL4kJFRXU1AwuYVnMbTnP`,//API STAGING
  THREE_DS: `key_prod_us_pub_7cC6EF431x2rKGwsnnuZPP`,
  THREE_DS_TEST: `key_test_us_pub_Tkia8nWTAWwFZ8QJyUJvES`,
};

export {
  ELEMENTS_INIT_ERROR_MESSAGE,
  ELEMENTS_TYPE_NOT_SUPPORTED,
  ELEMENTS_NOM_DOM_ERROR_MESSAGE,
  ELEMENTS_SCRIPT_LOAD_ERROR_MESSAGE,
  ELEMENTS_SCRIPT_UNKNOWN_ERROR_MESSAGE,
  ELEMENTS_PUBLICSQUARE_NO_POINTER_MESSAGE,
  ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_ROUTING_NUMBER_LOAD_ERROR_MESSAGE,
  ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_ACCOUNT_NUMBER_LOAD_ERROR_MESSAGE,
  ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_VERIFICATION_SAVE_ERROR_MESSAGE,
  ELEMENTS_PUBLICSQUARE_BANK_ACCOUNT_VERIFICATION_NOT_ENABLED,
  CARD_BRANDS,
  CARD_ICON_POSITIONS,
  AUTOCOMPLETE_VALUES,
  API_ENDPOINTS,
  BASIS_THEORY_ENDPOINTS,
  BASIS_THEORY_KEYS,
};
