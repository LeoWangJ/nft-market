import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { nftaddress, nftmarketaddress } from "../config";
import Market from "../artifacts/contracts/Market.sol/Market.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Image from "next/image";
import Web3Modal from "web3modal";
import IPFS from "./api/ipfs";
import { isGeorilNetwork } from "../utils";

export default function MyNFTs() {
  const [NFTs, setNFTs] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [correctNetwork, setGeorilNetwork] = useState(true);

  useEffect(() => {
    loadsNFT();
  }, []);

  async function loadsNFT() {
    const net = await isGeorilNetwork();
    setGeorilNetwork(net);
    if (!net) return;
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const data = await marketContract.fetchMyNFTs();

    const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const ipfsAPI = new IPFS();
    await ipfsAPI.create();
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await nftContract.tokenURI(i.tokenId);
        const meta = await ipfsAPI.loadMeta(tokenURI);
        const image = await ipfsAPI.loadImgURL(meta.image);
        const price = ethers.utils.formatEther(i.price.toString(), "ether");
        const item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: image,
          name: meta.name,
          description: meta.description,
        };
        return item;
      })
    );
    setNFTs(items);
    setLoadingState("loaded");
  }
  if (!correctNetwork)
    return (
      <h1 className="px-20 py-7 text-4x1 text-white">
        Please use Goerli testnet
      </h1>
    );
  if (loadingState === "loaded" && !NFTs.length)
    return (
      <h1 className="px-20 py-7 text-4x1 text-white">
        You do not own any NFTs currently :(
      </h1>
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
                <p className="text-3x1 font-semibold h-5 mb-3">{nft.name}</p>
                <p className=" h-5 text-gray-400 ">{nft.description}</p>
              </div>
              <div className="p-2">
                <p className="text-3x-1 mb-4 font-bold">{nft.price} ETH</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
