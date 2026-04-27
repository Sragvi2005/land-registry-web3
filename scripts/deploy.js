const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // 1. Get the contract to deploy
  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  
  // 2. Deploy it
  const land = await LandRegistry.deploy();

  // 3. Wait for it to finish
  await land.waitForDeployment();

  const address = await land.getAddress();
  console.log("--- Deployment Successful ---");
  console.log("LandRegistry deployed to:", address);
  console.log("Copy this address and paste it into your interact.js file.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});