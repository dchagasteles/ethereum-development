import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { Signer, Wallet } from 'ethers';
import { assert } from 'chai';

import { QuardraticVoting } from '../types';
import { EthereumAddress } from '../helpers/types';
import { deployQuardraticVoting } from '../helpers/contract';

export interface IAccount {
  address: EthereumAddress;
  signer: Signer;
  privateKey: string;
}

export interface TestVars {
  QuardraticVoting: QuardraticVoting;
  accounts: IAccount[];
  team: IAccount;
}

const testVars: TestVars = {
  QuardraticVoting: {} as QuardraticVoting,
  accounts: {} as IAccount[],
  team: {} as IAccount,
};

export const latestTime = async () =>
  (await ethers.provider.getBlock('latest')).timestamp;

export const stringGen = (len: number) => {
  var text = '';

  var charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < len; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
};

export const increaseTime = async (duration: number) => {
  await ethers.provider.send('evm_increaseTime', [duration]);
  await ethers.provider.send('evm_mine', []);
};

const setupOtherTestEnv = async (vars: TestVars) => {
  // setup other test env
  return {
    QuardraticVoting: await deployQuardraticVoting(),
  };
};

export function runTestSuite(title: string, tests: (arg: TestVars) => void) {
  describe(title, function () {
    before(async () => {
      // we manually derive the signers address using the mnemonic
      // defined in the hardhat config
      const mnemonic =
        'test test test test test test test test test test test junk';

      testVars.accounts = await Promise.all(
        (
          await ethers.getSigners()
        ).map(async (signer, index) => ({
          address: await signer.getAddress(),
          signer,
          privateKey: ethers.Wallet.fromMnemonic(
            mnemonic,
            `m/44'/60'/0'/0/${index}`
          ).privateKey,
        }))
      );
      assert.equal(
        new Wallet(testVars.accounts[0].privateKey).address,
        testVars.accounts[0].address,
        'invalid mnemonic or address'
      );

      const { team } = await getNamedAccounts();
      // address used in performing admin actions in InterestRateModel
      testVars.team = testVars.accounts.find(
        (x) => x.address.toLowerCase() === team.toLowerCase()
      ) as IAccount;
    });

    beforeEach(async () => {
      const setupTest = deployments.createFixture(
        async ({ deployments, getNamedAccounts, ethers }, options) => {
          await deployments.fixture(); // ensure you start from a fresh deployments
        }
      );

      await setupTest();
      const vars = await setupOtherTestEnv(testVars);
      Object.assign(testVars, vars);
    });

    tests(testVars);
  });
}
