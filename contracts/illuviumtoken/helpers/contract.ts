import { deployments, ethers } from 'hardhat';
import { Contract } from 'ethers';
import { IlluviumToken } from '../types';
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

export const deployIlluviumToken = async (
  _tokenName: string,
  _tokenSymbol: string,
  _tokenDecimal: number
) => {
  return await deployContract<IlluviumToken>('IlluviumToken', [
    _tokenName,
    _tokenSymbol,
    _tokenDecimal,
  ]);
};

export const getIlluviumTokenDeployment = async (): Promise<IlluviumToken> => {
  return (await ethers.getContractAt(
    ContractId.IlluviumToken,
    (
      await deployments.get(ContractId.IlluviumToken)
    ).address
  )) as IlluviumToken;
};
