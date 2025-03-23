import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FaLock, FaBrain, FaLaptopCode, FaFileContract } from "react-icons/fa";
import { BsTransparency } from "react-icons/bs";
import { AiOutlineVerticalAlignMiddle } from "react-icons/ai";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import home1img from "../assets/20.jpg";
import process from "../assets/9.jpg";
import Agriculture from "../assets/100.jpg";
import Healthcare from "../assets/101.jpg";
import Finance from "../assets/102.jpg";
import Retail from "../assets/103.jpg";
import Energy from "../assets/104.jpg";
import "./Home.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [offsetIndex, setOffsetIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const text = "Blockchain Powered AI Model Marketplace...";
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 100); 
      return () => clearTimeout(timeout);
    } else {
      const cursorTimeout = setTimeout(() => {
        setCursorVisible(false);
      }, 500); 
      return () => clearTimeout(cursorTimeout);
    }
  }, [index]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500); 
    return () => clearInterval(blinkInterval);
  }, []);

  const offsets = [
    {
      img: Agriculture,
      title: "Agriculture Models",
      description:
        "These models predict crop yields, analyze soil quality, and suggest optimal farming practices for increased productivity and sustainability.",
    },
    {
      img: Healthcare,
      title: "Healthcare Models",
      description:
        "Models that aid in diagnosing diseases, predicting patient outcomes, and providing treatment recommendations using patient data and medical imaging analysis.",
    },
    {
      img: Finance,
      title: "Finance Models",
      description:
        "These models help with fraud detection, credit scoring, investment predictions, and financial risk analysis to optimize decision-making and investments.",
    },
    {
      img: Retail,
      title: "Retail Models",
      description:
        "AI models in retail analyze customer behavior, predict demand, optimize pricing, and provide personalized recommendations for enhanced customer experience and sales.",
    },
    {
      img: Energy,
      title: "Energy Models",
      description:
        "Models in this domain optimize energy consumption, predict demand, and enable predictive maintenance for power plants and renewable energy sources.",
    },
  ];

  const handlePrev = () =>
    setOffsetIndex((prev) => (prev === 0 ? offsets.length - 1 : prev - 1));
  const handleNext = () =>
    setOffsetIndex((prev) => (prev === offsets.length - 1 ? 0 : prev + 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      // Show success message if the response is ok
      if (response.ok) {
        toast.success(data.message || "Message sent successfully!", {
          autoClose: 3000,
          hideProgressBar: true,
        });
        setFormData({ name: "", email: "", message: "" }); // Reset form data
      } else {
        toast.error(data.error || "Failed to send message.", {
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      // Show error message if backend is down or network error occurs
      toast.error("Backend not working! Please try again later.", {
        autoClose: 3000,
        hideProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div>
      <Navbar />
      <div className="home1container">
        <div className="home1text">
          <h1>
            {displayText.split("").map((char, i) => (
              <span
                key={i}
                style={{
                  color: i < index ? "#FFD700" : "#0b79c3", // Yellow for typed letters, blue for untyped
                  transition: "color 0.5s",
                }}
              >
                {char}
              </span>
            ))}
            <span className="cursor" style={{ opacity: cursorVisible ? 1 : 0 }}>
              |
            </span>
          </h1>
          <p>
            This decentralized platform ensures secure AI/ML transactions,
            transparent royalties, privacy with federated learning, and seamless
            management using MERN stack.
          </p>
          <div className="m">
            Transforming AI model sharing with transparency, security, and fair
            compensation.
          </div>
        </div>
        <div className="home1image">
          <img src={home1img} alt="Sustainability" />
        </div>
      </div>

      <div className="features-section">
        <h1>Key Benefits of the Decentralized AI Model Marketplace</h1>
        <div className="features-grid">
          {[
            {
              icon: <FaLock />,
              title: "Privacy Protection",
              description:
                "Federated learning keeps data private while verifying model accuracy.",
            },
            {
              icon: <FaBrain />,
              title: "Informed Decisions",
              description:
                "Data analytics offer insights into model performance and market demand.",
            },
            {
              icon: <FaLaptopCode />,
              title: "Easy Management",
              description:
                "The MERN stack provides a user-friendly platform for managing models.",
            },
            {
              icon: <FaFileContract />,
              title: "Automatic Payments",
              description:
                "Smart contracts guarantee fair and instant royalty payments for creators.",
            },
            {
              icon: <BsTransparency />,
              title: "Transparency",
              description:
                "Blockchain ensures clear and secure transactions for buyers and sellers.",
            },
            {
              icon: <AiOutlineVerticalAlignMiddle />,
              title: "No Middlemen",
              description:
                "Blockchain eliminates intermediaries, reducing costs and fraud risks.",
            },
          ].map(({ icon, title, description }, index) => (
            <div className="feature" key={index}>
              <div className="feature-icon">{icon}</div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="offsets">
        <h1>Ai Models Examples</h1>
        <div className="offsets-container">
          <FaArrowLeft className="arrow" onClick={handlePrev} />
          <div
            className="offsets-slider"
            style={{ transform: `translateX(-${offsetIndex * 100}%)` }}
          >
            {offsets.map((offset, index) => (
              <div key={index} className="offset">
                <img src={offset.img} alt={offset.title} />
                <h2>{offset.title}</h2>
                <p>{offset.description}</p>
              </div>
            ))}
          </div>
          <FaArrowRight className="arrow" onClick={handleNext} />
        </div>
      </div>

      <div className="process">
        <div>
          <img src={process} alt="Carbon Trading Process" />
        </div>
        <div>
          <h1>How to Use?</h1>
          <p>
            The Decentralized AI Model Marketplace allows creators to upload,
            sell, and manage their AI/ML models securely using blockchain
            technology. Creators can set licensing terms through smart
            contracts, ensuring automatic royalty payments with each use or sale
            of their models. Buyers can browse the platform, access detailed
            analytics on model performance, and select models that meet their
            needs. Federated learning ensures models are validated without
            compromising privacy. The platform, built on the MERN stack, offers
            a seamless user experience for both creators and buyers, fostering
            transparency and fair compensation in the AI/ML model marketplace.
          </p>
        </div>
      </div>

      <div className="contact-us">
        <h2>Contact Us</h2>
        <div>
          <form onSubmit={handleSubmit} className="contact-form">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>Message:</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Submit"}{" "}
            </button>
          </form>
        </div>
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default Home;
