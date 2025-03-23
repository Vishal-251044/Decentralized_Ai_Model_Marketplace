import axios from "axios";

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

// ✅ Upload File to Pinata IPFS
export const uploadToIPFS = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({ name: file.name });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", options);

  try {
    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });

    console.log("✅ File Uploaded to Pinata IPFS:", response.data.IpfsHash);
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`; // ✅ Return public Pinata IPFS URL
  } catch (error) {
    console.error("❌ Pinata IPFS Upload Failed:", error);
    return null;
  }
};
