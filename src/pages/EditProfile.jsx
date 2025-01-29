import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axios";

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    about: "",
    avatar: null,
    banner_image: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      await axiosClient.patch("/auth/me", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/home");
    } catch (error) {
      const errorData = error.response?.data || {};
      setErrors(errorData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="header-container">
          <h1 className="title">Complete Your Profile</h1>
          <p className="subtitle">Tell us more about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Your full name"
              className={errors.full_name ? "error" : ""}
            />
            {errors.full_name && (
              <span className="error-message">{errors.full_name}</span>
            )}
          </div>

          <div className="form-group">
            <label>About</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              className={errors.about ? "error" : ""}
            />
            {errors.about && (
              <span className="error-message">{errors.about}</span>
            )}
          </div>

          <div className="form-group">
            <label>Profile Picture</label>
            <input
              type="file"
              name="avatar"
              onChange={handleFileChange}
              accept="image/*"
              className={errors.avatar ? "error" : ""}
            />
            {errors.avatar && (
              <span className="error-message">{errors.avatar}</span>
            )}
          </div>

          <div className="form-group">
            <label>Banner Image</label>
            <input
              type="file"
              name="banner_image"
              onChange={handleFileChange}
              accept="image/*"
              className={errors.banner_image ? "error" : ""}
            />
            {errors.banner_image && (
              <span className="error-message">{errors.banner_image}</span>
            )}
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={handleSkip}
            >
              Skip for Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
