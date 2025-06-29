import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";
import { RefreshCwIcon } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
      setCaptchaInput(""); // Clear previous input
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.captcha_input;
        delete newErrors.captcha_key;
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

    if (!login) {
      newErrors.login = "Username or Email is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post("/auth/login/", {
        login: login, // Django expects username
        password: password,
        captcha_input: captchaInput,
        captcha_key: captchaKey,
      });

      const { token } = response.data;

      // Store token and auth status
      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      await checkAuth();

      navigate("/");
    } catch (error) {
      const errorData = error.response?.data || {};
      const newErrors = {};

      // Handle CAPTCHA-specific errors
      if (errorData.captcha_input) {
        newErrors.captcha_input = Array.isArray(errorData.captcha_input)
          ? errorData.captcha_input[0]
          : errorData.captcha_input;
      }

      if (errorData.captcha_key) {
        newErrors.captcha_key = Array.isArray(errorData.captcha_key)
          ? errorData.captcha_key[0]
          : errorData.captcha_key;
      }

      // Handle general login errors
      if (errorData.non_field_errors) {
        newErrors.general = errorData.non_field_errors[0];
      } else if (!newErrors.captcha_input && !newErrors.captcha_key) {
        newErrors.general =
          errorData.error || "Login failed. Please try again.";
      }

      setErrors(newErrors);

      // If CAPTCHA is wrong or there's an error, reload CAPTCHA
      if (newErrors.captcha_input || newErrors.captcha_key) {
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
        <div className="logo-container">
          <img src="/logo.png" alt="Flickture Logo" className="logo" />
        </div>

        <div className="form-group">
          <input
            type="text"
            value={login}
            onChange={(e) => {
              setLogin(e.target.value);
              if (errors.login) {
                setErrors((prev) => ({ ...prev, login: "" }));
              }
            }}
            placeholder="Email"
            className={errors.login ? "error" : ""}
          />
          {errors.login && (
            <span className="error-message">{errors.login}</span>
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
            <span className="error-message">{errors.password}</span>
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
                  if (errors.captcha_input) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.captcha_input;
                      return newErrors;
                    });
                  }
                }}
                placeholder="Enter CAPTCHA"
                className={errors.captcha_input ? "error" : ""}
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
            <span className="error-message">{errors.captcha_input}</span>
          )}
          {errors.captcha_key && (
            <span className="error-message">{errors.captcha_key}</span>
          )}
        </div>

        {errors.general && (
          <div
            className="error-message general"
            style={{ textAlign: "center" }}
          >
            {errors.general}
          </div>
        )}

        <button
          className="primary-button"
          onClick={handleLogin}
          disabled={isLoading || captchaLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        <div className="signup-prompt">
          <span>New to Flickture? </span>
          <a href="/register" className="signup-link">
            Join now
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
