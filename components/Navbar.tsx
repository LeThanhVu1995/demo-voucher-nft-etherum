import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { nftmarketplaceaddress } from "../config";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const Navbar: NextPage = () => {
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    (async () => {
      const web3Modal = new Web3Modal({
        network: "rinkeby",
      });
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      let contract = new ethers.Contract(
        nftmarketplaceaddress,
        NFTMarket.abi,
        signer
      );

      let owned = await contract.getOwner();
      const [account] = await provider.listAccounts();

      setOwned(owned === account);
    })();
  }, []);

  return (
    <nav className="border-b p-6">
      <p className="text-xl font-bold"> Vouchers Marketplace </p>
      <div className="flex mt-4">
        <Link href={"/"}>
          <a className="mr-6 text-blue-600">Home</a>
        </Link>
        {owned && (
          <Link href={"/create-item"}>
            <a className="mr-6 text-blue-600">Create NFT</a>
          </Link>
        )}
        <Link href={"/my-assets"}>
          <a className="mr-6 text-blue-600">NFT Owned</a>
        </Link>
        <Link href={"/pool-ethers"}>
          <a className="mr-6 text-blue-600">Pool Ethers</a>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
