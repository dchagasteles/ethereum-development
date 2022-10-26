# NFT staking contract

## Description

### NFTStaking

- Supports ERC721 nft staking.
- Track staker's information based on tokenId.
- Calculate rewards based on staked period and NFT price.
- Inherit ERC721Holder of Openzeppelin that provides IERC721Receiver.
- Emit some events when stak, unstake, and liquidation is possible.

### RewardToken

- ERC20 reward tokens for nft staker
- There are mint roles who can mint new tokens and owners can set mint roles
- NFTStaking has mint role

### PriceOracle

- Contract that aggregates oracle contract for NFTs
- It will have one NFT oracle contract per NFT.

### MockNFT

- Test NFT contract that will be staked to nft staking contract

### MockNFTOracle:

- Test oracle contract that provides mock price of NFT

## Project Setup

- commands to setup project

```
nvm use & yarn
```

- commands to run unit tests

```
npx hardhat test
```
