import React from 'react';
import { Button } from '../../ui';

export const LicenseRequest = () => {
  const handleClick = () => {
    // Logic to handle license request will go here
    console.log('Requesting license...');
  };

  return (
    <Button variant="primary" size="md" onClick={handleClick}>
      Request License
    </Button>
  );
};
