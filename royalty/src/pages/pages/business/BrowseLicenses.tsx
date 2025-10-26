import React from 'react';
import { PageLayout } from '../../components/layout';
import { ContentCard } from '../../components/features/content';

const BrowseLicenses = () => {
  return (
    <PageLayout>
      <h2>Browse Licenses</h2>
      <div className="content-grid">
        {/* Map over licensable content and render ContentCard components */}
        <ContentCard title="Sample Title" artist="Sample Artist" />
      </div>
    </PageLayout>
  );
};

export default BrowseLicenses;
