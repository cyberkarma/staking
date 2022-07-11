import * as dotenv from "dotenv";

import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERCTOKEN__factory, STAKING__factory } from "../typechain";

dotenv.config();

let signer: SignerWithAddress;
let otherAccount: SignerWithAddress;
let factory: Contract;
let router: Contract;
let uniswap: Contract;
let staking: Contract;
let reward: Contract;
let bnt: Contract;
let cnt: Contract;
let pair: string;
const zeroAddress = ethers.constants.AddressZero;

async function sleep(duration: number) {
  await ethers.provider.send("evm_increaseTime", [duration]);
  await ethers.provider.send("evm_mine", []);
}

describe("STAKING CONTRACT TESTS", function () {
  beforeEach(async function () {
    [signer, otherAccount] = await ethers.getSigners();
    factory = await ethers.getContractAt(
      "IUniswapV2Factory",
      process.env.FACTORY as string
    );
    router = await ethers.getContractAt(
      "IUniswapV2Router02",
      process.env.ROUTER as string
    );

    bnt = await new ERCTOKEN__factory(signer).deploy("Banana Token", "BNT", 18);
    await bnt.deployed();

    cnt = await new ERCTOKEN__factory(signer).deploy(
      "Coconut Token",
      "CNT",
      18
    );
    await cnt.deployed();

    await bnt.mint(signer.address, ethers.utils.parseEther("100"));
    await cnt.mint(signer.address, ethers.utils.parseEther("10"));
    await bnt.approve(router.address, ethers.utils.parseEther("100"));
    await cnt.approve(router.address, ethers.utils.parseEther("10"));

    await router.addLiquidity(
      bnt.address,
      cnt.address,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("10"),
      100,
      100,
      signer.address,
      1000000000000
    );

    pair = await factory.getPair(bnt.address, cnt.address);
    uniswap = await ethers.getContractAt("IUniswapV2Pair", pair);

    reward = await new ERCTOKEN__factory(signer).deploy(
      "Reward Token",
      "RWT",
      18
    );
    await reward.deployed();
    staking = await new STAKING__factory(signer).deploy(
      20,
      20 * 60,
      10 * 60,
      uniswap.address,
      reward.address
    );
    await staking.deployed();

    await reward.mint(staking.address, ethers.utils.parseEther("1000"));
  });

  it("Testing require functions", async function () {
    await expect(staking.stake(0)).to.be.revertedWith("Cant stake zero value!");
    await expect(staking.stake(1)).to.be.reverted;
    await expect(staking.claim()).to.be.revertedWith("You not staking tokens!");
    await expect(staking.unstake()).to.be.revertedWith(
      "You not staking tokens!"
    );
    await expect(
      staking.connect(otherAccount).updateStaking(10, 10, 10)
    ).to.be.revertedWith("You are not an owner");
  });

  it("Stake test", async function () {
    const amount = 100_000_000;
    await uniswap.approve(staking.address, amount);
    // Stake change balances
    await expect(
      async () => await staking.stake(amount)
    ).to.changeTokenBalances(uniswap, [signer, staking], [-amount, amount]);
    // Nothing claim yet
    await expect(async () => await staking.claim()).to.changeTokenBalance(
      reward,
      signer,
      0
    );
    await sleep(600);
    // Claim reward tokens
    await expect(async () => await staking.claim()).to.changeTokenBalance(
      reward,
      signer,
      20000000
    );
  });

  it("Unstake test", async function () {
    const amount = 100_000_000;
    await uniswap.approve(staking.address, amount);
    await staking.stake(amount);
    // Cant unstake yet
    await expect(staking.unstake()).to.be.revertedWith(
      "Cant unstake tokens yet!"
    );
    await sleep(1200);
    // Unstake change balances
    await expect(async () => await staking.unstake()).to.changeTokenBalances(
      uniswap,
      [signer, staking],
      [amount, -amount]
    );
  });

  it("Update settings test", async function () {
    await staking.updateStaking(10, 10, 10);
    // Update variables successfully
    expect(await staking.freezing()).to.be.eq(10);
    expect(await staking.interval()).to.be.eq(10);
    expect(await staking.percent()).to.be.eq(10);
  });
});
