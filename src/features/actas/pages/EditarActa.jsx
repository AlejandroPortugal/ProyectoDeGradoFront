import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import './EditarActa.css';
import Header from '../../../components/Header.jsx';
import { useNavigate } from 'react-router-dom';
import { getEstudiantes } from '../../estudiantes/services/Estudiante.service.jsx';

const EditarActa = () => {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEstudiantes();
      const studentsWithId = response.data.map((student) => ({
        ...student,
        uniqueId: `${student.idcurso}-${student.nivel}-${student.idestudiante}`,
        curso: student.nombrecurso ? `${student.nombrecurso}` : `Curso desconocido (${student.idcurso})`,
      }));
      setStudents(studentsWithId);
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredRows = useMemo(
    () =>
      students.filter((student) =>
        `${student.nombres} ${student.apellidopaterno} ${student.apellidomaterno}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [students, search]
  );

  const totalStudents = students.length;
  const filteredCount = filteredRows.length;

  const columns = [
    { field: 'nombres', headerName: 'Nombre', flex: 1 },
    { field: 'apellidopaterno', headerName: 'Apellido', flex: 1 },
    { field: 'curso', headerName: 'Curso', flex: 0.5 },
    { field: 'nivel', headerName: 'Nivel', flex: 0.5 },
    {
      field: 'acciones',
      headerName: 'Actas del estudiante',
      flex: 0.8,
      renderCell: (params) => (
        <div className="acciones-buttons">
          <button
            className="ver-button"
            type="button"
            onClick={() =>
              navigate('/verActas', {
                state: { idestudiante: params.row.idestudiante },
              })
            }
          >
            Ver carpeta
          </button>
        </div>
      ),
    },
  ];

  const descripcionTabla =
    filteredCount === totalStudents
      ? 'Mostrando todas las carpetas disponibles.'
      : `Mostrando ${filteredCount} de ${totalStudents} carpetas.`;

  return (
    <>

      <main className="editar-acta-layout">
        <section className="editar-acta-hero">
          <div className="editar-acta-hero__content">
            <span className="editar-acta-hero__eyebrow">Carpetas digitales</span>
            <h1>Consulta y gestiona las actas existentes</h1>
            <p>
              Busca al estudiante, revisa su historial y mantenga la trazabilidad de cada reunion realizada. Todo en un
              solo lugar y listo para usarse desde cualquier dispositivo.
            </p>
            <div className="editar-acta-hero__actions">
              <div className="editar-acta-hero__input-group">
                <label htmlFor="search-acta">Buscar estudiante</label>
                <input
                  id="search-acta"
                  type="text"
                  placeholder="Ingresa nombres o apellidos"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="button" className="editar-acta-btn" onClick={fetchStudents} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar lista'}
              </button>
            </div>
          </div>
          <div className="editar-acta-hero__highlight">
            <span>Carpetas disponibles</span>
            <strong>{filteredCount}</strong>
            <p>{`de ${totalStudents} estudiantes registrados`}</p>
            <small>{loading ? 'Sincronizando datos...' : 'Filtro aplicado correctamente'}</small>
          </div>
        </section>

        <section className="editar-acta-panel">
          <header className="editar-acta-panel__header">
            <div>
              <h2>Listado de carpetas</h2>
              <p>{descripcionTabla}</p>
            </div>
          </header>
          <div className="editar-acta-panel__table-wrapper">
            <Paper className="editar-acta-panel__table">
              {loading ? (
                <div className="editar-acta-panel__empty">
                  <span className="editar-acta-loader" aria-hidden="true" />
                  <p>Cargando estudiantes...</p>
                </div>
              ) : (
                <DataGrid
                  rows={filteredRows}
                  columns={columns}
                  pageSize={7}
                  rowsPerPageOptions={[7]}
                  autoHeight
                  disableSelectionOnClick
                  getRowId={(row) => row.uniqueId}
                />
              )}
            </Paper>
          </div>
        </section>
      </main>
    </>
  );
};

export default EditarActa;

