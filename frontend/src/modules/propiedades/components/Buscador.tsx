import React, {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { motion } from "framer-motion";
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
}: Readonly<DropdownMenuProps>) => {
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  const [fecha1, setFecha1] = useState<Value>(new Date());
  const [fecha2, setFecha2] = useState<Value>(new Date());
  return (
    <CustomDropdown
      anchorRef={anchorRef}
      visible={visible}
      layoutId="menu"
      align="center"
      width={700}
    >
      <p className="text-xs font-bold text-text-secondary uppercase mb-2">
        Fechas
      </p>
      <p className="text-sm text-text-secondary">
        Aquí va el calendario
      </p>
      <div className="flex gap-4">
        <Calendar value={fecha1} onChange={setFecha1} />
        <Calendar value={fecha2} onChange={setFecha2} />
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

  const filteredLocations = locations.filter((loc) =>
    `${loc.ciudad}, ${loc.pais}`
      .toLowerCase()
      .includes(ubicacion.toLowerCase()),
  );

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
        className={`w-full max-w-[850px] mx-auto shadow-lg rounded-full flex items-center gap-1 px-[2px] ${
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
          cleanInput={() => setUbicacion("")}
        />

        <Divider />

        <SearchSection
          idx={2}
          label="Fechas"
          placeholder="Agregar fechas"
          inputIdx={inputIdx}
          scrolled={scrolled}
          open={open}
          close={close}
          refProp={input2Ref}
          isWaiting={isWaiting}
          readonly
          cleanInput={() => {}}
        />

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
          cleanInput={() => {
            setHuespedes(1);
            setConPets(false);
            setConKids(false);
          }}
        >
          <SearchButton
            focus={focus}
            scrolled={scrolled}
            onClick={() => navigate(url)}
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
  cleanInput: () => void;
};

const fuckOrClick = (
  scrolled: boolean,
  open: (idx: number) => void,
  idx: number,
) => {
  const handle = (e: React.FocusEvent | React.MouseEvent) => {
    if (!scrolled) {
      e.stopPropagation();
      open(idx);
    }
  };
  return handle;
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
  cleanInput = () => {},
}: SectionProps) => {
  const handleClick = fuckOrClick(scrolled, open, idx);

  const handleFocus = fuckOrClick(scrolled, open, idx);

  return (
    <motion.div
      layout
      ref={refProp}
      onClick={handleClick}
      className={`cursor-pointer relative w-auto transition delay-150 duration-300 ease 
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

      {idx === inputIdx && value && (
        <X
          className={`absolute top-6 mx-2 bg-white ${inputIdx === 3 ? "left-38" : "right-4"}`}
          color="var(--color-text-primary)"
          size={24}
          onClick={cleanInput}
        />
      )}
      {children}
    </motion.div>
  );
};

type SearchButtonProps = {
  focus: boolean;
  scrolled: boolean;
  onClick: () => void;
  isWaiting?: boolean;
};

const SearchButton = ({
  focus,
  scrolled,
  onClick,
  isWaiting = false,
}: SearchButtonProps) => {
  return (
    <motion.button
      className="absolute right-2 flex items-center justify-center gap-2 text-white rounded-full overflow-hidden outline-none h-auto"
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
