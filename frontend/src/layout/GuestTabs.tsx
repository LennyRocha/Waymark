import { useAuth } from "../context/AuthContext";
import UserTabs from "../modules/propiedades/components/UserTabs";
import UserLinkProps from "../modules/propiedades/types/UserLinkProps";
import {
  Search,
  Heart,
  CircleUser,
  Plane,
  Menu,
} from "lucide-react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import CustomLink from "../components/CustomLink";
import CustomDropdown from "../components/CustomDropdown";
import DropdownParent from "../components/DropdownParent";

export default function TabsScreen() {
  const location = useLocation();
  const auth = useAuth();
  const isAuthenticated =
    auth?.isAuthenticated &&
    (auth?.userRole === "turista" ||
      auth?.userRole === "ambos");
  const links: UserLinkProps[] = isAuthenticated
    ? [
        {
          label: "Explorar",
          to: "/",
          icon: <Search size={24} strokeWidth={1.5} />,
        },
        {
          label: "Favoritos",
          to: "/favorites",
          icon: <Heart size={24} strokeWidth={1.5} />,
        },
        {
          label: "Viajes",
          to: "/my-trips",
          icon: <Plane size={24} strokeWidth={1.5} />,
        },
        {
          label: "Perfil",
          to: "/profile",
          icon: <CircleUser size={24} strokeWidth={1.5} />,
        },
      ]
    : [
        {
          label: "Explorar",
          to: "/",
          icon: <Search size={24} strokeWidth={1.5} />,
        },
        {
          label: "Favoritos",
          to: "/favorites",
          icon: <Heart size={24} strokeWidth={1.5} />,
        },
        {
          label: "Iniciar sesión",
          to: "/login",
          icon: <CircleUser size={24} strokeWidth={1.5} />,
        },
      ];
  return (
    <>
      {location.pathname !== "/" &&
        (auth?.isAuthenticated ? (
          <Header
            links={links.filter(
              (link): link is UserLinkProps => !!link,
            )}
          />
        ) : (
          <HeaderNoAuth />
        ))}
      <Outlet />
      <UserTabs
        links={links.filter(
          (link): link is UserLinkProps => !!link,
        )}
      />
    </>
  );
}

function Header({
  links,
}: Readonly<{ links: UserLinkProps[] }>) {
  const navigate = useNavigate();
  return (
    <header className="max-md:hidden bg-white border-border border-1">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-[1450px] xl items-center justify-between px-6 lg:px-8 py-4"
      >
        <div className="flex flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <img
              src="/logo_white.png"
              alt="WAYMARK"
              className="h-12 aspect-square w-auto"
            />
          </Link>
        </div>
        <div className="flex gap-x-12">
          {links.map(
            (l) =>
              l.label !== "Perfil" && (
                <NavLink
                  key={l.label}
                  to={l.to}
                  className={({ isActive }) =>
                    `text-sm/6 font-semibold font-[montserrat] border-b-3 transition duration-200 ease ${
                      isActive
                        ? "text-secondary-500 border-secondary-500"
                        : "text-text-primary hover:text-text-secondary border-transparent"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ),
          )}
        </div>
        <div className="flex flex-1 justify-end gap-2">
          <button
            className="font-bold hidden lg:block"
            onClick={() => navigate("/become-a-host")}
            title="Convertirte en anfitrión"
            aria-label="Convertirte en anfitrión"
          >
            Conviertete en anfitrión
          </button>
          <button
            type="button"
            className="flex text-sm bg-gray-800 rounded-full focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            onClick={() => navigate("/profile")}
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
    </header>
  );
}

const HeaderNoAuth = () => {
  const navigate = useNavigate();

  const auth = useAuth();

  const [show, setShow] = useState(false);

  const buttonRef = useRef(null);

  return (
    <motion.header className="max-md:hidden flex flex-col items-center w-full bg-w  hite p-[1.25rem] border-b border-border">
      <nav className="max-w-[1450px] w-full flex flex-col md:flex-row items-center md:justify-between justify-center">
        <div className="flex flex-row -gap-1 justify-center items-center">
          <img
            src={"/logo_white.png"}
            alt="waymark"
            className="w-[3.25rem]"
          />
          <h6 className="text-primary-500 m-0 rotulo lg:block hidden">
            WAYMARK
          </h6>
        </div>
        <DropdownParent
          classes=" flex flex-row gap-2 justify-center items-center"
          hideFunction={setShow}
        >
          {(!auth?.isAuthenticated ||
            (auth.userRole !== "anfitrion" &&
              auth.userRole !== "ambos")) && (
            <button
              className="font-bold lg:block hidden"
              onClick={() => navigate("/become-a-host")}
              title="Convertirte en anfitrión"
              aria-label="Convertirte en anfitrión"
            >
              Conviertete en anfitrión
            </button>
          )}
          <button
            aria-label="abrir menú lateral"
            ref={buttonRef}
            onClick={() => setShow(!show)}
            className=" hover:bg-border text-text-secondary  border border-border p-2 rounded-2xl"
          >
            <Menu />
          </button>
          <CustomDropdown
            anchorRef={buttonRef}
            visible={show}
            align="right"
            width={"250px"}
            layoutId="drop_menu"
          >
            <p className="text-xs font-bold text-left px-2 font-[cabin] mb-2">
              Menú
            </p>
            <div className="w-full bg-border h-[1px]"></div>
            <ul>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/become-a-host"
                  disabled={false}
                >
                  Convierte en anfitrión
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink
                  to="/search-hosts"
                  disabled={false}
                >
                  Buscar a un anfitrión
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/login" disabled={false}>
                  Iniciar sesión
                </CustomLink>
              </li>
            </ul>
          </CustomDropdown>
        </DropdownParent>
      </nav>
    </motion.header>
  );
};
