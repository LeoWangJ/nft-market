//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    // 使 Counter stuct 可以使用 Counters 全部方法
    using Counters for Counters.Counter;

    // 將 _tokenId 變成 Counter stuct
    Counters.Counter private _tokenIds;

    address contractAddress;

    constructor(address marketplaceAddress) ERC721("leowang", "LEO") {
        contractAddress = marketplaceAddress;
    }

    function mintToken(string memory tokenURL) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURL);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }
}
