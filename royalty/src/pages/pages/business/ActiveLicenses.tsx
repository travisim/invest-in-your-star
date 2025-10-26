import React from 'react';
import { PageLayout } from '../../components/layout';
import { LicenseNFT } from '../../components/features/licensing';

const ActiveLicenses = () => {
  return (
    <PageLayout>
      <h2>Active Licenses</h2>
      <LicenseNFT
        contentTitle="Sample Title"
        licenseHash="0x123..."
        expiresAt="2026-10-25"
      />
      {/* Map over active licenses and render LicenseNFT components */}
    </PageLayout>
  );
};

export default ActiveLicenses;
