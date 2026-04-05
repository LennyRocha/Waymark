import React, {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomDropdown from "../../../components/CustomDropdown";
import DropdownParent from "../../../components/DropdownParent";
import { Ubicacion } from "../types/Propiedad";
import { CustomCheckBox } from "../../../components/CustomInputs";
import Calendar from "react-calendar";
import "../css/propiedades.css";

type Functions = {
  setUbicacion: (ciudad: string) => void;
  setCheckin: (checkin: string) => void;
  setCheckout: (checkout: string) => void;
  setConPets: (conPets: boolean | undefined) => void;
  setConKids: (conKids: boolean | undefined) => void;
  setHuespedes: (huespedes: number | null) => void;
};
type Values = {
  ubicacion: string;
  checkin: string;
  checkout: string;
  conPets: boolean | undefined;
  conKids: boolean | undefined;
  huespedes: number | null;
};
type DropdownMenuProps = {
  anchorRef: RefObject<HTMLElement | null>;
  visible: boolean;
  list?: Ubicacion[];
  functions?: Functions;
  values?: Values;
  close?: () => void;
};

const MenuDestino = ({
  anchorRef,
  visible,
  list = [],
  functions,
  close,
}: Readonly<DropdownMenuProps>) => (
  <CustomDropdown
    anchorRef={anchorRef}
    visible={visible}
    layoutId="menu"
  >
    {list.length === 0 ? (
      <p className="text-xs font-bold text-text-secondary mb-2">
        ¡No se encontrarón ubicaciones!
      </p>
    ) : (
      list.map((loc) => {
        const locStr = `${loc.ciudad}, ${loc.region}`;
        return (
          <LocationItem
            key={locStr}
            label={locStr}
            onclick={() => {
              functions?.setUbicacion(locStr);
              close?.();
            }}
          />
        );
      })
    )}
  </CustomDropdown>
);

const MenuFechas = ({
  anchorRef,
  visible,
  functions,
}: Readonly<DropdownMenuProps>) => {
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];

  const [range, setRange] = useState<Value>(null);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 2);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  React.useEffect(() => {
    if (!range) return;

    if (Array.isArray(range)) {
      if (range[0])
        functions?.setCheckin(formatDate(range[0]));

      if (range[1])
        functions?.setCheckout(formatDate(range[1]));
    } else {
      // modo single
      functions?.setCheckin(formatDate(range));

      functions?.setCheckout("");
    }
  }, [range]);

  type CalendarMode = "single" | "range";

  const [calendarMode, setCalendarMode] =
    useState<CalendarMode>("range");

  React.useEffect(() => {
    setRange(null);
    functions?.setCheckin("");
    functions?.setCheckout("");
  }, [calendarMode]);

  return (
    <CustomDropdown
      anchorRef={anchorRef}
      visible={visible}
      layoutId="menu"
      align="center"
      width={calendarMode === "range" ? 700 : 350}
    >
      <AnimatePresence mode="wait">
        <div className="flex gap-2 p-1 bg-bg-secondary items-center justify-center">
          <motion.button
            className="rounded-md text-text-primary px-4 py-2"
            animate={{
              background:
                calendarMode === "range"
                  ? "var(--color-border)"
                  : "transparent",
              color:
                calendarMode === "range"
                  ? "black"
                  : "var(--color-text-primary)",
            }}
            onClick={() => setCalendarMode("range")}
          >
            Rango
          </motion.button>

          <motion.button
            className="rounded-md text-text-primary px-4 py-2"
            animate={{
              background:
                calendarMode === "single"
                  ? "var(--color-border)"
                  : "transparent",
              color:
                calendarMode === "single"
                  ? "black"
                  : "var(--color-text-primary)",
            }}
            onClick={() => setCalendarMode("single")}
          >
            Día
          </motion.button>
        </div>
      </AnimatePresence>
      <div className="flex gap-6 items-center justify-center">
        <Calendar
          selectRange={calendarMode === "range"}
          value={range}
          onChange={(value) => setRange(value)}
          minDate={today}
          maxDate={maxDate}
          showDoubleView={calendarMode === "range"}
          next2Label={null}
          prev2Label={null}
          locale="es-MX"
          minDetail="month"
          maxDetail="month"
        />
      </div>
    </CustomDropdown>
  );
};

const MenuHuespedes = ({
  anchorRef,
  visible,
  functions,
  values,
}: Readonly<DropdownMenuProps>) => {
  React.useEffect(() => {
    if (visible) {
      functions?.setConPets?.(false);
      functions?.setConKids?.(false);
      functions?.setHuespedes?.(1);
    } else {
      functions?.setConPets?.(undefined);
      functions?.setConKids?.(undefined);
      functions?.setHuespedes?.(null);
    }
  }, [visible]);
  return (
    <CustomDropdown
      anchorRef={anchorRef}
      visible={visible}
      align="right"
      layoutId="menu"
    >
      <div className="flex flex-col px-6 min-w-[350px]">
        <SelectNav
          value={values?.huespedes ?? null}
          label="¿Cuántos se van a alojar?"
          change={functions?.setHuespedes ?? (() => {})}
        />
        <CheckNav
          question="¿Viajas con mascotas?"
          checked={values?.conPets ?? false}
          onChange={functions?.setConPets ?? (() => {})}
        />
        <CheckNav
          question="¿Viajas con niños?"
          checked={values?.conKids ?? false}
          onChange={functions?.setConKids ?? (() => {})}
        />
        <small className="text-[10px] text-left text-text-secondary">
          * Niños de 13 años o ménos
        </small>
      </div>
    </CustomDropdown>
  );
};

const parseDateString = (dateStr?: string) => {
  if (!dateStr) return null;

  const [day, month, year] = dateStr.split("/");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
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

const getFechasTexto = (
  checkin?: string,
  checkout?: string,
) => {
  const startDate = parseDateString(checkin);

  const endDate = parseDateString(checkout);

  if (!startDate) return "";

  if (!endDate) return formatShortMonthDate(startDate);

  return `${formatShortMonthDate(startDate)} - ${formatShortMonthDate(endDate)}`;
};

type BuscadorProps = {
  scrolled: boolean;
  setScrolled: (value: boolean) => void;
  isWaiting: boolean;
  locations: Ubicacion[];
};

const Buscador = ({
  scrolled,
  setScrolled,
  isWaiting,
  locations = [],
}: Readonly<BuscadorProps>) => {
  const [focus, setFocus] = useState(false);
  const [inputIdx, setInputIdx] = useState(0);
  const navigate = useNavigate();

  const input1Ref = useRef<HTMLDivElement | null>(null);
  const input2Ref = useRef<HTMLDivElement | null>(null);
  const input3Ref = useRef<HTMLDivElement | null>(null);

  const open = (idx: number) => {
    setInputIdx(idx);
    setFocus(true);
  };

  const close = () => {
    setInputIdx(0);
    setFocus(false);
  };

  useEffect(() => {
    if (scrolled && focus) close();
  }, [scrolled, focus]);

  const {
    huespedes,
    setHuespedes,
    ubicacion,
    setUbicacion,
    checkin,
    setCheckin,
    checkout,
    setCheckout,
    conPets,
    setConPets,
    conKids,
    setConKids,
    content,
  } = useParamsValues();

  const filteredLocations = filterLocations(
    locations,
    ubicacion,
  );

  function cleanDates() {
    setCheckin("");
    setCheckout("");
  }

  const functions = {
    setUbicacion,
    setCheckin,
    setCheckout,
    setConPets,
    setConKids,
    setHuespedes,
  };

  const values = {
    ubicacion,
    checkin,
    checkout,
    conPets,
    conKids,
    huespedes,
  };

  const params = new URLSearchParams();
  makeQuery(params, values);

  const query = ubicacion
    ? ubicacion.replace(", ", "-")
    : "";

  const url = ubicacion
    ? `/s/${query}/homes?${params.toString()}`
    : `/s/homes?${params.toString()}`;

  return (
    <DropdownParent
      classes="w-full"
      onClick={() => scrolled && setScrolled(false)}
      hideFunction={close}
    >
      <motion.nav
        layout
        animate={{
          maxWidth: scrolled ? 450 : 800,
          marginTop: scrolled ? -50 : 0,
          paddingTop: scrolled ? 4 : 2,
          paddingBottom: scrolled ? 4 : 2,
        }}
        className={`cursor-pointer w-full max-w-[850px] mx-auto shadow-lg rounded-full flex items-center gap-1 px-[2px] ${
          inputIdx === 0 ? "bg-white" : "bg-border"
        }`}
      >
        <SearchSection
          idx={1}
          label="Destino"
          placeholder="Buscar destinos"
          inputIdx={inputIdx}
          scrolled={scrolled}
          value={ubicacion}
          open={open}
          close={close}
          refProp={input1Ref}
          isWaiting={isWaiting}
          onChange={(text) => setUbicacion(text)}
          readonly={false}
        >
          <SearchButton
            focus={focus}
            scrolled={scrolled}
            showButton={false}
            onClick={() => navigate(url)}
            cleanInput={() => setUbicacion("")}
            thisFocus={inputIdx === 1}
          />
        </SearchSection>

        <Divider />

        <SearchSection
          idx={2}
          label="Fechas"
          placeholder="Agregar fechas"
          inputIdx={inputIdx}
          scrolled={scrolled}
          open={open}
          close={close}
          value={getFechasTexto(checkin, checkout)}
          refProp={input2Ref}
          isWaiting={isWaiting}
          readonly
        >
          <SearchButton
            focus={focus}
            scrolled={scrolled}
            showButton={false}
            onClick={() => navigate(url)}
            cleanInput={cleanDates}
            thisFocus={inputIdx === 2}
          />
        </SearchSection>

        <Divider />

        <SearchSection
          idx={3}
          label="Huéspedes"
          placeholder="¿Cuántos?"
          inputIdx={inputIdx}
          scrolled={scrolled}
          open={open}
          close={close}
          refProp={input3Ref}
          value={inputIdx === 3 && huespedes ? content : ""}
          hasButton
          isWaiting={isWaiting}
          readonly
        >
          <SearchButton
            focus={focus}
            scrolled={scrolled}
            showButton
            onClick={() => navigate(url)}
            thisFocus={inputIdx === 3}
            cleanInput={() => {
              setHuespedes(1);
              setConPets(false);
              setConKids(false);
            }}
          />
        </SearchSection>
      </motion.nav>

      {!scrolled && (
        <>
          <MenuDestino
            anchorRef={input1Ref}
            visible={inputIdx === 1}
            list={filteredLocations}
            functions={functions}
            close={close}
          />

          <MenuFechas
            anchorRef={input2Ref}
            visible={inputIdx === 2}
            functions={functions}
          />

          <MenuHuespedes
            anchorRef={input3Ref}
            visible={inputIdx === 3}
            functions={functions}
            values={values}
          />
        </>
      )}
    </DropdownParent>
  );
};

function makeQuery(
  params: URLSearchParams,
  values: Values,
) {
  const { checkin, checkout, huespedes, conPets, conKids } =
    values;

  if (checkin) {
    params.set("checkin", checkin);
  }
  if (checkout) {
    params.set("checkout", checkout);
  }
  if (huespedes) {
    params.set("adults", huespedes.toString());
  }
  if (conPets) {
    params.set("allow_pets", "true");
  }
  if (conKids) {
    params.set("allow_children", "true");
  }
}

function filterLocations(
  locations: Ubicacion[],
  ubicacion: string,
) {
  return locations.filter((loc) =>
    `${loc.ciudad}, ${loc.pais}`
      .toLowerCase()
      .includes(ubicacion.toLowerCase()),
  );
}

function useParamsValues() {
  const [huespedes, setHuespedes] = useState<number | null>(
    null,
  );

  const [ubicacion, setUbicacion] = useState<string>("");

  const [checkin, setCheckin] = useState<string>("");
  const [checkout, setCheckout] = useState<string>("");

  const [conPets, setConPets] = useState<
    boolean | undefined
  >(undefined);
  const [conKids, setConKids] = useState<
    boolean | undefined
  >(undefined);

  const content = `${huespedes} Huéspedes${conPets ? " + Mascotas" : ""}${conKids ? " + Niños" : ""}`;

  return {
    huespedes,
    setHuespedes,
    ubicacion,
    setUbicacion,
    checkin,
    setCheckin,
    checkout,
    setCheckout,
    conPets,
    setConPets,
    conKids,
    setConKids,
    content,
  };
}

type SectionProps = {
  idx: number;
  label: string;
  placeholder: string;
  inputIdx: number;
  scrolled: boolean;
  open: (idx: number) => void;
  close: () => void;
  refProp: React.RefObject<HTMLDivElement | null>;
  value?: string | undefined;
  onChange?: (v: string) => void;
  children?: React.ReactNode;
  hasButton?: boolean;
  isWaiting?: boolean;
  readonly: boolean;
};

const fuckOrClick = (
  scrolled: boolean,
  open: (idx: number) => void,
  idx: number,
) => {
  function handleStop(
    e: React.MouseEvent | React.FocusEvent<HTMLDivElement>,
  ) {
    if (!scrolled) {
      e.stopPropagation();
      open(idx);
    }
  }
  return handleStop;
};

const SearchSection = ({
  idx,
  label,
  placeholder,
  inputIdx,
  scrolled,
  open,
  close,
  refProp,
  value,
  onChange,
  children,
  hasButton = false,
  isWaiting = false,
  readonly = false,
}: SectionProps) => {
  const handleClick = fuckOrClick(scrolled, open, idx);
  const handleFocus = fuckOrClick(scrolled, open, idx);

  return (
    <motion.div
      layout
      ref={refProp}
      onClick={handleClick}
      className={`relative w-auto transition delay-150 duration-300 ease 
            ${!scrolled && inputIdx !== idx && !isWaiting ? "hover:bg-border" : ""}
            ${inputIdx === idx ? "bg-white" : "bg-transparent"} ${hasButton ? "flex-2" : "flex-1"} ${isWaiting && "opacity-50"}
            rounded-full px-6 py-2 h-full flex flex-col justify-center flex-1 relative`}
    >
      <label
        className={`font-bold ${!scrolled && "text-xs"} text-left`}
      >
        {label}
      </label>

      <motion.input
        animate={{
          opacity: scrolled ? 0 : 1,
          width: scrolled ? 0 : "auto",
          height: scrolled ? 0 : "auto",
        }}
        transition={{ duration: 0.2 }}
        className="outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={(e) => {
          e.stopPropagation();
          handleFocus(e);
        }}
        onMouseDown={handleClick}
        disabled={scrolled || isWaiting}
        readOnly={readonly}
      />
      {children}
    </motion.div>
  );
};

const MotionX = motion.create(X);

type SearchButtonProps = {
  focus: boolean;
  scrolled: boolean;
  onClick: () => void;
  isWaiting?: boolean;
  cleanInput?: () => void;
  showButton?: boolean;
  thisFocus?: boolean;
};

const SearchButton = ({
  focus,
  scrolled,
  onClick,
  isWaiting = false,
  cleanInput = () => {},
  showButton = true,
  thisFocus = false,
}: SearchButtonProps) => {
  return (
    <motion.div
      className={`absolute ${showButton ? "right-2" : "right-1/12"} flex  items-center`}
    >
      <AnimatePresence mode="wait">
        {thisFocus && (
          <MotionX
            initial={{ opacity: 0 }}
            animate={{ opacity: focus ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            color="var(--color-text-primary)"
            size={24}
            onClick={cleanInput}
            className={`mt-4 cursor-pointer  p-1 transition durarion-300  ${thisFocus ? "bg-white" : "bg-transparent"}`}
          />
        )}
      </AnimatePresence>
      {showButton && (
        <motion.button
          className=" flex items-center justify-center gap-2 text-white rounded-full overflow-hidden outline-none h-auto"
          animate={{
            width: focus ? 120 : 50,
            background: focus
              ? "linear-gradient(to right, var(--color-primary-500), var(--color-secondary-500))"
              : "var(--color-primary-500)",
            padding: scrolled ? "2px" : "12px",
          }}
          disabled={scrolled || isWaiting}
          transition={{ duration: 0.4 }}
          onClick={onClick}
        >
          <Search className="mr-1" />
          {focus && "Buscar"}
        </motion.button>
      )}
    </motion.div>
  );
};

const Divider = () => (
  <div className="h-6 w-px bg-gray-200" />
);

type NavProps = {
  label: string;
  value: number | null;
  change: (value: number | null) => void;
};

const SelectNav = ({
  label = "",
  value = 0,
  change = (num: number | null) => {},
}: Readonly<NavProps>) => {
  return (
    <nav className="flex justify-between items-center  gap-4">
      <strong>{label}</strong>
      <div className="flex flex-row items-center justify-center gap-2 mb-2">
        <button
          type="button"
          aria-label="disminuir"
          disabled={value === 1}
          className="disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary"
          onClick={() => change(value ? value - 1 : null)}
        >
          <Minus
            color="var(--color-text-secondary)"
            size={18}
          />
        </button>

        <p>{value}</p>

        <button
          type="button"
          aria-label="aumentar"
          disabled={value === 20}
          className="disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary"
          onClick={() => change(value ? value + 1 : null)}
        >
          <Plus
            color="var(--color-text-secondary)"
            size={18}
          />
        </button>
      </div>
    </nav>
  );
};

type CheckNavProps = {
  question: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

const CheckNav = ({
  question,
  checked,
  onChange,
}: Readonly<CheckNavProps>) => {
  return (
    <div className="flex justify-between items-center my-2 gap-4">
      <strong>{question}</strong>
      <CustomCheckBox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
};

type ItemProps = {
  label: string;
  onclick: () => void;
};

const LocationItem = ({
  label,
  onclick,
}: Readonly<ItemProps>) => {
  return (
    <button
      className="w-full hover:bg-border rounded-lg flex items-center justify-start p-2 gap-1 transition-colors duration-200"
      onClick={onclick}
    >
      <MapPin
        size={32}
        className="p-1 bg-gray-100 rounded-md"
      />
      {" " + label}
    </button>
  );
};

export default Buscador;
