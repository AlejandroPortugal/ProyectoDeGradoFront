import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../../components/Header.jsx';
import UserTable from '../../../components/UserTable.jsx';
import Toast from '../../../components/Toast.jsx';
import DynamicModelForUsers from '../../../components/DynamicModelForUsers.jsx';
import ExportActions from '../../../components/ExportActions.jsx';
import { getUsuarios } from '../../users/services/users.service.jsx';
import { getDirecciones } from '../../direccion/services/direccion.service.jsx';
import {getProfesorById,putProfesor,deleteProfesor} from '../../profesores/services/profesor.service.jsx';
import {getAdministradorById,putAdministrador,deleteAdministrador} from '../services/administrador.service.jsx';
import {getPadreById,putPadre,deletePadre} from '../../padres/services/PadreDeFamilia.jsx';
import {getPsicologoById,putPsicologo,deletePsicologo} from '../../psicologos/services/psicologo.service.jsx';
import {getEstudianteById,putEstudiante,deleteEstudiante} from '../../estudiantes/services/Estudiante.service.jsx';
import { getCursosById } from '../../cursos/services/cursos.service.jsx';
import { getHorariosById } from '../../horarios/services/horario.service.jsx';

import './UserManagementPage.css';

const UserManagementPage = () => {
  const location = useLocation();
  const isEditMode = location.pathname.includes('/editar');



  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [curso, setCurso] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [lastSync, setLastSync] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchDirecciones();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsuarios();
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLastSync(new Date());
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      showToast('No se pudieron cargar los usuarios.', 'error');
    }
  };

  const fetchDirecciones = async () => {
    try {
      const response = await getDirecciones();
      setDirecciones(response.data);
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
    setCurso(null);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setCurso(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleView = async (user) => {
    let response;
    let horarioResponse;

    try {
      setCurso(null);

      if (user.rol === 'Profesor') {
        response = await getProfesorById(user.id);
        if (response.data.idhorario) {
          horarioResponse = await getHorariosById(response.data.idhorario);
        }
      } else if (user.rol === 'Administrador') {
        response = await getAdministradorById(user.id);
      } else if (user.rol === 'Padre de Familia') {
        response = await getPadreById(user.id);
      } else if (user.rol === 'Estudiante') {
        response = await getEstudianteById(user.id);
        const cursoResponse = await getCursosById(response.data.idcurso);
        setCurso(cursoResponse.data);
      } else if (user.rol === 'Psicologo') {
        response = await getPsicologoById(user.id);
        if (response.data.idhorario) {
          horarioResponse = await getHorariosById(response.data.idhorario);
        }
      }

      const horarioData = horarioResponse?.data || {};
      setSelectedUser({
        ...response.data,
        id: user.id,
        horainicio: horarioData.horainicio || response.data.horainicio,
        horafin: horarioData.horafin || response.data.horafin,
      });
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error al obtener detalle del usuario:', error);
      showToast('No se pudo cargar la ficha del usuario.', 'error');
    }
  };

  const handleEdit = async (user) => {
    let response;

    try {
      setCurso(null);

      if (user.rol === 'Profesor') {
        response = await getProfesorById(user.id);
      } else if (user.rol === 'Administrador') {
        response = await getAdministradorById(user.id);
      } else if (user.rol === 'Padre de Familia') {
        response = await getPadreById(user.id);
      } else if (user.rol === 'Estudiante') {
        response = await getEstudianteById(user.id);
        const cursoResponse = await getCursosById(response.data.idcurso);
        setCurso(cursoResponse.data);
      } else if (user.rol === 'Psicologo') {
        response = await getPsicologoById(user.id);
      }

      setSelectedUser({
        ...response.data,
        id: user.id,
        originalData: { ...response.data },
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al preparar usuario para edicion:', error);
      showToast('No se pudo cargar el formulario de edicion.', 'error');
    }
  };

  const saveEditedUser = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      if (selectedUser.rol === 'Profesor') {
        await putProfesor(selectedUser.id, selectedUser);
      } else if (selectedUser.rol === 'Administrador') {
        await putAdministrador(selectedUser.id, selectedUser);
      } else if (selectedUser.rol === 'Padre de Familia') {
        await putPadre(selectedUser.id, selectedUser);
      } else if (selectedUser.rol === 'Psicologo') {
        await putPsicologo(selectedUser.id, selectedUser);
      } else if (selectedUser.rol === 'Estudiante') {
        await putEstudiante(selectedUser.id, selectedUser);
      }

      showToast('Usuario actualizado correctamente.', 'success');
      closeEditModal();
      fetchUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      showToast('No se pudieron guardar los cambios.', 'error');
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      if (selectedUser.rol === 'Profesor') {
        await deleteProfesor(selectedUser.id);
      } else if (selectedUser.rol === 'Administrador') {
        await deleteAdministrador(selectedUser.id);
      } else if (selectedUser.rol === 'Padre de Familia') {
        await deletePadre(selectedUser.id);
      } else if (selectedUser.rol === 'Psicologo') {
        await deletePsicologo(selectedUser.id);
      } else if (selectedUser.rol === 'Estudiante') {
        await deleteEstudiante(selectedUser.id);
      }

      showToast('Usuario eliminado exitosamente.', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showToast('No se pudo eliminar el usuario.', 'error');
    } finally {
      closeDeleteModal();
    }
  };

  const totalUsersCount = users.length;
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredBySearch = useMemo(() => {
    if (!normalizedSearch) {
      return filteredUsers;
    }

    return filteredUsers.filter((user) => {
      const searchable = [user.nombres, user.apellidopaterno, user.apellidomaterno, user.rol]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [filteredUsers, normalizedSearch]);

  const filteredUsersCount = filteredBySearch.length;

  const roleSummary = useMemo(() => {
    const summary = users.reduce((acc, user) => {
      const key = user.rol || 'Sin rol';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(summary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [users]);

  const formattedSync =
    lastSync &&
    lastSync.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <main className="user-management-page">


      <section className="user-management-hero">
        <div className="user-management-hero__copy">
          <span className="user-management-hero__eyebrow">Panel de usuarios</span>
          <h2>Gestiona a los usuarios de la comunidad educativa</h2>
          <p>
            Visualiza los perfiles registrados, revisa sus roles y manten el control del acceso de
            toda la institucion.
          </p>
          <div className="user-management-hero__meta">
            <span className="user-management-hero__chip">
              Usuarios totales: <strong>{totalUsersCount}</strong>
            </span>
            <span className="user-management-hero__chip">
              Resultados mostrados: <strong>{filteredUsersCount}</strong>
            </span>
            {formattedSync && (
              <span className="user-management-hero__chip">
                Ultima actualizacion: <strong>{formattedSync}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="user-management-hero__stats">
          {roleSummary.map(([role, count]) => (
            <article key={role} className="user-management-hero__stat-card">
              <span className="user-management-hero__stat-count">{count}</span>
              <span className="user-management-hero__stat-label">{role}</span>
            </article>
          ))}
        </div>

        <div className="user-management-hero__tools">
          <input
            className="user-management-hero__search"
            type="search"
            placeholder="Buscar por nombre, apellido o rol"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <ExportActions
            data={filteredBySearch}
            context="Usuarios"
            selectedDate={new Date().toLocaleDateString()}
            title="Listado de Usuarios del Sistema"
            columns={[
              { title: 'Nombres', field: 'nombres' },
              { title: 'Apellido Paterno', field: 'apellidopaterno' },
              { title: 'Apellido Materno', field: 'apellidomaterno' },
              { title: 'Rol', field: 'rol' },
            ]}
          />
        </div>
      </section>

      <section className="user-management-container">
        <UserTable
          users={filteredBySearch}
          onView={handleView}
          onEdit={isEditMode ? handleEdit : null}
          onDelete={isEditMode ? handleDelete : null}
          exportTitle="Listado de Usuarios del Sistema"
          showToolbar={false}
          filterTerm={searchTerm}
          onFilterChange={setSearchTerm}
        />

        {toast.show && (
          <div className="user-management-toast">
            <Toast message={toast.message} type={toast.type} onClose={hideToast} />
          </div>
        )}
      </section>

      <DynamicModelForUsers
        isOpen={isViewModalOpen}
        title={`Visualizar ${selectedUser?.rol || ''}`}
        content={selectedUser && renderViewContent(selectedUser, curso)}
        onClose={closeViewModal}
      />

      <DynamicModelForUsers
        isOpen={isModalOpen}
        title={`Editar ${selectedUser?.rol || ''}`}
        content={selectedUser && <form>{renderEditContent(selectedUser, direcciones, setSelectedUser)}</form>}
        onSave={saveEditedUser}
        onCancel={closeEditModal}
        showDescription
      />

      <DynamicModelForUsers
        isOpen={isDeleteModalOpen}
        title="Eliminar Usuario"
        content={
          <div>
            <p>Esta seguro de que desea eliminar a {selectedUser?.nombres}?</p>
          </div>
        }
        onConfirm={confirmDeleteUser}
        onCancel={closeDeleteModal}
      />
    </main>
  );
};

const renderViewContent = (selectedUser, curso) => {
  if (!selectedUser) {
    return null;
  }

  const buildGrid = (fields) => (
    <div className="users-modal__info-grid">
      {fields.map(({ label, value }) => (
        <div key={label} className="users-modal__info-item">
          <span className="users-modal__info-label">{label}</span>
          <span className="users-modal__info-value">{value || 'N/A'}</span>
        </div>
      ))}
    </div>
  );

  const phoneNumber = selectedUser.numcelular || selectedUser.telefono || '';
  const birthDate =
    selectedUser.fechadenacimiento || selectedUser.fechanacimiento || selectedUser.fechanacimiento;

  if (selectedUser.rol === 'Profesor') {
    return buildGrid([
      { label: 'Nombre', value: selectedUser.nombres },
      { label: 'Apellido paterno', value: selectedUser.apellidopaterno },
      { label: 'Apellido materno', value: selectedUser.apellidomaterno },
      { label: 'Correo', value: selectedUser.email },
      { label: 'Numero celular', value: phoneNumber },
      { label: 'Fecha de nacimiento', value: birthDate },
      { label: 'Rol', value: selectedUser.rol },
      { label: 'Hora inicio entrevista', value: selectedUser.horainicio },
      { label: 'Hora fin entrevista', value: selectedUser.horafin },
    ]);
  }

  if (selectedUser.rol === 'Estudiante') {
    return buildGrid([
      { label: 'ID padre', value: selectedUser.idpadre },
      {
        label: 'Curso',
        value: curso ? `${curso.nombrecurso} ${curso.paralelo} - ${curso.nivel}` : 'Cargando...',
      },
      { label: 'Nombres', value: selectedUser.nombres },
      { label: 'Apellido paterno', value: selectedUser.apellidopaterno },
      { label: 'Apellido materno', value: selectedUser.apellidomaterno },
      { label: 'Fecha de nacimiento', value: birthDate },
      { label: 'Rol', value: selectedUser.rol },
    ]);
  }

  if (selectedUser.rol === 'Psicologo') {
    return buildGrid([
      { label: 'Nombre', value: selectedUser.nombres },
      { label: 'Apellido paterno', value: selectedUser.apellidopaterno },
      { label: 'Apellido materno', value: selectedUser.apellidomaterno },
      { label: 'Correo', value: selectedUser.email },
      { label: 'Numero celular', value: phoneNumber },
      { label: 'Fecha de nacimiento', value: birthDate },
      { label: 'Rol', value: selectedUser.rol },
      { label: 'Hora inicio entrevista', value: selectedUser.horainicio },
      { label: 'Hora fin entrevista', value: selectedUser.horafin },
    ]);
  }

  if (selectedUser.rol === 'Administrador' || selectedUser.rol === 'Padre de Familia') {
    return buildGrid([
      { label: 'Nombres', value: selectedUser.nombres },
      { label: 'Apellido paterno', value: selectedUser.apellidopaterno },
      { label: 'Apellido materno', value: selectedUser.apellidomaterno },
      { label: 'Correo', value: selectedUser.email },
      { label: 'Numero celular', value: phoneNumber },
      { label: 'Fecha de nacimiento', value: birthDate },
      { label: 'Rol', value: selectedUser.rol },
    ]);
  }

  return buildGrid([
    { label: 'Nombres', value: selectedUser.nombres },
    { label: 'Apellido paterno', value: selectedUser.apellidopaterno },
    { label: 'Apellido materno', value: selectedUser.apellidomaterno },
    { label: 'Correo', value: selectedUser.email },
    { label: 'Numero celular', value: phoneNumber },
    { label: 'Fecha de nacimiento', value: birthDate },
    { label: 'Rol', value: selectedUser.rol },
  ]);
};

const renderEditContent = (selectedUser, direcciones, setSelectedUser) => {
  if (!selectedUser) {
    return null;
  }

  const detectedDateKey =
    selectedUser.fechadenacimiento !== undefined
      ? 'fechadenacimiento'
      : selectedUser.fechanacimiento !== undefined
      ? 'fechanacimiento'
      : 'fechadenacimiento';
  const detectedDateValue = selectedUser[detectedDateKey]
    ? selectedUser[detectedDateKey].slice(0, 10)
    : '';

  if (selectedUser.rol === 'Estudiante') {
    return (
      <div className="users-modal__form-grid">
        <div className="users-modal__field">
          <label htmlFor="edit-idpadre">ID Padre</label>
          <input
            id="edit-idpadre"
            type="text"
            value={selectedUser.idpadre || ''}
            onChange={(event) =>
              setSelectedUser((prev) => ({ ...prev, idpadre: event.target.value }))
            }
          />
        </div>
        <div className="users-modal__field">
          <label htmlFor="edit-idcurso">ID Curso</label>
          <input
            id="edit-idcurso"
            type="text"
            value={selectedUser.idcurso || ''}
            onChange={(event) =>
              setSelectedUser((prev) => ({ ...prev, idcurso: event.target.value }))
            }
          />
        </div>
        <div className="users-modal__field">
          <label htmlFor="edit-estudiante-nombres">Nombres</label>
          <input
            id="edit-estudiante-nombres"
            type="text"
            value={selectedUser.nombres || ''}
            onChange={(event) =>
              setSelectedUser((prev) => ({ ...prev, nombres: event.target.value }))
            }
          />
        </div>
        <div className="users-modal__field">
          <label htmlFor="edit-estudiante-apellidopaterno">Apellido Paterno</label>
          <input
            id="edit-estudiante-apellidopaterno"
            type="text"
            value={selectedUser.apellidopaterno || ''}
            onChange={(event) =>
              setSelectedUser((prev) => ({ ...prev, apellidopaterno: event.target.value }))
            }
          />
        </div>
        <div className="users-modal__field">
          <label htmlFor="edit-estudiante-apellidomaterno">Apellido Materno</label>
          <input
            id="edit-estudiante-apellidomaterno"
            type="text"
            value={selectedUser.apellidomaterno || ''}
            onChange={(event) =>
              setSelectedUser((prev) => ({ ...prev, apellidomaterno: event.target.value }))
            }
          />
        </div>
        <div className="users-modal__field">
          <label htmlFor="edit-estudiante-fechanacimiento">Fecha de nacimiento</label>
          <input
            id="edit-estudiante-fechanacimiento"
            type="date"
            value={detectedDateValue}
            onChange={(event) =>
              setSelectedUser((prev) => ({ ...prev, [detectedDateKey]: event.target.value }))
            }
          />
        </div>
      </div>
    );
  }

  const editableFields = [
    { id: 'nombres', label: 'Nombres', type: 'text' },
    { id: 'apellidopaterno', label: 'Apellido Paterno', type: 'text' },
    { id: 'apellidomaterno', label: 'Apellido Materno', type: 'text' },
    { id: 'email', label: 'Correo', type: 'email' },
    { id: 'numcelular', label: 'Numero Celular', type: 'text' },
    { id: detectedDateKey, label: 'Fecha de nacimiento', type: 'date', value: detectedDateValue },
  ];

  const shouldRenderDirecciones =
    direcciones && direcciones.length > 0 && selectedUser.rol !== 'Padre de Familia';

  return (
    <div className="users-modal__form-grid">
      {editableFields.map(({ id, label, type, value }) => (
        <div key={id} className="users-modal__field">
          <label htmlFor={`edit-${id}`}>{label}</label>
          <input
            id={`edit-${id}`}
            type={type}
            value={value !== undefined ? value : selectedUser[id] || ''}
            onChange={(event) =>
              setSelectedUser((prev) => ({ ...prev, [id]: event.target.value }))
            }
          />
        </div>
      ))}

      {shouldRenderDirecciones && (
        <div className="users-modal__field users-modal__field--full">
          <label htmlFor="edit-direccion">Direccion</label>
          <select
            id="edit-direccion"
            value={selectedUser.iddireccion || ''}
            onChange={(event) =>
              setSelectedUser((prev) => ({ ...prev, iddireccion: event.target.value }))
            }
          >
            <option value="">Selecciona una direccion</option>
            {direcciones.map((direccion) => (
              <option key={direccion.iddireccion} value={direccion.iddireccion}>
                {direccion.zona} - {direccion.calle} - {direccion.num_puerta}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
export default UserManagementPage;


