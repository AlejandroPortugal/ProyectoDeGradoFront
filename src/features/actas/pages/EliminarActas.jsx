import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import './EliminarActas.css';
import { getInactivasActas, activateActaReunion } from '../services/actas.service.jsx';
import Header from '../../../components/Header.jsx';
import DynamicModelForUsers from '../../../components/DynamicModelForUsers.jsx';

const EliminarActas = () => {
  const [actas, setActas] = useState([]);
  const [filteredActas, setFilteredActas] = useState([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActa, setSelectedActa] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActasInactivas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getInactivasActas();
      setActas(response);
      setFilteredActas(response);
    } catch (error) {
      console.error('Error al obtener las actas inactivas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActasInactivas();
  }, [fetchActasInactivas]);

  const handleOpenDialog = (acta) => {
    setSelectedActa(acta);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedActa(null);
  };

  const handleActivate = async () => {
    try {
      if (selectedActa) {
        await activateActaReunion(selectedActa.idacta);
        await fetchActasInactivas();
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error al activar el acta:', error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = actas.filter((acta) => {
      const materia = acta.materia?.toLowerCase() || '';
      const motivo = acta.motivo?.toLowerCase() || '';
      const fecha = new Date(acta.fechadecreacion).toLocaleDateString().toLowerCase();
      return materia.includes(value) || motivo.includes(value) || fecha.includes(value);
    });
    setFilteredActas(filtered);
  };

  const totalActas = actas.length;
  const filteredCount = filteredActas.length;

  const resumenActas = useMemo(() => {
    const porMotivo = filteredActas.reduce((acc, acta) => {
      if (acta.motivo) {
        acc[acta.motivo] = (acc[acta.motivo] || 0) + 1;
      }
      return acc;
    }, {});

    const topMotivo = Object.entries(porMotivo).sort((a, b) => b[1] - a[1])[0];

    return {
      motivos: Object.keys(porMotivo).length,
      topMotivo: topMotivo ? topMotivo[0] : 'Sin registros',
    };
  }, [filteredActas]);

  const columns = [
    { field: 'materia', headerName: 'Materia', flex: 1 },
    { field: 'motivo', headerName: 'Motivo', flex: 1 },
    { field: 'fechadecreacion', headerName: 'Fecha', flex: 1 },
    {
      field: 'acciones',
      headerName: 'Accion',
      flex: 1,
      renderCell: (params) => (
        <button className="action-btn activate-btn" type="button" onClick={() => handleOpenDialog(params.row)}>
          Activar
        </button>
      ),
    },
  ];

  return (
    <>
      <main className="eliminar-actas-layout">
        <section className="eliminar-actas-hero">
          <div className="eliminar-actas-hero__content">
            <span className="eliminar-actas-hero__eyebrow">Actas inactivas</span>
            <h1>Recupera registros importantes</h1>
            <p>
              Revisa las actas desactivadas y reactivalas cuando sea necesario. Utiliza el buscador para localizar un
              registro por materia, motivo o fecha.
            </p>
            <div className="eliminar-actas-hero__meta">
              <article className="eliminar-actas-meta-card">
                <span>Total inactivas</span>
                <strong>{totalActas}</strong>
              </article>
              <article className="eliminar-actas-meta-card">
                <span>Coincidencias actuales</span>
                <strong>{filteredCount}</strong>
              </article>
              <article className="eliminar-actas-meta-card">
                <span>Motivos distintos</span>
                <strong>{resumenActas.motivos}</strong>
              </article>
              <article className="eliminar-actas-meta-card">
                <span>Motivo recurrente</span>
                <strong>{resumenActas.topMotivo}</strong>
              </article>
            </div>
            <div className="eliminar-actas-hero__actions">
              <div className="eliminar-actas-hero__input-group">
                <label htmlFor="search-inactive">Busca un acta</label>
                <input
                  id="search-inactive"
                  type="text"
                  placeholder="Filtra por materia, motivo o fecha"
                  value={search}
                  onChange={handleSearch}
                />
              </div>
              <button type="button" className="eliminar-actas-btn" onClick={fetchActasInactivas} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar lista'}
              </button>
            </div>
          </div>
          <div className="eliminar-actas-hero__highlight">
            <span>Estado del filtro</span>
            <strong>{filteredCount}</strong>
            <p>{filteredCount === totalActas ? 'Mostrando todas las actas inactivas.' : `Mostrando ${filteredCount} de ${totalActas}.`}</p>
            <small>{loading ? 'Sincronizando datos...' : 'Filtro aplicado correctamente'}</small>
          </div>
        </section>

        <section className="eliminar-actas-panel">
          <header className="eliminar-actas-panel__header">
            <div>
              <h2>Actas desactivadas</h2>
              <p>Selecciona un registro y activa nuevamente el acta cuando corresponda.</p>
            </div>
          </header>
          <div className="eliminar-actas-panel__table-wrapper">
            <Paper className="eliminar-actas-panel__table">
              {loading ? (
                <div className="eliminar-actas-panel__empty">
                  <span className="eliminar-actas-loader" aria-hidden="true" />
                  <p>Cargando actas...</p>
                </div>
              ) : (
                <DataGrid
                  rows={filteredActas.map((acta) => ({
                    id: acta.idacta,
                    idacta: acta.idacta,
                    materia: acta.materia || 'Sin materia',
                    motivo: acta.motivo || 'Sin motivo',
                    fechadecreacion: new Date(acta.fechadecreacion).toLocaleDateString(),
                  }))}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  autoHeight
                  disableSelectionOnClick
                />
              )}
            </Paper>
          </div>
        </section>
      </main>

      {dialogOpen && selectedActa && (
        <DynamicModelForUsers
          isOpen={dialogOpen}
          title="Reactivar acta"
          content={
            <div>
              <p>
                Estas seguro de que deseas reactivar el acta de <strong>{selectedActa.materia}</strong> con el motivo{' '}
                <strong>{selectedActa.motivo}</strong>?
              </p>
            </div>
          }
          onClose={handleCloseDialog}
          onConfirm={handleActivate}
        />
      )}
    </>
  );
};

export default EliminarActas;

