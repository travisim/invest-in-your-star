import React from 'react';
import { PageLayout } from '../../components/layout';
import { RevenueChart } from '../../components/features/revenue';

const CreatorAnalytics = () => {
  return (
    <PageLayout>
      <h2>Creator Analytics</h2>
      <RevenueChart />
      {/* Add more analytics components here */}
    </PageLayout>
  );
};

export default CreatorAnalytics;
