import React from 'react';
import { Card } from '../../ui';

interface LicenseNFTProps {
  contentTitle: string;
  licenseHash: string;
  expiresAt: string;
}

export const LicenseNFT = ({ contentTitle, licenseHash, expiresAt }: LicenseNFTProps) => {
  return (
    <Card>
      <h3>License NFT</h3>
      <p>Content: {contentTitle}</p>
      <p>License Hash: {licenseHash}</p>
      <p>Expires At: {expiresAt}</p>
    </Card>
  );
};
