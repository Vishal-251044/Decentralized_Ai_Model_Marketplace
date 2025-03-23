import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <Link to="/">
          <span className="logo-part Ai">Ai</span>
          <span className="logo-part Models">Models</span>
        </Link>
      </div>

      <div className="footer-text">
        <p>
          Our decentralized AI model marketplace leverages blockchain technology
          to provide a secure platform for AI/ML model creators and buyers. With
          smart contracts for automated royalty payments and federated learning
          for privacy, it ensures transparency, fair compensation, and quality
          assurance. The marketplace fosters innovation and trust within the AI
          community.
        </p>
      </div>

      <div className="footer-copyright">
        <p>&copy; 2024 AiModels. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
