import React from 'react';
import { PageLayout } from '../../components/layout';
import { ClaimInterface } from '../../components/features/revenue';

const Earnings = () => {
  return (
    <PageLayout>
      <h2>My Earnings</h2>
      <ClaimInterface claimableAmount={100} />
      {/* Add earnings components here */}
    </PageLayout>
  );
};

export default Earnings;
