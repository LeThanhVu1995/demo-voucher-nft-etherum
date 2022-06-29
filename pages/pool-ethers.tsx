import { ethers } from "ethers";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { nftpool } from "../config";
import NProgress from "nprogress";

import NFTPool from "../artifacts/contracts/NFTPool.sol/NFTPool.json";

const PoolEthers: NextPage = () => {
  const [provider, setProvider] = useState<any>(undefined);
  const [signer, setSinger] = useState(undefined);
  const [contract, setContract] = useState<any>(undefined);
  const [singerAddress, setSingerAddress] = useState(undefined);

  const [assetIds, setAssetIds] = useState([]);
  const [assets, setAssets] = useState<any>([]);

  const [showStakeModal, setShowStakeModal] = useState(false);
  const [stakingLength, setStakingLength] = useState(undefined); //
  const [stakingPercent, setStakingPercent] = useState(undefined);
  const [amount, setAmount] = useState(0);

  const toString = (byte32: any) => ethers.utils.parseBytes32String(byte32);
  const toWei = (ether: any) => ethers.utils.parseEther(ether);
  const toEther = (wei: any) => ethers.utils.formatEther(wei);

  const onLoad = async () => {
    const web3Modal = new Web3Modal({
      network: "rinkeby",
    });
    const connection = await web3Modal.connect();
    const provider: any = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract: any = new ethers.Contract(nftpool, NFTPool.abi, signer);
    setProvider(provider);
    setSinger(signer);
    setContract(contract);
  };

  useEffect(() => {
    onLoad();
  }, []);

  const getAssetIds = async (address: any) => {
    const assetIds = await contract.getPositionIdsForAddress(address);
    return assetIds;
  };

  const calcDaysRemaining = (unclockDate: number) => {
    const timeNow = Date.now() / 1000;
    const secondsRemaining: any = (unclockDate - timeNow) / 60 / 60 / 24;
    return Math.max(secondsRemaining.toFixed(0), 0);
  };

  const getAssets = async (ids: any) => {
    let queriesAssets = await Promise.all(
      ids.map((id: any) => contract.getPositionById(id))
    );

    queriesAssets = queriesAssets.map((asset: any) => {
      const parsedAsset = {
        positionId: asset.positionId,
        percentInterest: Number(asset.percentInterest) / 100,
        daysReamining: calcDaysRemaining(Number(asset.unlockDate)),
        etherInterest: toEther(asset.weiInterest),
        etherStaked: toEther(asset.weiStaked),
        open: asset.open,
      };

      return parsedAsset;
    });

    setAssets(queriesAssets || []);
  };

  const loadAssets = async () => {
    try {
      NProgress.start();

      if (!signer) {
        await onLoad();
      }

      const [account] = await provider.listAccounts();
      const assetIds = await getAssetIds(account);

      setAssetIds(assetIds);
      await getAssets(assetIds);
    } catch (err) {
      console.error(err);
    } finally {
      NProgress.done();
    }
  };

  const openStakingModal = (stakingLength: any, stakingPercent: any) => {
    setShowStakeModal(true);
    setStakingLength(stakingLength);
    setStakingPercent(stakingPercent);
  };

  const stakeEther = async () => {
    try {
      NProgress.start();

      const wei = toWei(amount.toString());
      const data = { value: wei };
      const transaction = await contract.stakeEther(stakingLength, data);
      let tx = await transaction.wait();
      await loadAssets();
    } catch (err) {
      console.error(err);
    } finally {
      NProgress.done();
    }
  };

  const withdraw = async (positionId: any) => {
    try {
      NProgress.start();
      const tx = await contract.closePosition(positionId);
      await tx.wait();
      await loadAssets();
    } catch (err) {
      console.error(err);
    } finally {
      NProgress.done();
    }
  };

  return (
    <>
      <div className="flex flex-col m-8 items-start justify-start">
        <div className="flex flex-row mb-8 gap-5">
          <div
            onClick={() => openStakingModal(30, "7%")}
            className=" cursor-pointer max-w-sm rounded overflow-hidden shadow-lg"
          >
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">1 Month</div>
              <p className="text-gray-700 text-base">7%</p>
            </div>
          </div>

          <div
            onClick={() => openStakingModal(90, "10%")}
            className=" cursor-pointer max-w-sm rounded overflow-hidden shadow-lg"
          >
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">3 Month</div>
              <p className="text-gray-700 text-base">10%</p>
            </div>
          </div>

          <div
            onClick={() => openStakingModal(180, "12%")}
            className=" cursor-pointer max-w-sm rounded overflow-hidden shadow-lg"
          >
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">6 Month</div>
              <p className="text-gray-700 text-base">12%</p>
            </div>
          </div>
        </div>

        <div>
          <button
            className="py-2 px-10 rounded bg-blue-600 my-4 round-xl text-white"
            onClick={() => loadAssets()}
          >
            Load
          </button>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Assets
                </th>
                <th scope="col" className="px-6 py-3">
                  Percent Interest
                </th>
                <th scope="col" className="px-6 py-3">
                  Staked
                </th>
                <th scope="col" className="px-6 py-3">
                  Interest
                </th>
                <th scope="col" className="px-6 py-3">
                  Day Remaining
                </th>
                <th scope="col" className="px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset: any, index: number) => {
                return (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                    >
                      ETH Pool
                    </th>
                    <td className="px-6 py-4">{asset.percentInterest} %</td>
                    <td className="px-6 py-4">{asset.etherStaked}%</td>
                    <td className="px-6 py-4">{asset.etherInterest} %</td>
                    <td className="px-6 py-4">{asset.daysReamining}</td>
                    <td className="px-6 py-4 text-right">
                      {asset.open ? (
                        <a
                          onClick={() => withdraw(asset.positionId)}
                          href="#"
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        >
                          Withdraw
                        </a>
                      ) : (
                        <span>Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showStakeModal && (
        <div
          id="authentication-modal"
          tabIndex={-1}
          aria-hidden="true"
          className={`bg-[#00000033] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full`}
        >
          <div className="relative p-4 w-full flex items-center justify-center h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                onClick={() => setShowStakeModal(false)}
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                data-modal-toggle="authentication-modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <div className="py-6 px-6 lg:px-8">
                <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                  Staking
                </h3>
                <form className="space-y-6" action="#">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                      Enter your ETH
                    </label>
                    <input
                      type="ethers"
                      name="ethers"
                      id="ethers"
                      onChange={(e) => {
                        setAmount(Number(e.target.value));
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      required
                    />
                  </div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {stakingLength} days @ {stakingPercent} APY
                  </label>
                  <button
                    type="button"
                    onClick={() => stakeEther()}
                    className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Stake
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PoolEthers;
