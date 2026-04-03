import React from "react";
import { Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Propiedad from "../types/Propiedad";

const MotionHeart = motion.create(Heart);

type Props = {
  propiedad: Propiedad;
};

export default function PropiedadCard({
  propiedad,
}: Readonly<Props>) {
  if (propiedad) console.log(propiedad);
  const [active, setActive] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goToPropiedad = () => {
    window.open(
      `/rooms/3-${propiedad.slug ?? "tequesquitengo"}`,
      "_blank",
      "noopener,noreferrer",
    );
    //navigate("/rooms/3-tequesquitengo", { state: { from: location.pathname } });
  };
  const propType = `${propiedad.tipo.tipo.charAt(0).toLowerCase()}${propiedad.tipo.tipo.slice(1)}`;
  const imagenCover =
    typeof propiedad === "object" &&
    typeof propiedad.imagenes[0]?.url === "string"
      ? propiedad.imagenes[0]?.url
      : "https://a0.muscache.com/im/pictures/225729b8-a72d-4048-89a3-92000e80086a.jpg?im_w=960";
  return (
    <div className=" w-[clamp(138px,13.5%,250px)] shrink-0   relative flex flex-col items-start justify-start gap-2">
      <button onClick={() => goToPropiedad()}>
        <img
          src={imagenCover}
          alt={propiedad.slug ?? "Hotel en Tequesquitengo"}
          className="rounded-3xl w-full h-auto max-h-[238px] min-h-[138px] aspect-square object-cover object-center"
          title={propType + " en " + propiedad.ciudad}
          draggable="false"
        />
      </button>
      <div className="absolute top-[.75rem] right-[1rem] left-[.75rem]  flex items-center justify-between gap-2">
        <span className="md:max-w-[75%] h-auto md:text-wrap text-left rounded-xl bg-gray-100/80 px-2 py-1 font-bold w-[7rem] text-[12px] truncate max-md:text-[10px]">
          Favorito entre huéspedes{" "}
        </span>
        <button
          onClick={() => setActive(!active)}
          aria-label="Marcar propiedad como favorita"
        >
          <MotionHeart
            className="w-6 h-6  lg:w-7 lg:h-7"
            style={{
              color: active ? "var(--primario)" : "#fff",
            }}
            fill={active ? "currentColor" : "none"}
            strokeWidth={active ? 0 : 2}
            animate={{ scale: active ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.1 }}
          />
        </button>
      </div>
      <div className="flex flex-col items-start justify-start gap-[2px] h-clamp-[130px, auto, 44px]">
        {/* Título */}
        <small className="text-wrap text-text-primary text-[14px] leading-[18px] text-left truncate w-full font-medium font-[cabin]">
          {propType} en {propiedad.ciudad}
        </small>

        {/* Precio */}
        <small className="text-wrap text-text-secondary text-[14px] leading-[18px] truncate w-full  text-left">
          $ {propiedad.precio_noche.toLocaleString()}{" "}
          {propiedad.divisa.acronimo} por noche
        </small>

        {/* Rating */}
        {/* Obtener del endpoint de promedio de reviews, por ahora es un placeholder */}
        <small className="text-wrap text-text-secondary flex items-center gap-[2px] text-[12px] leading-[16px]">
          <Star
            fill="currentColor"
            size={12}
            className="shrink-0"
          />
          4.33
        </small>
      </div>
    </div>
  );
}
