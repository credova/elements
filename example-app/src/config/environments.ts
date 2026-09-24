type EnvironmentOptions = {
  apiKey: string;
  apiUrl: string;
};

const staging: EnvironmentOptions = {
  apiUrl: 'https://staging.api.publicsquare.com',
  apiKey: process.env.NEXT_PUBLIC_PUBLICSQUARE_KEY!,
};

const production: EnvironmentOptions = {
  apiUrl: 'https://api.publicsquare.com',
  apiKey: process.env.NEXT_PUBLIC_PUBLICSQUARE_KEY!,
};

// Switch between 'staging' and 'production' here to change all payment method URLs at once
//NEXT_PUBLIC_PUBLICSQUARE_KEY - change for staging or production value in the .env
export const environment = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' ? staging : production;
