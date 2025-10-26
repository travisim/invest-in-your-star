import React from 'react';
import { Button } from '../../ui';

interface ClaimInterfaceProps {
  claimableAmount: number;
}

export const ClaimInterface = ({ claimableAmount }: ClaimInterfaceProps) => {
  const handleClaim = () => {
    // Logic to handle revenue claim will go here
    console.log('Claiming revenue...');
  };

  return (
    <div>
      <p>Claimable Revenue: {claimableAmount} USDC</p>
      <Button variant="primary" size="md" onClick={handleClaim} disabled={claimableAmount === 0}>
        Claim
      </Button>
    </div>
  );
};
