import React, { useEffect, useMemo, useState } from 'react';
import './Configuraciones.css';
import {
    getAdministradorById,
    putAdministrador,
} from '../../administracion/services/administrador.service.jsx';
import { getPadreById, putPadre } from '../../padres/services/PadreDeFamilia.jsx';
import { getProfesorById, putProfesor } from '../../profesores/services/profesor.service.jsx';
import { getPsicologoById, putPsicologo } from '../../psicologos/services/psicologo.service.jsx';
import Toast from '../../../components/Toast.jsx';
import eyeIcon from '../../../recursos/icons/Eye.svg';
import { getSessionUser } from '../../../utils/session.js';

const EMPTY_FORM = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rol: '',
    contrasenaNueva: '',
    confirmarContrasena: '',
};

const normalizeRole = (role) => {
    const rawRole = (role || '').toString().trim();
    const normalized = rawRole
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    if (normalized === 'administrador') return 'Administrador';
    if (normalized === 'padre de familia') return 'Padre de Familia';
    if (normalized === 'profesor') return 'Profesor';
    if (normalized === 'psicologo') return 'Psicologo';
    return rawRole;
};

const Configuraciones = () => {
    const [toast, setToast] = useState({ message: '', type: '', visible: false });
    const [enablePasswordFields, setEnablePasswordFields] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [initialData, setInitialData] = useState(null);
    const [showPassword, setShowPassword] = useState({
        contrasenaNueva: false,
        confirmarContrasena: false,
    });

    const handleEnablePasswordFields = () => {
        setEnablePasswordFields(true);
    };

    useEffect(() => {
        const parsedUser = getSessionUser();
        if (!parsedUser) {
            console.error('No se pudo reconstruir la sesion desde el token');
            return;
        }

        const normalizedRole = normalizeRole(parsedUser.role);
        setUserId(parsedUser.id);
        setUserRole(normalizedRole);
        fetchUserData(parsedUser.id, normalizedRole);
    }, []);

    const fetchUserData = async (id, role) => {
        try {
            let response;
            switch (normalizeRole(role)) {
                case 'Administrador':
                    response = await getAdministradorById(id);
                    break;
                case 'Padre de Familia':
                    response = await getPadreById(id);
                    break;
                case 'Profesor':
                    response = await getProfesorById(id);
                    break;
                case 'Psicologo':
                    response = await getPsicologoById(id);
                    break;
                default:
                    console.error('Rol desconocido');
                    return;
            }

            const userData = response.data || {};
            const nextData = {
                nombres: userData.nombres || '',
                apellidoPaterno: userData.apellidopaterno || '',
                apellidoMaterno: userData.apellidomaterno || '',
                rol: normalizeRole(role),
                contrasenaNueva: '',
                confirmarContrasena: '',
            };

            setInitialData(nextData);
            setFormData(nextData);
        } catch (error) {
            console.error('Error al obtener los datos del usuario:', error);
            setToast({ message: 'Error al obtener los datos del usuario', type: 'error', visible: true });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field) => {
        if (!enablePasswordFields) return;

        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombres.trim() || !formData.apellidoPaterno.trim() || !formData.apellidoMaterno.trim()) {
            setToast({
                message: 'Nombres, apellido paterno y apellido materno son obligatorios.',
                type: 'error',
                visible: true,
            });
            return;
        }

        if (enablePasswordFields) {
            if (!formData.contrasenaNueva) {
                setToast({
                    message: 'Ingresa la nueva contrasena para actualizarla.',
                    type: 'error',
                    visible: true,
                });
                return;
            }

            if (!validatePassword(formData.contrasenaNueva)) {
                setToast({
                    message: 'La nueva contrasena debe tener al menos una mayuscula, un numero y un caracter especial.',
                    type: 'error',
                    visible: true,
                });
                return;
            }

            if (formData.contrasenaNueva !== formData.confirmarContrasena) {
                setToast({
                    message: 'Las contrasenas no coinciden.',
                    type: 'error',
                    visible: true,
                });
                return;
            }
        }

        const payload = {
            nombres: formData.nombres.trim(),
            apellidopaterno: formData.apellidoPaterno.trim(),
            apellidomaterno: formData.apellidoMaterno.trim(),
            rol: normalizeRole(formData.rol || userRole),
        };

        if (enablePasswordFields && formData.contrasenaNueva) {
            payload.contrasenia = formData.contrasenaNueva;
        }

        try {
            switch (normalizeRole(userRole)) {
                case 'Administrador':
                    await putAdministrador(userId, payload);
                    break;
                case 'Padre de Familia':
                    await putPadre(userId, payload);
                    break;
                case 'Profesor':
                    await putProfesor(userId, payload);
                    break;
                case 'Psicologo':
                    await putPsicologo(userId, payload);
                    break;
                default:
                    console.error('Rol desconocido');
                    return;
            }

            const refreshedData = {
                ...formData,
                contrasenaNueva: '',
                confirmarContrasena: '',
            };

            setInitialData(refreshedData);
            setFormData(refreshedData);
            setEnablePasswordFields(false);
            setShowPassword({
                contrasenaNueva: false,
                confirmarContrasena: false,
            });

            setToast({ message: 'Datos actualizados correctamente', type: 'success', visible: true });
        } catch (error) {
            console.error('Error al actualizar los datos:', error);
            setToast({ message: 'Ocurrio un error al actualizar los datos', type: 'error', visible: true });
        }
    };

    const handleCancel = () => {
        if (initialData) {
            setFormData(initialData);
        }

        setEnablePasswordFields(false);
        setShowPassword({
            contrasenaNueva: false,
            confirmarContrasena: false,
        });
        setToast({ message: 'Cambios cancelados', type: 'info', visible: true });
    };

    const detectedRole = normalizeRole(formData.rol || userRole);
    const roleDescription = {
        Administrador: 'Gestiona accesos, roles y la configuracion general del sistema.',
        Profesor: 'Actualiza tus datos y administra la informacion de tu aula.',
        'Padre de Familia': 'Manten tus datos al dia para recibir las notificaciones y reportes.',
        Psicologo: 'Actualiza los datos de tu perfil.',
    }[detectedRole] || 'Actualiza tus datos personales y de acceso cuando lo necesites.';

    const hasPersonalData = useMemo(
        () =>
            Boolean(
                formData.nombres.trim() &&
                    formData.apellidoPaterno.trim() &&
                    formData.apellidoMaterno.trim()
            ),
        [formData.nombres, formData.apellidoPaterno, formData.apellidoMaterno]
    );

    return (
        <main className="configuraciones-page">
            <section className="configuraciones-hero">
                <div className="configuraciones-hero__copy">
                    <span className="configuraciones-hero__eyebrow">Centro de configuracion</span>
                    <h2>Gestiona tu perfil y seguridad con confianza</h2>
                    <p>{roleDescription}</p>
                    <div className="configuraciones-hero__meta">
                        <span className="configuraciones-hero__chip">
                            Rol asignado: <strong>{detectedRole || 'Sin rol'}</strong>
                        </span>
                        <span className="configuraciones-hero__chip">
                            Ultima actualizacion: <strong>{new Date().toLocaleDateString()}</strong>
                        </span>
                        <span className="configuraciones-hero__chip">
                            Estado de contrasena: <strong>{enablePasswordFields ? 'En edicion' : 'Sin cambios'}</strong>
                        </span>
                    </div>
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
                        {enablePasswordFields ? 'Edicion habilitada' : 'Actualizar contrasena'}
                    </button>
                </div>
            </section>

            <div className="configuraciones-container">
                {toast.visible && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
                    />
                )}

                <form onSubmit={handleSubmit} className="configuraciones-grid">
                    <div className="configuraciones-card">
                        <h2 className="section-title">Informacion personal</h2>

                        <div className="form-group">
                            <label htmlFor="nombres">Nombres</label>
                            <input
                                type="text"
                                id="nombres"
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellidoPaterno">Apellido paterno</label>
                            <input
                                type="text"
                                id="apellidoPaterno"
                                name="apellidoPaterno"
                                value={formData.apellidoPaterno}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellidoMaterno">Apellido materno</label>
                            <input
                                type="text"
                                id="apellidoMaterno"
                                name="apellidoMaterno"
                                value={formData.apellidoMaterno}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="configuraciones-card">
                        <h2 className="section-title">Acceso y seguridad</h2>

                        <div className="form-group">
                            <label htmlFor="rol">Rol</label>
                            <input type="text" id="rol" name="rol" value={detectedRole} disabled />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contrasenaNueva">Contrasena nueva</label>
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
                                    alt="Mostrar u ocultar contrasena"
                                    className="eye-icon"
                                    onClick={() => togglePasswordVisibility('contrasenaNueva')}
                                    style={{
                                        opacity: enablePasswordFields ? 1 : 0.5,
                                        cursor: enablePasswordFields ? 'pointer' : 'not-allowed',
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmarContrasena">Confirmar contrasena</label>
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
                                    alt="Mostrar u ocultar contrasena"
                                    className="eye-icon"
                                    onClick={() => togglePasswordVisibility('confirmarContrasena')}
                                    style={{
                                        opacity: enablePasswordFields ? 1 : 0.5,
                                        cursor: enablePasswordFields ? 'pointer' : 'not-allowed',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={handleCancel}>
                                Cancelar
                            </button>
                            <button type="submit" className="confirm-btn">
                                Guardar cambios
                            </button>
                            <button
                                type="button"
                                className="enable-password-btn"
                                onClick={handleEnablePasswordFields}
                                disabled={enablePasswordFields}
                            >
                                Actualizar contrasena
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default Configuraciones;
