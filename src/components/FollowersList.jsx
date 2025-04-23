import { useState, useEffect, useCallback } from "react";
import { X, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";
import axiosClient from "../utils/axios";
import "../styles/MovieStatsModal.css"; // We'll reuse the modal styles

function FollowersList({ title, username, type, onClose }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const fetchUsers = async (pageNum = 1, search = "") => {
    try {
      setIsLoading(true);
      const endpoint =
        type === "followers"
          ? `/auth/user/${username}/followers/`
          : `/auth/user/${username}/following/`;

      const response = await axiosClient.get(endpoint, {
        params: {
          page: pageNum,
          search: search,
        },
      });

      if (pageNum === 1) {
        setUsers(response.data.results);
      } else {
        setUsers((prev) => [...prev, ...response.data.results]);
      }

      setTotalCount(response.data.count);
      setHasMore(response.data.next !== null);
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
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

  // Fetch users when debounced search query changes
  useEffect(() => {
    fetchUsers(1, debouncedSearchQuery);
  }, [type, debouncedSearchQuery, username]);

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, clientHeight, scrollHeight } = e.target;
      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        !isLoading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
        fetchUsers(page + 1, debouncedSearchQuery);
      }
    },
    [isLoading, hasMore, page, debouncedSearchQuery]
  );

  const handleUserClick = (username) => {
    navigate(`/users/${username}`);
    onClose();
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
        </div>
      ));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>{title}</h2>
            <div className="modal-subtitle">
              {totalCount} {totalCount === 1 ? "user" : "users"}
            </div>
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
            placeholder={`Search ${title}`}
            showButton={false}
            containerClassName="modal-search-input"
          />
        </div>

        <div className="modal-body" onScroll={handleScroll}>
          {isLoading && users.length === 0 ? (
            renderSkeletons()
          ) : (
            <>
              {users.map((user) => (
                <div
                  key={user.username}
                  className="modal-movie-item"
                  onClick={() => handleUserClick(user.username)}
                >
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.username}
                    className="user-avatar"
                  />
                  <div className="movie-info">
                    <h3>{user.full_name || user.username}</h3>
                    {user.full_name && (
                      <div className="movie-meta">
                        <span>@{user.username}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && users.length > 0 && (
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

export default FollowersList;
