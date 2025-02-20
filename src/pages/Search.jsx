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
import MovieList from "../components/MovieList";
import axiosClient from "../utils/axios";
import "../styles/Search.css";
import SearchInput from "../components/SearchInput";

function SearchResultCard({ item }) {
  const [searchParams] = useSearchParams();

  if (item.media_type === "person") {
    return (
      <Link
        to={`/person/${item.tmdb_id}`}
        state={{
          from: "search",
          search: searchParams.toString() ? `?${searchParams.toString()}` : "",
        }}
        className="search-person-card"
      >
        <div className="person-image">
          <img
            src={item.profile_path || "/default-avatar.png"}
            alt={item.name}
          />
        </div>
        <div className="person-info">
          <div className="person-header">
            <h3>{item.name}</h3>
            <span className="type">Person</span>
          </div>
          <span className="department">{item.known_for_department}</span>
          {item.known_for && item.known_for.length > 0 && (
            <div className="known-for">
              <span className="known-for-label">Known for:</span>
              <div className="known-for-movies">
                {item.known_for.map((movie) => movie.title).join(", ")}
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  }

  const posterUrl =
    item.poster_preview_url ||
    (item.media_type === "tv" ? "/default-tv.png" : "/default-movie.png");

  const MediaCard = () => (
    <Link
      to={`/${item.media_type}/${item.tmdb_id}`}
      state={{
        from: "search",
        search: searchParams.toString() ? `?${searchParams.toString()}` : "",
      }}
      className="search-media-card"
    >
      <div className="media-poster">
        <img src={posterUrl} alt={item.title} />
        {item.rating > 0 && (
          <div className="rating-badge">
            <Star size={12} />
            <span>{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="media-info">
        <div className="media-header">
          <h3>{item.title}</h3>
          <span className="type">
            {item.media_type === "tv" ? "TV Series" : "Movie"}
          </span>
        </div>
        <div className="media-meta">
          {item.year && <span className="year">{item.year}</span>}
          {item.vote_count > 0 && (
            <span className="votes">
              <Users size={14} />
              {item.vote_count.toLocaleString()}
            </span>
          )}
        </div>
        {item.overview && <p className="overview">{item.overview}</p>}
      </div>
    </Link>
  );

  return <MediaCard />;
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
    console.log(movies);
  }, [movies]);

  useEffect(() => {
    const fetchMovieLists = async () => {
      setIsLoadingLists(true);
      try {
        // Fetch popular, now playing, and top rated movies
        const [popularRes, nowPlayingRes, topRatedRes] = await Promise.all([
          axiosClient.get("/movies/discover", {
            params: { category: "popular" },
          }),
          axiosClient.get("/movies/discover", {
            params: { category: "now_playing" },
          }),
          axiosClient.get("/movies/discover", {
            params: { category: "top_rated" },
          }),
        ]);

        setMovieLists({
          popular: popularRes.data.results,
          nowPlaying: nowPlayingRes.data.results,
          topRated: topRatedRes.data.results,
        });
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
      const response = await axiosClient.get("/movies/search/multi", {
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
        <SearchInput
          value={query}
          onChange={handleInputChange}
          onSubmit={handleSearch}
          placeholder="Search for movies..."
          isLoading={isLoading}
        />

        {error && <div className="error-message general">{error}</div>}

        <div className="search-results">
          {isLoading ? (
            <div className="loading-state">
              <Loader className="spin" size={24} />
              <p>Searching...</p>
            </div>
          ) : searchPerformed ? (
            movies.length > 0 ? (
              <div className="search-results-grid">
                {movies.map((item) => {
                  if (item.tmdb_id) {
                    return (
                      <SearchResultCard
                        key={`${item.media_type}-${item.tmdb_id}`}
                        item={item}
                      />
                    );
                  }
                })}
              </div>
            ) : (
              <div className="empty-state">
                <Film size={24} />
                <p>No results found. Try a different search term.</p>
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
                movies={movieLists.nowPlaying}
                icon={Clock}
              />
              <MovieList
                title="Top Rated"
                movies={movieLists.topRated}
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
