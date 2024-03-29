// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ERC721Enumerable.sol";
import "./Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string public baseURI;
    string public baseExtension = ".json";
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;
    bool public pauseStatus = false;

    struct Whitelist {
        uint256 id;
        address allowedMinter;
    }

    uint256 public whitelistCount = 0;
    mapping(uint256 => Whitelist) public whitelist;

    event Mint(uint256 amount, address minter);
    event Withdraw(uint256 amount, address owner);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn,
        string memory _baseURI
        // ,
        // bool _pauseStatus
    ) ERC721(_name, _symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
        allowMintingOn = _allowMintingOn;
        baseURI = _baseURI;
        // pauseStatus = _pauseStatus;
    }

    modifier onlyWhitelisted() {
        bool isWhitelisted = false;

        // Check if the caller's address is in the whitelist
        for (uint256 i = 1; i <= whitelistCount; i++) {
            if (whitelist[i].allowedMinter == msg.sender) {
                isWhitelisted = true;
                break;
            }
        }
        
        // Only allow whitelisted addresses to access function
        require(isWhitelisted, "Caller is not whitelisted");
        _;
    }

    function mint(uint256 _mintAmount) public payable onlyWhitelisted {

    // Only allow minting after specified time
    require(block.timestamp >= allowMintingOn, "Timestamp Require problem");
    // Must mint at least 1 token
    require(_mintAmount > 0, "mintAmount Require problem");

    // Debugging: Print out relevant information
    emit Debug(msg.value, cost, _mintAmount);

    // Require enough payment
    require(msg.value >= cost * _mintAmount, "payment Require problem");
    // require(uint256(msg.value) >= uint256(cost) * uint256(_mintAmount), "payment Require problem");


    uint256 supply = totalSupply();

    // Do not let them mint more tokens than available
    require(supply + _mintAmount <= maxSupply, "maxSupply Require problem");

    // Create tokens
    for (uint256 i = 1; i <= _mintAmount; i++) {
        _safeMint(msg.sender, supply + i);
    }

    // Emit event
    emit Mint(_mintAmount, msg.sender);
}

event Debug(uint256 msgValue, uint256 cost, uint256 mintAmount);

    // Return metadata IPFS url
    // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns(string memory)
    {
        require(_exists(_tokenId), 'token does not exist');
        return(string(abi.encodePacked(baseURI, _tokenId.toString(), baseExtension)));
    }

    function walletOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for(uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    // Owner functions

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success);

        emit Withdraw(balance, msg.sender);
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setPauseStatus(bool _pauseStatus) public onlyOwner {
        pauseStatus = _pauseStatus;
    }

    function createWhitelistEntry(
        address _allowedMinter
    ) public onlyOwner {

        whitelistCount++;

        whitelist[whitelistCount] = Whitelist(
            whitelistCount,
            _allowedMinter
        );
    }

}
