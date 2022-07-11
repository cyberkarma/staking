import { ethers } from "hardhat";
import { run } from "hardhat";
import { STAKING__factory, ERCTOKEN__factory } from "../typechain";

async function deploy() {
  const [signer] = await ethers.getSigners();

  const reward = await new ERCTOKEN__factory(signer).deploy(
    "Reward Token",
    "RWT",
    18
  );
  await reward.deployed();
  console.log("Reward Token deployed to:", reward.address);

  const staking = await new STAKING__factory(signer).deploy(
    20,
    20 * 60,
    10 * 60,
    process.env.UNI_ADDRESS as string,
    reward.address
  );
  await staking.deployed();
  console.log("Staking contract deployed to:", staking.address);

  await run("verify:verify", {
    address: reward.address,
    constructorArguments: ["Reward Token", "RWT", 18],
  });

  await run("verify:verify", {
    address: staking.address,
    constructorArguments: [
      20,
      20 * 60,
      10 * 60,
      process.env.UNI_ADDRESS as string,
      reward.address,
    ],
  });
}

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
