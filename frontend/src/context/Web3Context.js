import React, { createContext, useContext, useEffect, useState, useCallback} from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModelMarketplace from "../contracts/ModelMarketplace.json";

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [models, setModels] = useState([]);

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  // ✅ Connect Wallet Function
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAccount = await signer.getAddress();

      setAccount(userAccount);

      const marketplace = new ethers.Contract(
        contractAddress,
        ModelMarketplace.abi,
        signer
      );

      setContract(marketplace);
      console.log("✅ Wallet Connected:", userAccount);
      console.log("🔗 Contract Connected:", marketplace);

      // ✅ Store connected account in local storage
      localStorage.setItem("walletAddress", userAccount);
    } catch (error) {
      console.error("❌ Wallet Connection Failed:", error);
    }
  }, [contractAddress]);

  // ✅ Check if wallet was already connected
  useEffect(() => {
    const savedWallet = localStorage.getItem("walletAddress");
    if (savedWallet && !account) {
      connectWallet();
    }
  }, [account, connectWallet]);

  // ✅ Upload Model to Blockchain
  const uploadModel = async (
    modelName,
    category,
    learningTechnique,
    ipfsHash,
    price,
    isForSale,
    description
  ) => {
    if (!contract) {
      console.error("❌ Contract not initialized");
      toast.error("❌ Contract not connected. Try reconnecting wallet.");
      return;
    }

    try {
      console.log("⏳ Sending transaction to blockchain...");
      const tx = await contract.uploadModel(
        modelName,
        category,
        learningTechnique,
        ipfsHash,  // ✅ Store the IPFS hash on blockchain
        ethers.parseEther(price.toString()),  // ✅ Convert price to ETH format
        isForSale,
        description
      );

      console.log("⏳ Waiting for transaction to be mined...");
      await tx.wait();  // ✅ Ensure transaction completes

      console.log("✅ Model Stored on Blockchain:", tx.hash);
      toast.success("🎉 Model successfully uploaded to blockchain!");

      return tx;
    } catch (error) {
      console.error("❌ Blockchain Storage Failed:", error);
      toast.error("❌ Error storing model in blockchain. Check console for details.");
      throw error;
    }
  };

  // ✅ Fetch Models from Blockchain
  const fetchModels = async () => {
    if (!contract) return;
    try {
      const data = await contract.getAllModels();
      const parsedModels = data.map((model) => ({
        id: model.id.toString(),
        name: model.name,
        category: model.category,
        learningTechnique: model.learningTechnique,
        ipfsHash: model.ipfsHash,
        owner: model.owner,
        price: ethers.formatEther(model.price),
        isForSale: model.isForSale,
        description: model.description,
      }));
      setModels(parsedModels);
    } catch (error) {
      console.error("❌ Error Fetching Models:", error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
    }
  }, [connectWallet]);

  // ✅ Change Model Price (Only Owner)
  const changePrice = async (modelId, newPrice) => {
    if (!contract) {
      toast.error("Smart contract not connected! Try reconnecting wallet.");
      return;
    }

    if (!newPrice || parseFloat(newPrice) <= 0) {
      toast.error("Enter a valid price!");
      return;
    }

    try {
      toast.info("Updating price, please wait...");
      const tx = await contract.changePrice(modelId, ethers.parseEther(newPrice));
      await tx.wait();
      toast.success("✅ Price updated successfully!");

      fetchModels(); // Refresh models after update
    } catch (error) {
      console.error("❌ Error Updating Price:", error);
      toast.error("❌ Failed to update price.");
    }
  };

  // ✅ Buy Model (Only if not Owner)
  const buyModel = async (modelId, price, modelOwner) => {
    if (!account) {
      toast.error("Please login first!");
      return;
    }

    if (!contract) {
      toast.error("Smart contract not connected! Try reconnecting wallet.");
      return;
    }

    if (account.toLowerCase() === modelOwner.toLowerCase()) {
      toast.error("You already own this model! You can download it from your profile.");
      return;
    }

    try {
      toast.info("Processing purchase...");
      const tx = await contract.buyModel(modelId, { value: ethers.parseEther(price) });
      await tx.wait();

      toast.success("✅ Model purchased successfully!");
      fetchModels(); // Refresh models after update
    } catch (error) {
      console.error("❌ Error Buying Model:", error);
      toast.error("❌ Transaction failed. Please try again.");
    }
  };

  return (
    <Web3Context.Provider value={{ account, connectWallet, uploadModel, changePrice, buyModel, fetchModels, models }}>
      {children}
    </Web3Context.Provider>
  );
};
