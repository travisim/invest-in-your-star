import React from 'react';
import { Input, Button } from '../../ui';

export const TokenPurchase = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle token purchase will go here
    console.log('Purchasing tokens...');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Amount" type="number" />
      <Button variant="primary" size="md" type="submit">
        Purchase
      </Button>
    </form>
  );
};
