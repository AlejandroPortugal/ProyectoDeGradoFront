import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header.jsx';
import Toast from '../../../components/Toast.jsx';
import { getEstudiantes } from '../../estudiantes/services/Estudiante.service.jsx';
import './VerificacionActas.css';

const formatBirthDate = (value) => {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStudentBirthDate = (student) =>
  student?.fechanacimiento ??
  student?.fechaNacimiento ??
  student?.fechadenacimiento ??
  student?.fecha_nacimiento ??
  null;

const buildStudentName = (student) =>
  [student?.nombres, student?.apellidopaterno, student?.apellidomaterno]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const VerificacionActas = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const response = await getEstudiantes();
        const activeStudents = Array.isArray(response.data)
          ? response.data.filter((student) => student?.estado !== false)
          : [];
        setStudents(activeStudents);
      } catch (error) {
        console.error('Error al obtener los estudiantes:', error);
        setToast({
          show: true,
          message: 'No se pudo cargar la lista de estudiantes.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return students;

    return students.filter((student) => {
      const fullName = buildStudentName(student).toLowerCase();
      const birthDate = String(student?.fechanacimiento || '').toLowerCase();
      return fullName.includes(normalizedSearch) || birthDate.includes(normalizedSearch);
    });
  }, [search, students]);

  const handleViewActas = (student) => {
    navigate(`/verificacion-actas/${student.idestudiante}/actas`, {
      state: {
        idestudiante: student.idestudiante,
        estudiante: student,
      },
    });
  };

  return (
    <>
      <main className="verificacion-actas-layout">
        <section className="verificacion-actas-hero">
          <div className="verificacion-actas-hero__content">
            <span className="verificacion-actas-hero__eyebrow">Gestion de actas</span>
            <h1>Control de estudiantes con actas</h1>
            <p>
              Desde este modulo puedes revisar por estudiante todas las actas
              registradas y luego validar su contenido en detalle.
            </p>
          </div>
          <div className="verificacion-actas-hero__meta">
            <article className="verificacion-actas-stat">
              <span>Estudiantes activos</span>
              <strong>{students.length}</strong>
            </article>
            <article className="verificacion-actas-stat">
              <span>Resultados filtrados</span>
              <strong>{filteredStudents.length}</strong>
            </article>
          </div>
        </section>

        <section className="verificacion-actas-panel">
          <div className="verificacion-actas-toolbar">
            <div className="verificacion-actas-search">
              <label htmlFor="search-student-actas">Buscar estudiante</label>
              <input
                id="search-student-actas"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre o fecha de nacimiento"
              />
            </div>
          </div>

          {loading ? (
            <div className="verificacion-actas-empty">Cargando estudiantes...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="verificacion-actas-empty">
              No se encontraron estudiantes para la busqueda actual.
            </div>
          ) : (
            <div className="verificacion-actas-table-wrap">
              <table className="verificacion-actas-table">
                <thead>
                  <tr>
                    <th>Nombre del estudiante</th>
                    <th>Fecha de nacimiento</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.idestudiante}>
                      <td>{buildStudentName(student) || 'Sin nombre'}</td>
                      <td>{formatBirthDate(getStudentBirthDate(student))}</td>
                      <td>
                        <button
                          type="button"
                          className="verificacion-actas-btn"
                          onClick={() => handleViewActas(student)}
                        >
                          Ver actas
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'info' })}
        />
      )}
    </>
  );
};

export default VerificacionActas;
