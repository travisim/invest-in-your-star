import React from 'react';
import { Button } from '../../ui';

export const WalletConnect = () => {
  const handleConnect = () => {
    // Logic to connect to Freighter wallet will go here
    console.log('Connecting wallet...');
  };

  return (
    <Button variant="primary" size="md" onClick={handleConnect}>
      Connect Wallet
    </Button>
  );
};
