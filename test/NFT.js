const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('NFT', () => {
  const NAME = 'Dapp Punks'
  const SYMBOL = 'DP'
  const COST = ether(10)
  const MAX_SUPPLY = 25
  const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'
  // const PAUSESTATUS = 0

  let nft,
      deployer,
      minter

  beforeEach(async () => {
    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter = accounts[1]
    minter2 = accounts[2]
  })

  describe('Deployment', () => {
    const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10) // 2 minutes from now

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
    await nft.connect(deployer).createWhitelistEntry('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')
    })

    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })

    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })

    it('returns the cost to mint', async () => {
      expect(await nft.cost()).to.equal(COST)
    })

    it('returns the maximum total supply', async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
    })

    it('returns the allowed minting time', async () => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
    })

    it('returns the base URI', async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI)
    })

    it('returns the owner', async () => {
      expect(await nft.owner()).to.equal(deployer.address)
    })

  })


  describe('Minting 1 NFT', () => {
    let transaction, result

    describe('Success', async () => {

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).createWhitelistEntry('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()
      })

      it('returns the address of the minter', async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })

      it('returns total number of tokens the minter owns', async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1)
      })

      it('returns IPFS URI', async () => {
        // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
        // Uncomment this line to see example
        // console.log(await nft.tokenURI(1))
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })

      it('updates the total supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })

      it('updates the contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST)
      })

      it('emits Mint event', async () => {
        await expect(transaction).to.emit(nft, 'Mint')
          .withArgs(1, minter.address)
      })

    })

    describe('Failure', async () => {

      it('rejects insufficient payment', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).createWhitelistEntry('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')

        await expect(nft.connect(minter).mint(1, { value: ether(1) })).to.be.reverted
      })

      it('requires at least 1 NFT to be minted', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).createWhitelistEntry('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')

        await expect(nft.connect(minter).mint(0, { value: COST })).to.be.reverted
      })

      it('rejects minting before allowed time', async () => {
        const ALLOW_MINTING_ON = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).createWhitelistEntry('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')

        await expect(nft.connect(minter).mint(1, { value: COST })).to.be.reverted
      })

      it('does not allow more NFTs to be minted than max amount', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).createWhitelistEntry('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')

        await expect(nft.connect(minter).mint(100, { value: COST })).to.be.reverted
      })

      it('does not return URIs for invalid tokens', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).createWhitelistEntry('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')

        nft.connect(minter).mint(1, { value: COST })

        await expect(nft.tokenURI('99')).to.be.reverted
      })


    })

  })

  describe('Homework', () => {
    let transaction, result

    describe('Success', async () => {

      beforeEach(async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
      })

      it('ALLOWS MINITING OF 1 NFT', async () => {
        await nft.connect(deployer).createWhitelistEntry(minter.address)
        await nft.connect(minter).mint(1, { value: COST })
        expect(await nft.totalSupply()).to.equal(1)
      })

      // it('ALLOWS MINITING OF 2 NFTs', async () => {

      //   console.log('Hello world test')
      //   console.log({ value: COST })
      //   // console.log(toString(2), { value: toString(COST) })


      //   const mintTx =await nft.connect(minter).mint(2, { value: COST });
      //   const receipt = await mintTx.wait();

      //   // // Print out emitted events
      //   // for (const event of receipt.events) {
      //   //   if (event.event === "Debug") {
      //   //     console.log("Debug Event:", event.args.msgValue.toString(), event.args.cost.toString(), event.args.mintAmount.toString());
      //   //   }
      //   // }

      //   expect(await nft.totalSupply()).to.equal(2)
      // })

      it('ALLOWS PAUSING OF NFT BY OWNER/DEPLOYER AND RESTRICT MINTING WHILE PAUSED', async () => {
        await nft.connect(deployer).setPauseStatus(true)

        expect(await nft.connect(minter).mint(1, { value: COST })).to.be.reverted
      })

      // it('BLOCKS PAUSING OF NFT BY MINTER', async () => {
      //   expect(await nft.connect(minter).setPauseStatus(true)).to.be.reverted
      // })

      it('ALLOWS USE OF WHITELIST FUNCTION BY OWNER', async () => {
        await nft.connect(deployer).createWhitelistEntry('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')

        // expect(await nft.connect(deployer).createWhitelistEntry('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')).to.equal(minter.address)
      })

      it('REJECTS NON-WHITELISTED MINT REQUESTS', async () => {
        expect(await nft.connect(minter2).mint(1, { value: COST })).to.be.reverted
      })

      

    })

  })

  // describe('Displaying NFTs', () => {
  //   let transaction, result

  //   const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

  //   beforeEach(async () => {
  //     const NFT = await ethers.getContractFactory('NFT')
  //     nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

  //     // Mint 3 nfts
  //     transaction = await nft.connect(minter).mint(3, { value: ether(30) })
  //     result = await transaction.wait()
  //   })

  //   it('returns all the NFTs for a given owner', async () => {
  //     let tokenIds = await nft.walletOfOwner(minter.address)
  //     // Uncomment this line to see the return value
  //     // console.log("owner wallet", tokenIds)
  //     expect(tokenIds.length).to.equal(3)
  //     expect(tokenIds[0].toString()).to.equal('1')
  //     expect(tokenIds[1].toString()).to.equal('2')
  //     expect(tokenIds[2].toString()).to.equal('3')
  //   })


  // })

  // describe('Minting', () => {

  //   describe('Success', async () => {

  //     let transaction, result, balanceBefore

  //     const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

  //     beforeEach(async () => {
  //       const NFT = await ethers.getContractFactory('NFT')
  //       nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

  //       transaction = await nft.connect(minter).mint(1, { value: COST })
  //       result = await transaction.wait()

  //       balanceBefore = await ethers.provider.getBalance(deployer.address)

  //       transaction = await nft.connect(deployer).withdraw()
  //       result = await transaction.wait()
  //     })

  //     it('deducts contract balance', async () => {
  //       expect(await ethers.provider.getBalance(nft.address)).to.equal(0)
  //     })

  //     it('sends funds to the owner', async () => {
  //       expect(await ethers.provider.getBalance(deployer.address)).to.be.greaterThan(balanceBefore)
  //     })

  //     it('emits a withdraw event', async () => {
  //       expect(transaction).to.emit(nft, 'Withdraw')
  //         .withArgs(COST, deployer.address)
  //     })
  //   })

  //   describe('Failure', async () => {

  //     it('prevents non-owner from withdrawing', async () => {
  //       const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
  //       const NFT = await ethers.getContractFactory('NFT')
  //       nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
  //       nft.connect(minter).mint(1, { value: COST })

  //       await expect(nft.connect(minter).withdraw()).to.be.reverted
  //     })
  //   })
  // })
})
