import React, { useEffect, useState } from 'react';
import './Informe.css';
import imgInforme from '../../../recursos/image/Informe.jpg';
import imgActas from '../../../recursos/image/Actas.jpg';
import imgProfesores from '../../../recursos/image/Profesores.png';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoadingScreen from '../../../components/LoadingScreen.jsx';
import { getUsuarios, obtenerIngresosPorRango } from '../../users/services/users.service.jsx';
import { getProfesor } from '../../profesores/services/profesor.service.jsx';
import { getPsicologo } from '../../psicologos/services/psicologo.service.jsx';
import { obtenerListaEntrevistaPorRango } from '../../entrevistas/services/teoriaDeColas.service.jsx';

const getPublicBase = () => {
  if (typeof document === 'undefined') return '/';
  const baseHref = document.querySelector('base')?.getAttribute('href');
  if (!baseHref) return '/';
  return baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
};

const ESCUDO_URL = `${getPublicBase()}Imgs/webp/Escudo%20.webp`;
const TABLE_HEADER_GREEN = [20, 120, 60];

const Informe = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({ usuarios: 0, profesores: 0, psicologos: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState('Generando informe...');

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

  const loadImageAsPngDataUrl = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = src;
    });

  const drawReportHeader = async (doc, { title, description, dateRange }) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 14;
    const top = 14;
    const logoSize = 22;
    const textStartX = marginX + logoSize + 8;
    let currentY = top;

    try {
      const logoDataUrl = await loadImageAsPngDataUrl(ESCUDO_URL);
      doc.addImage(logoDataUrl, 'PNG', marginX, top - 1, logoSize, logoSize);
    } catch (error) {
      console.warn('No se pudo cargar el escudo para el informe:', error);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(title, textStartX, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const maxTextWidth = pageWidth - marginX - textStartX;
    const descriptionLines = doc.splitTextToSize(description, maxTextWidth);
    currentY += 12;
    doc.text(descriptionLines, textStartX, currentY);
    currentY += descriptionLines.length * 5;

    if (dateRange) {
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text(`Periodo: ${dateRange}`, textStartX, currentY + 1);
      doc.setTextColor(0);
      currentY += 6;
    }

    doc.setDrawColor(...TABLE_HEADER_GREEN);
    doc.setLineWidth(0.6);
    doc.line(marginX, currentY + 2, pageWidth - marginX, currentY + 2);

    return currentY + 8;
  };

  const buildTableOptions = (startY) => ({
    startY,
    headStyles: {
      fillColor: TABLE_HEADER_GREEN,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
  });

  const startLoading = (message) => {
    setLoadingText(message);
    setIsGenerating(true);
  };

  const stopLoading = () => {
    setIsGenerating(false);
  };

  const downloadUsuariosPDF = async () => {
    try {
      startLoading('Generando informe de usuarios...');
      const response = await getUsuarios();
      const usuarios = response.data;

      const doc = new jsPDF();
      const startY = await drawReportHeader(doc, {
        title: 'Informe de Usuarios Registrados',
        description:
          'Este informe presenta el listado oficial de usuarios registrados en el sistema, con su identificacion basica y rol asignado para fines de control administrativo.',
      });

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
        ...buildTableOptions(startY),
      });

      doc.save('reporte_usuarios.pdf');
    } catch (error) {
      console.error('Error al generar el PDF de usuarios:', error);
      alert('Hubo un error al generar el reporte de usuarios.');
    } finally {
      stopLoading();
    }
  };

  const downloadProfesoresPDF = async () => {
    try {
      startLoading('Generando informe de profesores...');
      const response = await getProfesor();
      const profesores = response.data;

      const doc = new jsPDF();
      const startY = await drawReportHeader(doc, {
        title: 'Informe de Profesores Registrados',
        description:
          'Relacion formal de docentes registrados y activos, con sus datos de identificacion y contacto institucional.',
      });

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
        ...buildTableOptions(startY),
      });

      doc.save('reporte_profesores.pdf');
    } catch (error) {
      console.error('Error al generar el PDF de profesores:', error);
      alert('Hubo un error al generar el reporte de profesores.');
    } finally {
      stopLoading();
    }
  };

  const downloadPsicologosPDF = async () => {
    try {
      startLoading('Generando informe de psicologos...');
      const response = await getPsicologo();
      const psicologos = response.data;

      const doc = new jsPDF();
      const startY = await drawReportHeader(doc, {
        title: 'Informe de Psicologos Registrados',
        description:
          'Registro oficial de psicologos asociados al centro educativo, con sus datos de identificacion y contacto.',
      });

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
        ...buildTableOptions(startY),
      });

      doc.save('reporte_psicologos.pdf');
    } catch (error) {
      console.error('Error al generar el PDF de psicologos:', error);
      alert('Hubo un error al generar el reporte de psicologos.');
    } finally {
      stopLoading();
    }
  };

  const downloadCitasPDF = async () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona ambas fechas.');
      return;
    }

    try {
      startLoading('Generando informe de padres citados...');
      const response = await obtenerListaEntrevistaPorRango({ startDate, endDate });
      const citas = response.data;

      const doc = new jsPDF();
      const startY = await drawReportHeader(doc, {
        title: 'Informe de Padres de Familia Citados',
        description:
          'Consolidado de padres de familia citados dentro del rango indicado, incluyendo estudiante, contacto, hora estimada y estado de la entrevista.',
        dateRange: `${startDate} al ${endDate}`,
      });

      const tableColumn = ['Nombres', 'Apellido Paterno', 'Apellido Materno', 'Estudiante', 'Correo', 'Hora', 'Estado'];
      const tableRows = citas.map((cita) => [
        cita.nombres,
        cita.apellidopaterno,
        cita.apellidomaterno,
        cita.estudiante || 'Sin registro',
        cita.email,
        cita.nuevaHorafinEntrevista || cita.horafinentrevista || 'Sin registro',
        cita.estado_nombre ||
          (Number(cita.idestado) === 2
            ? 'Completado'
            : Number(cita.idestado) === 3
            ? 'Cancelado'
            : 'Pendiente'),
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        ...buildTableOptions(startY),
      });

      doc.save(`citas_${startDate}_a_${endDate}.pdf`);
    } catch (error) {
      console.error('Error al generar el PDF de citas:', error);
    } finally {
      stopLoading();
    }
  };

  const downloadIngresosPDF = async () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona ambas fechas.');
      return;
    }

    try {
      startLoading('Generando informe de ingresos al sistema...');
      const response = await obtenerIngresosPorRango({ startDate, endDate });
      const ingresos = response?.data ?? response ?? [];

      const doc = new jsPDF();
      const startY = await drawReportHeader(doc, {
        title: 'Informe de Ingresos al Sistema',
        description:
          'Detalle de ingresos al sistema durante el periodo seleccionado, para auditoria y trazabilidad de accesos.',
        dateRange: `${startDate} al ${endDate}`,
      });

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
        ...buildTableOptions(startY),
      });

      doc.save(`ingresos_${startDate}_a_${endDate}.pdf`);
    } catch (error) {
      console.error('Error al generar el PDF de ingresos:', error);
      alert('Hubo un error al generar el reporte. Por favor, intenta nuevamente.');
    } finally {
      stopLoading();
    }
  };

  const selectedRangeLabel = startDate && endDate ? `${startDate} al ${endDate}` : 'Sin rango activo';

  return (
    <main className="informe-page">
      <LoadingScreen open={isGenerating} title="Procesando informe" message={loadingText} />
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


