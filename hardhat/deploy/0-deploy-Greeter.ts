import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// deploy/0-deploy-Greeter.ts
const deployGreeter: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy('Greeter', {
    from: deployer,
    args: ['greeting'],
    log: true,
  });
};

export default deployGreeter;
deployGreeter.tags = ['Greeter'];
