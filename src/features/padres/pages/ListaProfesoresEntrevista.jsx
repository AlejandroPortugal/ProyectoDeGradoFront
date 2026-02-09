import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MenuPadres from '../components/MenuPadres.jsx';
import { getProfesoresConHorarios } from '../../profesores/services/profesor.service.jsx';
import logo from '../../../recursos/icons/logo.svg';
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

  const psicologosCount = rows.filter((row) =>
    String(row.tipo || row.materia || "").toLowerCase().includes("psicolog")
  ).length;
  const profesoresCount = rows.filter((row) =>
    String(row.tipo || "").toLowerCase().includes("profesor")
  ).length || Math.max(rows.length - psicologosCount, 0);

  return (
    <div className="container-scrollable">
      <MenuPadres />
      <section className="hero">
        <div className="hero-logo">
          <img src={logo} alt="IDEB" />
          <span>IDEB</span>
        </div>
        <div className="hero-copy">
          <span className="hero-eyebrow">Agenda de entrevistas</span>
          <h1 className="hero-title">Elige a quien deseas entrevistar</h1>
          <p className="hero-subtitle">
            Encuentra al profesor o psicologo disponible y agenda tu cita en pocos pasos.
          </p>
        </div>
        <div className="hero-cards">
          <div className="hero-card">
            <span className="hero-card-label">Profesores</span>
            <strong className="hero-card-value">{profesoresCount}</strong>
          </div>
          <div className="hero-card">
            <span className="hero-card-label">Psicologos</span>
            <strong className="hero-card-value">{psicologosCount}</strong>
          </div>
          <div className="hero-card hero-card--accent">
            <span className="hero-card-label">Total disponibles</span>
            <strong className="hero-card-value">{rows.length}</strong>
          </div>
        </div>
      </section>
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
                  <td data-label="Nombre">{row.nombre}</td>
                  <td data-label="Materia">{row.materia}</td>
                  <td data-label="Dia de entrevista">{row.dia}</td>
                  <td data-label="Agendar cita">
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

