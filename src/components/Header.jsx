import React from 'react';
import BtnLogout from './BtnLogout';

import './Header.css';

const Header = ({ title, subtitle, actions }) => {
  return (
    <section className="header-container">
      <div className="header-titles">
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
      </div>
      <div className="header-tools">
        {actions && <div className="header-actions">{actions}</div>}
        <BtnLogout />
      </div>
    </section>
  );
};

export default Header;
