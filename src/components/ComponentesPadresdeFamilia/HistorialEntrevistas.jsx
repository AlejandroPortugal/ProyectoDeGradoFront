import React, { useEffect, useState } from "react";
import "./HistorialEntrevistas.css";
import { obtenerEntrevistasPorPadre } from "../../servicios/teoriaDeColas.service.jsx";
import MenuPadres from "./MenuPadres.jsx";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField } from "@mui/material";

const HistorialEntrevistas = () => {
    const [citas, setCitas] = useState([]);
    const [filteredCitas, setFilteredCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filters, setFilters] = useState({
        fecha: "",
        profesor: "",
        materia: "",
        estado: "",
    });

    let idPadre = null;
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        idPadre = user?.id;
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
                setCitas(response.data.data);
                setFilteredCitas(response.data.data);
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

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters({ ...filters, [name]: value });

        const filtered = citas.filter((cita) =>
            (!filters.fecha || cita.fecha.includes(filters.fecha)) &&
            (!filters.profesor || cita.profesor.toLowerCase().includes(filters.profesor.toLowerCase())) &&
            (!filters.materia || cita.materia.toLowerCase().includes(filters.materia.toLowerCase())) &&
            (!filters.estado || cita.estado.toLowerCase().includes(filters.estado.toLowerCase()))
        );

        setFilteredCitas(filtered);
    };

    return (
        <div className="historial-container">
            <MenuPadres />
            {loading ? (
                <p className="loading-text">Cargando datos...</p>
            ) : error ? (
                <p className="error-text">{error}</p>
            ) : (
                <Paper className="table-container">
                    <h2 className="table-title">HISTORIAL DE CITAS</h2>
                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
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
                            label="Profesor"
                            name="profesor"
                            value={filters.profesor}
                            onChange={handleFilterChange}
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            label="Materia"
                            name="materia"
                            value={filters.materia}
                            onChange={handleFilterChange}
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            label="Estado"
                            name="estado"
                            value={filters.estado}
                            onChange={handleFilterChange}
                            variant="outlined"
                            size="small"
                        />
                    </div>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Profesor</TableCell>
                                    <TableCell>Materia</TableCell>
                                    <TableCell>Hora</TableCell>
                                    <TableCell>Estado</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCitas.length > 0 ? (
                                    filteredCitas
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((cita, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{cita.fecha}</TableCell>
                                                <TableCell>{cita.profesor}</TableCell>
                                                <TableCell>{cita.materia}</TableCell>
                                                <TableCell>
                                                    {cita.horafinentrevista ? cita.horafinentrevista : "No especificada"}
                                                </TableCell>
                                                <TableCell>{cita.estado}</TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} style={{ textAlign: "center" }}>
                                            No se encontraron entrevistas con los filtros seleccionados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={filteredCitas.length}
                        page={page}
                        onPageChange={handlePageChange}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        rowsPerPageOptions={[5, 10, 15]}
                        labelRowsPerPage="Filas por página"
                    />
                </Paper>
            )}
        </div>
    );
};

export default HistorialEntrevistas;

