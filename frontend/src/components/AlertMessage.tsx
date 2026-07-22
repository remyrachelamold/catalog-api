import "./AlertMessage.css";

interface AlertMessageProps {
  type: "success" | "error";
  message: string;
  onDismiss?: () => void;
}

export default function AlertMessage({
  type,
  message,
  onDismiss,
}: AlertMessageProps) {
  return (
    <div
      className={`alert-message alert-message--${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <p className="alert-message__text">{message}</p>
      {onDismiss && (
        <button
          type="button"
          className="alert-message__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          ×
        </button>
      )}
    </div>
  );
}
