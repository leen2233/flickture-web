import { useState, useEffect, useCallback } from "react";
import { X, Loader, BookmarkPlus, Check, Heart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";
import axiosClient from "../utils/axios";
import "../styles/MovieStatsModal.css";

function MovieStatsModal({ title, type, onClose }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const fetchMovies = async (pageNum = 1, search = "") => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get(`/movies/lists/${type}`, {
        params: {
          page: pageNum,
          search: search,
        },
      });

      if (pageNum === 1) {
        setMovies(response.data.results);
      } else {
        setMovies((prev) => [...prev, ...response.data.results]);
      }

      setTotalCount(response.data.count);
      setHasMore(response.data.next !== null);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch movies when debounced search query changes
  useEffect(() => {
    fetchMovies(1, debouncedSearchQuery);
  }, [type, debouncedSearchQuery]);

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, clientHeight, scrollHeight } = e.target;
      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        !isLoading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
        fetchMovies(page + 1, debouncedSearchQuery);
      }
    },
    [isLoading, hasMore, page, debouncedSearchQuery]
  );

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.tmdb_id}`, {
      state: { from: "profile" },
    });
  };

  const handleWatchlistToggle = async (e, movie) => {
    e.stopPropagation();
    try {
      if (!movie.watchlist_status) {
        await axiosClient.post("/watchlist/", {
          tmdb_id: movie.tmdb_id,
          status: "watchlist",
        });
        setMovies((prev) =>
          prev.map((item) =>
            item.movie.tmdb_id === movie.tmdb_id
              ? { ...item, watchlist_status: "watchlist" }
              : item
          )
        );
      } else {
        await axiosClient.delete(`/watchlist/${movie.tmdb_id}/`);
        setMovies((prev) =>
          prev.map((item) =>
            item.movie.tmdb_id === movie.tmdb_id
              ? { ...item, watchlist_status: null }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    }
  };

  const handleWatchedToggle = async (e, movie) => {
    e.stopPropagation();
    try {
      await axiosClient.post("/movies/watchlist/", {
        tmdb_id: movie.tmdb_id,
        status: "watched",
      });
      setMovies((prev) =>
        prev.map((item) =>
          item.movie.tmdb_id === movie.tmdb_id
            ? { ...item, watchlist_status: "watched" }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to mark as watched:", error);
    }
  };

  const handleFavoriteToggle = async (e, movie) => {
    e.stopPropagation();
    try {
      if (!movie.is_favorite) {
        await axiosClient.post("/favorites/", {
          tmdb_id: movie.tmdb_id,
        });
        setMovies((prev) =>
          prev.map((item) =>
            item.movie.tmdb_id === movie.tmdb_id
              ? { ...item, movie: { ...item.movie, is_favorite: true } }
              : item
          )
        );
      } else {
        await axiosClient.delete(`/favorites/${movie.tmdb_id}/`);
        setMovies((prev) =>
          prev.map((item) =>
            item.movie.tmdb_id === movie.tmdb_id
              ? { ...item, movie: { ...item.movie, is_favorite: false } }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <div key={`skeleton-${index}`} className="modal-movie-skeleton">
          <div className="movie-thumbnail-skeleton skeleton" />
          <div className="movie-info-skeleton">
            <div className="movie-title-skeleton skeleton" />
            <div className="movie-meta-skeleton skeleton" />
          </div>
          <div className="movie-actions-skeleton">
            <div className="action-button-skeleton skeleton" />
            <div className="action-button-skeleton skeleton" />
          </div>
        </div>
      ));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <div className="modal-subtitle">
            {totalCount} {totalCount === 1 ? "movie" : "movies"}
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-search">
          <SearchInput
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder={`Search in ${title}`}
            showButton={false}
            containerClassName="modal-search-input"
          />
        </div>

        <div className="modal-body" onScroll={handleScroll}>
          {isLoading && movies.length === 0 ? (
            renderSkeletons()
          ) : (
            <>
              {movies.map((item) => (
                <div
                  key={item.id}
                  className="modal-movie-item"
                  onClick={() => handleMovieClick(item.movie)}
                >
                  <img
                    src={item.movie.poster_preview_url || "/default-movie.jpg"}
                    alt={item.movie.title}
                    className="movie-thumbnail"
                  />
                  <div className="movie-info">
                    <h3>{item.movie.title}</h3>
                    <div className="movie-meta">
                      {item.movie.year && <span>{item.movie.year}</span>}
                      {item.movie.rating && (
                        <span className="rating">
                          ★ {item.movie.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="movie-actions">
                    {item.watchlist_status === "watchlist" ? (
                      <button
                        className="action-icon-button"
                        onClick={(e) => handleWatchedToggle(e, item)}
                        title="Mark as watched"
                      >
                        <Plus size={18} />
                      </button>
                    ) : (
                      !item.watchlist_status && (
                        <button
                          className="action-icon-button"
                          onClick={(e) => handleWatchlistToggle(e, item)}
                          title="Add to watchlist"
                        >
                          <BookmarkPlus size={18} />
                        </button>
                      )
                    )}
                    <button
                      className={`action-icon-button ${
                        item.movie.is_favorite ? "active" : ""
                      }`}
                      onClick={(e) => handleFavoriteToggle(e, item.movie)}
                      title={
                        item.movie.is_favorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Heart
                        size={18}
                        fill={item.movie.is_favorite ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </div>
              ))}

              {isLoading && movies.length > 0 && (
                <div className="loading-indicator">
                  <Loader className="spin" size={24} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieStatsModal;
