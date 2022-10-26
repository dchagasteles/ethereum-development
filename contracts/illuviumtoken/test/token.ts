import { expect } from 'chai';
import { ethers } from 'hardhat';

import { runTestSuite, TestVars, lastBlockNumber, backupTransferWithSignedMessage } from './lib';

runTestSuite('IlluviumToken', (vars: TestVars) => {
  it('token data', async () => {
    const { IlluviumToken } = vars;
    expect(await IlluviumToken.name()).to.equal('Illumvium Token');
    expect(await IlluviumToken.symbol()).to.equal('ILLT');
    expect(await IlluviumToken.decimals()).to.be.eq(18);
  });

  describe('set backup', async () => {
    it('reverted case', async () => {
      const {
        accounts: [admin, bob, backup],
        IlluviumToken,
      } = vars;

      await expect(
        IlluviumToken.registerBackupAddress(ethers.constants.AddressZero)
      ).to.be.revertedWith('Invalid backup address');

      await expect(
        IlluviumToken.connect(bob.signer).registerBackupAddress(backup.address)
      ).to.be.revertedWith('Not token holder');
    });

    it('success case', async () => {
      const {
        accounts: [admin, bob, backup],
        IlluviumToken,
      } = vars;

      await IlluviumToken.registerBackupAddress(backup.address);

      expect(await IlluviumToken.backupAddress(admin.address)).to.be.eq(backup.address);
    });
  });

  describe('transfer to backup without signed message', async () => {
    it('reverted case', async () => {
      const {
        accounts: [admin, bob, backup],
        IlluviumToken,
      } = vars;

      await expect(IlluviumToken.connect(bob.signer).transferToBackup(100)).to.be.revertedWith(
        'Exceeds user balance'
      );

      await expect(IlluviumToken.transferToBackup(100)).to.be.revertedWith(
        'Backup address is not registered'
      );
    });

    it('success case', async () => {
      const {
        accounts: [admin, bob, backup],
        IlluviumToken,
      } = vars;

      await IlluviumToken.registerBackupAddress(backup.address);
      expect(await IlluviumToken.transferToBackup(1000))
        .to.emit(IlluviumToken, 'TransferredToBackup')
        .withArgs(admin.address, backup.address, 1000, await lastBlockNumber());
    });
  });

  describe('transfer to backup with signed message', async () => {
    it('success case', async () => {
      const {
        accounts: [admin, bob, initiator, backup],
        IlluviumToken,
      } = vars;

      // transfer IlluviumTokens to bob for testing
      await IlluviumToken.transfer(bob.address, 1000);

      // register bob's backup address
      await IlluviumToken.connect(bob.signer).registerBackupAddress(backup.address);

      // do backup transfer with signed message
      await backupTransferWithSignedMessage(IlluviumToken, bob, initiator, 1000);

      // check if bob balance is 0
      expect(await IlluviumToken.balanceOf(bob.address)).to.be.eq(0);

      // check if backup balance is 1000
      expect(await IlluviumToken.balanceOf(backup.address)).to.be.eq(1000);
    });

    it('reverted cases', async () => {
      const {
        accounts: [admin, bob, initiator, backup],
        IlluviumToken,
      } = vars;

      await expect(
        backupTransferWithSignedMessage(IlluviumToken, admin, admin, 1000)
      ).to.be.revertedWith('Not delegator');

      await expect(
        backupTransferWithSignedMessage(IlluviumToken, admin, initiator, 1000)
      ).to.be.revertedWith('Backup address is not registered');

      await IlluviumToken.registerBackupAddress(backup.address);

      await expect(
        IlluviumToken.connect(initiator.signer).transferTokensToBackupWithSignedMessage(
          admin.address,
          1000,
          1,
          ethers.utils.formatBytes32String('random'),
          ethers.utils.formatBytes32String('random')
        )
      ).to.be.revertedWith('INVALID_SIGNATURE');
    });
  });
});
