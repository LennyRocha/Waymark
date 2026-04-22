import React from "react";
import { Heart } from "lucide-react";
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

const FavoritoButton = ({
  isOnSmallScreen,
  propiedad,
}: {
  isOnSmallScreen: boolean;
  propiedad: Card;
}) => {
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
        queryKey: ["favoritos", "cards"],
      });
    },
  });
  const favoritoDelete = useFavoritoDelete({
    onSuccess: () => {
      setActive(false);
      setFavoritoId(null);
      queryClient.invalidateQueries({
        queryKey: ["favoritos", "cards"],
      });
    },
  });
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated;
  const toggleFavorito = async () => {
    if (favoritoPost.isPending || favoritoDelete.isPending)
      return;
    if (
      !isAuthenticated ||
      (auth?.userRole !== "turista" &&
        auth?.userRole !== "ambos")
    ) {
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
  const activeColor = active
    ? "var(--primario)"
    : "var(--text-primary)";
  const color =
    favoritoPost.isPending || favoritoDelete.isPending
      ? "var(--color-text-secondary)"
      : activeColor;
  return (
    <div>
      <button
        className="flex gap-1"
        onClick={async () => await toggleFavorito()}
      >
        <MotionHeart
          size={20}
          style={{
            color,
          }}
          fill={active ? "currentColor" : "none"}
          strokeWidth={active ? 0 : 2}
          animate={{ scale: active ? 1.2 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.1 }}
        />{" "}
        {!isOnSmallScreen && (
          <motion.p
            animate={{
              color,
            }}
            className="text-sm font-semibold"
          >
            {active ? "Guardado" : "Guardar"}
          </motion.p>
        )}
      </button>
      <Modal open={open} close={closeModal} closeButton>
        <Modal.Body>
          <Login
            fromModal={true}
            closeModal={() => {
              closeModal();
              globalThis.location.reload();
            }}
          />
          {auth?.userRole !== "turista" &&
            auth?.userRole !== "ambos" && (
              <p className="text-center text-sm text-red-500 mt-4">
                Solo los usuarios con rol de turista pueden
                marcar favoritos.
              </p>
            )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FavoritoButton;
