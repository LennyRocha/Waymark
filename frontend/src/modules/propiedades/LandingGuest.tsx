// @ts-nocheck
/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import PropiedadCard from "./components/PropiedadCard";
import { GalleryHorizontal } from "lucide-react";
import {
  useScroll,
  useMotionValueEvent,
  motion,
} from "framer-motion";
import CustomLink from "../../components/CustomLink";
import Buscador from "./components/Buscador";
import BuscadorBoton from "./components/BuscadorBoton";
import Footer from "../../layout/Footer";
import useSetPageTitle from "../../utils/setPageTitle";
import useUbicaciones from "./hooks/useUbicaciones";
import useLanding from "./hooks/useLanding";
import CustomLoader from "../../layout/CustomLoader";
import ErrorViewComponent from "../../layout/ErrorViewComponent";
import EmptyListComponent from "../../layout/EmptyListComponent";
import { Ubicacion } from "./types/Propiedad";

export default function LandingGuest() {
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
              <h4 className="w-full text-left  mb-2">
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
const VerMasCard = ({
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
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  const scrolledRef = useRef(false);
  const manualOverride = useRef(false);

  const [isSmall, setIsSmall] = useState(
    window.innerWidth <= 745,
  );

  function updateWidth() {
    setIsSmall(window.innerWidth <= 745);
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
    <motion.header className="sticky top-0 md:top-1/16 z-10 flex flex-col items-center w-full  md:bg-transparent p-[1.25rem] bg-white border-b border-border md:border-none">
      {isSmall ? (
        <BuscadorBoton isWaiting={isWaiting} />
      ) : (
        <Buscador
          locations={ubicaciones}
          scrolled={scrolled}
          setScrolled={setScrolledSync}
          isWaiting={isWaiting}
        />
      )}
    </motion.header>
  );
};
