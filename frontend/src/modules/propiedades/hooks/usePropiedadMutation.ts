import { useMutation } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";
import { PropiedadForm, PropiedadUpdate } from "../schemas/PropiedadZod";

type accion = "post" | "put" | "delete";
export default function usePropiedadMutation(
  props = {},
  accion: accion = "post",
) {
  if (accion === "post") {
    return useMutation({
      mutationFn: (data: PropiedadForm) =>
        PropiedadRepository.save(data),
      ...props,
    });
  }

  if (accion === "put") {
    return useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number;
        data: PropiedadUpdate;
      }) => PropiedadRepository.update(data, id),
      ...props,
    });
  }

  return useMutation({
    mutationFn: (id: number) =>
      PropiedadRepository.delete(id),
    ...props,
  });
}
