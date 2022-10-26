import { expect } from 'chai';
import { BigNumber } from 'ethers';

import { runTestSuite, TestVars, lastBlocktimestamp, ONE_MONTH, increaseTime } from './lib';

runTestSuite('NFT staking', (vars: TestVars) => {
  let staker: any;
  let start_time = 0;

  const calcRewards = async (start_time: number, rate: number, nftPrice: BigNumber) => {
    const timeperiod = (await lastBlocktimestamp()) - start_time;
    const denominator = 100;

    return BigNumber.from(rate * timeperiod)
      .mul(nftPrice)
      .div(ONE_MONTH)
      .mul(12)
      .mul(denominator);
  };

  beforeEach(async () => {
    const {
      accounts: [alice],
      Nft,
      NFTStaking,
    } = vars;

    await Nft.mint(alice.address, 1);
    await Nft.mint(alice.address, 2);
    await Nft.approve(NFTStaking.address, 1);
    await Nft.approve(NFTStaking.address, 2);
    await NFTStaking.stakeNFT(1);

    start_time = await lastBlocktimestamp();
    staker = await NFTStaking.stakes(1);
  });

  it('meta', async () => {
    const {
      Nft,
      NFTStaking,
      accounts: [alice],
    } = vars;

    expect(await NFTStaking.nftItem()).to.be.eq(Nft.address);
    expect(await Nft.balanceOf(alice.address)).to.be.eq(1);
    expect(await Nft.ownerOf(2)).to.be.eq(alice.address);
    expect(await Nft.ownerOf(1)).to.be.eq(NFTStaking.address);
  });

  describe('stake', async () => {
    it('reverted cases', async () => {
      const {
        accounts: [, bob],
        NFTStaking,
      } = vars;

      // reverted when stake with not-owned Nft
      await expect(NFTStaking.stakeNFT(3)).to.be.revertedWith(
        'ERC721: owner query for nonexistent token'
      );

      await expect(NFTStaking.connect(bob.signer).stakeNFT(2)).to.be.revertedWith(
        'NOT_OWNER_OF_NFT'
      );
    });

    it('success cases', async () => {
      const {
        accounts: [alice],
        Nft,
        NFTStaking,
      } = vars;

      // success case
      await expect(NFTStaking.stakeNFT(2))
        .to.emit(NFTStaking, 'Stake')
        .withArgs(alice.address, 2, await lastBlocktimestamp());

      // check NFT balance after stake
      expect(await Nft.balanceOf(alice.address)).to.be.eq(0);
      expect(await Nft.ownerOf(2)).to.be.eq(NFTStaking.address);
    });
  });

  describe('unstake', async () => {
    it('reverted cases', async () => {
      const {
        accounts: [, bob],
        NFTStaking,
      } = vars;

      // reverted when unstak with wrong user
      await expect(NFTStaking.connect(bob.signer).unStakeNFT(1)).to.be.revertedWith('NOT_STAKER');
    });

    it('success cases', async () => {
      const {
        accounts: [alice],
        Nft,
        NFTStaking,
      } = vars;

      // success case
      await expect(NFTStaking.unStakeNFT(1)).to.not.reverted;

      // check nft balance after unstake
      expect(await Nft.balanceOf(alice.address)).to.eq(2);
      expect(await Nft.ownerOf(1)).to.be.eq(alice.address);
    });
  });

  describe('reward & liquidation event', async () => {
    it('no reward within one month', async () => {
      const {
        accounts: [alice],
        RewardToken,
        NFTStaking,
      } = vars;

      expect(await NFTStaking.getClaimable(staker)).to.be.eq(0);
      await NFTStaking.unStakeNFT(1);
      expect(await RewardToken.balanceOf(alice.address)).to.be.eq(0);
    });

    it('reward after one month', async () => {
      const {
        accounts: [alice],
        RewardToken,
        Nft,
        PriceOracle,
        NFTStaking,
      } = vars;

      await increaseTime(ONE_MONTH + 1);

      const nftPrice = await PriceOracle.getPriceOfNFT(Nft.address);

      expect(await NFTStaking.getClaimable(staker)).to.be.eq(
        await calcRewards(start_time, 5, nftPrice)
      ); // rate is 5 when period is between one month to 6 months

      await NFTStaking.unStakeNFT(1);

      // check reward balance after unstake
      expect(await RewardToken.balanceOf(alice.address)).to.be.eq(
        await calcRewards(start_time, 5, nftPrice)
      );
    });

    it('liquidation event', async () => {
      const { NFTStaking, NftOracle } = vars;

      const newPrice = BigNumber.from('4500000000');
      await NftOracle.setPrice(newPrice);

      await increaseTime(ONE_MONTH + 1);

      // emit CanLiquidated event
      expect(await NFTStaking.unStakeNFT(1))
        .to.emit(NFTStaking, 'CanLiquidated')
        .withArgs(staker.user, 1, await lastBlocktimestamp(), staker.originalPrice, newPrice);
    });
  });
});
