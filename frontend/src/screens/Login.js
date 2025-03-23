import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar.js";
import img from "../assets/105.jpg";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./Login.css";

const Login = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.google?.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    });
  }, []);

  const toggleAuthForm = () => {
    setIsSignUpMode(!isSignUpMode);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = isSignUpMode
      ? `${process.env.REACT_APP_API_URL}/api/auth/register`
      : `${process.env.REACT_APP_API_URL}/api/auth/login`;

    try {
      const response = await axios.post(url, formData);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      toast.success(
        isSignUpMode ? "Account Created Successfully!" : "Login Successful!"
      );

      navigate("/profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (response) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google-auth`,
        {
          token: response.credential,
        }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      toast.success("Google Login Successful!");

      navigate("/profile");
    } catch (error) {
      toast.error("Google Authentication Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="login-page-container">
        <Navbar />
        <div className="authentication-wrapper">
          <div
            className={`authentication-box ${isSignUpMode ? "signup-mode-active" : ""
              }`}
          >
            {/* Left Side - Image */}
            <div className="authentication-image-container">
              <img
                src={img}
                alt="Login Illustration"
                className="authentication-image"
              />
            </div>

            {/* Right Side - Forms */}
            <div className="authentication-form-container">
              {!isSignUpMode ? (
                <div className="login-form-section">
                  <h2 className="form-heading">Login</h2>
                  <form className="login-form" onSubmit={handleSubmit}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your Email"
                      className="input-field1"
                      onChange={handleChange}
                      required
                    />
                    <div className="password-container">
                      <input
                        type={showPassword ? "text" : "password"} // Toggle between text/password type
                        name="password"
                        placeholder="Enter your Password"
                        className="input-field"
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="show-hide-password-btn"
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye} // Switch between eye and eye-slash
                        />
                      </button>
                    </div>
                    {/* Login Button with Spinner */}
                    <button
                      type="submit"
                      className="primary-button-login"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Login"}
                    </button>

                    <div className="google-authentication">
                      <GoogleLogin
                        onSuccess={handleGoogleAuth}
                        onError={() => toast.error("Google Login Failed!")}
                      />
                    </div>

                    <p className="form-toggle-text">
                      New User?{" "}
                      <span className="toggle-link" onClick={toggleAuthForm}>
                        Create an Account
                      </span>
                    </p>
                  </form>
                </div>
              ) : (
                <div className="signup-form-section">
                  <h2 className="form-heading">Create Account</h2>
                  <form className="signup-form" onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your Name"
                      className="input-field1"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your Email"
                      className="input-field1"
                      onChange={handleChange}
                      required
                    />
                    <div className="password-container">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        className="input-field"
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="show-hide-password-btn"
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                        />
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="primary-button-login"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Create Account"}
                    </button>

                    <div className="google-authentication">
                      <GoogleLogin
                        onSuccess={handleGoogleAuth}
                        onError={() => toast.error("Google Login Failed!")}
                      />
                    </div>

                    <p className="form-toggle-text">
                      Already have an account?{" "}
                      <span className="toggle-link" onClick={toggleAuthForm}>
                        Back to Login
                      </span>
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
        <Chatbot />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
