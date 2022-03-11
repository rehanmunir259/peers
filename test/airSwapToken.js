const util = require("ethereumjs-util");
const ABI = require('ethereumjs-abi');

const Exchange = artifacts.require("./Exchange");
const AirSwapToken = artifacts.require("./AirSwapToken");

var becomesTransferable = 1508249410; // AirSwapToken.sol:22
var lockingPeriod = 604800;           // AirSwapToken.sol:26

contract('AirSwapToken', function(accounts) {

  // A reference to the token contract.
  let token;

  // Actors within the system.
  let Deployer = accounts[0];
  let Owner = accounts[1];
  let Alice = accounts[2];
  let Bob = accounts[3];
  let Exchange = accounts[4];

  // A portion of the tokens for the hot wallet.
  let ownerBalance = 1500000000000;

  // An amount the hot wallet approves the exchange contract to spend.
  let saleAmount = 750000000000;

  it("the first account has all tokens except Owner tokens", async () => {
    token = await AirSwapToken.deployed()
    var initialSupply = (await token.totalSupply()).toNumber()
    var balance0 = (await token.balanceOf(Deployer)).toNumber() + ownerBalance
    assert.equal(initialSupply, balance0, "first account does not hold token")
  })

  it("Owner holds ownerBalance of tokens", async () => {
    var balance0 = (await token.balanceOf(Owner)).toNumber()
    assert.equal(ownerBalance, balance0, "Owner does not hold sale amount")
  })

  it("hot wallet approves Exchange for the sale amount", async () => {
    try {
      await token.approve(Exchange, saleAmount, { from: Owner })
    } catch (e) {
      if (e.toString().indexOf('invalid opcode') > 0) {
        assert(true, "an 'invalid-opcode' is thrown")
      } else {
        assert(false, e.toString(), "execution should have failed with an invalid opcode error")
      }
    }
  })

  it("Exchange transfers from Owner to Bob for purchase", async () => {
    try {
      await token.transferFrom(Owner, Bob, 100, { from: Exchange })
      var balance1 = (await token.availableBalance(Bob)).toNumber()
      assert.equal(balance1, 100, "Bob should have been able to purchase 100 tokens")
    } catch (e) {
      if (e.toString().indexOf('invalid opcode') > 0) {
        assert(true, "an 'invalid-opcode' is thrown")
      } else {
        assert(false, e.toString(), "execution should have failed with an invalid opcode error")
      }
    }

  })

  it("Tokens can not be traded until the initial lock period is over", async () => {
    try {
      console.log(await token.transfer(Alice, 100, { from: Bob }))
    } catch (e) {
      if (e.toString().indexOf('invalid opcode') > 0) {
        assert(true, "an 'invalid-opcode' is thrown")
      } else {
        assert(false, e.toString(), "execution should have failed with an invalid opcode error")
      }
    }
    var AliceBalance = (await token.balanceOf(Alice)).toNumber()
    assert.equal(AliceBalance, 0, "transaction shouldnt have gotten through")
  })

  it("After the initial lock period, they can be traded", async () => {
    // as the initial lockperiod is set to end on 10/10/2017 approx. 1 month in seconds must pass
    evmIncreaseTime(becomesTransferable)
    try {
      await token.transfer(Alice, 100, { from: Bob })
      var balance1 = (await token.balanceOf(Alice)).toNumber()
      assert.equal(balance1, 100)
    } catch (e) {
      if (e.toString().indexOf('invalid opcode') > 0) {
        assert(true, "an 'invalid-opcode' is thrown")
      } else {
        assert(false, e.toString(), "execution should have failed with an invalid opcode error")
      }
    }
  })

  it("Locked tokens are unspendable", async () => {
    availableBalanceBefore = (await token.availableBalance.call(Alice)).toNumber()
    await token.lockBalance(50, {from: Alice})
    locked1 = (await token.balanceLocks.call(Alice))[0].toNumber()
    assert.equal(locked1, 50)
    try {
      await token.transfer(Bob, 100, {from: Alice})
    } catch (e) {
      if (e.toString().indexOf('invalid opcode') > 0) {
        assert(true, "an 'invalid-opcode' is thrown")
      } else {
        assert(false, e.toString(), "execution should have failed with an invalid opcode error")
      }
    }
    availableBalanceAfter = (await token.availableBalance.call(Alice)).toNumber()
    assert.equal(availableBalanceBefore - 50, availableBalanceAfter)
  })

  it("Users can only spend nonlocked tokens", async () => {
    try {
      await token.transfer(Bob, 60, { from: Alice })
    } catch (e) {
      if (e.toString().indexOf('invalid opcode') > 0) {
        assert(true, "an 'invalid-opcode' is thrown")
      } else {
        assert(false, e.toString(), "execution should have failed with an invalid opcode error")
      }
    }
    await token.transfer(Bob, 40, {from: Alice})
    var balance1 = (await token.balanceOf(Alice)).toNumber()
    assert.equal(balance1, 60, "unsent tokens")
  })

  it("Users can spend their locked tokens only after a locking period of 7 days", async () => {
    amount = 60
    balance1Before = (await token.balanceOf(Alice)).toNumber()
    try {
      await token.transfer(Bob, amount, {from: Alice})
    } catch (e) {
      if (e.toString().indexOf('invalid opcode') > 0) {
        assert(true, "an 'invalid-opcode' is thrown")
      } else {
        assert(false, e.toString(), "execution should have failed with an invalid opcode error")
      }
    }
    evmIncreaseTime(lockingPeriod + 10);
    await token.transfer(Bob, amount, {from: Alice})
    balance1After = (await token.balanceOf(Alice)).toNumber()
    assert.equal(balance1Before, balance1After + amount)
  })

  it("User can approve other users to spend a specified amount of Tokens on their behalf", async () => {

    // before being approved, transactions on others behalf fail
    try {
      await token.transferFrom(Bob, Alice, 30, {from: Exchange})
    } catch (e) {
      if (e.toString().indexOf('invalid opcode') > 0) {
        assert(true, "an 'invalid-opcode' is thrown")
      } else {
        assert(false, e.toString(), "execution should have failed with an invalid opcode error")
      }
    }

    // user 0 approves user 4 for 50 tokens and transaction goes through
    await token.approve(Exchange, 50, {from: Bob})
    await token.transferFrom(Bob, Alice, 40, {from: Exchange})
    var balance4 = (await token.balanceOf(Alice)).toNumber()
    assert.equal(balance4, 40, "unsent tokens")

    // user 4 tries to spent more than his allowance and the transaction fails
    try {
      await token.transferFrom(accounts[0], accounts[4], 40, {from: accounts[4]})
    } catch (e) {
      if (e.toString().indexOf('invalid opcode') > 0) {
        assert(true, "an 'invalid-opcode' is thrown")
      } else {
        assert(false, e.toString(), "execution should have failed with an invalid opcode error")
      }
    }

  })

})

function evmIncreaseTime(seconds) {
  return new Promise(function (resolve, reject) {
    return web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [seconds],
      id: new Date().getTime()
    }, function (error, result) {
      return error ? reject(error) : resolve(result.result);
    })
  })
}
