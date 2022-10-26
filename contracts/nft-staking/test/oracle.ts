import { expect } from 'chai';
import { BigNumber } from 'ethers';

import { deployMockNFT, deployMockNFTOracle } from '../helpers/contract';
import { runTestSuite, TestVars } from './lib';

runTestSuite('Price Oracle', (vars: TestVars) => {
  describe('PriceOracle && NftOracle', async () => {
    it('reverted cases', async () => {
      const {
        PriceOracle,
        accounts: [admin, user],
      } = vars;
      const newNft = await deployMockNFT();
      const newOracle = await deployMockNFTOracle(newNft.address);

      await expect(
        PriceOracle.connect(user.signer).setOracleForAsset([newNft.address], [newOracle.address])
      ).to.be.revertedWith('Ownable: caller is not the owner');

      await expect(
        PriceOracle.connect(user.signer).removeOracleForAsset(newNft.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('success case', async () => {
      const { NftOracle, PriceOracle, Nft } = vars;
      const originalPrice = BigNumber.from('1000000000000000000');

      expect(await PriceOracle.getPriceOfNFT(Nft.address)).to.be.eq(originalPrice);
      expect(await NftOracle.latestAnswer()).to.be.eq(originalPrice);

      // set price
      const newPrice = originalPrice.div(BigNumber.from(2));
      await NftOracle.setPrice(newPrice);

      expect(await PriceOracle.getPriceOfNFT(Nft.address)).to.be.eq(newPrice);
      expect(await NftOracle.latestAnswer()).to.be.eq(newPrice);
    });
  });
});
