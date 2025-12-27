import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MenuPadres from './MenuPadres';
import { getProfesoresConHorarios } from '../../servicios/profesor.service.jsx';
import './ListaProfesoresEntrevistas.css';

const ListaProfesoresEntrevista = () => {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const response = await getProfesoresConHorarios();
        setRows(response.data);
      } catch (error) {
        console.error('Error al cargar profesores con horarios:', error);
      }
    };

    fetchProfesores();
  }, []);

  const handleNavigate = (row) => {
    const isPsicologo = row.materia === "Psicólogo";

    navigate('/agendarEntrevistaPadre', {
      state: {
        idProfesor: isPsicologo ? null : row.id, // Enviar idProfesor solo si no es psicólogo
        idPsicologo: isPsicologo ? row.id : null, // Enviar idPsicologo solo si es psicólogo
        nombre: row.nombre,
        materia: row.materia,
        dia: row.dia,
        horainicio: row.horainicio,
        horafin: row.horafin,
      },
    });
  };

  return (
    <div className="container-scrollable">
      <MenuPadres />
      <Paper elevation={3} className="table-container">
        <h1 className="title">SELECCIONE EL PROFESOR O PSICÓLOGO</h1>
        <div className="table-scrollable">
          <table className="interview-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Materia</th>
                <th>Día de entrevista</th>
                <th>Agendar una cita</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.tipo}-${row.id}`}>
                  <td>{row.nombre}</td>
                  <td>{row.materia}</td>
                  <td>{row.dia}</td>
                  <td>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      className="button-go"
                      onClick={() => handleNavigate(row)}
                    >
                      Ir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Paper>
    </div>
  );
};

export default ListaProfesoresEntrevista;

