const ModelMarketplace = artifacts.require("ModelMarketplace");

module.exports = function (deployer) {
  deployer.deploy(ModelMarketplace);
};
