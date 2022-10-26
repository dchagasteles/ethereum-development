import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// deploy/0-test-deploy-MockNFT.ts
const deployMockNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy('MockNFT', {
    from: deployer,
    args: [],
    log: true,
  });
};

export default deployMockNFT;
deployMockNFT.tags = ['MockNFT'];
