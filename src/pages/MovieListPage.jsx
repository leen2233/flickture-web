import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  Calendar,
  Clock,
  BookmarkPlus,
  Check,
  Plus,
  Heart,
  Loader2,
} from "lucide-react";
import axiosClient from "../utils/axios";
import { formatDistanceToNow } from "date-fns";
import MovieList from "../components/MovieList";
import "../styles/MovieListPage.css";
import SearchInput from "../components/SearchInput";

function MovieListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, type } = location.state || {};

  const [watchlistItems, setWatchlistItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({});

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axiosClient.get(`/movies/lists/${type}`);
        setWatchlistItems(response.data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [type]);

  const filteredItems = watchlistItems.filter((item) =>
    item.movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return `${formatDistanceToNow(date)} ago`;
    } catch (error) {
      return "N/A";
    }
  };

  // Convert watchlist items to movie format expected by MovieList
  const moviesForList = filteredItems.map((item) => ({
    ...item.movie,
    created_at: item.created_at,
    updated_at: item.updated_at,
    status: item.status,
  }));

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="movie-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1>{title}</h1>
          <div className="search-wrapper">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${title}`}
              showButton={false}
              containerClassName="list-search"
            />
          </div>
        </div>
      </div>

      <div className="page-content">
        <MovieList
          movies={moviesForList}
          icon={Clock}
          showStatus={true}
          onMovieClick={(movie) =>
            navigate(`/movie/${movie.tmdb_id}`, {
              state: { from: "movie-list" },
            })
          }
        />
      </div>
    </div>
  );
}

export default MovieListPage;
