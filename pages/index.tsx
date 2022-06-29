import axios from "axios";
import type { NextPage } from "next";
import NProgress from "nprogress";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { nftmarketplaceaddress } from "./../config";

const Home: NextPage = () => {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function buyNFT(nft: any) {
    try {
      NProgress.start();

      const web3Modal = new Web3Modal({});
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        nftmarketplaceaddress,
        NFTMarket.abi,
        signer
      );

      const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });
      await transaction.wait();
      loadNFTs();
    } catch (errors) {
      console.error(errors);
    } finally {
      NProgress.done();
    }
  }

  async function loadNFTs() {
    // Call smart contracts
    NProgress.start();

    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider(
      `https://rinkeby.infura.io/v3/c8e74c3b0fc84758aafcf03bb2c0c088`
    );
    const contract = new ethers.Contract(
      nftmarketplaceaddress,
      NFTMarket.abi,
      provider
    );
    const data = await contract.fetchMarketItems();

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items: any = await Promise.all(
      data.map(async (i: any) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );

    setNfts(items);
    setLoadingState("loaded");
    NProgress.done();
  }

  if (loadingState === "loaded" && !nfts.length) {
    return <h1 className="px-20 py-10 text-3xl">No items in marketplaces</h1>;
  }

  return (
    <div className="flex justify-center">
      <div className="px-4 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft: any, index: number) => {
            return (
              <div
                key={index}
                className="max-w-sm rounded overflow-hidden shadow-lg"
              >
                <img className="w-full" src={nft.image} />
                <div className="px-6 py-4">
                  <div className="font-bold text-xl mb-2">{nft.name}</div>
                  <p className="text-gray-700 text-base">{nft.description}</p>
                </div>
                <div className="px-6 pt-4 pb-2">
                  <div className="font-bold text-xl mb-2"> {nft.price} ETH</div>
                </div>
                <div className="px-6 pt-4 pb-2">
                  <button
                    onClick={() => buyNFT(nft)}
                    className="w-full cursor-pointer bg-blue-600 text-white font-bold py-2 px-12 rounded"
                  >
                    Buy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
