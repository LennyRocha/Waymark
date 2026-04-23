import React, { useRef, useState, useEffect } from "react";
import { MapPin, Minus, Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DropdownParent from "../../../components/DropdownParent";
import CustomDropdown from "../../../components/CustomDropdown";
import Accordion from "../../../components/Accordion";
import { Ubicacion } from "../types/Propiedad";
import CustomButton from "../../../components/CustomButton";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CustomCheckBox } from "../../../components/CustomInputs";
import {
  Functions,
  Values,
  makeQuery,
  useParamsValues,
} from "./Buscador";
import { useNavigate } from "react-router-dom";
import FiltrosPropiedades, {
  FiltrosPropiedadesKeys,
} from "../types/FiltrosPropiedad";

type Props = {
  isWaiting: boolean;
  locations: Ubicacion[];
  filtros?: FiltrosPropiedades;
  setFiltro?: (
    key: FiltrosPropiedadesKeys,
    value: any,
  ) => void;
  setFiltros?: (values: Record<string, any>) => void;
};

type MenuProps = {
  list?: Ubicacion[];
  functions?: Functions;
  values?: Values;
  ubicacion?: string;
};

export default function BuscadorBoton({
  isWaiting = false,
  locations = [],
  filtros,
  setFiltro,
  setFiltros,
}: Readonly<Props>) {
  const [vis, setVis] = useState(false);
  const buttonReff = useRef<HTMLButtonElement | null>(null);

  const navigate = useNavigate();

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
  } = useParamsValues();

  useEffect(() => {
    if (filtros) {
      setUbicacion(filtros.ciudad ?? "");
      setCheckin(filtros.entrada ?? "");
      setCheckout(filtros.salida ?? "");
      setConPets(filtros.regla_mascotas);
      setConKids(filtros.regla_ninos);
      setHuespedes(filtros.max_huespedes ?? null);
    }
  }, [filtros]);

  function setEverything() {
    if (setFiltros) {
      close();
      setFiltros({
        ciudad: ubicacion,
        entrada: checkin,
        salida: checkout,
        regla_mascotas: conPets,
        regla_ninos: conKids,
        max_huespedes: huespedes,
      });
    }
  }

  const filteredLocations = React.useMemo(() => {
    return locations;
  }, [locations]);

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

  const items = [
    {
      title: "Destino",
      content: (
        <MenuDestino
          list={filteredLocations}
          functions={functions}
          ubicacion={ubicacion}
        />
      ),
    },
    {
      title: "Fechas",
      content: <MenuFechas functions={functions} />,
    },
    {
      title: "Huéspedes",
      content: (
        <MenuHuespedes
          functions={functions}
          values={values}
        />
      ),
    },
  ];

  function cleanValues() {
    cleanDates();
    setConPets(undefined);
    setConKids(undefined);
    setHuespedes(null);
    setUbicacion("");
    setVis(false);
  }

  function initiateNullValues() {
    setVis(true);
    setHuespedes(1);
    setConPets(false);
    setConKids(false);
  }
  return (
    <DropdownParent
      hideFunction={cleanValues}
      classes="w-full"
    >
      <motion.button
        onClick={() => initiateNullValues()}
        layout
        whileHover={{
          boxShadow: "0px 4px 10px rgba(0,0,0, 0.5)",
        }}
        ref={buttonReff}
        whileTap={{
          scale: 0.8,
          borderColor: "#222222",
          borderWidth: 2,
        }}
        disabled={isWaiting}
        className="w-full mx-auto transition delay-150 duration-300 ease-in-out flex flex-row gap-1 rounded-full bg-white shadow-xl p-4 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-200 disabled:border-gray-300 border-2 border-transparent"
      >
        <Search className="" size={24} />
        <p className="font-bold">Comienza a explorar</p>
      </motion.button>
      <CustomDropdown
        layoutId="button"
        visible={vis}
        anchorRef={buttonReff}
        useParentWidth
      >
        <div className="w-full">
          <Accordion items={items} />
          <div className="flex justify-between items-center mt-6">
            <CustomButton
              size="small"
              variant="tertiary"
              disabled={isWaiting}
              onClick={() => cleanValues()}
            >
              Borrar
            </CustomButton>
            <CustomButton
              size="small"
              disabled={isWaiting}
              onClick={() => navigate(url)}
            >
              Buscar
            </CustomButton>
          </div>
        </div>
      </CustomDropdown>
    </DropdownParent>
  );
}

const MenuDestino = ({
  list = [],
  functions,
  ubicacion,
}: Readonly<MenuProps>) => {
  return (
    <div className="flex flex-col w-full overflow-y-auto overflow-x-hidden max-h-[45dvh]">
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
              }}
              ubicacion={ubicacion}
            />
          );
        })
      )}
    </div>
  );
};

const MenuFechas = ({ functions }: Readonly<MenuProps>) => {
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
    <div className="flex flex-col w-full overflow-y-auto overflow-x-hidden max-h-[45dvh]">
      <AnimatePresence mode="wait">
        <div className="flex gap-2 p-1 bg-bg-secondary items-center justify-center">
          <motion.button
            className="rounded-md w-full text-text-primary px-4 py-2"
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
            className="rounded-md w-full text-text-primary px-4 py-2"
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
    </div>
  );
};

const MenuHuespedes = ({
  functions,
  values,
}: Readonly<MenuProps>) => {
  return (
    <div className="flex flex-col w-full">
      <SelectNav
        value={values?.huespedes ?? null}
        label="¿Cuántos se van a alojar?"
        change={functions?.setHuespedes ?? (() => {})}
      />
      <CheckNav
        question="¿Viajas con mascotas?"
        checked={Boolean(values?.conPets)}
        onChange={functions?.setConPets ?? (() => {})}
      />
      <CheckNav
        question="¿Viajas con niños?"
        checked={Boolean(values?.conKids)}
        onChange={functions?.setConKids ?? (() => {})}
      />
      <small className="text-[10px] text-left text-text-secondary">
        * Niños de 13 años o ménos
      </small>
    </div>
  );
};

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
      <strong className="text-[14px] text-left">
        {label}
      </strong>
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
      <strong className="text-[14px] text-left">
        {question}
      </strong>
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
  ubicacion?: string | undefined;
};

const LocationItem = ({
  label,
  onclick,
  ubicacion,
}: Readonly<ItemProps>) => {
  return (
    <button
      className={`w-full hover:bg-border rounded-lg flex items-center justify-start p-2 gap-1 transition-colors duration-200 ${label === ubicacion ? "bg-border" : "bg-transparent"} text-left text-wrap`}
      onClick={onclick}
    >
      <MapPin
        size={32}
        className="p-1 bg-gray-100 rounded-md aspect-square shrink-0"
      />
      {" " + label}
    </button>
  );
};
