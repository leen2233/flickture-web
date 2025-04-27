import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axios";
import { Star, Users, Clock, Calendar, ArrowLeft } from "lucide-react";
import "../styles/CastDetails.css";

const CastDetails = () => {
  const { type, id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieResponse, castResponse] = await Promise.all([
          axios.get(`/movies/${id}/${type}`),
          axios.get(`/movies/${id}/${type}/cast/`),
        ]);
        setMovie(movieResponse.data);
        setCast(castResponse.data.results);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type]);

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading cast...</span>
      </div>
    );
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="cast-details-page">
      <header className="page-header">
        <Link to={`/${type}/${id}`} className="nav-button">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>
        <h1>Cast & Crew</h1>
      </header>

      <div className="movie-banner">
        <img
          src={movie?.backdrop_url || movie?.poster_url}
          alt={movie?.title}
          className="backdrop"
        />
        <div className="movie-info">
          <h2>{movie?.title}</h2>
          <div className="stats">
            <span>
              <Star size={16} /> {movie?.rating?.toFixed(1)}
            </span>
            <span>
              <Users size={16} /> {movie?.vote_count?.toLocaleString()}
            </span>
            <span>
              <Clock size={16} /> {movie?.runtime} min
            </span>
            <span>
              <Calendar size={16} /> {movie?.year}
            </span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="cast-list">
          {cast.map((castMember) => (
            <Link
              to={`/person/${castMember.person.tmdb_id}`}
              key={castMember.person.id}
              className="cast-member"
            >
              <div className="cast-image-container">
                <img
                  src={castMember.person.profile_path || "/default-avatar.png"}
                  alt={castMember.person.name}
                  className="cast-image"
                />
              </div>
              <div className="cast-info">
                <div className="cast-name">{castMember.person.name}</div>
                <div className="cast-character">{castMember.character}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CastDetails;
