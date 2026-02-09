import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getEstudianteById } from '../../estudiantes/services/Estudiante.service.jsx';
import { createActaReunion } from '../services/actas.service.jsx';
import { actualizarEstadoEntrevistaProfesor } from '../../profesores/services/profesor.service.jsx';
import { getMotivos } from '../../motivos/services/motivo.service.jsx';
import { getMateria } from '../../materias/services/materia.service.jsx';
import { getHorariosById, getHorarioByProfesor } from '../../horarios/services/horario.service.jsx';
import './FormActas.css';
import Header from '../../../components/Header.jsx';
import imgEstudiantes from '../../../recursos/image/Estudiantes.png';
import Toast from '../../../components/Toast.jsx';
import jsPDF from 'jspdf';
import logoIdeb from '../../../recursos/icons/logo.svg';

const safeParseJSON = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('No se pudo leer la informacion local:', error);
    return null;
  }
};

const normalizeText = (value) =>
  (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const getHorarioPayload = (payload) => {
  if (!payload) return null;
  const data = payload?.data ?? payload?.horario ?? payload;
  const value = Array.isArray(data) ? data[0] : data;
  return value || null;
};

function FormActas() {
  const location = useLocation();
  const navigate = useNavigate();
  const [estudiante, setEstudiante] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [motivos, setMotivos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [actaPreview, setActaPreview] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [profesorNombre, setProfesorNombre] = useState('________________________');
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [padreNombre, setPadreNombre] = useState('');
  const [autoMotivoId, setAutoMotivoId] = useState('');
  const [autoMateriaId, setAutoMateriaId] = useState('');
  const previewRef = useRef(null);
  const [formData, setFormData] = useState({
    idreservarentrevista: '',
    idmotivo: '',
    idmateria: '',
    fechadecreacion: new Date().toISOString().split('T')[0], 
    descripcion: '',
    estado: true,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const nombre =
            `${parsed?.nombres || ''} ${parsed?.apellidopaterno || ''} ${parsed?.apellidomaterno || ''}`
              .replace(/\s+/g, ' ')
              .trim();
          if (nombre) {
            setProfesorNombre(nombre);
          }
        } catch (error) {
          console.error('No se pudo obtener el usuario local:', error);
        }
      }
    }
  }, []);

  const getStoredUser = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return safeParseJSON(localStorage.getItem('user'));
  }, []);

  const resolvePadreDesdeState = useCallback(() => {
    const stateData = location?.state || {};
    const entrevistaData = stateData.entrevistaData || {};
    const candidates = [
      stateData.nombrePadre,
      stateData.nombrepadre,
      stateData.nombre_padre,
      stateData.padreNombre,
      stateData.nombre_apoderado,
      stateData.apoderado,
      stateData.padre,
      stateData.nombrecompletoPadre,
      stateData.nombre_completo_padre,
      stateData.nombrespadre,
      entrevistaData.nombre_padre,
      entrevistaData.nombrePadre,
      entrevistaData.nombrepadre,
      entrevistaData.padreNombre,
      entrevistaData.nombre_apoderado,
      entrevistaData.apoderado,
      entrevistaData.padre,
      entrevistaData.nombrecompletoPadre,
      entrevistaData.nombre_completo_padre,
      entrevistaData.nombrespadre,
      entrevistaData.nombre_completo_padre_familia,
      entrevistaData.nombre_padre_familia,
      entrevistaData.nombreEncargado,
      entrevistaData.encargado,
      entrevistaData.nombre_contacto,
      entrevistaData.nombre_tutor,
      entrevistaData.nombretutor,
      entrevistaData.nombre_completo,
      stateData.nombre_completo,
    ];
    const posibleNombre = candidates.find((value) => typeof value === 'string' && value.trim().length > 0) || '';
    return posibleNombre.trim();
  }, [location.state]);

  const resolveMotivoDesdeState = useCallback(() => {
    const stateData = location?.state || {};
    const entrevistaData = stateData.entrevistaData || {};
    const candidates = [
      stateData.motivo,
      stateData.nombremotivo,
      stateData.nombreMotivo,
      stateData.nombre_motivo,
      entrevistaData.motivo,
      entrevistaData.nombremotivo,
      entrevistaData.nombreMotivo,
      entrevistaData.nombre_motivo,
    ];
    const posibleNombre = candidates.find((value) => typeof value === 'string' && value.trim().length > 0) || '';
    return posibleNombre.trim();
  }, [location.state]);

  const resolveMateriaDesdeState = useCallback(() => {
    const stateData = location?.state || {};
    const entrevistaData = stateData.entrevistaData || {};
    const candidates = [
      stateData.materia,
      stateData.nombreMateria,
      stateData.nombremateria,
      stateData.nombre_materia,
      stateData.materiaNombre,
      entrevistaData.materia,
      entrevistaData.nombreMateria,
      entrevistaData.nombremateria,
      entrevistaData.nombre_materia,
    ];
    const posibleNombre = candidates.find((value) => typeof value === 'string' && value.trim().length > 0) || '';
    return posibleNombre.trim();
  }, [location.state]);

  useEffect(() => {
    const nombrePadre = resolvePadreDesdeState();
    if (nombrePadre) {
      setPadreNombre(nombrePadre);
    }
  }, [resolvePadreDesdeState]);

  const obtenerPadreFirmante = useCallback(() => {
    const resolved = (padreNombre || resolvePadreDesdeState() || '').trim();
    return resolved || '________________________';
  }, [padreNombre, resolvePadreDesdeState]);

  useEffect(() => {
    const stateData = location?.state || {};
    const entrevistaData = stateData.entrevistaData || {};

    const motivoIdDirecto =
      stateData.idmotivo ??
      stateData.idMotivo ??
      stateData.id_motivo ??
      entrevistaData.idmotivo ??
      entrevistaData.idMotivo ??
      entrevistaData.id_motivo ??
      null;

    if (motivoIdDirecto && !formData.idmotivo) {
      const resolvedId = String(motivoIdDirecto);
      setFormData((prev) => ({ ...prev, idmotivo: resolvedId }));
      setAutoMotivoId(resolvedId);
    }

    const materiaIdDirecto =
      stateData.idmateria ??
      stateData.idMateria ??
      stateData.id_materia ??
      entrevistaData.idmateria ??
      entrevistaData.idMateria ??
      entrevistaData.id_materia ??
      null;

    if (materiaIdDirecto && !formData.idmateria) {
      const resolvedId = String(materiaIdDirecto);
      setFormData((prev) => ({ ...prev, idmateria: resolvedId }));
      setAutoMateriaId(resolvedId);
    }
  }, [formData.idmateria, formData.idmotivo, location.state]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logoIdeb;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      setLogoDataUrl(canvas.toDataURL('image/png'));
    };
    img.onerror = () => setLogoDataUrl(null);
  }, []);

  const formatFechaLarga = (fecha) => {
    if (!fecha) return '';
    const parsedDate = new Date(fecha);
    if (Number.isNaN(parsedDate.getTime())) return fecha;
    return parsedDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const estudianteNombreCompleto = estudiante
    ? `${estudiante.nombres} ${estudiante.apellidopaterno} ${estudiante.apellidomaterno}`
    : 'Estudiante sin registrar';

  const buildActaPreview = (descripcionActual) => {
    const motivoSeleccionado = motivos.find((motivo) => String(motivo.idmotivo) === String(formData.idmotivo));
    const materiaSeleccionada = materias.find((materia) => String(materia.idmateria) === String(formData.idmateria));
    setActaPreview({
      fecha: formatFechaLarga(formData.fechadecreacion),
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      estudiante: estudianteNombreCompleto,
      motivo: motivoSeleccionado?.nombremotivo || 'Sin motivo especificado',
      materia: materiaSeleccionada?.nombre || 'Sin materia especificada',
      descripcion: descripcionActual || 'Sin descripcion registrada.',
      profesor: profesorNombre,
      padre: obtenerPadreFirmante(),
    });
    setIsPreviewOpen(true);
  };

  useEffect(() => {
    const idreservarentrevista = location.state?.idreservarentrevista;
    const idestudiante = location.state?.idestudiante;

    if (idreservarentrevista) {
      setFormData((prev) => ({
        ...prev,
        idreservarentrevista,
        idestudiante,
      }));

      if (idestudiante) {
        getEstudianteById(idestudiante)
          .then((response) => {
            setEstudiante(response.data);
          })
          .catch((error) => {
            console.error('Error al obtener el estudiante:', error);
            setToast({
              message: 'Error al cargar los datos del estudiante.',
              type: 'error',
              show: true,
            });
          });
      } else {
        setToast({
          message: 'No se encontro un identificador del estudiante.',
          type: 'error',
          show: true,
        });
      }
    } else {
      setToast({
        message: 'No se puede crear una acta sin entrevista registrada.',
        type: 'error',
        show: true,
      });
    }

    getMotivos()
      .then((response) => {
        setMotivos(response.data);
      })
      .catch((error) => console.error('Error al obtener motivos:', error));

    getMateria()
      .then((response) => {
        setMaterias(response.data);
      })
      .catch((error) => console.error('Error al obtener materias:', error));
  }, [location.state]);

  useEffect(() => {
    const motivoNombre = resolveMotivoDesdeState();
    if (!motivoNombre || formData.idmotivo || !motivos.length) return;
    const matched = motivos.find(
      (motivo) => normalizeText(motivo.nombremotivo) === normalizeText(motivoNombre)
    );
    if (matched) {
      const resolvedId = String(matched.idmotivo);
      setFormData((prev) => ({ ...prev, idmotivo: resolvedId }));
      setAutoMotivoId(resolvedId);
    }
  }, [formData.idmotivo, motivos, resolveMotivoDesdeState]);

  useEffect(() => {
    const materiaNombre = resolveMateriaDesdeState();
    if (!materiaNombre || formData.idmateria || !materias.length) return;
    const matched = materias.find(
      (materia) => normalizeText(materia.nombre) === normalizeText(materiaNombre)
    );
    if (matched) {
      const resolvedId = String(matched.idmateria);
      setFormData((prev) => ({ ...prev, idmateria: resolvedId }));
      setAutoMateriaId(resolvedId);
    }
  }, [formData.idmateria, materias, resolveMateriaDesdeState]);

  useEffect(() => {
    const fetchMateriaFromHorario = async () => {
      if (formData.idmateria || autoMateriaId) return;
      const stateData = location?.state || {};
      const storedUser = getStoredUser();
      const idProfesor =
        stateData.idProfesor ??
        stateData.idprofesor ??
        storedUser?.idProfesor ??
        storedUser?.idprofesor ??
        storedUser?.id_Profesor ??
        storedUser?.id_profesor ??
        storedUser?.id ??
        null;
      const idHorario =
        stateData.idHorario ??
        stateData.idhorario ??
        stateData.id_horario ??
        storedUser?.idHorario ??
        storedUser?.idhorario ??
        storedUser?.id_horario ??
        storedUser?.horario_id ??
        null;

      try {
        let horarioData = null;
        if (idProfesor) {
          const response = await getHorarioByProfesor(idProfesor);
          horarioData = getHorarioPayload(response);
        }
        if (!horarioData && idHorario) {
          const response = await getHorariosById(idHorario);
          horarioData = getHorarioPayload(response);
        }

        const materiaId =
          horarioData?.idmateria ??
          horarioData?.idMateria ??
          horarioData?.id_materia ??
          null;

        if (materiaId && !formData.idmateria) {
          const resolvedId = String(materiaId);
          setFormData((prev) => ({ ...prev, idmateria: resolvedId }));
          setAutoMateriaId(resolvedId);
        }
      } catch (error) {
        console.error('No se pudo obtener la materia del horario:', error);
      }
    };

    fetchMateriaFromHorario();
  }, [autoMateriaId, formData.idmateria, getStoredUser, location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClear = () => {
    setFormData({
      idreservarentrevista: estudiante?.idreservaentrevista || formData.idreservarentrevista || '',
      idestudiante: estudiante?.idestudiante || formData.idestudiante || '',
      idmotivo: autoMotivoId || '',
      idmateria: autoMateriaId || '',
      fechadecreacion: new Date().toISOString().split('T')[0],
      descripcion: '',
      estado: true,
    });
  };

  const handleSubmit = async () => {
    const reservaId = formData.idreservarentrevista || location.state?.idreservarentrevista;

    if (!reservaId || !formData.idestudiante) {
      setToast({
        message: 'No se puede crear el acta sin un identificador de reserva.',
        type: 'error',
        show: true,
      });
      return;
    }

    const descripcionActual = formData.descripcion;
    const estadoEntrevista = location.state?.estadoEntrevista;

    try {
      await createActaReunion({ ...formData, idreservarentrevista: reservaId });

      if (typeof estadoEntrevista === 'boolean') {
        try {
          await actualizarEstadoEntrevistaProfesor({
            idreservarentrevista: reservaId,
            estado: estadoEntrevista,
            idProfesor: location.state?.idProfesor || location.state?.idprofesor || null,
          });
        } catch (err) {
          console.error('El acta se creo pero no se pudo actualizar el estado de la entrevista:', err);
          setToast({
            message: 'Acta creada, pero no se pudo actualizar el estado de la entrevista. Intenta nuevamente.',
            type: 'warning',
            show: true,
          });
        }
      }

      setToast({ message: 'Acta creada exitosamente', type: 'success', show: true });
      buildActaPreview(descripcionActual);
      setFormData({
        idreservarentrevista: estudiante?.idreservaentrevista || reservaId || '',
        idestudiante: estudiante?.idestudiante || '',
        idmotivo: '',
        idmateria: '',
        fechadecreacion: new Date().toISOString().split('T')[0],
        descripcion: '',
        estado: true,
      });

      navigate('/listaEntrevistas', {
        replace: true,
        state: {
          fechaSeleccionada: location.state?.fechaSeleccionada || null,
          idreservarentrevista: reservaId,
          estadoEntrevista,
          toastMessage: 'Entrevista actualizada con el acta.',
          toastType: 'success',
        },
      });
    } catch (error) {
      console.error('Error al crear el acta:', error);
      setToast({
        message: 'Error al crear el acta. Verifica los datos e intentalo nuevamente.',
        type: 'error',
        show: true,
      });
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const handlePrintPreview = () => {
    if (!previewRef.current) return;
    const printStyles = `
      body { font-family: 'Times New Roman', serif; padding: 40px; }
      h2 { text-align: center; margin-bottom: 12px; }
      .acta-letter__header { text-align: center; margin-bottom: 16px; }
      .acta-letter__meta { margin-bottom: 20px; }
      .acta-letter__section { margin-bottom: 16px; }
      .acta-letter__signatures { display: flex; justify-content: space-between; margin-top: 40px; gap: 24px; }
      .acta-letter__signatures div { text-align: center; }
      .signature-line { display: block; margin-top: 40px; border-top: 1px solid #111; padding-top: 4px; }
    `;
    const printWindow = window.open('', '', 'width=900,height=650');
    if (!printWindow) return;
    printWindow.document.write(
      `<html><head><title>Acta de reunion</title><style>${printStyles}</style></head><body>${previewRef.current.innerHTML}</body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownloadPDF = () => {
    if (!actaPreview) return;
    const doc = new jsPDF();
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 20, 10, 26, 26);
    }
    doc.setFontSize(10);
    doc.text('UNIDAD EDUCATIVA INSTITUTO DE EDUCACION BANCARIA', 105, 18, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Acta de reunion', 105, 28, { align: 'center' });
    doc.setFontSize(12);

    let cursorY = 42;
    doc.text(`Fecha: ${actaPreview.fecha}`, 20, cursorY);
    cursorY += 7;
    doc.text(`Hora: ${actaPreview.hora}`, 20, cursorY);
    cursorY += 10;
    doc.text(`Estudiante: ${actaPreview.estudiante}`, 20, cursorY);
    cursorY += 7;
    doc.text(`Materia: ${actaPreview.materia}`, 20, cursorY);
    cursorY += 7;
    doc.text(`Motivo: ${actaPreview.motivo}`, 20, cursorY);
    cursorY += 12;
    doc.setFont(undefined, 'bold');
    doc.text('Descripcion de la reunion:', 20, cursorY);
    doc.setFont(undefined, 'normal');
    cursorY += 8;
    const descripcionLines = doc.splitTextToSize(actaPreview.descripcion, 170);
    doc.text(descripcionLines, 20, cursorY);
    cursorY += descripcionLines.length * 6 + 20;

    const signatureY = cursorY + 10;
    const leftCenter = 0.5 * (30 + 95);
    const rightCenter = 0.5 * (115 + 180);
    doc.line(30, signatureY, 95, signatureY);
    const padreFirmante = actaPreview.padre || obtenerPadreFirmante();
    doc.setFont('helvetica', 'bold');
    doc.text(actaPreview.profesor || '________________________', leftCenter, signatureY + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Firma del profesor(a)', leftCenter, signatureY + 12, { align: 'center' });

    doc.line(115, signatureY, 180, signatureY);
    doc.setFont('helvetica', 'bold');
    doc.text(padreFirmante, rightCenter, signatureY + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Firma del padre de familia', rightCenter, signatureY + 12, { align: 'center' });

    doc.save(`acta-${formData.idreservarentrevista || 'entrevista'}.pdf`);
  };

  return (
    <>

      <main className="actas-layout">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: '', type: '', show: false })}
          />
        )}

        <section className="actas-hero">
          <div className="actas-hero__content">
            <span className="actas-hero__eyebrow">Nueva acta</span>
            <h1>Detalle de la acta</h1>
            <p>
             Registre los puntos que se llevaron a cabo en la entrevista. Por favor, complete todos los campos. Posteriormente imprima el acta para que el padre de familia lo firmey se consolide la entrevista 
            </p>
            <div className="actas-hero__meta">
              <article className="actas-meta-card">
                <span>Estudiante</span>
                <strong>
                  {estudiante
                    ? `${estudiante.nombres} ${estudiante.apellidopaterno} ${estudiante.apellidomaterno}`
                    : 'Cargando...'}
                </strong>
              </article>
              
              <article className="actas-meta-card">
                <span>Fecha</span>
                <strong>{formData.fechadecreacion}</strong>
              </article>
            </div>
          </div>
          <div className="actas-hero__avatar">
            <img src={imgEstudiantes} alt="Ilustracion estudiante" />
          </div>
        </section>

        <section className="actas-form">
          <header className="actas-form__header">
            <div>
              <h2>Detalle del acta</h2>
              <p>Todos los campos son obligatorios para garantizar el seguimiento correcto.</p>
            </div>
            <button type="button" className="ghost-button" onClick={handleClear}>
              Limpiar campos
            </button>
          </header>

          <div className="actas-form__grid">
            <div className="actas-field actas-field--full">
              <label htmlFor="student-name">Nombre del estudiante</label>
              <input
                id="student-name"
                type="text"
                value={
                  estudiante
                    ? `${estudiante.nombres} ${estudiante.apellidopaterno} ${estudiante.apellidomaterno}`
                    : 'Cargando...'
                }
                disabled
              />
            </div>
            <div className="actas-field">
              <label htmlFor="motivo">Motivo</label>
              <select
                id="motivo"
                name="idmotivo"
                value={formData.idmotivo}
                onChange={handleChange}
                disabled={Boolean(formData.idmotivo)}
              >
                <option value="">Selecciona el motivo</option>
                {motivos.map((motivo) => (
                  <option key={motivo.idmotivo} value={motivo.idmotivo}>
                    {motivo.nombremotivo}
                  </option>
                ))}
              </select>
            </div>
            <div className="actas-field">
              <label htmlFor="materia">Materia</label>
              <select
                id="materia"
                name="idmateria"
                value={formData.idmateria}
                onChange={handleChange}
                disabled={Boolean(formData.idmateria)}
              >
                <option value="">Selecciona la materia</option>
                {materias.map((materia) => (
                  <option key={materia.idmateria} value={materia.idmateria}>
                    {materia.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="actas-field">
              <label htmlFor="fecha">Fecha</label>
              <input id="fecha" type="date" name="fechadecreacion" value={formData.fechadecreacion} readOnly />
            </div>
            <div className="actas-field actas-field--full">
              <label htmlFor="descripcion">Descripcion</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe los acuerdos, compromisos y observaciones relevantes."
              />
            </div>
          </div>

          <div className="actas-form__actions">
            <button type="button" className="ghost-button" onClick={handleClear}>
              Limpiar
            </button>
            <button type="button" className="primary-button" onClick={handleSubmit}>
              Crear acta
            </button>
          </div>
        </section>
      </main>
      {isPreviewOpen && actaPreview && (
        <div className="acta-preview-backdrop" role="dialog" aria-modal="true">
          <div className="acta-preview-card">
            <div className="acta-preview-letter" ref={previewRef}>
              <div className="acta-letter__header">
                <img src={logoIdeb} alt="Logo institucional" className="acta-letter__logo" />
                <div className="acta-letter__title">
                  <p className="acta-letter__eyebrow">UNIDAD EDUCATIVA INSTITUTO DE EDUCACION BANCARIA</p>
                  <h2>Acta de reunion</h2>
                </div>
              </div>
              <div className="acta-letter__meta">
                <p>
                  <strong>Fecha:</strong> {actaPreview.fecha}
                </p>
                <p>
                  <strong>Hora:</strong> {actaPreview.hora}
                </p>
              </div>
              <div className="acta-letter__section">
                <p>
                  <strong>Estudiante:</strong> {actaPreview.estudiante}
                </p>
                <p>
                  <strong>Materia:</strong> {actaPreview.materia}
                </p>
                <p>
                  <strong>Motivo:</strong> {actaPreview.motivo}
                </p>
              </div>
              <div className="acta-letter__section">
                <p>
                  <strong>Descripcion:</strong>
                </p>
                <p>{actaPreview.descripcion}</p>
              </div>
              <div className="acta-letter__section">
                <p>
                  Se deja constancia de los acuerdos alcanzados entre el docente y el padre/madre de familia,
                  comprometiendose ambas partes a dar seguimiento oportuno.
                </p>
              </div>
              <div className="acta-letter__signatures">
                <div className="signature-block">
                  <span className="signature-line" />
                  <strong>{actaPreview.profesor || '________________________'}</strong>
                  <small>Firma del profesor(a)</small>
                </div>
                <div className="signature-block">
                  <span className="signature-line" />
                  <strong>{actaPreview.padre || '________________________'}</strong>
                  <small>Firma del padre de familia</small>
                </div>
              </div>
            </div>
            <div className="acta-preview-actions">
              <button type="button" onClick={handlePrintPreview}>
                Imprimir
              </button>
              <button type="button" onClick={handleDownloadPDF}>
                Descargar PDF
              </button>
              <button type="button" className="ghost-button" onClick={closePreview}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FormActas;
