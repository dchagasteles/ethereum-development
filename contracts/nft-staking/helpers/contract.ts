import { deployments, ethers } from 'hardhat';
import { Contract } from 'ethers';
import { RewardToken, NFTStaking, PriceOracle, MockNFT, MockNFTOracle } from '../types';
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

export const deployMockNFT = async (): Promise<MockNFT> => {
  return await deployContract<MockNFT>(ContractId.Nft, []);
};

export const deployMockNFTOracle = async (nft: string): Promise<MockNFTOracle> => {
  return await deployContract<MockNFTOracle>(ContractId.NFTOracle, [nft]);
};

export const getRewardTokenDeployment = async (): Promise<RewardToken> => {
  return (await ethers.getContractAt(
    ContractId.RewardToken,
    (
      await deployments.get(ContractId.RewardToken)
    ).address
  )) as RewardToken;
};

export const getNFTStakingDeployment = async (): Promise<NFTStaking> => {
  return (await ethers.getContractAt(
    ContractId.NFTStaking,
    (
      await deployments.get(ContractId.NFTStaking)
    ).address
  )) as NFTStaking;
};

export const getPriceOracleDeployment = async (): Promise<PriceOracle> => {
  return (await ethers.getContractAt(
    ContractId.PriceOracle,
    (
      await deployments.get(ContractId.PriceOracle)
    ).address
  )) as PriceOracle;
};

export const getNftDeployment = async (): Promise<MockNFT> => {
  return (await ethers.getContractAt(
    ContractId.Nft,
    (
      await deployments.get(ContractId.Nft)
    ).address
  )) as MockNFT;
};

export const getNFTOracleDeployment = async (): Promise<MockNFTOracle> => {
  return (await ethers.getContractAt(
    ContractId.NFTOracle,
    (
      await deployments.get(ContractId.NFTOracle)
    ).address
  )) as MockNFTOracle;
};
