import React, { useMemo, useState } from "react";
import "./TablaPaginada.css";

const TablaPaginada = ({
  data = [],
  columns = [],
  rowsPerPageOptions = [5, 10, 25, 50],
  initialRowsPerPage = 10,
  title,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const totalPages = Math.max(Math.ceil(data.length / rowsPerPage), 1);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page, rowsPerPage]);

  const handlePageChange = (direction) => {
    setPage((prev) => {
      if (direction === "prev") return Math.max(prev - 1, 0);
      if (direction === "next") return Math.min(prev + 1, totalPages - 1);
      return prev;
    });
  };

  const handleRowsPerPageChange = (event) => {
    const value = Number(event.target.value);
    setRowsPerPage(value);
    setPage(0);
  };

  return (
    <div className="tabla-paginada">
      {title && <div className="tabla-paginada__title">{title}</div>}
      <div className="tabla-paginada__wrapper">
        <table className="tabla-paginada__table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="tabla-paginada__empty">
                  No hay registros para mostrar.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {typeof col.render === "function"
                        ? col.render(row)
                        : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="tabla-paginada__footer">
        <div className="tabla-paginada__rows">
          <label htmlFor="rows-per-page">Filas por página</label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            {rowsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="tabla-paginada__pager">
          <button
            type="button"
            onClick={() => handlePageChange("prev")}
            disabled={page === 0}
          >
            ‹
          </button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange("next")}
            disabled={page + 1 >= totalPages}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablaPaginada;
