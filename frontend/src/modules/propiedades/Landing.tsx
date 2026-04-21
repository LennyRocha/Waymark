// @ts-nocheck
/* eslint-disable no-unused-vars */
import React, {
  useState,
  useRef,
  useEffect,
} from "react";
import PropiedadCard from "./components/PropiedadCard";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GalleryHorizontal,
  Menu,
} from "lucide-react";
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
import { CardsResponse } from "./types/Card";
import NavigationList from "./components/NavigationList";

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

  const scrollLeft = (
    ref: React.RefObject<HTMLSectionElement>,
  ) => {
    ref.current?.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  };

  const scrollRight = (
    ref: React.RefObject<HTMLSectionElement>,
  ) => {
    ref.current?.scrollTo({
      left: ref.current.scrollWidth,
      behavior: "smooth",
    });
  };
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
        <main className="content min-h-[100dvh]">
          {landing.data?.favoritos.length !== 0 && (
            <LandingRow
              item={{} as CardsResponse}
              scrollLeft={scrollLeft}
              scrollRight={scrollRight}
              showPopular={true}
              list={landing.data.favoritos}
            />
          )}
          {landing.data?.ciudades.map((item) => {
            return (
              <LandingRow
                key={item.ciudad}
                item={item}
                scrollLeft={scrollLeft}
                scrollRight={scrollRight}
                showPopular={false}
              />
            );
          })}
        </main>
      )}
      <Footer />
    </div>
  );
}

type RowProps = {
  item: CardsResponse;
  scrollLeft: (
    ref: React.RefObject<HTMLSectionElement>,
  ) => void;
  scrollRight: (
    ref: React.RefObject<HTMLSectionElement>,
  ) => void;
  showPopular?: boolean;
  list?: Card[];
};

const LandingRow = ({
  item,
  scrollLeft,
  scrollRight,
  showPopular = false,
  list = [],
}: RowProps) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLSectionElement>(null);
  const hasOverflow =
    scrollRef.current?.scrollWidth >
    scrollRef.current?.clientWidth;
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = () => {
    const el = scrollRef.current;
    if (!el) return;

    const atStart = el.scrollLeft <= 0;

    const atEnd =
      el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    setIsAtStart(atStart);
    setIsAtEnd(atEnd);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollPosition();

    el.addEventListener("scroll", checkScrollPosition);

    return () =>
      el.removeEventListener("scroll", checkScrollPosition);
  }, []);
  return (
    <div>
      <div
        className={`flex gap-2 w-auto items-center ${hasOverflow ? "justify-between" : "justify-start"}  mb-2 mt-[1rem] `}
      >
        <div className="flex gap-2 w-auto items-center justify-center">
          <h4 className="w-full text-left">
            {showPopular
              ? "Alojamientos populares"
              : `Alojamientos en ${item.ciudad}`}
          </h4>
          <ArrowRight
            strokeWidth={2.5}
            onClick={() =>
              navigate(
                showPopular
                  ? `/s/homes`
                  : `/s/${item.ciudad}/homes`,
              )
            }
            size={32}
            className="rounded-full bg-border shrink-0 px-2 py-1 cursor-pointer  hover:bg-primary-500 hover:text-white transition-colors"
          />
        </div>
        {hasOverflow && (
          <div className="flex gap-2 w-auto items-center justify-center">
            <button
              disabled={isAtStart}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="start"
            >
              <ChevronLeft
                onClick={() => scrollLeft(scrollRef)}
                strokeWidth={2.5}
                size={28}
                className="rounded-full bg-border shrink-0 p-2"
              />
            </button>
            <button
              disabled={isAtEnd}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="end"
            >
              <ChevronRight
                onClick={() => scrollRight(scrollRef)}
                strokeWidth={2.5}
                size={28}
                className="rounded-full bg-border shrink-0 p-2"
              />
            </button>
          </div>
        )}
      </div>
      <section
        ref={scrollRef}
        className="inline-flex w-full overflow-x-auto overflow-y-hidden gap-[.75rem] md:gap-3 scroll-smooth scroll-no mb-5"
      >
        {showPopular ? (
          <>
            {list?.map((item) => {
              return (
                <PropiedadCard
                  key={item.propiedad_id}
                  propiedad={item}
                />
              );
            })}
            <VerMasCard direccion={"/s/homes"} />
          </>
        ) : (
          item.cards.length !== 0 && (
            <>
              {item.cards.map((card) => {
                return (
                  <PropiedadCard
                    key={card.propiedad_id}
                    propiedad={card}
                  />
                );
              })}
              <VerMasCard
                direccion={
                  showPopular
                    ? `/s/homes`
                    : `/s/${item.ciudad}/homes`
                }
              />
            </>
          )
        )}
      </section>
    </div>
  );
};

type VerMasCardProps = {
  direccion: string;
};

export const VerMasCard = ({
  direccion = "",
}: VerMasCardProps) => {
  return (
    <div className=" w-[clamp(138px,13.5%,250px)] shrink-0   relative flex flex-col items-start justify-start gap-2">
      <div className="rounded-3xl w-full h-auto max-h-[238px] min-h-[138px] aspect-square flex flex-col items-center justify-center shadow-xl rounded-2xl w-full h-50">
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
                <NavigationList />
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
