import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axios";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post("/auth/login", {
        username: email, // Django expects username
        password: password,
      });

      const { token } = response.data;

      // Store token and auth status
      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");

      navigate("/home");
    } catch (error) {
      const errorMessage =
        error.response?.data?.non_field_errors?.[0] ||
        "Failed to login. Please try again.";
      setErrors({ ...errors, general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    console.log("Google login pressed");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img src="/logo.png" alt="Flickture Logo" className="logo" />
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
            <span className="error-message">{errors.email}</span>
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

        {errors.general && (
          <div className="error-message" style={{ textAlign: "center" }}>
            {errors.general}
          </div>
        )}

        <button
          className="primary-button"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        <button className="google-button" onClick={handleGoogleLogin}>
          <img
            src="/google-icon.png"
            alt="Google Icon"
            className="google-icon"
          />
          Continue with Google
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
