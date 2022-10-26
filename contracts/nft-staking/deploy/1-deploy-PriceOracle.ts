import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// deploy/1-deploy-PriceOracle.ts
const deployPriceOracle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy, get },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy('PriceOracle', {
    from: deployer,
    args: [],
    log: true,
  });
};

export default deployPriceOracle;
deployPriceOracle.tags = ['PriceOracle'];
