import React from 'react';
import './InicioPadres.css';
import directoraImg from '../../assets/image/Directora.jpg';
import docentesImg from '../../assets/image/Profesores.png';
import campeonatosImg from '../../assets/image/Campeonatos.jpg';
import desfilesImg from '../../assets/image/desfiles.jpg';
import ecoclubesImg from '../../assets/image/Ecocubles.png';
import estudiantesImg from '../../assets/image/Estudiantes.png';
import MenuPadres from './MenuPadres';

const InicioPadres = () => {
  return (
    <div className="inicio-padres-container">
      <MenuPadres />
      <h1 className="titulo-principal">BIENVENIDO ALEJANDRO! A LA PAGINA DEL IDEB</h1>

      {/* Sección de información principal */}
      <div className="contenido">
        <div className="card animate-on-scroll">
          <img src={directoraImg} alt="Directora General" className="imagen" />
          <p className="nombre">Marta Mendez</p>
          <p className="cargo">Directora General</p>
        </div>
        <div className="descripcion animate-on-scroll">
          <p>
            La Unidad educativa Instituto de Educación Bancaria es una institución comprometida con la formación integral de los estudiantes, promoviendo valores y excelencia académica.
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

      {/* Sección de actividades */}
      <h2 className="titulo-actividades">Algunas actividades de la Institución</h2>
      <div className="actividades">
        <div className="card animate-on-scroll">
          <img src={campeonatosImg} alt="Campeonatos" className="imagen" />
          <p className="nombre">Campeonatos</p>
          <p className="descripcion-actividad">Eventos deportivos para fomentar la sana competencia.</p>
        </div>
        <div className="card animate-on-scroll">
          <img src={desfilesImg} alt="Desfiles" className="imagen" />
          <p className="nombre">Desfiles</p>
          <p className="descripcion-actividad">Participación en eventos cívicos y culturales. El Instituto de educacion bancaria 
            tiene una gran banda de musica premiada en el año 2015, 2018 y 2019 como la mejor banda del departamento de La Paz. teniendo
            su participacion en el concurso nacional de bandas en Cochabambanba, 
          </p>
        </div>
        <div className="card animate-on-scroll">
          <img src={ecoclubesImg} alt="Ecoclubes" className="imagen" />
          <p className="nombre">Ecoclubes</p>
          <p className="descripcion-actividad">Los estudiantes de ultimos años realizan servicio en diversos establecimientos, como el albergue de abuelitos
            San Ramon y participan de actividades de reforestarion como actividades de los Ecocubles</p>
        </div>
        <div className="card animate-on-scroll">
          <img src={estudiantesImg} alt="Estudiantes" className="imagen" />
          <p className="nombre">Participación Estudiantil</p>
          <p className="descripcion-actividad">Fomento de liderazgo y trabajo en equipo.</p>
        </div>
      </div>
    </div>
  );
};

export default InicioPadres;
