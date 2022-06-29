require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {},
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/c8e74c3b0fc84758aafcf03bb2c0c088",
      accounts: [
        "f7186f272c1329cd95815ca4e016e92822702fe0940335abd12ca6e4e53279e7",
      ],
    },
  },
};
