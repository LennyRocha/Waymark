import React from "react";
import { Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import Card from "../types/Card";
import {
  useFavoritoDelete,
  useFavoritoPost,
} from "../hooks/useFavoritoMutation";
import { FavoritoRequest } from "../types/Favorito";
import Modal from "../../../layout/Modal";
import Login from "../../cuentas/Login";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";

const MotionHeart = motion.create(Heart);

type Props = {
  propiedad: Card;
};

export default function PropiedadCard({
  propiedad,
}: Readonly<Props>) {
  const [open, setOpen] = React.useState(false);
  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);
  const queryClient = useQueryClient();
  const [favoritoId, setFavoritoId] = React.useState(
    propiedad.favorito_id ?? null,
  );
  const [active, setActive] = React.useState(
    propiedad.es_mi_favorito,
  );
  const favoritoPost = useFavoritoPost({
    onSuccess: (data: any) => {
      setActive(true);
      setFavoritoId(data.id);
      queryClient.invalidateQueries({
        queryKey: ["favoritos"],
      });
    },
  });
  const favoritoDelete = useFavoritoDelete({
    onSuccess: () => {
      setActive(false);
      setFavoritoId(null);
      queryClient.invalidateQueries({
        queryKey: ["favoritos"],
      });
    },
  });
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated;
  const toggleFavorito = async () => {
    if (favoritoPost.isPending || favoritoDelete.isPending)
      return;
    if (!isAuthenticated || (auth?.userRole !== "turista" && auth?.userRole !== "ambos")) {
      openModal();
      return;
    }
    if (active && favoritoId) {
      await favoritoDelete.mutateAsync(favoritoId);
    } else {
      const newFavorito: FavoritoRequest = {
        propiedad: propiedad.propiedad_id,
      };

      await favoritoPost.mutateAsync(newFavorito);
    }
  };
  const goToPropiedad = () => {
    window.open(
      `/rooms/${propiedad.propiedad_id}-${propiedad.slug}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const propType = `${propiedad.tipo.charAt(0).toUpperCase()}${propiedad.tipo.slice(1)}`;
  return (
    <div className=" w-[clamp(138px,13.5%,250px)] shrink-0   relative flex flex-col items-start justify-start gap-2">
      <button onClick={() => goToPropiedad()}>
        <img
          src={propiedad.portada}
          alt={propiedad.slug}
          className="rounded-3xl w-full h-auto max-h-[238px] min-h-[138px] aspect-square object-cover object-center"
          title={propType + " en " + propiedad.ciudad}
          draggable="false"
        />
      </button>
      <div
        className={`absolute top-[.75rem] right-[1rem] left-[.75rem]  flex items-center ${propiedad.es_favorito ? "justify-between" : "justify-end"} gap-2`}
      >
        {propiedad.es_favorito && (
          <span className="md:max-w-[75%] h-auto md:text-wrap text-left rounded-xl bg-gray-100/80 px-2 py-1 font-bold w-[7rem] text-[12px] truncate max-md:text-[10px]">
            Favorito entre huéspedes{" "}
          </span>
        )}
        <button
          onClick={async () => await toggleFavorito()}
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
          {propiedad.divisa} por noche
        </small>

        {/* Rating */}
        {/* Obtener del endpoint de promedio de reviews, por ahora es un placeholder */}
        <small className="text-wrap text-text-secondary flex items-center gap-[2px] text-[12px] leading-[16px]">
          <Star
            fill="currentColor"
            size={12}
            className="shrink-0"
          />
          {propiedad.promedio
            ? propiedad.promedio.toFixed(2)
            : "Sin calificación"}{" "}
        </small>
      </div>
      <Modal open={open} close={closeModal} closeButton>
        <Modal.Body>
          <Login />
        </Modal.Body>
      </Modal>
    </div>
  );
}
