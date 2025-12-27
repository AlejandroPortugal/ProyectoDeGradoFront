import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';
import './ExportActions.css';

import excelIcon from '../recursos/icons/excel.svg';
import pdfIcon from '../recursos/icons/pdf.svg';
import wordIcon from '../recursos/icons/word.svg';
import printIcon from '../recursos/icons/Printer.svg';

const ExportActions = ({ data, context, selectedDate, title, columns }) => {
  const exportDate = selectedDate || new Date().toLocaleDateString();

  // Generar el título automáticamente si no se proporciona
  const exportTitle = title || 'Reporte';

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Fecha: ${exportDate}`, 14, 10);
    doc.text(exportTitle, 14, 20);

    // Generar columnas y filas dinámicamente según la configuración
    const tableColumn = columns.map((col) => col.title);
    const tableRows = data.map((item) =>
      columns.map((col) => item[col.field] || 'Sin registro')
    );

    // Generar la tabla en el PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    // Guardar el archivo PDF
    doc.save(`${context || 'reporte'}.pdf`);
  };

  const exportToExcel = () => {
    const worksheetData = data.map((item) => {
      const row = {};
      columns.forEach((col) => {
        row[col.title] = item[col.field] || 'Sin registro';
      });
      return row;
    });

    const worksheet = xlsx.utils.json_to_sheet(worksheetData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, context || 'Datos');
    xlsx.writeFile(workbook, `${context || 'reporte'}.xlsx`);
  };

  const exportToWord = () => {
    let content = `
      <h2>Fecha: ${exportDate}</h2>
      <h2>${exportTitle}</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          ${columns.map((col) => `<th>${col.title}</th>`).join('')}
        </tr>
    `;

    data.forEach((item) => {
      content += `
        <tr>
          ${columns
            .map((col) => `<td>${item[col.field] || 'Sin registro'}</td>`)
            .join('')}
        </tr>
      `;
    });

    content += '</table>';

    const blob = new Blob(['\ufeff', content], {
      type: 'application/msword',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${context || 'reporte'}.doc`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="export-actions-container">
      <img src={pdfIcon} alt="Export to PDF" onClick={exportToPDF} />
      <img src={excelIcon} alt="Export to Excel" onClick={exportToExcel} />
      <img src={wordIcon} alt="Export to Word" onClick={exportToWord} />
      <img src={printIcon} alt="Print" onClick={handlePrint} />
    </div>
  );
};

export default ExportActions;
