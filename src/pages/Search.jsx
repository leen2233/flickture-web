import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  Film,
  Loader,
  Star,
  Users,
  Flame,
  Clock,
  Trophy,
} from "lucide-react";
import axiosClient from "../utils/axios";

function MovieCard({ movie }) {
  const [searchParams] = useSearchParams();

  return (
    <Link
      to={`/movies/${movie.tmdb_id}`}
      state={{
        search: searchParams.toString() ? `?${searchParams.toString()}` : "",
      }}
      className="search-movie-card"
    >
      <div className="movie-poster">
        <img
          src={movie.poster_preview_url || "/default-movie.jpg"}
          alt={movie.title}
        />
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <div className="movie-meta">
          {movie.year && <span className="year">{movie.year}</span>}
          {movie.rating && (
            <span className="rating">
              <Star size={16} className="star-icon" />
              {movie.rating.toFixed(1)}
            </span>
          )}
          {movie.vote_count > 0 && (
            <span className="votes">
              <Users size={16} />
              {movie.vote_count.toLocaleString()}
            </span>
          )}
        </div>
        {movie.genres && movie.genres.length > 0 && (
          <div className="genres">
            {movie.genres.map((genre) => (
              <span key={genre.id} className="genre-tag">
                {genre.name}
              </span>
            ))}
          </div>
        )}
        <p className="overview">{movie.plot}</p>
      </div>
    </Link>
  );
}

function MovieList({ title, movies, icon: Icon }) {
  return (
    <div className="movie-list-section">
      <div className="list-header">
        <Icon size={20} />
        <h2>{title}</h2>
      </div>
      <div className="movies-grid">
        {movies.map((movie) => (
          <Link
            key={movie.tmdb_id}
            to={`/movies/${movie.tmdb_id}`}
            className="movie-grid-item"
          >
            <div className="movie-poster">
              <img
                src={movie.poster_preview_url || "/default-movie.jpg"}
                alt={movie.title}
              />
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
        ))}
      </div>
    </div>
  );
}

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [movies, setMovies] = useState([]);
  const [movieLists, setMovieLists] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(
    !!searchParams.get("q")
  );

  useEffect(() => {
    const fetchMovieLists = async () => {
      setIsLoadingLists(true);
      try {
        const response = await axiosClient.get("/movies/lists/");
        setMovieLists(response.data);
      } catch (err) {
        console.error("Failed to fetch movie lists:", err);
      } finally {
        setIsLoadingLists(false);
      }
    };

    // Only fetch movie lists if no search query
    if (!searchParams.get("q")) {
      fetchMovieLists();
    }
  }, [searchParams]);

  useEffect(() => {
    // Perform search if there's a query parameter
    const initialQuery = searchParams.get("q");
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    setIsLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const response = await axiosClient.get("/movies/search-widely/", {
        params: { query: searchQuery.trim() },
      });
      setMovies(response.data.results || []);
    } catch (err) {
      setError("Failed to search movies. Please try again.");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Update URL with search query
    setSearchParams({ q: query.trim() });
    performSearch(query);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!e.target.value.trim()) {
      // Clear search params and reset state when input is cleared
      setSearchParams({});
      setSearchPerformed(false);
      setMovies([]);
    }
  };

  return (
    <div className="content-container">
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <SearchIcon size={20} />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search for movies..."
              className="search-input"
            />
          </div>
          <button type="submit" className="search-button" disabled={isLoading}>
            {isLoading ? <Loader className="spin" size={20} /> : "Search"}
          </button>
        </form>

        {error && <div className="error-message general">{error}</div>}

        <div className="search-results">
          {isLoading ? (
            <div className="loading-state">
              <Loader className="spin" size={24} />
              <p>Searching movies...</p>
            </div>
          ) : searchPerformed ? (
            movies.length > 0 ? (
              <div className="movie-results">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Film size={24} />
                <p>No movies found. Try a different search term.</p>
              </div>
            )
          ) : isLoadingLists ? (
            <div className="loading-state">
              <Loader className="spin" size={24} />
              <p>Loading movie lists...</p>
            </div>
          ) : movieLists ? (
            <div className="movie-lists-container">
              <MovieList
                title="Popular Movies"
                movies={movieLists.popular}
                icon={Flame}
              />
              <MovieList
                title="Now Playing"
                movies={movieLists.now_playing}
                icon={Clock}
              />
              <MovieList
                title="Top Rated"
                movies={movieLists.top_rated}
                icon={Trophy}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Search;
