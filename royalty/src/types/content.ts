export type ContentStatus = 'PENDING' | 'ACTIVE' | 'ARCHIVED';

export interface Content {
  id: number;
  fingerprint: string;
  title: string;
  scopeUri: string;
  owners: string[];
  status: ContentStatus;
  tokenId?: string;
  saleId?: string;
}

export interface Offering {
  contentId: number;
  supply: bigint;
  basePrice: bigint;
  slope: bigint;
  targetRaise: bigint;
  usdcId: string;
  tokenId: string;
  saleId: string;
}
