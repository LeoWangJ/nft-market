import {ethers} from 'ethers'
import { useEffect,useState } from 'react'
import { nftmarketaddress, nftaddress } from '../config'
import Web3modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/Market.json'
import { useRouter } from 'next/router'

const ipfs = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
const IPFS_URL = 'https://ipfs.infura.io/ipfs'
export default function MintItem (){
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput,updateFormInput] = useState({ price:'',name:'', description: ''})
    const router = useRouter()


    async function onChange(e){
        const file = e.target.files[0]
        
        try{
            const added = await ipfs.add(file,{
                progress: (prog)=> console.log(`received: ${prog}`)
            })
            const url = `${IPFS_URL}/${added.path}`
            setFileUrl(url)
        }catch(e){
            console.log('Error uploading file:', e)
        }
    }

    async function createMarket(){
        const {price, name, description} = formInput
        if(!name || !price || !description || !fileUrl) return
        const data = JSON.stringify({
            name, description, image: fileUrl
        })
        try{
            const added = await ipfs.add(data)
            const url = `${IPFS_URL}/${added.path}`
            createSale(url)
        } catch(e){
            console.log('Error uploading data:', e)
        }

    }

    async function createSale(url){
        const web3modal = new Web3modal()
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        let nftContract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await nftContract.mintToken(url)
        let tx = await transaction.wait()
        console.log(tx)
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()
        const price = ethers.utils.parseUnits(formInput.price,'ether')

        let marketContract = new ethers.Contract(nftmarketaddress,Market.abi,signer)
        let listingPrice =  await marketContract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await marketContract.makeMarketItem(nftaddress,tokenId,price,{ value: listingPrice})
        await transaction.wait()
        router.push('./')
    }

    return (
        <div className="flex justify-center">
            <div className='w-1/2 flex flex-col pb-12'>
                <input
                    placeholder='Asset Name'
                    className='mt-8 border rounded p-4'
                    onChange={ e => updateFormInput({...formInput, name: e.target.value})} 
                />
                <textarea
                    placeholder='Asset Description'
                    className='mt-2 border rounded p-4'
                    onChange={ e => updateFormInput({...formInput, description: e.target.value})} 
                />
                <input
                    placeholder='Asset Price in Eth'
                    className='mt-2 border rounded p-4'
                    onChange={ e => updateFormInput({...formInput, price: e.target.value})} 
                />
                <input
                    type='file'
                    name='Asset'
                    className='mt-4'
                    onChange={onChange} 
                /> 
                {fileUrl && (<img className='rounded mt-4' width='350px' src={fileUrl} />)}
                <button onClick={createMarket} className='font-bold mt-4 bg-purple-500 text-white rounded p-4 shadow-lg'>
                    Mint NFT
                </button>
            </div>
        </div>
    )
} 