import React from "react";
import PropTypes from "prop-types";
import "./RoundedActionButton.css";

const RoundedActionButton = ({
  icon,
  label,
  onClick,
  disabled,
  variant = "default",
  title,
}) => (
  <button
    type="button"
    className={`rounded-action-btn rounded-action-btn--${variant}`}
    onClick={onClick}
    disabled={disabled}
    title={title || label}
    aria-label={label}
  >
    {typeof icon === "string" ? <img src={icon} alt={label} /> : icon}
  </button>
);

RoundedActionButton.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "success", "danger", "whatsapp"]),
  title: PropTypes.string,
};

RoundedActionButton.defaultProps = {
  onClick: undefined,
  disabled: false,
  variant: "default",
  title: "",
};

export default RoundedActionButton;
