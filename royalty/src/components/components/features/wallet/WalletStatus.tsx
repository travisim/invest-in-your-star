import React from 'react';

interface WalletStatusProps {
  isConnected: boolean;
  address?: string;
}

export const WalletStatus = ({ isConnected, address }: WalletStatusProps) => {
  if (!isConnected) {
    return <div>Not Connected</div>;
  }

  return (
    <div>
      <p>Connected</p>
      <p>{address}</p>
    </div>
  );
};
