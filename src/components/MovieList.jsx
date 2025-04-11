import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import "../styles/MovieList.css";

function MovieList({ title, movies, icon: Icon, showStatus, onMovieClick }) {
  const MovieWrapper = onMovieClick ? "div" : Link;

  return (
    <div className="movie-list-section">
      {title && (
        <div className="list-header">
          <Icon size={20} />
          <h2>{title}</h2>
        </div>
      )}
      <div className="movies-grid">
        {movies.map((movie) => {
          const movieProps = onMovieClick
            ? {
                onClick: () => onMovieClick(movie),
                style: { cursor: "pointer" },
              }
            : {
                to: `/${movie.type}/${movie.tmdb_id}`,
              };

          return (
            <MovieWrapper
              key={movie.tmdb_id}
              {...movieProps}
              className="movie-grid-item"
            >
              <div className="movie-poster">
                <img
                  src={movie.poster_preview_url || "/default-movie.jpg"}
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
            </MovieWrapper>
          );
        })}
      </div>
    </div>
  );
}

export default MovieList;
