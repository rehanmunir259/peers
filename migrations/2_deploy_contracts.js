var Exchange = artifacts.require("./Exchange");
var TokenA = artifacts.require("./lib/helpers/TokenA");
var TokenB = artifacts.require("./lib/helpers/TokenB");
var AirSwapToken = artifacts.require("./AirSwapToken.sol");

var accounts = web3.eth.accounts

module.exports = function(deployer) {
  // Deploy some Token contracts.
  deployer.deploy(TokenA);
  deployer.deploy(TokenB);

  // Deploy the AirToken contract
  deployer.deploy(AirSwapToken, accounts[0], accounts[1], 1500000000000);

  // Deploy the Exchange contract.
  deployer.deploy(Exchange);
};
