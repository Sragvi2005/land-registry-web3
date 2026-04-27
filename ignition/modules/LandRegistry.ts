import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LandRegistryModule = buildModule("LandRegistryModule", (m) => {
  // This deploys the LandRegistry contract we just compiled
  const landRegistry = m.contract("LandRegistry");

  return { landRegistry };
});

export default LandRegistryModule;