import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./ListEntrevistas.css";
import ExportActions from "../ExportActions.jsx";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import DynamicModelForUsers from "../DynamicModelForUsers.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import {
  obtenerColaEsperaPrioridadFIFO,
  obtenerListaEntrevistaPorFecha,
  eliminarEntrevista,
} from "../../servicios/teoriaDeColas.service.jsx";
import { getHorariosById } from "../../servicios/horario.service.jsx";
import { getPadre } from "../../servicios/PadreDeFamilia.jsx";
import { getMateriaById } from "../../servicios/materia.service.jsx";
import RoundedActionButton from "../Buttons/RoundedActionButton.jsx";
import whatsappIcon from "../../recursos/icons/WhatsApp.svg";
import iconcheck from "../../recursos/icons/check.svg";
import icondelete from "../../recursos/icons/delete.svg";
import Toast from "../Toast.jsx";

const getLocalToday = () => {
  const offset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - offset).toISOString().split("T")[0];
};

const formatEstadoMeta = (estado) => {
  if (estado === null || estado === undefined) {
    return { label: "Pendiente", variant: "pending" };
  }

  return estado
    ? { label: "Completado", variant: "success" }
    : { label: "No realizado", variant: "danger" };
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

  const rol = user.role || user.rol || "";
  const idProfesor = user.idProfesor ?? user.idprofesor ?? null;
  const idPsicologo = user.idPsicologo ?? user.idpsicologo ?? null;
  const idHorario =
    user.idHorario ?? user.idhorario ?? user.id_horario ?? user.horario_id ?? null;
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
    rol: rol || user.rol,
    role: user.role || rol,
    idProfesor,
    idprofesor: idProfesor ?? user.idprofesor,
    idPsicologo,
    idpsicologo: idPsicologo ?? user.idpsicologo,
    idHorario,
    idhorario: idHorario ?? user.idhorario,
    nombres,
    apellidopaterno,
    apellidomaterno,
    nombreCompleto,
  };
};

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  return normalizeUserInfo(safeParseJSON(localStorage.getItem("user")));
};

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
  const [horarioError, setHorarioError] = useState("");
  const [telefonosPadres, setTelefonosPadres] = useState({});
  const [nombresPadres, setNombresPadres] = useState({});
  const [materiaNombre, setMateriaNombre] = useState("");

  const locationIdProfesor = location.state?.idProfesor ?? null;
  const locationIdPsicologo = location.state?.idPsicologo ?? null;
  const usuarioInfo = useMemo(() => getStoredUser(), []);

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
      const horarioId = usuarioInfo?.idHorario ?? usuarioInfo?.idhorario;
      if (!horarioId) return;
      try {
        const response = await getHorariosById(horarioId);
        const data = response?.data;
        if (Array.isArray(data)) {
          setHorarioMeta(data[0] || null);
          if (data[0]?.idmateria) {
            fetchMateriaNombre(data[0].idmateria);
          }
        } else {
          setHorarioMeta(data || null);
          if (data?.idmateria) {
            fetchMateriaNombre(data.idmateria);
          }
        }
      } catch (error) {
        console.error("Error al obtener el horario:", error);
        setHorarioError("No se pudo obtener el horario del usuario.");
      }
    };

    fetchHorario();
  }, [fetchMateriaNombre, usuarioInfo?.idHorario, usuarioInfo?.idhorario]);

  useEffect(() => {
    const fetchTelefonos = async () => {
      try {
        const response = await getPadre();
        const registros = response?.data || [];
        const phoneMap = {};
        const nameMap = {};
        registros.forEach((padre) => {
          const emailKey = padre.email ? padre.email.trim().toLowerCase() : null;
          const telefono =
            padre.numcelular ||
            padre.telefono ||
            padre.celular ||
            padre.numCelular ||
            padre.telefonoContacto;
          const nombreCompleto = `${padre.nombres || ''} ${padre.apellidopaterno || ''} ${
            padre.apellidomaterno || ''
          }`
            .replace(/\s+/g, ' ')
            .trim();
          if (emailKey) {
            if (telefono) {
              phoneMap[emailKey] = telefono;
            }
            if (nombreCompleto) {
              nameMap[emailKey] = nombreCompleto;
            }
          }
        });
        setTelefonosPadres(phoneMap);
        setNombresPadres(nameMap);
      } catch (error) {
        console.error("No se pudieron obtener los telefonos de los padres:", error);
      }
    };

    fetchTelefonos();
  }, []);

  const loadEntrevistas = useCallback(
    async (fecha) => {
      setLoading(true);
      setToastMessage("");

      try {
        const usuario = getStoredUser();

        if (!usuario) {
          setToastMessage("No se encontro informacion del usuario.");
          setToastType("error");
          setEntrevistas([]);
          return;
        }

        const rolUsuario = usuario.rol || usuario.role;
        const resolvedIdProfesor =
          locationIdProfesor ??
          (rolUsuario === "Profesor" ? usuario.idProfesor ?? usuario.id : null);
        const resolvedIdPsicologo =
          locationIdPsicologo ??
          (rolUsuario === "Psicologo" ? usuario.idPsicologo ?? usuario.id : null);

        const isToday = fecha === getLocalToday();

        let entrevistasObtenidas = [];

        const responsePorFecha = await obtenerListaEntrevistaPorFecha(
          fecha,
          resolvedIdProfesor,
          resolvedIdPsicologo
        );

        if (Array.isArray(responsePorFecha?.data)) {
          entrevistasObtenidas = responsePorFecha.data;
        }

        if ((!entrevistasObtenidas || entrevistasObtenidas.length === 0) && isToday) {
          const idhorario =
            usuario?.idHorario ?? usuario?.idhorario ?? usuario?.horario_id;

          if (!idhorario) {
            setToastMessage("El usuario no tiene un horario asignado.");
            setToastType("error");
            setEntrevistas([]);
            return;
          }

          const responseCola = await obtenerColaEsperaPrioridadFIFO({ idhorario });
          entrevistasObtenidas = Array.isArray(responseCola?.data) ? responseCola.data : [];
        }

        setEntrevistas(entrevistasObtenidas);
      } catch (error) {
        console.error("Error al obtener las entrevistas:", error);
        const message =
          error?.response?.data?.error ?? "Error al obtener las entrevistas.";
        setToastMessage(message);
        setToastType("error");
        setEntrevistas([]);
      } finally {
        setLoading(false);
      }
    },
    [locationIdProfesor, locationIdPsicologo]
  );

  useEffect(() => {
    loadEntrevistas(fechaFiltro);
  }, [fechaFiltro, loadEntrevistas]);

  useEffect(() => {
    setPage(0);
  }, [fechaFiltro, entrevistas.length]);

  const resumen = useMemo(() => {
    const total = entrevistas.length;
    const pendientes = entrevistas.filter(
      (ent) => ent.estado === null || ent.estado === undefined
    ).length;
    const completadas = entrevistas.filter((ent) => ent.estado === true).length;
    const canceladas = entrevistas.filter((ent) => ent.estado === false).length;

    return { total, pendientes, completadas, canceladas };
  }, [entrevistas]);

  const proximaEntrevista = useMemo(() => {
    const candidatos = entrevistas
      .filter((ent) => ent && (ent.estado === null || ent.estado === undefined))
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
        email: ent.email || "Sin registro",
        horainicio: ent.horainicio || "Sin registro",
        horafin: ent.horafin || "Sin registro",
        motivo: ent.motivo || "Sin registro",
        prioridad: ent.prioridad || "Sin registro",
        estado: formatEstadoMeta(ent.estado).label,
      })),
    [entrevistas]
  );

  const handleFechaChange = (event) => {
    const selected = event.target.value;
    const today = getLocalToday();
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
    setFechaFiltro(selected);
  };

  const handleResetToday = () => {
    setFechaFiltro(getLocalToday());
  };

  const handleRefresh = () => {
    syncAgendaInfo();
    loadEntrevistas(fechaFiltro);
  };

  const handleConfirmAction = async () => {
    if (!selectedEntrevista) return;

    const { idreservarentrevista } = selectedEntrevista;
    const nuevoEstado = actionType === "Completado" ? "completado" : "cancelado";

    setLoading(true);

    try {
      const response = await eliminarEntrevista(idreservarentrevista, nuevoEstado);

      if (response.status === 200) {
        setEntrevistas((prev) =>
          prev.map((ent) =>
            ent.idreservarentrevista === idreservarentrevista
              ? { ...ent, estado: nuevoEstado === "completado" }
              : ent
          )
        );
        setToastMessage(
          `Entrevista marcada como ${actionType.toLowerCase()} correctamente.`
        );
        setToastType("success");
      }
    } catch (error) {
      console.error(`Error al ${actionType.toLowerCase()} la entrevista:`, error);
      setToastMessage(
        `Error al ${actionType.toLowerCase()} la entrevista. Intentalo nuevamente.`
      );
      setToastType("error");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setSelectedEntrevista(null);
    }
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

const buildWhatsappMessage = useCallback(
    (entrevista) => {
      const docenteNombre = usuarioInfo?.nombres
        ? `${usuarioInfo.nombres} ${usuarioInfo.apellidopaterno || ""} ${
            usuarioInfo.apellidomaterno || ""
          }`.replace(/\s+/g, " ").trim()
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

      return `${saludo} ${nombrePadre}, te saluda ${docenteNombre} profesor(a) de la materia ${materiaTexto} del IDEB. A traves de este mensaje se te convoca a entrevista para ${fechaTexto} a las ${horaInicio} y culmina a las ${horaFin} por el motivo ${motivoTexto}. Aguardamos tu confirmacion, que tengas buen dia.\n\nUNIDAD EDUCATIVA INSTITUTO DE EDUCACION BANCARIA`;
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
                  inputProps={{ min: getLocalToday() }}
                  className="entrevistas-hero__date-input"
                  disabled={loading}
                />
              </div>
              <div className="entrevistas-hero__buttons">
                <button
                  type="button"
                  className="entrevistas-btn entrevistas-btn--ghost"
                  onClick={handleResetToday}
                  disabled={loading}
                >
                  Ver hoy
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
          <header className="entrevistas-panel__header">
            <div>
       
  
            </div>
          </header>

          <Paper className="entrevistas-table">
            {loading ? (
              <div className="entrevistas-table__empty">
                <span className="entrevistas-loader" aria-hidden="true" />
                <p>Cargando entrevistas...</p>
              </div>
            ) : entrevistas.length === 0 ? (
              <div className="entrevistas-table__empty">
                <p>No se encontraron entrevistas para la fecha seleccionada.</p>
              </div>
            ) : (
              <>
                <TableContainer className="entrevistas-table__container">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Orden de cola</TableCell>
                        <TableCell align="center">Nombre completo</TableCell>
                        <TableCell align="center">Correo electronico</TableCell>
                        <TableCell align="center">Hora inicio</TableCell>
                        <TableCell align="center">Hora fin</TableCell>
                        <TableCell align="center">Motivo</TableCell>
                        <TableCell align="center">Prioridad</TableCell>
                        <TableCell align="center">Estado</TableCell>
                        <TableCell align="center">Confirmar entrevista</TableCell>
                        <TableCell align="center">Crear acta</TableCell>
                        <TableCell align="center">Enviar por WhatsApp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entrevistas
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((ent, index) => {
                          const estadoMeta = formatEstadoMeta(ent.estado);
                          const whatsappLink = getWhatsappLink(ent);
                          const parentNameCandidates = [
                            ent.nombre_padre,
                            ent.nombrePadre,
                            ent.nombrepadre,
                            ent.padreNombre,
                            ent.padre,
                            ent.nombre_apoderado,
                            ent.apoderado,
                            ent.nombrecompletoPadre,
                            ent.nombre_completo_padre,
                            ent.nombrespadre,
                          ];
                          let nombrePadreAsignado =
                            parentNameCandidates.find(
                              (nombre) => typeof nombre === "string" && nombre.trim().length > 0,
                            ) ||
                            ent.nombre_completo ||
                            "";
                          if (!nombrePadreAsignado && ent.email) {
                            const emailKey = ent.email.trim().toLowerCase();
                            if (nombresPadres[emailKey]) {
                              nombrePadreAsignado = nombresPadres[emailKey];
                            }
                          }

                          return (
                            <TableRow key={ent.idreservarentrevista} hover className="entrevistas-row">
                              <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                              <TableCell>{ent.nombre_completo}</TableCell>
                              <TableCell>{ent.email}</TableCell>
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
                                {estadoMeta.label === "Pendiente" && (
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
                                )}
                              </TableCell>
                              <TableCell>
                                {estadoMeta.label === "Pendiente" ? (
                                    <button
                                      className="create-acta-btn"
                                      onClick={() =>
                                        navigate("/crearActa", {
                                          state: {
                                            idreservarentrevista: ent.idreservarentrevista,
                                            nombrePadre: nombrePadreAsignado,
                                            entrevistaData: ent,
                                          },
                                        })
                                      }
                                      disabled={loading}
                                    >
                                    Crear
                                  </button>
                                ) : (
                                  <span className="acta-status">Acta cerrada</span>
                                )}
                              </TableCell>
                              <TableCell>
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
          title={`Estas seguro que deseas ${actionType.toLowerCase()} esta entrevista?`}
          onConfirm={handleConfirmAction}
          onCancel={() => setModalOpen(false)}
        />
      </div>
    </>
  );
};

export default ListEntrevistas;
