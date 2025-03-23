import React, { useEffect, useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import { toast } from "react-toastify";
import "./Market.css";

const Market = () => {
  const { fetchModels, models, buyModel, account } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [learningFilter, setLearningFilter] = useState("All");
  const [userLoggedIn, setUserLoggedIn] = useState(false); 
  const [backendFilteredModels, setBackendFilteredModels] = useState([]); 

  useEffect(() => {
    fetchModels().then(() => setLoading(false));

    // ✅ Check if user is logged in (stored in localStorage)
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserLoggedIn(true);
    }

  }, [fetchModels]);

  // ✅ Backend Filtering - Determines which models are initially shown
  useEffect(() => {
    const filtered = models.filter((model) => {
      if (!account) {
        // ✅ If wallet is NOT connected, only show fresh unsold models
        return model.isForSale;
      }

      // ✅ If wallet is connected, filter based on ownership
      const isOwner = model.owner.toLowerCase() === account.toLowerCase();
      const isSold = !model.isForSale; 

      return isOwner || (!isSold && !isOwner); 
    });

    setBackendFilteredModels(filtered);
  }, [models, account]);

  // ✅ Capitalize first letter of each word
  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // ✅ Frontend Filtering - Allows users to filter models based on dropdowns
  const frontendFilteredModels = backendFilteredModels.filter((model) => {
    const category = capitalizeFirstLetter(model.category);
    const learning = capitalizeFirstLetter(model.learningTechnique);

    const matchesCategory = categoryFilter === "All" || category === categoryFilter;
    const matchesLearning = learningFilter === "All" || learning === learningFilter;

    return matchesCategory && matchesLearning;
  });

  // ✅ Handle Buy Button Click
  const handleBuyClick = (modelId, price, modelOwner) => {
    if (!userLoggedIn) {
      toast.error("Please login first!");
      return;
    }
    buyModel(modelId, price, modelOwner);
  };

  return (
    <div id="market-page">
      <Navbar />
      <div className="market-container">
        <h2 className="market-title">🛒 AI Model Marketplace</h2>
        <div className="market-content">
          {/* Left Side: Sorting Filters */}
          <div className="filter-box">
            <h3>Sort By</h3>
            <label>Category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>

            <label>Learning Technique:</label>
            <select value={learningFilter} onChange={(e) => setLearningFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Supervised">Supervised</option>
              <option value="Unsupervised">Unsupervised</option>
              <option value="Reinforcement">Reinforcement</option>
            </select>
          </div>

          {/* Right Side: Models Display */}
          <div className="model-grid">
            {loading ? (
              <p className="loading-message">⌛ Loading models...</p>
            ) : frontendFilteredModels.length > 0 ? (
              frontendFilteredModels.map((model) => {
                const isUserLoggedIn = !!account;
                const isOwner = isUserLoggedIn && model.owner.toLowerCase() === account.toLowerCase();
                const isSold = !model.isForSale; // Model is sold if isForSale is false

                return (
                  <div key={model.id} className="model-card">
                    {/* ✅ Show Green Tick if user owns this model (Only when logged in) */}
                    {isUserLoggedIn && isOwner && <div className="model-badge owner-badge"></div>}

                    <div className="model-details">
                      <h3 className="model-name">{model.name}</h3>
                      <p className="model-info"><b className="model-info-head">Category:</b> {capitalizeFirstLetter(model.category)}</p>
                      <p className="model-info"><b className="model-info-head">Learning Technique:</b> {capitalizeFirstLetter(model.learningTechnique)}</p>
                      <p className="model-price"><b className="model-info-head">Price:</b> {model.price} ETH</p>

                      {/* Buy Button: If user is NOT logged in, show "Login First" message */}
                      <button
                        className="buy-button"
                        onClick={() => handleBuyClick(model.id, model.price, model.owner)}
                        disabled={isOwner || isSold}
                      >
                        {!isUserLoggedIn ? "Buy Now" : isOwner ? "Owned ✅" : "Buy Now"}
                      </button>
                    </div>

                    <div className="model-description-box">
                      <p className="model-description"><b className="model-info-head">Description:</b> {model.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-models-message">😕❌ No models match your selected filters or you not connected your wallet, Please try again!</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Market;













