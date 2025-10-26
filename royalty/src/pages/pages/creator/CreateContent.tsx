import React from 'react';
import { PageLayout } from '../../components/layout';
import { ContentWizard } from '../../components/features/content';

const CreateContent = () => {
  return (
    <PageLayout>
      <h2>Create New Content</h2>
      <ContentWizard />
    </PageLayout>
  );
};

export default CreateContent;
