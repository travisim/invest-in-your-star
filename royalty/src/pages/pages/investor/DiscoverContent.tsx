import React from 'react';
import { PageLayout } from '../../components/layout';
import { ContentCard } from '../../components/features/content';

const DiscoverContent = () => {
  return (
    <PageLayout>
      <h2>Discover Content</h2>
      <div className="content-grid">
        {/* Map over content and render ContentCard components */}
        <ContentCard title="Sample Title" artist="Sample Artist" />
      </div>
    </PageLayout>
  );
};

export default DiscoverContent;
