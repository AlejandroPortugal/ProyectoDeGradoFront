import React, { useEffect } from "react";
import "./Toast.css";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className={`toast-container ${type}`} role="status" aria-live="polite">
      <p className="toast-text">{message}</p>
    </div>
  );
};

export default Toast;
