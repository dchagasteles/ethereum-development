import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// deploy/0-deploy-IlluviumToken.ts
const deployIlluviumToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy('IlluviumToken', {
    from: deployer,
    args: ['Illumvium Token', 'ILLT', 18],
    log: true,
  });
};

export default deployIlluviumToken;
deployIlluviumToken.tags = ['IlluviumToken'];
