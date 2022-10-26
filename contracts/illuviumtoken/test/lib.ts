import { deployments, ethers } from 'hardhat';
import { Signer, Wallet } from 'ethers';
import { assert } from 'chai';

import { IlluviumToken } from '../types';
import { EthereumAddress } from '../helpers/types';
import { signBackupTransferMessage } from '../helpers/message';
import { deployIlluviumToken, getIlluviumTokenDeployment } from '../helpers/contract';

export interface IAccount {
  address: EthereumAddress;
  signer: Signer;
  privateKey: string;
}

export interface TestVars {
  IlluviumToken: IlluviumToken;
  accounts: IAccount[];
}

const testVars: TestVars = {
  IlluviumToken: {} as IlluviumToken,
  accounts: {} as IAccount[],
};

export const getTokenDetails = async (IlluviumToken: IlluviumToken) => ({
  name: await IlluviumToken.name(),
  address: IlluviumToken.address,
  chainId: (await ethers.provider.getNetwork()).chainId,
  version: await IlluviumToken.version(),
});

export const backupTransferWithSignedMessage = async (
  IlluviumToken: IlluviumToken,
  from: IAccount,
  initiator: IAccount,
  amount: number
) => {
  const tokenDetails = {
    name: await IlluviumToken.name(),
    address: IlluviumToken.address,
    chainId: (await ethers.provider.getNetwork()).chainId,
    version: '1',
  };

  const nonce = (await IlluviumToken.userTransferAllowanceNonce(from.address)).toNumber();
  const { v, r, s } = await signBackupTransferMessage(from.privateKey, tokenDetails, {
    from: from.address,
    amount,
    nonce,
  });

  return await IlluviumToken.connect(initiator.signer).transferTokensToBackupWithSignedMessage(
    from.address,
    amount,
    v,
    r,
    s
  );
};

export const lastBlockNumber = async () => (await ethers.provider.getBlock('latest')).number;

export function runTestSuite(title: string, tests: (arg: TestVars) => void) {
  describe(title, function () {
    before(async () => {
      // we manually derive the signers address using the mnemonic
      // defined in the hardhat config
      const mnemonic = 'test test test test test test test test test test test junk';

      testVars.accounts = await Promise.all(
        (
          await ethers.getSigners()
        ).map(async (signer, index) => ({
          address: await signer.getAddress(),
          signer,
          privateKey: ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${index}`).privateKey,
        }))
      );
      assert.equal(
        new Wallet(testVars.accounts[0].privateKey).address,
        testVars.accounts[0].address,
        'invalid mnemonic or address'
      );
    });

    beforeEach(async () => {
      const setupTest = deployments.createFixture(
        async ({ deployments, getNamedAccounts, ethers }, options) => {
          await deployments.fixture(); // ensure you start from a fresh deployments
        }
      );

      await setupTest();

      // testVars.IlluviumToken = await deployIlluviumToken('Illumvium Token', 'ILLT', 18);
      testVars.IlluviumToken = await getIlluviumTokenDeployment();
    });

    tests(testVars);
  });
}
