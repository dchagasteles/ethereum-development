import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { Signer, Wallet } from 'ethers';
import { assert } from 'chai';

import { RewardToken, NFTStaking, PriceOracle, MockNFT, MockNFTOracle } from '../types';
import { EthereumAddress } from '../helpers/types';
import {
  getRewardTokenDeployment,
  getNFTStakingDeployment,
  getPriceOracleDeployment,
  getNftDeployment,
  getNFTOracleDeployment,
} from '../helpers/contract';

export interface IAccount {
  address: EthereumAddress;
  signer: Signer;
  privateKey: string;
}

export interface TestVars {
  RewardToken: RewardToken;
  NFTStaking: NFTStaking;
  PriceOracle: PriceOracle;
  Nft: MockNFT;
  NftOracle: MockNFTOracle;
  accounts: IAccount[];
  team: IAccount;
}

const testVars: TestVars = {
  RewardToken: {} as RewardToken,
  NFTStaking: {} as NFTStaking,
  PriceOracle: {} as PriceOracle,
  Nft: {} as MockNFT,
  NftOracle: {} as MockNFTOracle,
  accounts: {} as IAccount[],
  team: {} as IAccount,
};

const setupOtherTestEnv = async (vars: TestVars) => {
  // setup other test env

  const RewardToken = await getRewardTokenDeployment();
  const NFTStaking = await getNFTStakingDeployment();
  const PriceOracle = await getPriceOracleDeployment();
  const Nft = await getNftDeployment();
  const NftOracle = await getNFTOracleDeployment();

  await PriceOracle.setOracleForAsset([Nft.address], [NftOracle.address]);

  await RewardToken.setMinterRole(NFTStaking.address, true);

  return {
    RewardToken,
    NFTStaking,
    PriceOracle,
    Nft,
    NftOracle,
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

export const lastBlocktimestamp = async () => {
  const block = await ethers.provider.getBlock('latest');
  return block.timestamp;
};

export const ONE_MONTH = 86400 * 7 * 4;

export const increaseTime = async (duration: number) => {
  await ethers.provider.send('evm_increaseTime', [duration]);
  await ethers.provider.send('evm_mine', []);
};
