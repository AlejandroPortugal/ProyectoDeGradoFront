import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import { useLocation } from 'react-router-dom';
import './ListaActas.css';
import {
  getActasReunionByEstudiante,
  updateActaReunion,
  deleteActaReunion,
} from '../../servicios/actas.service.jsx';
import { getEstudianteById } from '../../servicios/Estudiante.service.jsx';
import Header from '../Header';
import DynamicModelForUsers from '../DynamicModelForUsers.jsx';
import { getMotivos } from '../../servicios/motivo.service.jsx';
import { getMateria } from '../../servicios/materia.service.jsx';
import Toast from '../Toast.jsx';
import exportActas from './exportActas';
import TablaPaginada from '../TablaPaginada.jsx';

const ListaActas = () => {
  const location = useLocation();
  const [actas, setActas] = useState([]);
  const [filteredActas, setFilteredActas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedActa, setEditedActa] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [motivos, setMotivos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewActa, setViewActa] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actaToDelete, setActaToDelete] = useState(null);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await getMateria();
        setMaterias(response.data);
      } catch (error) {
        console.error('Error al obtener las materias:', error);
      }
    };

    fetchMaterias();
  }, []);

  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        const response = await getMotivos();
        setMotivos(response.data);
      } catch (error) {
        console.error('Error al obtener los motivos:', error);
      }
    };

    fetchMotivos();
  }, []);

  const idestudiante = location.state?.idestudiante;

  const loadEstudiante = useCallback(async () => {
    if (!idestudiante) {
      console.error('No se proporciono idestudiante.');
      return;
    }

    try {
      const response = await getEstudianteById(idestudiante);
      setEstudiante(response.data);
    } catch (error) {
      console.error('Error al obtener los datos del estudiante:', error);
    }
  }, [idestudiante]);

  const loadActas = useCallback(async () => {
    if (!idestudiante) {
      console.error('No se proporciono idestudiante.');
      return;
    }

    setLoading(true);
    try {
      const response = await getActasReunionByEstudiante(idestudiante);
      const actasFiltradas = response.data.filter((acta) => acta.estado === true);
      setActas(actasFiltradas);
      setFilteredActas(actasFiltradas);
    } catch (error) {
      console.error('Error al obtener las actas del estudiante:', error);
    } finally {
      setLoading(false);
    }
  }, [idestudiante]);

  useEffect(() => {
    loadEstudiante();
  }, [loadEstudiante]);

  useEffect(() => {
    loadActas();
  }, [loadActas]);

  useEffect(() => {
    const filtered = actas.filter((acta) => {
      const materia = acta.materia?.toLowerCase() || '';
      const motivo = acta.motivo?.toLowerCase() || '';
      const fecha = acta.fechadecreacion?.toLowerCase() || '';
      const term = search.toLowerCase();
      return materia.includes(term) || motivo.includes(term) || fecha.includes(term);
    });
    setFilteredActas(filtered);
  }, [search, actas]);

  const totalActas = actas.length;
  const filteredCount = filteredActas.length;

  const ultimaActualizacion = useMemo(() => {
    if (!actas.length) return null;
    return actas.reduce((latest, acta) => {
      if (!acta.fechadecreacion) {
        return latest;
      }
      const fecha = new Date(acta.fechadecreacion);
      if (!latest || fecha > latest) {
        return fecha;
      }
      return latest;
    }, null);
  }, [actas]);

  const resumenActas = useMemo(() => {
    const materiasSet = new Set();
    const motivosSet = new Set();

    actas.forEach((acta) => {
      if (acta.materia) materiasSet.add(acta.materia);
      if (acta.motivo) motivosSet.add(acta.motivo);
    });

    return {
      materias: materiasSet.size,
      motivos: motivosSet.size,
    };
  }, [actas]);

  const actaReciente = useMemo(() => {
    const withDate = actas.filter((acta) => Boolean(acta.fechadecreacion));
    if (!withDate.length) return null;

    return withDate.sort(
      (a, b) => new Date(b.fechadecreacion).getTime() - new Date(a.fechadecreacion).getTime()
    )[0];
  }, [actas]);

  const ultimaActualizacionTexto = ultimaActualizacion
    ? ultimaActualizacion.toLocaleDateString()
    : 'Sin registros';

  const estudianteNombre = estudiante
    ? `${estudiante.nombres} ${estudiante.apellidopaterno} ${estudiante.apellidomaterno}`
    : 'Cargando...';

  const coincidenciasTexto =
    filteredCount === totalActas
      ? 'Mostrando todas las actas activas.'
      : `Mostrando ${filteredCount} de ${totalActas} actas.`;

  const heroDescription = estudiante
    ? `Estas revisando la carpeta de ${estudianteNombre}.`
    : 'Selecciona un estudiante para revisar sus actas.';

  const handleDelete = async () => {
    if (!actaToDelete) return;
    try {
      await deleteActaReunion(actaToDelete.idacta);
      showToast('Acta eliminada correctamente', 'success');
      const updatedActas = actas.filter((acta) => acta.idacta !== actaToDelete.idacta);
      setActas(updatedActas);
      setFilteredActas(updatedActas);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error al eliminar el acta:', error);
      showToast('Error al eliminar el acta', 'error');
    }
  };

  const handleEdit = (acta) => {
    const materiaSeleccionada = materias.find((materia) => materia.nombre === acta.materia) || {};
    const motivoSeleccionado = motivos.find((motivo) => motivo.nombremotivo === acta.motivo) || {};

    setEditedActa({
      id: acta.idacta,
      idreservarentrevista: acta.idreservarentrevista,
      idmateria: materiaSeleccionada.idmateria || acta.idmateria,
      idmotivo: motivoSeleccionado.idmotivo || acta.idmotivo,
      fechadecreacion: acta.fechadecreacion,
      descripcion: acta.descripcion,
      estado: acta.estado,
      idestudiante: acta.idestudiante,
    });

    setEditModalOpen(true);
  };

  const handleExportPDF = (acta) => {
    if (!acta || !estudiante) {
      showToast('No se puede exportar el acta. Datos incompletos.', 'error');
      return;
    }

    exportActas(acta, estudiante);
  };

  const saveEditedActa = async () => {
    if (!editedActa) return;

    try {
      const updatedActaData = {
        idreservarentrevista: editedActa.idreservarentrevista,
        idmotivo: editedActa.idmotivo,
        descripcion: editedActa.descripcion.trim(),
        fechadecreacion: editedActa.fechadecreacion,
        estado: editedActa.estado ?? true,
        idmateria: editedActa.idmateria,
        idestudiante: editedActa.idestudiante,
      };

      await updateActaReunion(editedActa.id, updatedActaData);

      await loadActas();
      setEditModalOpen(false);
      showToast('Acta actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar el acta:', error);
      showToast('Error al actualizar el acta', 'error');
    }
  };

  const handleView = (acta) => {
    setViewActa(acta);
    setViewModalOpen(true);
  };

  const columns = [
    { key: 'materia', label: 'Materia' },
    { key: 'motivo', label: 'Motivo' },
    { key: 'fechadecreacion', label: 'Fecha' },
    {
      key: 'acciones',
      label: 'Accion',
      render: (row) => (
        <div className="action-buttons">
          <button className="action-btn view-btn" type="button" onClick={() => handleView(row)}>
            Ver
          </button>
          <button className="action-btn edit-btn" type="button" onClick={() => handleEdit(row)}>
            Editar
          </button>
          <button
            className="action-btn delete-btn"
            type="button"
            onClick={() => {
              setActaToDelete(row);
              setDeleteModalOpen(true);
            }}
          >
            Eliminar
          </button>
          <button className="action-btn export-btn" type="button" onClick={() => handleExportPDF(row)}>
            Exportar PDF
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <main className="lista-actas-layout">
        <section className="lista-actas-hero">
          <div className="lista-actas-hero__content">
            <span className="lista-actas-hero__eyebrow">Carpeta del estudiante</span>
            <h1>Controla las actas registradas</h1>
            <p>{heroDescription}</p>
            <div className="lista-actas-hero__meta">
              <article className="lista-actas-meta-card">
                <span>Estudiante</span>
                <strong>{estudianteNombre}</strong>
              </article>
              <article className="lista-actas-meta-card">
                <span>Actas activas</span>
                <strong>{totalActas}</strong>
              </article>
              <article className="lista-actas-meta-card">
                <span>Materias cubiertas</span>
                <strong>{resumenActas.materias}</strong>
              </article>
              <article className="lista-actas-meta-card">
                <span>Motivos distintos</span>
                <strong>{resumenActas.motivos}</strong>
              </article>
              <article className="lista-actas-meta-card">
                <span>Ultima actualizacion</span>
                <strong>{ultimaActualizacionTexto}</strong>
              </article>
            </div>
            <div className="lista-actas-hero__actions">
              <div className="lista-actas-hero__input-group">
                <label htmlFor="search-acta">Busca un acta</label>
                <input
                  id="search-acta"
                  type="text"
                  placeholder="Filtra por materia, motivo o fecha"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="button" className="lista-actas-btn" onClick={loadActas} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar lista'}
              </button>
            </div>
          </div>
          <div className="lista-actas-hero__highlight">
            <span>Coincidencias actuales</span>
            <strong>{filteredCount}</strong>
            <p>{`de ${totalActas} registros`}</p>
            <small>{loading ? 'Sincronizando datos...' : 'Filtro aplicado correctamente'}</small>
            <div className="lista-actas-hero__next">
              <span>Acta mas reciente</span>
              {actaReciente ? (
                <div className="lista-actas-hero__next-content">
                  <strong>{actaReciente.materia || 'Sin materia'}</strong>
                  <p>{actaReciente.motivo || 'Motivo no registrado'}</p>
                  <small>
                    {new Date(actaReciente.fechadecreacion).toLocaleDateString()} ·{' '}
                    {actaReciente.descripcion?.slice(0, 80) || 'Sin descripcion'}
                  </small>
                </div>
              ) : (
                <div className="lista-actas-hero__next-content">
                  <strong>Sin registros</strong>
                  <p>Crea una nueva acta para comenzar el historial.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="lista-actas-panel">
          <header className="lista-actas-panel__header">
            <div>
              <h2>Actas del estudiante</h2>
              <p>{coincidenciasTexto}</p>
            </div>
          </header>
          <div className="lista-actas-panel__table-wrapper">
            {loading ? (
              <div className="lista-actas-panel__empty">
                <span className="lista-actas-loader" aria-hidden="true" />
                <p>Cargando actas...</p>
              </div>
            ) : (
              <TablaPaginada
                data={filteredActas.map((acta) => ({
                  id: acta.idacta,
                  materia: acta.materia,
                  motivo: acta.motivo,
                  fechadecreacion: acta.fechadecreacion,
                  descripcion: acta.descripcion,
                  idreservarentrevista: acta.idreservarentrevista,
                  idestudiante: idestudiante,
                }))}
                columns={columns}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                initialRowsPerPage={10}
                title="Actas registradas"
              />
            )}
          </div>
        </section>
      </main>

      {viewModalOpen && viewActa && (
        <DynamicModelForUsers
          isOpen={viewModalOpen}
          title="Detalles del acta"
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p>
                <strong>Materia:</strong> {viewActa.materia}
              </p>
              <p>
                <strong>Motivo:</strong> {viewActa.motivo}
              </p>
              <p>
                <strong>Fecha de creacion:</strong>{' '}
                {new Date(viewActa.fechadecreacion).toLocaleDateString()}
              </p>
              <p>
                <strong>Descripcion:</strong> {viewActa.descripcion}
              </p>
            </div>
          }
          onClose={() => setViewModalOpen(false)}
        />
      )}

      {editModalOpen && editedActa && (
        <DynamicModelForUsers
          isOpen={editModalOpen}
          title="Editar acta"
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <label>Materia</label>
              <select
                name="idmateria"
                value={editedActa?.idmateria || ''}
                onChange={(e) =>
                  setEditedActa((prev) => ({
                    ...prev,
                    idmateria: parseInt(e.target.value, 10),
                  }))
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                }}
              >
                <option value="">Selecciona la materia</option>
                {materias.map((materia) => (
                  <option key={materia.idmateria} value={materia.idmateria}>
                    {materia.nombre}
                  </option>
                ))}
              </select>

              <label>Motivo</label>
              <select
                name="idmotivo"
                value={editedActa?.idmotivo || ''}
                onChange={(e) =>
                  setEditedActa((prev) => ({
                    ...prev,
                    idmotivo: parseInt(e.target.value, 10),
                  }))
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                }}
              >
                <option value="">Selecciona el motivo</option>
                {motivos.map((motivo) => (
                  <option key={motivo.idmotivo} value={motivo.idmotivo}>
                    {motivo.nombremotivo}
                  </option>
                ))}
              </select>
              <TextField
                label="Fecha de creacion"
                name="fechadecreacion"
                type="date"
                value={editedActa.fechadecreacion.split('T')[0]}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled
              />
              <TextField
                label="Descripcion"
                name="descripcion"
                value={editedActa.descripcion}
                onChange={(e) =>
                  setEditedActa((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                multiline
                rows={4}
                fullWidth
              />
            </div>
          }
          onClose={() => setEditModalOpen(false)}
          onSave={saveEditedActa}
          onCancel={() => setEditModalOpen(false)}
        />
      )}

      {deleteModalOpen && actaToDelete && (
        <DynamicModelForUsers
          isOpen={deleteModalOpen}
          title="Confirmar eliminacion"
          content={
            <p>
              Estas seguro de eliminar el acta <strong>{actaToDelete.materia}</strong>?
            </p>
          }
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          showDescription={false}
        />
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </>
  );
};

export default ListaActas;

