import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  Clock,
  Check,
  Plus,
  ArrowLeft,
  Film,
  User,
  Loader,
  Share2,
  Trash2,
  Edit2,
  Copy,
} from "lucide-react";
import axiosClient from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";

function MovieItem({ movie }) {
  const [status, setStatus] = useState("none");
  const [isInFavorites, setIsInFavorites] = useState(false);

  useEffect(() => {
    const fetchMovieStatus = async () => {
      try {
        const response = await axiosClient.get(
          `/movies/${movie.tmdb_id}/${movie.type}`
        );
        setStatus(response.data.watchlist_status || "none");
        setIsInFavorites(response.data.is_favorite);
      } catch (error) {
        console.error("Error fetching movie status:", error);
      }
    };

    fetchMovieStatus();
  }, [movie.tmdb_id]);

  const handleWatchlistAction = async (newStatus) => {
    try {
      await axiosClient.post(`/watchlist/${movie.tmdb_id}/`, {
        status: newStatus,
        tmdb_id: movie.tmdb_id,
      });
      setStatus(newStatus);
    } catch (error) {
      console.error("Error updating watchlist:", error);
    }
  };

  return (
    <Link to={`/${movie.type}/${movie.tmdb_id}`} className="movie-grid-item">
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
      <div className="movie-info-compact">
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
      {/* <div className="movie-card-poster">
          <img src={movie.poster_preview_url} alt={movie.title} />
          <div className="movie-card-overlay">
            <div className="movie-card-stats">
              {movie.rating && (
                <div className="movie-stat">
                  <Star size={14} />
                  <span>{movie.rating}</span>
                </div>
              )}
              {isInFavorites && (
                <div className="movie-stat favorite">
                  <Heart size={14} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="movie-card-content">
          <h3 className="movie-card-title">{movie.title}</h3>
          <div className="movie-card-meta">
            <span className="movie-year">{movie.year}</span>
          </div>
        </div> */}
    </Link>
  );
}

function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [list, setList] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await axiosClient.get(`/lists/${id}`);
        setList(response.data);
        setIsLiked(response.data.is_liked);
      } catch (error) {
        console.error("Error fetching list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [id]);

  const handleLike = async () => {
    try {
      const response = await axiosClient.post(`/lists/${id}/like/`);
      setIsLiked(response.data.liked);
      setList((prev) => ({
        ...prev,
        likes_count: prev.likes_count + (response.data.liked ? 1 : -1),
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this list?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await axiosClient.delete(`/lists/${id}/`);
      navigate("/lists", { replace: true });
    } catch (error) {
      console.error("Error deleting list:", error);
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/lists/${id}/edit`, {
      state: {
        list: {
          ...list,
          movies: list.movies.map((movie) => ({
            ...movie,
            id: movie.tmdb_id,
          })),
        },
      },
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: list.name,
        text: `Check out ${list.name} on Flickture!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  if (isLoading) {
    return (
      <div className="lists-loading">
        <Loader className="spin" size={24} />
        <span>Loading list...</span>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="lists-section-empty">
        <Film size={24} />
        <p>List not found</p>
      </div>
    );
  }

  const isCreator = currentUser && list.creator_id === currentUser.id;

  return (
    <div className="list-detail-page">
      <div className="list-detail-header">
        <div className="list-backdrop">
          {list.backdrop && <img src={list.backdrop} alt="" />}
          <div className="backdrop-overlay" />
          <div className="movie-nav">
            <Link to="/lists" className="nav-button">
              <ArrowLeft size={20} />
              <span>Back to Lists</span>
            </Link>
            <div className="nav-actions">
              {isCreator && (
                <>
                  <button className="nav-button primary" onClick={handleEdit}>
                    <Edit2 size={20} />
                    <span>Edit List</span>
                  </button>
                  <button
                    className="nav-button danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader size={20} className="spin" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                    <span>Delete List</span>
                  </button>
                </>
              )}
              <button className="nav-button" onClick={handleShare}>
                {copied ? <Copy size={20} /> : <Share2 size={20} />}
                <span>{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="list-header-content">
          <div className="list-header-main">
            <div className="list-header-info">
              <div className="list-poster">
                <img src={list.thumbnail} alt={list.name} />
              </div>
              <div className="list-title-section">
                <h1>{list.name}</h1>
                <div className="list-meta">
                  <div className="list-stat">
                    <Film size={16} />
                    <span>{list.movies_count} movies</span>
                  </div>
                  <div className="list-stat">
                    <User size={16} />
                    <span>{list.creator}</span>
                  </div>
                  <div className="list-stat like">
                    <button
                      className={`list-like-button ${isLiked ? "liked" : ""}`}
                      onClick={handleLike}
                    >
                      <Heart
                        size={16}
                        fill={isLiked ? "currentColor" : "none"}
                      />
                      <span>{list.likes_count}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="list-description">{list.description}</p>
          </div>
        </div>
      </div>

      <div className="list-detail-content">
        <div className="list-movies">
          <h2>Movies in this list</h2>
          <div className="movies-grid">
            {list.movies.map((movie) => (
              <MovieItem key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListDetail;
