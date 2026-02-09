import React, { useState, useMemo, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import BtnActionsText from "./botones/BtnActionsText";
import "./UserTable.css";
import ExportActions from "./ExportActions";

const UserTable = ({
  users,
  onView,
  onEdit,
  onDelete,
  onCite,
  hideDefaultActions,
  exportTitle,
  showToolbar = true,
  filterTerm,
  onFilterChange,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [internalFilter, setInternalFilter] = useState("");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 20));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const value = event.target.value;
    if (onFilterChange) {
      onFilterChange(value);
    } else {
      setInternalFilter(value);
    }
  };

  const activeFilter = filterTerm ?? internalFilter;
  const normalizedFilter = activeFilter.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!normalizedFilter) {
      return users;
    }
    return users.filter((user) => {
      const searchable = [user.nombres, user.apellidopaterno, user.apellidomaterno, user.rol]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedFilter);
    });
  }, [users, normalizedFilter]);

  const paginatedUsers = useMemo(
    () => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredUsers, page, rowsPerPage]
  );

  useEffect(() => {
    setPage(0);
  }, [normalizedFilter]);

  return (
    <div className="user-table-wrapper">
      <Paper elevation={0} className="user-table-card">
        {showToolbar && (
          <div className="user-table-toolbar">
            <TextField
              className="user-table-search"
              label="Buscar"
              variant="outlined"
              size="small"
              fullWidth
              value={activeFilter}
              onChange={handleFilterChange}
              placeholder="Buscar por nombre, apellido o rol"
            />

            <div className="user-table-export">
              <ExportActions
                data={filteredUsers}
                context="Usuarios"
                selectedDate={new Date().toLocaleDateString()}
                title={exportTitle || "Listado de Usuarios"}
                columns={[
                  { title: "Nombres", field: "nombres" },
                  { title: "Apellido Paterno", field: "apellidopaterno" },
                  { title: "Apellido Materno", field: "apellidomaterno" },
                  { title: "Rol", field: "rol" },
                ]}
              />
            </div>
          </div>
        )}

        <TableContainer className="user-table-container">
          <Table className="user-table" stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombres</TableCell>
                <TableCell>Apellido Paterno</TableCell>
                <TableCell>Apellido Materno</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Accion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={20} className="user-table-empty">
                    No se encontraron usuarios con ese criterio de busqueda.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user, index) => (
                  <TableRow
                    key={user.id ? `${user.id}-${user.rol}` : `${user.rol}-${index}`}
                    hover
                    className="user-table-row"
                  >
                    <TableCell>{user.nombres}</TableCell>
                    <TableCell>{user.apellidopaterno}</TableCell>
                    <TableCell>{user.apellidomaterno}</TableCell>
                    <TableCell>{user.rol}</TableCell>
                    <TableCell>
                      <section className="btn-actions">
                        {!hideDefaultActions && (
                          <>
                            {onView && (
                              <BtnActionsText
                                color="green"
                                text="Ver"
                                onClick={() => onView(user)}
                              />
                            )}
                            {onEdit && (
                              <BtnActionsText
                                color="yellow"
                                text="Editar"
                                onClick={() => onEdit(user)}
                              />
                            )}
                            {onDelete && (
                              <BtnActionsText
                                color="red"
                                text="Eliminar"
                                onClick={() => onDelete(user)}
                              />
                            )}
                          </>
                        )}

                        {onCite && (
                          <BtnActionsText
                            color="blue"
                            text="Citar"
                            onClick={() => onCite(user)}
                          />
                        )}
                      </section>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="user-table-mobile-list">
          {filteredUsers.length === 0 ? (
            <p className="user-table-empty">No se encontraron usuarios con ese criterio de busqueda.</p>
          ) : (
            paginatedUsers.map((user, index) => (
              <article
                key={user.id ? `${user.id}-mobile-${user.rol}` : `mobile-${user.rol}-${index}`}
                className="user-table-mobile-card"
              >
                <div className="user-table-mobile-card__header">
                  <span className="user-table-mobile-card__role">{user.rol}</span>
                  {!hideDefaultActions && onView && (
                    <button
                      type="button"
                      className="user-table-mobile-card__link"
                      onClick={() => onView(user)}
                    >
                      Ver ficha
                    </button>
                  )}
                </div>
                <div className="user-table-mobile-card__body">
                  <p>
                    <strong>Nombres:</strong> {user.nombres}
                  </p>
                  <p>
                    <strong>Apellido paterno:</strong> {user.apellidopaterno}
                  </p>
                  <p>
                    <strong>Apellido materno:</strong> {user.apellidomaterno}
                  </p>
                </div>
                <div className="user-table-mobile-card__actions">
                  {!hideDefaultActions && (
                    <>
                      {onEdit && (
                        <BtnActionsText
                          color="yellow"
                          text="Editar"
                          onClick={() => onEdit(user)}
                        />
                      )}
                      {onDelete && (
                        <BtnActionsText
                          color="red"
                          text="Eliminar"
                          onClick={() => onDelete(user)}
                        />
                      )}
                    </>
                  )}

                  {onCite && (
                    <BtnActionsText color="blue" text="Citar" onClick={() => onCite(user)} />
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        <TablePagination
          className="user-table-pagination"
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[20, 30, 40]}
        />
      </Paper>
    </div>
  );
};

export default UserTable;
