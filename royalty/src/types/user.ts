export type KYCLevel = 'LEVEL_1' | 'LEVEL_2';
export type Role = 'CREATOR' | 'INVESTOR' | 'BUSINESS';

export interface User {
  id: string;
  wallet: string;
  kycLevel: KYCLevel;
  country: string;
  roles: Role[];
  createdAt: Date;
}
