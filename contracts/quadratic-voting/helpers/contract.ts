import { deployments, ethers, waffle, getNamedAccounts } from 'hardhat';
import { Contract } from 'ethers';
import { QuardraticVoting } from '../types';
import { ContractId } from './types';

export const deployContract = async <ContractType extends Contract>(
  contractName: string,
  args: any[],
  libraries?: {}
) => {
  const signers = await hre.ethers.getSigners();
  const contract = (await (
    await hre.ethers.getContractFactory(contractName, signers[0], {
      libraries: {
        ...libraries,
      },
    })
  ).deploy(...args)) as ContractType;

  return contract;
};

export const deployQuardraticVoting = async () => {
  return await deployContract<QuardraticVoting>('QuardraticVoting', []);
};

export const getQuardraticVotingDeployment =
  async (): Promise<QuardraticVoting> => {
    return (await ethers.getContractAt(
      ContractId.QuardraticVoting,
      (
        await deployments.get(ContractId.QuardraticVoting)
      ).address
    )) as QuardraticVoting;
  };
