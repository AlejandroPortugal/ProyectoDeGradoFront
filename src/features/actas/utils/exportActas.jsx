import { jsPDF } from 'jspdf';

const exportActas = (acta, estudiante) => {
  if (!acta || !estudiante) {
    console.error('Acta o Estudiante no proporcionado.');
    return;
  }

  const doc = new jsPDF({ format: 'letter', unit: 'mm' });

  // Margen y ancho de la página
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14; // Margen izquierdo y derecho
  const textWidth = pageWidth - margin * 2;
  const lineHeight = 6;
  const spaceWidth = doc.getTextWidth(' ');

  const drawJustifiedParagraph = (text, x, y, maxWidth, rowHeight) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line, index) => {
      const lineY = y + index * rowHeight;
      const isLastLine = index === lines.length - 1;
      const trimmed = line.trim();
      if (isLastLine || !trimmed.includes(' ')) {
        doc.text(trimmed, x, lineY);
        return;
      }

      const words = trimmed.split(/\s+/);
      const gaps = words.length - 1;
      if (gaps <= 0) {
        doc.text(trimmed, x, lineY);
        return;
      }

      const wordsWidth = words.reduce((total, word) => total + doc.getTextWidth(word), 0);
      const baseLineWidth = wordsWidth + spaceWidth * gaps;
      const extraSpace = Math.max(0, maxWidth - baseLineWidth);
      const extraPerGap = extraSpace / gaps;
      let cursorX = x;

      words.forEach((word, wordIndex) => {
        doc.text(word, cursorX, lineY);
        cursorX += doc.getTextWidth(word);
        if (wordIndex < gaps) {
          cursorX += spaceWidth + extraPerGap;
        }
      });
    });

    return y + lines.length * rowHeight;
  };

  const fechaBase =
    acta.fecha ||
    acta.fechaEntrevista ||
    acta.fecha_entrevista ||
    acta.fechadecreacion ||
    acta.acta_fechadecreacion ||
    '';
  const normalizeDateString = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split('-');
      return `${year}-${month}-${day}`;
    }
    return trimmed;
  };
  const fechaNormalizadaRaw = normalizeDateString(fechaBase);
  const fechaNormalizada =
    typeof fechaNormalizadaRaw === 'string' && fechaNormalizadaRaw.length <= 10
      ? `${fechaNormalizadaRaw}T12:00:00`
      : fechaNormalizadaRaw;
  const fechaCarta = (() => {
    if (!fechaNormalizada) return '';
    const parsed = new Date(fechaNormalizada);
    if (Number.isNaN(parsed.getTime())) return String(fechaBase);
    return parsed.toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  })();

  const dateY = margin;
  const headerY = dateY + lineHeight * 3;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTO DE EDUCACIÓN BANCARIA', margin, headerY);
  doc.setFont('helvetica', 'normal');
  doc.text('Presente.-', margin, headerY + lineHeight);

  doc.setFontSize(10);
  if (fechaCarta) {
    doc.text(`La Paz, ${fechaCarta}`, pageWidth - margin, dateY, { align: 'right' });
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const deMiY = headerY + lineHeight * 4;
  doc.text('De mi consideración:', margin, deMiY);

  const motivoRef = (acta.motivo || '').toString().trim();
  const refText = motivoRef
    ? `REF. ACTA DE REUNIÓN POR MOTIVO ${motivoRef}`
    : 'REF. ACTA DE REUNIÓN';
  const refY = deMiY + lineHeight;
  doc.setFont('helvetica', 'bold');
  const refLines = doc.splitTextToSize(refText.toUpperCase(), textWidth);
  doc.text(refLines, pageWidth - margin, refY, { align: 'right' });
  doc.setLineWidth(0.3);
  refLines.forEach((line, index) => {
    const lineWidth = doc.getTextWidth(line);
    const lineY = refY + index * lineHeight;
    const lineStartX = pageWidth - margin - lineWidth;
    const lineEndX = pageWidth - margin;
    doc.line(lineStartX, lineY + 1.2, lineEndX, lineY + 1.2);
  });
  const afterRefY = refY + refLines.length * lineHeight;

  doc.setFont('helvetica', 'normal');
  const introY = afterRefY + lineHeight;

  const introduction = 'En atención a lo anteriormente expuesto, y con el objetivo de sustentar los acuerdos establecidos con el padre de familia, el docente responsable deja constancia a continuación de los antecedentes, observaciones y situación identificada que motivan la presente acta, detallando los aspectos relevantes para su debido seguimiento y cumplimiento.';
  const introEndY = drawJustifiedParagraph(introduction, margin, introY, textWidth, lineHeight);
  let cursorY = introEndY + lineHeight;

  const estudianteNombre = [
    estudiante.nombres,
    estudiante.apellidopaterno,
    estudiante.apellidomaterno,
  ]
    .filter(Boolean)
    .join(' ');
  doc.text(`Nombre del Estudiante: ${estudianteNombre}`, margin, cursorY);
  cursorY += lineHeight;
  doc.text(`Materia: ${acta.materia || ''}`, margin, cursorY);
  cursorY += lineHeight;
  doc.text(`Motivo de la acta: ${acta.motivo || ''}`, margin, cursorY);
  cursorY += lineHeight;

  const description = `Descripción: ${acta.descripcion || ''}`;
  const descriptionLines = doc.splitTextToSize(description, textWidth);
  doc.text(descriptionLines, margin, cursorY);
  cursorY += descriptionLines.length * lineHeight + lineHeight * 6;

  const padreNombre =
    acta.padre_nombre ||
    acta.padreNombre ||
    acta.nombrepadre ||
    acta.padre ||
    '';
  const docenteNombre =
    acta.docente_nombre ||
    acta.docenteNombre ||
    acta.profesor ||
    acta.profesional ||
    '';
  const leftCenter = pageWidth * 0.25;
  const rightCenter = pageWidth * 0.75;
  let firmaY = cursorY;
  const signatureBlockHeight = lineHeight * 4;
  if (firmaY + signatureBlockHeight > pageHeight - margin) {
    doc.addPage();
    firmaY = margin + lineHeight;
  }
  const nombreY = firmaY + lineHeight;
  const ciY = firmaY + lineHeight * 3;
  const columnWidth = pageWidth / 2 - margin * 2;

  // Espacio para firmas
  doc.text('FIRMA PROFESOR:', leftCenter, firmaY, { align: 'center' });
  if (docenteNombre) {
    const docenteLines = doc.splitTextToSize(docenteNombre, columnWidth);
    doc.text(docenteLines, leftCenter, nombreY, { align: 'center' });
  }
  doc.text('CI:', leftCenter, ciY, { align: 'center' });
  doc.text('FIRMA PADRE DE FAMILIA:', rightCenter, firmaY, { align: 'center' });
  if (padreNombre) {
    const padreLines = doc.splitTextToSize(padreNombre, columnWidth);
    doc.text(padreLines, rightCenter, nombreY, { align: 'center' });
  }
  doc.text('CI:', rightCenter, ciY, { align: 'center' });

  // Guardar el archivo PDF
  doc.save(`Acta_${estudiante.nombres}_${estudiante.apellidopaterno}.pdf`);
};

export default exportActas;
