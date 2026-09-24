//Basis Theory
export type ThreeDsCreateSessionResponse = {
  id: string;
  cardBrand?: string;
  additionalCardBrands: string[];
};

//API
export type SaveThreeDsSessionRequest = {
  bt_session_id: string;
  payment_intent_id: string;
  challenge_preference?: string;
  exemption_request_reason?: string;
};
//API
export type SaveThreeDsSessionResponse = {
  id: string;
  bt_session_id: string;
  card_brand: string;
  acs_transaction_id: string;
  additional_card_brands: string[];
};

export type ValidatedSaveThreeDsSessionRequest = {
  validated: SaveThreeDsSessionRequest;
};

export type ThreeDsStartChallengeInput = {
  sessionId: string;
  acsChallengeUrl: string;
  acsTransactionId: string;
  threeDsVersion: string;
  containerId?: string;
};

export type ThreeDsStartChallengeResponse = {
  id: string;
  isCompleted: boolean;
  authenticationStatus: string;
};
