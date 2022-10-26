import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// deploy/0-test-deploy-MockNFTOracle.ts
const deployMockNFTOracle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy, get },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  const mockNFT = await get('MockNFT');

  await deploy('MockNFTOracle', {
    from: deployer,
    args: [mockNFT.address],
    log: true,
  });
};

export default deployMockNFTOracle;
deployMockNFTOracle.tags = ['MockNFTOracle'];
