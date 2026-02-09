import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./ListEntrevistas.css";
import ExportActions from "../../../components/ExportActions.jsx";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import DynamicModelForUsers from "../../../components/DynamicModelForUsers.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import {
  obtenerColaEsperaPrioridadFIFO,
  obtenerListaEntrevistaPorFecha,
} from "../services/teoriaDeColas.service.jsx";
import { getHorariosById, getHorarioByProfesor } from "../../horarios/services/horario.service.jsx";
import { getPsicologo, getPsicologoById } from "../../psicologos/services/psicologo.service.jsx";
import { getPadre } from "../../padres/services/PadreDeFamilia.jsx";
import { getMateriaById } from "../../materias/services/materia.service.jsx";
import { actualizarEstadoEntrevistaProfesor } from "../../profesores/services/profesor.service.jsx";
import RoundedActionButton from "../../../components/Buttons/RoundedActionButton.jsx";
import whatsappIcon from "../../../recursos/icons/WhatsApp.svg";
import iconcheck from "../../../recursos/icons/check.svg";
import icondelete from "../../../recursos/icons/delete.svg";
import Toast from "../../../components/Toast.jsx";

const getLocalToday = () => {
  const offset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - offset).toISOString().split("T")[0];
};

const getLocalISODate = (offsetDays = 0) => {
  const offset = new Date().getTimezoneOffset() * 60000;
  const base = new Date(Date.now() - offset);
  base.setDate(base.getDate() + offsetDays);
  return base.toISOString().split("T")[0];
};

const addDaysToISO = (isoDate, offset) => {
  if (!isoDate) return getLocalISODate(offset);
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return getLocalISODate(offset);
  parsed.setDate(parsed.getDate() + offset);
  return parsed.toISOString().split("T")[0];
};

const findNextAllowedDate = (startISO, targetWeekdayIndex) => {
  if (targetWeekdayIndex === null || targetWeekdayIndex === undefined) return startISO;
  const start = new Date(`${startISO}T00:00:00`);
  for (let i = 0; i < 21; i += 1) {
    const candidate = new Date(start);
    candidate.setDate(start.getDate() + i);
    if (candidate.getDay() === targetWeekdayIndex) {
      return candidate.toISOString().split("T")[0];
    }
  }
  return startISO;
};

const formatEstadoMeta = (estadoValor, idEstadoValor, estadoNombreValor) => {
  const idEstado = Number.isFinite(Number(idEstadoValor)) ? Number(idEstadoValor) : null;
  if (idEstado === 1) return { label: "Pendiente", variant: "pending" };
  if (idEstado === 2) return { label: "Completado", variant: "success" };
  if (idEstado === 3) return { label: "Cancelado", variant: "danger" };

  const estadoTexto = (estadoNombreValor || estadoValor || "").toString().trim().toLowerCase();
  if (estadoTexto.includes("pend")) return { label: "Pendiente", variant: "pending" };
  if (["completado", "completada", "true", "realizada"].includes(estadoTexto))
    return { label: "Completado", variant: "success" };
  if (["cancelado", "cancelada", "false", "no realizado", "no realizada"].includes(estadoTexto))
    return { label: "Cancelado", variant: "danger" };

  if (estadoValor === null || estadoValor === undefined) return { label: "Pendiente", variant: "pending" };
  if (typeof estadoValor === "boolean") {
    return estadoValor ? { label: "Completado", variant: "success" } : { label: "Cancelado", variant: "danger" };
  }
  return { label: "Pendiente", variant: "pending" };
};

const formatFechaLarga = (fecha) => {
  if (!fecha) return "Agenda sin fecha";
  const parsed = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Agenda sin fecha";

  return parsed.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const parseFechaHora = (fecha, hora) => {
  if (!fecha || !hora) return null;
  const parsed = new Date(`${fecha}T${hora}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseTimeToMinutes = (time) => {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
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
  (dia || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const normalizeRole = (role) =>
  (role || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const resolveNumericId = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "string") {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === "undefined" || trimmed === "null" || trimmed === "nan") {
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
    lista.find(
      (ps) => String(ps?.email ?? "").trim().toLowerCase() === normalizedEmail
    ) || null
  );
};

const resolveHorarioDiaIndex = (diaValue) => {
  if (diaValue === null || diaValue === undefined) return null;
  if (typeof diaValue === "string" && diaValue.trim() === "") return null;
  const dayNumber = Number(diaValue);
  if (Number.isFinite(dayNumber) && dayNumber >= 0 && dayNumber <= 7) {
    return dayNumber % 7;
  }
  const normalized = normalizeDiaTexto(diaValue);
  return weekdayIndexMap[normalized] ?? null;
};

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

const esFinDeSemana = (fecha) => {
  if (!fecha) return false;
  const parsed = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const day = parsed.getDay();
  return day === 0 || day === 6;
};

const obtenerSaludoSegunHora = (fecha, hora) => {
  const referencia = hora ? parseFechaHora(fecha, hora) : new Date();
  const horaLocal = referencia?.getHours?.() ?? new Date().getHours();
  if (horaLocal < 12) return "Buenos dias";
  if (horaLocal < 19) return "Buenas tardes";
  return "Buenas noches";
};

const safeParseJSON = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("No se pudo parsear la informacion local:", error);
    return null;
  }
};

const normalizeUserInfo = (user) => {
  if (!user) return null;

  const horarioNormalizado = normalizeUserHorario(user);
  const rolRaw = user.role || user.rol || "";
  const rolNormalized = normalizeRole(rolRaw);
  const idBase = resolveNumericId(user.id, user.idusuario, user.idUsuario, user.id_usuario);
  const idProfesor = resolveNumericId(
    user.idProfesor,
    user.idprofesor,
    user.id_Profesor,
    user.id_profesor,
    rolNormalized === "profesor" ? idBase : null
  );
  const idPsicologo = resolveNumericId(
    user.idPsicologo,
    user.idpsicologo,
    user.id_Psicologo,
    user.id_psicologo,
    rolNormalized === "psicologo" ? idBase : null
  );
  const idHorario =
    user.idHorario ??
    user.idhorario ??
    user.id_horario ??
    user.horario_id ??
    horarioNormalizado?.idhorario ??
    null;
  const nombres = user.nombres ?? user.Nombres ?? user.nombre ?? "";
  const apellidopaterno =
    user.apellidopaterno ?? user.ApellidoPaterno ?? user.apellidoPaterno ?? "";
  const apellidomaterno =
    user.apellidomaterno ?? user.ApellidoMaterno ?? user.apellidoMaterno ?? "";
  const nombreCompleto = `${nombres} ${apellidopaterno} ${apellidomaterno}`
    .replace(/\s+/g, " ")
    .trim();

  return {
    ...user,
    rol: rolRaw || user.rol,
    role: user.role || rolRaw,
    idProfesor,
    idprofesor: idProfesor ?? user.idprofesor,
    idPsicologo,
    idpsicologo: idPsicologo ?? user.idpsicologo,
    idHorario,
    idhorario: idHorario ?? user.idhorario,
    horarioNormalizado,
    nombres,
    apellidopaterno,
    apellidomaterno,
    nombreCompleto,
  };
};

const getEntrevistaId = (ent) =>
  ent?.idreservarentrevista ??
  ent?.idreservaentrevista ??
  ent?.id_reservarentrevista ??
  ent?.id ??
  null;

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  return normalizeUserInfo(safeParseJSON(localStorage.getItem("user")));
};

const getStudentName = (ent) =>
  ent?.nombre_estudiante ||
  ent?.estudiante ||
  ent?.nombreEstudiante ||
  ent?.estudiante_nombre ||
  ent?.alumno ||
  "";

const ListEntrevistas = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [entrevistas, setEntrevistas] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState(getLocalToday());
  const [loading, setLoading] = useState(false);
  const [selectedEntrevista, setSelectedEntrevista] = useState(null);
  const [actionType, setActionType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [agendaLlenaInfo, setAgendaLlenaInfo] = useState(() =>
    typeof window === "undefined" ? null : safeParseJSON(localStorage.getItem("agendaLlenaInfo"))
  );
  const [horarioMeta, setHorarioMeta] = useState(null);
  const [horarioDiaIndex, setHorarioDiaIndex] = useState(null);
  const [horarioError, setHorarioError] = useState("");
  const [telefonosPadres, setTelefonosPadres] = useState({});
  const [materiaNombre, setMateriaNombre] = useState("");
  const entrevistasRequestRef = useRef(0);

  const locationIdProfesor = resolveNumericId(location.state?.idProfesor, location.state?.idprofesor);
  const locationIdPsicologo = resolveNumericId(location.state?.idPsicologo, location.state?.idpsicologo);
  const usuarioInfo = useMemo(() => getStoredUser(), []);

  // Muestra toast y re-sincroniza si venimos de crear acta
  useEffect(() => {
    const toastFromNav = location.state?.toastMessage;
    const toastTypeFromNav = location.state?.toastType || "success";
    const fechaFromNav = location.state?.fechaSeleccionada;
    const estadoFromNav = location.state?.estadoEntrevista;
    const idReservaFromNav = location.state?.idreservarentrevista;

    if (fechaFromNav) {
      setFechaFiltro(fechaFromNav);
    }

    // Aplica cambio optimista de estado si viene desde crear acta
    if (idReservaFromNav && typeof estadoFromNav === "boolean") {
      const estadoNavId = estadoFromNav ? 2 : 3;
      const estadoNavLabel = estadoFromNav ? "Completado" : "Cancelado";
      setEntrevistas((prev) =>
        prev.map((ent) =>
          getEntrevistaId(ent) === idReservaFromNav
            ? { ...ent, estado: estadoNavLabel, idestado: estadoNavId }
            : ent
        )
      );
    }

    if (toastFromNav) {
        setToastMessage(toastFromNav);
        setToastType(toastTypeFromNav);
        syncAgendaInfo();
        loadEntrevistas(fechaFromNav || fechaFiltro);
        // limpiamos el state de navegacion
        navigate(location.pathname, { replace: true, state: {} });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const syncAgendaInfo = useCallback(() => {
    if (typeof window === "undefined") return;
    setAgendaLlenaInfo(safeParseJSON(localStorage.getItem("agendaLlenaInfo")));
  }, []);

  const fetchMateriaNombre = useCallback(async (idMateria) => {
    if (!idMateria) return;
    try {
      const response = await getMateriaById(idMateria);
      const data = response?.data;
      const nombre =
        data?.nombre ||
        data?.nombremateria ||
        data?.nombreMateria ||
        data?.materia ||
        "";
      if (nombre) {
        setMateriaNombre(nombre);
      }
    } catch (error) {
      console.error("No se pudo obtener el nombre de la materia:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handler = (event) => {
      if (event.key === "agendaLlenaInfo") {
        setAgendaLlenaInfo(event.newValue ? safeParseJSON(event.newValue) : null);
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    const fetchHorario = async () => {
      const horarioLocal = usuarioInfo?.horarioNormalizado ?? null;
      const horarioId =
        usuarioInfo?.idHorario ??
        usuarioInfo?.idhorario ??
        usuarioInfo?.id_horario ??
        usuarioInfo?.horario_id ??
        horarioLocal?.idhorario ??
        null;
      const rolUsuario = normalizeRole(usuarioInfo?.rol || usuarioInfo?.role);
      const idProfesor = resolveNumericId(
        locationIdProfesor,
        rolUsuario === "profesor"
          ? usuarioInfo?.idProfesor ??
            usuarioInfo?.idprofesor ??
            usuarioInfo?.id_Profesor ??
            usuarioInfo?.id_profesor ??
            usuarioInfo?.id ??
            usuarioInfo?.idusuario ??
            usuarioInfo?.idUsuario
          : null
      );
      const idPsicologo = resolveNumericId(
        locationIdPsicologo,
        rolUsuario === "psicologo"
          ? usuarioInfo?.idPsicologo ??
            usuarioInfo?.idpsicologo ??
            usuarioInfo?.id_Psicologo ??
            usuarioInfo?.id_psicologo ??
            usuarioInfo?.id ??
            usuarioInfo?.idusuario ??
            usuarioInfo?.idUsuario
          : null
      );

      if (!horarioId && !idProfesor && !idPsicologo && !horarioLocal) {
        setHorarioError("No se pudo obtener el horario del usuario.");
        return;
      }
      try {
        let data = null;
        if (idProfesor) {
          const resp = await getHorarioByProfesor(idProfesor);
          data = parseHorarioPayload(resp);
        }
        if (!data && idPsicologo) {
          try {
            const respPsicologo = await getPsicologoById(idPsicologo);
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
            console.error("No se pudo obtener el psicologo por ID:", psError);
          }
        }
        if (!data && usuarioInfo?.email) {
          try {
            const respPsicologos = await getPsicologo();
            const lista = Array.isArray(respPsicologos?.data) ? respPsicologos.data : [];
            const psicologoData = findPsicologoByEmail(lista, usuarioInfo.email);
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
            console.error("No se pudo obtener el psicologo por email:", psError);
          }
        }
        if (!data && horarioId) {
          const response = await getHorariosById(horarioId);
          data = parseHorarioPayload(response);
        }
        if (!data && horarioLocal) {
          data = horarioLocal;
        }
        setHorarioMeta(data || null);
        if (data?.idmateria) {
          fetchMateriaNombre(data.idmateria);
        }
        const diaIdx = resolveHorarioDiaIndex(data?.dia ?? data?.horario?.dia);
        setHorarioDiaIndex(diaIdx);
        setHorarioError(data ? "" : "No se pudo obtener el horario del usuario.");

        // Si la fecha actual no coincide con el dia permitido, ajustar a la siguiente fecha valida
        if (diaIdx !== null) {
          setFechaFiltro((prev) => {
            const today = getLocalToday();
            const base = prev && prev >= today ? prev : today;
            const nextValid = findNextAllowedDate(base, diaIdx);
            return nextValid;
          });
        }
      } catch (error) {
        console.error("Error al obtener el horario:", error);
        setHorarioError("No se pudo obtener el horario del usuario.");
      }
    };

    fetchHorario();
  }, [
    fetchMateriaNombre,
    locationIdProfesor,
    locationIdPsicologo,
    usuarioInfo?.idHorario,
    usuarioInfo?.idhorario,
    usuarioInfo?.id_horario,
    usuarioInfo?.horario_id,
    usuarioInfo?.horarioNormalizado,
    usuarioInfo?.idProfesor,
    usuarioInfo?.idprofesor,
    usuarioInfo?.id_Profesor,
    usuarioInfo?.id_profesor,
    usuarioInfo?.idPsicologo,
    usuarioInfo?.idpsicologo,
    usuarioInfo?.id_Psicologo,
    usuarioInfo?.id_psicologo,
    usuarioInfo?.id,
    usuarioInfo?.idusuario,
    usuarioInfo?.idUsuario,
    usuarioInfo?.email,
    usuarioInfo?.rol,
    usuarioInfo?.role,
  ]);

  // Recalcula el dia permitido cuando llega el horario
  useEffect(() => {
    setHorarioDiaIndex(resolveHorarioDiaIndex(horarioMeta?.dia ?? horarioMeta?.horario?.dia));
  }, [horarioMeta?.dia, horarioMeta?.horario?.dia]);

  useEffect(() => {
    const fetchTelefonos = async () => {
      try {
        const response = await getPadre();
        const registros = response?.data || [];
        const phoneMap = {};
        registros.forEach((padre) => {
          const emailKey = padre.email ? padre.email.trim().toLowerCase() : null;
          const telefono =
            padre.numcelular ||
            padre.telefono ||
            padre.celular ||
            padre.numCelular ||
            padre.telefonoContacto;
          if (emailKey) {
            if (telefono) {
              phoneMap[emailKey] = telefono;
            }
          }
        });
        setTelefonosPadres(phoneMap);
      } catch (error) {
        console.error("No se pudieron obtener los telefonos de los padres:", error);
      }
    };

    fetchTelefonos();
  }, []);

  const loadEntrevistas = useCallback(
    async (fecha) => {
      const requestId = entrevistasRequestRef.current + 1;
      entrevistasRequestRef.current = requestId;
      const isStale = () => entrevistasRequestRef.current !== requestId;

      setLoading(true);
      setToastMessage("");

      try {
        const usuario = getStoredUser();

        if (!usuario) {
          if (!isStale()) {
            setToastMessage("No se encontro informacion del usuario.");
            setToastType("error");
            setEntrevistas([]);
          }
          return;
        }

        const rolUsuario = normalizeRole(usuario.rol || usuario.role);
        const resolvedIdProfesor = resolveNumericId(
          locationIdProfesor,
          rolUsuario === "profesor"
            ? usuario.idProfesor ??
              usuario.idprofesor ??
              usuario.id_Profesor ??
              usuario.id_profesor ??
              usuario.id ??
              usuario.idusuario ??
              usuario.idUsuario
            : null
        );
        const resolvedIdPsicologo = resolveNumericId(
          locationIdPsicologo,
          rolUsuario === "psicologo"
            ? usuario.idPsicologo ??
              usuario.idpsicologo ??
              usuario.id_Psicologo ??
              usuario.id_psicologo ??
              usuario.id ??
              usuario.idusuario ??
              usuario.idUsuario
            : null
        );
        const resolvedHorarioId = resolveNumericId(
          usuario?.idHorario,
          usuario?.idhorario,
          usuario?.horario_id,
          horarioMeta?.idhorario,
          horarioMeta?.idHorario,
          horarioMeta?.id_horario
        );

        const isToday = fecha === getLocalToday();

        let entrevistasObtenidas = [];

        const responsePorFecha = await obtenerListaEntrevistaPorFecha(
          fecha,
          resolvedIdProfesor,
          resolvedIdPsicologo
        );

        if (isStale()) return;

        if (Array.isArray(responsePorFecha?.data)) {
          entrevistasObtenidas = responsePorFecha.data;
        }

        if ((!entrevistasObtenidas || entrevistasObtenidas.length === 0) && isToday) {
          let idhorario = resolvedHorarioId;

          // Intentar resolver idhorario desde el profesor si no viene en la sesion ni en horarioMeta
          if (!idhorario && resolvedIdProfesor) {
            try {
              const respHorario = await getHorarioByProfesor(resolvedIdProfesor);
              if (isStale()) return;
              const dataHorario = Array.isArray(respHorario?.data) ? respHorario.data[0] : respHorario?.data;
              if (dataHorario) {
                idhorario =
                  dataHorario.idhorario ??
                  dataHorario.idHorario ??
                  dataHorario.id_horario ??
                  dataHorario.horario_id ??
                  null;
                if (!isStale()) {
                  setHorarioMeta((prev) => prev || dataHorario);
                }
              }
            } catch (err) {
              console.error("No se pudo resolver el horario por profesor:", err);
            }
          }

          if (idhorario) {
            try {
              const responseCola = await obtenerColaEsperaPrioridadFIFO({ idhorario });
              if (isStale()) return;
              entrevistasObtenidas = Array.isArray(responseCola?.data) ? responseCola.data : [];
            } catch (err) {
              console.error("Error al obtener cola de espera:", err);
            }
          } else {
            if (!isStale()) {
              setToastMessage("El usuario no tiene un horario asignado.");
              setToastType("error");
              setEntrevistas([]);
            }
            return;
          }
        }

        if (!isStale()) {
          setEntrevistas(entrevistasObtenidas);
        }
      } catch (error) {
        console.error("Error al obtener las entrevistas:", error);
        const message =
          error?.response?.data?.error ?? "Error al obtener las entrevistas.";
        if (!isStale()) {
          setToastMessage(message);
          setToastType("error");
          setEntrevistas([]);
        }
      } finally {
        if (!isStale()) {
          setLoading(false);
        }
      }
    },
    [locationIdProfesor, locationIdPsicologo, horarioMeta]
  );

  useEffect(() => {
    loadEntrevistas(fechaFiltro);
  }, [fechaFiltro, loadEntrevistas]);

  useEffect(() => {
    setPage(0);
  }, [fechaFiltro, entrevistas.length]);

  const resumen = useMemo(() => {
    const total = entrevistas.length;
    const pendientes = entrevistas.filter((ent) => formatEstadoMeta(ent.estado, ent.idestado, ent.estado_nombre).label === "Pendiente").length;
    const completadas = entrevistas.filter((ent) => formatEstadoMeta(ent.estado, ent.idestado, ent.estado_nombre).label === "Completado").length;
    const canceladas = entrevistas.filter((ent) => formatEstadoMeta(ent.estado, ent.idestado, ent.estado_nombre).label === "Cancelado").length;

    return { total, pendientes, completadas, canceladas };
  }, [entrevistas]);

  const proximaEntrevista = useMemo(() => {
    const candidatos = entrevistas
      .filter((ent) => ent && formatEstadoMeta(ent.estado, ent.idestado, ent.estado_nombre).label === "Pendiente")
      .map((ent) => {
        const inicio = parseFechaHora(fechaFiltro, ent.horainicio);
        return inicio ? { ...ent, inicio } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.inicio - b.inicio);

    return candidatos.length ? candidatos[0] : null;
  }, [entrevistas, fechaFiltro]);

  const heroDescription = useMemo(() => {
    if (loading) return "Cargando entrevistas del dia...";
    if (!resumen.total) return "No hay entrevistas agendadas para esta fecha.";
    if (proximaEntrevista) {
      return `Tu proxima entrevista es con ${
        proximaEntrevista.nombre_completo ?? "familia"
      } a las ${proximaEntrevista.horainicio}.`;
    }
    if (resumen.pendientes) {
      return "Aun tienes entrevistas pendientes por gestionar.";
    }
    return "Todas tus entrevistas de la fecha seleccionada estan actualizadas.";
  }, [loading, resumen, proximaEntrevista]);

  const exportData = useMemo(
    () =>
      entrevistas.map((ent, index) => ({
        orden: index + 1,
        nombre_completo: ent.nombre_completo || "Sin registro",
        estudiante: getStudentName(ent) || "Sin registro",
        email: ent.email || "Sin registro",
        horainicio: ent.horainicio || "Sin registro",
        horafin: ent.horafin || "Sin registro",
        motivo: ent.motivo || "Sin registro",
        prioridad: ent.prioridad || "Sin registro",
        estado: formatEstadoMeta(ent.estado, ent.idestado, ent.estado_nombre).label,
      })),
    [entrevistas]
  );

  const handleFechaChange = (event) => {
    const selected = event.target.value;
    const today = getLocalToday();
    if (horarioDiaIndex === null || horarioDiaIndex === undefined) {
      setToastMessage("No se puede seleccionar fecha hasta cargar tu horario.");
      setToastType("error");
      return;
    }
    // Evita fechas pasadas
    if (selected && selected < today) {
      setFechaFiltro(today);
      return;
    }
    if (selected && esFinDeSemana(selected)) {
      setToastMessage("No puedes seleccionar dias que no son habiles.");
      setToastType("error");
      return;
    }
    const selectedDayIndex = getWeekdayIndexFromISO(selected);
    if (horarioDiaIndex !== null && selectedDayIndex !== horarioDiaIndex) {
      setToastMessage("Solo puedes seleccionar el dia asignado en tu horario.");
      setToastType("error");
      // Buscar la siguiente fecha permitida a partir de la seleccionada
      const base = selected && selected >= today ? selected : today;
      const nextDate = findNextAllowedDate(base, horarioDiaIndex);
      setFechaFiltro(nextDate);
      return;
    }
    setFechaFiltro(selected);
  };

  const handleNextDate = () => {
    if (horarioDiaIndex === null || horarioDiaIndex === undefined) {
      setToastMessage("No se puede avanzar hasta cargar tu horario.");
      setToastType("error");
      return;
    }
    const base = addDaysToISO(fechaFiltro, 1);
    const next = findNextAllowedDate(base, horarioDiaIndex);
    setFechaFiltro(next);
  };

  const handleRefresh = () => {
    syncAgendaInfo();
    loadEntrevistas(fechaFiltro);
  };

  const handleConfirmAction = async () => {
    if (!selectedEntrevista) return;
    const idReserva = getEntrevistaId(selectedEntrevista);

    if (!idReserva) {
      setToastMessage("No se encontro el identificador de la entrevista seleccionada.");
      setToastType("error");
      return;
    }

    const nuevoIdEstado =
      actionType === "Completado" ? 2 : actionType === "No realizado" ? 3 : null;
    const idProfesorForUpdate =
      usuarioInfo?.idProfesor ??
      usuarioInfo?.idprofesor ??
      selectedEntrevista.idprofesor ??
      null;

    // Actualiza estado de inmediato y se mantiene en la tabla (comportamiento anterior)
    if (idReserva && nuevoIdEstado) {
      try {
        setLoading(true);
        const resp = await actualizarEstadoEntrevistaProfesor({
          idreservarentrevista: idReserva,
          idestado: nuevoIdEstado,
          idProfesor: idProfesorForUpdate,
        });
        const serverMsg = resp?.data?.message;
        setToastMessage(
          serverMsg ||
            (nuevoIdEstado === 2
              ? "Entrevista marcada como completada."
              : "Entrevista marcada como cancelada.")
        );
        setToastType("success");
        // Releer desde el backend para mostrar el estado tal como lo devuelve teoriaDeCola.controller
        loadEntrevistas(fechaFiltro);

        // Navegar a crear acta inmediatamente
        navigate("/formActa", {
          state: {
            idreservarentrevista: idReserva,
            fechaSeleccionada: fechaFiltro,
            estadoEntrevista: nuevoIdEstado === 2,
            idestado: nuevoIdEstado,
            idestudiante:
              selectedEntrevista.idestudiante ??
              selectedEntrevista.id_estudiante ??
              selectedEntrevista.idAlumno ??
              selectedEntrevista.idalumno ??
              null,
            entrevistaData: selectedEntrevista,
          },
        });
      } catch (error) {
        console.error("No se pudo actualizar el estado:", error);
        setToastMessage("No se pudo actualizar el estado de la entrevista.");
        setToastType("error");
      } finally {
        setLoading(false);
      }
    }

    setModalOpen(false);
    setSelectedEntrevista(null);
    setActionType("");
  };

  const handleCancelAction = () => {
    setModalOpen(false);
    setSelectedEntrevista(null);
    setActionType("");
  };

  const openModal = (entrevista, action) => {
    setSelectedEntrevista(entrevista);
    setActionType(action);
    setModalOpen(true);
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const maxHoraFinEntrevistas = useMemo(() => {
    if (!entrevistas.length) return null;
    return entrevistas.reduce((max, ent) => {
      const minutes = parseTimeToMinutes(ent.horafin);
      if (minutes === null) return max;
      if (max === null || minutes > max) return minutes;
      return max;
    }, null);
  }, [entrevistas]);

  const horarioFinMinutos = useMemo(() => {
    if (!horarioMeta) return null;
    const posibleValor =
      horarioMeta.horafin ||
      horarioMeta.horaFin ||
      horarioMeta.horafinentrevista ||
      horarioMeta.horafinentrevistas ||
      horarioMeta.hora_fin ||
      horarioMeta?.horario?.horafin;
    return parseTimeToMinutes(posibleValor);
  }, [horarioMeta]);

  const agendaCompletaPorHorario = useMemo(() => {
    if (maxHoraFinEntrevistas === null || horarioFinMinutos === null) return false;
    return maxHoraFinEntrevistas >= horarioFinMinutos;
  }, [maxHoraFinEntrevistas, horarioFinMinutos]);

  const agendaDisponibleParaFecha = useMemo(() => {
    const coincideLocal = Boolean(agendaLlenaInfo?.fecha && agendaLlenaInfo.fecha === fechaFiltro);
    return coincideLocal || agendaCompletaPorHorario;
  }, [agendaLlenaInfo, agendaCompletaPorHorario, fechaFiltro]);

  const minFechaPermitida = useMemo(() => {
    if (horarioDiaIndex === null || horarioDiaIndex === undefined) return getLocalToday();
    for (let offset = 0; offset <= 14; offset += 1) {
      const candidate = getLocalISODate(offset);
      if (getWeekdayIndexFromISO(candidate) === horarioDiaIndex) return candidate;
    }
    return getLocalToday();
  }, [horarioDiaIndex]);

  const dateStep = useMemo(() => (horarioDiaIndex === null || horarioDiaIndex === undefined ? 1 : 7), [horarioDiaIndex]);


  const buildWhatsappMessage = useCallback(
    (entrevista) => {
      const docenteNombre = usuarioInfo?.nombres
        ? `${usuarioInfo.nombres} ${usuarioInfo.apellidopaterno || ""} ${usuarioInfo.apellidomaterno || ""}`
            .replace(/\s+/g, " ")
            .trim()
        : "el docente a cargo";

      const nombrePadre = entrevista.nombre_completo || "familia";
      const motivoTexto = entrevista.motivo || "por confirmar";
      const horaInicio = entrevista.horainicio || "la hora programada";
      const horaFin = entrevista.horafin || "la hora estimada";
      const fechaTexto = formatFechaLarga(entrevista.fecha || fechaFiltro);
      const materiaTexto =
        entrevista.nombremateria ||
        entrevista.nombreMateria ||
        entrevista.materia ||
        materiaNombre ||
        usuarioInfo?.nombremateria ||
        usuarioInfo?.materia ||
        "la materia asignada";
      const saludo = obtenerSaludoSegunHora(entrevista.fecha || fechaFiltro, entrevista.horainicio);

      return `${saludo} ${nombrePadre}, le escribe ${docenteNombre} profesor(a) de la materia ${materiaTexto} del colegio Bancario (IDEB). A traves de este mensaje se lo convoca a entrevista el dia ${fechaTexto} a las ${horaInicio} por un motivo ${motivoTexto}. Aguardamos tu confirmacion, que tengas buen dia.\n\nUNIDAD EDUCATIVA INSTITUTO DE EDUCACION BANCARIA`;
    },
    [fechaFiltro, materiaNombre, usuarioInfo]
  );

  const getWhatsappLink = useCallback(
    (entrevista) => {
      const possiblePhones = [
        entrevista.telefono,
        entrevista.numcelular,
        entrevista.celular,
        entrevista?.contacto,
      ];

      if (entrevista.email) {
        const emailKey = entrevista.email.trim().toLowerCase();
        if (telefonosPadres[emailKey]) {
          possiblePhones.push(telefonosPadres[emailKey]);
        }
      }

      if (
        agendaLlenaInfo &&
        agendaLlenaInfo.fecha === fechaFiltro &&
        agendaLlenaInfo.telefono &&
        entrevista.nombre_completo &&
        agendaLlenaInfo.nombre &&
        entrevista.nombre_completo.toLowerCase().includes(agendaLlenaInfo.nombre.toLowerCase())
      ) {
        possiblePhones.push(agendaLlenaInfo.telefono);
      }

      const telefonoValido = possiblePhones.find((numero) => {
        if (!numero) return false;
        const cleaned = String(numero).replace(/\D/g, "");
        return cleaned.length >= 8;
      });

      if (!telefonoValido) return null;

      const telefonoNormalizado = String(telefonoValido).replace(/\D/g, "");
      const mensaje = buildWhatsappMessage(entrevista);
      return `https://wa.me/${telefonoNormalizado}?text=${encodeURIComponent(mensaje)}`;
    },
    [agendaLlenaInfo, buildWhatsappMessage, fechaFiltro, telefonosPadres]
  );

  const handleSendWhatsapp = useCallback(
    (entrevista) => {
      const link = getWhatsappLink(entrevista);
      if (!link) {
        setToastMessage("No se encontro un numero de celular valido para esta familia.");
        setToastType("error");
        return;
      }

      window.open(link, "_blank", "noopener,noreferrer");
    },
    [getWhatsappLink]
  );

  return (
    <>
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
      )}

      <div className="entrevistas-layout">
        <section className="entrevistas-hero">
          <div className="entrevistas-hero__primary">
            <div className="entrevistas-hero__content">
            <span className="entrevistas-hero__eyebrow">Agenda de entrevistas</span>
            <h1 className="entrevistas-hero__title">
              {`Entrevistas del ${formatFechaLarga(fechaFiltro)}`}
            </h1>
            <p className="entrevistas-hero__description">{heroDescription}</p>

            <div className="entrevistas-hero__controls">
              <div className="entrevistas-hero__date">
                <label htmlFor="entrevistas-date" className="entrevistas-hero__label">
                  Selecciona una fecha
                </label>
                <TextField
                  id="entrevistas-date"
                  type="date"
                  value={fechaFiltro}
                  onChange={handleFechaChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: minFechaPermitida, step: dateStep }}
                  className="entrevistas-hero__date-input"
                  disabled={loading || horarioDiaIndex === null}
                />
              </div>
              <div className="entrevistas-hero__buttons">
                <button
                  type="button"
                  className="entrevistas-btn entrevistas-btn--ghost"
                  onClick={handleNextDate}
                  disabled={loading}
                >
                  Ver siguiente fecha
                </button>
                <button
                  type="button"
                  className="entrevistas-btn entrevistas-btn--primary"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>

            <div className="entrevistas-hero__exports">
              <ExportActions
                data={exportData}
                context="Listado de Entrevistas"
                selectedDate={fechaFiltro}
                title="Listado de Entrevistas"
                columns={[
                  { title: "Orden de cola", field: "orden" },
                  { title: "Nombre Completo", field: "nombre_completo" },
                  { title: "Estudiante", field: "estudiante" },
                  { title: "Correo", field: "email" },
                  { title: "Hora Inicio", field: "horainicio" },
                  { title: "Hora Fin", field: "horafin" },
                  { title: "Motivo", field: "motivo" },
                  { title: "Prioridad", field: "prioridad" },
                  { title: "Estado", field: "estado" },
                ]}
              />
            </div>
          </div>

          <div className="entrevistas-hero__meta">
          <div className="entrevistas-hero__metrics">
            <article className="entrevistas-metric entrevistas-metric--highlight">
              <span className="entrevistas-metric__label">Entrevistas totales</span>
              <strong className="entrevistas-metric__value">{resumen.total}</strong>
            </article>
            <article className="entrevistas-metric entrevistas-metric--pending">
              <span className="entrevistas-metric__label">Pendientes</span>
              <strong className="entrevistas-metric__value">{resumen.pendientes}</strong>
            </article>
            <article className="entrevistas-metric entrevistas-metric--success">
              <span className="entrevistas-metric__label">Completadas</span>
              <strong className="entrevistas-metric__value">{resumen.completadas}</strong>
            </article>
            <article className="entrevistas-metric entrevistas-metric--danger">
              <span className="entrevistas-metric__label">No realizadas</span>
              <strong className="entrevistas-metric__value">{resumen.canceladas}</strong>
            </article>
          </div>

          {proximaEntrevista && (
            <div className="entrevistas-hero__next">
              <span className="entrevistas-hero__next-label">Proxima entrevista</span>
              <div className="entrevistas-hero__next-content">
                <strong>{proximaEntrevista.nombre_completo || "Por confirmar"}</strong>
                <span>{`${proximaEntrevista.horainicio} - ${proximaEntrevista.horafin}`}</span>
                <small>{proximaEntrevista.motivo || "Motivo no registrado"}</small>
              </div>
            </div>
          )}
          </div>
        </section>

        <section className="entrevistas-panel">
          <Paper className="entrevistas-table">
            {loading ? (
              <div className="entrevistas-table__empty">
                <span className="entrevistas-loader" aria-hidden="true" />
                <p>Cargando entrevistas...</p>
              </div>
            ) : entrevistas.length === 0 ? (
              <div className="entrevistas-table__empty">
                <p>No hay entrevistas programadas para esta fecha.</p>
              </div>
            ) : (
              <>
                <TableContainer className="entrevistas-table__container">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Orden de cola</TableCell>
                        <TableCell align="center">Nombre Padre de Familia </TableCell>
                        <TableCell align="center">Estudiante</TableCell>
                        <TableCell align="center" style={{ width: "18%", maxWidth: 240 }}>
                          Correo electronico
                        </TableCell>
                        <TableCell align="center">Hora inicio</TableCell>
                        <TableCell align="center">Hora fin</TableCell>
                        <TableCell align="center">Motivo</TableCell>
                        <TableCell align="center">Prioridad</TableCell>
                        <TableCell align="center">Estado</TableCell>
                        <TableCell align="center">Confirmar entrevista</TableCell>
                        <TableCell align="center">Recordatorios</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entrevistas
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((ent, index) => {
                          const estadoMeta = formatEstadoMeta(ent.estado, ent.idestado, ent.estado_nombre);
                          const whatsappLink = getWhatsappLink(ent);
                          const confirmacionLabel = ent.accion || estadoMeta.label;
                          const confirmVariant = estadoMeta.variant;
                          const esPendiente =
                            (Number(ent.idestado) || 0) === 1 || estadoMeta.label === "Pendiente";

                          const rowId = getEntrevistaId(ent) || `${ent.email || "row"}-${index}`;

                          return (
                            <TableRow key={rowId} hover className="entrevistas-row">
                              <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                              <TableCell>{ent.nombre_completo}</TableCell>
                              <TableCell>{getStudentName(ent) || "Sin estudiante"}</TableCell>
                              <TableCell style={{ width: "18%", maxWidth: 240, wordBreak: "break-word" }}>
                                {ent.email}
                              </TableCell>
                              <TableCell>{ent.horainicio}</TableCell>
                              <TableCell>{ent.horafin}</TableCell>
                              <TableCell>{ent.motivo}</TableCell>
                              <TableCell>
                                <span className={`tag tag--${String(ent.prioridad).toLowerCase()}`}>
                                  {ent.prioridad}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={`status-pill status-pill--${estadoMeta.variant}`}>
                                  {estadoMeta.label}
                                </span>
                              </TableCell>
                              <TableCell>
                                {esPendiente ? (
                                  <div className="action-buttons">
                                    <RoundedActionButton
                                      icon={iconcheck}
                                      label="Marcar como completado"
                                      variant="success"
                                      onClick={() => openModal(ent, "Completado")}
                                      disabled={loading}
                                    />
                                    <RoundedActionButton
                                      icon={icondelete}
                                      label="Marcar como no realizado"
                                      variant="danger"
                                      onClick={() => openModal(ent, "No realizado")}
                                      disabled={loading}
                                    />
                                  </div>
                                ) : (
                                  <span className={`status-pill status-pill--${confirmVariant}`}>
                                    {confirmacionLabel}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="action-buttons">
                                  <RoundedActionButton
                                    icon={whatsappIcon}
                                    label="Enviar por WhatsApp"
                                    variant="whatsapp"
                                    disabled={!whatsappLink}
                                    onClick={() => handleSendWhatsapp(ent)}
                                    title={
                                      whatsappLink
                                        ? "Enviar recordatorio por WhatsApp"
                                        : "Sin numero disponible"
                                    }
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={entrevistas.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </>
            )}
          </Paper>
        </section>

        <DynamicModelForUsers
          isOpen={modalOpen}
          title={
            actionType
              ? `Estas seguro que deseas ${actionType.toLowerCase()} esta entrevista?`
              : "Gestion de entrevista"
          }
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      </div>
    </>
  );
};

export default ListEntrevistas;




