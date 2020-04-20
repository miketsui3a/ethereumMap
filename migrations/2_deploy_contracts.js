var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Map = artifacts.require("./Map.sol")
var myOracle = artifacts.require("./myOracle.sol")

module.exports = function(deployer) {
  var o;
  deployer.deploy(myOracle);
  deployer.deploy(Map);
  deployer.then(function () {
    return myOracle.deployed();
  }).then(function (instance) {
    console.log('1234',o);
    o = instance;
    return Map.deployed();
  }).then(function (g) {
    g.setOracle(o.address);
  });
};
