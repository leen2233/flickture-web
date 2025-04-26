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
    </Link>
  );
}

function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [collection, setCollection] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await axiosClient.get(`/collections/${id}`);
        setCollection(response.data);
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [id]);
  if (isLoading) {
    return (
      <div className="lists-loading">
        <Loader className="spin" size={24} />
        <span>Loading collection...</span>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="lists-section-empty">
        <Film size={24} />
        <p>Collection not found</p>
      </div>
    );
  }

  return (
    <div className="list-detail-page">
      <div className="list-detail-header">
        <div className="list-backdrop">
          {collection.backdrop_url && (
            <img src={collection.backdrop_url} alt="" />
          )}
          <div className="backdrop-overlay" />
          <div className="movie-nav">
            <Link to="/search" className="nav-button">
              <ArrowLeft size={20} />
              <span>Back</span>
            </Link>
            <div className="nav-actions">
              <button
                className="nav-button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: collection.name,
                      text: `Check out ${collection.name} on Flickture!`,
                      url: window.location.href,
                    });
                  }
                }}
              >
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        <div className="list-header-content">
          <div className="list-header-main">
            <div className="list-header-info">
              <div className="list-poster">
                <img src={collection.poster_url} alt={collection.name} />
              </div>
              <div className="list-title-section">
                <h1>{collection.name}</h1>
                <div className="list-meta">
                  <div className="list-stat">
                    <Film size={16} />
                    <span>{collection.movies_count} movies</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="list-description">{collection.description}</p>
          </div>
        </div>
      </div>

      <div className="list-detail-content">
        <div className="list-movies">
          <h2>Movies in this collection</h2>
          <div className="movies-grid">
            {collection.movies.map((movie) => (
              <MovieItem key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectionDetail;
