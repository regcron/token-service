const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const TOTAL_SUPPLY = ethers.parseEther('100000000');
const TOKEN_NAME = 'MyToken';
const TOKEN_SYMBOL = 'MTK';

describe('Token contract', function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatToken = await ethers.deployContract('MyToken');

    await hardhatToken.waitForDeployment();

    return { hardhatToken, owner, addr1, addr2 };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it('Should assign the total supply of tokens to the owner', async function () {
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe('Query token information', function () {
    it('Should return the total supply', async function () {
      const { hardhatToken } = await loadFixture(deployTokenFixture);
      expect(await hardhatToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });
    it('Should return the balance of an account', async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(0);
    });
    it('Should return token name', async function () {
      const { hardhatToken } = await loadFixture(deployTokenFixture);
      expect(await hardhatToken.name.call()).to.equal(TOKEN_NAME);
    });
    it('Should return token symbol', async function () {
      const { hardhatToken } = await loadFixture(deployTokenFixture);
      expect(await hardhatToken.symbol.call()).to.equal(TOKEN_SYMBOL);
    });
    it('Should return token decimals', async function () {
      const { hardhatToken } = await loadFixture(deployTokenFixture);
      expect(await hardhatToken.decimals.call()).to.equal(18);
    });
    it('Should return token owner', async function () {
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });
  });

  describe('Mint tokens', function () {
    it('Should mint tokens', async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);

      // Mint 100 tokens to addr1
      await expect(hardhatToken.mint(addr1.address, 100)).to.changeTokenBalances(hardhatToken, [addr1], [100]);
    });

    it('Should emit Transfer event', async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);

      // Mint 100 tokens to addr1
      await expect(hardhatToken.mint(addr1.address, 100))
        .to.emit(hardhatToken, 'Transfer')
        .withArgs(ethers.ZeroAddress, addr1.address, 100);
    });

    it('Should fail if not called by the owner', async function () {
      const { hardhatToken, addr1 } = await loadFixture(deployTokenFixture);

      // Mint 100 tokens to addr1
      // const res = await hardhatToken.connect(addr1).mint(addr1.address, 100);
      await expect(hardhatToken.connect(addr1).mint(addr1.address, 100)).to.be.revertedWithCustomError(
        hardhatToken,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('Burn tokens', function () {
    it('Should burn tokens', async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);

      // Mint 100 tokens to addr1
      await hardhatToken.mint(addr1.address, 100);

      // Burn 20 tokens from addr1
      await expect(hardhatToken.burn(addr1.address, 20)).to.changeTokenBalances(hardhatToken, [addr1], [-20]);
    });

    it('Should emit Transfer event', async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);

      // Mint 100 tokens to addr1
      await hardhatToken.mint(addr1.address, 100);

      // Burn 20 tokens from addr1
      await expect(hardhatToken.burn(addr1.address, 20))
        .to.emit(hardhatToken, 'Transfer')
        .withArgs(addr1.address, ethers.ZeroAddress, 20);
    });

    it('Should fail if not called by the owner', async function () {
      const { hardhatToken, addr1 } = await loadFixture(deployTokenFixture);

      // Mint 100 tokens to addr1
      await hardhatToken.mint(addr1.address, 100);

      // Burn 20 tokens from addr1
      await expect(hardhatToken.connect(addr1).burn(addr1.address, 20)).to.be.revertedWithCustomError(
        hardhatToken,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('Transfer', function () {
    it('Should transfer tokens between accounts', async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      // Transfer 50 tokens from owner to addr1
      await expect(hardhatToken.transfer(addr1.address, 50)).to.changeTokenBalances(
        hardhatToken,
        [owner, addr1],
        [-50, 50],
      );

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50)).to.changeTokenBalances(
        hardhatToken,
        [addr1, addr2],
        [-50, 50],
      );
    });

    it('Should emit Transfer events', async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

      // Transfer 50 tokens from owner to addr1
      await expect(hardhatToken.transfer(addr1.address, 50))
        .to.emit(hardhatToken, 'Transfer')
        .withArgs(owner.address, addr1.address, 50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
        .to.emit(hardhatToken, 'Transfer')
        .withArgs(addr1.address, addr2.address, 50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner.
      // `require` will evaluate false and revert the transaction.
      await expect(hardhatToken.connect(addr1).transfer(owner.address, 1)).to.be.revertedWithCustomError(
        hardhatToken,
        'ERC20InsufficientBalance',
      );

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });
  });
});
