import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
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
import MovieDetailSkeleton from "../components/skeletons/MovieDetailSkeleton";

function CollectionSection({ collection, collection_movies }) {
  const navigate = useNavigate();

  if (!collection || !collection_movies) return null;

  return (
    <div className="collection-section">
      <div className="collection-header">
        <h2>Part of: {collection.name}</h2>
        <Link to={`/collection/${collection.tmdb_id}`} className="see-all">
          <span>See collection</span>
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="collection-movies">
        {collection_movies?.map((movie) => (
          <Link
            key={movie.tmdb_id}
            to={`/movie/${movie.tmdb_id}`}
            className="collection-movie"
          >
            <div className="collection-movie-poster">
              <img
                src={movie.poster_preview_url || "/default-movie.jpg"}
                alt={movie.title}
              />
            </div>
            <p className="collection-movie-title">{movie.title}</p>
            <p className="collection-movie-year">{movie.year}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MovieDetail() {
  const { tmdbId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMovieDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get(`/movies/${tmdbId}/detail`);
        if (isMounted) {
          setMovie(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load movie details");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMovieDetails();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [tmdbId]);

  const handleWatchlistToggle = async () => {
    if (isLoadingWatchlist) return;

    try {
      setIsLoadingWatchlist(true);
      if (!movie.watchlist_status) {
        await axiosClient.post("/movies/watchlist/", {
          tmdb_id: tmdbId,
          status: "watchlist",
        });
        setMovie((prev) => ({ ...prev, watchlist_status: "watchlist" }));
      } else {
        await axiosClient.delete(`/movies/watchlist/${tmdbId}/`);
        setMovie((prev) => ({ ...prev, watchlist_status: null }));
      }
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const handleWatchedToggle = async () => {
    if (isLoadingWatchlist) return;

    try {
      setIsLoadingWatchlist(true);
      if (movie.watchlist_status !== "watched") {
        await axiosClient.post("/watchlist/", {
          tmdb_id: tmdbId,
          status: "watched",
        });
        setMovie((prev) => ({ ...prev, watchlist_status: "watched" }));
      } else {
        await axiosClient.delete(`/watchlist/${tmdbId}/`);
        setMovie((prev) => ({ ...prev, watchlist_status: null }));
      }
    } catch (error) {
      console.error("Failed to update watched status:", error);
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (isLoadingFavorite) return;

    try {
      setIsLoadingFavorite(true);
      if (!movie.is_favorite) {
        await axiosClient.post("/favorites/", {
          tmdb_id: tmdbId,
        });
        setMovie((prev) => ({ ...prev, is_favorite: true }));
      } else {
        await axiosClient.delete(`/favorites/${tmdbId}/`);
        setMovie((prev) => ({ ...prev, is_favorite: false }));
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsLoadingFavorite(false);
    }
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

  // Get back button text based on source
  const getBackButtonText = () => {
    switch (location.state?.from) {
      case "search":
        return "Back to Search";
      case "profile":
        return "Back to Profile";
      default:
        return "Back";
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (location.state?.from === "search" && location.state?.search) {
      navigate(`/search${location.state.search}`);
    } else if (location.state?.from === "profile") {
      navigate("/profile");
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return <MovieDetailSkeleton />;
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
          <button className="nav-button" onClick={handleBack}>
            <ArrowLeft size={20} />
            <span>{getBackButtonText()}</span>
          </button>
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
              <MessageCircle size={16} />
              <Link to={`/movie/${tmdbId}/comments`} className="metadata-link">
                {movie.comments_count || 0} Comments
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <div className="action-row">
              {movie.watchlist_status !== "watched" ? (
                movie.watchlist_status !== "watchlist" ? (
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
                className={`action-button ${movie.is_favorite ? "active" : ""}`}
                onClick={handleFavoriteToggle}
                disabled={isLoadingFavorite}
              >
                {isLoadingFavorite ? (
                  <Loader2 size={20} className="spin" />
                ) : (
                  <Heart
                    size={20}
                    fill={movie.is_favorite ? "white" : "none"}
                  />
                )}
                <span>
                  {movie.is_favorite ? "In Favorites" : "Add to Favorites"}
                </span>
              </button>
              <button className="action-button">
                <ListPlus size={20} />
                <span>Add to List</span>
              </button>
            </div>

            {movie.watchlist_status === "watchlist" && (
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
          {movie.collection && (
            <CollectionSection
              collection={movie.collection}
              collection_movies={movie.collection_movies}
            />
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
