import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  Calendar,
  Plus,
  ListIcon,
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
import { RatingStars } from "../components/RatingStars";
import { toast } from "react-toastify";
import "../styles/SeasonDetails.css";

function SeasonDetails() {
  const { type, tmdbId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [currentSeason, setCurrentSeason] = useState();
  const [currentEpisode, setCurrentEpisode] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMovieDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosClient.get(`/movies/${tmdbId}/${type}`);
        if (isMounted) {
          setMovie(response.data);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err.response?.data?.message ||
            "Failed to load movie details. Please try again later.";
          setError(errorMessage);
          console.error("Movie detail error:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMovieDetails();

    return () => {
      isMounted = false;
    };
  }, [tmdbId]);

  useEffect(() => {
    if (!movie || !movie.season_number) return;
    let _seasons = [];
    for (let i = 1; i <= movie.season_number; i++) {
      _seasons.push(i);
    }
    setSeasons(_seasons);
    setCurrentSeason(1);
  }, [movie]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosClient.get(
          `/movies/${tmdbId}/season/${currentSeason}`
        );
        setEpisodes(response.data);
        setCurrentEpisode(response.data[0]);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "Failed to load episodes. Please try again later.";
        setError(errorMessage);
        console.error("Episodes error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (movie && movie.type === "tv") {
      fetchEpisodes();
    }
  }, [currentSeason]);

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
              fetchMovieDetails();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="movie-detail-container season-detail-page">
      {/* Backdrop Image */}
      <div
        className="movie-backdrop"
        style={{
          backgroundImage: `url(${currentEpisode && currentEpisode.still_url})`,
        }}
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

      <div className="content-container episode-name-container">
        <div className="movie-detail-content">
          {/* Poster and Title */}
          <div className="movie-detail-main">
            <div className="movie-info-detailed">
              <h2>{currentEpisode && currentEpisode.name}</h2>
              {currentEpisode && (
                <p className="overview">{currentEpisode.overview}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Seasons */}
      <div className="seasons-container">
        {seasons.map((season) => (
          <div
            key={season}
            className={`season ${currentSeason === season ? "active" : ""}`}
            onClick={() => setCurrentSeason(season)}
          >
            <span>Season {season}</span>
          </div>
        ))}
      </div>
      {/* Episodes */}
      <div className="episodes-container">
        <table className="episodes-table">
          <thead>
            <tr>
              <th>Episode</th>
              <th>Title</th>
              <th>Air Date</th>
              <th>Runtime</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map((episode) => (
              <tr
                key={episode.episode_number}
                className={`episode ${
                  currentEpisode &&
                  currentEpisode.episode_number === episode.episode_number
                    ? "active"
                    : ""
                }`}
                onClick={() => setCurrentEpisode(episode)}
              >
                <td className="episode-number">#{episode.episode_number}</td>
                <td className="episode-title">{episode.name}</td>
                <td className="episode-air-date">{episode.air_date}</td>
                <td className="episode-runtime">{episode.runtime} min</td>
                <td className="episode-rating">
                  <div className="rating-container">
                    <span className="rating-value">
                      {episode.vote_average.toFixed(1)}
                    </span>
                    <span className="rating-max">/ 10</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SeasonDetails;
