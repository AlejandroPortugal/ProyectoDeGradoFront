import React from 'react';
import './InicioPadres.css';
import directoraImg from '../../../recursos/image/Directora.jpg';
import docentesImg from '../../../recursos/image/Profesores.png';
import campeonatosImg from '../../../recursos/image/Campeonatos.jpg';
import desfilesImg from '../../../recursos/image/desfiles.jpg';
import ecoclubesImg from '../../../recursos/image/Ecocubles.png';
import estudiantesImg from '../../../recursos/image/Estudiantes.png';
import logo from '../../../recursos/icons/logo.svg';
import MenuPadres from '../components/MenuPadres.jsx';

const InicioPadres = () => {
  return (
    <div className="inicio-padres-container">
      <MenuPadres />

      <div className="inicio-content">
        <section className="hero">
          <div className="hero-brand">
            <img className="hero-logo" src={logo} alt="IDEB" />
            <div>
              <span className="hero-eyebrow">Comunidad IDEB</span>
              <h1 className="titulo-principal">Bienvenidos padres de familia</h1>
            </div>
          </div>
          <p className="hero-subtitle">
            Agradecemos su confianza en el Instituto de Educacion Bancaria. Este espacio esta pensado
            para acompanar el proceso educativo de sus hijos con informacion clara y atencion oportuna.
          </p>
        </section>

        <section className="mission-vision">
          <article className="mv-card">
            <h2>Mision</h2>
            <p>
              Brindar a la sociedad boliviana, jovenes de excelencia y satisfacer necesidades e
              intereses de formacion intelectual en el area de Contaduria General (Instituto de
              Educacion Bancaria, 2015)
            </p>
          </article>
          <article className="mv-card">
            <h2>Vision</h2>
            <p>
              Ser una Institucion innovadora de prestigio nacional, estrechamente vinculada con su
              medio, forjadora de ciudadanos con pensamiento critico, etica y calidad profesional,
              que tengan la capacidad de enfrentar los desafios de un mundo globalizado y cambiante.
              (Instituto de Educacion Bancaria, 2015)
            </p>
          </article>
        </section>

        {/* Seccion de informacion principal */}
        <div className="contenido">
          <div className="card animate-on-scroll">
            <img src={directoraImg} alt="Directora General" className="imagen" />
            <p className="nombre">Marta Mendez</p>
            <p className="cargo">Directora General</p>
          </div>
          <div className="descripcion animate-on-scroll">
            <p>
              La Unidad educativa Instituto de Educacion Bancaria es una institucion comprometida con
              la formacion integral de los estudiantes, promoviendo valores y excelencia academica.
            </p>
          </div>
          <div className="card animate-on-scroll">
            <img src={docentesImg} alt="Personal Docente" className="imagen" />
            <p className="nombre">Personal Docente</p>
            <p className="cargo">Administrativo</p>
          </div>
        </div>

        {/* Separador */}
        <div className="separador"></div>

        {/* Seccion de actividades */}
        <h2 className="titulo-actividades">Actividades y vida institucional</h2>
        <div className="actividades">
          <div className="card animate-on-scroll">
            <img src={campeonatosImg} alt="Campeonatos" className="imagen" />
            <p className="nombre">Campeonatos</p>
            <p className="descripcion-actividad">Eventos deportivos para fomentar la sana competencia.</p>
          </div>
          <div className="card animate-on-scroll">
            <img src={desfilesImg} alt="Desfiles" className="imagen" />
            <p className="nombre">Desfiles</p>
            <p className="descripcion-actividad">
              Participacion en eventos civicos y culturales. El Instituto de educacion bancaria tiene
              una gran banda de musica premiada en el ano 2015, 2018 y 2019 como la mejor banda del
              departamento de La Paz, con participacion en el concurso nacional de bandas en
              Cochabamba.
            </p>
          </div>
          <div className="card animate-on-scroll">
            <img src={ecoclubesImg} alt="Ecoclubes" className="imagen" />
            <p className="nombre">Ecoclubes</p>
            <p className="descripcion-actividad">
              Los estudiantes de ultimos anos realizan servicio en diversos establecimientos, como el
              albergue de abuelitos San Ramon y participan de actividades de reforestacion en los
              Ecoclubes.
            </p>
          </div>
          <div className="card animate-on-scroll">
            <img src={estudiantesImg} alt="Estudiantes" className="imagen" />
            <p className="nombre">Participacion Estudiantil</p>
            <p className="descripcion-actividad">Fomento de liderazgo y trabajo en equipo.</p>
          </div>
        </div>
      </div>

      <footer className="inicio-footer">
        <div className="footer-inner">
          <div className="footer-main">
            <img className="footer-logo" src={logo} alt="IDEB" />
            <div>
              <h3>Contactanos</h3>
              <p>
                Para cualquier duda o consulta puedes contactarnos a traves de las siguientes
                referencias. Con gusto atenderemos todas tus consultas.
              </p>
            </div>
          </div>
          <div className="footer-grid">
            <div>
              <span className="footer-label">Horario de atencion:</span>
              <span>07:30 a 13:30</span>
            </div>
            <div>
              <span className="footer-label">Telefono:</span>
              <span>24597455</span>
            </div>
            <div>
              <span className="footer-label">Celular:</span>
              <span>71564821</span>
            </div>
            <div>
              <span className="footer-label">Direccion:</span>
              <span>Calle Victor Eduardo Nro 5168</span>
            </div>
            <div>
              <span className="footer-label">Email:</span>
              <span>ideb@gmail.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InicioPadres;
