import React from 'react';
import { Link } from 'react-router-dom';
import './Footes.css';

const defaultLinks = [
  { label: 'Contacto', to: '/contacto' },
  { label: 'Historial de citas', to: '/historialCitas' },
  { label: 'Preguntas frecuentes', to: '/preguntasFrecuentes' },
];

const Footes = ({
  title = 'IDEB',
  description = 'Agenda entrevistas de forma simple y da seguimiento a cada caso.',
  links = defaultLinks,
  note = 'Atencion de lunes a viernes, 08:00 a 16:00.',
}) => {
  return (
    <footer className="footes">
      <div className="footes__inner">
        <div className="footes__brand">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className="footes__section">
          <span>Accesos</span>
          <div className="footes__links">
            {links.map((link) => (
              <Link key={link.to} className="footes__link" to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="footes__section">
          <span>Ayuda</span>
          <p className="footes__text">{note}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footes;
