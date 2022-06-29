const { expect } = require("chai");
const { ethers } = require("hardhat");

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Market = await ethers.getContractFactory("NFTMarket");
//     const market = await Market.deploy();
//     await market.deployed();

//     const marketAddress = market.address;

//     const NFT = await ethers.getContractFactory("NFT");
//     const nft = await NFT.deploy();
//     await nft.deployed();

//     const nftContractAddress = nft.address;

//     let listingPrice = await market.getListingPrice();

//     listingPrice = listingPrice.toString();
//     const auctionPrice = ethers.utils.parseUnits("100", "ethers");

//     await nft.createToken("");
//     await nft.createToken("");

//     await market.createMarketItem(nftContractAddress, 1, auctionPrice, {
//       value: listingPrice,
//     });

//     await market.createMarketItem(nftContractAddress, 1, auctionPrice, {
//       value: listingPrice,
//     });

//     const [_, buyerAddress] = await ethers.getSigners();

//     await market
//       .connect(buyerAddress)
//       .createMarketItem(nftContractAddress, 1, auctionPrice, {
//         value: auctionPrice,
//       });

//     const items = await market.fetchMarketItems();

//     console.log("items : ", items);
//   });
// });

describe("stacking", function () {
  beforeEach(async function () {
    [signer1, signer2] = await ethers.getSigners();

    Staking = await ethers.getContractFactory("NFTPool", signer1);

    staking = await Staking.deployed({
      value: ethers.utils.parseEther("10"),
    });
  });

  describe("deploy", function () {
    it("should set owner", async function () {
      expect(await staking.owner()).to.equal(signer1.address);
    });

    it("sets up tiers and lockPeriods", async function () {
      expect(await staking.lockPeriods(0)).to.equal(30);
      expect(await staking.lockPeriods(1)).to.equal(90);
      expect(await staking.lockPeriods(2)).to.equal(180);

      expect(await staking.tiers(30)).to.equal(700);
      expect(await staking.tiers(90)).to.equal(1000);
      expect(await staking.tiers(180)).to.equal(1200);
    });
  });

  describe("stakeEther", function () {
    it("transfer ethers", async function () {
      const provider = waffle.provider;
      let contractBalance;
      let singerBalance;

      const transferAmount = ethers.utils.parseEther("2.0");

      contractBalance = await provider.getBalance(staking.address);
      singerBalance = await singer1.getBalance();

      const data = { value: transferAmount };
      const transaction = await staking.connect(signer1).stakeEther(30, data);
      const receipt = await transaction.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      expect(await signer1.getBalance()).to.equal(
        singerBalance.sub(transferAmount)
      );

      expect(provider.getBalance(staking.address)).to.equal(
        contractBalance.add(transferAmount)
      );
    });
  });
});
