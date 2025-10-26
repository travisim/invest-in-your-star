import { useContract } from './useContract';

export const useStaking = (contentId: string) => {
  const { write: stake, loading: isStaking } = useContract('staking_escrow_contract_id');
  const { write: unstake, loading: isUnstaking } = useContract('staking_escrow_contract_id');

  return { stake, isStaking, unstake, isUnstaking };
};
