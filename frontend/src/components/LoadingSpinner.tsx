import "./LoadingSpinner.css";

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="loading-spinner__ring" aria-hidden="true" />
      <p className="loading-spinner__text">Loading products...</p>
    </div>
  );
}
