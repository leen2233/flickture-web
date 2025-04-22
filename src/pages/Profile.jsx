import { useState } from "react";
import {
  Edit2,
  Settings,
  Clock,
  BookMarked,
  Heart,
  ChevronRight,
  Film,
  Star,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../utils/axios";
import { formatDistanceToNow } from "date-fns";
import MovieStatsModal from "../components/MovieStatsModal";
import { useAuth } from "../contexts/AuthContext";

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
      key={movie.tmdb_id}
      className="movie-grid-item"
      onClick={() =>
        navigate(`/movie/${movie.tmdb_id}`, {
          state: { from: "profile" },
        })
      }
    >
      <div className="movie-poster">
        <img
          src={movie.poster_preview_url || "/default-movie.png"}
          alt={movie.title}
        />
        {movie.is_favorite && (
          <div className="movie-status favorite">
            <Heart size={20} fill="var(--primary-color)" />
          </div>
        )}
      </div>
      <div className="movie-info-compact profile-movie-info-compact">
        <h3>{movie.title}</h3>
        <div className="movie-meta">
          {movie.rating && (
            <span className="rating">
              <Star size={14} className="star-icon" />
              {movie.rating.toFixed(1)}
            </span>
          )}
          {movie.year && <span className="year">({movie.year})</span>}
        </div>
      </div>
    </div>
  );
  // return (
  //   <div
  //     className="movie-card"
  //     onClick={() =>
  //       navigate(`/movie/${movie.tmdb_id}`, {
  //         state: { from: "profile" },
  //       })
  //     }
  //   >
  //     <div className="movie-poster">
  //       <img src={movie.poster_url} alt={movie.title} />
  //       <div className="movie-info-overlay">
  //         <div className="movie-rating">★ {movie.rating.toFixed(1)}</div>
  //         <div className="movie-info-bottom">
  //           <h3 className="movie-title">{movie.title}</h3>
  //           <span className="movie-updated">
  //             {formatDistanceToNow(new Date(updated_at))} ago
  //           </span>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
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
      <div className="profile-movie-list-section">
        <div className="list-header">
          <Icon size={20} className="icon" />
          <h2>{title}</h2>
        </div>
        <EmptyState icon={Film} message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="profile-movie-list-section">
      <div className="list-header">
        <Icon size={20} className="icon" />
        <h2>{title}</h2>
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
  const { currentUser, updateUser, logout } = useAuth();
  const [showWatchedModal, setShowWatchedModal] = useState(false);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [isLoadingWatched, setIsLoadingWatched] = useState(false);

  const handleWatchedClick = async () => {
    setIsLoadingWatched(true);
    try {
      const response = await axiosClient.get("/watchlist/?status=watched");
      setWatchedMovies(response.data);
      setShowWatchedModal(true);
    } catch (error) {
      console.error("Failed to fetch watched movies:", error);
    } finally {
      setIsLoadingWatched(false);
    }
  };

  if (!currentUser) {
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
              src={currentUser.banner_image || "/default-banner.png"}
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
              <button
                className="settings-button"
                onClick={() => navigate("/settings")}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            </div>
            <div className="profile-avatar-wrapper">
              <img
                src={currentUser.avatar || "/default-avatar.png"}
                alt="Profile"
                className="profile-avatar"
              />
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-text">
              <h1>{currentUser.full_name || currentUser.username}</h1>
              <span className="username">@{currentUser.username}</span>
              {currentUser.about && (
                <p className="about-text">{currentUser.about}</p>
              )}
            </div>

            <div className="stats-row">
              <StatBox
                label="Movies Watched"
                value={currentUser.stats.movies_watched}
                onClick={handleWatchedClick}
              />
              <StatBox
                label="Following"
                value={currentUser.stats.following}
                onClick={() => {}}
              />
              <StatBox
                label="Followers"
                value={currentUser.stats.followers}
                onClick={() => {}}
              />
            </div>
          </div>
        </div>

        <div className="profile-content-lists">
          <MovieList
            title="Recently Watched"
            movies={currentUser.recently_watched}
            count={currentUser.stats.movies_watched}
            type="recently-watched"
            icon={Clock}
            emptyMessage="No movies watched yet. Start watching!"
          />
          <MovieList
            title="Want to Watch"
            movies={currentUser.watchlist}
            count={currentUser.watchlist?.length}
            type="want-to-watch"
            icon={BookMarked}
            emptyMessage="Your watchlist is empty. Start adding movies!"
          />
          <MovieList
            title="Favorites"
            movies={currentUser.favorites}
            count={currentUser.favorites?.length}
            type="favorites"
            icon={Heart}
            emptyMessage="No favorite movies yet. Mark some movies as favorites!"
          />
        </div>
      </div>

      {showWatchedModal && (
        <MovieStatsModal
          title="Movies Watched"
          type="watched"
          onClose={() => setShowWatchedModal(false)}
        />
      )}
    </div>
  );
}

export default Profile;
