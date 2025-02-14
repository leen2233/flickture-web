import { useState, useEffect } from "react";
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
} from "lucide-react";
import PersonDetailSkeleton from "../components/skeletons/PersonDetailSkeleton";

const PersonDetail = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [filmography, setFilmography] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personResponse, filmographyResponse, followResponse] =
          await Promise.all([
            axiosClient.get(`/persons/${id}`),
            axiosClient.get(`/persons/${id}/filmography/`),
            axiosClient.get(`/persons/${id}/follow/`),
          ]);
        setPerson(personResponse.data);
        setFilmography(filmographyResponse.data.results);
        setIsFollowing(followResponse.data.is_following);
        setFollowersCount(followResponse.data.followers_count);
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
                <div
                  className={`biography-content ${
                    isBioExpanded ? "expanded" : ""
                  }`}
                >
                  <p>{person.biography}</p>
                </div>
                <button
                  className="expand-button"
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                >
                  {isBioExpanded ? (
                    <>
                      <span>Show Less</span>
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      <span>Read More</span>
                      <ChevronDown size={16} />
                    </>
                  )}
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
                <span>Total {filmography.length} movies</span>
                <ChevronRight size={16} />
              </div>
            </div>
            <div className="movies-scroll">
              {filmography.map((movie) => (
                <Link
                  to={`/movie/${movie.tmdb_id}`}
                  key={movie.id}
                  className="movie-card"
                >
                  <div className="movie-poster">
                    {movie.poster_url ? (
                      <img src={movie.poster_url} alt={movie.title} />
                    ) : (
                      <div className="placeholder-poster">
                        <span>{movie.title[0]}</span>
                      </div>
                    )}
                    <div className="movie-info-overlay">
                      {movie.rating > 0 && (
                        <div className="movie-rating">
                          <Star size={12} />
                          {movie.rating.toFixed(1)}
                        </div>
                      )}
                      <div className="movie-info-bottom">
                        <h3 className="movie-title">{movie.title}</h3>
                        <span className="movie-year">{movie.year}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetail;
