import React, { useEffect, useMemo, useState } from "react";
import "./RecuperarUsuarios.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import CheckIcon from "../../../recursos/icons/check.svg";
import SearchIcon from "../../../recursos/icons/search.svg";
import { listarUsuariosInactivos, activarUsuario } from "../../users/services/users.service.jsx";
import Toast from "../../../components/Toast.jsx";

const RecuperarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [toast, setToast] = useState({ message: "", type: "", show: false });

  const fetchUsuariosInactivos = async () => {
    try {
      setLoading(true);
      const data = await listarUsuariosInactivos();
      setUsuarios(data);
    } catch (error) {
      setToast({ message: "Error al listar usuarios inactivos", type: "error", show: true });
      console.error("Error al listar usuarios inactivos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuariosInactivos();
  }, []);

  const handleSearch = (event) => {
    setFilter(event.target.value);
  };

  const handleActivate = async (id, rol) => {
    try {
      await activarUsuario(id, rol);
      setUsuarios((prevUsuarios) => prevUsuarios.filter((usuario) => usuario.id !== id));
      setToast({ message: "Usuario activado exitosamente", type: "success", show: true });
    } catch (error) {
      setToast({ message: "Error al activar el usuario. Intente nuevamente.", type: "error", show: true });
      console.error("Error al activar usuario:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const totalInactivos = usuarios.length;

  const roleSummary = useMemo(() => {
    if (!usuarios.length) {
      return [];
    }

    const resumen = usuarios.reduce((acc, usuario) => {
      const rol = usuario.rol || "Sin rol";
      acc[rol] = (acc[rol] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(resumen)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [usuarios]);

  const filteredUsuarios = usuarios.filter((usuario) => {
    const searchTerm = filter.toLowerCase();
    return (
      usuario.nombres.toLowerCase().includes(searchTerm) ||
      usuario.apellidopaterno.toLowerCase().includes(searchTerm) ||
      usuario.apellidomaterno.toLowerCase().includes(searchTerm) ||
      usuario.rol.toLowerCase().includes(searchTerm)
    );
  });

  const filteredCount = filteredUsuarios.length;

  const handleRefresh = () => {
    fetchUsuariosInactivos();
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <main className="recover-users-page">
        <section className="recover-users-hero">
          <div className="recover-users-hero__copy">
            <span className="recover-users-hero__eyebrow">Usuarios inactivos</span>
            <h2>Recupera las cuentas en pocos clics</h2>
            <p>
              Revisa los perfiles dados de baja, valida su informacion y restaura el acceso cuando sea
              necesario.
            </p>
            <div className="recover-users-hero__meta">
              <span className="recover-users-hero__chip">
                Total listados: <strong>{totalInactivos}</strong>
              </span>
              <span className="recover-users-hero__chip">
                Resultados actuales: <strong>{filteredCount}</strong>
              </span>
            </div>
          </div>

          <div className="recover-users-hero__stats">
            {roleSummary.length > 0 ? (
              roleSummary.map(([rol, cantidad]) => (
                <article key={rol} className="recover-users-hero__stat-card">
                  <span className="recover-users-hero__stat-count">{cantidad}</span>
                  <span className="recover-users-hero__stat-label">{rol}</span>
                </article>
              ))
            ) : (
              <article className="recover-users-hero__stat-card recover-users-hero__stat-card--empty">
                <span className="recover-users-hero__stat-count">0</span>
                <span className="recover-users-hero__stat-label">Sin registros disponibles</span>
              </article>
            )}
          </div>

          <div className="recover-users-hero__tools">
            <label className="recover-users-hero__search-wrapper">
              <img src={SearchIcon} alt="" aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar por nombre, apellido o rol"
                value={filter}
                onChange={handleSearch}
                aria-label="Buscar usuarios inactivos"
              />
            </label>
            <button
              type="button"
              className="recover-users-hero__refresh"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar listado"}
            </button>
          </div>
        </section>

        <section className="ReUsuariosApp-container">
          {loading ? (
            <div className="ReUsuariosApp-loading">
              <CircularProgress />
            </div>
          ) : (
            <Paper className="ReUsuariosApp-table-container">
              <TableContainer>
                <Table className="ReUsuariosApp-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Apellido Paterno</TableCell>
                      <TableCell>Apellido Materno</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Accion</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsuarios
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell>{usuario.nombres}</TableCell>
                          <TableCell>{usuario.apellidopaterno}</TableCell>
                          <TableCell>{usuario.apellidomaterno}</TableCell>
                          <TableCell>{usuario.rol}</TableCell>
                          <TableCell>
                            <button
                              className="ReUsuariosApp-action-button ReUsuariosApp-green-button"
                              onClick={() => handleActivate(usuario.id, usuario.rol)}
                            >
                              <img src={CheckIcon} alt="Activar" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filteredUsuarios.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} style={{ textAlign: "center" }}>
                          No se encontraron usuarios inactivos.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredUsuarios.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 15]}
                labelRowsPerPage="Filas por pagina"
              />
            </Paper>
          )}
        </section>
      </main>
    </>
  );
};

export default RecuperarUsuarios;


