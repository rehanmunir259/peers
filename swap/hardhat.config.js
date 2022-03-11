require('dotenv').config()
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('solidity-coverage')

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      accounts: {
        // mnemonic: process.env.MNEMONIC || 'impulse upon bid coconut canal sound maple wild frost wise outer sunset',
        mnemonic:'impulse upon bid coconut canal sound maple wild frost wise outer sunset',

      },
    },
    rinkeby: {
      // url: 'https://rinkeby.infura.io/v3/' + process.env.INFURA_API_KEY,
      url: 'https://rinkeby.infura.io/v3/cd0e2928b22b4f30937515081f846934',

      accounts: {
        // mnemonic: process.env.MNEMONIC || 'impulse upon bid coconut canal sound maple wild frost wise outer sunset',
        mnemonic:'impulse upon bid coconut canal sound maple wild frost wise outer sunset',

      },
      timeout: 1000000,
    },
    mainnet: {
      // url: 'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY,
      url: 'https://mainnet.infura.io/v3/cd0e2928b22b4f30937515081f846934',

      gasPrice: 50e9,
      accounts: {
        mnemonic: process.env.MNEMONIC || '',
      },
      timeout: 1000000,
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.7',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: "EH7DJ1HAGTNI8Q36KQT6E77CDYX36KG27P",
  },
  paths: {
    artifacts: './build',
  },
}
