import {ethers} from 'ethers'
import { useEffect,useState } from 'react'
import { nftmarketaddress, nftaddress } from '../config'
import Web3modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/Market.json'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function MintItem (){
    return (
        <div></div>
    )
} 