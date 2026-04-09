import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type HostLink = {
  name: string;
  text: string;
  to: string;
};

const links: HostLink[] = [
  { name: "today", text: "Solicitudes", to: "/host/today" },
  {
    name: "calendar",
    text: "Calendario",
    to: "/host/calendar",
  },
  {
    name: "listings",
    text: "Alojamientos",
    to: "/host/listings",
  },
];

export default function HostHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const auth = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div>
      <header className="bg-white border-border border-1">
        <nav
          aria-label="Global"
          className="mx-auto flex max-w-[1450px] xl items-center justify-between px-6 lg:px-8 py-4"
        >
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only rotulo">
                WAYMARK
              </span>
              <img
                src="/logo_white.png"
                alt="WAYMARK"
                className="h-12 aspect-square w-auto"
              />
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
              title="Abrir menú"
              aria-label="Abrir menú"
            >
              <span className="sr-only">
                Open main menu
              </span>
              <Menu
                fill="none"
                color="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
                className="size-6"
              />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {links.map((l) => (
              <NavLink
                key={l.name}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm/6 font-semibold font-[montserrat] border-b-3 transition duration-200 ease ${
                    isActive
                      ? "text-secondary-500 border-secondary-500"
                      : "text-text-primary hover:text-text-secondary border-transparent"
                  }`
                }
              >
                {l.text}
              </NavLink>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-2">
            {auth?.userRole === "ambos" && (
              <button
                className="font-bold"
                onClick={() => navigate("/")}
                title="Cambiar a exploración"
                aria-label="Cambiar a exploración"
              >
                Cambiar a exploración
              </button>
            )}
            <button
              type="button"
              className="flex text-sm bg-gray-800 rounded-full focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              onClick={() => navigate("/host/profile")}
              title="Ir a perfil"
              aria-label="Ir a perfil"
            >
              <img
                className="w-8 h-8 rounded-full"
                src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                alt="Perfil de usuario"
              />
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {open && (
            <>
              {/* Overlay */}
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9998] bg-black/50 lg:hidden"
                onClick={() => setOpen(false)}
              />

              {/* Drawer lateral */}
              <motion.aside
                key="drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "tween",
                  duration: 0.25,
                }}
                className="fixed inset-y-0 right-0 z-[9999] w-full max-w-sm bg-white overflow-y-auto p-6 shadow-xl lg:hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Link to="/" className="-m-1.5 p-1.5">
                    <img
                      src="/logo_white.png"
                      alt="WAYMARK"
                      className="h-12 w-auto"
                    />
                  </Link>

                  <button
                    title="Abrir menú"
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-2 text-gray-400"
                  >
                    <Menu className="size-6" />
                  </button>
                </div>

                {/* Links */}
                <div className="mt-6 space-y-2">
                  {links.map((l) => (
                    <NavLink
                      key={l.name}
                      to={l.to}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-base font-semibold transition ${isActive ? "text-secondary-500" : "text-text-primary hover:bg-black/5"}`
                      }
                    >
                      {l.text}
                    </NavLink>
                  ))}

                  <NavLink
                    to="/host/profile"
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-base font-semibold transition ${isActive ? "text-secondary-500" : "text-text-primary hover:bg-black/5"}`
                    }
                  >
                    Mi perfil
                  </NavLink>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </header>
      <main className="w-full  h-full">
        <Outlet />
      </main>
    </div>
  );
}
