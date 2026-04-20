import React, { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import apiToken from "../../utils/apiToken";
import useSetPageTitle from "../../utils/setPageTitle";
import { getAxiosErrorMessage } from "../../utils/getAxiosErrorMessage";
import Breadcrumb from "../../components/Breadcrumb";

const EMPTY_PROFILE = {
  nombre: "",
  apellido_p: "",
  apellido_m: "",
  telefono: "",
  correo: "",
  ciudad: "",
  pais: "",
  foto_perfil: "",
  rol_nombre: "",
};

type PerfilFormState = typeof EMPTY_PROFILE;

export default function Perfil() {
  const location = useLocation();
  const [profile, setProfile] = useState<PerfilFormState>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/admin")) return "Perfil de administrador";
    if (location.pathname.startsWith("/host")) return "Perfil de anfitrión";
    if (location.pathname.startsWith("/profile")) return "Perfil de turista";
    return "Mi perfil";
  }, [location.pathname]);

  const profileLabel = useMemo(() => {
    if (location.pathname.startsWith("/admin")) return "Perfil de administrador";
    if (location.pathname.startsWith("/host")) return "Perfil de anfitrión";
    if (location.pathname.startsWith("/profile")) return "Perfil de turista";
    return "Mi perfil";
  }, [location.pathname]);

  useSetPageTitle(`${pageTitle} - Waymark`);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data } = await apiToken.get("/cuentas/me/");
        if (!active) return;

        setProfile({
          nombre: data?.nombre || "",
          apellido_p: data?.apellido_p || "",
          apellido_m: data?.apellido_m || "",
          telefono: data?.telefono || "",
          correo: data?.correo || "",
          ciudad: data?.ciudad || "",
          pais: data?.pais || "",
          foto_perfil: data?.foto_perfil || "",
          rol_nombre: data?.rol_nombre || "",
        });
        setPhotoPreview(data?.foto_perfil || "");
      } catch (error) {
        if (!active) return;
        setProfileError(
          getAxiosErrorMessage(error) || "No se pudo cargar el perfil",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!photoFile) return;

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const handleProfileChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
  };

  const handleProfileSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const formData = new FormData();
      formData.append("nombre", profile.nombre);
      formData.append("apellido_p", profile.apellido_p);
      formData.append("apellido_m", profile.apellido_m || "");
      formData.append("telefono", profile.telefono);
      formData.append("ciudad", profile.ciudad);
      formData.append("pais", profile.pais);
      if (photoFile) {
        formData.append("foto_perfil", photoFile);
      }

      const { data } = await apiToken.patch("/cuentas/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile((prev) => ({
        ...prev,
        nombre: data?.nombre || prev.nombre,
        apellido_p: data?.apellido_p || prev.apellido_p,
        apellido_m: data?.apellido_m || prev.apellido_m,
        telefono: data?.telefono || prev.telefono,
        ciudad: data?.ciudad || prev.ciudad,
        pais: data?.pais || prev.pais,
        foto_perfil: data?.foto_perfil || prev.foto_perfil,
      }));
      setPhotoFile(null);
      setPhotoPreview(data?.foto_perfil || photoPreview);
      setProfileMessage("Perfil actualizado correctamente");
    } catch (error) {
      setProfileError(
        getAxiosErrorMessage(error) || "No se pudo actualizar el perfil",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Las contraseñas nuevas no coinciden");
      setSavingPassword(false);
      return;
    }

    try {
      await apiToken.post("/cuentas/me/password/", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordMessage("Contraseña actualizada correctamente");
    } catch (error: any) {
      // Intenta extraer errores del backend
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === "object") {
          // Si el backend devuelve errores por campo
          const errorMessages = Object.entries(data)
            .map(([field, messages]: [string, any]) => {
              if (Array.isArray(messages)) {
                return messages.join(", ");
              }
              return String(messages);
            })
            .filter(Boolean)
            .join(" | ");
          
          if (errorMessages) {
            setPasswordError(errorMessages);
          } else {
            setPasswordError("No se pudo cambiar la contraseña");
          }
        } else {
          setPasswordError(String(data));
        }
      } else {
        setPasswordError(
          getAxiosErrorMessage(error) || "No se pudo cambiar la contraseña",
        );
      }
    } finally {
      setSavingPassword(false);
    }
  };

    const links = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Mi perfil",
      href: "/profile",
      disabled: true,
    },
  ];

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1180px] px-3 py-6 text-left md:px-5 lg:px-6">
        <section className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8">
          <p className="m-0 text-sm font-medium text-[var(--t_secundario)]">Cargando perfil...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] px-3 py-6 text-left md:px-5 lg:px-6">
      <Breadcrumb items={links} />
      <br />
      <section className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--secundario)]">
          {profileLabel}
        </p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,3.8vw,2.5rem)] leading-tight text-[var(--t_primario)]">
          {pageTitle}
        </h1>
        <p className="mt-2 mb-0 max-w-2xl text-sm leading-6 text-[var(--t_secundario)]">
          Actualiza tu información personal y tu contraseña desde una vista limpia y directa.
        </p>
      </section>

      {profileError ? (
        <p className="mt-6 rounded-2xl border border-[#f0b2af] bg-[#ffeceb] px-4 py-3 text-sm font-medium text-[#9f0200] shadow-sm">
          {profileError}
        </p>
      ) : null}

      <section className="mt-6 flex flex-col gap-6">
        <form
          onSubmit={handleProfileSubmit}
          className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8"
        >
          <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-5">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--secundario)]">
                Datos personales
              </p>
              <h2 className="mt-2 mb-0 text-[1.25rem] text-[var(--t_primario)]">
                Información básica
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-[var(--t_primario)]">Nombre</span>
              <input
                name="nombre"
                value={profile.nombre}
                onChange={handleProfileChange}
                className="h-11 w-full rounded-xl border border-[#d8dbe5] bg-white px-3.5 text-left outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.10)]"
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-[var(--t_primario)]">Apellido paterno</span>
              <input
                name="apellido_p"
                value={profile.apellido_p}
                onChange={handleProfileChange}
                className="h-11 w-full rounded-xl border border-[#d8dbe5] bg-white px-3.5 text-left outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.10)]"
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-[var(--t_primario)]">Apellido materno</span>
              <input
                name="apellido_m"
                value={profile.apellido_m}
                onChange={handleProfileChange}
                className="h-11 w-full rounded-xl border border-[#d8dbe5] bg-white px-3.5 text-left outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.10)]"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-[var(--t_primario)]">Teléfono</span>
              <input
                name="telefono"
                value={profile.telefono}
                onChange={handleProfileChange}
                className="h-11 w-full rounded-xl border border-[#d8dbe5] bg-white px-3.5 text-left outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.10)]"
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-[var(--t_primario)]">Correo</span>
              <input
                value={profile.correo}
                disabled
                className="h-11 w-full rounded-xl border border-[#d8dbe5] bg-[#f7f8fb] px-3.5 text-left text-[var(--t_secundario)] outline-none"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-[var(--t_primario)]">Ciudad</span>
              <input
                name="ciudad"
                value={profile.ciudad}
                onChange={handleProfileChange}
                className="h-11 w-full rounded-xl border border-[#d8dbe5] bg-white px-3.5 text-left outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.10)]"
                required
              />
            </label>

            <label className="grid gap-1.5 sm:col-span-2 lg:col-span-3">
              <span className="text-sm font-semibold text-[var(--t_primario)]">País</span>
              <input
                name="pais"
                value={profile.pais}
                onChange={handleProfileChange}
                className="h-11 w-full rounded-xl border border-[#d8dbe5] bg-white px-3.5 text-left outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.10)]"
                required
              />
            </label>
          </div>

          <div className="mt-6 grid gap-5 rounded-[22px] border border-[var(--color-border)] bg-[#fafafa] p-5 lg:grid-cols-[132px_minmax(0,1fr)] lg:items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-[120px] w-[120px] overflow-hidden rounded-2xl border border-[#e1e4ed] bg-white">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--t_secundario)]">
                    Sin foto
                  </div>
                )}
              </div>
              <span className="text-center text-xs text-[var(--t_secundario)]">
                Vista previa
              </span>
            </div>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-[var(--t_primario)]">Foto de perfil</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  handlePhotoChange(event);
                }}
                className="w-full rounded-xl border border-dashed border-[#d8dbe5] bg-white px-3.5 py-3 text-[var(--t_secundario)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--secundario)] file:px-4 file:py-2 file:text-white file:font-semibold hover:border-[var(--primario)]"
              />
              <span className="text-xs leading-6 text-[var(--t_secundario)]">
                Sube una imagen cuadrada o cercana a cuadrada.
              </span>
            </label>
          </div>

          {profileMessage ? (
            <p className="mt-4 rounded-xl border border-[#bfe5c4] bg-[#eefaf0] px-4 py-3 text-sm font-medium text-[#166534]">
              {profileMessage}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-end border-t border-[var(--color-border)] pt-5">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--secundario)] px-5 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8"
        >
          <div className="border-b border-[var(--color-border)] pb-5">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--secundario)]">
              Seguridad
            </p>
            <h2 className="mt-2 mb-0 text-[1.25rem] text-[var(--t_primario)]">
              Cambiar contraseña
            </h2>
            <p className="mt-2 mb-0 text-sm leading-6 text-[var(--t_secundario)]">
              Usa tu contraseña actual y define una nueva.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-[var(--t_primario)]">Contraseña actual</span>
              <input
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                className="h-11 w-full rounded-xl border border-[#d8dbe5] bg-white px-3.5 text-left outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.10)]"
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-[var(--t_primario)]">Nueva contraseña</span>
              <input
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                className="h-11 w-full rounded-xl border border-[#d8dbe5] bg-white px-3.5 text-left outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.10)]"
                required
                minLength={8}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-[var(--t_primario)]">Confirmar nueva contraseña</span>
              <input
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                className="h-11 w-full rounded-xl border border-[#d8dbe5] bg-white px-3.5 text-left outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.10)]"
                required
                minLength={8}
              />
            </label>
          </div>

          <ul className="mt-5 space-y-2 pl-4 text-sm leading-6 text-[var(--t_secundario)]">
            <li>Debe tener mínimo 8 caracteres.</li>
            <li>No puede ser igual a la contraseña anterior.</li>
            <li>No debe ser una contraseña común o muy obvia.</li>
          </ul>

          {passwordError ? (
            <p className="mt-4 rounded-xl border border-[#f0b2af] bg-[#ffeceb] px-4 py-3 text-sm font-medium text-[#9f0200]">
              {passwordError}
            </p>
          ) : null}

          {passwordMessage ? (
            <p className="mt-4 rounded-xl border border-[#bfe5c4] bg-[#eefaf0] px-4 py-3 text-sm font-medium text-[#166534]">
              {passwordMessage}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end border-t border-[var(--color-border)] pt-5">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#8d0801] bg-white px-5 font-semibold text-[#8d0801] transition hover:bg-[#fff1f1] disabled:cursor-not-allowed disabled:opacity-65"
            >
              {savingPassword ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
