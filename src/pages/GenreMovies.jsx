import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Heart,
  Film,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosClient from "../utils/axios";

function MovieItem({ movie }) {
  return (
    <Link to={`/${movie.type}/${movie.tmdb_id}`} className="genre-movie-item">
      <div className="movie-poster">
        <img
          src={movie.poster_preview_url || "/default-movie.png"}
          alt={movie.title}
          loading="lazy"
        />
        {movie.is_favorite && (
          <div className="movie-status favorite">
            <Heart size={20} fill="var(--primary-color)" />
          </div>
        )}
        <div className="movie-overlay">
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
      <div className="movie-info">
        <h3>{movie.title}</h3>
      </div>
    </Link>
  );
}

function GenreMovies() {
  const { tmdbId } = useParams();
  const [movies, setMovies] = useState([]);
  const [genreName, setGenreName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [headerBackdrop, setHeaderBackdrop] = useState(null);
  const observer = useRef();

  const lastMovieElementRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, currentPage, totalPages]
  );

  useEffect(() => {
    const fetchGenreMovies = async () => {
      try {
        if (currentPage === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setError(null);

        const response = await axiosClient.get(
          `/genres/${tmdbId}/movies/?page=${currentPage}`
        );
        if (currentPage === 1) {
          setMovies(response.data.results || []);
          // Set the backdrop from the first movie if available
          if (response.data?.backdrop_url) {
            console.log("SETTTTING");
            setHeaderBackdrop(response.data.backdrop_url);
          }
        } else {
          setMovies((prev) => [...prev, ...(response.data.results || [])]);
        }

        setGenreName(response.data.genre?.name || "");
        setTotalPages(response.data.total_pages || 0);
        setTotalResults(response.data.total_results || 0);
      } catch (error) {
        console.error("Error fetching genre movies:", error);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchGenreMovies();
  }, [tmdbId, currentPage]);

  if (isLoading) {
    return (
      <div className="genre-loading">
        <Loader className="spin" size={24} />
        <span>Loading movies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="genre-error">
        <Film size={24} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="genre-page">
      <div
        className="genre-header"
        style={
          headerBackdrop
            ? {
                background: "none",
                backgroundImage: `url(${headerBackdrop})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="header-overlay" />
        <div className="genre-nav">
          <Link to="/" className="nav-button">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
        </div>
        <div className="genre-header-content">
          <h1>{genreName} Movies</h1>
          <div className="genre-stats">
            <div className="genre-stat">
              <Film size={16} />
              <span>{totalResults.toLocaleString()} movies</span>
            </div>
          </div>
        </div>
      </div>

      <div className="genre-content">
        <div className="movies-grid">
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              ref={index === movies.length - 1 ? lastMovieElementRef : null}
            >
              <MovieItem movie={movie} />
            </div>
          ))}
        </div>

        {isLoadingMore && (
          <div className="loading-more">
            <Loader className="spin" size={24} />
            <span>Loading more movies...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GenreMovies;
