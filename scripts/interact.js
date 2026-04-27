const hre = require("hardhat");

async function main() {
  // Use the address from your latest npx hardhat run scripts/deploy.js
  const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; 
  
  // In HH2, we access ethers through hre
  const landRegistry = await hre.ethers.getContractAt("LandRegistry", CONTRACT_ADDRESS);
  const [admin, buyer] = await hre.ethers.getSigners();

  console.log("--- Interaction Started ---");
  console.log("Admin address:", admin.address);
  console.log("Registering land for:", buyer.address);

  // Call registerLand
  const tx = await landRegistry.registerLand(
    buyer.address,
    "ipfs://QmSampleHash123",
    "BMSCE Campus, Basavanagudi",
    5000,
    98765
  );

  console.log("Transaction sent... waiting for confirmation.");
  await tx.wait(); 
  console.log("Land registered successfully! Hash:", tx.hash);

  // Verify the data
  const details = await landRegistry.getLandDetails(0);
  
  console.log("\n--- Blockchain Data ---");
  console.log("Location:", details.location);
  console.log("Area:", details.areaSqFt.toString(), "sq ft");
}

main().catch((error) => {
  console.error("Error details:", error);
  process.exitCode = 1;
});