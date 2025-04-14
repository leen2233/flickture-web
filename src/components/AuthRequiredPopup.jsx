import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import "../styles/AuthRequiredPopup.css";

function AuthRequiredPopup({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    // We'll store the current URL in localStorage to redirect back after login
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/login");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-required-modal">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="logo-container">
          <img src="/logo.png" alt="Flickture Logo" className="logo" />
        </div>

        <h2>Login Required</h2>
        <p className="modal-subtitle">
          Please sign in to use this feature and keep track of your movies.
        </p>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" onClick={handleLogin}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthRequiredPopup;
