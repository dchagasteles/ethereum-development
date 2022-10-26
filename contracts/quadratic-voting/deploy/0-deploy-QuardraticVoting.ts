import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// deploy/0-deploy-QuardraticVoting.ts
const deployQuardraticVoting: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy('QuardraticVoting', {
    from: deployer,
    args: [],
    log: true,
  });
};

export default deployQuardraticVoting;
deployQuardraticVoting.tags = ['QuardraticVoting'];
