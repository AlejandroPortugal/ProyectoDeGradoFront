import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Header from '../Header.jsx';
import { getEstudiantes } from '../../servicios/Estudiante.service.jsx';
import './ListEstudiantes.css';

function ListEstudiantes() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Recuperar el `idreservarentrevista` desde el estado pasado en la navegacion
  const idreservarentrevista = location.state?.idreservarentrevista;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEstudiantes();
      const studentsWithId = response.data.map((student) => ({
        ...student,
        uniqueId: `${student.idcurso}-${student.nivel}-${student.idestudiante}`,
        curso: student.nombrecurso ? `${student.nombrecurso} ` : `Curso desconocido (${student.idcurso})`,
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
    { field: 'curso', headerName: 'Curso', flex: 0.6 },
    { field: 'nivel', headerName: 'Nivel', flex: 0.5 },
    {
      field: 'accion',
      headerName: 'Accion',
      flex: 0.5,
      renderCell: (params) => (
        <button
          type="button"
          className="crear-button"
          onClick={() =>
            navigate('/formActa', {
              state: {
                idestudiante: params.row.idestudiante,
                idreservarentrevista,
              },
            })
          }
        >
          Crear
        </button>
      ),
    },
  ];

  const listadoDescripcion =
    filteredCount === totalStudents
      ? 'Mostrando todos los estudiantes disponibles.'
      : `Mostrando ${filteredCount} de ${totalStudents} estudiantes registrados.`;

  const coincidenciasTexto =
    filteredCount === totalStudents
      ? 'Coincidencias actuales: todos los estudiantes visibles.'
      : `Coincidencias actuales: ${filteredCount} resultados.`;

  return (
    <>
      <main className="estudiantes-layout">
        <section className="estudiantes-hero">
          <div className="estudiantes-hero__content">
            <span className="estudiantes-hero__eyebrow">Panel de profesores</span>
            <h1 className="estudiantes-hero__title">Gestiona tus actas con confianza</h1>
            <p className="estudiantes-hero__description">
              Visualiza el estado academico de cada estudiante y crea actas en minutos. Usa el buscador para
              encontrar rapidamente a la persona que necesitas.
            </p>
            <div className="estudiantes-hero__actions">
              <div className="estudiantes-hero__input-group">
                <label htmlFor="search" className="estudiantes-hero__label">
                  Busca un estudiante
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Ingresa nombres o apellidos"
                  className="estudiantes-hero__input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="button" className="estudiantes-btn" onClick={fetchStudents} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar lista'}
              </button>
            </div>
          </div>
          <div className="estudiantes-hero__highlight">
            <span className="estudiantes-hero__highlight-label">Actas registradas</span>
            <strong className="estudiantes-hero__highlight-value">{totalStudents}</strong>
            <p className="estudiantes-hero__highlight-description">Resumen total en el sistema</p>
            <small>{loading ? 'Sincronizando datos...' : coincidenciasTexto}</small>
          </div>
        </section>

        <section className="estudiantes-panel">
          <header className="estudiantes-panel__header">
            <div>
              <h2>Listado de estudiantes</h2>
              <p>{listadoDescripcion}</p>
            </div>
          </header>
          <div className="estudiantes-panel__table-wrapper">
            <Paper className="estudiantes-panel__table">
              {loading ? (
                <div className="estudiantes-panel__empty">
                  <span className="estudiantes-loader" aria-hidden="true" />
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
}

export default ListEstudiantes;

