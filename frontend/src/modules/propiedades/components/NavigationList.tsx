import React, { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import CustomLink from "../../../components/CustomLink";

export default function NavigationList() {
  const auth = useAuth();

  const isAuthenticated = auth?.isAuthenticated;
  const role = auth?.userRole;
  const Links: React.ReactElement = useMemo(() => {
    if (isAuthenticated) {
      switch (role) {
        case "administrador":
          return (
            <ul>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/admin/dashboard"
                  disabled={false}
                >
                  Dashboard
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/admin/currencys"
                  disabled={false}
                >
                  Divisas
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/admin/calendar"
                  disabled={false}
                >
                  Calendario
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/profile" disabled={false}>
                  Mi perfil
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  onClick={(e) => {
                    e.preventDefault();
                    auth.handleLogout?.();
                  }}
                  disabled={false}
                  to={""}
                >
                  Cerrar sesión
                </CustomLink>
              </li>
            </ul>
          );
        case "anfitrion":
          return (
            <ul>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/host/today"
                  disabled={false}
                >
                  Solicitudes
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/host/calendar"
                  disabled={false}
                >
                  Calendario
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/host/listings"
                  disabled={false}
                >
                  Mis alojamientos
                </CustomLink>
              </li>
              <CommonLinks />
            </ul>
          );
        case "ambos":
          return (
            <ul>
              {" "}
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/host/today"
                  disabled={false}
                >
                  Solicitudes
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/wishlist" disabled={false}>
                  Favoritos
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/host/calendar"
                  disabled={false}
                >
                  Calendario
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/host/listings"
                  disabled={false}
                >
                  Mis alojamientos
                </CustomLink>
              </li>
              <CommonLinks />
            </ul>
          );
        case "turista":
        default:
          return (
            <ul>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/wishlist" disabled={false}>
                  Favoritos
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/my-trips" disabled={false}>
                  Mis reservaciones
                </CustomLink>
              </li>
              <CommonLinks />
            </ul>
          );
      }
    } else {
      return (
        <ul>
          <li>
            <div className="w-full bg-border h-[1px]"></div>
          </li>
          <li className="py-4 px-2 text-left text-nowrap">
            <CustomLink to="/login" disabled={false}>
              Iniciar sesión
            </CustomLink>
          </li>
        </ul>
      );
    }
  }, [isAuthenticated, role]);
  return <nav>{Links}</nav>;
}

const CommonLinks = () => {
  const auth = useAuth();
  return (
    <>
      <li>
        <div className="w-full bg-border h-[1px]"></div>
      </li>
      <li className="py-4 px-2 text-left text-nowrap">
        <CustomLink to="/profile" disabled={false}>
          Mi perfil
        </CustomLink>
      </li>
      <li>
        <div className="w-full bg-border h-[1px]"></div>
      </li>
      <li className="py-4 px-2 text-left text-nowrap">
        <CustomLink
          onClick={(e) => {
            e.preventDefault();
            auth?.handleLogout?.();
          }}
          disabled={false}
          to={""}
        >
          Cerrar sesión
        </CustomLink>
      </li>
    </>
  );
};
