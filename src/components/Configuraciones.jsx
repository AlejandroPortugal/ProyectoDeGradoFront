import React, { useState, useEffect } from 'react';
import './Configuraciones.css';
import {
    getAdministradorById,
    putAdministrador,
} from '../servicios/administrador.service.jsx';
import { getPadreById, putPadre } from '../servicios/PadreDeFamilia.jsx';
import { getProfesorById, putProfesor } from '../servicios/profesor.service.jsx';
import { getPsicologoById, putPsicologo } from '../servicios/psicologo.service.jsx';
import Toast from './Toast';
import eyeIcon from '../recursos/icons/Eye.svg';



const Configuraciones = () => {
    const [toast, setToast] = useState({ message: '', type: '', visible: false });
    const [enablePasswordFields, setEnablePasswordFields] = useState(false);

    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        correo: '',
        rol: '',
        contrasenaActual: '',
        contrasenaNueva: '',
        confirmarContrasena: '',
    });

    const handleEnablePasswordFields = () => {
        setEnablePasswordFields(true);
    };

    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [showPassword, setShowPassword] = useState({
        contrasenaActual: false,
        contrasenaNueva: false,
        confirmarContrasena: false,
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserId(parsedUser.id);
            setUserRole(parsedUser.role);
            fetchUserData(parsedUser.id, parsedUser.role);
        } else {
            console.error("No se encontraron datos en el localStorage");
        }
    }, []);

    const fetchUserData = async (id, role) => {
        try {
            let response;
            switch (role) {
                case 'Administrador':
                    response = await getAdministradorById(id);
                    break;
                case 'Padre de Familia':
                    response = await getPadreById(id);
                    break;
                case 'Profesor':
                    response = await getProfesorById(id);
                    break;
                case 'Psicólogo':
                    response = await getPsicologoById(id);
                    break;
                default:
                    console.error('Rol desconocido');
                    return;
            }

            const userData = response.data;
            setFormData({
                ...formData,
                nombres: userData.nombres || '',
                apellidos: `${userData.apellidopaterno || ''} ${userData.apellidomaterno || ''}`,
                correo: userData.email || '',
                rol: role,
            });
        } catch (error) {
            setToast({ message: 'Error al obtener los datos del usuario', type: 'error', visible: true });

        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (enablePasswordFields) {
            // Validar contraseñas
            if (!validatePassword(formData.contrasenaNueva)) {
                setToast({
                    message: 'La nueva contraseña debe tener al menos una mayúscula, un número y un carácter especial.',
                    type: 'error',
                    visible: true,
                });
                return;
            }

            if (formData.contrasenaNueva !== formData.confirmarContrasena) {
                setToast({
                    message: 'Las contraseñas no coinciden.',
                    type: 'error',
                    visible: true,
                });
                return;
            }
        }

        try {
            const [apellidopaterno, apellidomaterno] = formData.apellidos.split(' ');
            const payload = {
                nombres: formData.nombres,
                apellidopaterno,
                apellidomaterno,
                email: formData.correo,
            };

            switch (userRole) {
                case 'Administrador':
                    await putAdministrador(userId, payload);
                    break;
                case 'Padre de Familia':
                    await putPadre(userId, payload);
                    break;
                case 'Profesor':
                    await putProfesor(userId, payload);
                    break;
                case 'Psicólogo':
                    await putPsicologo(userId, payload);
                    break;
                default:
                    console.error('Rol desconocido');
                    return;
            }

            setToast({ message: 'Datos actualizados correctamente', type: 'success', visible: true });

            // Bloquear los campos de contraseña tras guardar
            setEnablePasswordFields(false);
            setFormData((prev) => ({
                ...prev,
                contrasenaActual: '',
                contrasenaNueva: '',
                confirmarContrasena: '',
            }));
        } catch (error) {
            console.error('Error al actualizar los datos:', error);
            setToast({ message: 'Ocurrió un error al actualizar los datos', type: 'error', visible: true });
        }
    };


    const handleCancel = () => {
        // Recuperar datos iniciales del usuario
        fetchUserData(userId, userRole);

        // Bloquear los campos de contraseña y resetear los valores
        setEnablePasswordFields(false);
        setFormData((prev) => ({
            ...prev,
            contrasenaActual: '',
            contrasenaNueva: '',
            confirmarContrasena: '',
        }));

        // Mostrar mensaje de cancelación
        setToast({ message: 'Cambios cancelados', type: 'info', visible: true });
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };



    const detectedRole = formData.rol || userRole;
    const roleDescription = {
        Administrador: 'Gestiona accesos, roles y la configuración general del sistema.',
        Profesor: 'Actualiza tus datos y administra la información de tu aula.',
        'Padre de Familia': 'Mantén tus datos al día para recibir las notificaciones y reportes.',
        Psicólogo: 'Asegura la confidencialidad de tus entrevistas manteniendo tu perfil actualizado.',
    }[detectedRole] || 'Actualiza tus datos personales y de acceso cuando lo necesites.';
    
    return (
        <main className="configuraciones-page">
            <section className="configuraciones-hero">
                <div className="configuraciones-hero__copy">
                    <span className="configuraciones-hero__eyebrow">Centro de configuración</span>
                    <h2>Gestiona tu perfil y seguridad con confianza</h2>
                    <p>{roleDescription}</p>
                    <div className="configuraciones-hero__meta">
                        <span className="configuraciones-hero__chip">
                            Rol asignado: <strong>{detectedRole || 'Sin rol'}</strong>
                        </span>
                        <span className="configuraciones-hero__chip">
                            Última actualización: <strong>{new Date().toLocaleDateString()}</strong>
                        </span>
                        <span className="configuraciones-hero__chip">
                            Estado de contraseña: <strong>{enablePasswordFields ? 'En edición' : 'Sin cambios'}</strong>
                        </span>
                    </div>
                </div>

                <div className="configuraciones-hero__stats">
                    <article className="configuraciones-hero__stat-card">
                        <span className="configuraciones-hero__stat-count">{formData.nombres ? '✓' : '-'}</span>
                        <span className="configuraciones-hero__stat-label">Datos personales</span>
                    </article>
                    <article className="configuraciones-hero__stat-card">
                        <span className="configuraciones-hero__stat-count">{detectedRole ? '✓' : '-'}</span>
                        <span className="configuraciones-hero__stat-label">Rol activo</span>
                    </article>
                    <article className="configuraciones-hero__stat-card">
                        <span className="configuraciones-hero__stat-count">
                            {enablePasswordFields ? '…' : '✓'}
                        </span>
                        <span className="configuraciones-hero__stat-label">Seguridad</span>
                    </article>
                </div>

                <div className="configuraciones-hero__tools">
                    <button type="button" className="configuraciones-hero__action" onClick={handleCancel}>
                        Restablecer cambios
                    </button>
                    <button
                        type="button"
                        className="configuraciones-hero__action configuraciones-hero__action--outline"
                        onClick={handleEnablePasswordFields}
                        disabled={enablePasswordFields}
                    >
                        {enablePasswordFields ? 'Edición habilitada' : 'Actualizar contraseña'}
                    </button>
                </div>
            </section>

            <div className="configuraciones-container">
                {toast.visible && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ ...toast, visible: false })}
                    />
                )}
                <form onSubmit={handleSubmit} className="configuraciones-grid">
                    {/* Card de Información Personal */}
                    <div className="configuraciones-card">
                        <h2 className="section-title">Información Personal</h2>
                        <div className="form-group">
                            <label htmlFor="nombres">Nombres</label>
                            <div className="editable-field">
                                <input
                                    type="text"
                                    id="nombres"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleInputChange}
                                />
                                <button type="button" className="edit-btn-configuracion">✎</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellidos">Apellidos</label>
                            <div className="editable-field">
                                <input
                                    type="text"
                                    id="apellidos"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleInputChange}
                                />
                                <button type="button" className="edit-btn-configuracion">✎</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="correo">Correo Electrónico</label>
                            <div className="editable-field">
                                <input
                                    type="email"
                                    id="correo"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleInputChange}
                                />
                                <button type="button" className="edit-btn-configuracion">✎</button>
                            </div>
                        </div>
                    </div>

                    {/* Card de Cambiar Contraseña */}
                    <div className="configuraciones-card">
                        <h2 className="section-title">Cambiar Contraseña</h2>
                        <div className="form-group">
                            <label htmlFor="rol">Rol</label>
                            <input type="text" id="rol" name="rol" value={formData.rol} disabled />
                        </div>

                        <div className="form-group">
  <label htmlFor="contrasenaActual">Contraseña Actual</label>
  <div className="password-field">
    <input
      type={showPassword.contrasenaActual ? 'text' : 'password'}
      id="contrasenaActual"
      name="contrasenaActual"
      value={formData.contrasenaActual}
      onChange={handleInputChange}
    />
    <img
      src={eyeIcon}
      alt="Toggle Password Visibility"
      className="eye-icon"
      onClick={() => togglePasswordVisibility('contrasenaActual')}
    />
  </div>
</div>

<div className="form-group">
  <label htmlFor="contrasenaNueva">Contraseña Nueva</label>
  <div className="password-field">
    <input
      type={showPassword.contrasenaNueva ? 'text' : 'password'}
      id="contrasenaNueva"
      name="contrasenaNueva"
      value={formData.contrasenaNueva}
      onChange={handleInputChange}
      disabled={!enablePasswordFields}
    />
    <img
      src={eyeIcon}
      alt="Toggle Password Visibility"
      className="eye-icon"
      onClick={() => togglePasswordVisibility('contrasenaNueva')}
      style={{ opacity: enablePasswordFields ? 1 : 0.5, cursor: enablePasswordFields ? 'pointer' : 'not-allowed' }}
    />
  </div>
</div>

<div className="form-group">
  <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
  <div className="password-field">
    <input
      type={showPassword.confirmarContrasena ? 'text' : 'password'}
      id="confirmarContrasena"
      name="confirmarContrasena"
      value={formData.confirmarContrasena}
      onChange={handleInputChange}
      disabled={!enablePasswordFields}
    />
    <img
      src={eyeIcon}
      alt="Toggle Password Visibility"
      className="eye-icon"
      onClick={() => togglePasswordVisibility('confirmarContrasena')}
      style={{ opacity: enablePasswordFields ? 1 : 0.5, cursor: enablePasswordFields ? 'pointer' : 'not-allowed' }}
    />
  </div>
</div>
                    </div>
                </form>
                <div className="form-group">
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>
                            Cancelar
                        </button>
                        <button type="submit" className="confirm-btn" onClick={handleSubmit}>
                            Confirmar
                        </button>
                        <button
                            type="button"
                            className="enable-password-btn"
                            onClick={handleEnablePasswordFields}
                            disabled={enablePasswordFields}
                        >
                            Actualizar Contraseña
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Configuraciones;


