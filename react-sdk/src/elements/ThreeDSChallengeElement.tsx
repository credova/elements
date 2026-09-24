import React, { useEffect, useId, useRef } from 'react';
import { usePublicSquare } from '../core/PublicSquareProvider';

export type ThreeDSChallengeResult = {
  id: string;
  isCompleted: boolean;
  authenticationStatus: string;
};

export type ThreeDSChallengeProps = {
  sessionId: string;
  acsChallengeUrl: string;
  acsTransactionId: string;
  threeDsVersion: string;
  containerId?: string;
  onComplete: (result: ThreeDSChallengeResult) => void;
  onFailure?: (error: Error) => void;
};

export const ThreeDSChallengeElement = ({
  sessionId,
  acsChallengeUrl,
  acsTransactionId,
  threeDsVersion,
  containerId: containerIdProp,
  //environment = 'PRODUCTION',
  onComplete,
  onFailure,
}: ThreeDSChallengeProps) => {
  const generatedId = useId();
  const containerId = containerIdProp ?? `threeds-challenge-${generatedId}`;
  const { publicsquare } = usePublicSquare();
  const started = useRef(false);

  useEffect(() => {
    if (!publicsquare || started.current) return;
    started.current = true;

    publicsquare.threeDs
      .startChallenge({
        sessionId,
        acsChallengeUrl,
        acsTransactionId,
        threeDsVersion,
        containerId,
        //environment,
      })
      .then((result) => onComplete(result as ThreeDSChallengeResult))
      .catch((error: Error) => onFailure?.(error));
  }, [
    publicsquare,
    sessionId,
    acsChallengeUrl,
    acsTransactionId,
    threeDsVersion,
    //environment,
    onComplete,
    onFailure,
  ]);

  return <div id={containerId} />;
};
