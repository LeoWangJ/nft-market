//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import 'hardhat/console.sol';

contract Market is ReentrancyGuard{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _tokensSold;

    address payable owner;
   
    uint256 listingPrice = 0.045 ether;

    constructor(){
        owner = payable(msg.sender);
    }
    
    struct MarketToken {
        uint itemId;
        address ntfContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }
    
    // give tokenId return which MarketToken - fetch which on it is (like hash table)
    mapping(uint256 => MarketToken) private idToMarketToken;

    // listen to events from front end applications
    event MarketTokenMinted(
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    // get the listing price
    function getListingPrice () public view returns (uint256) {
        return listingPrice;
    }

    /* 
     * two functions to interact with contract
     * 1. create a market item to put it up for sale
     * 2. create a market sale for buying and selling between parties
     */
    function makeMarketItem (
        address ntfContract,
        uint tokenId,
        uint price
    ) public payable nonReentrant {
       require(price > 0,"Price must be at least one wei");
       require(msg.value == listingPrice,'Price must be equal to listing price');
       
       _tokenIds.increment();
       uint itemId = _tokenIds.current();
       
       // putting it up for sale - bool - no owner
       idToMarketToken[itemId] = MarketToken(
           itemId,
           ntfContract,
           tokenId,
           payable(msg.sender),
           payable(address(0)),
           price,
           false
       );
       
       // NFT transcation
       IERC721(ntfContract).transferFrom(msg.sender, address(this), tokenId);

       emit MarketTokenMinted(
           itemId,
           ntfContract,
           tokenId,
           msg.sender,
           address(0),
           price,
           false
       );
    } 

    // function to conduct transaction and market sales
    function createMarketSale(
        address ntfContract,
        uint itemId
    ) public payable nonReentrant {
        uint price = idToMarketToken[itemId].price;
        uint tokenId = idToMarketToken[itemId].tokenId;
        require(msg.value == price, "Please submit the asking price in order to continue");
        
        // transfer the amount to the seller 
        idToMarketToken[itemId].seller.transfer(msg.value);
        // transfer the token from contract address to the buyer
        IERC721(ntfContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketToken[itemId].owner = payable(msg.sender);
        idToMarketToken[itemId].sold = true;
        _tokensSold.increment();
        payable(owner).transfer(listingPrice);
    }
}