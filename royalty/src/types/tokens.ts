export interface Stake {
  contentId: number;
  address: string;
  amount: bigint;
  sinceEpoch: number;
  lastChange: Date;
}

export interface Epoch {
  contentId: number;
  epochId: number;
  startTime: Date;
  endTime: Date;
  totalStaked: bigint;
  totalDeposit: bigint;
  finalized: boolean;
}
