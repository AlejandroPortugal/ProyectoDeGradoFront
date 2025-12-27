import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import { getMotivos } from '../../servicios/motivo.service';
import { crearReservaEntrevista } from '../../servicios/teoriaDeColas.service';
import './AgendarEntrevista.css';
import MenuPadres from './MenuPadres';
import Toast from '../../components/Toast';
import FullScreenLoader from '../ComponentsProfesores/ProgresoCircular.jsx'; // Importar el componente ProgresoCircular

registerLocale('es', es);

const AgendarEntrevista = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { idProfesor, idPsicologo, nombre, materia, dia, horainicio } = location.state || {};
  const [motivos, setMotivos] = useState([]);
  const [idMotivo, setIdMotivo] = useState('');
  const [fecha, setFecha] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Estado para mostrar el loader
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        const response = await getMotivos();
        setMotivos(response.data);
      } catch (error) {
        console.error('Error al cargar motivos:', error);
      }
    };

    fetchMotivos();
  }, []);

  const isDayEnabled = (date) => {
    const today = new Date();
    if (date < today) {
      return false;
    }

    const dayOfWeek = date.getDay();

    const daysMap = {
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
      Domingo: 0,
    };

    return dayOfWeek === daysMap[dia];
  };

  const handleAgendar = async () => {
    const usuario = JSON.parse(localStorage.getItem('user'));
    const idPadre = usuario?.id;

    if ((!idProfesor && !idPsicologo) || !idMotivo || !fecha || !idPadre) {
      setToastMessage('Por favor complete todos los campos obligatorios.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const data = {
      idProfesor: idProfesor || null,
      idPsicologo: idPsicologo || null,
      idPadre,
      fecha: fecha.toISOString().split('T')[0],
      idMotivo,
      horainicio,
      profesor: {
        nombre,
        materia,
        dia,
        horainicio,
      },
    };

    setIsLoading(true); // Mostrar el loader
    try {
      const response = await crearReservaEntrevista(data);
      const { message, success } = response.data;

      setToastMessage(message);
      setToastType(success ? 'success' : 'error');
      setShowToast(true);

      if (success) {
        setTimeout(() => {
          setShowToast(false);
          navigate('/listaprofesoresentrevistas');
        }, 5000);
      }
    } catch (error) {
      console.error('Error al agendar entrevista:', error);

      const errorMessage =
        error.response?.data?.message ||
        'Error al agendar la entrevista. La agenda del profesor está llena.';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false); // Ocultar el loader
    }
  };

  return (
    <div className="container">
      <MenuPadres />
      <h1 className="title">HORARIO DE ENTREVISTA</h1>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Nombre del Profesor</th>
            <th>Materia</th>
            <th>Día</th>
            <th>Hora de Inicio</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{nombre || 'No disponible'}</td>
            <td>{materia || 'No disponible'}</td>
            <td>{dia || 'No disponible'}</td>
            <td>{horainicio || 'No disponible'}</td>
          </tr>
        </tbody>
      </table>
      <div className="date-picker motive-dropdown">
        <label>Seleccione la Fecha:</label>
        <DatePicker
          selected={fecha}
          onChange={(date) => setFecha(date)}
          filterDate={isDayEnabled}
          minDate={new Date()}
          locale="es"
          placeholderText="Seleccione una fecha válida"
          dateFormat="yyyy-MM-dd"
        />
      </div>
      <div className="motive-selection">
        <select
          className="motive-dropdown"
          value={idMotivo}
          onChange={(e) => setIdMotivo(e.target.value)}
        >
          <option value="" disabled>
            Seleccione el motivo
          </option>
          {motivos.map((motivo) => (
            <option key={motivo.idmotivo} value={motivo.idmotivo}>
              {motivo.nombremotivo}
            </option>
          ))}
        </select>
      </div>
      <div className="action-buttons">
        <button className="cancel-button" onClick={() => navigate('/listaprofesoresentrevistas')}>
          Cancelar
        </button>
        <button className="confirm-button" onClick={handleAgendar}>
          Agendar
        </button>
      </div>

      {isLoading && <FullScreenLoader />} {/* Mostrar el componente ProgresoCircular */}

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default AgendarEntrevista;

