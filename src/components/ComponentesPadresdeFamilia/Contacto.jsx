import React from "react";
import "./Contacto.css";
import logo from "../../recursos/icons/logo.svg";
import colegio1 from "../../recursos/icons/Colegio1.svg";
import colegio2 from "../../recursos/icons/Colegio2.svg";
import MenuPadres from "./MenuPadres";

const Contacto = () => {
  return (
    <div className="contacto-container">
      <MenuPadres />
      <div className="contacto-logo">
        <img src={logo} alt="Marca de agua" className="marca-agua" />
      </div>
      <div className="contacto-content">
        <h2>Contáctanos</h2>
        <p>
          Para cualquier duda o consulta puedes contactarnos a través de las
          siguientes referencias. ¡Con gusto atenderemos todas tus consultas!
        </p>
        <div className="contacto-info">
          <p>
            <strong>Horario de atención:</strong> 07:30 a 13:30
          </p>
          <p>
            <strong>Teléfono:</strong> 24597455
          </p>
          <p>
            <strong>Celular:</strong> 71564821
          </p>
          <p>
            <strong>Dirección:</strong> Calle Victor Eduardo Nro 5168
          </p>
          <p>
            <strong>Email:</strong> ideb@gmail.com
          </p>
        </div>
      </div>
      <div className="contacto-images">
        <img src={colegio1} alt="Imagen Colegio 1" className="colegio-img" />
        <img src={colegio2} alt="Imagen Colegio 2" className="colegio-img" />
      </div>
    </div>
  );
};

export default Contacto;

