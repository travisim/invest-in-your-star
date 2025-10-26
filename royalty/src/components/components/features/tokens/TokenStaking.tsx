import React from 'react';
import { Input, Button } from '../../ui';

export const TokenStaking = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle token staking will go here
    console.log('Staking tokens...');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Amount to Stake" type="number" />
      <Button variant="primary" size="md" type="submit">
        Stake
      </Button>
    </form>
  );
};
