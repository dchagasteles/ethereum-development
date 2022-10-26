import { IAssetDetails, IBackupTransferMessageData } from './types';
import { utils } from 'ethers';
import { ecsign } from 'ethereumjs-util';

const { keccak256, defaultAbiCoder, toUtf8Bytes, solidityPack } = utils;

const BACKUP_TRANSFER_TYPE_HASH = keccak256(
  toUtf8Bytes('BackupTransfer(bytes32 warning,address from,uint amount,uint256 nonce)')
);

export function getDomainSeparator(
  name: string,
  version: string,
  tokenAddress: string,
  chainId: number
) {
  return keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        keccak256(
          toUtf8Bytes(
            'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
          )
        ),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes(version)),
        chainId,
        tokenAddress,
      ]
    )
  );
}

export function getBackupTransferBorrowMessage(
  tokenDetails: IAssetDetails,
  data: IBackupTransferMessageData
) {
  const DOMAIN_SEPARATOR = getDomainSeparator(
    tokenDetails.name,
    tokenDetails.version,
    tokenDetails.address,
    tokenDetails.chainId
  );
  const warning = keccak256(toUtf8Bytes(`You are transfering tokens to backup`));

  return keccak256(
    solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ['bytes32', 'bytes32', 'address', 'uint256', 'uint256'],
            [BACKUP_TRANSFER_TYPE_HASH, warning, data.from, data.amount, data.nonce]
          )
        ),
      ]
    )
  );
}

export async function signBackupTransferMessage(
  privateKey: string,
  tokenDetails: IAssetDetails,
  messageData: IBackupTransferMessageData
): Promise<{ v: number; r: Buffer; s: Buffer }> {
  const data = getBackupTransferBorrowMessage(tokenDetails, messageData);
  const { v, r, s } = ecsign(
    Buffer.from(data.slice(2), 'hex'),
    Buffer.from(privateKey.slice(2), 'hex')
  );

  return { v, r, s };
}
