import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import logo from '../recursos/icons/logo.svg';

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`landing ${menuOpen ? 'menu-open' : ''}`}>
      <header className="landing__hero" id="inicio">
        <nav className="landing__nav">
          <div className="landing__brand">
            <img src={logo} alt="Instituto de Educaci&oacute;n Bancaria" />
            <div>
              <span className="landing__brand-name">Instituto de Educaci&oacute;n Bancaria</span>
              <span className="landing__brand-tagline">Excelencia en gesti&oacute;n financiera</span>
            </div>
          </div>
          <button
            type="button"
            className={`landing__nav-toggle ${menuOpen ? 'is-open' : ''}`}
            onClick={toggleMenu}
            aria-label="Abrir men&uacute;"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <div className={`landing__links ${menuOpen ? 'is-open' : ''}`}>
            <a href="#inicio" onClick={closeMenu}>Inicio</a>
            <a href="#mision" onClick={closeMenu}>Misi&oacute;n</a>
            <a href="#vision" onClick={closeMenu}>Visi&oacute;n</a>
            <a href="#noticias" onClick={closeMenu}>Noticias</a>
            <Link to="/login" className="landing__login" onClick={closeMenu}>
              Iniciar Sesi&oacute;n
            </Link>
          </div>
        </nav>
        <div className="landing__hero-content">
          <h1>Excelencia acad&eacute;mica con enfoque financiero</h1>
          <p>
            Bienvenidos al Instituto de Educaci&oacute;n Bancaria, un campus donde el liderazgo,
            la innovaci&oacute;n y los valores financieros se fusionan para potenciar el talento de
            nuestros estudiantes.
          </p>
          <div className="landing__hero-actions">
            <Link to="/login" className="landing__cta" onClick={closeMenu}>
              Ingresa a la plataforma
            </Link>
            <a href="#noticias" className="landing__secondary-btn" onClick={closeMenu}>
              Explorar novedades
            </a>
          </div>
          <ul className="landing__stats">
            <li>
              <span className="landing__stats-number">+30</span>
              <span className="landing__stats-label">A&ntilde;os formando especialistas</span>
            </li>
            <li>
              <span className="landing__stats-number">95%</span>
              <span className="landing__stats-label">Inserci&oacute;n laboral</span>
            </li>
            <li>
              <span className="landing__stats-number">50+</span>
              <span className="landing__stats-label">Convenios financieros</span>
            </li>
          </ul>
        </div>
      </header>

      <section className="landing__section" id="mision">
        <div className="landing__section-content">
          <h2>Nuestra Misi&oacute;n</h2>
          <p>
            Impulsar una formaci&oacute;n integral que desarrolle competencias financieras,
            tecnol&oacute;gicas y humanas, preparando a los estudiantes para liderar el sector
            bancario y empresarial con integridad y responsabilidad social.
          </p>
        </div>
        <div className="landing__section-media">
          <div className="landing__glow-card">
            <span>Programas acreditados</span>
            <strong>Educaci&oacute;n financiera con rigor internacional.</strong>
          </div>
        </div>
      </section>

      <section className="landing__section landing__section--alt" id="vision">
        <div className="landing__section-content">
          <h2>Nuestra Visi&oacute;n</h2>
          <p>
            Ser la instituci&oacute;n referente en educaci&oacute;n bancaria en la regi&oacute;n,
            formando profesionales innovadores que generen confianza y progreso en la econom&iacute;a
            global.
          </p>
        </div>
        <div className="landing__section-media">
          <div className="landing__glow-card">
            <span>Visi&oacute;n 2030</span>
            <strong>Transformar el sistema financiero con talento humano.</strong>
          </div>
        </div>
      </section>

      <section className="landing__section landing__pillars" id="pilares">
        <h2>Nuestros pilares</h2>
        <div className="landing__pillars-grid">
          <article>
            <h3>Innovaci&oacute;n bancaria</h3>
            <p>
              Curr&iacute;culos actualizados con tendencias fintech y banca digital para impulsar
              proyectos transformadores.
            </p>
          </article>
          <article>
            <h3>Liderazgo &eacute;tico</h3>
            <p>
              Promovemos decisiones financieras responsables que fortalezcan la confianza en el
              sistema econ&oacute;mico.
            </p>
          </article>
          <article>
            <h3>Conexi&oacute;n empresarial</h3>
            <p>
              Vinculamos a nuestros estudiantes con entidades financieras, asegurando experiencias
              reales desde los primeros semestres.
            </p>
          </article>
        </div>
      </section>

      <section className="landing__section" id="noticias">
        <h2>Noticias Recientes</h2>
        <div className="landing__news-grid">
          <article className="landing__news-card">
            <h3>Foro de Innovaci&oacute;n Financiera</h3>
            <p>
              Expertos del sector educacional, formamos jovenes lideres del mañana, con principios enfocados en resaltar los valores eticos y morales
              compartieron tendencias sobre banca digital y finanzas
              sostenibles junto a nuestros estudiantes.
            </p>
          </article>
          <article className="landing__news-card">
            <h3>Programa de bienestar financiero</h3>
            <p>
              Talleres de educaci&oacute;n financiera para familias fortalecen la cultura del
              ahorro y la planificaci&oacute;n responsable.
            </p>
          </article>
          <article className="landing__news-card">
            <h3>Alianzas internacionales</h3>
            <p>
              Nuevos convenios permiten intercambios acad&eacute;micos con instituciones l&iacute;deres en
              finanzas y negocios.
            </p>
          </article>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-brand">
          <img src={logo} alt="Logo Instituto de Educaci&oacute;n Bancaria" />
          <div>
            <strong>Instituto de Educaci&oacute;n Bancaria</strong>
            <p>Formando jovenes con solvencia &eacute;tica, principios y valores.</p>
          </div>
        </div>
        <div className="landing__footer-links">
          <span>Calle Victor Eduardo 123 &bull; Ciudad de La Paz - Bolivia</span>
          <span>Tel. (01) 555-0101</span>
          <span>institutobancario@gmail.com</span>
        </div>
        <p className="landing__footer-copy">
          &copy; {new Date().getFullYear()} Instituto de Educaci&oacute;n Bancaria. Todos los derechos reservados.
        </p>
      </footer>

      <button
        type="button"
        className={`landing__overlay ${menuOpen ? 'is-visible' : ''}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
        tabIndex={menuOpen ? 0 : -1}
      />
    </div>
  );
};

export default LandingPage;

