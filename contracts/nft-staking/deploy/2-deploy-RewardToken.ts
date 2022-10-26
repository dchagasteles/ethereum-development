import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// deploy/2-deploy-RewardToken.ts
const deployRewardToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy('RewardToken', {
    from: deployer,
    args: [],
    log: true,
  });
};

export default deployRewardToken;
deployRewardToken.tags = ['RewardToken'];
