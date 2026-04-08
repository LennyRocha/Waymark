import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import DropdownParent from "../../../components/DropdownParent";
import CustomDropdown from "../../../components/CustomDropdown";
import Accordion from "../../../components/Accordion";
import { Ubicacion } from "../types/Propiedad";
import CustomButton from "../../../components/CustomButton";

type Props = {
  isWaiting: boolean;
  locations: Ubicacion[];
};
export default function BuscadorBoton({
  isWaiting = false,
  locations = [],
}: Readonly<Props>) {
  const [vis, setVis] = useState(false);
  const buttonReff = useRef<HTMLButtonElement | null>(null);

  const items = [
    {
      title: "Destino",
      content: <h2>Hola</h2>,
    },
    {
      title: "Fechas",
      content: <h2>Hola</h2>,
    },
    {
      title: "Huéspedes",
      content: <h2>Hola</h2>,
    },
  ];

  return (
    <DropdownParent hideFunction={setVis} classes="w-full">
      <motion.button
        onClick={() => setVis(true)}
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
        className="w-full mx-auto transition delay-150 duration-300 ease-in-out flex flex-row gap-1 rounded-full bg-white shadow-xl p-4 items-center justify-center"
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
            <CustomButton size="small" variant="tertiary" >Borrar</CustomButton>
            <CustomButton size="small" >Buscar</CustomButton>
          </div>
        </div>
      </CustomDropdown>
    </DropdownParent>
  );
}
