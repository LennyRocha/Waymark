// @ts-nocheck
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "../../layout/Modal";
import useAmenidades from "./hooks/useAmenidades";
import Icono from "../../utils/Icono";
import usePropiedad from "./hooks/useGetPropiedad";
import CustomLoader from "../../layout/CustomLoader";
import ErrorViewComponent from "../../layout/ErrorViewComponent";
import CustomButton from "../../components/CustomButton";
import useSetPageTitle from "../../utils/setPageTitle";
import {
  Dot,
  MapPinHouse,
  Menu,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Calendar from "react-calendar";
import Map, { Marker } from "react-map-gl/mapbox";
import "react-calendar/dist/Calendar.css";
import { AnimatePresence, motion } from "framer-motion";
import CustomLink from "../../components/CustomLink";
import Buscador from "./components/Buscador";
import CustomDropdown from "../../components/CustomDropdown";
import DropdownParent from "../../components/DropdownParent";
import useUbicaciones from "./hooks/useUbicaciones";
import { useAuth } from "../../context/AuthContext";
import useWatchResize from "../../utils/useWatchResize";
import Footer from "../../layout/Footer";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAX_LENGTH = 500;

export default function PropiedadPage() {
  const navigate = useNavigate();
  const amenidades = useAmenidades();
  const { idSlug } = useParams();
  const params = idSlug.split("-");
  const id = params[0];
  const slug = params
    .filter((p, idx) => idx !== 0)
    .join("-");
  console.log(id, " ", slug);
  const [show, setShow] = useState(false);
  const propiedad = usePropiedad(id);
  useSetPageTitle(
    propiedad.data
      ? `${propiedad.data?.titulo} - Waymark`
      : "Waymark - Encuentra el lugar perfecto para tu próxima aventura",
  );
  const [expanded, setExpanded] = useState(false);

  const [open, setOpen] = useState(false);

  function toggle(val) {
    console.log(val);
    setOpen(val);
  }

  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];

  const nextThreeDays = new Date();
  nextThreeDays.setHours(0);
  nextThreeDays.setMinutes(0);
  nextThreeDays.setHours(nextThreeDays.getHours() + 72);

  const [range, setRange] = useState<Value>([
    new Date(),
    nextThreeDays,
  ]);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 2);

  const [huespedes, setHuespedes] = useState(1);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (propiedad.isInitialLoading || propiedad.isLoading)
    return (
      <main className="w-[100dvw] h-[100dvh] flex items-center justify-center">
        <CustomLoader />
      </main>
    );
  if (propiedad.isError)
    return (
      <main className="w-[100dvw] h-[100dvh]">
        <ErrorViewComponent
          error={propiedad.error}
          retryFunction={() => propiedad.refetch()}
        />
      </main>
    );
  if (propiedad.data?.slug !== slug) {
    navigate("/404", { replace: true });
  }
  const prop = propiedad.data;
  const testDesc =
    "DEPARTAMENTO TOTALMENTE REMODELADO A TODO LUJO JUNTO AL MAR, para poder tener el mar a tus pies con toda la comodidad. Y contamos con acceso privado a la playa y a las albercas. El restaurante se encuentra a lado de la alberca por lo que sin salir podrás disfrutar de la magia del puerto,  muy bien ubicado cerca del Baby' O. Se cuenta a una cuadra con un estacionamiento publico, aunque es muy seguro dejar tu coche fuera del condominio. También hay  restaurant. \n La recepción está afectada por otis...";
  console.log(testDesc.length);

  const text = expanded
    ? prop.descripcion
    : prop.descripcion.substring(0, MAX_LENGTH);

  const shouldShowButton =
    prop.descripcion.length > MAX_LENGTH;

  const huespedeses: Option[] = Array.from(
    { length: prop.max_huespedes },
    (_, i) => ({
      label:
        i === 0
          ? `${i + 1} huésped`
          : `${i + 1} huéspedes `,
      value: i + 1,
    }),
  );

  return (
    <>
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
      <main className="w-full p-[1rem] mx-auto max-w-[1200px] flex flex-col items-start justify-start gap-4">
        <h3 className="md:text-left font-[montserrat]">
          {prop?.titulo}
        </h3>
        <div className="grid grid-cols-4 gap-2 md:h-[450px]">
          <div className="overflow-hidden col-span-2 row-span-2 rounded-l-xl hover:brightness-95 cursor-pointer">
            <img
              className="w-full h-full object-cover"
              src={prop?.imagenes[0]?.url}
              alt={`Imagen #${prop?.imagenes[0]?.orden}`}
            />
          </div>
          <div className=" text-white hover:brightness-95 cursor-pointer overflow-hidden ">
            <img
              className="w-full h-full object-cover"
              src={prop?.imagenes[1]?.url}
              alt={`Imagen #${prop?.imagenes[1]?.orden}`}
            />
          </div>
          <div className=" text-white hover:brightness-95 cursor-pointer overflow-hidden rounded-tr-xl">
            <img
              className="w-full h-full object-cover"
              src={prop?.imagenes[2]?.url}
              alt={`Imagen #${prop?.imagenes[2]?.orden}`}
            />
          </div>
          <div className=" hover:brightness-95 cursor-pointer overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={prop?.imagenes[3]?.url}
              alt={`Imagen #${prop?.imagenes[3]?.orden}`}
            />
          </div>
          <div className="hover:brightness-95 cursor-pointer overflow-hidden rounded-br-xl relative">
            <img
              className="w-full h-full object-cover"
              src={prop?.imagenes[4]?.url}
              alt={`Imagen #${prop?.imagenes[4]?.orden}`}
            />
            <button className="absolute bottom-2  bg-white rounded-xl p-2 w-full ">
              Ver todas las fotos
            </button>
          </div>
        </div>
        <section className="w-full flex max-md:flex-col items-start justify-start gap-0  md:gap-4  lg:gap-8">
          <article className="flex-1 max-md:w-full flex flex-col items-start justify-start gap-4 overflow-hidden">
            <h4>
              {" "}
              {prop?.tipo.tipo.charAt(0).toUpperCase() +
                prop?.tipo.tipo.slice(1)}{" "}
              en {prop?.ciudad}, {prop?.region}
            </h4>
            <p className="text-text-secondary flex gap-1 items-center">
              {prop.camas}{" "}
              {prop.camas === 1 ? "cama" : "camas"}{" "}
              <Dot size={14} /> {prop.banos}{" "}
              {prop.banos === 1 ? "baño" : "baños"}
            </p>
            <div className="max-h-[150px] h-auto">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="flex-0 font-[montserrat]  text-[14px]/[20px] text-text-primary text-left tracking-normal truncate w-full overflow-hidden whitespace-pre-line">
                      {children}
                    </p>
                  ),
                }}
              >
                {text +
                  (!expanded && shouldShowButton
                    ? "..."
                    : "")}
              </ReactMarkdown>
            </div>

            {shouldShowButton && (
              <CustomButton
                variant="secondary"
                onClick={() => setShow(!show)}
              >
                {expanded ? "Mostrar menos" : "Mostrar más"}
              </CustomButton>
            )}

            <Divider />

            <Divider />

            <h3>Lo que ofrece este lugar</h3>

            <div className="flex w-full gap 2 items-start justify-center max-md:flex-col">
              <div className="flex flex-col flex-1 gap-6">
                {prop.amenidades.slice(0, 3).map((a) => {
                  return (
                    <div
                      key={a.amenidad_id}
                      className="flex flex-row items-center jutify-start gap-2"
                    >
                      <Icono
                        name={a.icono_nombre}
                        size={36}
                        className="shrink-0"
                      />
                      <h6 className="text-left">
                        {a.nombre}
                      </h6>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col flex-1 gap-6">
                {prop.amenidades.slice(3, 6).map((a) => {
                  return (
                    <div
                      key={a.amenidad_id}
                      className="flex flex-row items-center jutify-start gap-2"
                    >
                      <Icono
                        name={a.icono_nombre}
                        size={36}
                      />
                      <h6 className="text-left">
                        {a.nombre}
                      </h6>
                    </div>
                  );
                })}
              </div>
            </div>

            <CustomButton variant="tertiary">
              Ver todas las amenidades
            </CustomButton>

            <Divider />

            <h1>Texto largo</h1>
            <h1>Texto largo</h1>
            <h1>Texto largo</h1>
            <h1>Texto largo</h1>
            <h1>Texto largo</h1>
            <h1>Texto largo</h1>
            <h1>Texto largo</h1>
            <h1>Texto largo</h1>
            <h1>Texto largo</h1>
            <h1>Texto largo</h1>
            <h1>Texto largo</h1>

            {/*Aquí irá el calendario */}
            <Calendar
              selectRange
              value={range}
              onChange={(value) => setRange(value)}
              minDate={today}
              maxDate={maxDate}
              showDoubleView
              next2Label={null}
              prev2Label={null}
              locale="es-MX"
              minDetail="month"
              maxDetail="month"
            />
          </article>
          <article className="max-md:hidden p-6 top-4 sticky  max-md:hidden  md:w-[275px] lg:w-[400px] shadow-md/30 bg-white rounded-xl gap-4 flex flex-col items-start justify-start">
            <h5 className="text-left">
              ${prop?.precio_noche} MXN por noche
            </h5>
            <div className="w-full border-2 rounded-xl">
              <div className="flex w-full">
                <div className="w-full border-r-1 p-2 flex flex-col gap-0 items-start justify-center">
                  <label
                    htmlFor="input_out"
                    className={`text-sm font-semibold`}
                  >
                    Llegada
                  </label>
                  <input
                    id="input_in"
                    type="text"
                    readOnly
                    className=" w-full outline-none"
                    value={formatDate(range[0])}
                    placeholder="Entrada"
                  />
                </div>

                <div className="w-full border-r-1 p-2 flex flex-col gap-0 items-start justify-center">
                  <label
                    htmlFor="input_in"
                    className={`text-sm font-semibold`}
                  >
                    Salida
                  </label>
                  <input
                    id="input_out"
                    type="text"
                    readOnly
                    className="w-full outline-none"
                    value={formatDate(range[1])}
                    placeholder="Salida"
                  />
                </div>
              </div>
              <Select
                options={huespedeses}
                value={huespedes}
                onChange={(val: number) =>
                  setHuespedes(val)
                }
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <h6>Total por x noches</h6>
              <p>
                $
                {Math.round(prop?.precio_noche * 5 * 100) /
                  100}{" "}
                MXN
              </p>
            </div>
            <CustomButton size="large" fullWidth>
              Reservar
            </CustomButton>
            <p className="text-text-secondary text-center mx-auto">
              El pago se realiza en efectivo
            </p>
          </article>
        </section>
        <h4>Dónde vas a estar</h4>
        <p>
          {prop.ciudad} - {prop.region} - {prop.pais}
        </p>
        <Map
          longitude={prop.coordenadas.lng}
          latitude={prop.coordenadas.lat}
          zoom={16}
          onMove={() => {}}
          style={{
            width: "100%",
            minHeight: 350,
            height: "auto",
            borderRadius: 8,
            marginRight: "auto",
            marginLeft: "auto",
          }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={() => {}}
          cursor="crosshairs"
        >
          <Marker
            longitude={prop.coordenadas?.lng ?? 0}
            latitude={prop.coordenadas?.lat ?? 0}
            anchor="bottom"
          >
            <MapPinHouse
              color="#fff"
              fill="var(--color-primary-500)"
              size={64}
              strokeWidth={1}
            />
          </Marker>
        </Map>
        <Modal
          open={show}
          close={() => setShow(false)}
          width={"min(768px, 100%)"}
        >
          <Modal.Body>
            <h3>Acerca del espacio</h3>
            <p className="text-justify mt-4">
              {prop.descripcion}
            </p>
          </Modal.Body>
        </Modal>
        <div className="w-full md:hidden fixed bottom-0 left-0 bg-white p-4">
          <h3 className="text-left">
            ${prop?.precio_noche} MXN por noche
          </h3>
          <p className="text-text-secondary text-center text-left">
            El pago se realiza en efectivo
          </p>
          <CustomButton fullWidth>Reservar</CustomButton>
        </div>
      </main>
      <Footer />
    </>
  );
}

const Divider = () => (
  <div className="h-px w-full bg-gray-200 mt-2" />
);

type HeaderProps = {
  toggle: (val: boolean) => void;
  value: boolean;
};

const Header = ({ toggle, value }: HeaderProps) => {
  const navigate = useNavigate();

  const ubicaciones = useUbicaciones();
  const isLoading =
    ubicaciones.isInitialLoading || ubicaciones.isLoading;

  const auth = useAuth();

  const [scrolled, setScrolled] = useState(true);
  const [show, setShow] = useState(false);

  const buttonRef = useRef(null);

  const showLink = useWatchResize({
    pixeles: 1125,
    metrica: "min",
  });
  const showBrand = useWatchResize({
    pixeles: 975,
    metrica: "min",
  });

  function setScrolledSync(val) {
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
            {showLink &&
              (!auth?.isAuthenticated ||
                (auth.userRole !== "anfitrion" &&
                  auth.userRole !== "ambos")) && (
                <button
                  className="font-bold"
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
              {!auth?.isAuthenticated ||
              (auth.userRole !== "anfitrion" &&
                auth.userRole !== "ambos") ? (
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
              ) : (
                <ul>
                  <li className="py-4 px-2 text-left text-nowrap">
                    <CustomLink to="/wishlists">
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
              )}
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

type SelectProps = {
  options: Option[];
  value?: string | number | null;
  onChange?: (value: string | number) => void;
  placeholder?: string;
};

type Option = {
  label: string;
  value: string | number;
};

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  ...props
}) => {
  const [open, setOpen] = React.useState(false);

  // Buscar opción seleccionada desde value
  const selected = React.useMemo(() => {
    return options.find((o) => o.value === value) || null;
  }, [value, options]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const [focused, setFocused] = useState(false);

  return (
    <div ref={containerRef} className="relative w-full">
      <label
        htmlFor="guest_button"
        className={`
            text-sm font-semibold
            absolute
            top-2 left-2
            cursor-pointer
          `}
      >
        Huéspedes
      </label>

      {/* Trigger */}

      <button
        id="guest_button"
        type="button"
        onClick={() => setOpen(!open)}
        className={` w-full p-2 pr-10 text-left border-t-2 rounded-xl pt-6 transition ${!focused && "rounded-t-none"}  outline-none`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {selected?.label || placeholder}

        <ChevronDown
          className={`
            absolute
            right-2
            bottom-2
            transition
            ${open && "rotate-180"}
          `}
        />
      </button>

      {/* Options */}

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="
              absolute
              mt-2
              w-full
              bg-white
              border
              border-border
              rounded-xl
              shadow-lg
              z-50
              max-h-60
              overflow-y-auto
              scroll-mini is_y
            "
          >
            {options.map((option) => (
              <motion.li
                key={option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
                className="
                  px-4
                  py-3
                  hover:bg-gray-100
                  cursor-pointer
                  transition
                  text-left
                "
              >
                {option.label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
