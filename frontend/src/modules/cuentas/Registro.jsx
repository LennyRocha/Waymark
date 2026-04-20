import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { getAxiosErrorMessage } from "../../utils/getAxiosErrorMessage";

export default function Registro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loadingINE, setLoadingINE] = useState(false);
  const [ineError, setIneError] = useState("");
  const [ineFile, setIneFile] = useState(null);
  const [inePreview, setInePreview] = useState(null);
  const [ineData, setIneData] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido_p: "",
    apellido_m: "",
    telefono: "",
    correo: "",
    password: "",
    rol: "1",
    ciudad: "",
    pais: "",
  });

  const [foto, setFoto] = useState(null);
  const isHost = form.rol === "2" || form.rol === "4";

  const normalizeText = (value) => {
    if (!value) return "";
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    setFoto(file);
  };

  const handleSelectINE = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setIneFile(file);
    setIneData(null);
    setIneError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setInePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleScanINE = async () => {
    if (!ineFile) {
      setIneError("Selecciona un archivo INE primero");
      return;
    }

    setLoadingINE(true);
    setIneError("");

    try {
      const formData = new FormData();
      formData.append("imagen", ineFile);

      const response = await api.post("/documentos/escanear-ine/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "ok") {
        const nombreCompleto = response.data.datos.nombre || "";

        const partes = nombreCompleto.split(/\s+/).filter((p) => p.length > 0);
        let apellido_p = "";
        let apellido_m = "";
        let nombre = "";

        const capitalize = (str) => {
          if (!str) return "";
          return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        };

        if (partes.length >= 3) {
          apellido_p = capitalize(partes[0]);
          apellido_m = capitalize(partes[1]);
          nombre = partes.slice(2).map(capitalize).join(" ");
        } else if (partes.length === 2) {
          apellido_p = capitalize(partes[0]);
          nombre = capitalize(partes[1]);
        } else if (partes.length === 1) {
          nombre = capitalize(partes[0]);
        }

        setForm((prev) => ({
          ...prev,
          nombre,
          apellido_p,
          apellido_m,
        }));
        setIneData({
          nombre,
          apellido_p,
          apellido_m,
        });
        setOk("Datos del INE extraídos correctamente");
        setTimeout(() => setOk(""), 3000);
      }
    } catch (err) {
      const mensaje = err?.response?.data?.mensaje || "Error al procesar el INE";
      setIneError(mensaje);
    } finally {
      setLoadingINE(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (isHost) {
      if (!ineFile) {
        setError("Para registrarte como anfitrion debes subir tu INE.");
        return;
      }

      if (!ineData) {
        setError("Debes escanear tu INE antes de crear la cuenta.");
        return;
      }

      const fieldsToValidate = [
        { key: "nombre", label: "nombre" },
        { key: "apellido_p", label: "apellido paterno" },
        { key: "apellido_m", label: "apellido materno" },
      ];

      const mismatchedFields = fieldsToValidate
        .filter(({ key }) => normalizeText(form[key]) !== normalizeText(ineData[key]))
        .map(({ label }) => label);

      if (mismatchedFields.length > 0) {
        setError(
          `Los datos del formulario no coinciden con tu INE (${mismatchedFields.join(", ")}).`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (foto) data.append("foto_perfil", foto);

      await api.post("/registro/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOk("Registro exitoso. Ahora inicia sesion.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const payload = err?.response?.data;
      if (payload && typeof payload === "object") {
        const firstKey = Object.keys(payload)[0];
        const firstVal = Array.isArray(payload[firstKey]) ? payload[firstKey][0] : payload[firstKey];
        setError(String(firstVal || "Error al registrar"));
      } else {
        setError(getAxiosErrorMessage(err) || "Error al registrar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-white px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-[560px] rounded-2xl border border-[var(--color-border)] bg-white/90 p-6 md:p-8 shadow-[0_18px_40px_rgba(43,49,69,0.14)]">
        <p className="m-0 uppercase tracking-[0.1em] text-xs font-bold text-[var(--secundario)]">
          Waymark
        </p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,3.6vw,2.4rem)] leading-tight text-[var(--t_primario)]">
          Crear cuenta
        </h1>
        <p className="mt-2 mb-6 text-[var(--t_secundario)]">
          Completa tus datos para registrarte y empezar a usar la plataforma.
        </p>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="rol">Rol</label>
              <select
                id="rol"
                name="rol"
                value={form.rol}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              >
                <option value="3">Cliente</option>
                <option value="2">Anfitrion</option>
                <option value="1">Admin</option>
                <option value="4">Anfitrión  turista</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="foto_perfil">Foto de perfil</label>
              <input
                id="foto_perfil"
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="w-full rounded-xl border border-dashed border-[#d8dbe5] bg-white px-3.5 py-2.5 text-[var(--t_secundario)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--secundario)] file:px-3 file:py-2 file:text-white file:font-semibold hover:border-[var(--primario)]"
              />
            </div>
          </div>

          {isHost && (
            <div className="grid gap-3">
              <label className="font-semibold text-[var(--t_primario)]">Escanear INE</label>
              <input
                type="file"
                id="ine_input"
                accept="image/*"
                onChange={handleSelectINE}
                disabled={loadingINE}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById("ine_input").click()}
                disabled={loadingINE}
                className="relative overflow-hidden rounded-xl border-2 border-dashed border-[#bf0603] bg-gradient-to-br from-[#fff7f2] to-[#f5f7fb] px-2 py-2 transition hover:border-[#8d0801] hover:from-[#ffebeb] disabled:opacity-65 disabled:cursor-not-allowed"
              >
                {inePreview ? (
                  <div className="flex items-center justify-center">
                    <img
                      src={inePreview}
                      alt="Preview INE"
                      className="max-h-32 w-auto rounded-lg object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2">
                    <svg
                      className="w-6 h-6 text-[#bf0603]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs font-semibold text-[var(--t_primario)]">Sube tu INE</p>
                  </div>
                )}
              </button>

              {ineFile && (
                <button
                  type="button"
                  onClick={handleScanINE}
                  disabled={loadingINE}
                  className="rounded-xl bg-[linear-gradient(90deg,#bf0603,#8d0801)] px-4 py-3 font-bold text-white transition hover:brightness-105 disabled:opacity-65 disabled:cursor-not-allowed"
                >
                  {loadingINE ? "Escaneando INE..." : "Escanear datos"}
                </button>
              )}

              {ineError && (
                <p className="m-0 rounded-lg bg-[#ffe6e5] px-3 py-2 text-sm text-[#9f0200]">
                  {ineError}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="apellido_p">Apellido paterno</label>
              <input
                id="apellido_p"
                name="apellido_p"
                placeholder="Apellido paterno"
                value={form.apellido_p}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="apellido_m">Apellido materno</label>
              <input
                id="apellido_m"
                name="apellido_m"
                placeholder="Apellido materno"
                value={form.apellido_m}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="telefono">Telefono</label>
              <input
                id="telefono"
                name="telefono"
                placeholder="Tu telefono"
                value={form.telefono}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="correo">Correo</label>
              <input
                id="correo"
                name="correo"
                type="email"
                placeholder="tu-correo@ejemplo.com"
                value={form.correo}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="password">Contrasena</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Tu contrasena"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>
          </div>



          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="ciudad">Ciudad</label>
              <input
                id="ciudad"
                name="ciudad"
                placeholder="Tu ciudad"
                value={form.ciudad}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="pais">Pais</label>
              <input
                id="pais"
                name="pais"
                placeholder="Tu pais"
                value={form.pais}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>
          </div>

          {error ? (
            <p className="m-0 rounded-lg bg-[#ffe6e5] px-3 py-2 text-sm text-[#9f0200]">
              {error}
            </p>
          ) : null}

          {ok ? (
            <p className="m-0 rounded-lg bg-[#e7f8ea] px-3 py-2 text-sm text-[#166534]">
              {ok}
            </p>
          ) : null}

          <button
            className="mt-1 rounded-xl bg-[linear-gradient(90deg,#bf0603,#8d0801)] px-4 py-3 font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-65"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mb-0 mt-4 text-[var(--t_secundario)]">
          Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>

        <Link
          to="/"
          className="mt-3 inline-flex items-center justify-center rounded-xl border border-[#8d0801] bg-white px-4 py-2.5 font-semibold text-[#8d0801] transition hover:bg-[#fff1f1]"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}