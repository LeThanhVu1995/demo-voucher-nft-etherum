/* pages/my-nfts.js */
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";

import { nftmarketplaceaddress, nftaddress } from "../config";

import NFTMarketplace from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";

import NProgress from "nprogress";

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const router = useRouter();
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    try {
      NProgress.start();
      const web3Modal = new Web3Modal({
        network: "rinkeby",
      });
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const marketplaceContract = new ethers.Contract(
        nftmarketplaceaddress,
        NFTMarketplace.abi,
        signer
      );
      const data = await marketplaceContract.fetchMyNFTs();

      const items: any = await Promise.all(
        data.map(async (i: any) => {
          const tokenURI = await marketplaceContract.tokenURI(i.tokenId);
          const meta = await axios.get(tokenURI);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
            tokenURI,
          };
          return item;
        })
      );
      setNfts(items);
      setLoadingState("loaded");
    } catch (err) {
      console.log(err);
    } finally {
      NProgress.done();
    }
  }
  function listNFT(nft: any) {
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`);
  }
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>;
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft: any, i) => (
            <div key={i} className="max-w-sm rounded overflow-hidden shadow-lg">
              <img className="w-full" src={nft.image} />
              <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{nft.name}</div>
              </div>
              <div className="px-6 pt-4 pb-2">
                <div className="font-bold text-xl mb-2"> {nft.price} ETH</div>
              </div>
              <div className="px-6 pt-4 pb-2">
                <button
                  onClick={() => listNFT(nft)}
                  className="w-full cursor-pointer bg-blue-600 text-white font-bold py-2 px-12 rounded"
                >
                  Using Voucher
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
