import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { Signer, Wallet } from 'ethers';
import { assert } from 'chai';

import { Greeter } from '../types';
import { EthereumAddress } from '../helpers/types';
import { getGreeterDeployment, deployGreeter } from '../helpers/contract';

export interface IAccount {
  address: EthereumAddress;
  signer: Signer;
  privateKey: string;
}

export interface TestVars {
  Greeter: Greeter;
  accounts: IAccount[];
  team: IAccount;
}

const testVars: TestVars = {
  Greeter: {} as Greeter,
  accounts: {} as IAccount[],
  team: {} as IAccount,
};

const setupOtherTestEnv = async (vars: TestVars) => {
  // setup other test env

  return {
    Greeter: await deployGreeter('greeting'),
    // Greeter: await getGreeterDeployment(),
  };
};

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
