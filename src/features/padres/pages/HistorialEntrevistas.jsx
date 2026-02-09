import React, { useEffect, useMemo, useState } from "react";
import "./HistorialEntrevistas.css";
import { obtenerEntrevistasPorPadre } from "../../entrevistas/services/teoriaDeColas.service.jsx";
import { getMateria } from "../../materias/services/materia.service.jsx";
import exportActas from "../../actas/utils/exportActas.jsx";
import MenuPadres from "../components/MenuPadres.jsx";
import { Paper, TablePagination, TextField, MenuItem } from "@mui/material";

const HistorialEntrevistas = () => {
    const [citas, setCitas] = useState([]);
    const [filteredCitas, setFilteredCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filters, setFilters] = useState({
        fecha: "",
        materia: "",
        estado: "",
    });
    const [materias, setMaterias] = useState([]);

    let idPadre = null;
    let padreNombre = "";
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        idPadre =
            user?.idPadre ??
            user?.idpadre ??
            user?.id_padre ??
            user?.id;
        padreNombre = `${user?.nombres || ""} ${user?.apellidopaterno || ""} ${user?.apellidomaterno || ""}`
            .replace(/\s+/g, " ")
            .trim();
    } catch (err) {
        console.error("Error al obtener el idPadre desde el localStorage:", err);
        idPadre = null;
    }

    useEffect(() => {
        if (!idPadre) {
            setError("No se encontró el idPadre en el localStorage o está malformateado.");
            setLoading(false);
            return;
        }

        const fetchCitas = async () => {
            try {
                setLoading(true);
                const response = await obtenerEntrevistasPorPadre(idPadre);
                const data = Array.isArray(response?.data?.data)
                    ? response.data.data
                    : Array.isArray(response?.data)
                        ? response.data
                        : [];
                setCitas(data);
                setFilteredCitas(applyFilters(data, filters));
                setError(null);
                setLoading(false);
            } catch (err) {
                console.error("Error al obtener el historial de citas:", err);
                setError("Error: No se encontraron entrevistas anteriormente realizadas. Inténtalo nuevamente.");
                setLoading(false);
            }
        };

        fetchCitas();
    }, [idPadre]);
    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const response = await getMateria();
                const lista = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.data?.data)
                        ? response.data.data
                        : [];
                setMaterias(lista);
            } catch (error) {
                console.error("No se pudieron cargar las materias:", error);
                setMaterias([]);
            }
        };

        fetchMaterias();
    }, []);

    const materiaOptions = useMemo(() => {
        const map = new Map();
        const addMateria = (value) => {
            const name = (value || "").toString().trim();
            if (!name) return;
            const key = name.toLowerCase();
            if (!map.has(key)) map.set(key, name);
        };

        materias.forEach((mat) =>
            addMateria(mat?.nombre || mat?.nombremateria || mat?.materia)
        );
        citas.forEach((cita) => addMateria(cita?.materia));

        return Array.from(map.values()).sort((a, b) =>
            a.localeCompare(b, "es", { sensitivity: "base" })
        );
    }, [citas, materias]);

    const normalizeText = (value) =>
        (value || "")
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    const normalizeEstado = (estado) => normalizeText(estado);

    const estadoOptions = useMemo(() => {
        const map = new Map();
        const addEstado = (value) => {
            const name = (value || "").toString().trim();
            if (!name) return;
            const key = normalizeEstado(name);
            if (!map.has(key)) map.set(key, name);
        };

        citas.forEach((cita) => addEstado(cita?.estado));

        return Array.from(map.values()).sort((a, b) =>
            a.localeCompare(b, "es", { sensitivity: "base" })
        );
    }, [citas]);

    const parseFechaValue = (fecha) => {
        if (!fecha) return 0;
        const trimmed = fecha.toString().trim();
        let normalized = trimmed;
        if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
            const [day, month, year] = trimmed.split("-");
            normalized = `${year}-${month}-${day}`;
        }
        const iso = normalized.length === 10 ? `${normalized}T00:00:00` : normalized;
        const parsed = new Date(iso);
        return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    };

    const parseHoraValue = (hora) => {
        if (!hora) return 0;
        const match = hora.toString().match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
        if (!match) return 0;
        const hours = Number(match[1]) || 0;
        const minutes = Number(match[2]) || 0;
        const seconds = Number(match[3]) || 0;
        return hours * 3600 + minutes * 60 + seconds;
    };

    const isPendiente = (estado) => normalizeEstado(estado) === "pendiente";

    const sortCitas = (items, estadoFiltro) => {
        const estadoNormalizado = normalizeEstado(estadoFiltro);
        return [...items].sort((a, b) => {
            if (!estadoNormalizado) {
                const aPendiente = isPendiente(a?.estado);
                const bPendiente = isPendiente(b?.estado);
                if (aPendiente !== bPendiente) {
                    return aPendiente ? -1 : 1;
                }
            }
            const dateDiff = parseFechaValue(b?.fecha) - parseFechaValue(a?.fecha);
            if (dateDiff !== 0) return dateDiff;
            return parseHoraValue(b?.horainicio) - parseHoraValue(a?.horainicio);
        });
    };

    const applyFilters = (items, nextFilters) => {
        const fechaFiltro = (nextFilters.fecha || "").trim();
        const materiaFiltro = normalizeText(nextFilters.materia);
        const estadoFiltro = normalizeEstado(nextFilters.estado);
        const filtered = items.filter((cita) => {
            const fecha = cita?.fecha || "";
            const materia = normalizeText(cita?.materia);
            const estado = normalizeEstado(cita?.estado);

            return (
                (!fechaFiltro || fecha.includes(fechaFiltro)) &&
                (!materiaFiltro || materia === materiaFiltro) &&
                (!estadoFiltro || estado === estadoFiltro)
            );
        });

        return sortCitas(filtered, nextFilters.estado);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        const updatedFilters = { ...filters, [name]: value };
        setFilters(updatedFilters);
        setPage(0);
        setFilteredCitas(applyFilters(citas, updatedFilters));
    };

    const formatFechaDisplay = (fecha) => {
        if (!fecha) return "";
        const [year, month, day] = fecha.split("-");
        if (!year || !month || !day) return fecha;
        return `${day}-${month}-${year}`;
    };

    const handleDownloadActa = (cita) => {
        if (!cita) return;
        const actaDisponible = Boolean(
            cita.acta_id || cita.acta_fechadecreacion || cita.acta_descripcion
        );
        if (!actaDisponible) {
            window.alert("Acta no disponible para esta entrevista.");
            return;
        }

        const acta = {
            fecha: cita.fecha,
            fechaEntrevista: cita.fecha,
            fechadecreacion: cita.acta_fechadecreacion || cita.fecha,
            materia: cita.acta_materia || cita.materia || "Materia",
            motivo: cita.acta_motivo || "Motivo",
            descripcion: cita.acta_descripcion || "",
            profesor: cita.profesor || "Docente",
            docente_nombre: cita.profesor || "",
            padre_nombre: padreNombre,
        };
        const estudiante = {
            nombres: cita.estudiante || "Estudiante",
            apellidopaterno: "",
        };

        exportActas(acta, estudiante);
    };

    return (
        <div className="historial-container">
            <MenuPadres />
            {loading ? (
                <p className="loading-text">Cargando datos...</p>
            ) : error ? (
                <p className="error-text">{error}</p>
            ) : (
                <Paper className="historial-panel">
                    <h2 className="historial-title">Historial de entrevistas</h2>
                    <div className="historial-filters">
                        <TextField
                            label="Filtrar por Fecha"
                            type="date"
                            name="fecha"
                            value={filters.fecha}
                            onChange={handleFilterChange}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            select
                            label="Materia"
                            name="materia"
                            value={filters.materia}
                            onChange={handleFilterChange}
                            variant="outlined"
                            size="small"
                        >
                            <MenuItem value="">Todas las materias</MenuItem>
                            {materiaOptions.map((materia) => (
                                <MenuItem key={materia} value={materia}>
                                    {materia}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Estado"
                            name="estado"
                            value={filters.estado}
                            onChange={handleFilterChange}
                            variant="outlined"
                            size="small"
                        >
                            <MenuItem value="">Todos los estados</MenuItem>
                            {estadoOptions.map((estado) => (
                                <MenuItem key={estado} value={estado}>
                                    {estado}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    {filteredCitas.length > 0 ? (
                        <>
                            <div className="historial-grid">
                                {filteredCitas
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((cita, index) => {
                                        const estadoLabel = cita.estado || "Pendiente";
                                        const estadoKey = estadoLabel.toLowerCase().replace(/\s+/g, "-");
                                        const isCompleted =
                                            estadoKey === "completado" ||
                                            estadoKey === "completada";
                                        const actaDisponible = Boolean(
                                            cita.acta_id ||
                                            cita.acta_fechadecreacion ||
                                            cita.acta_descripcion
                                        );
                                        const horaLabel =
                                            cita.horainicio && cita.horafin
                                                ? `${cita.horainicio} - ${cita.horafin}`
                                                : cita.horainicio || cita.horafin || "No especificada";

                                        return (
                                            <article className="historial-card" key={cita.id || index}>
                                                <header className="historial-card__header">
                                                    <span className="historial-card__date">
                                                        {formatFechaDisplay(cita.fecha)}
                                                    </span>
                                                    <span className={`historial-status status-${estadoKey}`}>{estadoLabel}</span>
                                                </header>
                                                <div className="historial-card__body">
                                                    <div className="historial-card__row">
                                                        <span className="historial-card__label">Profesor</span>
                                                        <span className="historial-card__value">{cita.profesor || "No registrado"}</span>
                                                    </div>
                                                    <div className="historial-card__row">
                                                        <span className="historial-card__label">Materia</span>
                                                        <span className="historial-card__value">{cita.materia || "No registrada"}</span>
                                                    </div>
                                                    <div className="historial-card__row">
                                                        <span className="historial-card__label">Estudiante</span>
                                                        <span className="historial-card__value">{cita.estudiante || "No registrado"}</span>
                                                    </div>
                                                    <div className="historial-card__row">
                                                        <span className="historial-card__label">Hora</span>
                                                        <span className="historial-card__value">{horaLabel}</span>
                                                    </div>
                                                </div>
                                                {isCompleted && (
                                                    <div className="historial-card__actions">
                                                        <button
                                                            type="button"
                                                            className="historial-acta-btn"
                                                            onClick={() => handleDownloadActa(cita)}
                                                            disabled={!actaDisponible}
                                                            title={
                                                                actaDisponible
                                                                    ? "Descargar acta"
                                                                    : "Acta no disponible"
                                                            }
                                                        >
                                                            DESCARGAR ACTA
                                                        </button>
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                            </div>
                            <TablePagination
                                component="div"
                                count={filteredCitas.length}
                                page={page}
                                onPageChange={handlePageChange}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                rowsPerPageOptions={[5, 10, 15]}
                                labelRowsPerPage="Filas por pagina"
                            />
                        </>
                    ) : (
                        <p className="no-citas">
                            No se encontraron entrevistas con los filtros seleccionados.
                        </p>
                    )}
                </Paper>
            )}
        </div>
    );
};

export default HistorialEntrevistas;







