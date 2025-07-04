import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";
import { RefreshCwIcon } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [username, setUsername] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const { checkAuth } = useAuth();

  // Load CAPTCHA when component mounts
  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const response = await axiosClient.get("/auth/captcha");
      const { captcha_key, captcha_image } = response.data;
      setCaptchaKey(captcha_key);
      setCaptchaImage(captcha_image);
      setCaptchaInput("");
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.captcha_input;
        delete newErrors.captcha_key;
        delete newErrors.error;
        return newErrors;
      });
    } catch (error) {
      console.error("Failed to load CAPTCHA:", error);
      setErrors((prev) => ({ ...prev, error: "Failed to load CAPTCHA" }));
    } finally {
      setCaptchaLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!username) {
      newErrors.username = "Username is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!captchaInput) {
      newErrors.captcha_input = "Please enter the CAPTCHA";
    }

    if (!captchaKey) {
      newErrors.captcha_key = "CAPTCHA key is missing";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post("/auth/register/", {
        username,
        email,
        password,
        full_name: username,
        captcha_input: captchaInput,
        captcha_key: captchaKey,
      });

      const { token } = response.data;

      // Store token and auth status
      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      await checkAuth();

      // Redirect to edit profile instead of home
      navigate("/edit-profile");
    } catch (error) {
      const errorData = error.response?.data || {};
      const newErrors = {};

      // Handle field-specific errors
      Object.keys(errorData).forEach((key) => {
        if (Array.isArray(errorData[key])) {
          newErrors[key] = errorData[key][0];
        } else {
          newErrors[key] = errorData[key];
        }
      });

      setErrors(newErrors);

      // If CAPTCHA is wrong or there's an error, reload CAPTCHA
      if (newErrors.error || newErrors.captcha_input || newErrors.captcha_key) {
        loadCaptcha();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="return-link">
          <a href="/" className="back-to-site">
            ← Return to site
          </a>
        </div>
        <div className="header-container">
          <h1 className="title">Create Account</h1>
          <p className="subtitle">Sign up to get started</p>
        </div>

        <div className="form-group">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) {
                setErrors((prev) => ({ ...prev, username: "" }));
              }
            }}
            placeholder="Username"
            className={errors.username ? "error" : ""}
          />
          {errors.username && (
            <span className="register-error-message">{errors.username}</span>
          )}
        </div>

        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            placeholder="Email"
            className={errors.email ? "error" : ""}
          />
          {errors.email && (
            <span className="register-error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              placeholder="Password"
              className={errors.password ? "error" : ""}
            />
            <button
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <span className="register-error-message">{errors.password}</span>
          )}
        </div>

        <div className="form-group">
          <div className="password-input">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }
              }}
              placeholder="Confirm Password"
              className={errors.confirmPassword ? "error" : ""}
            />
            <button
              className="show-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="register-error-message">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <div className="form-group">
          <div className="captcha-container">
            <div className="captcha-image-container">
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  if (errors.captcha_input || errors.error) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.captcha_input;
                      delete newErrors.error;
                      return newErrors;
                    });
                  }
                }}
                placeholder="Enter CAPTCHA"
                className={errors.captcha_input || errors.error ? "error" : ""}
              />
              {captchaLoading ? (
                <div className="captcha-loading">Loading CAPTCHA...</div>
              ) : captchaImage ? (
                <img
                  src={captchaImage}
                  alt="CAPTCHA"
                  className="captcha-image"
                />
              ) : (
                <div className="captcha-error">Failed to load CAPTCHA</div>
              )}
              <button
                type="button"
                className="captcha-refresh"
                onClick={loadCaptcha}
                disabled={captchaLoading}
                title="Refresh CAPTCHA"
              >
                <RefreshCwIcon />
              </button>
            </div>
          </div>
          {errors.captcha_input && (
            <span className="register-error-message">
              {errors.captcha_input}
            </span>
          )}
          {errors.captcha_key && (
            <span className="register-error-message">{errors.captcha_key}</span>
          )}
          {errors.error && (
            <span className="register-error-message">{errors.error}</span>
          )}
        </div>

        <button
          className="primary-button"
          onClick={handleRegister}
          disabled={isLoading || captchaLoading}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>

        <div className="signup-prompt">
          <span>Already have an account? </span>
          <a href="/login" className="signup-link">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;
