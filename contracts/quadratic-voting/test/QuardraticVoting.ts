import { expect } from 'chai';
import { constants } from 'ethers';

import {
  runTestSuite,
  TestVars,
  stringGen,
  latestTime,
  increaseTime,
} from './lib';

const invalidCaption = stringGen(281);

runTestSuite('QuardraticVoting', (vars: TestVars) => {
  describe('createPost', async () => {
    it('reverted cases', async () => {
      const {
        QuardraticVoting,
        accounts: [frank, bob],
      } = vars;

      await expect(
        QuardraticVoting.createPost(constants.AddressZero, 'Post1')
      ).to.be.revertedWith('Invalid Author');

      await expect(
        QuardraticVoting.createPost(bob.address, 'Post1')
      ).to.be.revertedWith('Caller is not an Author');

      await expect(
        QuardraticVoting.createPost(frank.address, '')
      ).to.be.revertedWith('Invalid Caption');

      await expect(
        QuardraticVoting.createPost(frank.address, invalidCaption)
      ).to.be.revertedWith('Invalid Caption');
    });

    it('success cases', async () => {
      const {
        QuardraticVoting,
        accounts: [frank, bob],
      } = vars;

      await expect(QuardraticVoting.createPost(frank.address, 'post1'))
        .to.emit(QuardraticVoting, 'CreatePost')
        .withArgs(frank.address, 0, (await latestTime()) + 1);
    });
  });

  describe('createVote', async () => {
    it('reverted cases', async () => {
      const {
        QuardraticVoting,
        accounts: [frank, bob],
      } = vars;

      await expect(
        QuardraticVoting.createVote(constants.AddressZero, 0, 0)
      ).to.be.revertedWith('Invalid Voter');

      await expect(
        QuardraticVoting.createVote(bob.address, 0, 0)
      ).to.be.revertedWith('Voter is not caller');

      await expect(
        QuardraticVoting.createVote(frank.address, 0, 0)
      ).to.be.revertedWith('Invalid Rating');

      await expect(
        QuardraticVoting.createVote(frank.address, 0, 6)
      ).to.be.revertedWith('Invalid Rating');

      await expect(
        QuardraticVoting.createVote(frank.address, 0, 5)
      ).to.be.revertedWith('No Post yet');

      // create post first
      await QuardraticVoting.createPost(frank.address, 'post1');

      await expect(
        QuardraticVoting.createVote(frank.address, 1, 5)
      ).to.be.revertedWith('Invalid PostId');
    });

    it('success cases', async () => {
      const {
        QuardraticVoting,
        accounts: [frank, bob],
      } = vars;

      // create post first
      await QuardraticVoting.createPost(frank.address, 'post1');

      // create vote
      await expect(QuardraticVoting.createVote(frank.address, 0, 2))
        .to.emit(QuardraticVoting, 'CreateVote')
        .withArgs(frank.address, 0, 2, (await latestTime()) + 1);
    });
  });

  describe('editVote', async () => {
    it('revereted cases', async () => {
      const {
        QuardraticVoting,
        accounts: [frank, bob],
      } = vars;

      await expect(QuardraticVoting.editVote(0, 0)).to.be.revertedWith(
        'Invalid Rating'
      );

      await expect(QuardraticVoting.editVote(0, 6)).to.be.revertedWith(
        'Invalid Rating'
      );

      await expect(QuardraticVoting.editVote(0, 5)).to.be.revertedWith(
        'No Vote yet'
      );

      // create Post & Vote
      await QuardraticVoting.createPost(frank.address, 'post1');
      await QuardraticVoting.createVote(frank.address, 0, 2);

      await expect(QuardraticVoting.editVote(1, 2)).to.be.revertedWith(
        'Invalid VoteId'
      );

      await expect(
        QuardraticVoting.connect(bob.signer).editVote(0, 2)
      ).to.be.revertedWith('Caller is not Voter');

      await expect(QuardraticVoting.editVote(0, 2)).to.be.revertedWith(
        'Same Rate'
      );
    });

    it('success cases', async () => {
      const {
        QuardraticVoting,
        accounts: [frank, bob],
      } = vars;

      await QuardraticVoting.createPost(frank.address, 'post1');
      await QuardraticVoting.createVote(frank.address, 0, 2);

      // create vote
      await expect(QuardraticVoting.editVote(0, 3))
        .to.emit(QuardraticVoting, 'EditVote')
        .withArgs(0, 3, (await latestTime()) + 1);

      const updatedVote = await QuardraticVoting.votes(0);
      expect(updatedVote.rating).to.be.eq(3);
    });
  });

  describe('removeVote', async () => {
    it('revereted cases', async () => {
      const {
        QuardraticVoting,
        accounts: [frank, bob],
      } = vars;

      await expect(QuardraticVoting.removeVote(0)).to.be.revertedWith(
        'No Vote yet'
      );

      // create Post & Vote
      await QuardraticVoting.createPost(frank.address, 'post1');
      await QuardraticVoting.createVote(frank.address, 0, 2);

      await expect(QuardraticVoting.removeVote(1)).to.be.revertedWith(
        'Invalid VoteId'
      );

      await expect(
        QuardraticVoting.connect(bob.signer).removeVote(0)
      ).to.be.revertedWith('Caller is not Voter');
    });

    it('success cases', async () => {
      const {
        QuardraticVoting,
        accounts: [frank, bob],
      } = vars;

      await QuardraticVoting.createPost(frank.address, 'post1');
      await QuardraticVoting.createVote(frank.address, 0, 2);

      // create vote
      await expect(QuardraticVoting.removeVote(0))
        .to.emit(QuardraticVoting, 'RemoveVote')
        .withArgs(0, (await latestTime()) + 1);
    });
  });

  it('rating credentials', async () => {
    const {
      QuardraticVoting,
      accounts: [frank, bob],
    } = vars;

    // create Post & Vote
    await QuardraticVoting.createPost(frank.address, 'post1');

    // vote with rating of 5
    await QuardraticVoting.createVote(frank.address, 0, 5);
    const credeitsNeededForVote5 = (
      await QuardraticVoting.creditsForRate(5)
    ).toNumber();
    let usedCredits = (
      await QuardraticVoting.userCredits(frank.address)
    ).creditsUsed.toNumber();
    expect(usedCredits).to.be.eq(credeitsNeededForVote5);

    // vote with rating of 1
    await QuardraticVoting.createVote(frank.address, 0, 1);
    const credietsNeededForVote1 = (
      await QuardraticVoting.creditsForRate(1)
    ).toNumber();
    usedCredits = (
      await QuardraticVoting.userCredits(frank.address)
    ).creditsUsed.toNumber();
    expect(usedCredits).to.be.eq(
      credeitsNeededForVote5 + credietsNeededForVote1
    );

    await QuardraticVoting.createVote(frank.address, 0, 5);
    await QuardraticVoting.createVote(frank.address, 0, 5);
    await QuardraticVoting.createVote(frank.address, 0, 5);

    // reverted since credits are all spent
    await expect(
      QuardraticVoting.createVote(frank.address, 0, 5)
    ).to.be.revertedWith('Not enough credits today');

    // vote again after 1 day
    await increaseTime(3600 * 24);
    await QuardraticVoting.createVote(frank.address, 0, 1);

    // check if rechareged again
    usedCredits = (
      await QuardraticVoting.userCredits(frank.address)
    ).creditsUsed.toNumber();
    expect(usedCredits).to.be.eq(credietsNeededForVote1);
  });
});
