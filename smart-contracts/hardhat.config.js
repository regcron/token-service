require('@nomicfoundation/hardhat-toolbox');

const SEPOLIA_PRIVATE_KEY = vars.get('SEPOLIA_PRIVATE_KEY');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.24',
  networks: {
    sepolia: {
      url: `https://rpc.sepolia.org	`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
};
