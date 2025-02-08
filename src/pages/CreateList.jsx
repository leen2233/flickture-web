import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Camera,
  Search,
  Star,
  X,
  Film,
  ArrowLeft,
  Loader,
  Plus,
} from "lucide-react";
import axiosClient from "../utils/axios";

function MovieSearchModal({ isOpen, onClose, onSelect, selectedMovies }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (value) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.get(`/movies/search?query=${value}`);
      setResults(response.data.results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Movies</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-results">
          {selectedMovies.length > 0 && (
            <div className="current-movies">
              <h3>Current Movies</h3>
              <div className="current-movies-grid">
                {selectedMovies.map((movie) => (
                  <div key={movie.id} className="current-movie">
                    <img
                      src={movie.poster_preview_url}
                      alt={movie.title}
                      className="movie-poster"
                    />
                    <div className="movie-info">
                      <h4>{movie.title}</h4>
                      <span>{movie.year}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="divider" />
            </div>
          )}

          {isLoading ? (
            <div className="modal-loading">
              <Loader className="spin" size={24} />
              <span>Searching movies...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="search-results-list">
              <h3>Search Results</h3>
              {results.map((movie) => {
                const isSelected = selectedMovies.some(
                  (m) => m.tmdb_id === movie.tmdb_id
                );
                return (
                  <div key={movie.id} className="search-result-item">
                    <img
                      src={movie.poster_preview_url}
                      alt={movie.title}
                      className="movie-poster"
                    />
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <div className="movie-meta">
                        <span>{movie.year}</span>
                        {movie.rating && (
                          <div className="rating">
                            <Star size={14} />
                            <span>{movie.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className={`select-button ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => !isSelected && onSelect(movie)}
                      disabled={isSelected}
                    >
                      {isSelected ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : query ? (
            <div className="empty-message">
              <Film size={24} />
              <p>No movies found</p>
            </div>
          ) : (
            <div className="empty-message">
              <Search size={24} />
              <p>Start typing to search for movies</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateList({ isEditing }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    backdrop: null,
    thumbnail: null,
    movies: [],
  });
  const [previews, setPreviews] = useState({
    backdrop: null,
    thumbnail: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      if (location.state?.list) {
        const { list } = location.state;
        console.log(list);
        setFormData({
          name: list.name,
          description: list.description,
          backdrop: null,
          thumbnail: null,
          movies: list.movies,
        });
        setPreviews({
          backdrop: list.backdrop,
          thumbnail: list.thumbnail,
        });
      } else {
        // If we don't have list data in state, fetch it
        const fetchList = async () => {
          try {
            const response = await axiosClient.get(`/lists/${id}`);
            const list = response.data;
            setFormData({
              name: list.name,
              description: list.description,
              backdrop: null,
              thumbnail: null,
              movies: list.movies.map((movie) => ({
                ...movie,
                id: movie.tmdb_id,
                poster_preview_url: movie.poster_url,
              })),
            });
            setPreviews({
              backdrop: list.backdrop,
              thumbnail: list.thumbnail,
            });
          } catch (error) {
            console.error("Error fetching list:", error);
            navigate("/lists");
          }
        };
        fetchList();
      }
    }
  }, [isEditing, location.state, id, navigate]);

  const handleImageSelect = (type) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Ensure we're storing the actual File object
        setFormData((prev) => ({
          ...prev,
          [type]: file,
        }));

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => ({
            ...prev,
            [type]: e.target.result,
          }));
          setErrors((prev) => ({ ...prev, [type]: "" }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "List name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!isEditing) {
      if (!formData.thumbnail)
        newErrors.thumbnail = "Please select a thumbnail";
      if (!formData.backdrop) newErrors.backdrop = "Please select a backdrop";
    }
    if (formData.movies.length === 0)
      newErrors.movies = "Add at least one movie";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);

      // Handle file uploads with explicit null if no new file
      if (formData.thumbnail) {
        formDataToSend.append("thumbnail", formData.thumbnail);
      } else if (!isEditing) {
        formDataToSend.append("thumbnail", "");
      }

      if (formData.backdrop) {
        formDataToSend.append("backdrop", formData.backdrop);
      } else if (!isEditing) {
        formDataToSend.append("backdrop", "");
      }

      // Map movies to include both tmdb_id and id for existing movies
      const movieIds = formData.movies.map((movie) => movie.tmdb_id);
      formDataToSend.append("movie_ids", JSON.stringify(movieIds));

      let response;
      if (isEditing) {
        response = await axiosClient.patch(`/lists/${id}/`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axiosClient.post("/lists/", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      navigate(`/lists/${response.data.id}`);
    } catch (error) {
      console.error("Error saving list:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-list-page">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="nav-button">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1>{isEditing ? "Edit List" : "Create New List"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="create-list-form">
        <div className="backdrop-section">
          {previews.backdrop ? (
            <img
              src={previews.backdrop}
              alt="Backdrop"
              className="backdrop-preview"
            />
          ) : (
            <div className="backdrop-placeholder">
              <Camera size={48} />
              <span>Select Backdrop Image</span>
            </div>
          )}
          <button
            type="button"
            className="image-select-button"
            onClick={() => handleImageSelect("backdrop")}
          >
            <Camera size={20} />
          </button>
          {errors.backdrop && (
            <span className="error-message">{errors.backdrop}</span>
          )}
        </div>

        <div className="thumbnail-section">
          {previews.thumbnail ? (
            <img
              src={previews.thumbnail}
              alt="Thumbnail"
              className="thumbnail-preview"
            />
          ) : (
            <div className="thumbnail-placeholder">
              <Camera size={32} />
              <span>Select Thumbnail</span>
            </div>
          )}
          <button
            type="button"
            className="image-select-button"
            onClick={() => handleImageSelect("thumbnail")}
          >
            <Camera size={20} />
          </button>
          {errors.thumbnail && (
            <span className="error-message">{errors.thumbnail}</span>
          )}
        </div>

        <div className="form-content">
          <div className="form-group">
            <label htmlFor="name">List Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="Enter a name for your list..."
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
                setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder="Write about your list..."
              rows={4}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="movies-section">
            <div className="section-header">
              <h2>Movies</h2>
              <button
                type="button"
                className="add-movie-button"
                onClick={() => setShowMovieSearch(true)}
              >
                <Plus size={20} />
                <span>Add Movie</span>
              </button>
            </div>

            {formData.movies.length > 0 ? (
              <div className="selected-movies">
                {formData.movies.map((movie) => (
                  <div key={movie.id} className="selected-movie">
                    <img
                      src={movie.poster_preview_url}
                      alt={movie.title}
                      className="movie-poster"
                    />
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <span>{movie.year}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          movies: prev.movies.filter(
                            (m) => m.tmdb_id !== movie.tmdb_id
                          ),
                        }));
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-movies">
                <Film size={24} />
                <p>No movies added yet</p>
              </div>
            )}
            {errors.movies && (
              <span className="error-message">{errors.movies}</span>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="spin" size={20} />
                <span>{isEditing ? "Saving List..." : "Creating List..."}</span>
              </>
            ) : (
              <>
                <Film size={20} />
                <span>{isEditing ? "Save List" : "Create List"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <MovieSearchModal
        isOpen={showMovieSearch}
        onClose={() => setShowMovieSearch(false)}
        onSelect={(movie) => {
          setFormData((prev) => ({
            ...prev,
            movies: [...prev.movies, movie],
          }));
          setErrors((prev) => ({ ...prev, movies: "" }));
        }}
        selectedMovies={formData.movies}
      />
    </div>
  );
}

export default CreateList;
