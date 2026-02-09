import React, { useEffect, useState } from "react";
import { postPadre } from "../../../padres/services/PadreDeFamilia.jsx";
import { getDirecciones, createDireccion } from "../../../direccion/services/direccion.service.jsx";
import Toast from "../../../../components/Toast.jsx";
import "./FormularioCreacion.css";

const normalizeList = (res) => {
  const d = res?.data ?? res;
  return Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
};

const dateLimitsByRol = () => {
  const today = new Date();
  const max = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return { max: max.toISOString().split("T")[0] };
};

const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ≥6 chars, 1 mayúscula, 1 número, 1 carácter especial
const passPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

export default function FormularioCreacionPd() {
  const [dirs, setDirs] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [direccionQuery, setDireccionQuery] = useState("");

  // modal "Agregar nueva dirección"
  const [addDirOpen, setAddDirOpen] = useState(false);
  const [newDir, setNewDir] = useState({ zona: "", calle: "", num_puerta: "" });

  // ver/ocultar contraseña
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    idDireccion: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    email: "",
    numCelular: "",
    fechaDeNacimiento: "",
    contrasenia: "",
  });

  const [errors, setErrors] = useState({});
  const limits = dateLimitsByRol();
  const ADD_DIR_LABEL = "+ Agregar nueva direccion...";

  const buildDirLabel = (d) =>
    `${d?.zona ?? ""} - ${d?.calle ?? ""} - ${d?.num_puerta ?? ""}`.trim();

  useEffect(() => {
    (async () => {
      try {
        const res = await getDirecciones();
        setDirs(normalizeList(res) || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Cierre del modal al seleccionar una dirección válida
  useEffect(() => { if (form.idDireccion) setAddDirOpen(false); }, [form.idDireccion]);

  // Cierre del modal con tecla ESC
  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") setAddDirOpen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const setField = (name, value) => setForm((s) => ({ ...s, [name]: value }));

  const onChange = (e) => {
    const { name, value } = e.target;

    // celular: solo dígitos y tope 8 inmediatamente
    if (name === "numCelular") {
      const digits = value.replace(/\D/g, "").slice(0, 8);
      setField("numCelular", digits);
      return;
    }

    setField(name, value);
  };

  const onDireccionChange = (e) => {
    const value = e.target.value;
    if (value === "__new__") {
      setAddDirOpen(true);
      setField("idDireccion", "");
      return;
    }
    setField("idDireccion", value);
  };

  const dirQuery = direccionQuery.trim().toLowerCase();
  const filteredDirs = dirQuery
    ? dirs.filter((d) => buildDirLabel(d).toLowerCase().includes(dirQuery))
    : dirs;
  const selectedDir = dirs.find((d) => String(d.iddireccion) === String(form.idDireccion));
  const visibleDirs =
    selectedDir && !filteredDirs.some((d) => String(d.iddireccion) === String(selectedDir.iddireccion))
      ? [selectedDir, ...filteredDirs]
      : filteredDirs;

  const trimAll = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));

  const validate = () => {
    const v = trimAll(form);
    const errs = {};

    // requeridos
    if (!v.idDireccion) errs.idDireccion = "Selecciona una dirección.";
    if (!v.nombres) errs.nombres = "Nombres es obligatorio.";
    if (!v.apellidoPaterno) errs.apellidoPaterno = "Apellido paterno es obligatorio.";
    if (!v.apellidoMaterno) errs.apellidoMaterno = "Apellido materno es obligatorio.";
    if (!v.email) errs.email = "Email es obligatorio.";
    if (!v.numCelular) errs.numCelular = "Celular es obligatorio.";
    if (!v.fechaDeNacimiento) errs.fechaDeNacimiento = "Fecha de nacimiento es obligatoria.";
    if (!v.contrasenia) errs.contrasenia = "Contraseña es obligatoria.";

    // patrones de texto
    if (v.nombres && !namePattern.test(v.nombres)) errs.nombres = "Solo letras y espacios.";
    if (v.apellidoPaterno && !namePattern.test(v.apellidoPaterno)) errs.apellidoPaterno = "Solo letras y espacios.";
    if (v.apellidoMaterno && !namePattern.test(v.apellidoMaterno)) errs.apellidoMaterno = "Solo letras y espacios.";

    // email válido
    if (v.email && !emailPattern.test(v.email)) errs.email = "Email no válido.";

    // celular exactamente 8 dígitos
    if (v.numCelular && !/^\d{8}$/.test(v.numCelular)) errs.numCelular = "Debe tener exactamente 8 dígitos.";

    // fecha válida y ≤ max (18+)
    if (v.fechaDeNacimiento) {
      const ymd = v.fechaDeNacimiento;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        errs.fechaDeNacimiento = "Fecha inválida (YYYY-MM-DD).";
      } else if (new Date(ymd) > new Date(limits.max)) {
        errs.fechaDeNacimiento = `Debe ser el ${limits.max} o anterior.`;
      }
    }

    // contraseña fuerte
    if (v.contrasenia && !passPattern.test(v.contrasenia)) {
      errs.contrasenia = "Mín. 6, 1 mayúscula, 1 número y 1 carácter especial.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setToast({ show: true, message: "Revisa los campos marcados.", type: "error" });
      return;
    }

    try {
      const v = trimAll(form);
      // normaliza fecha a YYYY-MM-DD (ya viene así desde <input type="date" />)
      const payload = {
        ...v,
        estado: true,
        rol: "Padre de Familia",
      };

      await postPadre(payload);
      setToast({ show: true, message: "Padre de Familia creado con éxito", type: "success" });
      setForm({
        idDireccion: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        email: "",
        numCelular: "",
        fechaDeNacimiento: "",
        contrasenia: "",
      });
      setDireccionQuery("");
      setErrors({});
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Error al crear padre de familia";
      setToast({ show: true, message: msg, type: "error" });
    }
  };

  // Crear nueva dirección (maneja duplicado 409)
  const createNewDireccion = async (e) => {
    e.preventDefault();
    try {
      const zona = newDir.zona.trim();
      const calle = newDir.calle.trim();
      const num_puerta = newDir.num_puerta.trim();
      if (!zona || !calle || !num_puerta) {
        setToast({ show: true, message: "Todos los campos de dirección son obligatorios.", type: "error" });
        return;
      }

      const res = await createDireccion({ zona, calle, num_puerta });
      const dir = res.data ?? res;
      const id = dir.iddireccion ?? dir?.data?.iddireccion;
      const _zona = dir.zona ?? dir?.data?.zona;
      const _calle = dir.calle ?? dir?.data?.calle;
      const _num = dir.num_puerta ?? dir?.data?.num_puerta;

      setDirs((prev) => [{ iddireccion: id, zona: _zona, calle: _calle, num_puerta: _num }, ...prev]);
      setForm((s) => ({ ...s, idDireccion: id }));
      setAddDirOpen(false);
      setNewDir({ zona: "", calle: "", num_puerta: "" });
      setToast({ show: true, message: "Dirección agregada", type: "success" });
    } catch (err) {
      if (err?.response?.status === 409) {
        const id = err.response.data?.idDireccion;
        const row = err.response.data?.direccion;
        if (id) {
          setDirs((prev) => {
            const exists = prev.some((d) => d.iddireccion === id);
            return exists ? prev : [{ iddireccion: id, zona: row?.zona, calle: row?.calle, num_puerta: row?.num_puerta }, ...prev];
          });
          setForm((s) => ({ ...s, idDireccion: id }));
          setAddDirOpen(false);
          setToast({ show: true, message: "La dirección ya existía; la seleccioné.", type: "success" });
          return;
        }
      }
      const msg = err?.response?.data?.error || err.message || "Error al crear dirección";
      setToast({ show: true, message: msg, type: "error" });
    }
  };

  return (
    <>
      <form onSubmit={submit} className="grid">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "" })}
          />
        )}

        {/* Dirección */}
        <div className="fg span-6">
          <label>Dirección</label>
          <input
            type="text"
            placeholder="Buscar direccion..."
            value={direccionQuery}
            onChange={(e) => setDireccionQuery(e.target.value)}
            autoComplete="off"
          />
          <select
            name="idDireccion"
            value={form.idDireccion}
            onChange={onDireccionChange}
            required
            aria-invalid={!!errors.idDireccion}
          >
            <option value="">Selecciona una direccion</option>
            <option value="__new__">{ADD_DIR_LABEL}</option>
            {visibleDirs.map((d) => (
              <option key={d.iddireccion} value={d.iddireccion}>
                {buildDirLabel(d)}
              </option>
            ))}
          </select>
          {errors.idDireccion && <div className="error">{errors.idDireccion}</div>}
        </div>

        {/* Nombres y apellidos */}
        <div className="fg span-6">
          <label>Nombres</label>
          <input
            placeholder="Ingrese sus Nombres"
            name="nombres"
            value={form.nombres}
            onChange={onChange}
            required
            maxLength={100}
            pattern={namePattern.source}
            title="Solo letras y espacios"
            aria-invalid={!!errors.nombres}
          />
          {errors.nombres && <div className="error">{errors.nombres}</div>}
        </div>

        <div className="fg span-6">
          <label>Apellido Paterno</label>
          <input
            placeholder="Ingrese su Apellido Paterno"
            name="apellidoPaterno"
            value={form.apellidoPaterno}
            onChange={onChange}
            required
            maxLength={100}
            pattern={namePattern.source}
            title="Solo letras y espacios"
            aria-invalid={!!errors.apellidoPaterno}
          />
          {errors.apellidoPaterno && <div className="error">{errors.apellidoPaterno}</div>}
        </div>

        <div className="fg span-6">
          <label>Apellido Materno</label>
          <input
            placeholder="Ingrese su Apellido Materno"
            name="apellidoMaterno"
            value={form.apellidoMaterno}
            onChange={onChange}
            required
            maxLength={100}
            pattern={namePattern.source}
            title="Solo letras y espacios"
            aria-invalid={!!errors.apellidoMaterno}
          />
          {errors.apellidoMaterno && <div className="error">{errors.apellidoMaterno}</div>}
        </div>

        {/* Fecha */}
        <div className="fg span-6">
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            name="fechaDeNacimiento"
            value={form.fechaDeNacimiento}
            onChange={onChange}
            required
            max={limits.max}
            aria-invalid={!!errors.fechaDeNacimiento}
          />
          {errors.fechaDeNacimiento && <div className="error">{errors.fechaDeNacimiento}</div>}
        </div>

        {/* Email / Celular */}
        <div className="fg span-6">
          <label>Email</label>
          <input
            placeholder="Ingrese su Email"
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            maxLength={100}
            pattern={emailPattern.source}
            title="Ingresa un correo válido"
            aria-invalid={!!errors.email}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        <div className="fg span-6">
          <label>Celular</label>
          <input
            placeholder="8 dígitos"
            name="numCelular"
            value={form.numCelular}
            onChange={onChange}
            onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8); }}
            required
            inputMode="numeric"
            maxLength={8}
            pattern="\d{8}"
            title="Exactamente 8 dígitos"
            aria-invalid={!!errors.numCelular}
          />
          {errors.numCelular && <div className="error">{errors.numCelular}</div>}
        </div>

        {/* Contraseña con ojo */}
        <div className="fg span-6">
          <label>Contraseña</label>
          <div className="password-field" style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              name="contrasenia"
              value={form.contrasenia}
              onChange={onChange}
              required
              minLength={6}
              maxLength={255}
              style={{ paddingRight: 44 }}
              pattern={passPattern.source}
              title="Mín. 6, 1 mayúscula, 1 número y 1 carácter especial"
              aria-invalid={!!errors.contrasenia}
            />
            <button
              type="button"
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPass((v) => !v)}
              className="icon-btn"
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                border: 0,
                background: "transparent",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <span className="material-symbols-rounded" style={{ color: "black" }}>
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.contrasenia && <div className="error">{errors.contrasenia}</div>}
        </div>

        <div className="actions span-12">
          <button className="btn btn-primary" type="submit">Crear Padre</button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setForm({
                idDireccion: "", nombres: "", apellidoPaterno: "", apellidoMaterno: "",
                email: "", numCelular: "", fechaDeNacimiento: "", contrasenia: "",
              });
              setDireccionQuery("");
              setErrors({});
            }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Modal para crear nueva dirección */}
      {addDirOpen && (
        <div
          className="dialog-container active"
          onClick={(e) => {
            if (e.target.classList.contains("dialog-container")) setAddDirOpen(false);
          }}
        >
          <div className="dialog-box" style={{ maxWidth: 520, position: "relative" }}>
            {/* Botón X (cerrar) */}
            <button
              type="button"
              className="icon-btn"
              onClick={() => setAddDirOpen(false)}
              aria-label="Cerrar"
              style={{ position: "absolute", right: 8, top: 8, border: 0, background: "transparent", cursor: "pointer" }}
            >
              <span className="material-symbols-rounded">close</span>
            </button>

            <h3 style={{ marginTop: 0 }}>Nueva dirección</h3>
            <form onSubmit={createNewDireccion} className="grid">
              <div className="fg span-12">
                <label>Zona</label>
                <input value={newDir.zona} onChange={(e) => setNewDir((s) => ({ ...s, zona: e.target.value }))} required maxLength={100} />
              </div>
              <div className="fg span-12">
                <label>Calle</label>
                <input value={newDir.calle} onChange={(e) => setNewDir((s) => ({ ...s, calle: e.target.value }))} required maxLength={100} />
              </div>
              <div className="fg span-12">
                <label>Número de puerta</label>
                <input value={newDir.num_puerta} onChange={(e) => setNewDir((s) => ({ ...s, num_puerta: e.target.value }))} required maxLength={10} />
              </div>
              <div className="actions span-12">
                <button className="btn btn-primary" type="submit">Guardar</button>
                <button className="btn btn-secondary" type="button" onClick={() => setAddDirOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

