// const { expect } = require("chai");
// const { ethers } = require('hardhat');

// const tokens = (n) => {
//   return ethers.utils.parseUnits(n.toString(), 'ether')
// }

// const ether = tokens


// describe("NFT ChatGPT tests", function () {
//   const NAME = 'Dapp Punks'
//   const SYMBOL = 'DP'
//   const COST = ether(10)
//   const MAX_SUPPLY = 25
//   const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'
//   const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // 2 minutes from now

//   let deployer;
//   let minter;
//   let yourContract;

//   beforeEach(async () => {
//     let accounts = await ethers.getSigners()
//     deployer = accounts[0]
//     minter = accounts[1]

//     const YourContract = await ethers.getContractFactory("NFT");
//     const yourContract = await YourContract.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI);
//     await yourContract.deployed();
//   })

//     it("should mint 1 token and emit Debug event", async function () {

//       // Mint tokens and capture events
//       const mintTx = await yourContract.mint(1, { value: COST });
//       const receipt = await mintTx.wait();

//       // Print out emitted events
//       for (const event of receipt.events) {
//         if (event.event === "Debug") {
//           console.log("Debug Event:", event.args.msgValue.toString(), event.args.cost.toString(), event.args.mintAmount.toString());
//         }
//       }

//       // Add your assertions as needed
//       expect(await yourContract.totalSupply()).to.equal(1);
//     });
// });
