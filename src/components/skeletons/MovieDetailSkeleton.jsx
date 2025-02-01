import { Loader } from "lucide-react";
import "./MovieDetailSkeleton.css";

function MovieDetailSkeleton() {
  return (
    <div className="movie-detail-container">
      {/* Backdrop Skeleton */}
      <div className="movie-backdrop skeleton">
        <div className="backdrop-overlay"></div>
      </div>

      <div className="content-container">
        <div className="movie-detail-content">
          {/* Poster and Title Section */}
          <div className="movie-detail-main">
            <div className="movie-poster-large skeleton"></div>

            <div className="movie-info-detailed">
              {/* Title Skeleton */}
              <div
                className="skeleton-text"
                style={{ width: "60%", height: "2rem" }}
              ></div>
              <div
                className="skeleton-text"
                style={{ width: "40%", height: "1.5rem", marginTop: "0.5rem" }}
              ></div>

              {/* Overview Skeleton */}
              <div
                className="skeleton-text"
                style={{ width: "100%", height: "4rem", marginTop: "1rem" }}
              ></div>

              {/* Genres Skeleton */}
              <div className="genres" style={{ marginTop: "1rem" }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="genre-tag skeleton"
                    style={{ width: "80px" }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="metadata-section">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="metadata-item skeleton">
                <div className="skeleton-circle"></div>
                <div className="skeleton-text" style={{ width: "60px" }}></div>
                <div className="skeleton-text" style={{ width: "40px" }}></div>
              </div>
            ))}
          </div>

          {/* Action Buttons Skeleton */}
          <div className="action-buttons">
            <div className="action-row">
              <div className="action-button skeleton"></div>
            </div>
            <div className="action-row">
              <div className="action-button skeleton"></div>
              <div className="action-button skeleton"></div>
            </div>
          </div>

          {/* Cast Section Skeleton */}
          <div className="cast-section">
            <div className="cast-header">
              <div className="skeleton-text" style={{ width: "100px" }}></div>
            </div>
            <div className="cast-list">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="cast-member skeleton">
                  <div className="cast-image-container skeleton"></div>
                  <div className="skeleton-text" style={{ width: "80%" }}></div>
                  <div className="skeleton-text" style={{ width: "60%" }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailSkeleton;
