import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaRobot, FaTimes, FaMicrophone } from "react-icons/fa";
import "./Chatbot.css";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setChat((prevChat) => [...prevChat, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post("https://aimodels-chatbot.onrender.com/chatbot", { message });
      const botMessage = { sender: "bot", text: response.data.response };
      setChat((prevChat) => [...prevChat, botMessage]);
    } catch (error) {
      const errorMessage = { sender: "bot", text: "Error fetching response. Try again!" };
      setChat((prevChat) => [...prevChat, errorMessage]);
    }

    setLoading(false);
  };

  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setMessage(voiceText);
    };

    recognition.onerror = () => {
      alert("Voice recognition failed. Please try again.");
    };
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      const chatBox = chatBoxRef.current;
  
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [chat]);
     

  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button className="chatbot-icon" onClick={() => setIsOpen(true)}>
          <FaRobot size={30} />
        </button>
      )}

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <span className="chat-header-text">AI Assistance</span>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <FaTimes size={20} />
            </button>
          </div>
          <div className="chat-box" ref={chatBoxRef}>
            {chat.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="chat-message bot typing">Bot is typing...</div>}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask something..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={handleVoiceInput} className="voice-button">
              <FaMicrophone />
            </button>
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
