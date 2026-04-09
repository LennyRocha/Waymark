import api from "../../../utils/api";
import {
  PropiedadForm,
  PropiedadUpdate,
} from "../schemas/PropiedadZod";
import FiltrosPropiedades from "../types/FiltrosPropiedad";
import Propiedad, { Ubicacion } from "../types/Propiedad";
import { PaginatedResponse } from "../types/PaginationResponse";
import { CardsResponse, LandingResponse } from "../types/Card";
import apiToken from "../../../utils/apiToken";
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
  getCards: async (w_city?: boolean) => {
    const res = await api.get<CardsResponse>(
      `${prefix}cards/`,
      {
        params: w_city ? { w_city: true } : undefined,
      },
    );
    return res.data;
  },
  getLanding: async () => {
    const res = await api.get<LandingResponse>(
      `${prefix}landing/`,
    );

    return res.data;
  },
  findAllByHost: async (filters: FiltrosPropiedades) => {
    const res = await apiToken.get<PaginatedResponse<Propiedad>>(
      `${prefix}by_host/`,
      {
        params: filters,
      },
    );
    return res.data;
  },
  save: async (data: PropiedadForm) => {
    const res = await apiToken.post<Propiedad>(prefix, data);
    return res.data;
  },
  update: async (data: PropiedadUpdate, id: number) => {
    const res = await apiToken.patch<Propiedad>(
      `${prefix}${id}/`,
      data,
    );
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiToken.delete<void>(`${prefix}${id}/`);
    return res.data;
  },
  findUbicaciones: async () => {
    const res = await api.get<Ubicacion[]>(
      `${prefix}locations/`,
    );
    return res.data;
  },
  //TODO: agregar método para obtener el dueño de una propiedad
};

export default PropiedadRepository;
