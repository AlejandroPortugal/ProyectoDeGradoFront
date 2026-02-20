import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ open = false, title = 'Procesando informe', message = 'Generando documento...' }) => {
  if (!open) return null;

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-screen__card">
        <div className="loading-screen__spinner" aria-hidden="true" />
        <h3 className="loading-screen__title">{title}</h3>
        <p className="loading-screen__message">{message}</p>
        <div className="loading-screen__bar" aria-hidden="true" />
      </div>
    </div>
  );
};

export default LoadingScreen;
