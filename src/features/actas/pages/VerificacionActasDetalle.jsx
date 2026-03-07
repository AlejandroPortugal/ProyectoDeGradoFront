import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/Header.jsx';
import DynamicModelForUsers from '../../../components/DynamicModelForUsers.jsx';
import Toast from '../../../components/Toast.jsx';
import {
  getActaReunionById,
  getActasReunionByEstudiante,
} from '../services/actas.service.jsx';
import { getEstudianteById } from '../../estudiantes/services/Estudiante.service.jsx';
import './VerificacionActas.css';

const formatDate = (value) => {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const buildStudentName = (student) =>
  [student?.nombres, student?.apellidopaterno, student?.apellidomaterno]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const getStudentBirthDate = (student) =>
  student?.fechanacimiento ??
  student?.fechaNacimiento ??
  student?.fechadenacimiento ??
  student?.fecha_nacimiento ??
  null;

const getDocenteName = (acta) =>
  acta?.docente_nombre ||
  acta?.docenteNombre ||
  acta?.profesor ||
  acta?.profesional ||
  acta?.usuariomodificacion ||
  'Sin registro';

const VerificacionActasDetalle = () => {
  const { idestudiante } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [student, setStudent] = useState(location.state?.estudiante || null);
  const [actas, setActas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActa, setSelectedActa] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const studentId = useMemo(() => Number(idestudiante), [idestudiante]);

  const loadStudent = useCallback(async () => {
    if (!studentId) return;
    try {
      const response = await getEstudianteById(studentId);
      setStudent(response.data);
    } catch (error) {
      console.error('Error al obtener el estudiante:', error);
      setToast({
        show: true,
        message: 'No se pudo cargar la informacion del estudiante.',
        type: 'error',
      });
    }
  }, [studentId]);

  const loadActas = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const response = await getActasReunionByEstudiante(studentId);
      const actasActivas = Array.isArray(response.data)
        ? response.data.filter((acta) => acta?.estado !== false)
        : [];
      setActas(actasActivas);
    } catch (error) {
      console.error('Error al obtener las actas del estudiante:', error);
      setToast({
        show: true,
        message: 'No se pudo cargar la lista de actas del estudiante.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  useEffect(() => {
    loadActas();
  }, [loadActas]);

  const handleBack = () => {
    navigate('/verificacion-actas');
  };

  const handleViewDetail = async (acta) => {
    try {
      const response = await getActaReunionById(acta.idacta);
      const detail = response.data || {};
      setSelectedActa({
        ...acta,
        ...detail,
      });
      setDetailOpen(true);
    } catch (error) {
      console.error('Error al obtener el detalle del acta:', error);
      setToast({
        show: true,
        message: 'No se pudo cargar el detalle del acta.',
        type: 'error',
      });
    }
  };

  const studentName = buildStudentName(student) || 'Estudiante no identificado';

  const detailContent = selectedActa ? (
    <div className="verificacion-actas-detail">
      <div className="verificacion-actas-detail__grid">
        <div>
          <span>Materia</span>
          <strong>{selectedActa.materia || 'Sin registro'}</strong>
        </div>
        <div>
          <span>Profesor</span>
          <strong>{getDocenteName(selectedActa)}</strong>
        </div>
        <div>
          <span>Fecha de creacion</span>
          <strong>{formatDate(selectedActa.fechadecreacion)}</strong>
        </div>
        <div>
          <span>Motivo</span>
          <strong>{selectedActa.motivo || 'Sin registro'}</strong>
        </div>
      </div>

      <section className="verificacion-actas-detail__section">
        <h3>Descripcion principal</h3>
        <p>{selectedActa.descripcion || 'No existe una descripcion registrada.'}</p>
      </section>

      <section className="verificacion-actas-detail__section verificacion-actas-detail__section--compare">
        <div>
          <h3>Descripcion de creacion</h3>
          <p>{selectedActa.descripcioncampo || 'No existe registro de cambios previos.'}</p>
        </div>
        <div>
          <h3>Descripcion de modificacion</h3>
          <p>
            {selectedActa.descripcioncampoactualizado ||
              'No existe una actualizacion registrada para comparar.'}
          </p>
        </div>
      </section>

      {selectedActa.usuariomodificacion && (
        <section className="verificacion-actas-detail__section">
          <h3>Usuario que modifico</h3>
          <p>{selectedActa.usuariomodificacion}</p>
        </section>
      )}
    </div>
  ) : null;

  return (
    <>
     

      <main className="verificacion-actas-layout">
        <section className="verificacion-actas-hero">
          <div className="verificacion-actas-hero__content">
            <span className="verificacion-actas-hero__eyebrow">Detalle por estudiante</span>
            <h1>{studentName}</h1>
            <p>Las actas se listan solo para el estudiante que seleccionaste.</p>
          </div>
          <div className="verificacion-actas-hero__meta">
            <article className="verificacion-actas-stat">
              <span>Fecha de nacimiento</span>
              <strong>{formatDate(getStudentBirthDate(student))}</strong>
            </article>
            <article className="verificacion-actas-stat">
              <span>Total de actas</span>
              <strong>{actas.length}</strong>
            </article>
          </div>
        </section>

        <section className="verificacion-actas-panel">
          {loading ? (
            <div className="verificacion-actas-empty">Cargando actas...</div>
          ) : actas.length === 0 ? (
            <div className="verificacion-actas-empty">
              Este estudiante no tiene actas activas registradas.
            </div>
          ) : (
            <div className="verificacion-actas-table-wrap">
              <table className="verificacion-actas-table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Profesor</th>
                    <th>Fecha de creacion</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {actas.map((acta) => (
                    <tr key={acta.idacta}>
                      <td>{acta.materia || 'Sin materia'}</td>
                      <td>{getDocenteName(acta)}</td>
                      <td>{formatDate(acta.fechadecreacion)}</td>
                      <td>
                        <button
                          type="button"
                          className="verificacion-actas-btn"
                          onClick={() => handleViewDetail(acta)}
                        >
                          Ver detalle de acta
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

      <DynamicModelForUsers
        isOpen={detailOpen}
        title="Detalle del acta"
        content={detailContent}
        onClose={() => setDetailOpen(false)}
        contentClassName="users-modal__content--wide"
      />

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

export default VerificacionActasDetalle;
