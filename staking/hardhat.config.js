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
    localhost: {
      url: 'http://127.0.0.1:8545',
      timeout: 1000000,
    },
    coverage: {
      url: 'http://localhost:8555',
    },
    rinkeby: {
      // url: 'https://rinkeby.infura.io/v3/' + process.env.INFURA_API_KEY,
      url: 'https://rinkeby.infura.io/v3/cd0e2928b22b4f30937515081f846934',
      accounts: {
        // mnemonic: process.env.MNEMONIC || '',
        mnemonic:'impulse upon bid coconut canal sound maple wild frost wise outer sunset',
      },
      timeout: 1000000,
    },
    mainnet: {
      url: 'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY,
      gasPrice: 72e9,
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
