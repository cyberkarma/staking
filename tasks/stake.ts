import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";

dotenv.config();

export default task("stake", "Stake tokens")
  .addParam("amount", "LP Token amount")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const staking = await hre.ethers.getContractAt(
      "STAKING",
      process.env.STAKING_ADDRESS as string,
      signer
    );

    const amount = hre.ethers.utils.parseEther(taskArgs.amount);
    const uniswap = await hre.ethers.getContractAt(
      "IUniswapV2Pair",
      process.env.UNI_ADDRESS as string,
      signer
    );
    await uniswap.approve(staking.address, amount);

    await staking
      .stake(amount)
      .then((result: tx) => console.log(`tx hash: ${result.hash}`));
  });
