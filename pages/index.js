import {ethers} from 'ethers'
import {useEffect, useState} from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { nftaddress, nftmarketaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/Market.json'

export default function Home() {
  const [NFTs,setNFTs] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded') 

  useEffect(()=>{
    loadNFTs()
  },[])

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcBatchProvider()
    const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    
    const marketNFTs = await marketContract.fetchMarketTokens()

    const items = await Promise.all(marketNFTs.map(async i=>{
      const tokenURI = await nftContract.tokenURI(i.tokenId)
      const price = ethers.utils.formatUnits(i.price.toString(),'ether') 
      const meta = await axios.get(tokenURI)

      return {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
    }))

    setNFTs(items)
    setLoadingState('loaded')
  }

  async function buyNFT (nft){
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(),'ether')
    const transition = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: price
    })

    await transition.wait()
    loadNFTs()
  }

  if(loadingState === 'loaded' && NFTs.length === 0) return (
    <h1 className='px-20 py-7 text-4x1'>No NFts in marketplace</h1>
  )

  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{maxWidth: '1600px'}}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {
            NFTs.map((nft, i)=>(
              <div key={i} className='border shadow rounded-x1 overflow-hidden'>
                <img src={nft.image} />
                <div className='p-4'>
                  <p style={{height:'64px'}} className='text-3x1 font-semibold'>{
                    nft.name}</p>
                    <div style={{height:'72px', overflow:'hidden'}}>
                      <p className='text-gray-400'>{nft.description}</p>
                      </div>
                  </div>
                  <div className='p-4 bg-black'>
                      <p className='text-3x-1 mb-4 font-bold text-white'>{nft.price} ETH</p>
                      <button className='w-full bg-purple-500 text-white font-bold py-3 px-12 rounded'
                      onClick={()=> buyNFT(nft)} >Buy
                      </button>
                    </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
