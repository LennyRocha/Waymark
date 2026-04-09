// @ts-nocheck
/* eslint-disable no-unused-vars */
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import PropiedadCard from "./components/PropiedadCard";
import { GalleryHorizontal, Menu } from "lucide-react";
import {
  useScroll,
  useMotionValueEvent,
  motion,
} from "framer-motion";
import CustomLink from "../../components/CustomLink";
import Buscador from "./components/Buscador";
import CustomDropdown from "../../components/CustomDropdown";
import DropdownParent from "../../components/DropdownParent";
import BuscadorBoton from "./components/BuscadorBoton";
import Footer from "../../layout/Footer";
import useSetPageTitle from "../../utils/setPageTitle";
import useUbicaciones from "./hooks/useUbicaciones";
import useLanding from "./hooks/useLanding";
import CustomLoader from "../../layout/CustomLoader";
import ErrorViewComponent from "../../layout/ErrorViewComponent";
import EmptyListComponent from "../../layout/EmptyListComponent";
import { Ubicacion } from "./types/Propiedad";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Landing() {
  const ubicaciones = useUbicaciones();
  const landing = useLanding();
  const isLoading =
    ubicaciones.isInitialLoading ||
    ubicaciones.isLoading ||
    landing.isInitialLoading ||
    landing.isLoading;
  useSetPageTitle(
    "Waymark - Encuentra el lugar perfecto para tu próxima aventura",
  );
  if (isLoading)
    return (
      <main className="w-[100dvw] h-[100dvh] flex items-center justify-center">
        <CustomLoader />
      </main>
    );
  if (ubicaciones.isError || landing.isError)
    return (
      <main className="w-[100dvw] h-[100dvh]">
        <ErrorViewComponent
          error={ubicaciones.error || landing.error}
          retryFunction={() => {
            ubicaciones.refetch();
            landing.refetch();
          }}
        />
      </main>
    );
  return (
    <div className="flex flex-col min-h-screen gap-2">
      <Header
        isWaiting={isLoading}
        ubicaciones={ubicaciones.data ?? []}
      />
      {landing.data?.ciudades.every(
        (ciudad) => ciudad.cards.length === 0,
      ) ? (
        <main className="w-[100dvw] h-[100dvh] flex items-center justify-center">
          <EmptyListComponent
            titulo="¡Ups!"
            mensaje={"No se encontraron alojamientos"}
          />
        </main>
      ) : (
        <main className="content">
          {landing.data?.favoritos.length !== 0 && (
            <>
              <h4 className="w-full text-left mt-[1rem] mb-2">
                Alojamientos populares
              </h4>
              <section className="inline-flex w-full overflow-x-auto overflow-y-hidden overflow-y-hidden gap-[.75rem] md:gap-3 scroll-smooth scroll-no mb-5">
                {landing.data?.favoritos.map((item) => {
                  return (
                    <PropiedadCard
                      key={item.propiedad_id}
                      propiedad={item}
                    />
                  );
                })}
                <VerMasCard direccion={"/s/homes"} />
              </section>
            </>
          )}
          {landing.data?.ciudades.map((item) => {
            return (
              <div key={item.ciudad}>
                <h4 className="w-full text-left mt-[1rem] mb-2">
                  Alojamientos en {item.ciudad}
                </h4>
                <section className="inline-flex w-full overflow-x-auto overflow-y-hidden gap-[.75rem] md:gap-3 scroll-smooth scroll-no mb-5">
                  {item.cards.length !== 0 &&
                    item.cards.map((card) => {
                      return (
                        <PropiedadCard
                          key={card.propiedad_id}
                          propiedad={card}
                        />
                      );
                    })}
                  <VerMasCard
                    direccion={`/s/${item.ciudad}/homes`}
                  />
                </section>
              </div>
            );
          })}
        </main>
      )}
      <Footer />
    </div>
  );
}

type VerMasCardProps = {
  direccion: string;
};
export const VerMasCard = ({
  direccion = "",
}: VerMasCardProps) => {
  return (
    <div className="w-[clamp(138px,13.5%,250px)]   shrink-0   relative flex flex-col items-start justify-flex-start">
      <div className="flex flex-col items-center justify-center shadow-xl rounded-2xl w-full h-50 aspect-ratio: 4/3">
        <GalleryHorizontal
          size={48}
          color="var(--color-secondary-500)"
        />
        <CustomLink to={direccion} disabled={false}>
          Mostrar todo
        </CustomLink>
      </div>
    </div>
  );
};

type HeaderProps = {
  isWaiting: boolean;
  ubicaciones: Ubicacion[];
};

const Header = ({
  isWaiting = false,
  ubicaciones = [],
}: HeaderProps) => {
  const navigate = useNavigate();

  const auth = useAuth();

  const isAuthenticated = auth?.isAuthenticated;
  const role = auth?.userRole;
  const Links: React.FC = useMemo(() => {
    //TODO: Agregr links para administradores cuando se implementen
    if (isAuthenticated) {
      switch (role) {
        case "anfitrion":
          return (
            <ul>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/host/today">
                  Solicitudes
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/host/calendar">
                  Calendario
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/host/listings">
                  Mis alojamientos
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/search-hosts">
                  Buscar a un anfitrión
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/profile">
                  Mi perfil
                </CustomLink>
              </li>
            </ul>
          );
        case "ambos":
          return (
            <ul>
              {" "}
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/host/today">
                  Solicitudes
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/wishlist">
                  Favoritos
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/host/calendar">
                  Calendario
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/host/listings">
                  Mis alojamientos
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/search-hosts">
                  Buscar a un anfitrión
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/profile">
                  Mi perfil
                </CustomLink>
              </li>
            </ul>
          );
        case "turista":
        default:
          return (
            <ul>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/wishlist">
                  Favoritos
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/my-trips">
                  Mis reservaciones
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/search-hosts">
                  Buscar a un anfitrión
                </CustomLink>
              </li>
              <li>
                <div className="w-full bg-border h-[1px]"></div>
              </li>
              <li className="py-4 px-2 text-left text-nowrap">
                <CustomLink to="/profile">
                  Mi perfil
                </CustomLink>
              </li>
            </ul>
          );
      }
    } else {
      return (
        <ul>
          <li className="py-4 px-2 text-left text-nowrap">
            <CustomLink to="/become-a-host">
              Convierte en anfitrión
            </CustomLink>
          </li>
          <li>
            <div className="w-full bg-border h-[1px]"></div>
          </li>
          <li className="py-4 px-2 text-left text-nowrap">
            <CustomLink to="/search-hosts">
              Buscar a un anfitrión
            </CustomLink>
          </li>
          <li>
            <div className="w-full bg-border h-[1px]"></div>
          </li>
          <li className="py-4 px-2 text-left text-nowrap">
            <CustomLink to="/login">
              Iniciar sesión
            </CustomLink>
          </li>
        </ul>
      );
    }
  }, [isAuthenticated, role]);

  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [show, setShow] = useState(false);

  const scrolledRef = useRef(false);
  const manualOverride = useRef(false);
  const buttonRef = useRef(null);

  const [isSmall, setIsSmall] = useState(
    window.innerWidth <= 767,
  );
  const [showLink, setShowLink] = useState(
    window.innerWidth >= 1125,
  );
  const [showBrand, setShowBrand] = useState(
    window.innerWidth >= 950,
  );

  function updateWidth() {
    setIsSmall(window.innerWidth <= 767);
    setShowLink(window.innerWidth >= 1125);
    setShowBrand(window.innerWidth >= 950);
  }

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () =>
      window.removeEventListener("resize", updateWidth);
  }, []);

  function setScrolledSync(val) {
    scrolledRef.current = val;
    setScrolled(val);

    if (!val) {
      manualOverride.current = true;
      setTimeout(() => {
        manualOverride.current = false;
      }, 500);
    }
  }

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (manualOverride.current) return;

    if (!scrolledRef.current && latest > 80) {
      scrolledRef.current = true;
      setScrolled(true);
    }
    if (scrolledRef.current && latest < 40) {
      scrolledRef.current = false;
      setScrolled(false);
    }
  });
  return (
    <motion.header className="sticky top-0 z-10 flex flex-col items-center w-full bg-gradient-to-b from-white via-white to-gray-50 to-80% p-[1.25rem] border-b border-border">
      {isSmall ? (
        <BuscadorBoton
          locations={ubicaciones}
          isWaiting={isWaiting}
        />
      ) : (
        <>
          <nav className="max-w-[1450px] w-full flex flex-col md:flex-row items-center md:justify-between justify-center">
            <div className="flex flex-row gap-2 justify-center items-center">
              <img
                src={"/logo_white.png"}
                alt="waymark"
                className="w-[3.25rem]"
              />
              {showBrand && (
                <h6 className="text-primary-500 m-0 rotulo">
                  WAYMARK
                </h6>
              )}
            </div>
            <DropdownParent
              classes=" flex flex-row gap-2 justify-center items-center"
              hideFunction={setShow}
            >
              {showLink &&
                (!auth?.isAuthenticated ||
                  (auth.userRole !== "anfitrion" &&
                    auth.userRole !== "ambos")) && (
                  <button
                    className="font-bold"
                    onClick={() =>
                      navigate("/become-a-host")
                    }
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
                width={"275px"}
                layoutId="drop_menu"
              >
                <p className="text-xs font-bold text-left px-2 font-[cabin] mb-2">
                  Menú
                </p>
                {Links}
              </CustomDropdown>
            </DropdownParent>
          </nav>
          <Buscador
            locations={ubicaciones}
            scrolled={scrolled}
            setScrolled={setScrolledSync}
            isWaiting={isWaiting}
          />
        </>
      )}
    </motion.header>
  );
};
