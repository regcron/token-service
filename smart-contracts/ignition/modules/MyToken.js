const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

const TokenModule = buildModule('TokenModule', (m) => {
  const myToken = m.contract('MyToken');

  return { myToken };
});

module.exports = TokenModule;
