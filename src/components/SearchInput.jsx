import { Search as SearchIcon, Loader } from "lucide-react";
import "../styles/SearchInput.css";

function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  isLoading = false,
  showButton = true,
  containerClassName = "",
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`search-form ${containerClassName}`}
    >
      <div className="search-input-wrapper">
        <SearchIcon size={20} />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
      {showButton && (
        <button type="submit" className="search-button" disabled={isLoading}>
          {isLoading ? <Loader className="spin" size={20} /> : "Search"}
        </button>
      )}
    </form>
  );
}

export default SearchInput;
