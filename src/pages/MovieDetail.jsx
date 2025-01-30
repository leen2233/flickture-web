import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  Calendar,
  Plus,
  Check,
  BookmarkPlus,
  BookmarkCheck,
  Share2,
  Heart,
  ListPlus,
  Trash2,
  ChevronRight,
  MessageCircle,
  Loader2,
} from "lucide-react";
import axiosClient from "../utils/axios";

function MovieDetail() {
  const { tmdbId } = useParams();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axiosClient.get(`/movies/${tmdbId}/detail`);
        setMovie(response.data);
        setWatchlistStatus(response.data.watchlist_status);
      } catch (err) {
        setError("Failed to load movie details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [tmdbId]);

  const handleWatchlistToggle = async () => {
    try {
      setIsLoadingWatchlist(true);

      if (!watchlistStatus) {
        await axiosClient.post("/movies/watchlist/", {
          tmdb_id: tmdbId,
          status: "watchlist",
        });
        setWatchlistStatus("watchlist");
      } else {
        await axiosClient.delete(`/movies/watchlist/${tmdbId}/`);
        setWatchlistStatus(null);
      }
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const handleWatchedToggle = async () => {
    try {
      setIsLoadingWatchlist(true);

      if (watchlistStatus !== "watched") {
        await axiosClient.post("/movies/watchlist/", {
          tmdb_id: tmdbId,
          status: "watched",
        });
        setWatchlistStatus("watched");
      } else {
        await axiosClient.delete(`/movies/watchlist/${tmdbId}/`);
        setWatchlistStatus(null);
      }
    } catch (error) {
      console.error("Failed to update watched status:", error);
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const handleFavoriteToggle = () => {
    setIsInFavorites(!isInFavorites);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Check out ${movie.title} on Flickture!`,
        url: window.location.href,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="content-container">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        <div className="error-message general">{error}</div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="movie-detail-container">
      {/* Backdrop Image */}
      <div
        className="movie-backdrop"
        style={{ backgroundImage: `url(${movie.backdrop_url})` }}
      >
        <div className="backdrop-overlay"></div>
        <div className="movie-nav">
          <Link
            to={`/search${location.state?.search || ""}`}
            className="nav-button"
          >
            <ArrowLeft size={20} />
            <span>Back to Search</span>
          </Link>
          <button className="nav-button" onClick={handleShare}>
            <Share2 size={20} />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="content-container">
        <div className="movie-detail-content">
          {/* Poster and Title */}
          <div className="movie-detail-main">
            <div className="movie-poster-large">
              <img
                src={movie.poster_url || "/default-movie.jpg"}
                alt={movie.title}
              />
            </div>

            <div className="movie-info-detailed">
              <h1>{movie.title}</h1>
              {movie.original_title && movie.original_title !== movie.title && (
                <p className="original-title">{movie.original_title}</p>
              )}
              {movie.plot && <p className="overview">{movie.plot}</p>}
              {movie.genres && (
                <div className="genres">
                  {movie.genres.map((genre) => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
              {/* Add Directors Section */}
              {movie.directors && movie.directors.length > 0 && (
                <div className="directors-section">
                  <h3>Directed by</h3>
                  <div className="directors-list">
                    {movie.directors.map((director) => (
                      <Link
                        key={director.id}
                        to={`/person/${director.id}`}
                        className="director-item"
                      >
                        <div className="director-image-container">
                          <img
                            src={director.profile_path || "/default-avatar.jpg"}
                            alt={director.name}
                            className="director-image"
                          />
                        </div>
                        <p className="director-name">{director.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Section */}
          <div className="metadata-section">
            <div className="metadata-item">
              <Calendar size={20} className="metadata-icon" />
              <span className="metadata-label">Year</span>
              <span className="metadata-value">{movie.year}</span>
            </div>
            {movie.runtime && (
              <div className="metadata-item">
                <Clock size={20} className="metadata-icon" />
                <span className="metadata-label">Duration</span>
                <span className="metadata-value">{movie.runtime} min</span>
              </div>
            )}
            <div className="metadata-item">
              <Star size={20} className="metadata-icon" />
              <span className="metadata-label">Rating</span>
              <span className="metadata-value">{movie.rating?.toFixed(1)}</span>
            </div>
            <div className="metadata-item">
              <Users size={20} className="metadata-icon" />
              <span className="metadata-label">Votes</span>
              <span className="metadata-value">
                {movie.vote_count?.toLocaleString()}
              </span>
            </div>
            <div className="metadata-item">
              <MessageCircle size={20} className="metadata-icon" />
              <span className="metadata-label">Comments</span>
              <span className="metadata-value">
                {Math.floor(Math.random() * 100)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <div className="action-row">
              {watchlistStatus !== "watched" ? (
                watchlistStatus !== "watchlist" ? (
                  <button
                    className="action-button"
                    onClick={handleWatchlistToggle}
                    disabled={isLoadingWatchlist}
                  >
                    {isLoadingWatchlist ? (
                      <Loader2 size={20} className="spin" />
                    ) : (
                      <BookmarkPlus size={20} />
                    )}
                    <span>Add to Watchlist</span>
                  </button>
                ) : (
                  <button
                    className="action-button active"
                    onClick={handleWatchedToggle}
                    disabled={isLoadingWatchlist}
                  >
                    {isLoadingWatchlist ? (
                      <Loader2 size={20} className="spin" />
                    ) : (
                      <Plus size={20} />
                    )}
                    <span>Mark as Watched</span>
                  </button>
                )
              ) : (
                <button
                  className="action-button active"
                  onClick={handleWatchedToggle}
                  disabled={isLoadingWatchlist}
                >
                  {isLoadingWatchlist ? (
                    <Loader2 size={20} className="spin" />
                  ) : (
                    <Check size={20} />
                  )}
                  <span>Watched</span>
                </button>
              )}
            </div>

            <div className="action-row">
              <button
                className={`action-button ${isInFavorites ? "active" : ""}`}
                onClick={handleFavoriteToggle}
              >
                <Heart size={20} fill={isInFavorites ? "white" : "none"} />
                <span>
                  {isInFavorites ? "In Favorites" : "Add to Favorites"}
                </span>
              </button>
              <button className="action-button">
                <ListPlus size={20} />
                <span>Add to List</span>
              </button>
            </div>

            {watchlistStatus === "watchlist" && (
              <button
                className="action-button danger"
                onClick={handleWatchlistToggle}
                disabled={isLoadingWatchlist}
              >
                {isLoadingWatchlist ? (
                  <Loader2 size={20} className="spin" />
                ) : (
                  <Trash2 size={20} />
                )}
                <span>Remove from Watchlist</span>
              </button>
            )}
          </div>

          {/* Cast Section */}
          {movie.cast_preview && movie.cast_preview.length > 0 && (
            <div className="cast-section">
              <div className="cast-header">
                <h2>Cast</h2>
                <Link to={`/movie/${tmdbId}/cast`} className="see-all">
                  <span>See all {movie.cast_preview.length}</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
              <div className="cast-list">
                {movie.cast_preview.slice(0, 8).map((cast) => (
                  <Link
                    key={cast.person.id}
                    to={`/person/${cast.person.id}`}
                    className="cast-member"
                  >
                    <div className="cast-image-container">
                      <img
                        src={cast.person.profile_path || "/default-avatar.jpg"}
                        alt={cast.person.name}
                        className="cast-image"
                      />
                    </div>
                    <p className="cast-name">{cast.person.name}</p>
                    <p className="cast-character">{cast.character}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Collection Section */}
          {movie.belongs_to_collection && (
            <div className="collection-section">
              <div className="collection-header">
                <h2 className="collection-title">
                  Part of: {movie.belongs_to_collection.name}
                </h2>
                <Link
                  to={`/collection/${movie.belongs_to_collection.id}`}
                  className="see-all"
                >
                  <span>See collection</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
              <div className="collection-movies">
                {movie.collection_movies?.slice(0, 4).map((collectionMovie) => (
                  <Link
                    key={collectionMovie.id}
                    to={`/movie/${collectionMovie.id}`}
                    className="collection-movie"
                  >
                    <div className="collection-movie-poster">
                      <img
                        src={
                          collectionMovie.poster_path || "/default-movie.jpg"
                        }
                        alt={collectionMovie.title}
                      />
                    </div>
                    <p className="collection-movie-title">
                      {collectionMovie.title}
                    </p>
                    <p className="collection-movie-year">
                      {collectionMovie.release_date?.split("-")[0]}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Lists Section */}
          {movie.lists && movie.lists.length > 0 && (
            <div className="lists-section">
              <div className="lists-header">
                <h2>Appears in Lists</h2>
              </div>
              <div className="lists-grid">
                {movie.lists.map((list) => (
                  <Link
                    key={list.id}
                    to={`/list/${list.id}`}
                    className="list-card"
                  >
                    <div className="list-thumbnail">
                      <img
                        src={list.thumbnail || "/default-list.jpg"}
                        alt={list.name}
                      />
                      <div className="list-creator">by {list.creator}</div>
                    </div>
                    <p className="list-name">{list.name}</p>
                    <p className="list-count">{list.movie_count} movies</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
