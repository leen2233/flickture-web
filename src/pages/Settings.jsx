import { useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff, Loader, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Settings.css";

function SettingItem({ title, description, children }) {
  return (
    <div className="setting-item">
      <div className="setting-info">
        <h3>{title}</h3>
        <p className="setting-description">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    is_public: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosClient.get("/auth/settings/");
        setSettings(response.data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handlePrivacyToggle = async () => {
    setIsSaving(true);
    try {
      const response = await axiosClient.patch("/auth/settings/", {
        is_public: !settings.is_public,
      });
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="content-container">
        <div className="loading-state">
          <Loader className="spin" size={32} />
          <span>Loading your settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="settings-header">
        <button onClick={() => navigate("/profile")} className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Profile</span>
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <h2>Privacy Settings</h2>
          <SettingItem
            title="Profile Visibility"
            description={
              settings.is_public
                ? "Your profile is visible to everyone"
                : "Your profile is only visible to your followers"
            }
          >
            <button
              className={`toggle-button ${
                settings.is_public ? "public" : "private"
              }`}
              onClick={handlePrivacyToggle}
              disabled={isSaving}
              aria-label="Toggle profile visibility"
            >
              {isSaving ? (
                <Loader size={20} className="spin" />
              ) : settings.is_public ? (
                <>
                  <Eye size={20} />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <EyeOff size={20} />
                  <span>Private</span>
                </>
              )}
            </button>
          </SettingItem>
        </section>

        <section className="settings-section">
          <h2>Account</h2>
          <SettingItem
            title="Logout"
            description="Sign out of your account on this device"
          >
            <button
              className="danger-button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              aria-label="Logout"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </SettingItem>
        </section>
      </div>
    </div>
  );
}

export default Settings;
