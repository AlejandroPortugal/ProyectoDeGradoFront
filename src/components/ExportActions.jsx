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
  const exportTitle = title || 'Reporte';

  const sourceData = Array.isArray(data) ? data : [];
  const sourceColumns = Array.isArray(columns) ? columns : [];

  const toLabel = (value) =>
    String(value || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const resolvedColumns =
    sourceColumns.length > 0
      ? sourceColumns
      : Object.keys(sourceData[0] || {}).map((key) => ({ title: toLabel(key), field: key }));

  const resolveCellValue = (item, field) => {
    const value = item?.[field];
    return value === null || value === undefined || value === '' ? 'Sin registro' : String(value);
  };

  const exportToPDF = () => {
    if (!resolvedColumns.length) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setTextColor(17, 94, 71);
    doc.setFontSize(10);
    doc.text(`Fecha: ${exportDate}`, 14, 12);
    doc.setFontSize(13);
    doc.text(exportTitle, 14, 20);

    const tableColumn = resolvedColumns.map((col) => col.title);
    const tableRows = sourceData.map((item) =>
      resolvedColumns.map((col) => resolveCellValue(item, col.field))
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 26,
      margin: { left: 10, right: 10 },
      tableWidth: 'auto',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [22, 101, 52],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244],
      },
      bodyStyles: {
        textColor: [31, 41, 55],
      },
    });

    doc.save(`${context || 'reporte'}.pdf`);
  };

  const exportToExcel = () => {
    if (!resolvedColumns.length) return;

    const worksheetData = sourceData.map((item) => {
      const row = {};
      resolvedColumns.forEach((col) => {
        row[col.title] = resolveCellValue(item, col.field);
      });
      return row;
    });

    const worksheet = xlsx.utils.json_to_sheet(worksheetData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, context || 'Datos');
    xlsx.writeFile(workbook, `${context || 'reporte'}.xlsx`);
  };

  const exportToWord = () => {
    if (!resolvedColumns.length) return;

    let content = `
      <div style="font-family: Arial, sans-serif; color: #14532d;">
      <h3 style="margin: 0 0 6px 0;">Fecha: ${exportDate}</h3>
      <h2 style="margin: 0 0 12px 0;">${exportTitle}</h2>
      <table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 11px;">
        <tr>
          ${resolvedColumns
            .map(
              (col) =>
                `<th style="background:#166534;color:#fff;text-align:left;">${col.title}</th>`
            )
            .join('')}
        </tr>
    `;

    sourceData.forEach((item) => {
      content += `
        <tr>
          ${resolvedColumns.map((col) => `<td>${resolveCellValue(item, col.field)}</td>`).join('')}
        </tr>
      `;
    });

    content += '</table></div>';

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
