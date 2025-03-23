const ModelMarketplace = artifacts.require("ModelMarketplace");

module.exports = async function (deployer) {
  console.log("🚀 Starting Deployment...");
  
  try {
    await deployer.deploy(ModelMarketplace);
    const deployedContract = await ModelMarketplace.deployed();
    console.log(`✅ Contract Deployed Successfully! Address: ${deployedContract.address}`);
  } catch (error) {
    console.error("❌ Deployment Failed:", error);
  }
};
