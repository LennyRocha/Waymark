import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomDropdown from "../../../components/CustomDropdown";
import DropdownParent from "../../../components/DropdownParent";

type DropdownMenuProps = {
  anchorRef: RefObject<HTMLElement | null>;
  visible: boolean;
};

const MenuDestino = ({
  anchorRef,
  visible,
}: Readonly<DropdownMenuProps>) => (
  <CustomDropdown
    anchorRef={anchorRef}
    visible={visible}
    useParentWidth
  >
    <p className="text-xs font-bold text-text-secondary uppercase mb-2">
      Destino
    </p>
    <input
      autoFocus
      className="w-full border border-border rounded-xl px-3 py-2 outline-none text-sm"
      placeholder="Ciudad, región, país…"
    />
  </CustomDropdown>
);

const MenuFechas = ({
  anchorRef,
  visible,
}: Readonly<DropdownMenuProps>) => (
  <CustomDropdown
    anchorRef={anchorRef}
    visible={visible}
    useParentWidth
  >
    <p className="text-xs font-bold text-text-secondary uppercase mb-2">
      Fechas
    </p>
    <p className="text-sm text-text-secondary">
      Aquí va el calendario
    </p>
  </CustomDropdown>
);

const OPCIONES_HUESPEDES = [
  "1 huésped",
  "2 huéspedes",
  "3 huéspedes",
  "4 huéspedes",
  "5+ huéspedes",
];

type MenuHuespedesProps = DropdownMenuProps & {
  onSelect: (option: string) => void;
};

const MenuHuespedes = ({
  anchorRef,
  visible,
  onSelect,
}: Readonly<MenuHuespedesProps>) => (
  <CustomDropdown
    anchorRef={anchorRef}
    visible={visible}
    useParentWidth
  >
    <p className="text-xs font-bold text-text-secondary uppercase mb-2">
      Huéspedes
    </p>
    <ul className="flex flex-col gap-1">
      {OPCIONES_HUESPEDES.map((op) => (
        <li key={op}>
          <button
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-border text-sm transition"
            onClick={() => onSelect(op)}
          >
            {op}
          </button>
        </li>
      ))}
    </ul>
  </CustomDropdown>
);

type BuscadorProps = {
  scrolled: boolean;
  setScrolled: (value: boolean) => void;
};

const Buscador = ({
  scrolled,
  setScrolled,
}: Readonly<BuscadorProps>) => {
  const [focus, setFocus] = useState(false);
  const [inputIdx, setInputIdx] = useState(0);
  const [huespedes, setHuespedes] = useState("");

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
          open={open}
          close={close}
          refProp={input1Ref}
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
          value={huespedes}
          onChange={setHuespedes}
          hasButton
        >
          <SearchButton
            focus={focus}
            scrolled={scrolled}
            onClick={() => navigate("/s/guadalajara/homes")}
          />
        </SearchSection>
      </motion.nav>

      {!scrolled && (
        <>
          <MenuDestino
            anchorRef={input1Ref}
            visible={inputIdx === 1}
          />

          <MenuFechas
            anchorRef={input2Ref}
            visible={inputIdx === 2}
          />

          <MenuHuespedes
            anchorRef={input3Ref}
            visible={inputIdx === 3}
            onSelect={(op) => {
              setHuespedes(op);
              close();
            }}
          />
        </>
      )}
    </DropdownParent>
  );
};

type SectionProps = {
  idx: number;
  label: string;
  placeholder: string;
  inputIdx: number;
  scrolled: boolean;
  open: (idx: number) => void;
  close: () => void;
  refProp: React.RefObject<HTMLDivElement | null>;
  value?: string;
  onChange?: (v: string) => void;
  children?: React.ReactNode;
  hasButton?: boolean;
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
}: SectionProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!scrolled) open(idx);
  };

  const handleFocus = (e: React.FocusEvent) => {
    e.stopPropagation();
    if (!scrolled) open(idx);
  };

  return (
    <motion.div
      layout
      ref={refProp}
      onClick={handleClick}
      className={`w-auto transition delay-150 duration-300 ease 
            ${!scrolled && inputIdx !== idx ? "hover:bg-border" : ""}
            ${inputIdx === idx ? "bg-white" : "bg-transparent"} ${hasButton ? "flex-2" : "flex-1"}
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
        onFocus={handleFocus}
        onBlur={close}
        disabled={scrolled}
      />
      {children}
    </motion.div>
  );
};

type SearchButtonProps = {
  focus: boolean;
  scrolled: boolean;
  onClick: () => void;
};

const SearchButton = ({
  focus,
  scrolled,
  onClick,
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
      disabled={scrolled}
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

export default Buscador;
