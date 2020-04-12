var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Map = artifacts.require("./Map.sol")

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Map)
};
