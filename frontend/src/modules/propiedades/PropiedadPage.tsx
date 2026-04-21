// @ts-nocheck
/* eslint-disable react-hooks/set-state-in-effect */
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "../../layout/Modal";
import useAmenidades from "./hooks/useAmenidades";
import Icono from "../../utils/Icono";
import usePropiedad from "./hooks/useGetPropiedad";
import CustomLoader from "../../layout/CustomLoader";
import ErrorViewComponent from "../../layout/ErrorViewComponent";
import CustomButton from "../../components/CustomButton";
import useSetPageTitle from "../../utils/setPageTitle";
import FavoritoButton from "./components/FavoritoButton";
import {
  Dot,
  MapPinHouse,
  Menu,
  ChevronDown,
  LayoutGrid,
  DoorOpen,
  Cable,
  PartyPopper,
  Cigarette,
  Dog,
  Baby,
  Star,
  X,
  ArrowLeft,
  Share,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Calendar from "react-calendar";
import Map, { Marker } from "react-map-gl/mapbox";
import "react-calendar/dist/Calendar.css";
import {
  AnimatePresence,
  motion,
  useTransform,
  useScroll,
} from "framer-motion";
import CustomLink from "../../components/CustomLink";
import toast from "react-hot-toast";
import Buscador from "./components/Buscador";
import CustomDropdown from "../../components/CustomDropdown";
import DropdownParent from "../../components/DropdownParent";
import useUbicaciones from "./hooks/useUbicaciones";
import {
  AuthContextValue,
  useAuth,
} from "../../context/AuthContext";
import useWatchResize from "../../utils/useWatchResize";
import Footer from "../../layout/Footer";
import useGetHost from "./hooks/useGetHost";
import Avatar from "../../components/Avatar";
import Amenidad from "./types/Amenidad";
import useCard from "./hooks/useCard";

import cup from "../../assets/trofeo.png";
import leftwing from "../../assets/alarde_izq.png";
import rightwing from "../../assets/alarde_der.png";
import NavigationList from "./components/NavigationList";
import usePromedio from "../calificaciones/hooks/usePromedio";
import useCalificaciones from "../calificaciones/hooks/useCalificaciones";

import Imagen from "./types/Imagen";
import Card from "./types/Card";
import useReservaMutation from "../reservas/hooks/useReservaMutation";
import { useQueryClient } from "@tanstack/react-query";
import { getAxiosErrorMessage } from "../../utils/getAxiosErrorMessage";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAX_LENGTH = 500;

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const MotionShare = motion.create(Share);

export default function PropiedadPage() {
  const navigate = useNavigate();
  const { idSlug } = useParams();
  const params = idSlug.split("-");
  const id = params[0];
  const slug = params
    .filter((p, idx) => idx !== 0)
    .join("-");

  const amenidades = useAmenidades();
  const propiedad = usePropiedad(id);
  const hostQuery = useGetHost(
    propiedad.data?.anfitrion_id,
  );
  const cardQuery = useCard(id);
  const promedioQuery = usePromedio(id);
  const calificacionesQuery = useCalificaciones(id);

  const isBestRated =
    (promedioQuery.data?.promedio ?? 0) >= 4.5 &&
    (promedioQuery.data?.total ?? 0) >= 3;

  useSetPageTitle(getPropiedadPageTitle(propiedad.data));
  useRedirectOnSlugMismatch(
    propiedad.data?.slug,
    slug,
    navigate,
  );

  const [open, setOpen] = useState(false);
  const [openMore, setOpenMore] = useState(false);
  const [openReglas, setOpenReglas] = useState(false);
  const [openAmenidades, setOpenAmenidades] =
    useState(false);

  function toggle(val) {
    setOpen(val);
  }

  const nextThreeDays = new Date();
  transformarFecha(nextThreeDays);

  const [range, setRange] = useState<Value>([
    new Date(),
    nextThreeDays,
  ]);

  const [huespedes, setHuespedes] = useState(1);

  const [noches, setNoches] = useState(1);
  const auth = useAuth();

  useEffect(() => {
    setNoches(calculateNoches(range));
  }, [range]);

  const fechaUnion = parsearFecha(
    hostQuery.data?.created_at || new Date(),
  );

  function refetchAll() {
    propiedad.refetch();
    amenidades.refetch();
    hostQuery.refetch();
    cardQuery.refetch();
    promedioQuery.refetch();
  }

  const sectionRef = useRef(null);

  const fotosRef = useRef(null);
  const amenidadesRef = useRef(null);
  const resenasRef = useRef(null);
  const ubicacionRef = useRef(null);

  const listRef = [
    fotosRef,
    amenidadesRef,
    ubicacionRef,
    resenasRef,
  ];

  const isPageLoading = isAnyQueryLoading([
    propiedad,
    amenidades,
    hostQuery,
    cardQuery,
    promedioQuery,
    calificacionesQuery,
  ]);
  const hasPageError = hasAnyQueryError([
    propiedad,
    hostQuery,
  ]);

  const queryClient = useQueryClient();

  const reserva = useReservaMutation({
    onSuccess: () => {
      toast((t) => (
        <div className="max-w-lg bg-white flex w-full items-center gap-3">
          <div className="flex-shrink-0">
            <img
              className="h-12 w-12 rounded-full"
              src={hostQuery.data?.foto_perfil}
              alt="foto de perfil del anfitrión"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col items-start justify-center">
            <p className="text-left text-sm font-medium text-gray-900">
              Solicitud de reserva enviada
            </p>
            <small className="text-left text-wrap mt-1 text-[8px] text-gray-500">
              Esperando la respuesta del anfitrión
            </small>
          </div>

          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-3 text-sm font-medium text-primary-600 hover:text-secondary-500"
            >
              Ok
            </button>
          </div>
        </div>
      ));
      queryClient.invalidateQueries({
        queryKey: ["solicitudes"],
      });
    },
    onError: (err) => {
      console.log(err);
      const msg =
        err?.response?.data?.detail ||
        getAxiosErrorMessage(err) ||
        "No se pudo crear la reserva. Intenta de nuevo.";
      toast.error(msg);
    },
  });

  if (isPageLoading)
    return (
      <main className="w-[100dvw] h-[100dvh] flex items-center justify-center">
        <CustomLoader />
      </main>
    );
  if (hasPageError)
    return (
      <main className="w-[100dvw] h-[100dvh]">
        <ErrorViewComponent
          error={propiedad.error || hostQuery.error}
          retryFunction={() => refetchAll()}
        />
      </main>
    );
  const prop = propiedad.data;

  const shouldShowButton =
    prop.descripcion.length > MAX_LENGTH;

  const huespedeses: Option[] = buildHuespedOptions(
    prop.max_huespedes,
  );

  const ids = new Set(
    prop.amenidades.map((a) => a.amenidad_id),
  );

  const orderedEntries = groupAmenidades(
    amenidades.data ?? [],
    ids,
  );

  const compartirPagina = async () => {
    const url = globalThis.location.href;
    if (navigator.share) {
      await navigator.share({
        title: document.title,
        text: prop?.titulo,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  };

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
      <HeaderScroll ref={sectionRef} listRefs={listRef} />
      <HeaderMobile
        share={compartirPagina}
        card={cardQuery.data}
      />
      <CarruselMobile images={prop.imagenes} />
      <main className="w-full p-[1rem] mx-auto max-w-[1200px] flex flex-col items-start justify-start gap-4 max-md:rounded-t-4xl max-md:z-[9992] bg-white">
        <div className="flex items-center justify-center md:justify-between w-full gap-4">
          <h3 className="md:text-left font-[montserrat] max-md:w-full text-wrap text-center">
            {prop?.titulo}
          </h3>
          <div className="flex gap-4 max-md:hidden">
            <button
              className="flex gap-1"
              onClick={async () => await compartirPagina()}
            >
              <MotionShare
                transition={{
                  type: "spring",
                  stiffness: 300,
                }}
                whileHover={{ scale: 1.1 }}
                size={20}
              />
              <p className="text-text-primary text-sm font-semibold">
                Compartir
              </p>
            </button>
            <FavoritoButton
              isOnSmallScreen={false}
              propiedad={cardQuery.data}
            />
          </div>
        </div>
        <ImagenesGrid
          imagenes={prop.imagenes}
          ref={fotosRef}
        />
        <section
          className="w-full flex max-md:flex-col items-start justify-start gap-0  md:gap-4  lg:gap-8"
          ref={sectionRef}
        >
          <article className="flex-1 max-md:w-full flex flex-col items-start justify-start gap-4 overflow-hidden">
            <h4 className="max-md:mx-auto">
              {" "}
              {prop?.tipo.tipo.charAt(0).toUpperCase() +
                prop?.tipo.tipo.slice(1)}{" "}
              en {prop?.ciudad}, {prop?.region}
            </h4>
            <p className="text-text-secondary flex gap-1 items-center max-md:mx-auto flex flex-wrap  max-md:justify-center items-center">
              {prop.max_huespedes}{" "}
              {prop.max_huespedes === 1
                ? "huésped"
                : "huéspedes"}{" "}
              <Dot size={14} />
              {prop.camas}{" "}
              {prop.camas === 1 ? "cama" : "camas"}{" "}
              <Dot size={14} /> {prop.banos}{" "}
              {prop.banos === 1 ? "baño" : "baños"}
              <Dot size={14} /> {prop.habitaciones}{" "}
              {prop.habitaciones === 1
                ? "habitación"
                : "habitaciones"}
            </p>

            <FavoritoBanner
              isFavorito={cardQuery.data?.es_favorito}
              evaluacion={calificacionesQuery.data}
              score={promedioQuery.data}
            />

            <div className="flex gap-4 mt-2">
              <Avatar
                src={hostQuery.data?.foto_perfil}
                size={48}
                name={hostQuery.data?.nombre || ""}
              />
              <div>
                <h6 className="font-[cabin] text-left ">
                  Anfitrión: {hostQuery.data?.nombre}{" "}
                  {hostQuery.data?.apellido_p}
                </h6>
                <p className="text-left">{fechaUnion}</p>
              </div>
            </div>

            {isBestRated && <Divider />}

            <PropertyHighlights
              isBestRated={isBestRated}
              reglaAutochecar={prop?.regla_autochecar}
            />
            <Divider />

            <DescriptionPreview
              descripcion={prop.descripcion}
              shouldShowButton={shouldShowButton}
              onOpenMore={() => setOpenMore(!openMore)}
            />

            <Divider />

            <h4 ref={amenidadesRef}>
              Lo que ofrece este lugar
            </h4>

            <div className="flex w-full gap 2 items-start justify-center max-md:flex-col max-md:gap-4">
              <div className="flex flex-col flex-1 gap-4">
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
                        strokeWidth={1}
                      />
                      <h6 className="text-left">
                        {a.nombre}
                      </h6>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col flex-1 gap-4">
                {prop.amenidades.slice(3, 6).map((a) => {
                  return (
                    <div
                      key={a.amenidad_id}
                      className="flex flex-row items-center jutify-start gap-2"
                    >
                      <Icono
                        name={a.icono_nombre}
                        size={36}
                        strokeWidth={1}
                      />
                      <h6 className="text-left">
                        {a.nombre}
                      </h6>
                    </div>
                  );
                })}
              </div>
            </div>

            <CustomButton
              variant="secondary"
              customWidth="max-md:w-full"
              onClick={() => setOpenAmenidades(true)}
            >
              Mostrar las {prop.amenidades.length}{" "}
              amenidades
            </CustomButton>

            <Divider />

            <CalendarContainer
              range={range}
              setRange={setRange}
            />
            <div className="m-2 w-full flex items-center justify-end">
              <CustomButton
                size="small"
                variant="tertiary"
                onClick={() =>
                  setRange([new Date(), nextThreeDays])
                }
              >
                Borrar fechas
              </CustomButton>
            </div>
          </article>
          <article className="max-md:hidden p-6 top-24 sticky  max-md:hidden  md:w-[275px] lg:w-[400px] shadow-md/30 bg-white rounded-xl gap-4 flex flex-col items-start justify-start">
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
              <h6 className="text-left">
                Total por {noches} noche(s)
              </h6>
              <p className="text-right">
                $
                {Math.round(
                  prop?.precio_noche * noches * 100,
                ) / 100}{" "}
                MXN
              </p>
            </div>
            <CustomButton
              size="large"
              fullWidth
              onClick={async () =>
                await handleReservar(
                  auth,
                  range,
                  id,
                  huespedes,
                  navigate,
                  reserva,
                )
              }
              disabled={reserva.isPending}
              isWaiting={reserva.isPending}
            >
              {reserva.isPending
                ? "Reservando..."
                : "Reservar"}
            </CustomButton>
            <p className="text-text-secondary text-center mx-auto">
              El pago se realiza en efectivo
            </p>
          </article>
        </section>
        <div
          ref={resenasRef}
          className="w-full flex flex-col gap-4"
        >
          <ResenasView
            promedioData={promedioQuery.data}
            loadingCals={calificacionesQuery.isLoading}
            calificaciones={calificacionesQuery.data}
          />
        </div>

        <h4 ref={ubicacionRef}>Dónde vas a estar</h4>
        <p className="flex items-center">
          {prop.ciudad} <Dot size={14} /> {prop.region}{" "}
          <Dot size={14} /> {prop.pais}
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
        <div className="flex gap-4 md:gap-8 flex-col md:flex-row w-full items-start justify-start md:justify-center">
          <div className="flex-1 flex flex-col gap-2 items-start justify-start max-md:w-full">
            <h4>Conoce a tu anfitrión</h4>
            <div className="flex-col flex gap-2 items-center justify-center p-4  rounded-xl bg-white  w-full shadow-[0_5px_15px_rgba(0,0,0,0.25)]">
              <Avatar
                src={hostQuery.data?.foto_perfil}
                size={72}
                name={hostQuery.data?.nombre || ""}
              />
              <h4>
                {hostQuery.data?.nombre.split(" ")[0] ||
                  "Anfitrión"}{" "}
                {hostQuery.data?.apellido_p || "Apellido"}
              </h4>
              <CustomLink
                to={`mailto:${hostQuery.data?.correo}`}
              >
                {hostQuery.data?.correo}
              </CustomLink>
            </div>
          </div>
          <div
            className={`${prop.reglas_extra ? "flex-1" : "flex-2"} flex flex-col gap-2 items-start justify-start`}
          >
            <h4>Reglas de la casa</h4>
            <p
              className={`${!prop?.regla_apagar && "line-through"} text-left flex items-center gap-2`}
            >
              <Cable /> Apagar luces y aparatos electrónicos
              al salir
            </p>
            <p
              className={`${!prop?.regla_fiestas && "line-through"} text-left flex items-center gap-2`}
            >
              <PartyPopper /> Se permiten fiestas y eventos
            </p>
            <p
              className={`${!prop?.regla_fumar && "line-through"} text-left flex items-center gap-2`}
            >
              <Cigarette /> Se permite fumar en el
              alojamiento
            </p>
            <p
              className={`${!prop?.regla_mascotas && "line-through"} text-left flex items-center gap-2`}
            >
              <Dog /> Se permiten mascotas en el alojamiento
            </p>
            <p
              className={`${!prop?.regla_ninos && "line-through"} text-left flex items-center gap-2`}
            >
              <Baby /> Apto para niños menores de 12 años
            </p>
          </div>{" "}
          <AdditionalRulesSection
            reglasExtra={prop.reglas_extra}
            onOpenReglas={() => setOpenReglas(true)}
          />
        </div>

        <Modal
          open={openMore}
          close={() => setOpenMore(false)}
          width={"min(768px, 100%)"}
        >
          <Modal.Body>
            <h3>Acerca del espacio</h3>
            <ReactMarkdown
              components={{
                p: MarkdownP,
              }}
            >
              {prop.descripcion}
            </ReactMarkdown>
          </Modal.Body>
        </Modal>

        <Modal
          open={openReglas}
          close={() => setOpenReglas(false)}
          width={"min(768px, 100%)"}
        >
          <Modal.Body>
            <h3>Reglas adicionales</h3>
            <ul className="list-decimal list-inside">
              {Object.entries(
                prop.reglas_extra ??
                  ({} as Record<string, string>),
              ).map(([key, value]) => (
                <li key={key} className="text-left">
                  <small className="text-text-primary pl-2">
                    {value}
                  </small>
                </li>
              ))}
            </ul>
          </Modal.Body>
        </Modal>

        <Modal
          open={openAmenidades}
          close={() => setOpenAmenidades(false)}
          width={"min(768px, 100%)"}
        >
          <Modal.Body>
            <h4 className="mb-4">
              Lo que ofrece este lugar
            </h4>
            <AmenidadesModalContent
              orderedEntries={orderedEntries}
              ids={ids}
            />
          </Modal.Body>
        </Modal>
        <div className="w-full md:hidden fixed bottom-0 left-0 bg-white p-6 flex max-[490px]:flex-col items-center max-[490px]:items-start justify-between gap-2 border-t border-border z-[9999]">
          <div>
            <h6 className="text-left">
              ${prop?.precio_noche} MXN
            </h6>
            <p className="text-text-secondary text-center text-left">
              por {noches} noche(s){" "}
              {formatShortMonthDate(range[0])} -{" "}
              {formatShortMonthDate(range[1])}
            </p>
          </div>
          <CustomButton
            customWidth=" max-[490px]:w-full  min-[490px]:w-auto"
            onClick={async () => {
              await handleReservar(
                auth,
                range,
                id,
                huespedes,
                navigate,
                reserva,
              );
            }}
            disabled={reserva.isPending}
            isWaiting={reserva.isPending}
          >
            {reserva.isPending
              ? "Reservando..."
              : "Reservar"}
          </CustomButton>
        </div>
      </main>
      <Footer />
    </>
  );
}

function transformarFecha(fecha: Date): void {
  fecha.setHours(0);
  fecha.setMinutes(0);
  fecha.setHours(fecha.getHours() + 72);
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

function parsearFecha(fecha: string | Date): string {
  const date = new Date(fecha);

  const formattedDate = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const texto = `Se unió el ${formattedDate}`;
  return texto;
}

type LoadingQueryState = {
  isInitialLoading?: boolean;
  isLoading?: boolean;
};

type ErrorQueryState = {
  isError?: boolean;
};

function isAnyQueryLoading(
  queries: LoadingQueryState[],
): boolean {
  return queries.some(
    (query) => query.isInitialLoading || query.isLoading,
  );
}

function hasAnyQueryError(
  queries: ErrorQueryState[],
): boolean {
  return queries.some((query) => query.isError);
}

function getPropiedadPageTitle(
  propiedadData: { titulo?: string } | undefined,
): string {
  if (!propiedadData) {
    return "Waymark - Encuentra el lugar perfecto para tu próxima aventura";
  }

  return `${propiedadData.titulo} - Waymark`;
}

function getHuespedLabel(count: number): string {
  return count === 1
    ? `${count} huésped`
    : `${count} huéspedes `;
}

function calculateNoches(range: Value): number {
  if (!Array.isArray(range)) return 1;

  const [start, end] = range;
  if (!start || !end) return 1;

  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function buildHuespedOptions(
  maxHuespedes: number,
): Option[] {
  return Array.from({ length: maxHuespedes }, (_, i) => {
    const count = i + 1;

    return {
      label: getHuespedLabel(count),
      value: count,
    };
  });
}

function useRedirectOnSlugMismatch(
  currentSlug: string | undefined,
  expectedSlug: string,
  navigate: ReturnType<typeof useNavigate>,
) {
  useEffect(() => {
    if (!currentSlug) return;
    if (currentSlug !== expectedSlug) {
      navigate("/404", { replace: true });
    }
  }, [currentSlug, expectedSlug, navigate]);
}

const MarkdownP = ({ children }) => {
  return (
    <p className="flex-0 font-[montserrat]  text-[14px]/[20px] text-text-primary text-left tracking-normal truncate w-full overflow-hidden whitespace-pre-line">
      {children}
    </p>
  );
};

const DescriptionPreview = ({
  descripcion,
  shouldShowButton,
  onOpenMore,
}: {
  descripcion: string;
  shouldShowButton: boolean;
  onOpenMore: () => void;
}) => {
  return (
    <>
      <div className="max-h-[140px] h-auto overflow-hidden">
        <ReactMarkdown
          components={{
            p: MarkdownP,
          }}
        >
          {descripcion + (shouldShowButton ? "..." : "")}
        </ReactMarkdown>
      </div>

      {shouldShowButton && (
        <CustomButton
          variant="secondary"
          onClick={onOpenMore}
          customWidth="max-md:w-full"
        >
          Mostrar más
        </CustomButton>
      )}
    </>
  );
};

const PropertyHighlights = ({
  isBestRated,
  reglaAutochecar,
}: {
  isBestRated: boolean;
  reglaAutochecar?: boolean;
}) => {
  return (
    <>
      {isBestRated && (
        <div className="inline-flex gap-8 items-center justify-center">
          <img
            src={cup}
            alt="entre_favoritos"
            className="w-8 h-8 aspect-square"
          />
          <div className="flex flex-col items-start justify-center">
            <p className="text-left font-[cabin] font-bold">
              Entre los mejores calificados
            </p>
            <small className="text-left">
              Este alojamiento está entre los mejores en
              Waymark, según las calificaciones.
            </small>
          </div>
        </div>
      )}

      {reglaAutochecar && (
        <div className="inline-flex gap-8 items-center justify-center">
          <DoorOpen size={32} className="shrink-0" />
          <div className="flex flex-col items-start justify-center">
            <p className="text-left font-[cabin] font-bold">
              Llegada autónoma
            </p>
            <small className="text-left">
              Para entrar al alojamiento, usa la caja de
              seguridad para llaves.
            </small>
          </div>
        </div>
      )}
    </>
  );
};

const AmenidadesModalContent = ({
  orderedEntries,
  ids,
}: {
  orderedEntries: [string, Amenidad[]][];
  ids: Set<number>;
}) => {
  return (
    <>
      {orderedEntries.map(([categoria, items]) => (
        <div key={categoria}>
          <p className="font-bold mb-4">
            {categoria.charAt(0).toUpperCase() +
              categoria.slice(1)}
          </p>

          <div className="flex flex-col items-start  gap-2 justify-center">
            {items.map((a: Amenidad) => (
              <AmenidadRow
                key={a.amenidad_id}
                amenidad={a}
                selected={ids.has(a.amenidad_id)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

const AmenidadRow = ({
  amenidad,
  selected,
}: {
  amenidad: Amenidad;
  selected: boolean;
}) => {
  if (selected) {
    return (
      <div className="flex items-center justify-start gap-2 mb-4 border-b last:border-0 border-border  w-full pb-4">
        <Icono
          name={amenidad.icono_nombre}
          size={32}
          strokeWidth={1}
          className="shrink-0"
        />
        <div>
          <p className="text-left">{amenidad.nombre}</p>
          <p className="text-left text-text-secondary text-sm">
            {amenidad.descripcion}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-start gap-2 mb-4 border-b last:border-0 border-border  w-full pb-4">
      <Icono
        name={amenidad.icono_nombre}
        size={32}
        strokeWidth={1}
        className="shrink-0"
      />
      <p
        className={`${!selected && "line-through"} text-left`}
      >
        {amenidad.nombre}
      </p>
    </div>
  );
};

const formatShortMonthDate = (date?: Date | null) => {
  if (!date) return "";

  return date
    .toLocaleDateString("es-MX", {
      month: "short",
      day: "numeric",
    })
    .replace(".", "");
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function groupAmenidades(
  data: Amenidad[],
  ids: Set<number>,
) {
  const grouped = data.reduce<Record<string, Amenidad[]>>(
    (acc, a) => {
      const selected = ids.has(a.amenidad_id);

      const categoria = selected
        ? a.categoria
        : "No incluidos";

      acc[categoria] ??= [];
      acc[categoria].push(a);

      return acc;
    },
    {},
  );

  const orderedEntries = Object.entries(grouped).sort(
    ([a], [b]) => {
      if (a === "No incluidos") return 1;
      if (b === "No incluidos") return -1;
      return a.localeCompare(b);
    },
  );

  return orderedEntries;
}

const CalendarContainer = ({ range, setRange }) => {
  const isLarge = useWatchResize({
    pixeles: 768,
    metrica: "min",
  });
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 2);
  return (
    <div className="w-full mx-auto" id="calendar_container">
      <Calendar
        selectRange
        value={range}
        onChange={(value) => setRange(value)}
        minDate={today}
        maxDate={maxDate}
        showDoubleView={isLarge}
        next2Label={null}
        prev2Label={null}
        locale="es-MX"
        minDetail="month"
        maxDetail="month"
      />
    </div>
  );
};

const ReglasUl = ({
  reglas,
}: {
  reglas: Record<string, string>;
}) => {
  const slice = Object.values(reglas).slice(0, 5);
  return (
    <ul className="list-none list-inside flex flex-col">
      {Object.entries(slice).map(([key, value]) => (
        <li key={key} className="text-left">
          <small className="text-text-secondary">
            {" "}
            {value}
          </small>
        </li>
      ))}
    </ul>
  );
};

const AdditionalRulesSection = ({
  reglasExtra,
  onOpenReglas,
}: {
  reglasExtra?: Record<string, string>;
  onOpenReglas: () => void;
}) => {
  if (!reglasExtra) return null;

  const hasMoreThanFiveRules =
    Object.entries(reglasExtra).length > 5;

  return (
    <div className="flex-1 flex flex-col gap-2 items-start justify-start">
      <h4>Reglas adicionales de la casa</h4>
      <ReglasUl reglas={reglasExtra} />

      {hasMoreThanFiveRules && (
        <CustomLink
          onClick={(e) => {
            e.preventDefault();
            onOpenReglas();
          }}
        >
          Más información
        </CustomLink>
      )}
    </div>
  );
};

const HeaderScroll = ({ ref, listRefs }) => {
  const { scrollY } = useScroll();
  const [elementTop, setElementTop] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setElementTop(ref.current.offsetTop);
    }
  }, []);

  const opacity = useTransform(
    scrollY,
    [elementTop, elementTop + 1],
    [0, 1],
  );

  const display = useTransform(
    scrollY,
    [elementTop, elementTop + 1],
    ["none", "block"],
  );

  const isSmall = useWatchResize({
    pixeles: 768,
    metrica: "max",
  });

  return (
    <motion.div
      style={{
        opacity,
        display: isSmall ? "none" : display,
      }}
      className="sticky top-0 w-full z-[9997] max-md:hidden bg-white border-b border-border"
    >
      <div className="max-w-[1200px] mx-auto flex gap-2 items-center justify-between py-6 px-4">
        <div className="w-auto flex gap-2 items-center justify-start">
          <button
            className="p-1 font-bold hover:border-text-primary text-text-primart border-b-4 border-transparent transition"
            onClick={() => scrollToElement(listRefs[0])}
          >
            Fotos
          </button>
          <button
            className="p-1 font-bold hover:border-text-primary text-text-primart border-b-4 border-transparent transition"
            onClick={() => scrollToElement(listRefs[1])}
          >
            Amenidades
          </button>
          <button
            className="p-1 font-bold hover:border-text-primary text-text-primart border-b-4 border-transparent transition"
            onClick={() => scrollToElement(listRefs[2])}
          >
            Evaluaciones
          </button>
          <button
            className="p-1 font-bold hover:border-text-primary text-text-primart border-b-4 border-transparent transition"
            onClick={() => scrollToElement(listRefs[3])}
          >
            Ubicación
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const scrollToElement = (
  ref: React.RefObject<HTMLDivElement>,
) => {
  if (ref.current) {
    const headerOffset = 80;

    const elementPosition =
      ref.current.getBoundingClientRect().top;

    const offsetPosition =
      window.pageYOffset + elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

const ResenasView = ({
  promedioData,
  loadingCals,
  calificaciones,
}) => {
  const resenaText =
    promedioData.total === 1 ? "reseña" : "reseñas";
  return (
    <>
      <h4 className="text-left">
        {(promedioData?.total ?? 0) > 0
          ? `${Number(promedioData.promedio).toFixed(1)} · ${promedioData.total} ${resenaText}`
          : "Reseñas"}
      </h4>
      {calificaciones.length === 0 ? (
        <p className="text-left text-text-secondary font-[cabin]">
          Aún no hay reseñas para este alojamiento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calificaciones.map((c) => (
            <div
              key={c.calificacion_id}
              className="flex flex-col gap-2 p-4 border border-border rounded-xl"
            >
              <div className="flex items-center gap-2">
                <Avatar
                  src={c.usuario?.foto_perfil}
                  size={40}
                  name={c.usuario?.nombre || ""}
                />
                <div>
                  <p className="font-semibold">
                    {c.usuario?.nombre}{" "}
                    {c.usuario?.apellido_p}
                  </p>
                  <p className="text-text-secondary text-xs">
                    {new Date(
                      c.created_at,
                    ).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={14}
                    fill={
                      n <= c.puntuacion ? "#bf0603" : "none"
                    }
                    color={
                      n <= c.puntuacion
                        ? "#bf0603"
                        : "#d1d5db"
                    }
                  />
                ))}
              </div>
              <p className="text-sm text-text-primary">
                {c.comentario}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

async function handleReservar(
  auth: AuthContextValue,
  range: Date[],
  id: number | undefined,
  huespedes: number,
  navigate: ReturnType<typeof useNavigate>,
  mutation?: ReturnType<typeof useMutation>,
) {
  if (!auth?.isAuthenticated) {
    toast.error(
      "Inicia sesión para reservar este alojamiento.",
    );
    return;
  } else if (
    auth.userRole !== "turista" &&
    auth.userRole !== "ambos"
  ) {
    toast.error(
      "Inicia sesión con una cuenta de turista para reservar.",
    );
    return;
  }
  if (!Array.isArray(range) || !range[0] || !range[1]) {
    toast.error(
      "Selecciona las fechas de entrada y salida.",
    );
    return;
  }
  mutation.mutate({
    id: Number(id),
    range,
    huespedes,
  });
}

interface FavoritoBannerProps {
  isFavorito: boolean;
  evaluacion: number | null;
  score: number | null;
}

const FavoritoBanner = ({
  isFavorito,
  evaluacion,
  score,
}: FavoritoBannerProps) => {
  const textCount = useMemo(() => {
    switch (evaluacion.length) {
      case 0:
        return "Evaluaciones";
      case 1:
        return "Evaluación";
      default:
        return `Evaluaciones`;
    }
  });
  return (
    <div
      className={`${isFavorito ? "flex" : "hidden"} w-full flex-1 p-6  border-border rounded-xl items-center justify-between gap-4 border-2 max-md:border-transparent max-[600px]:flex-col`}
    >
      <div className="flex gap-0 items-center justify-center max-w-[200px]">
        <img
          src={leftwing}
          alt="left wing "
          className="w-6"
        />
        <h5 className="banner-title">
          Favorito entre huéspedes
        </h5>
        <img
          src={rightwing}
          alt="right wing"
          className="w-6"
        />
      </div>
      <h5 className="text-left max-[1128px]:hidden text-base/[8px] max-w-[200px] xl:max-w-[225px] text-wrap">
        Uno de los alojamientos más populares entre los
        huéspedes en Waymark
      </h5>
      <div className="h-[75px] w-[2px] bg-border max-md:hidden xl:hidden"></div>
      <div>
        <h5 className="text-center text-wrap">
          {score.promedio ?? 0}
        </h5>
        <small className="text-center text-wrap flex py-2 gap-0.5 justify-center">
          <Star
            size={10}
            fill="var(--color-text-primary)"
            color="var(--color-text-primary)"
            className="shrink-0"
          />
          <Star
            size={10}
            fill="var(--color-text-primary)"
            color="var(--color-text-primary)"
            className="shrink-0"
          />
          <Star
            size={10}
            fill="var(--color-text-primary)"
            color="var(--color-text-primary)"
            className="shrink-0"
          />
          <Star
            size={10}
            fill="var(--color-text-primary)"
            color="var(--color-text-primary)"
            className="shrink-0"
          />
          <Star
            size={10}
            fill="var(--color-text-primary)"
            color="var(--color-text-primary)"
            className="shrink-0"
          />
        </small>
      </div>
      <div className="h-[75px] w-[2px] bg-border max-md:hidden"></div>
      <div>
        <h5 className="text-center text-wrap">
          {evaluacion.length}
        </h5>
        <small className="text-center text-wrap">
          {textCount}
        </small>
      </div>
    </div>
  );
};

const ImagenesGrid = ({
  imagenes,
  ref,
}: {
  imagenes: Imagen[];
  ref: React.Ref<HTMLDivElement>;
}) => {
  const [showCarrusel, setShowCarrusel] = useState(false);
  return (
    <AnimatePresence>
      <div
        ref={ref}
        className="grid grid-cols-4 gap-2 md:h-[450px] max-md:hidden"
      >
        <div className="overflow-hidden col-span-2 row-span-2 rounded-l-xl hover:brightness-95 cursor-pointer">
          <motion.img
            layoutId="img-1"
            className="w-full h-full object-cover"
            src={imagenes[0]?.url}
            alt={`Imagen #${imagenes[0]?.orden}`}
          />
        </div>
        <div className=" text-white hover:brightness-95 cursor-pointer overflow-hidden ">
          <motion.img
            layoutId="img-2"
            className="w-full h-full object-cover"
            src={imagenes[1]?.url}
            alt={`Imagen #${imagenes[1]?.orden}`}
          />
        </div>
        <div className=" text-white hover:brightness-95 cursor-pointer overflow-hidden rounded-tr-xl">
          <motion.img
            layoutId="img-3"
            className="w-full h-full object-cover"
            src={imagenes[2]?.url}
            alt={`Imagen #${imagenes[2]?.orden}`}
          />
        </div>
        <div className=" hover:brightness-95 cursor-pointer overflow-hidden">
          <motion.img
            layoutId="img-4"
            className="w-full h-full object-cover"
            src={imagenes[3]?.url}
            alt={`Imagen #${imagenes[3]?.orden}`}
          />
        </div>
        <div
          className={`hover:brightness-95 cursor-pointer overflow-hidden rounded-br-xl relative bg-cover flex items-end justify-center p-4 `}
        >
          <motion.img
            layoutId="img-5"
            className="w-full h-full object-cover absolute top-0 left-0 z-0"
            src={imagenes[4]?.url}
            alt={`Imagen #${imagenes[4]?.orden}`}
          />
          {imagenes.length > 5 && (
            <button
              className="bg-white rounded-xl py-2 px-4 w-auto  z-10 font-semibold cursor-pointer"
              onClick={(e) => setShowCarrusel(true)}
            >
              <LayoutGrid
                size={20}
                className="inline mb-1"
              />{" "}
              Mostrar todas las fotos
            </button>
          )}
        </div>
      </div>
      {showCarrusel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="max-md:hidden fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center items-center flex gap-2 flex-col text-white text-lg font-semibold z-[9999]"
          onClick={() => setShowCarrusel(false)}
        >
          <button
            onClick={() => setShowCarrusel(false)}
            className="flex items-center justify-center self-start pl-[4.5vw]"
          >
            <X size={32} /> Cerrar
          </button>
          <Carrusel images={imagenes} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface CarruselProps {
  images: Imagen[];
}

const Carrusel = ({ images }: CarruselProps) => {
  const sliderRef = useRef(null);
  const slidesRef = useRef(null);

  const [sliderWidth, setSliderWidth] = useState(0);
  const [slidesWidth, setSlidesWidth] = useState(0);

  const slideMarginRight = 15;
  const totalSlidesMarginRight =
    slideMarginRight * images.length;

  useEffect(() => {
    const measureSliderWidth = () => {
      setSliderWidth(sliderRef.current.clientWidth);
    };

    const measureSlidesWidth = () => {
      const slidesNode = slidesRef.current.childNodes;
      const slidesArr = Array.from(slidesNode);
      const slidesSumWidth = slidesArr.reduce(
        (acc, node) => acc + node.clientWidth,
        0,
      );
      setSlidesWidth(slidesSumWidth);
    };

    measureSliderWidth();
    measureSlidesWidth();

    window.addEventListener("resize", measureSliderWidth);
    window.addEventListener("resize", measureSlidesWidth);

    return () => {
      window.removeEventListener(
        "resize",
        measureSliderWidth,
      );
      window.removeEventListener(
        "resize",
        measureSlidesWidth,
      );
    };
  }, [sliderWidth, slidesWidth]);

  return (
    <div ref={sliderRef} className="slider">
      <motion.ul
        ref={slidesRef}
        drag="x"
        dragConstraints={{
          left: -(
            slidesWidth -
            sliderWidth +
            totalSlidesMarginRight
          ),
          right: 0,
        }}
        dragElastic={0.2}
        dragTransition={{ bounceDamping: 18 }}
        className="slides"
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((image, idx) => (
          <motion.li
            key={image.orden}
            layoutId={
              idx < 5 ? `img-${image.orden}` : undefined
            }
            className="slide"
          >
            <div
              style={{
                backgroundImage: `url(${typeof image.url === "string" ? image.url : ""})`,
              }}
            />
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

const CarruselMobile = ({ images }: CarruselProps) => {
  return (
    <div className="md:hidden w-full -mb-8 z-[9991]">
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {images.map((img, idx) => (
          <div
            key={img.orden}
            className="min-w-full h-[350px] snap-center relative"
          >
            <img
              src={img.url}
              alt={`Imagen #${img.orden}`}
              className="w-full h-full object-cover"
            />

            {/* Contador */}
            <div className="absolute bottom-10 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-lg">
              {idx + 1} / {images.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HeaderMobile = ({
  share,
  card,
}: {
  share: () => Promise<void>;
  card: Card;
}) => {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-white p-6 md:hidden flex items-center justify-between">
      <ArrowLeft
        size={20}
        onClick={() => navigate("/s/homes")}
      />
      <div className="flex gap-4">
        <MotionShare
          transition={{ type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.1 }}
          size={20}
          onClick={share}
        />
        <FavoritoButton
          isOnSmallScreen={true}
          propiedad={card}
        />
      </div>
    </div>
  );
};
