import { useState, useEffect } from "react";
import { X, Loader, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";
import axiosClient from "../utils/axios";
import "../styles/MovieStatsModal.css";

function AddToListModal({ movie, isOpen, onClose }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get("/lists/my_lists");
        // For each list, check if the movie exists in it
        const listsWithMovieStatus = await Promise.all(
          response.data.map(async (list) => {
            const movieCheck = await axiosClient.get(
              `/lists/${list.id}/check_movie/?tmdb_id=${movie.tmdb_id}&type=${movie.type}`
            );
            return {
              ...list,
              hasMovie: movieCheck.data.exists,
            };
          })
        );
        setLists(listsWithMovieStatus);
      } catch (error) {
        console.error("Failed to fetch lists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchLists();
    }
  }, [isOpen, movie.tmdb_id]);

  const handleCreateList = () => {
    navigate("/lists/create", { state: { movie } });
  };

  const handleAddToList = async (listId) => {
    try {
      setIsLoading(true);
      await axiosClient.post(`/lists/${listId}/add_movie/`, {
        tmdb_id: movie.tmdb_id,
        type: movie.type,
      });
      setLists(
        lists.map((list) =>
          list.id === listId ? { ...list, hasMovie: true } : list
        )
      );
    } catch (error) {
      console.error("Failed to add movie to list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromList = async (listId) => {
    try {
      setIsLoading(true);
      await axiosClient.post(`/lists/${listId}/remove_movie/`, {
        tmdb_id: movie.tmdb_id,
        type: movie.type,
      });
      setLists(
        lists.map((list) =>
          list.id === listId ? { ...list, hasMovie: false } : list
        )
      );
    } catch (error) {
      console.error("Failed to remove movie from list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLists = lists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>Add to List</h2>
            <div className="modal-subtitle">
              {lists.length} {lists.length === 1 ? "list" : "lists"}
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-search">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your lists"
            showButton={false}
            containerClassName="modal-search-input"
          />
        </div>

        <div className="modal-body">
          <button className="create-list-button" onClick={handleCreateList}>
            <Plus size={20} />
            <span>Create New List</span>
          </button>

          {isLoading && lists.length === 0 ? (
            <div className="modal-loading">
              <Loader className="spin" size={24} />
              <span>Loading your lists...</span>
            </div>
          ) : (
            <>
              {filteredLists.map((list) => (
                <div key={list.id} className="modal-movie-item">
                  <img
                    src={list.thumbnail || "/default-movie.png"}
                    alt={list.name}
                    className="movie-thumbnail"
                  />
                  <div className="movie-info">
                    <h3>{list.name}</h3>
                    <div className="movie-meta">
                      <span>{list.movies_count} movies</span>
                    </div>
                  </div>
                  <button
                    className={`action-button ${list.hasMovie ? "danger" : ""}`}
                    onClick={() =>
                      list.hasMovie
                        ? handleRemoveFromList(list.id)
                        : handleAddToList(list.id)
                    }
                  >
                    {list.hasMovie ? (
                      <>
                        <Trash2 size={18} />
                        <span>Remove</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              ))}

              {isLoading && (
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

export default AddToListModal;
