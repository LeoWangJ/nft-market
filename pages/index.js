import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/Market.sol/Market.json";
import IPFS from "./api/ipfs";
import Image from "next/image";
import { isGeorilNetwork } from "../utils";

export default function Home() {
  const [NFTs, setNFTs] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [correctNetwork, setGeorilNetwork] = useState(true);
  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const net = await isGeorilNetwork();
    setGeorilNetwork(net);
    if (!net) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );

    const marketNFTs = await marketContract.fetchMarketTokens();

    const ipfsAPI = new IPFS();
    await ipfsAPI.create();
    const items = await Promise.all(
      marketNFTs.map(async (i) => {
        const tokenURI = await nftContract.tokenURI(i.tokenId);

        const price = ethers.utils.formatUnits(i.price.toString(), "ether");
        const meta = await ipfsAPI.loadMeta(tokenURI);
        const image = await ipfsAPI.loadImgURL(meta.image);

        return {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: image,
          name: meta.name,
          description: meta.description,
        };
      })
    );

    setNFTs(items);
    setLoadingState("loaded");
  }

  async function buyNFT(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transition = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      {
        value: price,
      }
    );

    await transition.wait();
    loadNFTs();
  }
  if (!correctNetwork)
    return (
      <h1 className="px-20 py-7 text-4x1 text-white">
        Please use Goerli testnet
      </h1>
    );

  if (loadingState === "loaded" && NFTs.length === 0)
    return (
      <h1 className="px-20 py-7 text-4x1 text-white">No NFts in marketplace</h1>
    );

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {NFTs.map((nft, i) => (
            <div
              key={i}
              className="border rounded-lg border-slate-200 shadow rounded-x1 overflow-hidden bg-white"
            >
              <Image
                className="rounded "
                src={nft.image}
                accept="image/gif, image/jpeg, image/png"
                width="180"
                height="180"
                alt="preview"
              />
              <div className="p-2">
                <p className="text-3x1 font-semibold h-5">{nft.name}</p>
              </div>
              <div className="p-2 ">
                <p className="text-3x-1 mb-4 font-bold text-bg">
                  {nft.price} ETH
                </p>
                <button
                  className="w-full bg-[#005b80] text-white font-bold py-3 px-12 rounded"
                  onClick={() => buyNFT(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
