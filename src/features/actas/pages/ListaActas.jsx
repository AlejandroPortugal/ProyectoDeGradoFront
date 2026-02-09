import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './ListaActas.css';
import {
  getActasReunionByEstudiante,
  updateActaReunion,
  deleteActaReunion,
} from '../services/actas.service.jsx';
import { getEstudianteById } from '../../estudiantes/services/Estudiante.service.jsx';
import Header from '../../../components/Header.jsx';
import DynamicModelForUsers from '../../../components/DynamicModelForUsers.jsx';
import { getMotivos } from '../../motivos/services/motivo.service.jsx';
import { getMateria } from '../../materias/services/materia.service.jsx';
import Toast from '../../../components/Toast.jsx';
import exportActas from '../utils/exportActas.jsx';
import TablaPaginada from '../../../components/TablaPaginada.jsx';

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

  const getStoredUserId = () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return null;
      const user = JSON.parse(stored);
      return (
        user.id ??
        user.idusuario ??
        user.idUsuario ??
        user.idprofesor ??
        user.idProfesor ??
        user.idpsicologo ??
        user.idPsicologo ??
        null
      );
    } catch (error) {
      console.error('No se pudo leer el usuario local:', error);
      return null;
    }
  };

  const toNullableNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const resolveActaId = (row) => {
    if (!row) return null;
    const direct = row.idacta ?? row.id;
    if (direct) return direct;
    const match = actas.find((acta) => {
      if (row.idreservarentrevista && acta.idreservarentrevista) {
        return Number(acta.idreservarentrevista) === Number(row.idreservarentrevista);
      }
      return (
        acta.descripcion === row.descripcion &&
        acta.fechadecreacion === row.fechadecreacion &&
        acta.materia === row.materia &&
        acta.motivo === row.motivo
      );
    });
    return match?.idacta ?? null;
  };

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
    const actaId = resolveActaId(acta);

    if (!actaId) {
      showToast('No se pudo identificar el acta a editar.', 'error');
      return;
    }

    setEditedActa({
      id: actaId,
      idreservarentrevista: acta.idreservarentrevista ?? null,
      idmateria: materiaSeleccionada.idmateria || acta.idmateria,
      idmotivo: motivoSeleccionado.idmotivo || acta.idmotivo,
      fechadecreacion: acta.fechadecreacion,
      descripcion: acta.descripcion || '',
      descripcionOriginal: acta.descripcion || '',
      estado: acta.estado,
      idestudiante: acta.idestudiante ?? idestudiante,
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
    if (!editedActa.id) {
      showToast('No se pudo identificar el acta a editar.', 'error');
      return;
    }

    try {
      const descripcionActual = editedActa.descripcion?.trim() || '';
      const descripcionAnterior = editedActa.descripcionOriginal?.trim() || '';
      const descripcionCambio = descripcionActual !== descripcionAnterior;
      const usuarioModificacion = getStoredUserId();

      const updatedActaData = {
        idreservarentrevista: toNullableNumber(editedActa.idreservarentrevista),
        idmotivo: toNullableNumber(editedActa.idmotivo),
        descripcion: descripcionActual,
        fechadecreacion: editedActa.fechadecreacion,
        estado: editedActa.estado ?? true,
        idmateria: toNullableNumber(editedActa.idmateria),
        idestudiante: toNullableNumber(editedActa.idestudiante),
        usuariomodificacion: usuarioModificacion ? String(usuarioModificacion) : null,
      };

      if (descripcionCambio) {
        updatedActaData.descripcioncampo = descripcionAnterior;
        updatedActaData.descripcioncampoactualizado = descripcionActual;
      }

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
                  idacta: acta.idacta,
                  materia: acta.materia,
                  motivo: acta.motivo,
                  fechadecreacion: acta.fechadecreacion,
                  descripcion: acta.descripcion,
                  padre_nombre: acta.padre_nombre,
                  docente_nombre: acta.docente_nombre,
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
        <div className="acta-edit-modal">
          <div
            className="acta-edit-modal__backdrop"
            onClick={() => setEditModalOpen(false)}
            aria-hidden="true"
          />
          <div className="acta-edit-modal__card" role="dialog" aria-modal="true">
            <header className="acta-edit-modal__header">
              <div>
                <span className="acta-edit-modal__eyebrow">Gestion de usuarios</span>
                <h2>Editar acta</h2>
              </div>
              <button
                type="button"
                className="acta-edit-modal__close"
                onClick={() => setEditModalOpen(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </header>
            <div className="acta-edit-modal__body">
              <div className="acta-edit-modal__field">
                <label htmlFor="edit-acta-materia">Materia</label>
                <select
                  id="edit-acta-materia"
                  name="idmateria"
                  value={editedActa?.idmateria || ''}
                  onChange={(e) =>
                    setEditedActa((prev) => ({
                      ...prev,
                      idmateria: parseInt(e.target.value, 10),
                    }))
                  }
                  className="acta-edit-modal__control"
                >
                  <option value="">Selecciona la materia</option>
                  {materias.map((materia) => (
                    <option key={materia.idmateria} value={materia.idmateria}>
                      {materia.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="acta-edit-modal__field">
                <label htmlFor="edit-acta-motivo">Motivo</label>
                <select
                  id="edit-acta-motivo"
                  name="idmotivo"
                  value={editedActa?.idmotivo || ''}
                  onChange={(e) =>
                    setEditedActa((prev) => ({
                      ...prev,
                      idmotivo: parseInt(e.target.value, 10),
                    }))
                  }
                  className="acta-edit-modal__control"
                >
                  <option value="">Selecciona el motivo</option>
                  {motivos.map((motivo) => (
                    <option key={motivo.idmotivo} value={motivo.idmotivo}>
                      {motivo.nombremotivo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="acta-edit-modal__field">
                <label htmlFor="edit-acta-fecha">Fecha de creacion</label>
                <input
                  id="edit-acta-fecha"
                  type="date"
                  value={editedActa.fechadecreacion?.split('T')[0] || ''}
                  className="acta-edit-modal__control"
                  disabled
                />
              </div>
              <div className="acta-edit-modal__field acta-edit-modal__field--full">
                <label htmlFor="edit-acta-descripcion">Descripcion</label>
                <textarea
                  id="edit-acta-descripcion"
                  value={editedActa.descripcion}
                  onChange={(e) =>
                    setEditedActa((prev) => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                  rows={6}
                  className="acta-edit-modal__textarea"
                  placeholder="Describe el seguimiento de la reunion"
                />
              </div>
            </div>
            <footer className="acta-edit-modal__footer">
              <button
                type="button"
                className="acta-edit-modal__btn acta-edit-modal__btn--primary"
                onClick={saveEditedActa}
              >
                Guardar cambios
              </button>
              <button
                type="button"
                className="acta-edit-modal__btn acta-edit-modal__btn--ghost"
                onClick={() => setEditModalOpen(false)}
              >
                Cancelar
              </button>
            </footer>
          </div>
        </div>
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
