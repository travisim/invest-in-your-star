import React from 'react';
import { PageLayout } from '../../components/layout';
import { Button, Input } from '../../components/ui';

const KYCFlow = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for KYC submission will go here
    console.log('Submitting KYC...');
  };

  return (
    <PageLayout>
      <h2>KYC Verification</h2>
      <form onSubmit={handleSubmit}>
        <Input label="Full Name" type="text" />
        <Input label="Country" type="text" />
        <Button variant="primary" size="md" type="submit">
          Submit
        </Button>
      </form>
    </PageLayout>
  );
};

export default KYCFlow;
