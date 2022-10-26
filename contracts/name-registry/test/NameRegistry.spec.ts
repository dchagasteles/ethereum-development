import hre, { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber } from "@ethersproject/bignumber";
import { solidityKeccak256 } from "ethers/lib/utils";
import { expect } from "chai";

import { NameRegistry } from "../typechain";
import { increaseTime, getTimeStamp, ether, gWei } from "./utils";

describe("NameRegistry Test", () => {
  let deployer: SignerWithAddress;
  let nameRegistry: NameRegistry;

  let register1: SignerWithAddress;
  let register2: SignerWithAddress;

  const lengthFactor = ether(1).div(200); // 0.5% per a character
  const durationFactor = gWei(1); // 1 gwei per a sec,
  const reserverExpireDuration = 60; // 60s
  const name = "Crypto";
  const hash = solidityKeccak256(["string"], [name]);

  let duration = 0;

  before(async () => {
    const signers: SignerWithAddress[] = await hre.ethers.getSigners();

    deployer = signers[0];
    register1 = signers[1];
    register2 = signers[2];

    const NameRegistry = await ethers.getContractFactory("NameRegistry");
    nameRegistry = <NameRegistry>(
      await NameRegistry.deploy(
        lengthFactor,
        durationFactor,
        reserverExpireDuration
      )
    );
  });

  describe("Reserve", async () => {
    it("Register1 reserve name", async () => {
      await nameRegistry.connect(register1).reserve(hash);
      const timestamp = await getTimeStamp();
      const reserveInfo = await nameRegistry.names(hash);
      expect(reserveInfo.owner).to.equal(register1.address);
      expect(reserveInfo.reserveExpire).to.equal(
        timestamp + reserverExpireDuration
      );
    });

    it("Register2 can't reserve the same name before expire", async () => {
      await expect(
        nameRegistry.connect(register2).reserve(hash)
      ).to.be.revertedWith("Already reserved");
    });
  });

  describe("Register", async () => {
    it("Register2 can't register an unregistered name", async () => {
      await expect(
        nameRegistry.connect(register2).register(name)
      ).to.be.revertedWith("Not reserve owner");
    });

    it("Register1 register", async () => {
      const commitVale = ether(1);
      await nameRegistry.connect(register1).register(name, {
        value: commitVale.toString(),
      });
      const timestamp = await getTimeStamp();
      const fee = commitVale.mul(name.length).mul(lengthFactor).div(ether(1));
      const lockedValue = commitVale.sub(fee);

      duration = lockedValue.div(durationFactor).toNumber();
      const registerInfo = await nameRegistry.names(hash);
      expect(registerInfo.owner).to.equal(register1.address);
      expect(registerInfo.lockedBalance).to.equal(lockedValue);
      expect(registerInfo.registerExpire).to.equal(timestamp + duration);
    });
  });

  describe("During the registration", async () => {
    it("Can't reserve again", async () => {
      await expect(
        nameRegistry.connect(register2).reserve(hash)
      ).to.be.revertedWith("Already registered");
    });

    it("Can't claim", async () => {
      await expect(
        nameRegistry.connect(register1).claimUnLockedBalance(hash)
      ).to.be.revertedWith("Locked yet");
    });

    it("Register1 renew the registration", async () => {
      const commitVale = ether(1);
      await nameRegistry.connect(register1).renew(name, {
        value: commitVale.toString(),
      });
      const timestamp = await getTimeStamp();
      const fee = commitVale.mul(name.length).mul(lengthFactor).div(ether(1));
      const lockedValue = commitVale.sub(fee);

      duration = lockedValue.div(durationFactor).toNumber();
      const registerInfo = await nameRegistry.names(hash);
      expect(registerInfo.owner).to.equal(register1.address);
      expect(registerInfo.lockedBalance).to.equal(lockedValue);
      expect(registerInfo.registerExpire).to.equal(timestamp + duration);
    });
  });

  describe("After registration expired", async () => {
    before(async () => {
      await increaseTime(duration);
    });

    it("Register1 can't renew", async () => {
      await expect(
        nameRegistry
          .connect(register1)
          .renew(name, { value: ether(1).toString() })
      ).to.be.revertedWith("Registration expired");
    });

    it("Register1 can claim", async () => {
      const preBalance = await register1.getBalance();
      await nameRegistry.connect(register1).claimUnLockedBalance(hash);
      const postBalance = await register1.getBalance();
      expect(postBalance.gt(preBalance)).to.equal(true);
      const registerInfo = await nameRegistry.names(hash);
      expect(registerInfo.lockedBalance).to.equal(BigNumber.from("0"));
    });

    it("Register2 can reserve", async () => {
      await nameRegistry.connect(register2).reserve(hash);
      const timestamp = await getTimeStamp();
      const reserveInfo = await nameRegistry.names(hash);
      expect(reserveInfo.owner).to.equal(register2.address);
      expect(reserveInfo.reserveExpire).to.equal(
        timestamp + reserverExpireDuration
      );
    });
  });
});
