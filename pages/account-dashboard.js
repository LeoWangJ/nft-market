import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from "../config";
import Market from "../artifacts/contracts/Market.sol/Market.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import IPFS from "./api/ipfs";
import Image from "next/image";
import { isGeorilNetwork } from "./utils";

export default function AccountDashboard() {
  const [NFTs, setNFTs] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState();
  const [correctNetwork, setGeorilNetwork] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const net = await isGeorilNetwork();
    setGeorilNetwork(net);
    if (!net) return;
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();
    const ipfsAPI = new IPFS();
    await ipfsAPI.create();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await nftContract.tokenURI(i.tokenId);
        const meta = await ipfsAPI.loadMeta(tokenURI);
        const image = await ipfsAPI.loadImgURL(meta.image);

        const price = ethers.utils.formatUnits(i.price.toString(), "ether");
        const item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: image,
          name: meta.name,
          description: meta.description,
          sold: i.sold,
        };
        return item;
      })
    );

    const soldItems = data.filter((i) => i.sold);
    setSold(soldItems);
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
        You have not minted any NFTs!
      </h1>
    );

  return (
    <div className="flex justify-center">
      <div className="p-4">
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
                  <p className="text-3x1 font-semibold h-5  mb-3">{nft.name}</p>
                  <p className=" h-5 text-gray-400 ">{nft.description}</p>
                </div>
                <div className="p-2">
                  <p className="text-3x-1 mb-4 font-bold">{nft.price} ETH</p>
                </div>
                {nft.sold ? (
                  <p
                    style={{ height: "32px" }}
                    className="text-3x1 font-semibold text-red-600"
                  >
                    Solded
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
