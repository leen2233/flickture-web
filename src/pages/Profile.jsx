import { useState, useEffect } from "react";
import {
  Edit2,
  Settings,
  Clock,
  BookMarked,
  Heart,
  ChevronRight,
  Film,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axios";
import { formatDistanceToNow } from "date-fns";

function StatBox({ label, value, onClick }) {
  return (
    <button className="stat-box" onClick={onClick}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </button>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="empty-state">
      <Icon size={24} />
      <p>{message}</p>
    </div>
  );
}

function MovieCard({ item }) {
  const { movie, updated_at } = item;
  const navigate = useNavigate();

  return (
    <div
      className="movie-card"
      onClick={() =>
        navigate(`/movie/${movie.tmdb_id}`, {
          state: { from: "profile" },
        })
      }
    >
      <div className="movie-poster">
        <img src={movie.poster_url} alt={movie.title} />
        <div className="movie-info-overlay">
          <div className="movie-rating">★ {movie.rating.toFixed(1)}</div>
          <div className="movie-year">{movie.year}</div>
        </div>
      </div>
      <div className="movie-details">
        <h3 className="movie-title">{movie.title}</h3>
        <span className="movie-updated">
          {formatDistanceToNow(new Date(updated_at))} ago
        </span>
      </div>
    </div>
  );
}

function MovieList({
  title,
  movies = [],
  count = 0,
  onSeeAll,
  icon: Icon,
  emptyMessage,
}) {
  const navigate = useNavigate();

  const handleSeeAll = () => {
    navigate("/movies", {
      state: {
        title,
        type: title.toLowerCase().replace(/\s+/g, "_"),
        movies,
      },
    });
  };

  return (
    <div className="movie-list">
      <div className="movie-list-header">
        <div className="list-title">
          <Icon size={20} />
          <h2>{title}</h2>
        </div>
        {movies.length > 0 && (
          <button onClick={handleSeeAll} className="see-all-btn">
            <span>See all {count}</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {movies.length > 0 ? (
        <div className="movies-scroll">
          {movies.map((item) => (
            <MovieCard key={item.movie.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Film} message={emptyMessage} />
      )}
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
            <div className="profile-cover-actions">
              <button
                className="edit-profile"
                onClick={() => navigate("/edit-profile")}
              >
                <Edit2 size={16} />
                <span>Edit Profile</span>
              </button>
            </div>
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
        </div>

        <div className="profile-content-lists">
          <MovieList
            title="Recently Watched"
            movies={userData.recently_watched}
            count={userData.recently_watched?.length}
            onSeeAll={() => {}}
            icon={Clock}
            emptyMessage="No movies watched yet. Start watching!"
          />
          <MovieList
            title="Want to Watch"
            movies={userData.watchlist}
            count={userData.watchlist?.length}
            onSeeAll={() => {}}
            icon={BookMarked}
            emptyMessage="Your watchlist is empty. Start adding movies!"
          />
          <MovieList
            title="Favorites"
            movies={userData.favorites}
            count={userData.favorites?.length}
            onSeeAll={() => {}}
            icon={Heart}
            emptyMessage="No favorite movies yet. Mark some movies as favorites!"
          />
        </div>
      </div>
    </div>
  );
}

export default Profile;
