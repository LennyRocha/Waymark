import {
  useSearchParams,
  useParams,
} from "react-router-dom";
import FiltrosPropiedades, {
  FiltrosPropiedadesKeys,
} from "./types/FiltrosPropiedad";
import usePropiedades from "./hooks/usePropiedades";
import { AnimatePresence, motion } from "framer-motion";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import useWatchResize from "../../utils/useWatchResize";
import DropdownParent from "../../components/DropdownParent";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  SlidersHorizontal,
} from "lucide-react";
import Buscador from "./components/Buscador";
import CustomDropdown from "../../components/CustomDropdown";
import useUbicaciones from "./hooks/useUbicaciones";
import Footer from "../../layout/Footer";
import NavigationList from "./components/NavigationList";
import PropiedadCard from "./components/PropiedadCard";
import BuscadorBoton from "./components/BuscadorBoton";
import EmptyListComponent from "../../layout/EmptyListComponent";
import CustomLoader from "../../layout/CustomLoader";
import ErrorViewComponent from "../../layout/ErrorViewComponent";

export default function FiltrosPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer de parámetros de búsqueda
  const { ciudad_pais } = useParams();
  const checkIn = searchParams.get("checkin");
  const checkOut = searchParams.get("checkout");
  const homies = searchParams.get("adults");
  const pets = searchParams.get("allow_pets");
  const kids = searchParams.get("allow_children");

  const pageParam = searchParams.get("page");

  const boolKids = kids === "true" ? 1 : 0;
  const boolPets = pets === "true" ? 1 : 0;

  const filtros: FiltrosPropiedades = {
    //Campos de ruta
    ciudad: ciudad_pais?.split("-")[0] || undefined,
    max_huespedes: homies
      ? Number.parseInt(homies)
      : undefined,
    regla_ninos: kids ? boolKids : undefined,
    regla_mascotas: pets ? boolPets : undefined,
    // Campos que se obtienen de un modal
    precio_min: 0,
    precio_max: 799999.99,
    habitaciones: undefined,
    banos: undefined,
    camas: undefined,
    tipo_id: undefined,
    amenidades: undefined,
    // Paginación
    page: pageParam ? Number(pageParam) : 1,
    size: undefined,
    // Fechas
    entrada: parseFecha(checkIn),
    salida: parseFecha(checkOut),
  };

  function setFiltro(
    key: FiltrosPropiedadesKeys,
    value: any,
  ) {
    const newParams = new URLSearchParams(searchParams);

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }

    setSearchParams(newParams);
  }

  function setFiltros(values: Record<string, any>) {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(values).forEach(([key, value]) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams);
  }

  const propiedadesQuery = usePropiedades(filtros);

  const [open, setOpen] = useState(false);
  function toggle(val: boolean) {
    setOpen(val);
  }

  const currPage = useMemo(() => {
    return propiedadesQuery.data?.page ?? 1;
  }, [propiedadesQuery.data?.page]);

  if (
    propiedadesQuery.isLoading ||
    propiedadesQuery.isInitialLoading
  )
    return (
      <main className="w-[100dvw] h-[100dvh] flex items-center justify-center">
        <CustomLoader />
      </main>
    );
  if (propiedadesQuery.isError)
    return (
      <main className="w-[100dvw] h-[100dvh]">
        <ErrorViewComponent
          error={propiedadesQuery.error}
          retryFunction={() => {
            propiedadesQuery.refetch();
          }}
        />
      </main>
    );

  return (
    <main className="relative flex flex-col gap-4 min-h-[100dvh]">
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-xs w-full overflow-x-hidden "
            onClick={() => toggle(false)}
          />
        )}
        <Header
          toggle={toggle}
          value={open}
          filters={filtros}
          setFiltro={setFiltro}
          setFiltros={setFiltros}
        />
      </AnimatePresence>
      <section className="flex w-full flex-col gap-8 px-[3rem] h-full flex-1">
        {propiedadesQuery.data?.results.length === 0 ? (
          <div className="flex-1 h-full flex items-center justify-center">
            <EmptyListComponent
              titulo="Sin resultados"
              mensaje="No se encontraron alojamientos que coincidan con tus criterios de búsqueda."
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between max-md:justify-center max-md:flex-col-reverse gap-4">
              <h5 className="text-left">
                {propiedadesQuery.data?.count} alojamientos
                disponibles
              </h5>
              <button className="flex gap-2 items-center justify-center py-2 px-4 rounded-full border border-text-secondary text-text-secondary hover:bg-border max-md:w-full">
                <SlidersHorizontal
                  className="shrink-0"
                  size={18}
                />{" "}
                Filtros
              </button>
            </div>
            <div className="grid md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6 grid-cols-1 min-[550px]:grid-cols-2 max-xl:gap-4">
              {propiedadesQuery.data?.results.map(
                (card) => (
                  <PropiedadCard
                    key={card.propiedad_id}
                    propiedad={card}
                    fullWidth={true}
                  />
                ),
              )}
            </div>
          </>
        )}
        <article className="w-full flex items-center justify-center jusfitify-self-end text-sm text-text-secondary gap-2">
          <button
            disabled={
              currPage === 1 ||
              propiedadesQuery.data?.previous === null
            }
            className="p-2 rounded-md border-border border-2 hover:bg-border disabled:cursor-not-allowed disabled:bg-transparent disabled:border-border/50 disabled:text-border"
            onClick={() => setFiltro("page", currPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          Página {currPage} de{" "}
          {propiedadesQuery.data?.total_pages}
          <button
            disabled={
              propiedadesQuery.data?.total_pages ===
                currPage ||
              propiedadesQuery.data?.next === null
            }
            className="p-2 rounded-md border-border border-2 hover:bg-border disabled:cursor-not-allowed disabled:bg-transparent disabled:border-border/50 disabled:text-border"
            onClick={() => setFiltro("page", currPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </article>
      </section>
      <Footer />
    </main>
  );
}

function parseFecha(
  fecha: string | null,
): string | undefined {
  if (!fecha) return undefined;
  const [day, month, year] = fecha.split("/").map(Number);
  if (!day || !month || !year) return undefined;
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

type HeaderProps = {
  toggle: (val: boolean) => void;
  value: boolean;
  filters: FiltrosPropiedades;
  setFiltro?: (
    key: FiltrosPropiedadesKeys,
    value: any,
  ) => void;
  setFiltros: (values: Record<string, any>) => void;
};

const Header = ({
  toggle,
  value,
  filters,
  setFiltro,
  setFiltros,
}: HeaderProps) => {
  const ubicaciones = useUbicaciones();
  const isLoading =
    ubicaciones.isInitialLoading || ubicaciones.isLoading;

  const [scrolled, setScrolled] = useState(true);
  const [show, setShow] = useState(false);

  const buttonRef = useRef(null);

  const showBrand = useWatchResize({
    pixeles: 975,
    metrica: "min",
  });

  function setScrolledSync(val: boolean) {
    setScrolled(val);
    toggle(!val);
  }

  const isSmall = useWatchResize({
    pixeles: 768,
    metrica: "max",
  });

  useEffect(() => {
    if (!value) setScrolled(true);
  }, [value]);

  const buscadorSetFiltroProps = setFiltro
    ? { setFiltro }
    : {};

  return (
    <div className="relative z-[9999]">
      <motion.header className="md:flex flex-col items-center w-full bg-gradient-to-b from-white via-white to-gray-50 to-80% p-[1.25rem] border-b border-border">
        {isSmall ? (
          <BuscadorBoton
            locations={ubicaciones.data ?? []}
            isWaiting={isLoading}
            filtros={filters}
            setFiltros={setFiltros}
            {...buscadorSetFiltroProps}
          />
        ) : (
          <>
            {" "}
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
                  width={"250px"}
                  layoutId="drop_menu"
                >
                  <p className="text-xs font-bold text-left px-2 font-[cabin] mb-2">
                    Menú
                  </p>
                  <div className="w-full bg-border h-[1px]"></div>
                  <NavigationList />
                </CustomDropdown>
              </DropdownParent>
            </nav>
            <Buscador
              locations={ubicaciones.data ?? []}
              scrolled={scrolled}
              setScrolled={setScrolledSync}
              isWaiting={isLoading}
              filtros={filters}
              {...buscadorSetFiltroProps}
              toggle={toggle}
            />
          </>
        )}
      </motion.header>
    </div>
  );
};
