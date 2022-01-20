import {ethers} from 'ethers'
import {useEffect,useState} from 'react'
import Web3Modal from 'web3modal'
import {nftaddress,nftmarketaddress} from '../config'
import Market from '../artifacts/contracts/Market.sol/Market.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import axios from 'axios'

export default function AccountDashboard(){
    const [NFTs, setNFTs] = useState([])
    const [sold, setSold] = useState([])
    const [loadingState, setLoadingState] = useState()

    useEffect(()=>{
        loadNFTs()
    },[])

    async function loadNFTs(){
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await marketContract.fetchItemsCreated()
       
        const items = await Promise.all(data.map(async i =>{
            const tokenURI = await nftContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenURI)
            const price = ethers.utils.formatUnits(i.price.toString(),'ether')
            const item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
                sold: i.sold
            }
            return item
        }))

        const soldItems = data.filter( i => i.sold)
        setSold(soldItems)
        setNFTs(items)
        setLoadingState('loaded')
    }

    if(loadingState === 'loaded' && !NFTs.length) return (<h1
        className='px-20 py-7 text-4x1'>You have not minted any NFTs!</h1>)

    return (
         <div className='p-4'>
        <h1 style={{fontSize:'20px', color:'purple'}}>Tokens Minted</h1>
          <div className='px-4' style={{maxWidth: '1600px'}}>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
            {
              NFTs.map((nft, i)=>(
                <div key={i} className='border shadow rounded-x1 overflow-hidden'>
                  <img src={nft.image} />
                  <div className='p-4'>
                    { nft.sold ? <p style={{height:'32px'}} className='text-3x1 font-semibold text-red-600'>solded</p> : null}
                    <p style={{height:'64px'}} className='text-3x1 font-semibold'>{nft.name}</p>
                      <div style={{height:'72px', overflow:'hidden'}}>
                        <p className='text-gray-400'>{nft.description}</p>
                        </div>
                    </div>
                    <div className='p-4 bg-black'>
                        <p className='text-3x-1 mb-4 font-bold text-white'>{nft.price} ETH</p>
                      </div>
                </div>
              ))
            }
          </div>
          </div>
    </div>
    )
}