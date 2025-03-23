import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context"; 
import Home from "./screens/Home";
import Market from "./screens/Market";
import Login from "./screens/Login";
import Profile from "./screens/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

// 🔒 Protected Route Component
const ProtectedRoute = ({ element }) => {
  const user = localStorage.getItem("user");
  return user ? element : <Navigate to="/login" />;
};

function App() {
  useEffect(() => {
    // 🚫 Prevent zooming via keyboard shortcuts
    const disableZoomKeys = (event) => {
      if ((event.ctrlKey || event.metaKey) && ["+", "-", "0"].includes(event.key)) {
        event.preventDefault();
      }
    };

    // 🚫 Prevent zooming via Ctrl + Mouse Wheel Scroll
    const disableWheelZoom = (event) => {
      if (event.ctrlKey) event.preventDefault();
    };

    // 🚫 Prevent pinch zoom on touch devices
    const disableTouchZoom = (event) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener("keydown", disableZoomKeys);
    document.addEventListener("wheel", disableWheelZoom, { passive: false });
    document.addEventListener("touchmove", disableTouchZoom, { passive: false });

    return () => {
      document.removeEventListener("keydown", disableZoomKeys);
      document.removeEventListener("wheel", disableWheelZoom);
      document.removeEventListener("touchmove", disableTouchZoom);
    };
  }, []);

  return (
    <Web3Provider> {/* ✅ Wrap the app with Web3Provider */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Market />} />
          <Route path="/login" element={<Login />} />
          {/* 🔒 Protected route for profile */}
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        </Routes>

        {/* ✅ Toastify for global notifications */}
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Router>
    </Web3Provider>
  );
}

export default App;
