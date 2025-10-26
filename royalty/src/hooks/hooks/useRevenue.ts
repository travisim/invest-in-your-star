import { useContract } from './useContract';

export const useRevenue = (contentId: string) => {
  const { read: getClaimable, loading: isLoadingClaimable } = useContract('revenue_distributor_contract_id');
  const { write: claim, loading: isClaiming } = useContract('revenue_distributor_contract_id');

  return { getClaimable, isLoadingClaimable, claim, isClaiming };
};
