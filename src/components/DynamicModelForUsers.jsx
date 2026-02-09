import React from 'react';
import './DynamicModalForUsers.css';

const DynamicModelForUsers = ({
  isOpen,
  title,
  content,
  onClose,
  onSave,
  onCancel,
  onConfirm,
  showDescription = false,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleDismiss = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="users-modal__overlay">
      <div className="users-modal__content">
        <button
          type="button"
          className="users-modal__close"
          onClick={handleDismiss}
          aria-label="Cerrar modal"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <header className="users-modal__header">
          <span className="users-modal__badge">Gestion de usuarios</span>
          <h2 className="users-modal__title">{title}</h2>
          {showDescription && (
            <p className="users-modal__description">
              Puedes actualizar los campos y guardar los cambios cuando estes listo.
            </p>
          )}
        </header>

        <div className="users-modal__body">
          <div className="users-modal__body-inner">{content}</div>
        </div>

        <div className="users-modal__actions">
          {onSave && (
            <button type="button" className="users-modal__btn users-modal__btn--primary" onClick={onSave}>
              Guardar cambios
            </button>
          )}

          {onConfirm && !onSave && (
            <button
              type="button"
              className="users-modal__btn users-modal__btn--confirm"
              onClick={onConfirm}
            >
              Confirmar
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              className="users-modal__btn users-modal__btn--danger"
              onClick={onCancel}
            >
              Cancelar
            </button>
          )}

          {!onSave && !onCancel && onClose && (
            <button
              type="button"
              className="users-modal__btn users-modal__btn--ghost"
              onClick={onClose}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicModelForUsers;
