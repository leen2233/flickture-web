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
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../utils/axios";
import { formatDistanceToNow } from "date-fns";
import MovieStatsModal from "../components/MovieStatsModal";

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
  type,
  icon: Icon,
  emptyMessage,
}) {
  if (!movies?.length) {
    return (
      <div className="movie-list-section">
        <div className="list-header">
          <h2>
            <Icon size={20} className="icon" />
            {title}
          </h2>
        </div>
        <EmptyState icon={Film} message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="movie-list-section">
      <div className="list-header">
        <h2>
          <Icon size={20} className="icon" />
          {title}
        </h2>
        {count > 5 && (
          <Link to={`/movies/${type}`} className="see-all">
            <span>See all {count}</span>
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div className="movies-grid">
        {movies.slice(0, 5).map((item) => (
          <MovieCard key={item.movie.tmdb_id} item={item} />
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
  const [showWatchedModal, setShowWatchedModal] = useState(false);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [isLoadingWatched, setIsLoadingWatched] = useState(false);

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

  const handleWatchedClick = async () => {
    setIsLoadingWatched(true);
    try {
      const response = await axiosClient.get("/movies/lists/recently_watched");
      setWatchedMovies(response.data);
      setShowWatchedModal(true);
    } catch (error) {
      console.error("Failed to fetch watched movies:", error);
    } finally {
      setIsLoadingWatched(false);
    }
  };

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
                onClick={handleWatchedClick}
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
            count={userData.stats.movies_watched}
            type="recently-watched"
            icon={Clock}
            emptyMessage="No movies watched yet. Start watching!"
          />
          <MovieList
            title="Want to Watch"
            movies={userData.watchlist}
            count={userData.watchlist?.length}
            type="want-to-watch"
            icon={BookMarked}
            emptyMessage="Your watchlist is empty. Start adding movies!"
          />
          <MovieList
            title="Favorites"
            movies={userData.favorites}
            count={userData.favorites?.length}
            type="favorites"
            icon={Heart}
            emptyMessage="No favorite movies yet. Mark some movies as favorites!"
          />
        </div>
      </div>

      {showWatchedModal && (
        <MovieStatsModal
          title="Movies Watched"
          type="recently-watched"
          onClose={() => setShowWatchedModal(false)}
        />
      )}
    </div>
  );
}

export default Profile;
