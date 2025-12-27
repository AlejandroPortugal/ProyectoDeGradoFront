import React, { useEffect, useState } from "react";
import { postAdministrador } from "../../servicios/administrador.service.jsx";
import { getDirecciones, createDireccion } from "../../servicios/direccion.service.jsx";
import Toast from "../Toast.jsx";
import "./FormularioCreacion.css";

const dateLimitsByRol = (rol) => {
  const today = new Date();
  if (["Administrador","Profesor","Psicologo"].includes(rol)) return { max:"2005-12-31" };
  if (rol === "Padre de Familia"){ 
    const m=new Date(today.getFullYear()-18,today.getMonth(),today.getDate()); 
    return { max:m.toISOString().split("T")[0] }; 
  }
  if (rol === "Estudiante"){ 
    const mi=new Date(today.getFullYear()-19,today.getMonth(),today.getDate()); 
    const ma=new Date(today.getFullYear()-11,today.getMonth(),today.getDate()); 
    return { min:mi.toISOString().split("T")[0], max:ma.toISOString().split("T")[0] }; 
  }
  return {};
};

const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Reglas: al menos 1 mayúscula, 1 número, 1 caracter especial, mínimo 6 chars
const passwordPatternStr = "(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s]).{6,}";

export default function FormularioCreacionAd(){
  const [dirs, setDirs] = useState([]);
  const [toast, setToast] = useState({show:false,message:"",type:""});

  // modal "Agregar nueva dirección"
  const [addDirOpen, setAddDirOpen] = useState(false);
  const [newDir, setNewDir] = useState({ zona: "", calle: "", num_puerta: "" });

  const [form, setForm] = useState({
    idDireccion:"",
    nombres:"",
    apellidoPaterno:"",
    apellidoMaterno:"",
    email:"",
    numCelular:"",
    fechaDeNacimiento:"",
    contrasenia:"",
  });

  // ojo contraseña
  const [showPass, setShowPass] = useState(false);

  // Helpers de UI para mostrar mensajes por campo
  const [errors, setErrors] = useState({});

  useEffect(()=>{ 
    (async()=>{
      try{ 
        const res = await getDirecciones();
        const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : (res?.data?.data || []));
        setDirs(data || []);
      }catch(e){ 
        console.error(e);
      }
    })(); 
  },[]);

  // cerrar modal si se selecciona una dirección válida
  useEffect(() => {
    if (form.idDireccion) setAddDirOpen(false);
  }, [form.idDireccion]);

  // cerrar modal con tecla ESC
  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") setAddDirOpen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const limits = dateLimitsByRol("Administrador");

  const setField = (name, value) => {
    setForm(s => ({ ...s, [name]: value }));
  };

  const onChange = (e)=>{
    const {name,value}=e.target;

    if (name === "idDireccion") {
      if (value === "__new__") {
        setAddDirOpen(true);
        setField("idDireccion", ""); // evita dejar "__new__"
        return;
      } else {
        setAddDirOpen(false);
      }
    }

    // En celular, permitimos solo dígitos y tope 8 EN EL ACTO
    if (name === "numCelular") {
      const digits = value.replace(/\D/g, "").slice(0,8);
      setField(name, digits);
      return;
    }

    setField(name, value);
  };

  const trimAll = (obj) => Object.fromEntries(
    Object.entries(obj).map(([k,v]) => [k, typeof v === "string" ? v.trim() : v])
  );

  const validate = () => {
    const v = trimAll(form);
    const errs = {};

    if (!v.idDireccion) errs.idDireccion = "Selecciona una dirección.";
    if (!v.nombres) errs.nombres = "Nombres es obligatorio.";
    if (!v.apellidoPaterno) errs.apellidoPaterno = "Apellido paterno es obligatorio.";
    if (!v.apellidoMaterno) errs.apellidoMaterno = "Apellido materno es obligatorio.";
    if (!v.email) errs.email = "Email es obligatorio.";
    if (!v.numCelular) errs.numCelular = "Celular es obligatorio.";
    if (!v.fechaDeNacimiento) errs.fechaDeNacimiento = "Fecha de nacimiento es obligatoria.";
    if (!v.contrasenia) errs.contrasenia = "Contraseña es obligatoria.";

    if (v.nombres && !namePattern.test(v.nombres)) errs.nombres = "Solo letras y espacios.";
    if (v.apellidoPaterno && !namePattern.test(v.apellidoPaterno)) errs.apellidoPaterno = "Solo letras y espacios.";
    if (v.apellidoMaterno && !namePattern.test(v.apellidoMaterno)) errs.apellidoMaterno = "Solo letras y espacios.";

    if (v.email && !emailPattern.test(v.email)) errs.email = "Email no válido.";

    if (v.numCelular && !/^\d{8}$/.test(v.numCelular)) errs.numCelular = "Debe tener exactamente 8 dígitos.";

    // Límite de fecha (tabla exige < 2006-01-01)
    if (v.fechaDeNacimiento) {
      const ymd = v.fechaDeNacimiento; // input date ya trae YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        errs.fechaDeNacimiento = "Fecha inválida (YYYY-MM-DD).";
      } else if (new Date(ymd) >= new Date("2006-01-01")) {
        errs.fechaDeNacimiento = "Debe ser anterior a 2006-01-01.";
      }
    }

    // Contraseña: al menos 1 mayúscula, 1 número y 1 carácter especial; mínimo 6 chars
    if (v.contrasenia) {
      const hasUpper = /[A-Z]/.test(v.contrasenia);
      const hasDigit = /\d/.test(v.contrasenia);
      const hasSpecial = /[^A-Za-z0-9\s]/.test(v.contrasenia);
      if (v.contrasenia.length < 6 || !hasUpper || !hasDigit || !hasSpecial) {
        errs.contrasenia = "Mín. 6 caracteres, e incluye al menos 1 mayúscula, 1 número y 1 carácter especial.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async(e)=>{
    e.preventDefault();
    if(!validate()) {
      setToast({show:true,message:"Revisa los campos marcados.",type:"error"});
      return;
    }

    try{
      // normaliza payload (sin espacios)
      const payload = trimAll({
        ...form,
        estado:true,
        rol:"Administrador"
      });

      await postAdministrador(payload);
      setToast({show:true,message:"Administrador creado con éxito",type:"success"});
      setForm({idDireccion:"",nombres:"",apellidoPaterno:"",apellidoMaterno:"",email:"",numCelular:"",fechaDeNacimiento:"",contrasenia:""});
      setErrors({});
      setShowPass(false);
    }catch(err){
      // si backend devuelve msg de duplicado o validación, la mostramos
      const msg=err?.response?.data?.error || err.message || "Error al crear administrador";
      setToast({show:true,message:msg,type:"error"});
    }
  };

  // crear nueva dirección (maneja duplicados 409 del backend)
  const createNewDireccion = async (e) => {
    e.preventDefault();
    try {
      const zona = newDir.zona.trim();
      const calle = newDir.calle.trim();
      const num_puerta = newDir.num_puerta.trim();
      if (!zona || !calle || !num_puerta) {
        setToast({show:true,message:"Todos los campos de dirección son obligatorios.",type:"error"});
        return;
      }

      const res = await createDireccion({ zona, calle, num_puerta });

      const dir = res.data ?? res;
      const id = dir.iddireccion ?? dir?.data?.iddireccion;
      const _zona = dir.zona ?? dir?.data?.zona;
      const _calle = dir.calle ?? dir?.data?.calle;
      const _num = dir.num_puerta ?? dir?.data?.num_puerta;

      setDirs(prev => [{ iddireccion:id, zona:_zona, calle:_calle, num_puerta:_num }, ...prev]);
      setForm(s => ({ ...s, idDireccion: id }));
      setAddDirOpen(false);
      setNewDir({ zona: "", calle: "", num_puerta: "" });
      setToast({ show:true, message:"Dirección agregada", type:"success" });
    } catch (err) {
      if (err?.response?.status === 409) {
        const id = err.response.data?.idDireccion;
        const row = err.response.data?.direccion;
        if (id) {
          setDirs(prev => {
            const exists = prev.some(d => d.iddireccion === id);
            return exists ? prev : [{ iddireccion:id, zona:row?.zona, calle:row?.calle, num_puerta:row?.num_puerta }, ...prev];
          });
          setForm(s => ({ ...s, idDireccion: id }));
          setAddDirOpen(false);
          setToast({ show:true, message:"La dirección ya existía; la seleccioné.", type:"success" });
          return;
        }
      }
      const msg = err?.response?.data?.error || err.message || "Error al crear dirección";
      setToast({ show:true, message: msg, type:"error" });
    }
  };

  return (
    <>
      <form onSubmit={submit} className="grid">
        {toast.show && <Toast message={toast.message} type={toast.type} onClose={()=>setToast({show:false,message:"",type:""})} />}

        <div className="fg span-6">
          <label>Dirección</label>
          <select
            name="idDireccion"
            value={form.idDireccion}
            onChange={onChange}
            required
            aria-invalid={!!errors.idDireccion}
          >
            <option value="">Selecciona una dirección</option>
            <option value="__new__">➕ Agregar nueva dirección…</option>
            {dirs.map(d=> (
              <option key={d.iddireccion} value={d.iddireccion}>
                {d.zona} - {d.calle} - {d.num_puerta}
              </option>
            ))}
          </select>
          {errors.idDireccion && <div className="error">{errors.idDireccion}</div>}
        </div>

        <div className="fg span-6">
          <label>Nombres</label>
          <input
            placeholder="Ejemplo: Alejandro"
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

        <div className="fg span-4">
          <label>Apellido Paterno</label>
          <input
            placeholder="Ejemplo: Mendez"
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

        <div className="fg span-4">
          <label>Apellido Materno</label>
          <input
            placeholder="Ejemplo: Lopez"
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

        <div className="fg span-4">
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            name="fechaDeNacimiento"
            value={form.fechaDeNacimiento}
            onChange={onChange}
            required
            min={limits.min}
            max={limits.max}
            aria-invalid={!!errors.fechaDeNacimiento}
          />
          {errors.fechaDeNacimiento && <div className="error">{errors.fechaDeNacimiento}</div>}
        </div>

        <div className="fg span-6">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Ejemplo: intitucionBancaria@gmail.com"
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

        <div className="fg span-3">
          <label>Celular</label>
          <input
            placeholder="8 dígitos"
            name="numCelular"
            value={form.numCelular}
            onChange={onChange}
            onInput={(e)=>{ e.target.value = e.target.value.replace(/\D/g,'').slice(0,8); }}
            required
            inputMode="numeric"
            maxLength={8}
            pattern="\d{8}"
            title="Exactamente 8 dígitos"
            aria-invalid={!!errors.numCelular}
          />
          {errors.numCelular && <div className="error">{errors.numCelular}</div>}
        </div>

        <div className="fg span-3">
          <label>Contraseña</label>
          <div style={{ position:"relative" }}>
            <input
              placeholder="Mín. 6, 1 mayúscula, 1 número y 1 símbolo"
              type={showPass ? "text" : "password"}
              name="contrasenia"
              value={form.contrasenia}
              onChange={onChange}
              required
              minLength={6}
              maxLength={255}
              style={{ paddingRight: 44 }}
              pattern={passwordPatternStr}
              title="Debe tener mínimo 6 caracteres e incluir al menos 1 mayúscula, 1 número y 1 carácter especial"
              aria-invalid={!!errors.contrasenia}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPass(v => !v)}
              style={{
                position:"absolute",
                right:8,
                top:"50%",
                transform:"translateY(-50%)",
                border:0,
                background:"transparent",
                cursor:"pointer",
                padding:4,
                lineHeight:0,
                borderRadius:8
              }}
              title={showPass ? "Ocultar" : "Mostrar"}
            >
              <span
                className="material-symbols-rounded"
                style={{ color: "#000", fontSize: 22, verticalAlign: "middle" }}
              >
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.contrasenia && <div className="error">{errors.contrasenia}</div>}
        </div>

        <div className="actions span-12">
          <button className="btn btn-primary" type="submit">Crear Administrador</button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={()=>{
              setForm({idDireccion:"",nombres:"",apellidoPaterno:"",apellidoMaterno:"",email:"",numCelular:"",fechaDeNacimiento:"",contrasenia:""});
              setErrors({});
              setShowPass(false);
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
          <div className="dialog-box" style={{ maxWidth: 520, position:"relative" }}>
            {/* X cerrar (requiere Material Symbols en index.html) */}
            <button
              type="button"
              className="icon-btn"
              onClick={() => setAddDirOpen(false)}
              aria-label="Cerrar"
              style={{ position:"absolute", right:8, top:8, border:0, background:"transparent", cursor:"pointer", padding:4, lineHeight:0, borderRadius:8 }}
            >
              <span className="material-symbols-rounded" style={{ color:"#000" }}>close</span>
            </button>

            <h3 style={{ marginTop: 0 }}>Nueva dirección</h3>
            <form onSubmit={createNewDireccion} className="grid">
              <div className="fg span-12">
                <label>Zona</label>
                <input
                  value={newDir.zona}
                  onChange={e => setNewDir(s => ({ ...s, zona: e.target.value }))}
                  required
                  maxLength={100}
                />
              </div>
              <div className="fg span-12">
                <label>Calle</label>
                <input
                  value={newDir.calle}
                  onChange={e => setNewDir(s => ({ ...s, calle: e.target.value }))}
                  required
                  maxLength={100}
                />
              </div>
              <div className="fg span-12">
                <label>Número de puerta</label>
                <input
                  value={newDir.num_puerta}
                  onChange={e => setNewDir(s => ({ ...s, num_puerta: e.target.value }))}
                  required
                  maxLength={10}
                />
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

