# Bug Bounty Submissions
We'll be collecting bug bounty submissions and their responses here. Please be sure to take a look before making a submission. Thank you!

### M.L.

#### Submission 1

Hi,

I think I found a bug in your AirSwapToken.sol code. Your ico mentions
that there will be 500 million tokens in circulation but the following
line of code sets the supply to 5 trillion :

uint256 public constant totalSupply = 5000000000000;

#### Submission 2

Hi,

Think I found another one. In the following code :

BalanceLocked(msg.sender, balanceLocks[msg.sender].amount, _value,
_expiry); balanceLocks[msg.sender] = BalanceLock(_value, _expiry);

You broadcast that the balance has been locked before it has actually
been locked. If the lock fails after broadcast there could be some
inconsistent state depending on what you are doing in the event
subscription code.

### Response (Phil)

#### Submission 1

Please see the EIP20 standard:
https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md

Specifically the section "decimals

Returns the number of decimals the token uses - e.g. 8, means to divide
the token amount by 100000000 to get its user representation."

AirSwap has four decimal places, so 5000000000000 / (10^4) = 500M as
specified.

#### Submission 2

There is no way for the line you indicated to fail without throwing,
reverting the log event above it.  The order here is not a bug.


No security critical issues or bugs are present, so I recommend no
changes to the contract.

### R.M.C.F.

#### Submission 1

To whom it may concern,

I'm currently making my way through your bountied contracts and will
likely be in contact again, but first wanted to report that in your
constructor function of AirSwapToken.sol, it doesn't look like _balance
is not asserted to be less than totalSupply, so if it is purposefully
or accidentally set to be greater than it, balances[_deployer] will
underflow into an enormous number.

#### Submission 2

To whom it may concern,

Here's a follow-up with more findings:

AirSwapToken/StandardToken.sol:

1. availableBalance will throw instead of return 0 if more or as much
is locked than not

2. The approve/transferFrom ERC20 race condition is not mitigated

3. Short Address Attack is also not mitigated (but not as much of a
problem either)

4. Transfers do not require a valid address (can be 0)

Exchange.sol:

5. makerAmount and takerAmount seem to both never be asserted to be
greater than 0

6. makerAddress and takerAddress can both be 0 and not fail

### Response (Phil)

#### Submission 1

This is covered in our Token audit:
https://github.com/airswap/contracts/blob/master/audits/phil-daian/airswap-token-contract-audit-v0.pdf
and is intended functionality / non-security critical.  As stated
there, the deployer would have to be malicious to underflow this value,
and this could easily be checked by users before tokens become
transferable.

#### Submission 2


(1) is not possible.  See the token audit, and look for the green
highlights around balance underflows.  The intended invariant is that
balanceLocks[x] <= balances[x], and this is enforced in line
https://github.com/airswap/contracts/blob/517a9275a3f4d5f4d039c6db078d15d67d0f63fa/contracts/AirSwapToken.sol#L81

If you do find a way to cause balanceLocks[x] >= balances[x] with a
non-expired balance lock, please let us know as this is an issue AirSwap
would pay a bounty for.

(2) is no longer an EIP20 compliant suggestion.  The EIP20 document at
https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
now explicitly instructs developers *not* to include this mitigation in
the specification for approve.

For (3), short address mitigation is not a standard recommendation for
ERC20s (see the Consensys and Zeppelin standard tokens); the suggested
fix for this is at the application layer, and this is mentioned in
several places in the audit.

For (4), we do not wish to waste gas checking for a 0-invalid address;
it is not a standard practice, or a universal security recommendation,
and there is never a way to exclude all invalid addresses from a
contract.

For (5), this is also intended functionality, there is no reason not to
allow people to trade for 0 if they so choose.  Restrictions at amounts
are also application-layer features.

For (6), see (4).


No security critical issues or bugs are present, so I recommend no
changes to the contract.


### S.C.


#### Submission 1

I was able to sign up with Air Swap, prior to your early closing and
have followed the Telegram Desktop, as part of the community.  I see
that there was a bug bounty for contracts that was given based within
the Exchange.sol, and AirSwapToken.sol .  Given the large audience your
team is sharing bug bounties with, I found it odd, to find a spelling
mistake, on the primary page – As you can see below, I’ve highlighted
the mistake, and wish to be provided a low amount of ETH based on my
findings. Here is my Ethereum address.
0x82961424d5cf32c311bbed183d5c4e47d0b54c6f 😊 But in all seriousness, I
am not a software/hardware coder of any sort. I just mine with a few R9
290X’s here in Canada, and make a few bucks a day – so would this
count? I’m grateful to be able to sign up early, and hope to use
AirSwap in some way, in my daily life!



I hope this letter helps your team out, and was a small pause in what
I’m sure is an eventful start to your company.


Seriously though....RIGHT on the main Air Swap page? depdencies? Hahaha



Cheers folks 😃


### Response (Phil)

#### Submission 1

This was fixed by the AirSwap team and a small token sum should be
transferred because a change did result (though it is not a code bug or
security critical issue).

No security critical issues or bugs are present, so I recommend no
changes to the contract.


### P.

#### Submission 1

Hello,

Here are my suggestions. Please note that I am just an enthusiast of 
Solidity and Bounty programmes and you shouldn't take my suggestions 
for granted. Please review it carefully and only if you agree with 
it, implement the necessary changes. These are my initial suggestions 
from static analysis. If you will be satisfied with it, I can 
continue the testing to give you more advice.

(1) Current code specifies version pragma ^0.4.11. I recommend 
changing the solidity version pragma to the latest version (pragma 
solidity ^0.4.15) to enforce the use of an up to date compiler;

(2) Consider adding keyword "constant" to the variables that do not 
change their values. Reading from a const variable doesn't cost any 
gas so this would save you some money. For example, change from this:
	uint256 becomesTransferable = 1508249410; to this:
    uint256 constant becomesTransferable = 1508249410;

(3) Consider marking functions with a specific access level, for 
example, functions that aren't called internally, please mark with a 
keyword "external". Calling external function consumes less gas than 
public function. Also, functions that are only used internally, 
should be marked "internal". If you want, I can specify which 
modifier every function should have. "As for best practices, you 
should use external if you expect that the function will only ever be 
called externally, and use public if you also need to call this 
function internally."

(4) Timestamp usage There’s a problem with using timestamps and now 
(alias for block.timestamp) for contract logic, based on the fact 
that miners can perform some manipulation. In general, it’s better 
not to rely on timestamps for contract logic. The solution is to use 
block.number instead, and approximate dates with expected block 
heights and time periods with expected block amounts.

(5) There are some functions which do not check the correctness of 
passed arguments. For example, it is generally advised to always do 
such checks: function myFunction(address _address, uint _value) {
	require(_address != address(0));
	require(_value >= 0);

	... (other code) ...
}

(6) It's generally advised to avoid hardcoded numbers in functions. 
Functions shouldn't have magic numbers inside it. It makes harder to 
maintain the code and also decreases readability. Imagine if you use 
a magic number, let's say 350 ten times in your code. One day you 
decide to change it from 350 to 360. What do you do? You search all 
occurrences in the code and change them. If you have this value 
extracted, you can change it only in one place to achieve the same 
effect. For example, refactor this (and other similar functions): 
Failed(6, makerAddress, makerAmount, makerToken, takerAddress, 
takerAmount, takerToken, expiration, nonce);

(7) Consider using SafeMath library instead of standard arithmetic 
operations to avoid integer overflows/underflows. Good example: 
https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/math/SafeMath.sol

(8) I don't see the implementation of the fallback function. How are 
users supposed to buy your tokens?

(9) Consider holding raised funds in a Multi-sig wallet (or choose 
another safe way) to reduce the risk of funds lost. Security 
recommendation: immediately store received Ether on some particular 
hardware or Multisignature wallet.

(10) Rejecting non-zero transfers is not ERC20 compliant. The ERC20 
specification states that “transfers of 0 values MUST be treated as 
normal transfers”. In your token these are rejected.

(11) Please make sure that "assert" is used intentionally, as if it 
fails, all the gas is consumed. Consider replacing "assert" with 
"require". Read more: 
https://media.consensys.net/when-to-use-revert-assert-and-require-in-solidity-61fb2c0e5a57

(12) How are you planning to upgrade your token (in case you will 
need that)? You should consider making your token upgradeable (if in 
the future you want to add some extra functionality or fix something 
and then migrate the balances to the new contract).

(13) Auction.sol: "sha3" has been deprecated in favour of 
"keccak256". Please refactor your code to use "keccak256" instead of 
"sha3".

(14) StandardToken.sol in functions transfer and transferFrom() 
please reorder lines to avoid reentrancy attacks: from:	balances[_to] 
+= _value;
        balances[_from] -= _value;
        allowed[_from][msg.sender] -= _value; to: balances[_from] -= 
_value;
		balances[_to] += _value;
        allowed[_from][msg.sender] -= _value; Substraction should 
come before the addition to make your code more secure against 
re-entrancy attacks. Good example: 
https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/StandardToken.sol

(15) Approve(): Beware that changing an allowance with this method 
brings the risk described here: 
https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit#heading=h.m9fhqynw2xvt 
One possible solution to mitigate this race condition is to first 
reduce the spender's allowance to 0 and set the desired value 
afterwards: require((_value == 0) || (allowed[msg.sender][_spender] 
== 0)); 
https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729 or 
use increaseApproval and decreaseApproval functions, example: 
https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/StandardToken.sol

Some random ICO suggestions (not related to smart contracts). I think 
you already know it, but still, I feel a duty to remind:

(16) Inform your users that they won't send Ether directly from an 
exchange as they won't have control over their tokens.

(17) Purchase an ENS domain (https://ens.domains/) and utilize it as 
your Crowdsale address. Purchase similar sounding domains and create 
similar twitter handles if possible. Keep an eye out for any fakes.

(18) It is recommended to use Telegram, Discord or Rocket.chat over 
Slack for the purpose of the Crowdsale. There is no way to stop Slack 
Direct Messages or reminders which notify everyone and come from the 
Slackbot (making it seem official).

(19) Fundraising sites are being DDoSed (during ICO) Solution: 
connect an intermediate CDN-service (for example, CloudFlare). It’s 
better to do this before starting ICO campaigns. Also, close all 
ports, create IP whitelists, which can be accessed by them.

### Response (Phil)

#### Submission 1

(1) Not in the scope of the bounty, AirSwap froze the pragma at 
the time the contract was started/initially audited, which I 
find to be a good standard practice.  I did recommend to the 
team in the audit to use 4.18+ in future contracts.

(2) Good suggestion, though gas optimizations are out of scope; 
I did recommend this to the team as well, though it was decided 
that this value never needs to be read by clients.

(3) Same as (2).

(4) This is noted in the provided audits of the contract and 
deemed not security critical, as timestamp manipulation is 
bounded and in the average case more precise than block numbers 
(as the current 30s blocktimes show).

(5) AirSwap explicitly wants to allow 0-values for most 
functions.  Checking that address is not 0 is not standard and 
only excludes one of many rare failure cases, so consuming gas 
for it in the main path is likely not worthwhile.  Also, 
sending to 0x0 may be legitimate for e.g. burning tokens.  This 
is also not a security-critical bug.

(6) These constants are only used once, and for readability 
make sense as hardcoded numbers at the discretion of the team.  
Not security critical to fix.

(7) SafeMath was considered, though explicit overflow 
protection was implemented and preferred by the team; see the 
"Arithmetic Issues" section of my provided audit.

(8) Users buy tokens through the Swap platform as standard 
token transfers, and the contract is intentionally not set up 
to receive ETH.

(9) Non-contract infrastructure is out of scope of the bounty, 
and unfortunately AirSwap is not able to provide details on 
their setup for security reasons.

(10) **This is correct.  Transfers of 0-value are rejected by 
the Consensys standard token.  This is in the testing 
recommendations of the provided audit, but not in fix 
suggestions.  The team has decided to take no action on this 
issue, as throws need to be handled for all ERC20 functions, 
and no funds are at risk by disallowing 0 transfers.  Also, the 
use of the standard token by many projects means that while the 
token is not 100% ERC20-compliant, it is consistent with other 
deployed Consensys projects.  That being said, this could be 
seen as a bug, and while not threatening funds could 
potentially impact the user experience of some API clients of 
the token.  Clear notes will be added in our documentation, and 
clients will be informed of the cases in which AST is not fully 
EIP20 compliant (though it is ERC20 draft compliant, as are a 
large family of previous tokens).  Unfortunately, the 
finalization of EIP20 after the development of AST begin 
renders this kind of incompatibility inevitable.  Thank you for 
reporting!**

(11) Assert and require are used intentionally as suggested by 
standard guidelines, except in the ConsenSys standard token 
which we do not modify for the reasons above.

(12) This is covered in our audit under upgradeability.

(13) This is also covered in the audit.

(14) This has no effect on re-entrancy attacks, which require 
an external call (see the re-entrancy section of the audit).

(15) This is covered earlier in this document, with this 
suggestion no longer EIP20-compliant and now considered 
nonstandard.

(16) This is out of scope of the on-chain contracts; the only 
way to buy AST is with a Ledger or MetaMask GUI.

(17) AST is not crowdselling through a contract, rather the 
AirSwap platform itself is being used.  ENS domains are secured 
by the AST team.

(18) AST does not use Slack for any public channels and is 
already using Telegram; this is also out of scope.

(19) Also out of scope, though these recommendations have 
already been communicated to the team.

**I recommend payout of OWASP Note - OWASP Low [low impact; low - 
medium likelihood] = 2 ETH for the suggestion of EIP20 
non-compliance with 0 transfers, which will result in a 
documentation change.**

Thank you for your thorough review, please feel free to contact me 
with any questions!

### J

#### Submission 1

Hi,

There is a known race condition possible in the ERC20 standard, and 
StandardToken / AirSwapToken are vulnerable to it.

## Vulnerability description

The vulnerability targets two functions of the ERC20:

- approve(x, v): the caller allows x to spent v tokens - 
transferFrom(from, to, v): the caller transfers v tokens from from to 
to

This is vulnerable to a race condition, when the user calls a second 
time approve on a already allowed spender. The spender can call 
transferFrom before the new transaction is mined. As a result, he can 
spend the first amount of tokens and the second amount of tokens, 
while it was never the intention of the user.
## Exploit scenario:
- Alice calls approve(Bob, 100) - Alice decides to allow more tokens, 
and call approve(Bob, 200) - Bob sees the transaction before it has 
be accepted, calls transferFrom(Alice, X, 100) - The transaction of 
Bob is accepted before the one from Alice (here is the race 
condition). - Bob calls transferFrom(Alice, X, 200)

At the end, Bob transfered 300 tokens, while it was never the 
intention of Alice.

## Fix
This is no easy to fix, as it is an error in the design of the ERC20 
standard itself. A possible fix would be to add
    require(allowed[msg.sender][_spender] == 0) In 
StandardToken.approve 
(https://github.com/airswap/contracts/blob/master/contracts/lib/StandardToken.sol#L29) 
This would break the full compatibility with the ERC20, but it would 
keep the user safe.

##

Do not hesitate if you need any more details.


Best, J

### Response (Phil)

#### Submission 1

As covered above, this mitigation is no longer EIP20 compliant, and 
the new standard explicitly asks contracts not to implement this 
mitigation.

No security critical issues or bugs are present, so I recommend no 
changes to the contract.

### A

#### Submission 1

I think you need to move your approve workflow into the exchange 
contract or you will have front runners causing havoc on your 
contact.

Scenario:

1. Maker calls approve in Transaction 1. 2. Taker calls transferFrom 
before the Exchange contract is called moving tokens. 3. Taker now 
has funds. 4. Someone calls fill but transaction fails because 
approved funds have already been moved.

I think you need the approvals to go to the contract and the 
temporarily pass the tokens through the exchange contract.

### Response (Phil)

#### Submission 1

This is not an issue in the contract, as only the taker can call fill 
on any order (the takerAddress is hardcoded and signed).  Also, the 
maker does not approve the taker for transferFrom, it approves the 
Exchange ERC20 contract.

No security critical issues or bugs are present, so I recommend no 
changes to the contract.

### E.S.

#### Submission 1

Hello, I am about to list possible bugs that we found in your code.

AirSwapToken.sol

AirSwapToken(address _deployer, address _owner, uint256 _balance)

- check if _balance is positive(_balance > 0) - check the amount of 
tokens that are locked and subtract them from the balance - also need 
to check if balance is not greater than the total supply (balance <= 
totalSupply) - verify deployer and owner addresses. check if they are 
not null and if they follow a proper hash signature


transfer(address _to, uint256 _value) - check that value is positive

transferFrom(address _from, address _to, uint256 _value) - check that 
value is positive

#### Submission 2

Hello, we have found additional bugs and fixes that we wish you would 
change in your code. This is the second email we have sent regarding 
bugs and fixes. We would like the amount of ethereum that you think 
we deserve to be sent to this address

0x6aE9b0D824E36c089FA40501d5e38FA66467B06C

1. There needs to be a method where the tokens will be sent back to 
the owner if they are sent by mistake in the contracts

  * @param token The address of the token to transfer.
        * @param amount The amount to be transfered.
        */
      function emergencyERC20Drain(ERC20 token, uint amount )
            public
            onlyOwner
      {
            token.transfer(owner, amount);
      }
       
2. In addition, we propose a burn method that would burn certain 
amount of token. It can be a useful utility that can come in handy. 
onlyAfter(becomesTransferable) whenNotPaused
  function burn(uint _value)
            public
            onlyWhenTransferEnabled
            returns (bool)
      {
            balances[msg.sender] = balances[msg.sender].sub(_value);
            totalSupply = totalSupply.sub(_value);
            Burn(msg.sender, _value);
            Transfer(msg.sender, address(0x0), _value);
            return true;
      }

### Response (Phil)

#### Submission 1

For the constructor, the model of the deployer we are using assumes a 
trusted deployer.  We therefore do not sanitize these inputs, but 
check them after the fact.

The remainder of the bugs of checking whether values are postiive: 
all uint values are positive (it is an unsigned integer datatype), so 
no further checks are required.

#### Submission 2

(1) is a good suggestion and is noted in the audit (and therefore out 
of bounty scope), though to prevent added complexity and the 
liability of transferring tokens from others, the AirSwap team opted 
to instead clearly document that ERC20s should not be sent to the 
contract.  We cannot sanitize all inputs or protect all users from 
wrongful transfers of tokens, and recommend an eventual system-wide 
mitigation is provided for this issue (as suggested by several 
follow-up token standards).

(2) can be reproduced by just transfering to 0x0, with the exception 
of the burn event, which does not appear to serve additional 
functionality.

No security critical issues or bugs are present, so I recommend no 
changes to the contract.
