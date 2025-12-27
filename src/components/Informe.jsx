import React, { useEffect, useState } from 'react';
import './Informe.css';
import imgInforme from '../recursos/image/Informe.jpg';
import imgActas from '../recursos/image/Actas.jpg';
import imgProfesores from '../recursos/image/Profesores.png';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getUsuarios, obtenerIngresosPorRango } from '../servicios/users.service.jsx';
import { getProfesor } from '../servicios/profesor.service.jsx';
import { getPsicologo } from '../servicios/psicologo.service.jsx';
import { obtenerListaEntrevistaPorRango } from '../servicios/teoriaDeColas.service.jsx';

const Informe = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({ usuarios: 0, profesores: 0, psicologos: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const [usuariosResponse, profesoresResponse, psicologosResponse] = await Promise.all([
          getUsuarios(),
          getProfesor(),
          getPsicologo(),
        ]);

        setStats({
          usuarios: usuariosResponse.data?.length || 0,
          profesores: profesoresResponse.data?.length || 0,
          psicologos: psicologosResponse.data?.length || 0,
        });
      } catch (error) {
        console.error('Error al cargar los totales del informe:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const downloadUsuariosPDF = async () => {
    const response = await getUsuarios();
    const usuarios = response.data;

    const doc = new jsPDF();
    doc.text('Listado de Usuarios Registrados', 14, 10);

    const tableColumn = ['Nombres', 'Apellido Paterno', 'Apellido Materno', 'Rol'];
    const tableRows = usuarios.map((user) => [
      user.nombres,
      user.apellidopaterno,
      user.apellidomaterno,
      user.rol,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('reporte_usuarios.pdf');
  };

  const downloadProfesoresPDF = async () => {
    const response = await getProfesor();
    const profesores = response.data;

    const doc = new jsPDF();
    doc.text('Listado de Profesores Registrados', 14, 10);

    const tableColumn = ['Nombres', 'Apellido Paterno', 'Apellido Materno', 'Correo'];
    const tableRows = profesores.map((profesor) => [
      profesor.nombres,
      profesor.apellidopaterno,
      profesor.apellidomaterno,
      profesor.email,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('reporte_profesores.pdf');
  };

  const downloadPsicologosPDF = async () => {
    const response = await getPsicologo();
    const psicologos = response.data;

    const doc = new jsPDF();
    doc.text('Listado de Psicologos Registrados', 14, 10);

    const tableColumn = ['Nombres', 'Apellido Paterno', 'Apellido Materno', 'Correo'];
    const tableRows = psicologos.map((psicologo) => [
      psicologo.nombres,
      psicologo.apellidopaterno,
      psicologo.apellidomaterno,
      psicologo.email,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('reporte_psicologos.pdf');
  };

  const downloadCitasPDF = async () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona ambas fechas.');
      return;
    }

    try {
      const response = await obtenerListaEntrevistaPorRango({ startDate, endDate });
      const citas = response.data;

      const doc = new jsPDF();
      doc.text(`Padres de Familia Citados del ${startDate} al ${endDate}`, 14, 10);

      const tableColumn = ['Nombres', 'Apellido Paterno', 'Apellido Materno', 'Correo', 'Hora', 'Estado'];
      const tableRows = citas.map((cita) => [
        cita.nombres,
        cita.apellidopaterno,
        cita.apellidomaterno,
        cita.email,
        cita.nuevaHorafinEntrevista,
        cita.estado ? 'Completado' : 'Pendiente',
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save(`citas_${startDate}_a_${endDate}.pdf`);
    } catch (error) {
      console.error('Error al generar el PDF de citas:', error);
    }
  };

  const downloadIngresosPDF = async () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona ambas fechas.');
      return;
    }

    try {
      const response = await obtenerIngresosPorRango({ startDate, endDate });
      const ingresos = response?.data ?? response ?? [];

      const doc = new jsPDF();
      doc.text(`Ingresos de Usuarios al Sistema del ${startDate} al ${endDate}`, 14, 10);

      const tableColumn = ['Nombre Completo', 'Rol', 'Fecha de Ingreso', 'Hora de Ingreso'];
      const tableRows = ingresos.map((ingreso) => [
        ingreso.nombrecompleto || 'Sin registro',
        ingreso.rol || 'Sin registro',
        ingreso.fechaingreso?.split('T')[0] || 'Sin registro',
        ingreso.horaingreso || 'Sin registro',
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save(`ingresos_${startDate}_a_${endDate}.pdf`);
    } catch (error) {
      console.error('Error al generar el PDF de ingresos:', error);
      alert('Hubo un error al generar el reporte. Por favor, intenta nuevamente.');
    }
  };

  const selectedRangeLabel = startDate && endDate ? `${startDate} al ${endDate}` : 'Sin rango activo';

  return (
    <main className="informe-page">
      <section className="informe-hero">
        <div className="informe-hero__copy">
          <span className="informe-hero__eyebrow">Centro de reportes</span>
          <h2>Genera informes clave en segundos</h2>
          <p>
            Descarga resumenes listos para compartir sobre usuarios, docentes, psicologos y actividad en el sistema.
            Define periodos de tiempo y obten los datos en formato PDF al instante.
          </p>
          <div className="informe-hero__meta">
            <span className="informe-hero__chip">
              Reportes disponibles: <strong>5</strong>
            </span>
            <span className="informe-hero__chip">
              Rango seleccionado: <strong>{selectedRangeLabel}</strong>
            </span>
            <span className="informe-hero__chip">
              Estado de datos: <strong>{statsLoading ? 'Actualizando...' : 'Listo'}</strong>
            </span>
          </div>
        </div>

        <div className="informe-hero__stats">
          <article className="informe-hero__stat-card">
            <span className="informe-hero__stat-count">{stats.usuarios}</span>
            <span className="informe-hero__stat-label">Usuarios registrados</span>
          </article>
          <article className="informe-hero__stat-card">
            <span className="informe-hero__stat-count">{stats.profesores}</span>
            <span className="informe-hero__stat-label">Profesores activos</span>
          </article>
          <article className="informe-hero__stat-card">
            <span className="informe-hero__stat-count">{stats.psicologos}</span>
            <span className="informe-hero__stat-label">Psicologos activos</span>
          </article>
        </div>

        
      </section>

      <section className="informe-container">
        <div className="informe-grid">
          <div className="informe-card">
            <img src={imgInforme} alt="Reporte de Usuarios" className="informe-image" />
            <h3 className="informe-titulo">Reporte de Usuarios Registrados</h3>
            <button onClick={downloadUsuariosPDF} className="informe-button">
              Descargar PDF
            </button>
          </div>

          <div className="informe-card">
            <img src={imgProfesores} alt="Reporte de Profesores" className="informe-image" />
            <h3 className="informe-titulo">Reporte de Profesores Registrados</h3>
            <button onClick={downloadProfesoresPDF} className="informe-button">
              Descargar PDF
            </button>
          </div>

          <div className="informe-card">
            <img src={imgActas} alt="Reporte de Psicologos" className="informe-image" />
            <h3 className="informe-titulo">Reporte de Psicologos Registrados</h3>
            <button onClick={downloadPsicologosPDF} className="informe-button">
              Descargar PDF
            </button>
          </div>

          <div className="informe-card">
            <img src={imgActas} alt="Reporte de Citas" className="informe-image" />
            <h3 className="informe-titulo">Reporte de Padres Citados por Rango de Fechas</h3>

            <div className="date-selector">
              <label htmlFor="start-date-citas">Fecha inicial</label>
              <input
                type="date"
                id="start-date-citas"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />

              <label htmlFor="end-date-citas">Fecha final</label>
              <input
                type="date"
                id="end-date-citas"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
            <button onClick={downloadCitasPDF} className="informe-button">
              Descargar PDF
            </button>
          </div>

          <div className="informe-card">
            <img src={imgActas} alt="Reporte de Ingresos" className="informe-image" />
            <h3 className="informe-titulo">Reporte de Ingreso de Usuarios al Sistema por Rango</h3>

            <div className="date-selector">
              <label htmlFor="start-date-ingresos">Fecha inicial</label>
              <input
                type="date"
                id="start-date-ingresos"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />

              <label htmlFor="end-date-ingresos">Fecha final</label>
              <input
                type="date"
                id="end-date-ingresos"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
            <button onClick={downloadIngresosPDF} className="informe-button">
              Descargar PDF
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Informe;


