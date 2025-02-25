// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ModelMarketplace {
    struct Model {
        uint256 id;
        string name;
        string category;
        string learningTechnique;
        string ipfsHash;
        address payable owner;
        uint256 price;
        bool isForSale;
        string description;
    }

    uint256 public modelCount;
    mapping(uint256 => Model) public models;
    mapping(address => uint256[]) public userModels;

    event ModelUploaded(uint256 indexed id, address indexed owner, uint256 price);
    event ModelPurchased(uint256 indexed id, address indexed newOwner, uint256 price);
    event PriceUpdated(uint256 indexed id, uint256 newPrice);

    constructor() {
        modelCount = 0;
    }

    // ✅ Upload a new model 
    function uploadModel(
        string memory _name,
        string memory _category,
        string memory _learningTechnique,
        string memory _ipfsHash,
        uint256 _price,
        bool _isForSale,
        string memory _description
    ) public {
        require(bytes(_name).length > 0, "Model name required");
        require(bytes(_category).length > 0, "Category required");
        require(bytes(_learningTechnique).length > 0, "Learning technique required");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(_price > 0, "Price must be greater than zero");

        modelCount++;
        models[modelCount] = Model(
            modelCount,
            _name,
            _category,
            _learningTechnique,
            _ipfsHash,
            payable(msg.sender),
            _price,
            _isForSale,
            _description
        );

        userModels[msg.sender].push(modelCount);

        emit ModelUploaded(modelCount, msg.sender, _price);
    }

    // ✅ Fetch all models safely
    function getAllModels() public view returns (Model[] memory) {
        Model[] memory allModels = new Model[](modelCount);
        for (uint256 i = 1; i <= modelCount; i++) {
            allModels[i - 1] = models[i]; 
        }
        return allModels;
    }

    // ✅ Buy a model & transfer ownership
    function buyModel(uint256 _id) public payable {
        require(_id > 0 && _id <= modelCount, "Invalid model ID");
        Model storage model = models[_id];
        require(model.isForSale, "Model not for sale");
        require(msg.value >= model.price, "Insufficient funds");
        require(msg.sender != model.owner, "Cannot buy your own model");

        address payable previousOwner = model.owner;
        model.owner = payable(msg.sender);
        model.isForSale = false;

        previousOwner.transfer(msg.value);

        emit ModelPurchased(_id, msg.sender, model.price);
    }

    // ✅ Change the price of a model (only owner)
    function changePrice(uint256 _id, uint256 _newPrice) public {
        require(_id > 0 && _id <= modelCount, "Invalid model ID");
        Model storage model = models[_id];
        require(msg.sender == model.owner, "Only owner can change price");
        require(_newPrice > 0, "Price must be greater than zero");

        model.price = _newPrice;
        emit PriceUpdated(_id, _newPrice);
    }
}
