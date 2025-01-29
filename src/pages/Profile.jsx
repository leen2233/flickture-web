import { useState, useEffect } from "react";
import { Edit2, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axios";

function StatBox({ label, value, onClick }) {
  return (
    <button className="stat-box" onClick={onClick}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </button>
  );
}

function MovieList({ title, movies = [], count = 0, onSeeAll }) {
  if (!movies.length) return null;

  return (
    <div className="movie-list">
      <div className="movie-list-header">
        <h2>{title}</h2>
        <button onClick={onSeeAll} className="see-all-btn">
          <span>See all {count}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      <div className="movies-scroll">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <div className="movie-poster">
              <img src={movie.poster_url} alt={movie.title} />
            </div>
            <span className="movie-title">{movie.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get("/auth/me");
        setUserData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message general">{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="error-message general">No profile data available</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-cover">
            <img
              src={userData.banner_image || "/default-banner.jpg"}
              alt="Profile Banner"
              className="banner-image"
            />
            <div className="profile-avatar-wrapper">
              <img
                src={userData.avatar || "/default-avatar.jpg"}
                alt="Profile"
                className="profile-avatar"
              />
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-text">
              <h1>{userData.full_name || userData.username}</h1>
              <span className="username">@{userData.username}</span>
              {userData.about && <p className="about-text">{userData.about}</p>}
            </div>
            <div className="profile-actions">
              <button
                className="edit-profile"
                onClick={() => navigate("/edit-profile")}
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
              <button className="icon-only">
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="stats-row">
            <StatBox
              label="Movies Watched"
              value={userData.stats.movies_watched}
              onClick={() => {}}
            />
            <StatBox
              label="Following"
              value={userData.stats.following}
              onClick={() => {}}
            />
            <StatBox
              label="Followers"
              value={userData.stats.followers}
              onClick={() => {}}
            />
          </div>
        </div>

        <div className="profile-content-lists">
          <MovieList
            title="Recently Watched"
            movies={userData.recently_watched}
            count={userData.recently_watched?.length}
            onSeeAll={() => {}}
          />
          <MovieList
            title="Want to Watch"
            movies={userData.watchlist}
            count={userData.watchlist?.length}
            onSeeAll={() => {}}
          />
          <MovieList
            title="Favorites"
            movies={userData.favorites}
            count={userData.favorites?.length}
            onSeeAll={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

export default Profile;
