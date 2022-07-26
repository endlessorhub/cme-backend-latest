export const BlockchainMicroServiceName = 'BLOCKCHAIN_MS';

export const BlockchainMicroServiceMessages = {
  GET_BALANCE: `${BlockchainMicroServiceName}_get_balance`,
};

export type GetBalanceMsReq = Readonly<{
  userId: number;
}>;
