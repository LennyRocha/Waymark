import {
  useSearchParams,
  useParams,
} from "react-router-dom";
import FiltrosPropiedades from "./types/FiltrosPropiedad";
import usePropiedades from "./hooks/usePropiedades";
import { AnimatePresence, motion } from "framer-motion";
import {
  useState,
  useEffect,
  useRef,
} from "react";
import useWatchResize from "../../utils/useWatchResize";
import DropdownParent from "../../components/DropdownParent";
import Modal from "../../layout/Modal";
import useAmenidades from "./hooks/useAmenidades";
import { Menu } from "lucide-react";
import Buscador from "./components/Buscador";
import CustomDropdown from "../../components/CustomDropdown";
import useUbicaciones from "./hooks/useUbicaciones";
import Footer from "../../layout/Footer";
import NavigationList from "./components/NavigationList";
import PropiedadCard from "./components/PropiedadCard";

//https://www.airbnb.mx/s/Acapulco/homes?refinement_paths%5B%5D=%2Fhomes&place_id=ChIJyVDOroVXyoUR46SQivfYAZg&date_picker_type=calendar&checkin=2026-04-12&checkout=2026-04-13&adults=3&pets=1&search_type=AUTOSUGGEST

//https://www.airbnb.mx/s/Temixco--Mor./homes?refinement_paths%5B%5D=%2Fhomes&place_id=ChIJGzfg9SDZzYURLe2rgyC-ac4&location_bb=QZcVOMLGarxBlnRswsaG8A%3D%3D&acp_id=d133f826-c204-4791-87f0-1bffa5b4a387&date_picker_type=calendar&checkin=2026-03-30&checkout=2026-04-22&adults=1&children=1&infants=1&pets=2&search_type=autocomplete_click

//https://www.airbnb.mx/s/homes?refinement_paths%5B%5D=%2Fhomes&location_search=NEARBY&source=structured_search_input_header&search_type=user_map_move&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2026-04-01&monthly_length=3&monthly_end_date=2026-07-01&search_mode=regular_search&price_filter_input_type=2&channel=EXPLORE&ne_lat=19.395046106013783&ne_lng=-98.86464033990347&sw_lat=18.657099025326463&sw_lng=-99.5837533838374&zoom=10.180119851874752&zoom_level=10.180119851874752&search_by_map=true&price_filter_num_nights=5
export default function FiltrosPage() {
  const [searchParams] = useSearchParams();

  // Leer de parámetros de búsqueda
  const { ciudad_pais } = useParams();
  const checkIn = searchParams.get("checkin");
  const checkOut = searchParams.get("checkout");
  const homies = searchParams.get("adults");
  const pets = searchParams.get("allow_pets");
  const kids = searchParams.get("allow_children");

  const filtros: FiltrosPropiedades = {
    //Campos de ruta
    ciudad: ciudad_pais?.split("-")[0] || undefined,
    max_huespedes: homies
      ? Number.parseInt(homies)
      : undefined,
    regla_ninos: kids ? kids === "true" : undefined,
    regla_mascotas: pets ? pets === "true" : undefined,
    // Campos que se obtienen de un modal
    precio_min: 0,
    precio_max: 799999.99,
    habitaciones: undefined,
    banos: undefined,
    camas: undefined,
    tipo_id: undefined,
    amenidades: undefined,
    // Paginación
    page: undefined,
    size: undefined,
    // Fechas
    entrada: parseFecha(checkIn),
    salida: parseFecha(checkOut),
  };

  function setFiltro(key: "string", value: any) {
    searchParams.set(key, value);
  }

  const propiedadesQuery = usePropiedades(filtros);
  console.log(propiedadesQuery.data);
  const [open, setOpen] = useState(false);
  function toggle(val: boolean) {
    setOpen(val);
  }

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
        <Header toggle={toggle} value={open} />
      </AnimatePresence>
      <section className="flex w-full flex-col gap-8 px-[3rem] h-full flex-1">
        <h5 className="text-left">
          Mas de {propiedadesQuery.data?.count} alojamientos
        </h5>
        <div className="grid md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6 grid-cols-1 min-[550px]:grid-cols-2 max-xl:gap-4">
          {propiedadesQuery.data?.results.length === 0 ? (
            <p className="col-span-3 text-center text-text-secondary">
              No se encontraron alojamientos con esos
              filtros
            </p>
          ) : (
            propiedadesQuery.data?.results.map((card) => (
              <PropiedadCard
                key={card.propiedad_id}
                propiedad={card}
                fullWidth={true}
              />
            ))
          )}
        </div>
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
  filters?: FiltrosPropiedades;
};

const Header = ({
  toggle,
  value,
  filters,
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

  useEffect(() => {
    if (!value) setScrolled(true);
  }, [value]);
  return (
    <div className="relative z-[9999]">
      <motion.header className="hidden md:flex flex-col items-center w-full bg-gradient-to-b from-white via-white to-gray-50 to-80% p-[1.25rem] border-b border-border">
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
        />
      </motion.header>
    </div>
  );
};
