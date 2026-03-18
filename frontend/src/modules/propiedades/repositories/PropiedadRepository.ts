import api from "../../../utils/api";
import {
  PropiedadForm,
  PropiedadUpdate,
} from "../schemas/PropiedadZod";
import FiltrosPropiedades from "../types/FiltrosPropiedad";
import Propiedad, { Ubicacion } from "../types/Propiedad";
import { PaginatedResponse } from "../types/PaginationResponse";
const prefix = "propiedades/";
const PropiedadRepository = {
  findAll: async (filters: FiltrosPropiedades = {}) => {
    const res = await api.get<Propiedad[]>(prefix, {
      params: filters.amenidades
        ? {
            ...filters,
            amenidades: filters.amenidades?.join(","),
          }
        : filters,
    });
    return res.data;
  },
  findOne: async (id: number) => {
    const res = await api.get<Propiedad>(`${prefix}${id}`);
    return res.data;
  },
  findAllByHost: async (
    filters: FiltrosPropiedades = {},
    id: number,
  ) => {
    const res = await api.get<PaginatedResponse<Propiedad>>(
      `${prefix}by-host/${id}`,
      {
        params: filters,
      },
    );
    return res.data;
  },
  save: async (data: PropiedadForm) => {
    const res = await api.post<Propiedad>(prefix, data);
    return res.data;
  },
  update: async (data: PropiedadUpdate, id: number) => {
    const res = await api.put<Propiedad>(
      `${prefix}${id}`,
      data,
    );
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<void>(`${prefix}${id}`);
    return res.data;
  },
  findUbicaciones: async () => {
    const res = await api.get<Ubicacion[]>(
      `${prefix}locations`,
    );
    return res.data;
  },
};

export default PropiedadRepository;
