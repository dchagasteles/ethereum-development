import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// deploy/3-deploy-NFTStaking.ts
const deployNFTStaking: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy, get },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  const mockNFT = await get('MockNFT');
  const priceOracle = await get('PriceOracle');
  const rewardToken = await get('RewardToken');

  await deploy('NFTStaking', {
    from: deployer,
    args: [mockNFT.address, rewardToken.address, priceOracle.address],
    log: true,
  });
};

export default deployNFTStaking;
deployNFTStaking.tags = ['NFTStaking'];
