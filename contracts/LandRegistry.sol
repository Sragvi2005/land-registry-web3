// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LandRegistry is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct LandInfo {
        string location;
        uint256 areaSqFt;
        uint256 propertyTaxId;
        bool isVerified;
    }

    // Mapping from Token ID to Land Metadata
    mapping(uint256 => LandInfo) public landRecords;
    
    event LandTransferred(uint256 indexed landId, address indexed from, address indexed to);
    constructor() ERC721("DigitalLandTitle", "LAND") Ownable(msg.sender) {}

    /**
     * @dev Only the 'Government' (Contract Owner) can register new land.
     */
    function registerLand(
        address owner, 
        string memory tokenURI, 
        string memory loc, 
        uint256 area,
        uint256 taxId
    ) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        landRecords[tokenId] = LandInfo(loc, area, taxId, true);
    }

    // Function to fetch land details
    function getLandDetails(uint256 tokenId) public view returns (LandInfo memory) {
        _requireOwned(tokenId);
        return landRecords[tokenId];
    }
    function transferLand(uint256 _landId, address _to) public {
    // 1. Check if land exists (OpenZeppelin 5.x internal helper)
        address currentOwner = ownerOf(_landId);
        
        // 2. Security: Only the current owner can initiate transfer
        require(currentOwner == msg.sender, "You do not own this land plot.");
        
        // 3. Validation: Prevent zero address
        require(_to != address(0), "Cannot transfer to the zero address.");

        // 4. State Change: Move the NFT (this updates the internal owner mapping)
        _transfer(currentOwner, _to, _landId);

        // 5. Emit our custom event for the Land Registry records
        emit LandTransferred(_landId, currentOwner, _to);
}
}