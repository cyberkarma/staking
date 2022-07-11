import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";

dotenv.config();

export default task("mint", "Mint reward tokens to staking contract")
  .addParam("amount", "Token symbol")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const reward = await hre.ethers.getContractAt(
      "ERCTOKEN",
      process.env.REWARD_ADDRESS as string,
      signer
    );

    await reward
      .mint(
        process.env.STAKING_ADDRESS as string,
        hre.ethers.utils.parseEther(taskArgs.amount)
      )
      .then((result: tx) => console.log(`tx hash: ${result.hash}`));
  });
