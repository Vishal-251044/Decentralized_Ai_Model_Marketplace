import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import { FaEdit } from "react-icons/fa"; 
import "./Profile.css"; 
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useWeb3 } from "../context/Web3Context";
import { uploadToIPFS } from "../utils/ipfs";
import JSZip from "jszip";

const Profile = () => {
  const navigate = useNavigate();
  const { account, connectWallet, uploadModel, fetchModels, models, changePrice } = useWeb3(); 
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userModels, setUserModels] = useState([]);
  const [editModel, setEditModel] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(false); 
  const [loading2, setLoading2] = useState(false); 
  const [showUploadModal, setShowUploadModal] = useState(false); 
  const [updatedUser, setUpdatedUser] = useState({ name: "", password: "" });
  const [uploadDetails, setUploadDetails] = useState({
    learningTechnique: "",
    category: "",
    modelName: "",
    file: null,
    price: "",
    description: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
    } else {
      setUser(storedUser);
    }

    if (!account && window.ethereum) {
      connectWallet();
    }
  }, [navigate, account, connectWallet]);   


  const getFirstLetter = (name) => {
    return name.charAt(0).toUpperCase(); 
  };

  const handleEditClick = () => {
    setShowModal(true); 
  };

  const handleChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email, 
            name: updatedUser.name,
            password: updatedUser.password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const updatedUserData = { ...user, name: updatedUser.name };
        setUser(updatedUserData);
        localStorage.setItem("user", JSON.stringify(updatedUserData));
        setShowModal(false); // Close modal

        toast.success("User details updated successfully!");
      } else {
        toast.error("Error updating user details");
      }
    } catch (error) {
      toast.error("Something went wrong! Please try again.");
      console.error("Update Error:", error);
    }
  };

  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadDetails({ ...uploadDetails, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = [
      ".h5",
      ".tf",
      ".savedmodel",
      ".pb",
      ".ckpt",
      ".pt",
      ".pth",
      ".jit",
      ".onnx",
      ".pkl",
      ".joblib",
      ".model",
      ".bin",
      ".json",
      ".cbm",
      ".prototxt",
      ".caffemodel",
      ".params",
      ".symbol",
    ];

    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));

    const maxSize = 15 * 1024 * 1024; 

    if (fileExtension !== ".zip") {
      toast.error("Only ZIP files are allowed!");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size exceeds 15MB limit.");
      return;
    }

    try {
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(file);
      let validFileFound = false;

      for (const fileName in zipContents.files) {
        const innerFileExt = fileName.substring(fileName.lastIndexOf("."));
        if (allowedExtensions.includes(innerFileExt)) {
          validFileFound = true;
          break;
        }
      }

      if (!validFileFound) {
        toast.error("ZIP must contain at least one valid AI model file.");
        return;
      }

      setUploadDetails({ ...uploadDetails, file });
      toast.success("Valid ZIP uploaded!");
    } catch (error) {
      toast.error("Error reading ZIP file. Please try again.");
      console.error("ZIP Processing Error:", error);
    }
  };

  const handlePriceChange = (e) => {
    let price = parseFloat(e.target.value);
    if (price < 0) price = 0;
    if (price > 1) price = 1;
    setUploadDetails({ ...uploadDetails, price });
  };

  const handleUpload = async () => {
    if (!account) {
      toast.error("Please connect your wallet first!");
      await connectWallet(); 
      return;
    }

    if (!uploadDetails.file) {
      toast.error("Please upload a ZIP file.");
      return;
    }

    try {
      setLoading(true);
      console.log("📤 Uploading file to IPFS...");

      // ✅ Ensure valid IPFS response
      const ipfsHash = await uploadToIPFS(uploadDetails.file);
      if (!ipfsHash || ipfsHash.length === 0) { // ❌ Prevent empty hash issue
        toast.error("❌ IPFS upload failed. No valid hash returned.");
        return;
      }

      toast.success("🎉 File uploaded to IPFS successfully!");

      // ✅ Upload model details to blockchain
      const tx = await uploadModel(
        uploadDetails.modelName,
        uploadDetails.category,
        uploadDetails.learningTechnique,
        ipfsHash,  
        uploadDetails.price,
        true,
        uploadDetails.description
      );

      await tx.wait(); // ✅ Ensure blockchain transaction completes

      toast.success("✅ Model successfully uploaded to blockchain!");
      setShowUploadModal(false);
    } catch (error) {
      toast.error("❌ Error uploading model.");
      console.error("Upload Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!account) return;

    fetchModels();

    // ✅ Filter models where the logged-in user is the owner
    const ownedModels = models.filter((model) => model.owner.toLowerCase() === account.toLowerCase());
    setUserModels(ownedModels);
  }, [models, account, fetchModels]);

  // ✅ Handle Price Update
  const handlePriceUpdate = async (modelId) => {
    setLoading2(true); 
    await changePrice(modelId, newPrice);
    setLoading2(false); 
    setEditModel(null);
  };

  return (
    <div>
      <Navbar />
      <div className="profile-page">
        {user ? (
          <div>
            {/* Profile Header - Image, Name, Email, Edit Icon */}
            <div className="profile-header">
              <div className="profile-image">{getFirstLetter(user.name)}</div>
              <div className="profile-info">
                <p>
                  <b>Name:</b> {user.name}
                </p>
                <p>
                  <b>Email:</b> {user.email}
                </p>
                <p>
                  <b>Wallet:</b> {account ? (
                    account
                  ) : (
                    <button className="connect-wallet-button" onClick={connectWallet}>
                      Connect Wallet
                    </button>
                  )}
                </p>
              </div>
              {/* Edit Icon on the right */}
              <div>
                <FaEdit className="edit-icon" onClick={handleEditClick} />
              </div>
            </div>

            {/* Modal for editing user details */}
            {showModal && (
              <div className="edit-modal">
                <div className="modal-content">
                  <h2>Edit Profile</h2>
                  <input
                    type="text"
                    name="name"
                    placeholder="Update Name"
                    value={updatedUser.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Update Password"
                    value={updatedUser.password}
                    onChange={handleChange}
                    className="input-field"
                  />
                  <div className="modal-buttons">
                    <button className="primary-button" onClick={handleUpdate}>
                      Confirm
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Model Modal */}
            <button
              className="upload-button"
              onClick={() => setShowUploadModal(true)}
            >
              Upload Model
            </button>

            {showUploadModal && (
              <div className="upload-modal">
                <div className="modal-content">
                  <h2>Upload Model</h2>
                  <select
                    name="learningTechnique"
                    value={uploadDetails.learningTechnique}
                    onChange={handleUploadChange}
                    className="input-field"
                  >
                    <option value="">Select Learning Technique</option>
                    <option value="supervised">Supervised</option>
                    <option value="unsupervised">Unsupervised</option>
                    <option value="reinforcement">Reinforcement</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    name="category"
                    value={uploadDetails.category}
                    onChange={handleUploadChange}
                    className="input-field"
                  >
                    <option value="">Select Category</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    name="modelName"
                    placeholder="Model Name"
                    value={uploadDetails.modelName}
                    onChange={handleUploadChange}
                    className="input-field1"
                  />
                  <input
                    type="file"
                    name="file"
                    onChange={handleFileChange}
                    className="input-field1"
                  />
                  <input
                    type="number"
                    name="price"
                    placeholder="Enter Price in ETH (0 - 1)"
                    value={uploadDetails.price}
                    onChange={handlePriceChange}
                    step="0"
                    min="0"
                    max="1"
                    className="input-field1"
                  />
                  <textarea
                    name="description"
                    placeholder="Model Description (60 words only)"
                    value={uploadDetails.description}
                    onChange={handleUploadChange}
                    className="input-field1"
                  ></textarea>

                  <div className="modal-buttons">
                    <button className="primary-button" onClick={handleUpload} disabled={loading}>
                      {loading ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => setShowUploadModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div class="loader"></div>
        )}
      </div>
      <h3 className="user-models-heading">📜 Your Models</h3>
      <div className="user-models-box">
        {/* ✅ Show All User's Models (Uploaded & Purchased) */}
        {userModels.length > 0 ? (
          userModels.map((model) => (
            <div key={model.id} className="user-model-card">
              <h3 className="user-model-name">{model.name}</h3>
              <p className="user-model-category"><b>Category:</b> {model.category}</p>
              <p className="user-model-price"><b>Price:</b> {model.price} ETH</p>
              <p className="user-model-sale-status">
                <b>For Sale:</b> {model.isForSale ? "✅ Yes" : "❌ No"}
              </p>
              <a href={model.ipfsHash} target="_blank" rel="noopener noreferrer" className="user-model-link">
                View Model 🔗
              </a>

              {model.isForSale ? (
                editModel === model.id ? (
                  <div className="user-model-edit-container">
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Enter new price"
                      className="user-model-price-input"
                    />
                    <button className="user-model-update-btn" onClick={() => handlePriceUpdate(model.id)} disabled={loading2}>
                      {loading2 ? "Updating..." : "Update"}
                    </button>
                    <button className="user-model-cancel-btn" onClick={() => setEditModel(null)} disabled={loading2}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="user-model-edit-btn" onClick={() => setEditModel(model.id)}>Edit Price</button>
                )
              ) : null}
            </div>
          ))
        ) : (
          <p className="user-no-models-message">❌ No models found.</p>
        )}
      </div>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Profile;