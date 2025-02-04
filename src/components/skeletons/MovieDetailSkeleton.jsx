import "./MovieDetailSkeleton.css";

function MovieDetailSkeleton() {
  return (
    <div className="movie-detail-container">
      {/* Backdrop Skeleton */}
      <div className="movie-backdrop skeleton-backdrop">
        <div className="backdrop-overlay"></div>
        <div className="movie-nav">
          <div className="nav-button skeleton-button">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text" style={{ width: "60px" }}></div>
          </div>
          <div className="nav-button skeleton-button">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text" style={{ width: "40px" }}></div>
          </div>
        </div>
      </div>

      <div className="content-container">
        <div className="movie-detail-content">
          {/* Poster and Title Section */}
          <div className="movie-detail-main">
            <div className="movie-poster-large skeleton-poster"></div>

            <div className="movie-info-detailed">
              {/* Title and Original Title Skeleton */}
              <div className="skeleton-text skeleton-title"></div>
              <div className="skeleton-text skeleton-subtitle"></div>

              {/* Overview Skeleton */}
              <div className="skeleton-text-group">
                <div className="skeleton-text skeleton-line"></div>
                <div className="skeleton-text skeleton-line"></div>
                <div className="skeleton-text skeleton-line"></div>
              </div>

              {/* Genres Skeleton */}
              <div className="genres">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="genre-tag skeleton-tag"></div>
                ))}
              </div>

              {/* Directors Section Skeleton */}
              <div className="directors-section">
                <div
                  className="skeleton-text"
                  style={{ width: "100px", marginBottom: "1rem" }}
                ></div>
                <div className="directors-list">
                  {[1, 2].map((i) => (
                    <div key={i} className="director-item">
                      <div className="director-image-container skeleton-avatar"></div>
                      <div
                        className="skeleton-text"
                        style={{ width: "80px" }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="metadata-section">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="metadata-item">
                <div className="skeleton-icon"></div>
                <div className="skeleton-text" style={{ width: "50px" }}></div>
                <div className="skeleton-text" style={{ width: "30px" }}></div>
              </div>
            ))}
          </div>

          {/* Action Buttons Skeleton */}
          <div className="action-buttons">
            <div className="action-row">
              <div className="action-button skeleton-button">
                <div className="skeleton-icon"></div>
                <div className="skeleton-text" style={{ width: "100px" }}></div>
              </div>
            </div>
            <div className="action-row">
              <div className="action-button skeleton-button">
                <div className="skeleton-icon"></div>
                <div className="skeleton-text" style={{ width: "120px" }}></div>
              </div>
              <div className="action-button skeleton-button">
                <div className="skeleton-icon"></div>
                <div className="skeleton-text" style={{ width: "80px" }}></div>
              </div>
            </div>
          </div>

          {/* Cast Section Skeleton */}
          <div className="cast-section">
            <div className="cast-header">
              <div className="skeleton-text" style={{ width: "80px" }}></div>
              <div className="see-all">
                <div className="skeleton-text" style={{ width: "60px" }}></div>
                <div className="skeleton-icon"></div>
              </div>
            </div>
            <div className="cast-list">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="cast-member">
                  <div className="cast-image-container skeleton-avatar"></div>
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
