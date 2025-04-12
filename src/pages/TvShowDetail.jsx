import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Users,
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
  Tv,
} from "lucide-react";
import axiosClient from "../utils/axios";
import MovieDetailSkeleton from "../components/skeletons/MovieDetailSkeleton";
import { RatingStars } from "../components/RatingStars";
import { toast } from "react-toastify";

const WatchedCommentModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    await onSubmit(comment, rating);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Rate This TV Show</h2>
        <p className="modal-subtitle">
          How would you rate this TV show? Leave a review if you'd like to share
          your thoughts.
        </p>

        <div className="rating-section">
          <RatingStars rating={rating} interactive onRatingChange={setRating} />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review (optional)"
          rows={4}
          disabled={isSubmitting}
        />

        <div className="modal-actions">
          <button
            className="secondary-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Skip Review
          </button>
          <button
            className="primary-button"
            onClick={handleSubmit}
            disabled={!rating || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="spin" />
            ) : (
              "Post Review"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function TvShowDetail() {
  const { tmdbId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchShowDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosClient.get(`/tv-shows/${tmdbId}`);
        if (isMounted) {
          setShow(response.data);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err.response?.data?.message ||
            "Failed to load TV show details. Please try again later.";
          setError(errorMessage);
          console.error("TV show detail error:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchShowDetails();

    return () => {
      isMounted = false;
    };
  }, [tmdbId]);

  const handleWatchlistToggle = async () => {
    if (isLoadingWatchlist) return;

    try {
      setIsLoadingWatchlist(true);
      setError(null);

      if (!show.watchlist_status) {
        await axiosClient.post("/watchlist/", {
          tmdb_id: tmdbId,
          media_type: "tv",
          status: "watchlist",
        });
        setShow((prev) => ({ ...prev, watchlist_status: "watchlist" }));
      } else {
        await axiosClient.delete(`/watchlist/${tmdbId}/`);
        setShow((prev) => ({ ...prev, watchlist_status: null }));
      }
    } catch (error) {
      console.error("Watchlist error:", error);
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const handleWatchedToggle = async () => {
    if (isLoadingWatchlist) return;

    if (show.watchlist_status !== "watched") {
      try {
        setIsLoadingWatchlist(true);
        setError(null);

        await axiosClient.patch(`/watchlist/${tmdbId}/`, {
          status: "watched",
          media_type: "tv",
        });

        setShow((prev) => ({ ...prev, watchlist_status: "watched" }));
        setShowCommentModal(true);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to update watched status. Please try again.";
        setError(errorMessage);
        console.error("Watched status error:", error);
      } finally {
        setIsLoadingWatchlist(false);
      }
    } else {
      try {
        setIsLoadingWatchlist(true);
        setError(null);
        await axiosClient.delete(`/watchlist/${tmdbId}/`);
        setShow((prev) => ({ ...prev, watchlist_status: null }));
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to update watched status. Please try again.";
        setError(errorMessage);
        console.error("Watched status error:", error);
      } finally {
        setIsLoadingWatchlist(false);
      }
    }
  };

  const handleFavoriteToggle = async () => {
    if (isLoadingFavorite) return;

    try {
      setIsLoadingFavorite(true);
      setError(null);
      if (!show.is_favorite) {
        await axiosClient.post("/favorites/", {
          tmdb_id: tmdbId,
          media_type: "tv",
        });
        setShow((prev) => ({ ...prev, is_favorite: true }));
      } else {
        await axiosClient.delete(`/favorites/${tmdbId}/`);
        setShow((prev) => ({ ...prev, is_favorite: false }));
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to toggle favorite. Please try again.";
      setError(errorMessage);
      console.error("Favorite toggle error:", error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: show.name,
        text: `Check out ${show.name} on Flickture!`,
        url: window.location.href,
      });
    }
  };

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

  const handleBack = () => {
    if (location.state?.from === "search" && location.state?.search) {
      navigate(`/search${location.state.search}`);
    } else if (location.state?.from === "profile") {
      navigate("/profile");
    } else {
      navigate(-1);
    }
  };

  const handleCommentSubmit = async (content, rating) => {
    try {
      setIsSubmittingComment(true);
      setError(null);

      await axiosClient.post(`/tv-shows/${tmdbId}/comments/`, {
        content,
        rating,
        tv_show: show.id,
      });

      setShowCommentModal(false);
      toast.success("Review posted successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to post review. Please try again.";
      setError(errorMessage);
      console.error("Comment submission error:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return <MovieDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="content-container">
        <div className="error-message general">
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              fetchShowDetails();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div className="movie-detail-container">
      <div
        className="movie-backdrop"
        style={{ backgroundImage: `url(${show.backdrop_url})` }}
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
          <div className="movie-detail-main">
            <div className="movie-poster-large">
              <img
                src={show.poster_url || "/default-movie.png"}
                alt={show.name}
              />
            </div>

            <div className="movie-info-detailed">
              <h1>{show.name}</h1>
              {show.original_name && show.original_name !== show.name && (
                <p className="original-title">{show.original_name}</p>
              )}
              {show.plot && <p className="overview">{show.plot}</p>}
              {show.genres && (
                <div className="genres">
                  {show.genres.map((genre) => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Show Creators Section */}
              {show.created_by && show.created_by.length > 0 && (
                <div className="directors-section">
                  <h3>Created by</h3>
                  <div className="directors-list">
                    {show.created_by.map((creator) => (
                      <Link
                        key={creator.id}
                        to={`/person/${creator.tmdb_id}`}
                        className="director-item"
                      >
                        <div className="director-image-container">
                          <img
                            src={creator.profile_path || "/default-avatar.png"}
                            alt={creator.name}
                            className="director-image"
                          />
                        </div>
                        <p className="director-name">{creator.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="metadata-section">
            <div className="metadata-item">
              <Calendar size={20} className="metadata-icon" />
              <span className="metadata-label">First Aired</span>
              <span className="metadata-value">{show.first_air_date}</span>
            </div>
            <div className="metadata-item">
              <Tv size={20} className="metadata-icon" />
              <span className="metadata-label">Seasons</span>
              <span className="metadata-value">{show.number_of_seasons}</span>
            </div>
            <div className="metadata-item">
              <Star size={20} className="metadata-icon" />
              <span className="metadata-label">Rating</span>
              <span className="metadata-value">{show.rating?.toFixed(1)}</span>
            </div>
            <div className="metadata-item">
              <Users size={20} className="metadata-icon" />
              <span className="metadata-label">Votes</span>
              <span className="metadata-value">
                {show.vote_count?.toLocaleString()}
              </span>
            </div>
            <Link to={`/tv/${tmdbId}/comments`} className="metadata-item">
              <MessageCircle size={20} className="metadata-icon" />
              <span className="metadata-label">Comments</span>
              <span className="metadata-value">{show.comment_count || 0}</span>
            </Link>
          </div>

          <div className="action-buttons">
            <div className="action-row">
              {show.watchlist_status !== "watched" ? (
                show.watchlist_status !== "watchlist" ? (
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
                className={`action-button ${show.is_favorite ? "active" : ""}`}
                onClick={handleFavoriteToggle}
                disabled={isLoadingFavorite}
              >
                {isLoadingFavorite ? (
                  <Loader2 size={20} className="spin" />
                ) : (
                  <Heart size={20} fill={show.is_favorite ? "white" : "none"} />
                )}
                <span>
                  {show.is_favorite ? "In Favorites" : "Add to Favorites"}
                </span>
              </button>
              <button className="action-button">
                <ListPlus size={20} />
                <span>Add to List</span>
              </button>
            </div>

            {show.watchlist_status === "watchlist" && (
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
          {show.cast_preview && show.cast_preview.length > 0 && (
            <div className="cast-section">
              <div className="cast-header">
                <h2>Cast</h2>
                <Link to={`/tv/${tmdbId}/cast`} className="see-all">
                  <span>See all {show.cast_preview.length}</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
              <div className="cast-list">
                {show.cast_preview.slice(0, 8).map((cast) => (
                  <Link
                    key={cast.person.id}
                    to={`/person/${cast.person.tmdb_id}`}
                    className="cast-member"
                  >
                    <div className="cast-image-container">
                      <img
                        src={cast.person.profile_path || "/default-avatar.png"}
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
        </div>
      </div>

      <WatchedCommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        onSubmit={handleCommentSubmit}
        isSubmitting={isSubmittingComment}
      />
    </div>
  );
}

export default TvShowDetail;
