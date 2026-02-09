import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPadreById, getPadreConEstudiantes } from '../../padres/services/PadreDeFamilia.jsx';
import { agendarEntrevista, obtenerEntrevistasPorPadre, obtenerListaEntrevistaPorFecha } from '../services/teoriaDeColas.service.jsx';
import { getMotivos } from '../../motivos/services/motivo.service.jsx';
import { getMateria, getMateriaById } from '../../materias/services/materia.service.jsx';
import { getHorariosById, getHorarioByProfesor } from '../../horarios/services/horario.service.jsx';
import { getPsicologo, getPsicologoById } from '../../psicologos/services/psicologo.service.jsx';
import './CitarPadres.css';
import Header from '../../../components/Header.jsx';
import Toast from '../../../components/Toast.jsx';
import FullScreenLoader from '../../../components/ProgresoCircular.jsx';

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

const weekdayIndexMap = {
  DOMINGO: 0,
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
};

const normalizeDiaTexto = (dia) =>
  (dia || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

const resolveHorarioDiaIndex = (diaValue) => {
  if (diaValue === null || diaValue === undefined) return null;
  if (typeof diaValue === 'string' && diaValue.trim() === '') return null;
  const dayNumber = Number(diaValue);
  if (Number.isFinite(dayNumber) && dayNumber >= 0 && dayNumber <= 7) {
    return dayNumber % 7;
  }
  const normalized = normalizeDiaTexto(diaValue);
  return weekdayIndexMap[normalized] ?? null;
};

const resolveNumericId = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === 'undefined' || trimmed === 'null' || trimmed === 'nan') {
        continue;
      }
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return null;
};

const findPsicologoByEmail = (lista, email) => {
  if (!email) return null;
  const normalizedEmail = String(email).trim().toLowerCase();
  return (
    lista.find((ps) => String(ps?.email ?? '').trim().toLowerCase() === normalizedEmail) || null
  );
};

const normalizeRole = (rol) =>
  (rol || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const parseHorarioPayload = (payload) => {
  if (!payload) return null;

  const posibleData = payload?.data ?? payload?.horario ?? payload?.horarios ?? payload;
  const value = Array.isArray(posibleData) ? posibleData[0] : posibleData;
  if (!value) return null;

  const horarioValue =
    value?.horario ??
    value?.Horario ??
    value?.horarios ??
    value?.Horarios ??
    value?.horarioAsignado ??
    value?.horario_asignado ??
    value;

  return {
    ...value,
    ...horarioValue,
    idhorario:
      horarioValue?.idhorario ??
      horarioValue?.idHorario ??
      horarioValue?.id_horario ??
      horarioValue?.horario_id ??
      horarioValue?.id ??
      value.idhorario ??
      value.idHorario ??
      value.id_horario ??
      value.horario_id ??
      value.id,
    dia:
      horarioValue?.dia ??
      horarioValue?.Dia ??
      horarioValue?.nombreDia ??
      horarioValue?.nombre_dia ??
      horarioValue?.diaSemana ??
      horarioValue?.dia_semana ??
      horarioValue?.diasemana ??
      horarioValue?.diaEntrevista ??
      horarioValue?.dia_entrevista ??
      value.dia ??
      value.Dia ??
      value.nombreDia ??
      value.nombre_dia ??
      value.diaSemana ??
      value.dia_semana ??
      value.diasemana ??
      value.diaEntrevista ??
      value.dia_entrevista,
    idmateria:
      horarioValue?.idmateria ??
      horarioValue?.idMateria ??
      horarioValue?.materia_id ??
      horarioValue?.id_materia ??
      value.idmateria ??
      value.idMateria ??
      value.materia_id ??
      value.id_materia,
    nombremateria:
      horarioValue?.nombremateria ??
      horarioValue?.nombreMateria ??
      horarioValue?.materia ??
      horarioValue?.nombre_materia ??
      horarioValue?.nombre ??
      value.nombremateria ??
      value.nombreMateria ??
      value.materia ??
      value.nombre_materia ??
      value.nombre,
  };
};

const normalizeUserHorario = (user) => {
  if (!user) return null;
  const rawHorario = user.horario ?? user.Horario ?? user.horarios ?? user.Horarios;
  return rawHorario ? parseHorarioPayload(rawHorario) : null;
};

const getWeekdayIndexFromISO = (isoDate) => {
  if (!isoDate) return null;
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getUTCDay();
};

const parseTimeToMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const normalizeISODate = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    const iso = value.toISOString();
    return iso.split('T')[0];
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.split('T')[0];
  }
  return null;
};

const extractEntrevistasFromPadreResponse = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.entrevistas)) return data.entrevistas;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const resolveEntrevistaFecha = (ent) =>
  normalizeISODate(
    ent?.fecha ||
      ent?.fechaEntrevista ||
      ent?.fecha_entrevista ||
      ent?.fechaentrevista ||
      ent?.fechaReserva ||
      ent?.fecha_reserva
  );

const resolveEntrevistaMateriaId = (ent) =>
  resolveNumericId(ent?.idmateria, ent?.idMateria, ent?.materia_id, ent?.id_materia, ent?.materia);

const resolveEntrevistaProfesorId = (ent) =>
  resolveNumericId(ent?.idprofesor, ent?.idProfesor, ent?.id_profesor, ent?.profesor_id);

const resolveEntrevistaPsicologoId = (ent) =>
  resolveNumericId(ent?.idpsicologo, ent?.idPsicologo, ent?.id_psicologo, ent?.psicologo_id);

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const role = parsed.role || parsed.rol || '';
    const roleNormalized = normalizeRole(role);
    const idBase = resolveNumericId(parsed.id, parsed.idusuario, parsed.idUsuario, parsed.id_usuario);
    const idHorario = resolveNumericId(
      parsed.idHorario,
      parsed.idhorario,
      parsed.id_horario,
      parsed.horario_id
    );
    const idProfesor = resolveNumericId(
      parsed.idProfesor,
      parsed.idprofesor,
      parsed.id_Profesor,
      parsed.id_profesor,
      roleNormalized === 'profesor' ? idBase : null
    );
    const idPsicologo = resolveNumericId(
      parsed.idPsicologo,
      parsed.idpsicologo,
      parsed.id_Psicologo,
      parsed.id_psicologo,
      roleNormalized === 'psicologo' ? idBase : null
    );

    return {
      ...parsed,
      role,
      rol: role || parsed.rol,
      idHorario,
      idhorario: idHorario ?? parsed.idhorario,
      idProfesor,
      idprofesor: idProfesor ?? parsed.idprofesor,
      idPsicologo,
      idpsicologo: idPsicologo ?? parsed.idpsicologo,
      horarioNormalizado: normalizeUserHorario(parsed),
    };
  } catch (error) {
    console.error('No se pudo leer la session del usuario:', error);
    return null;
  }
};


const CitarPadres = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { idPadre, padreData } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const capacidadRequestRef = useRef(0);

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
    idestudiante: '',
    estudianteNombre: '',
  });

  const [motivos, setMotivos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [meetInfo, setMeetInfo] = useState({ link: '', horaInicio: '', horaFin: '', fecha: '' });
  const [isVirtual, setIsVirtual] = useState(true);
  const [horarioMeta, setHorarioMeta] = useState(null);
  const [horarioError, setHorarioError] = useState('');
  const [fechasLlenas, setFechasLlenas] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('agendaLlenaInfo');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return parsed?.fecha ? [parsed.fecha] : [];
    } catch (err) {
      console.error('No se pudo leer agenda llena local:', err);
      return [];
    }
  });

  const appendMeetLinkToDescription = useCallback((link) => {
    if (!link) return;
    const linkLine = `Enlace Meet: ${link}`;
    setFormData((prev) => {
      const current = prev.descripcion || '';
      if (current.includes(linkLine)) return prev;
      const separator = current ? '\n' : '';
      return { ...prev, descripcion: `${current}${separator}${linkLine}` };
    });
  }, []);

  const usuario = useMemo(() => getStoredUser(), []);

  const todayDate = useMemo(() => getLocalISODate(0), []);
  const tomorrowDate = useMemo(() => getLocalISODate(1), []);
  const horarioDiaIndex = useMemo(
    () => resolveHorarioDiaIndex(horarioMeta?.dia ?? horarioMeta?.horario?.dia),
    [horarioMeta?.dia, horarioMeta?.horario?.dia]
  );
  const minFechaPermitida = useMemo(() => {
    if (horarioDiaIndex === null || horarioDiaIndex === undefined) return tomorrowDate;
    for (let offset = 1; offset <= 14; offset += 1) {
      const candidate = getLocalISODate(offset);
      if (getWeekdayIndexFromISO(candidate) === horarioDiaIndex) {
        return candidate;
      }
    }
    return tomorrowDate;
  }, [horarioDiaIndex, tomorrowDate]);
  const dateStep = useMemo(() => (horarioDiaIndex === null || horarioDiaIndex === undefined ? 1 : 7), [
    horarioDiaIndex,
  ]);
  const fechaInvalidaPorHorario = (fechaISO) => {
    if (!fechaISO || horarioDiaIndex === null || horarioDiaIndex === undefined) return false;
    return getWeekdayIndexFromISO(fechaISO) !== horarioDiaIndex;
  };
  const materiaBloqueadaPorHorario = Boolean(horarioMeta?.idmateria);
  const horarioFinMinutos = parseTimeToMinutes(
    horarioMeta?.horafin ||
      horarioMeta?.horaFin ||
      horarioMeta?.horafinentrevista ||
      horarioMeta?.horafinentrevistas ||
      horarioMeta?.hora_fin ||
      horarioMeta?.horario?.horafin
  );

  const formatStudentName = (est) =>
    `${est.nombres || ''} ${est.apellidopaterno || ''} ${est.apellidomaterno || ''}`
      .replace(/\s+/g, ' ')
      .trim();

  const apellidoPadre = useMemo(
    () => ({
      paterno: (padreData?.apellidopaterno || '').toString().trim().toLowerCase(),
      materno: (padreData?.apellidomaterno || '').toString().trim().toLowerCase(),
    }),
    [padreData?.apellidopaterno, padreData?.apellidomaterno]
  );

  const estudiantesRelacionados = useMemo(() => {
    const base = Array.isArray(estudiantes) ? estudiantes : [];
    if (!base.length) return [];

    const matches = base.filter((est) => {
      const ap = (est.apellidopaterno || '').toString().trim().toLowerCase();
      const am = (est.apellidomaterno || '').toString().trim().toLowerCase();
      return (apellidoPadre.paterno && ap === apellidoPadre.paterno) || (apellidoPadre.materno && am === apellidoPadre.materno);
    });

    return matches.length ? matches : base;
  }, [apellidoPadre.materno, apellidoPadre.paterno, estudiantes]);

  const estudiantesFiltrados = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    const base = estudiantesRelacionados;
    if (!term) return base;
    return base.filter((est) => formatStudentName(est).toLowerCase().includes(term));
  }, [estudiantesRelacionados, studentSearch]);

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
    const fetchEstudiantes = async () => {
      try {
        if (idPadre) {
          const response = await getPadreConEstudiantes(idPadre);
          const lista = Array.isArray(response?.data?.estudiantes) ? response.data.estudiantes : [];
          setEstudiantes(lista);

          if (response?.data?.padre) {
            setFormData((prev) => ({
              ...prev,
              nombres:
                prev.nombres ||
                `${response.data.padre.nombres || ''} ${response.data.padre.apellidopaterno || ''} ${response.data.padre.apellidomaterno || ''}`
                  .replace(/\s+/g, ' ')
                  .trim(),
              email: prev.email || response.data.padre.email || '',
              numcelular: prev.numcelular || response.data.padre.numcelular || '',
            }));
          }
        } else {
          const embedded =
            (Array.isArray(location.state?.estudiantes) && location.state.estudiantes) ||
            (Array.isArray(padreData?.estudiantes) && padreData.estudiantes) ||
            [];
          setEstudiantes(embedded);
        }

        const idEstudianteState =
          location.state?.idEstudiante ||
          location.state?.idestudiante ||
          null;

        if (idEstudianteState) {
          setFormData((prev) => ({ ...prev, idestudiante: String(idEstudianteState) }));
        }
      } catch (error) {
        console.error('Error al obtener estudiantes del padre:', error);
        setToast({
          message: 'No se pudieron cargar los estudiantes para la cita.',
          type: 'error',
        });
        setEstudiantes([]);
      }
    };

    fetchEstudiantes();
  }, [idPadre, location.state?.idEstudiante, location.state?.idestudiante, location.state?.estudiantes, padreData?.estudiantes]);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        // Si ya tenemos el idmateria del horario, pedimos solo esa para alinear con las rutas actuales
        if (horarioMeta?.idmateria) {
          const resp = await getMateriaById(horarioMeta.idmateria);
          const unica = resp?.data ? [resp.data] : [];
          setMaterias(unica);
          return;
        }

        // Si no hay idmateria en horario, cargamos la lista completa
        const response = await getMateria();
        const lista = response.data || [];
        setMaterias(lista);
      } catch (error) {
        console.error('Error al obtener materias:', error);
        setToast({
          message: 'Error al obtener materias.',
          type: 'error',
        });
        setMaterias([]);
      }
    };
    fetchMaterias();
  }, [horarioMeta?.idmateria]);

  useEffect(() => {
    if (!usuario) return;

    const roleNormalized = normalizeRole(usuario?.role || usuario?.rol);
    const profesorId = resolveNumericId(
      roleNormalized === 'profesor'
        ? usuario?.idProfesor ??
          usuario?.idprofesor ??
          usuario?.id_Profesor ??
          usuario?.id_profesor ??
          usuario?.id ??
          usuario?.idusuario ??
          usuario?.idUsuario
        : null
    );
    const psicologoId = resolveNumericId(
      roleNormalized === 'psicologo'
        ? usuario?.idPsicologo ??
          usuario?.idpsicologo ??
          usuario?.id_Psicologo ??
          usuario?.id_psicologo ??
          usuario?.id ??
          usuario?.idusuario ??
          usuario?.idUsuario
        : null
    );
    const horarioId = resolveNumericId(
      usuario?.idHorario,
      usuario?.idhorario,
      usuario?.horarioNormalizado?.idhorario
    );
    const horarioLocal = usuario?.horarioNormalizado || null;

    if (horarioLocal && !horarioMeta) {
      setHorarioMeta(horarioLocal);
    }

    if (!profesorId && !psicologoId && !horarioId && !horarioLocal) {
      setHorarioError('No tienes un horario asignado para agendar entrevistas.');
      return;
    }

    const fetchHorario = async () => {
      try {
        let data = null;

        if (profesorId) {
          const resp = await getHorarioByProfesor(profesorId);
          data = parseHorarioPayload(resp);
        }

        if (!data && psicologoId) {
          try {
            const respPsicologo = await getPsicologoById(psicologoId);
            const psicologoData = respPsicologo?.data ?? null;
            const psicologoHorarioId = resolveNumericId(
              psicologoData?.idhorario,
              psicologoData?.idHorario,
              psicologoData?.id_horario,
              psicologoData?.horario_id
            );
            if (psicologoHorarioId) {
              const respHorario = await getHorariosById(psicologoHorarioId);
              data = parseHorarioPayload(respHorario);
            }
            if (!data && psicologoData) {
              data = parseHorarioPayload(psicologoData);
            }
          } catch (psError) {
            console.error('No se pudo obtener el psicologo por ID:', psError);
          }
        }
        if (!data && usuario?.email) {
          try {
            const respPsicologos = await getPsicologo();
            const lista = Array.isArray(respPsicologos?.data) ? respPsicologos.data : [];
            const psicologoData = findPsicologoByEmail(lista, usuario.email);
            const psicologoHorarioId = resolveNumericId(
              psicologoData?.idhorario,
              psicologoData?.idHorario,
              psicologoData?.id_horario,
              psicologoData?.horario_id
            );
            if (psicologoHorarioId) {
              const respHorario = await getHorariosById(psicologoHorarioId);
              data = parseHorarioPayload(respHorario);
            }
            if (!data && psicologoData) {
              data = parseHorarioPayload(psicologoData);
            }
          } catch (psError) {
            console.error('No se pudo obtener el psicologo por email:', psError);
          }
        }

        if (!data && horarioId) {
          const resp = await getHorariosById(horarioId);
          data = parseHorarioPayload(resp);
        }

        if (!data && horarioLocal) {
          data = horarioLocal;
        }

        setHorarioMeta(data || null);
        setHorarioError(data ? '' : 'No se pudo obtener el horario asignado para agendar.');
      } catch (error) {
        console.error('Error al obtener el horario del usuario:', error);
        setHorarioError('No se pudo obtener el dia asignado para agendar.');
        setHorarioMeta(null);
        setToast({
          message: 'No se pudo obtener el horario asignado para tus entrevistas.',
          type: 'error',
        });
      }
    };

    fetchHorario();
  }, [
    usuario?.idProfesor,
    usuario?.idprofesor,
    usuario?.id_Profesor,
    usuario?.id_profesor,
    usuario?.idPsicologo,
    usuario?.idpsicologo,
    usuario?.id_Psicologo,
    usuario?.id_psicologo,
    usuario?.idHorario,
    usuario?.idhorario,
    usuario?.id,
    usuario?.idusuario,
    usuario?.idUsuario,
    usuario?.email,
    usuario?.role,
    usuario?.rol,
    usuario?.horarioNormalizado,
  ]);

  // Sincroniza la materia con el horario cuando ambos esten disponibles
  useEffect(() => {
    if (!horarioMeta?.idmateria) return;
    const materiaId = Number(horarioMeta.idmateria);
    const selectedMateria =
      materias.find((m) => Number(m.idmateria) === materiaId) ||
      (horarioMeta?.nombremateria
        ? { idmateria: materiaId, nombre: horarioMeta.nombremateria }
        : null);

    if (selectedMateria && !materias.some((m) => Number(m.idmateria) === materiaId)) {
      setMaterias((prev) => [...prev, selectedMateria]);
    }

    setFormData((prev) => ({
      ...prev,
      materia: materiaId,
      nombremateria: selectedMateria?.nombre || prev.nombremateria,
    }));
  }, [horarioMeta?.idmateria, horarioMeta?.nombremateria, materias]);

  // Si el horario llega despues de que el usuario selecciono, revalida y limpia si corresponde
  useEffect(() => {
    if (formData.fecha && fechaInvalidaPorHorario(formData.fecha)) {
      setFormData((prev) => ({ ...prev, fecha: '' }));
      setToast({
        message: `Solo puedes agendar en ${horarioMeta?.dia || 'el dia asignado en tu horario'}.`,
        type: 'error',
      });
    }
  }, [horarioDiaIndex, horarioMeta?.dia]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (!selectedDate) {
      setFormData((prev) => ({ ...prev, fecha: '' }));
      return;
    }

    if (fechasLlenas.includes(selectedDate)) {
      setToast({
        message: 'La agenda para esa fecha ya se encuentra llena. Selecciona otra fecha disponible.',
        type: 'error',
      });
      setFormData((prev) => ({ ...prev, fecha: '' }));
      e.target.value = '';
      return;
    }

    if (selectedDate && selectedDate <= todayDate) {
      setToast({
        message: 'No se puede agendar para el mismo dia. Selecciona una fecha posterior.',
        type: 'error',
      });
      setFormData((prev) => ({ ...prev, fecha: '' }));
      return;
    }

    if (esFinDeSemana(selectedDate)) {
      setToast({
        message: 'No es un dia habil (sabado y domingo no estan permitidos).',
        type: 'error',
      });
      setFormData((prev) => ({ ...prev, fecha: '' }));
      return;
    }

    const selectedDayIndex = getWeekdayIndexFromISO(selectedDate);
    if (horarioDiaIndex !== null && horarioDiaIndex !== undefined && selectedDayIndex !== horarioDiaIndex) {
      setToast({
        message: `Solo puedes agendar en ${horarioMeta?.dia || 'el dia asignado en tu horario'}.`,
        type: 'error',
      });
      setFormData((prev) => ({ ...prev, fecha: '' }));
      return;
    } else {
      setFormData((prev) => ({ ...prev, fecha: selectedDate }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'materia') {
      if (materiaBloqueadaPorHorario) {
        setToast({
          message: 'La materia esta fijada por tu horario asignado.',
          type: 'info',
        });
        return;
      }
        const selectedMateria = materias.find((m) => m.idmateria === parseInt(value, 10));
        setFormData({
          ...formData,
          materia: value !== '' ? Number(value) : '',
          nombremateria: selectedMateria ? selectedMateria.nombre : '',
        });
    } else if (name === 'idestudiante') {
      setFormData({ ...formData, idestudiante: value });
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
      idestudiante: '',
      estudianteNombre: '',
    }));
    setMeetInfo({ link: '', horaInicio: '', horaFin: '', fecha: '' });
    setStudentSearch('');
    setIsVirtual(true);
  };

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

  // Verificar en backend si la fecha ya está llena para el horario del usuario
  useEffect(() => {
    const verificarCapacidad = async () => {
      if (!formData.fecha || !horarioFinMinutos || !horarioMeta) return;
      const requestId = capacidadRequestRef.current + 1;
      capacidadRequestRef.current = requestId;
      const fechaSeleccionada = formData.fecha;
      try {
        // Resuelve los IDs segun rol
        const userRole = usuario?.role || usuario?.rol;
        const idProfesor =
          userRole === 'Profesor'
            ? usuario?.idProfesor ?? usuario?.idprofesor ?? usuario?.id
            : null;
        const idPsicologo =
          userRole === 'Psicologo'
            ? usuario?.idPsicologo ?? usuario?.idpsicologo ?? usuario?.id
            : null;

        const resp = await obtenerListaEntrevistaPorFecha(formData.fecha, idProfesor, idPsicologo);
        if (capacidadRequestRef.current !== requestId) return;
        const entrevistas = Array.isArray(resp?.data) ? resp.data : [];

        // Tomar la mayor hora fin y compararla con el fin de horario
        const maxFin = entrevistas.reduce((max, ent) => {
          const minutos = parseTimeToMinutes(ent.horafin) ?? parseTimeToMinutes(ent.horaFin);
          if (minutos === null) return max;
          return max === null || minutos > max ? minutos : max;
        }, null);

        if (maxFin !== null && maxFin >= horarioFinMinutos) {
          if (capacidadRequestRef.current !== requestId) return;
          setFechasLlenas((prev) =>
            prev.includes(fechaSeleccionada) ? prev : [...prev, fechaSeleccionada]
          );
          setToast({
            message: 'La agenda para esa fecha ya se encuentra llena. Selecciona otra fecha disponible.',
            type: 'error',
          });
          setFormData((prev) => (prev.fecha === fechaSeleccionada ? { ...prev, fecha: '' } : prev));
        }
      } catch (error) {
        console.error('No se pudo verificar la capacidad para la fecha seleccionada:', error);
      }
    };

    verificarCapacidad();
  }, [formData.fecha, horarioFinMinutos, horarioMeta, usuario?.idProfesor, usuario?.idprofesor, usuario?.idPsicologo, usuario?.idpsicologo, usuario?.id, usuario?.role, usuario?.rol]);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userRole = usuario?.role || usuario?.rol;

    if (!usuario || (userRole !== 'Profesor' && userRole !== 'Psicologo')) {
      setToast({ message: 'Solo profesores o psicologos pueden agendar citas.', type: 'error' });
      setIsLoading(false);
      return;
    }

    const idProfesor =
      userRole === 'Profesor'
        ? usuario.idProfesor ?? usuario.idprofesor ?? usuario.id
        : null;
    const idPsicologo =
      userRole === 'Psicologo'
        ? usuario.idPsicologo ?? usuario.idpsicologo ?? usuario.id
        : null;
    const idhorario =
      usuario?.idHorario ??
      usuario?.idhorario ??
      usuario?.horarioNormalizado?.idhorario ??
      horarioMeta?.idhorario;
    const idEstudiante = Number(formData.idestudiante) || null;

  const { motivo: idMotivo, materia: idMateria, fecha, descripcion } = formData;
  const materiaId = Number(idMateria) || null;

  if ((!idProfesor && !idPsicologo) || !idPadre || !idMotivo || !idMateria || !fecha || !descripcion || !idEstudiante) {
    setToast({
      message: 'Complete todos los campos obligatorios, incluido el estudiante.',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    if (!idhorario) {
      setToast({
        message: 'No tienes un horario asignado para agendar entrevistas.',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    const selectedDayIndex = getWeekdayIndexFromISO(fecha);
    if (horarioDiaIndex !== null && horarioDiaIndex !== undefined && selectedDayIndex !== horarioDiaIndex) {
      setToast({
        message: `La fecha seleccionada no coincide con tu dia habil (${horarioMeta?.dia || 'segun tu horario'}).`,
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    let permitirMultiples = false;

    if (idPadre && fecha) {
      try {
        const respPadre = await obtenerEntrevistasPorPadre(idPadre);
        const entrevistasPadre = extractEntrevistasFromPadreResponse(respPadre);
        const fechaISO = normalizeISODate(fecha);
        const entrevistasMismoDia = entrevistasPadre.filter(
          (ent) => resolveEntrevistaFecha(ent) === fechaISO
        );

        if (entrevistasMismoDia.length) {
          const conflictoMismaMateria = entrevistasMismoDia.some((ent) => {
            const entMateriaId = resolveEntrevistaMateriaId(ent);
            const entProfesorId = resolveEntrevistaProfesorId(ent);
            const entPsicologoId = resolveEntrevistaPsicologoId(ent);
            const mismoResponsable =
              (idProfesor && entProfesorId && Number(entProfesorId) === Number(idProfesor)) ||
              (idPsicologo && entPsicologoId && Number(entPsicologoId) === Number(idPsicologo));
            return mismoResponsable && entMateriaId && materiaId && Number(entMateriaId) === Number(materiaId);
          });

          if (conflictoMismaMateria) {
            setToast({
              message: 'Este padre ya tiene una entrevista con la misma materia en esa fecha.',
              type: 'error',
            });
            setIsLoading(false);
            return;
          }

          permitirMultiples = true;
        }
      } catch (error) {
        console.error('No se pudo validar entrevistas previas del padre:', error);
      }
    }

    const payloadBase = {
      idProfesor,
      idPsicologo,
      idPadre,
      idEstudiante,
      idestudiante: idEstudiante,
      fecha,
      descripcion,
      idMotivo,
      idMateria,
      idhorario,
      esVirtual: isVirtual,
    };

    const buildPayload = (permitir) => ({
      ...payloadBase,
      permitirMultiplesEntrevistas: permitir,
      permitirEntrevistasMismoDia: permitir,
    });

    try {
      const response = await agendarEntrevista(buildPayload(permitirMultiples));

      if (response.status === 201) {
        setToast({ message: 'Cita agendada exitosamente.', type: 'success' });
        localStorage.removeItem('agendaLlenaInfo');
        setFechasLlenas((prev) => prev.filter((f) => f !== formData.fecha));

        if (isVirtual) {
          setMeetInfo({
            link: response.data?.meetLink || '',
            horaInicio: response.data?.horaInicio || '',
            horaFin: response.data?.horaFin || '',
            fecha: formData.fecha,
          });
          appendMeetLinkToDescription(response.data?.meetLink);
        } else {
          setMeetInfo({ link: '', horaInicio: '', horaFin: '', fecha: '' });
        }

        setTimeout(() => {
          navigate('/psicologoListPadres', {
            state: { toastMessage: 'Cita agendada exitosamente.', toastType: 'success' },
          });
        }, 400);
      }
    } catch (error) {
      const backendMessage = error.response?.data?.error || 'Error al agendar la cita.';
      const lowerMessage = backendMessage.toLowerCase();
      const esDuplicado = lowerMessage.includes('ya tiene una entrevista programada');

      if (esDuplicado && !permitirMultiples) {
        try {
          const retry = await agendarEntrevista(buildPayload(true));
          if (retry.status === 201) {
            setToast({ message: 'Cita agendada exitosamente.', type: 'success' });
            localStorage.removeItem('agendaLlenaInfo');
            setFechasLlenas((prev) => prev.filter((f) => f !== formData.fecha));
            if (isVirtual) {
              setMeetInfo({
                link: retry.data?.meetLink || '',
                horaInicio: retry.data?.horaInicio || '',
                horaFin: retry.data?.horaFin || '',
                fecha: formData.fecha,
              });
              appendMeetLinkToDescription(retry.data?.meetLink);
            } else {
              setMeetInfo({ link: '', horaInicio: '', horaFin: '', fecha: '' });
            }

            setTimeout(() => {
              navigate('/psicologoListPadres', {
                state: { toastMessage: 'Cita agendada exitosamente.', toastType: 'success' },
              });
            }, 400);
            return;
          }
        } catch (retryError) {
          console.error('Reintento de agenda multiple fallo:', retryError);
        }
      }

      if (lowerMessage.includes('no hay espacio disponible')) {
        const info = {
          fecha: formData.fecha,
          nombre: formData.nombres,
          telefono: formData.numcelular,
          motivo: formData.nombremotivo,
        };
        localStorage.setItem('agendaLlenaInfo', JSON.stringify(info));
        setFechasLlenas((prev) => (info.fecha && !prev.includes(info.fecha) ? [...prev, info.fecha] : prev));
      }
      setToast({
        message: backendMessage,
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
                    placeholder="Correo electronico"
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
                    placeholder="Numero de contacto"
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
                    disabled={materiaBloqueadaPorHorario}
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
                  value={fechasLlenas.includes(formData.fecha) ? '' : formData.fecha}
                    onChange={handleDateChange}
                    className="citar-input"
                    min={minFechaPermitida}
                    step={dateStep}
                    disabled={!horarioMeta}
                    required
                />
                  {horarioMeta?.dia && (
                    <small style={{ display: 'block', marginTop: '6px', color: '#4b5563' }}>
                      Solo puedes agendar entrevistas el dia {horarioMeta.dia}. 
                    </small>
                  )}
                  {fechasLlenas.length > 0 && (
                    <small style={{ display: 'block', marginTop: '6px', color: '#b91c1c' }}>
                      Agenda llena para: {fechasLlenas.join(', ')}
                    </small>
                  )}
                  {!horarioMeta && (
                    <small style={{ display: 'block', marginTop: '6px', color: '#b91c1c' }}>
                      Esperando cargar tu horario asignado...
                    </small>
                  )}
                  {horarioError && (
                    <small style={{ display: 'block', marginTop: '6px', color: '#b91c1c' }}>
                      {horarioError}
                    </small>
                  )}
                </div>
                <div className="citar-field">
                  <label>Tutelado</label>
                  <input
                    type="text"
                    className="citar-input"
                    placeholder="Buscar..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                  <select
                    name="idestudiante"
                    value={formData.idestudiante}
                    onChange={handleChange}
                    className="citar-input"
                    required
                  >
                    <option value="">Selecciona el estudiante</option>
                    {estudiantesFiltrados.length === 0 ? (
                      <option value="" disabled>
                        Sin estudiantes disponibles
                      </option>
                    ) : (
                      estudiantesFiltrados.map((est) => (
                        <option key={est.idestudiante || est.idEstudiante} value={est.idestudiante || est.idEstudiante}>
                          {formatStudentName(est)}
                        </option>
                      ))
                    )}
                  </select>
                  <small style={{ display: 'block', marginTop: '6px', color: '#4b5563' }}>
                    Se mostrarán solo los hijos registrados a ese padre de familia.
                  </small>
                </div>
              </div>
            </div>

            <div className="citar-section">
              <div className="citar-field">
                <label>Descripción (esta información será enviada al correo del padre de familia)</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="citar-textarea citar-textarea--largo"
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
