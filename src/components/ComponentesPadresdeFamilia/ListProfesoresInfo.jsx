import React, { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import MenuPadres from "./MenuPadres";
import { getProfesoresConHorarios } from "../../servicios/profesor.service.jsx";
import DynamicModelForUsers from "../DynamicModelForUsers.jsx";
import "./ListProfesoresInfo.css";

const ListProfesoresInfo = () => {
  const [profesores, setProfesores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const itemsPerPage = 8; // Número de filas por página
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfesor, setSelectedProfesor] = useState(null);

  useEffect(() => {
    // Llamar al servicio para obtener profesores con horarios
    const fetchProfesores = async () => {
      try {
        const response = await getProfesoresConHorarios();
        setProfesores(response.data); // Asigna los datos obtenidos
      } catch (error) {
        console.error("Error al obtener la lista de profesores:", error);
      }
    };

    fetchProfesores();
  }, []);

  // Calcular los datos para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = profesores.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Calcular el total de páginas
  const totalPages = Math.ceil(profesores.length / itemsPerPage);

  // Manejar la apertura del modal
  const handleViewDetails = (profesor) => {
    setSelectedProfesor(profesor);
    setIsModalOpen(true);
  };

  // Manejar el cierre del modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProfesor(null);
  };

  return (
    <Paper elevation={3} className="table-container-info">
      <MenuPadres />
      <h2 className="table-title">PROFESORES</h2>
      <div className="table-responsive">
        <table className="profesores-table">
          <thead>
            <tr>
              <th>Nombre del profesor</th>
              <th>Materia</th>
              <th>Día de entrevista</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((profesor) => (
                <tr key={profesor.idprofesor}>
                  <td>{profesor.nombre}</td>
                  <td>{profesor.materia}</td>
                  <td>{profesor.dia}</td>
                  <td>
                    <button
                      className="custom-button"
                      onClick={() => handleViewDetails(profesor)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  No hay profesores disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`pagination-button ${
                currentPage === index + 1 ? "active" : ""
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {isModalOpen && selectedProfesor && (
        <DynamicModelForUsers
          isOpen={isModalOpen}
          title="Detalles del Profesor"
          content={
            <div>
              <p>
                <strong>Nombre del profesor:</strong> {selectedProfesor.nombre}
              </p>
              <p><strong>Materia:</strong> {selectedProfesor.materia}</p>
              <p><strong>Día de entrevista:</strong> {selectedProfesor.dia}</p>
              <p>
                <strong>Correo electrónico:</strong> {selectedProfesor.email}
              </p>
              <p>
                <strong>Horario de entrevista:</strong>{" "}
                {selectedProfesor.horainicio} - {selectedProfesor.horafin}
              </p>
            </div>
          }
          onClose={handleCloseModal}
        />
      )}
    </Paper>
  );
};

export default ListProfesoresInfo;

