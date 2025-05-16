import { useState, useEffect } from "react";
import {
  Heart,
  ChevronRight,
  Film,
  Star,
  Clock,
  BookMarked,
  Users,
  Lock,
} from "lucide-react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axiosClient from "../utils/axios";
import MovieStatsModal from "../components/MovieStatsModal";
import FollowersList from "../components/FollowersList";
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

function PrivateProfileMessage() {
  return (
    <div className="private-profile">
      <div className="private-profile-content">
        <Lock size={64} className="private-profile-icon" />
        <h2>This Profile is Private</h2>
        <p>
          You need to follow this user and be approved to view their profile
          content.
        </p>
      </div>
    </div>
  );
}

function MovieCard({ item }) {
  const { movie } = item;
  const navigate = useNavigate();

  return (
    <div
      key={movie.tmdb_id}
      className="movie-grid-item"
      onClick={() =>
        navigate(`/${movie.type}/${movie.tmdb_id}`, {
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
          <div className="list-header-title">
            <Icon size={20} className="icon" />
            <h2>{title}</h2>
          </div>
        </div>
        <EmptyState icon={Film} message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="profile-movie-list-section">
      <div className="list-header">
        <div className="list-header-title">
          <Icon size={20} className="icon" />
          <h2>{title}</h2>
        </div>
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

function PublicProfile() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showWatchedModal, setShowWatchedModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosClient.get(`/auth/user/${username}/`);
        setUser(response.data);
        setIsFollowing(response.data.is_following);
        setFollowerCount(response.data.follower_count);
      } catch (error) {
        if (error.response?.data?.detail === "This profile is private") {
          setIsPrivate(true);
        } else {
          setError(
            error.response?.data?.message || "Failed to load user profile"
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleFollow = async () => {
    try {
      const response = await axiosClient.post(`/auth/user/${username}/follow/`);
      if (response.data.status === "followed") {
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
      } else if (response.data.status === "unfollowed") {
        setIsFollowing(false);
        setFollowerCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Failed to update follow status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
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

  if (!user && !isPrivate) {
    return (
      <div className="profile-container">
        <div className="error-message general">User not found</div>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-cover">
              <img
                src="/default-banner.png"
                alt="Profile Banner"
                className="banner-image"
              />
              <div className="profile-avatar-wrapper">
                <img
                  src="/default-avatar.png"
                  alt="Profile"
                  className="profile-avatar"
                />
              </div>
            </div>

            <div className="profile-info">
              <div className="profile-text">
                <h1>{username}</h1>
                <span className="username">@{username}</span>
              </div>
            </div>
          </div>
          <PrivateProfileMessage />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-cover">
            <img
              src={user.banner_image || "/default-banner.png"}
              alt="Profile Banner"
              className="banner-image"
            />
            {currentUser && currentUser.username !== username && (
              <div className="profile-cover-actions">
                <button
                  className={`follow-button ${isFollowing ? "following" : ""}`}
                  onClick={handleFollow}
                >
                  <Users size={16} />
                  <span>{isFollowing ? "Following" : "Follow"}</span>
                </button>
              </div>
            )}
            <div className="profile-avatar-wrapper">
              <img
                src={user.avatar || "/default-avatar.png"}
                alt="Profile"
                className="profile-avatar"
              />
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-text">
              <h1>{user.full_name || user.username}</h1>
              <span className="username">@{user.username}</span>
              {user.about && <p className="about-text">{user.about}</p>}
            </div>

            <div className="stats-row">
              <StatBox
                label="Movies Watched"
                value={user.movies_watched}
                onClick={() => setShowWatchedModal(true)}
              />
              <StatBox
                label="Following"
                value={user.following_count}
                onClick={() => setShowFollowingModal(true)}
              />
              <StatBox
                label="Followers"
                value={followerCount}
                onClick={() => setShowFollowersModal(true)}
              />
            </div>
          </div>
        </div>

        <div className="profile-content-lists">
          <MovieList
            title="Recently Watched"
            movies={user.recently_watched}
            count={user.movies_watched}
            type="recently-watched"
            icon={Clock}
            emptyMessage="No movies watched yet"
          />
          <MovieList
            title="Want to Watch"
            movies={user.watchlist}
            count={user.watchlist?.length}
            type="want-to-watch"
            icon={BookMarked}
            emptyMessage="Watchlist is empty"
          />
          <MovieList
            title="Favorites"
            movies={user.favorites}
            count={user.favorites?.length}
            type="favorites"
            icon={Heart}
            emptyMessage="No favorite movies yet"
          />
        </div>
      </div>

      {showWatchedModal && (
        <MovieStatsModal
          title="Movies Watched"
          type="watched"
          username={username}
          onClose={() => setShowWatchedModal(false)}
        />
      )}

      {showFollowersModal && (
        <FollowersList
          title="Followers"
          username={username}
          type="followers"
          onClose={() => setShowFollowersModal(false)}
        />
      )}

      {showFollowingModal && (
        <FollowersList
          title="Following"
          username={username}
          type="following"
          onClose={() => setShowFollowingModal(false)}
        />
      )}
    </div>
  );
}

export default PublicProfile;
