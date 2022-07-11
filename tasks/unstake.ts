import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";

dotenv.config();

export default task("unstake", "Unstake tokens").setAction(async (_, hre) => {
  const [signer] = await hre.ethers.getSigners();
  const staking = await hre.ethers.getContractAt(
    "STAKING",
    process.env.STAKING_ADDRESS as string,
    signer
  );

  await staking
    .unstake()
    .then((result: tx) => console.log(`tx hash: ${result.hash}`));
});
