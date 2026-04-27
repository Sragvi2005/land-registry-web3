const hre = require("hardhat");

async function main() {
  // 1. UPDATE THIS with the address from your latest npx hardhat run scripts/deploy.js
  const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; 
  
  const landRegistry = await hre.ethers.getContractAt("LandRegistry", CONTRACT_ADDRESS);
  
  // Get three accounts: Admin (0), Current Owner (1), and New Receiver (2)
  const [admin, buyer, receiver] = await hre.ethers.getSigners();

  console.log("--- Transfer Process Started ---");
  console.log("Current Owner of Land #0:", buyer.address);
  console.log("New Receiver address:   ", receiver.address);

  // 2. Perform the transfer
  // We use .connect(buyer) because ONLY the owner of the NFT can transfer it
  const transferTx = await landRegistry.connect(buyer).transferLand(0, receiver.address);
  
  console.log("Transferring... transaction sent.");
  await transferTx.wait();
  console.log("Transfer successful! Hash:", transferTx.hash);

  // 3. Verify the new ownership
  const newOwner = await landRegistry.ownerOf(0);
  console.log("\n--- Verification ---");
  console.log("Confirmed New Owner on Blockchain:", newOwner);
  
  if (newOwner === receiver.address) {
    console.log("✅ Ownership update verified successfully!");
  }
}

main().catch((error) => {
  console.error("Error during transfer:", error);
  process.exitCode = 1;
});