// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SipScore is ERC721, Ownable {
    uint256 private tokenIdCounter;
    mapping(uint256 => uint256) private balances;
    mapping(address => uint256) private ownersToTokenId;
    mapping(address => bool) private hasMinted;

    constructor() ERC721("SipScore", "SS") {}

   function mintNFT() public {
        require(!hasMinted[msg.sender], "Address has already minted an NFT");
        _safeMint(msg.sender, tokenIdCounter);
        ownersToTokenId[msg.sender] = tokenIdCounter;
        hasMinted[msg.sender] = true;
        tokenIdCounter++;
    }

    function getBalance(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token ID does not exist");
        return balances[tokenId];
    }

    function updateBalance(uint256 tokenId, uint256 points) public onlyOwner {
        require(_exists(tokenId), "Token ID does not exist");
        balances[tokenId] += points;
    }

    function redeem(uint256 tokenId, uint256 points) public {
        require(_exists(tokenId), "Token ID does not exist");
        require(balances[tokenId] >= points, "Not enough points");

        balances[tokenId] -= points;
    }
    
    function getTokenId(address owner) public view returns (uint256, bool) {
    uint256 tokenId = ownersToTokenId[owner];
    bool exists = (ownerOf(tokenId) == owner);
    return (tokenId, exists);
}
}

