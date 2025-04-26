import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../utils/axios";
import {
  ArrowLeft,
  Star,
  ChevronRight,
  Film,
  Instagram,
  Twitter,
  MapPin,
  Calendar,
  Briefcase,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
} from "lucide-react";
import PersonDetailSkeleton from "../components/skeletons/PersonDetailSkeleton";
import { useAuth } from "../contexts/AuthContext";

const BiographyModal = ({ isOpen, onClose, biography }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content biography-modal">
        <div className="modal-header">
          <h2>Biography</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p>{biography}</p>
        </div>
      </div>
    </div>
  );
};

const PersonDetail = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [filmography, setFilmography] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [showBioModal, setShowBioModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [noMoreMovies, setNoMoreMovies] = useState(false);
  const { isAuthenticated } = useAuth();
  const observer = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personResponse, filmographyResponse] = await Promise.all([
          axiosClient.get(`/persons/${id}`),
          axiosClient.get(`/persons/${id}/filmography/`),
        ]);
        if (isAuthenticated) {
          const [followResponse] = await Promise.all([
            axiosClient.get(`/persons/${id}/follow/`),
          ]);

          setIsFollowing(followResponse.data.is_following);
          setFollowersCount(followResponse.data.followers_count);
        }
        setPerson(personResponse.data);
        setFilmography(filmographyResponse.data.results);
        setTotalMovies(filmographyResponse.data.count);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axiosClient.delete(`/persons/${id}/follow/`);
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        await axiosClient.post(`/persons/${id}/follow/`);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  // Intersection Observer callback
  const lastMovieElementRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreMovies();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  // Function to load more movies
  const loadMoreMovies = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const response = await axiosClient.get(
        `/persons/${id}/filmography/?page=${nextPage}`
      );

      setFilmography((prev) => [...prev, ...response.data.results]);
      setPage(nextPage);
      setHasMore(response.data.results.length > 0);
    } catch (err) {
      console.error("Error loading more movies:", err);
      if (err.response?.status === 404) {
        setHasMore(false);
        setNoMoreMovies(true);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (loading) {
    return <PersonDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="error-message general">
        <p>Error loading person details: {error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!person) return null;

  return (
    <div className="person-detail-container">
      <div className="movie-nav">
        <Link to="/" className="nav-button">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="person-detail-content">
        <div className="person-detail-main">
          <div className="person-poster-large">
            {person.profile_path ? (
              <img src={person.profile_path} alt={person.name} />
            ) : (
              <div className="placeholder-poster">
                <span>{person.name[0]}</span>
              </div>
            )}
          </div>

          <div className="person-info-detailed">
            <div className="name-follow-section">
              <h1>{person.name}</h1>
              <button
                className={`follow-button ${isFollowing ? "following" : ""}`}
                onClick={handleFollow}
              >
                <span>{isFollowing ? "Following" : "Follow"}</span>
              </button>
            </div>

            {/* Stats Section */}
            <div className="stats-section">
              <div className="stats-row">
                {person.birthday && (
                  <div className="stat-box">
                    <Calendar size={18} color="#dc3f72" />
                    <span className="stat-value">
                      {new Date(person.birthday).getFullYear()}
                    </span>
                    <span className="stat-label">Born</span>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="stat-box">
                    <MapPin size={18} color="#dc3f72" />
                    <span className="stat-value">
                      {person.place_of_birth.split(",")[0]}
                    </span>
                    <span className="stat-label">From</span>
                  </div>
                )}
                {person.known_for_department && (
                  <div className="stat-box">
                    <Briefcase size={18} color="#dc3f72" />
                    <span className="stat-value">
                      {person.known_for_department}
                    </span>
                    <span className="stat-label">Department</span>
                  </div>
                )}
                <div className="stat-box">
                  <Film size={18} color="#dc3f72" />
                  <span className="stat-value">{filmography.length}</span>
                  <span className="stat-label">Movies</span>
                </div>
                <div className="stat-box">
                  <Star size={18} color="#dc3f72" />
                  <span className="stat-value">{followersCount}</span>
                  <span className="stat-label">Followers</span>
                </div>
              </div>
            </div>

            {person.biography && (
              <div className="person-biography">
                <h2>Biography</h2>
                <div className="biography-content">
                  <p>{person.biography.slice(0, 200)}...</p>
                </div>
                <button
                  className="expand-button"
                  onClick={() => setShowBioModal(true)}
                >
                  <span>Read More</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Social Media Section - This would need to be added to the API */}
            <div className="social-media-section">
              <div className="social-buttons">
                <button
                  className="social-button"
                  onClick={() =>
                    window.open("https://instagram.com/", "_blank")
                  }
                >
                  <Instagram size={20} />
                  <span>Instagram</span>
                </button>
                <button
                  className="social-button"
                  onClick={() => window.open("https://twitter.com/", "_blank")}
                >
                  <Twitter size={20} />
                  <span>Twitter</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {filmography.length > 0 && (
          <div className="filmography-section">
            <div className="section-header">
              <h2>Filmography</h2>
              <div className="see-all">
                <span>Total {totalMovies} movies</span>
              </div>
            </div>
            <div className="movies-scroll">
              {filmography.map((movie, index) => (
                <Link
                  to={`/${movie.type}/${movie.tmdb_id}`}
                  key={movie.id}
                  className="movie-card"
                  ref={
                    index === filmography.length - 1 && !noMoreMovies
                      ? lastMovieElementRef
                      : null
                  }
                >
                  <div className="movie-poster">
                    {movie.poster_url ? (
                      <img src={movie.poster_url} alt={movie.title} />
                    ) : (
                      <img src="/default-movie.png" alt={movie.title} />
                    )}
                    <div className="movie-info-overlay">
                      <div className="movie-rating">
                        <Star size={12} />
                        <span>{movie.rating && movie.rating.toFixed(1)}</span>
                      </div>
                      <div className="movie-info-bottom">
                        <h3 className="movie-title">{movie.title}</h3>
                        <span className="movie-year">{movie.year}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {isLoadingMore && (
              <div className="loading-more">
                <Loader2 size={24} className="spin" />
                <span>Loading more movies...</span>
              </div>
            )}
            {noMoreMovies && (
              <div className="no-more-movies">
                <span>That's all! You've seen all {totalMovies} movies.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <BiographyModal
        isOpen={showBioModal}
        onClose={() => setShowBioModal(false)}
        biography={person.biography}
      />
    </div>
  );
};

export default PersonDetail;
