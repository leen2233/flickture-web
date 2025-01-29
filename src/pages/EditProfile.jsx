import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axiosClient from "../utils/axios";

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    about: "",
    avatar: null,
    banner_image: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({
    avatar: null,
    banner_image: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosClient.get("/auth/me");
        const userData = response.data;
        setFormData({
          full_name: userData.full_name || "",
          username: userData.username || "",
          about: userData.about || "",
          avatar: null,
          banner_image: null,
        });
        setPreview({
          avatar: userData.avatar || null,
          banner_image: userData.banner_image || null,
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      setPreview((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(files[0]),
      }));
    }
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
      navigate("/profile");
    } catch (error) {
      const errorData = error.response?.data || {};
      setErrors(errorData);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="content-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="edit-profile-header">
        <button onClick={() => navigate("/profile")} className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Profile</span>
        </button>
      </div>

      <div className="edit-profile-content">
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="image-upload-section">
            <div className="banner-upload">
              <div
                className="banner-preview"
                style={{
                  backgroundImage: preview.banner_image
                    ? `url(${preview.banner_image})`
                    : "none",
                  border: preview.banner_image
                    ? "none"
                    : "1px dashed var(--border-color)",
                }}
              >
                <input
                  type="file"
                  name="banner_image"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <div className="upload-overlay">
                  <span>
                    {preview.banner_image ? "Change Banner" : "Upload Banner"}
                  </span>
                </div>
              </div>
            </div>

            <div className="avatar-upload">
              <div
                className="avatar-preview"
                style={{
                  backgroundImage: preview.avatar
                    ? `url(${preview.avatar})`
                    : "none",
                  border: preview.avatar
                    ? "none"
                    : "1px dashed var(--border-color)",
                }}
              >
                <input
                  type="file"
                  name="avatar"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <div className="upload-overlay">
                  <span>{preview.avatar ? "Change" : "Upload"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-fields">
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
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Your username"
                className={errors.username ? "error" : ""}
              />
              {errors.username && (
                <span className="error-message">{errors.username}</span>
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

            <div className="button-group">
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
