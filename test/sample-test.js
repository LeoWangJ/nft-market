const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Market',function(){
  it('listingPrice should be 0.045 ether',async function(){
    const Market = await ethers.getContractFactory('Market')
    const market = await Market.deploy()
    await market.deployed()
    
    let listingPrice = await market.getListingPrice()
    listingPrice = ethers.utils.formatEther(listingPrice)
    expect(listingPrice).to.equal('0.045')
  })

  it('Should makeMarketItem and fetchMarketTokens work',async function() {
    const Market = await ethers.getContractFactory('Market')
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

     // test for minting
     await nft.mintToken('https-t1')
     await nft.mintToken('https-t2')

    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()
    let auctionPrice = ethers.utils.parseUnits('100','ether')
    await market.makeMarketItem(nftContractAddress,1,auctionPrice,{value: listingPrice})
    await market.makeMarketItem(nftContractAddress,2,auctionPrice,{value: listingPrice})
    let myNFTs = await market.fetchMarketTokens()
    expect(myNFTs.length).to.equal(2)
  })

  it('should createMarketSale and fetchMyNFTs work',async function(){
    const Market = await ethers.getContractFactory('Market')
    const market = await Market.deploy()
    await market.deployed()
    const marketContractAddress = market.address

    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy(marketContractAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()
    await nft.mintToken('http-1')
    const auctionPrice = ethers.utils.parseUnits('100','ether')
    let [addr1] = await ethers.getSigners() 
    await market.connect(addr1).makeMarketItem(nftContractAddress,1,auctionPrice,{ value:listingPrice })

    await market.connect(addr1).createMarketSale(nftContractAddress,1,{
      value: auctionPrice
    })

    const myNFTs = await market.fetchMyNFTs()
    expect(myNFTs[0].owner).to.equal(addr1.address)
    expect(myNFTs[0].sold).to.equal(true)
  })

  it('should fetchItemsCreated work', async function(){
    const Market = await ethers.getContractFactory('Market')
    const market = await Market.deploy()
    await market.deployed()
    const marketContractAddress = market.address

    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy(marketContractAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()
    await nft.mintToken('http-1')
    const auctionPrice = ethers.utils.parseUnits('100','ether')
    let [addr1] = await ethers.getSigners() 
    await market.connect(addr1).makeMarketItem(nftContractAddress,1,auctionPrice,{ value:listingPrice })

    let myMints = await market.connect(addr1).fetchItemsCreated()
    expect(myMints[0].seller).to.equal(addr1.address)
  })
})
