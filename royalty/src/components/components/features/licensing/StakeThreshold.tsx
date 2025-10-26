import React from 'react';

interface StakeThresholdProps {
  threshold: number;
  userStake: number;
}

export const StakeThreshold = ({ threshold, userStake }: StakeThresholdProps) => {
  const hasMetThreshold = userStake >= threshold;

  return (
    <div>
      <p>Stake Threshold: {threshold} tokens</p>
      <p>Your Stake: {userStake} tokens</p>
      <p>Status: {hasMetThreshold ? 'Met' : 'Not Met'}</p>
    </div>
  );
};
