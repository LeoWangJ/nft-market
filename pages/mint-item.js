import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { nftmarketaddress, nftaddress } from "../config";
import Web3modal from "web3modal";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/Market.sol/Market.json";
import { useRouter } from "next/router";
import Image from "next/image";
import IPFS from "./api/ipfs";

export default function MintItem() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const [loading, setLoaing] = useState(false);
  const router = useRouter();

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const objectURL = URL.createObjectURL(file);
      setFileUrl(objectURL);
      setFile(file);
    } catch (e) {
      console.log("Error uploading file:", e);
    }
  }

  async function createMarket() {
    setLoaing(true);
    const { price, name, description } = formInput;
    if (!name || !price || !description || !fileUrl) {
      setLoaing(false);
      return;
    }
    try {
      const ipfsAPI = new IPFS();
      await ipfsAPI.create();
      const imgIpfs = await ipfsAPI.add(file);
      console.info(imgIpfs.path);
      const data = JSON.stringify({
        name,
        description,
        image: imgIpfs.path,
      });
      const jsonIpfs = await ipfsAPI.add(data);
      const url = jsonIpfs.path;

      createSale(url);
    } catch (e) {
      console.log("Error uploading data:", e);
    }
    setLoaing(false);
  }

  async function createSale(url) {
    const web3modal = new Web3modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    let nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await nftContract.mintToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();
    const price = ethers.utils.parseUnits(formInput.price, "ether");

    let marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    let listingPrice = await marketContract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await marketContract.makeMarketItem(
      nftaddress,
      tokenId,
      price,
      { value: listingPrice }
    );
    await transaction.wait();
    router.push("./");
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/3 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <input
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="Asset" className="mt-4" onChange={onChange} />
        <div>
          {fileUrl && (
            <Image
              className="rounded mt-4"
              src={fileUrl}
              accept="image/gif, image/jpeg, image/png"
              width="300"
              height="300"
              alt="preview"
            />
          )}
        </div>
        <button
          disabled={loading}
          onClick={createMarket}
          className="font-bold mt-4 bg-[#005b80] text-white rounded p-4 shadow-lg"
        >
          Mint NFT
        </button>
      </div>
    </div>
  );
}
