import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getPadreById } from '../../servicios/PadreDeFamilia.jsx';
import { agendarEntrevista } from '../../servicios/teoriaDeColas.service.jsx';
import { getMotivos } from '../../servicios/motivo.service.jsx';
import { getMateria } from '../../servicios/materia.service.jsx';
import './CitarPadres.css';
import Header from '../Header.jsx';
import Toast from '../Toast.jsx';
import FullScreenLoader from './ProgresoCircular.jsx';

const getLocalISODate = (offsetDays = 0) => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  local.setDate(local.getDate() + offsetDays);
  return local.toISOString().split('T')[0];
};

const esFinDeSemana = (isoDate) => {
  if (!isoDate) return false;
  // Forzar UTC para evitar desfases de zona horaria
  const day = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
};


const CitarPadres = () => {
  const location = useLocation();
  const { idPadre, padreData } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombres: '',
    email: '',
    numcelular: '',
    motivo: '',
    nombremotivo: '',
    materia: '',
    nombremateria: '',
    fecha: '',
    descripcion: '',
  });

  const [motivos, setMotivos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [meetInfo, setMeetInfo] = useState({ link: '', horaInicio: '', horaFin: '', fecha: '' });
  const [isVirtual, setIsVirtual] = useState(true);

  const todayDate = useMemo(() => getLocalISODate(0), []);
  const tomorrowDate = useMemo(() => getLocalISODate(1), []);

  useEffect(() => {
    if (padreData) {
      setFormData((prev) => ({
        ...prev,
        nombres: `${padreData.nombres || ''} ${padreData.apellidopaterno || ''} ${padreData.apellidomaterno || ''}`
          .replace(/\s+/g, ' ')
          .trim(),
        email: padreData.email || '',
        numcelular: padreData.numcelular || padreData.telefono || '',
      }));
      return;
    }

    if (!idPadre) return;
    const fetchPadre = async () => {
      try {
        const response = await getPadreById(idPadre);
        const padre = response.data;
        setFormData((prev) => ({
          ...prev,
          nombres: `${padre.nombres} ${padre.apellidopaterno} ${padre.apellidomaterno}`,
          email: padre.email,
          numcelular: padre.numcelular,
        }));
      } catch (error) {
        setToast({
          message: 'Error al obtener los datos del padre.',
          type: 'error',
        });
        console.error('Error al obtener los datos del padre:', error);
      }
    };
    fetchPadre();
  }, [idPadre]);

  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        const response = await getMotivos();
        setMotivos(response.data);
      } catch (error) {
        setToast({
          message: 'Error al obtener los motivos.',
          type: 'error',
        });
        console.error('Error al obtener motivos:', error);
      }
    };
    fetchMotivos();
  }, []);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await getMateria();
        setMaterias(response.data || []);
      } catch (error) {
        setToast({
          message: 'Error al obtener materias.',
          type: 'error',
        });
        console.error('Error al obtener materias:', error);
        setMaterias([]);
      }
    };
    fetchMaterias();
  }, []);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (selectedDate && selectedDate <= todayDate) {
      setToast({
        message: 'No se puede agendar para el mismo dia. Selecciona una fecha posterior.',
        type: 'error',
      });
      setFormData({ ...formData, fecha: '' });
      return;
    }

    if (esFinDeSemana(selectedDate)) {
      setToast({
        message: 'No es un dia habil (sabado y domingo no estan permitidos).',
        type: 'error',
      });
      setFormData((prev) => ({ ...prev, fecha: '' }));
    } else {
      setFormData((prev) => ({ ...prev, fecha: selectedDate }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'materia') {
      const selectedMateria = materias.find((m) => m.idmateria === parseInt(value, 10));
      setFormData({
        ...formData,
        materia: value !== '' ? Number(value) : '',
        nombremateria: selectedMateria ? selectedMateria.nombre : '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMotivoChange = (e) => {
    const selectedMotivo = motivos.find((m) => m.idmotivo === parseInt(e.target.value, 10));
    setFormData({
      ...formData,
      motivo: parseInt(e.target.value, 10),
      nombremotivo: selectedMotivo ? selectedMotivo.nombremotivo : '',
    });
  };

  const handleClear = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      motivo: '',
      materia: '',
      nombremateria: '',
      fecha: '',
      descripcion: '',
      nombremotivo: '',
    }));
    setMeetInfo({ link: '', horaInicio: '', horaFin: '', fecha: '' });
    setIsVirtual(true);
  };

  const usuario = JSON.parse(localStorage.getItem('user'));
  const descripcionMensaje = formData.descripcion?.trim();
  const fechaProgramada = meetInfo.fecha || formData.fecha;
  const horaActual = new Date().getHours();
  const saludoDia = horaActual < 12 ? 'Buenos dias' : horaActual < 18 ? 'Buenas tardes' : 'Buenas noches';
  const saludoBase = formData.nombres ? `${saludoDia} ${formData.nombres},` : `${saludoDia},`;
  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return '';
    const formatted = new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };
  const fechaHumana = formatFriendlyDate(fechaProgramada);
  const whatsappText = `${saludoBase} soy ${
    usuario?.nombres ? `${usuario.nombres} ${usuario.apellidopaterno || ''}` : 'el docente asignado'
  }${formData.nombremateria ? ` de la materia ${formData.nombremateria}` : ''}. Le informo que ha sido convocado a una entrevista ${
    fechaHumana ? `el dia ${fechaHumana}` : ''
  }${meetInfo.horaInicio ? ` a las ${meetInfo.horaInicio}` : ''} para hablar sobre su hijo(a)${
    formData.nombremotivo ? ` por el motivo: ${formData.nombremotivo}` : ''
  }.`;
  const fechaLinea = '';
  const horaLinea = meetInfo.horaInicio ? `\nHora de inicio: ${meetInfo.horaInicio}` : '';
  const motivoLinea = formData.nombremotivo ? `\nMotivo: ${formData.nombremotivo}` : '';
  const includeMeetLink = Boolean(meetInfo.link);
  const meetLinea = includeMeetLink && isVirtual ? `\nEnlace de la reunion: ${meetInfo.link}` : '';
  const despedida = '\nAgradezco su confirmacion.\nSaludos cordiales.';
  const whatsappMessage = encodeURIComponent(
    `${whatsappText}${fechaLinea}${horaLinea}${motivoLinea}${meetLinea}${despedida}`
  );
  const canSendWhatsApp = Boolean(formData.numcelular?.trim() && fechaProgramada);
  const whatsappLink =
    canSendWhatsApp && formData.numcelular?.trim()
      ? `https://wa.me/${formData.numcelular.trim()}?text=${whatsappMessage}`
      : null;

  const calendarLink = useMemo(() => {
    if (!meetInfo.fecha || !meetInfo.horaInicio || !meetInfo.horaFin) return null;
    const formatDateTime = (date, time) => {
      const cleanDate = date.replace(/-/g, '');
      const cleanTime = time.replace(/:/g, '').slice(0, 6);
      return `${cleanDate}T${cleanTime}`;
    };
    const start = formatDateTime(meetInfo.fecha, meetInfo.horaInicio);
    const end = formatDateTime(meetInfo.fecha, meetInfo.horaFin);
    const text = encodeURIComponent(`Entrevista IDEB - ${formData.nombremotivo || 'Seguimiento'}`);
    const details = encodeURIComponent(formData.descripcion || '');
    const location = encodeURIComponent(meetInfo.link || '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  }, [meetInfo, formData.nombremotivo, formData.descripcion]);  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!usuario || (usuario.role !== 'Profesor' && usuario.role !== 'Psicologo')) {
      setToast({ message: 'Solo profesores o psicologos pueden agendar citas.', type: 'error' });
      setIsLoading(false);
      return;
    }

    const idProfesor = usuario.role === 'Profesor' ? usuario.id : null;
    const idPsicologo = usuario.role === 'Psicologo' ? usuario.id : null;
    const idhorario = usuario.idhorario;

    const { motivo: idMotivo, materia: idMateria, fecha, descripcion } = formData;

    if ((!idProfesor && !idPsicologo) || !idPadre || !idMotivo || !idMateria || !fecha || !descripcion) {
      setToast({
        message: 'Complete todos los campos obligatorios.',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await agendarEntrevista({
        idProfesor,
        idPsicologo,
        idPadre,
        fecha,
        descripcion,
        idMotivo,
        idMateria,
        idhorario,
        esVirtual: isVirtual,
      });

      if (response.status === 201) {
        setToast({ message: 'Cita agendada exitosamente.', type: 'success' });
        localStorage.removeItem('agendaLlenaInfo');
        if (isVirtual) {
          setMeetInfo({
            link: response.data?.meetLink || '',
            horaInicio: response.data?.horaInicio || '',
            horaFin: response.data?.horaFin || '',
            fecha: formData.fecha,
          });
        } else {
          setMeetInfo({ link: '', horaInicio: '', horaFin: '', fecha: '' });
        }
      }
    } catch (error) {
      const backendMessage = error.response?.data?.error || 'Error al agendar la cita.';
      if (backendMessage.toLowerCase().includes('no hay espacio disponible')) {
        localStorage.setItem(
          'agendaLlenaInfo',
          JSON.stringify({
            fecha: formData.fecha,
            nombre: formData.nombres,
            telefono: formData.numcelular,
            motivo: formData.nombremotivo,
          })
        );
      }
      setToast({
        message: error.response?.data?.error || 'Error al agendar la cita.',
        type: 'error',
      });
      console.error('Error al agendar la cita:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <FullScreenLoader />}
    
      <main className="citar-padres-layout">
        <section className="citar-hero">
          <div className="citar-hero__content">
            <span className="citar-hero__eyebrow">Coordinacion con familias</span>
            <h1>
             Profesor a cargo de la cita: {formData.nombres ? formData.nombres : 'el padre seleccionado'}
            </h1>
            <p>
              Confirma la informacion clave de la familia y define el motivo y fecha para dar seguimiento a cada caso.
            </p>
          </div>
          <div className="citar-hero__info">
            <div className="citar-hero__chips">
              <article>
                <small>Padre seleccionado</small>
                <strong>{formData.nombres || 'Sin registro'}</strong>
              </article>
              <article>
                <small>Docente responsable</small>
                <strong>
                  {usuario?.nombres ? `${usuario.nombres} ${usuario.apellidopaterno || ''}` : 'No disponible'}
                </strong>
              </article>
            </div>
            <div className="citar-hero__chips">
              <article>
                <small>Fecha propuesta</small>
                <strong>{formData.fecha || 'Por definir'}</strong>
              </article>
              <article>
                <small>Motivo seleccionado</small>
                <strong>{formData.nombremotivo || 'Por definir'}</strong>
              </article>
            </div>
          </div>
          <div className="citar-hero__card">
            <span>Recomendaciones</span>
            <ul>
              <li>Evita agendar entrevistas en fines de semana.</li>
              <li>Describe claramente el motivo para la familia.</li>
              <li>Confirma que los datos del contacto esten actualizados.</li>
            </ul>
          </div>
        </section>

        <section className="citar-card">
          <form onSubmit={handleSubmit}>
            <div className="citar-section">
              <div className="citar-section__header">
                <h3>Datos de contacto</h3>
                <p>Estos campos se cargan automaticamente desde el registro del padre.</p>
              </div>
              <div className="citar-grid citar-grid--contact">
                <div className="citar-field">
                  <label>Nombre del padre de familia</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    className="citar-input"
                    onChange={handleChange}
                    placeholder="Nombre del padre de familia"
                    readOnly={Boolean(idPadre)}
                  />
                </div>
                <div className="citar-field">
                  <label>Correo electronico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="citar-input"
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    readOnly={Boolean(idPadre)}
                  />
                </div>
                <div className="citar-field">
                  <label>Telefono</label>
                  <input
                    name="numcelular"
                    type="text"
                    value={formData.numcelular || ''}
                    className="citar-input"
                    onChange={handleChange}
                    placeholder="Número de contacto"
                    readOnly={Boolean(idPadre)}
                  />
                </div>
              </div>
            </div>

            <div className="citar-section">
              <div className="citar-section__header">
                <h3>Detalles de la cita</h3>
                <p>Completa la informacion para agendar la entrevista.</p>
              </div>
              <div className="citar-grid">
                <div className="citar-field">
                  <label>Motivo</label>
                  <select
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleMotivoChange}
                    className="citar-input"
                    required
                  >
                    <option value="">Selecciona el motivo</option>
                    {motivos.map((motivo) => (
                      <option key={motivo.idmotivo} value={motivo.idmotivo}>
                        {motivo.nombremotivo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="citar-field">
                  <label>Materia</label>
                  <select
                    name="materia"
                    value={formData.materia || ''}
                    onChange={handleChange}
                    className="citar-input"
                    required
                  >
                    <option value="">Selecciona la materia</option>
                    {materias.map((materia) => (
                      <option key={materia.idmateria} value={materia.idmateria || ''}>
                        {materia.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              <div className="citar-field">
                <label>Fecha de la entrevista</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleDateChange}
                  className="citar-input"
                  min={tomorrowDate}
                  required
                />
              </div>
              <div className="citar-field citar-checkbox">
                <label>¿Reunion virtual?</label>
                <label className="citar-checkbox__control">
                  <input
                    type="checkbox"
                    checked={isVirtual}
                    onChange={(e) => setIsVirtual(e.target.checked)}
                  />
                  <span>Generar enlace de Google Meet y agregar a Calendar</span>
                </label>
              </div>
              </div>
              <div className="citar-field">
                <label>Descripcion</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="citar-textarea"
                  required
                  placeholder="Escriba la descripcion del mensaje"
                />
              </div>
            </div>
            {includeMeetLink && isVirtual && (
              <div className="citar-meet-card">
                <div>
                  <strong>Reunion en Google Meet creada</strong>
                  <p>
                    {meetInfo.fecha && `Fecha: ${meetInfo.fecha}`}
                    {meetInfo.horaInicio && ` | Inicio: ${meetInfo.horaInicio}`}
                    {meetInfo.horaFin && ` | Fin: ${meetInfo.horaFin}`}
                  </p>
                </div>
                <a href={meetInfo.link} target="_blank" rel="noreferrer">
                  {meetInfo.link}
                </a>
                <small>Comparte este enlace con la familia por WhatsApp.</small>
              </div>
            )}
            <div className="citar-actions">
              <button type="button" className="citar-btn citar-btn--ghost" onClick={handleClear}>
                Limpiar
              </button>
              <button
                type="button"
                className="citar-btn citar-btn--calendar"
                disabled={!calendarLink}
                onClick={() => {
                  if (calendarLink) {
                    window.open(calendarLink, '_blank');
                  }
                }}
              >
                Guardar en Google Calendar
              </button>
              <button type="submit" className="citar-btn">
                Enviar cita
              </button>
            </div>
          </form>
        </section>
      </main>
      {toast.message && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      )}
    </>
  );
};

export default CitarPadres;

