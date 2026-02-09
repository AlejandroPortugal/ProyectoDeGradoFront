import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import { getMotivos } from '../../motivos/services/motivo.service.jsx';
import { getPadreConEstudiantes } from '../services/PadreDeFamilia.jsx';
import {
  crearReservaEntrevista,
  obtenerEntrevistasPorPadre,
  obtenerFechasHabilitadas,
} from '../../entrevistas/services/teoriaDeColas.service.jsx';
import './AgendarEntrevista.css';
import MenuPadres from '../components/MenuPadres.jsx';
import Footes from '../components/Footes.jsx';
import Toast from '../../../components/Toast.jsx';
import FullScreenLoader from '../../../components/ProgresoCircular.jsx'; // Importar el componente ProgresoCircular

registerLocale('es', es);

const AgendarEntrevista = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { idProfesor, idPsicologo, nombre, materia, dia, horainicio } = location.state || {};
  const [motivos, setMotivos] = useState([]);
  const [idMotivo, setIdMotivo] = useState('');
  const [fecha, setFecha] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Estado para mostrar el loader
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [fechasOcupadas, setFechasOcupadas] = useState(() => new Set());
  const [fechasDisponibles, setFechasDisponibles] = useState(null);
  const [fechasDisponiblesRange, setFechasDisponiblesRange] = useState(null);

  const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
      console.error('No se pudo leer el usuario local:', error);
      return null;
    }
  };

  const getStoredPadreId = () => {
    const usuario = getStoredUser();
    return (
      usuario?.idPadre ??
      usuario?.idpadre ??
      usuario?.id_padre ??
      usuario?.id ??
      null
    );
  };

  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        const response = await getMotivos();
        setMotivos(response.data);
      } catch (error) {
        console.error('Error al cargar motivos:', error);
      }
    };

    fetchMotivos();
  }, []);

  useEffect(() => {
    const loadEstudiantes = async () => {
      try {
        const usuario = getStoredUser();
        const idPadre = getStoredPadreId();

        if (!idPadre) {
          setEstudiantes([]);
          return;
        }

        const response = await getPadreConEstudiantes(idPadre);
        const lista =
          (Array.isArray(response?.data?.estudiantes) && response.data.estudiantes) ||
          (Array.isArray(response?.data) && response.data) ||
          [];
        setEstudiantes(lista);
        const idFromUser =
          usuario?.idEstudiante ||
          usuario?.idestudiante ||
          usuario?.idAlumno ||
          usuario?.idalumno ||
          null;

        if (idFromUser) {
          setSelectedStudentId(String(idFromUser));
        }
      } catch (error) {
        console.error('No se pudieron cargar los estudiantes para la selección:', error);
      }
    };

    loadEstudiantes();
  }, []);

  useEffect(() => {
    const loadFechasOcupadas = async () => {
      const idPadre = getStoredPadreId();
      if (!idPadre) return;

      try {
        const response = await obtenerEntrevistasPorPadre(idPadre);
        const lista =
          (Array.isArray(response?.data?.data) && response.data.data) ||
          (Array.isArray(response?.data) && response.data) ||
          [];
        const fechas = lista
          .filter((cita) => {
            const estado = (cita?.estado ?? '').toString().trim().toLowerCase();
            if (!estado) return true;
            if (estado === '3') return false;
            return !estado.includes('cancel');
          })
          .map((cita) => cita?.fecha)
          .filter(Boolean);
        setFechasOcupadas(new Set(fechas));
      } catch (error) {
        console.error('Error al obtener las entrevistas del padre:', error);
      }
    };

    loadFechasOcupadas();
  }, []);

  useEffect(() => {
    const loadFechasDisponibles = async () => {
      if (!dia || (!idProfesor && !idPsicologo)) {
        setFechasDisponibles(null);
        return;
      }

      try {
        const params = {
          dia,
          dias: 120,
        };
        if (idProfesor) params.idProfesor = idProfesor;
        if (idPsicologo) params.idPsicologo = idPsicologo;
        if (idMotivo) params.idMotivo = idMotivo;

        const response = await obtenerFechasHabilitadas(params);
        const lista =
          (Array.isArray(response?.data) && response.data) ||
          (Array.isArray(response?.data?.data) && response.data.data) ||
          [];
        const unicas = Array.from(new Set(lista.filter(Boolean)));
        if (unicas.length === 0) {
          setFechasDisponibles(null);
          setFechasDisponiblesRange(null);
          return;
        }
        unicas.sort();
        setFechasDisponibles(new Set(unicas));
        setFechasDisponiblesRange({ min: unicas[0], max: unicas[unicas.length - 1] });
      } catch (error) {
        console.error('Error al obtener fechas habilitadas:', error);
        setFechasDisponibles(null);
        setFechasDisponiblesRange(null);
      }
    };

    loadFechasDisponibles();
  }, [dia, idProfesor, idPsicologo, idMotivo]);

  const normalizeDia = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/Ã¡/g, 'a')
      .replace(/Ã©/g, 'e')
      .replace(/Ã­/g, 'i')
      .replace(/Ã³/g, 'o')
      .replace(/Ãº/g, 'u')
      .replace(/Ã±/g, 'n');

  const formatLocalDate = (value) => {
    if (!value) return '';
    const dateValue = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateValue.getTime())) return '';
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDayEnabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return false;
    }

    const dayOfWeek = date.getDay();

    const daysMap = {
      domingo: 0,
      lunes: 1,
      martes: 2,
      miercoles: 3,
      jueves: 4,
      viernes: 5,
      sabado: 6,
    };

    const normalizedDia = normalizeDia(dia);
    const diaIndex = daysMap[normalizedDia];
    if (Number.isInteger(diaIndex) && dayOfWeek !== diaIndex) {
      return false;
    }

    const fechaKey = formatLocalDate(date);
    if (fechasOcupadas.has(fechaKey)) {
      return false;
    }

    const dentroDeRango =
      fechasDisponiblesRange &&
      fechaKey >= fechasDisponiblesRange.min &&
      fechaKey <= fechasDisponiblesRange.max;

    if (fechasDisponibles && dentroDeRango && !fechasDisponibles.has(fechaKey)) {
      return false;
    }

    return true;
  };

  const handleAgendar = async () => {
    const idPadre = getStoredPadreId();
    const idEstudiante = Number(selectedStudentId) || null;
    const idMotivoNumber = Number(idMotivo) || null;

    if ((!idProfesor && !idPsicologo) || !idMotivoNumber || !fecha || !idPadre || !idEstudiante) {
      setToastMessage('Por favor complete todos los campos obligatorios.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const fechaKey = formatLocalDate(fecha);
    const dentroDeRango =
      fechasDisponiblesRange &&
      fechaKey >= fechasDisponiblesRange.min &&
      fechaKey <= fechasDisponiblesRange.max;
    if (fechasOcupadas.has(fechaKey) || (fechasDisponibles && dentroDeRango && !fechasDisponibles.has(fechaKey))) {
      setToastMessage('La fecha seleccionada no esta disponible para agendar.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const data = {
      idProfesor: idProfesor || null,
      idPsicologo: idPsicologo || null,
      idPadre,
      idEstudiante,
      idestudiante: idEstudiante,
      fecha: fechaKey,
      idMotivo: idMotivoNumber,
      descripcion: '',
      horainicio,
      profesor: {
        nombre,
        materia,
        dia,
        horainicio,
      },
    };

    setIsLoading(true); // Mostrar el loader
    try {
      const response = await crearReservaEntrevista(data);
      const { message, success } = response.data;

      setToastMessage(message);
      setToastType(success ? 'success' : 'error');
      setShowToast(true);

      if (success) {
        setTimeout(() => {
          setShowToast(false);
          navigate('/listaprofesoresentrevistas');
        }, 5000);
      }
    } catch (error) {
      console.error('Error al agendar entrevista:', error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Error al agendar la entrevista. La agenda del profesor esta llena o el estudiante no esta vinculado.';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false); // Ocultar el loader
    }
  };

  const fechaLabel = fecha ? formatLocalDate(fecha) : '';

  return (
    <div className="agendar-page">
      <MenuPadres />
      <section className="agendar-hero">
        <div className="agendar-hero__inner">
          <div className="agendar-hero__copy">
            <span className="agendar-hero__eyebrow">Agenda de entrevistas</span>
            <h1 className="agendar-hero__title">Agenda tu entrevista con el docente o psicologo</h1>
            <p className="agendar-hero__subtitle">
              Selecciona fecha, motivo y estudiante asociado. Confirma la cita y recibe el seguimiento en pocos pasos.
            </p>
          </div>
          <div className="agendar-hero__card">
            <h2>Que puedes hacer en este modulo</h2>
            <ul>
              <li>Revisar el horario disponible del docente.</li>
              <li>Elegir la fecha y el motivo de la entrevista.</li>
              <li>Asociar a tu hijo y agendar la cita.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="agendar-content">
        <h2 className="section-title">Horario de entrevista</h2>
        <div className="schedule-row">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Nombre del Profesor</th>
                <th>Materia</th>
                <th>Dia</th>
                <th>Hora de Inicio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{nombre || 'No disponible'}</td>
                <td>{materia || 'No disponible'}</td>
                <td>{dia || 'No disponible'}</td>
                <td>{horainicio || 'No disponible'}</td>
              </tr>
            </tbody>
          </table>

          <div className="field-card student-selection">
            <label htmlFor="student-filter" className="field-label">
              Seleccione al estudiante asociado
            </label>
            <div className="student-grid">
              <input
                id="student-filter"
                type="text"
                placeholder="Buscar por nombre o apellido"
                className="motive-dropdown"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              <select
                className="motive-dropdown"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="" disabled>
                  Seleccione el estudiante
                </option>
                {estudiantes
                  .filter((est) => {
                    const term = studentSearch.trim().toLowerCase();
                    if (!term) return true;
                    const nombreCompleto = `${est.nombres} ${est.apellidopaterno} ${est.apellidomaterno}`
                      .replace(/\s+/g, ' ')
                      .toLowerCase();
                    return nombreCompleto.includes(term);
                  })
                  .map((est) => (
                    <option key={est.idestudiante || est.idEstudiante} value={est.idestudiante || est.idEstudiante}>
                      {`${est.nombres} ${est.apellidopaterno} ${est.apellidomaterno}`
                        .replace(/\s+/g, ' ')
                        .trim()}
                    </option>
                  ))}
              </select>
            </div>
            <small className="student-hint">
              Se validara que el estudiante seleccionado este vinculado a su cuenta en el sistema.
            </small>
          </div>
        </div>

        <div className="form-grid">
          <div className="field-card date-picker">
            <label className="field-label">Seleccione la fecha</label>
            <div className="date-picker__row">
              <input
                type="text"
                className="motive-dropdown date-input"
                placeholder="Seleccione una fecha valida"
                value={fechaLabel}
                readOnly
              />
              <div className="date-calendar">
                <DatePicker
                  selected={fecha}
                  onChange={(date) => setFecha(date)}
                  filterDate={isDayEnabled}
                  minDate={new Date()}
                  locale="es"
                  inline
                />
              </div>
            </div>
          </div>

          <div className="field-card motive-selection">
            <label className="field-label" htmlFor="motivo-select">
              Motivo de la entrevista
            </label>
            <select
              id="motivo-select"
              className="motive-dropdown"
              value={idMotivo}
              onChange={(e) => setIdMotivo(e.target.value)}
            >
              <option value="" disabled>
                Seleccione el motivo
              </option>
              {motivos.map((motivo) => (
                <option key={motivo.idmotivo} value={motivo.idmotivo}>
                  {motivo.nombremotivo}
                </option>
              ))}
            </select>
          </div>

          
        </div>

        <div className="action-buttons">
          <button className="cancel-button" onClick={() => navigate('/listaprofesoresentrevistas')}>
            Cancelar
          </button>
          <button className="confirm-button" onClick={handleAgendar}>
            Agendar
          </button>
        </div>
      </section>

      <Footes />

      {isLoading && <FullScreenLoader />} {/* Mostrar el componente ProgresoCircular */}

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default AgendarEntrevista;





