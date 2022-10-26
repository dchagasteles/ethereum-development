export enum ContractId {
  IlluviumToken = 'IlluviumToken',
}

export type EthereumAddress = string;

export interface IAssetDetails {
  name: string;
  version: string;
  address: EthereumAddress;
  chainId: number;
}

export interface IApproveMessageData {
  nonce: number;
  approve: boolean;
  user: EthereumAddress;
  contract: EthereumAddress;
}

export interface IBackupTransferMessageData {
  from: EthereumAddress;
  amount: number;
  nonce: number;
}
