import { deployments, ethers, waffle, getNamedAccounts } from 'hardhat';
import { Contract } from 'ethers';
import { Greeter } from '../types';
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

export const deployGreeter = async (_greeting: string) => {
  return await deployContract<Greeter>('Greeter', [_greeting]);
};

export const getGreeterDeployment = async (): Promise<Greeter> => {
  return (await ethers.getContractAt(
    ContractId.Greeter,
    (
      await deployments.get(ContractId.Greeter)
    ).address
  )) as Greeter;
};
