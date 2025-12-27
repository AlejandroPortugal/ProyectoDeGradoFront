import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Paper } from '@mui/material';
import './ControlIngresos.css';
import ExportActions from './ExportActions.jsx';
import { getUsuariosConIngresos } from '../servicios/users.service.jsx';
import AuthContext from '../auth.jsx';
import SearchIcon from '../../src/recursos/icons/search.svg';

const ControlIngresos = () => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchUsuariosConIngresos = async () => {
      try {
        const response = await getUsuariosConIngresos(token);
        const registros = Array.isArray(response?.data) ? response.data : response || [];
        setData(registros);
      } catch (error) {
        console.error('Error al obtener los usuarios con ingresos:', error);
      }
    };

    fetchUsuariosConIngresos();
  }, [token]);

  const filteredData = useMemo(() => {
    if (!searchValue.trim()) {
      return data;
    }

    const value = searchValue.toLowerCase();

    return data.filter((item) => {
      const nombreCompleto = (item.nombrecompleto || '').toLowerCase();
      const fechaIngreso = item.fechaingreso?.split('T')[0] || '';
      const rol = (item.rol || '').toLowerCase();
      const horaIngreso = item.horaingreso || '';

      return (
        nombreCompleto.includes(value) ||
        fechaIngreso.includes(value) ||
        rol.includes(value) ||
        horaIngreso.includes(value)
      );
    });
  }, [data, searchValue]);

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const totalUsuarios = data.length;
  const todayIso = new Date().toISOString().split('T')[0];
  const ingresosHoy = data.filter((item) => item.fechaingreso?.startsWith(todayIso)).length;
  const rolesRegistrados = new Set(
    data
      .map((item) => item.rol)
      .filter(Boolean)
  ).size;

  const ultimaEntrada =
    data
      .map((item) => {
        const fecha = item.fechaingreso?.split('T')[0];
        if (!fecha) {
          return null;
        }

        const hora = item.horaingreso || '00:00:00';
        return {
          sortKey: `${fecha}T${hora}`,
          text: `${fecha} ${item.horaingreso || ''}`.trim(),
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a.sortKey > b.sortKey ? 1 : -1))
      .pop()?.text || 'Sin registro';

  const filteredCount = filteredData.length;

  return (
    <main className="control-ingresos-page">
      <section className="control-ingresos-hero">
        <div className="control-ingresos-hero__copy">
          <span className="control-ingresos-hero__eyebrow">Control de ingresos</span>
          <h2>Monitorea los accesos en un solo lugar</h2>
          <p>
            Filtra, revisa y exporta los ingresos registrados por cada usuario. Mantente al tanto de la actividad diaria
            con un panel claro y consistente.
          </p>
          <div className="control-ingresos-hero__meta">
            <span className="control-ingresos-hero__chip">
              Registros totales: <strong>{totalUsuarios}</strong>
            </span>
            <span className="control-ingresos-hero__chip">
              Coincidencias actuales: <strong>{filteredCount}</strong>
            </span>
            <span className="control-ingresos-hero__chip">
              Ultimo acceso: <strong>{ultimaEntrada}</strong>
            </span>
          </div>
        </div>

        <div className="control-ingresos-hero__stats">
          <article className="control-ingresos-hero__stat-card">
            <span className="control-ingresos-hero__stat-count">{ingresosHoy}</span>
            <span className="control-ingresos-hero__stat-label">Ingresos de hoy</span>
          </article>
          <article className="control-ingresos-hero__stat-card">
            <span className="control-ingresos-hero__stat-count">{rolesRegistrados}</span>
            <span className="control-ingresos-hero__stat-label">Roles activos</span>
          </article>
          <article className="control-ingresos-hero__stat-card">
            <span className="control-ingresos-hero__stat-count">{totalUsuarios}</span>
            <span className="control-ingresos-hero__stat-label">Total registrados</span>
          </article>
        </div>

        <div className="control-ingresos-hero__tools">
          <label className="control-ingresos-hero__search-wrapper">
            <img src={SearchIcon} alt="" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por nombre, rol, fecha o hora"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              aria-label="Buscar ingresos"
            />
          </label>
          <div className="control-ingresos-hero__export">
            <span>Exportar reportes</span>
            <ExportActions data={filteredData} context="ingresos" title="Control de Usuarios con Ingresos" />
          </div>
        </div>
      </section>

      <section className="control-ingresos-table-section">
        <Paper className="control-ingresos-table-card">
          <TableContainer className="control-ingresos-table-container">
            <Table className="control-ingresos-table">
              <TableHead>
                <TableRow>
                  <TableCell className="control-ingresos-table-header">Nombre Completo</TableCell>
                  <TableCell className="control-ingresos-table-header">Rol</TableCell>
                  <TableCell className="control-ingresos-table-header">Fecha de Ingreso</TableCell>
                  <TableCell className="control-ingresos-table-header">Hora de Ingreso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, index) => (
                    <TableRow key={`${item.nombrecompleto}-${item.fechaingreso}-${index}`}>
                      <TableCell className="control-ingresos-table-cell">
                        {item.nombrecompleto || 'Sin registro'}
                      </TableCell>
                      <TableCell className="control-ingresos-table-cell">{item.rol || 'Sin registro'}</TableCell>
                      <TableCell className="control-ingresos-table-cell">
                        {item.fechaingreso?.split('T')[0] || 'Sin registro'}
                      </TableCell>
                      <TableCell className="control-ingresos-table-cell">{item.horaingreso || 'Sin registro'}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 15]}
            labelRowsPerPage="Filas por pagina"
            className="control-ingresos-pagination"
          />
        </Paper>
      </section>
    </main>
  );
};

export default ControlIngresos;


