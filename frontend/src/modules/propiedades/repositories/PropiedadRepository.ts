import api from "../../../utils/api";
import {
  PropiedadForm,
  PropiedadUpdate,
} from "../schemas/PropiedadZod";
import FiltrosPropiedades from "../types/FiltrosPropiedad";
import Propiedad, { Ubicacion } from "../types/Propiedad";
import { PaginatedResponse } from "../types/PaginationResponse";
import Card, {
  CardsResponse,
  LandingResponse,
} from "../types/Card";
import apiToken from "../../../utils/apiToken";
import apiLanding from "../../../utils/apiLanding";
import Anfitrion from "../types/Anfitrion";
import Reserva from "../../reservas/types/Reserva";
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
  getFechas: async (id: number) => {
    const res = await api.get<Reserva[]>(`reservas/calendario_propiedad/${id}`);
    return res.data;
  },
  findOne: async (id: number) => {
    const res = await api.get<Propiedad>(`${prefix}${id}`);
    return res.data;
  },
  getCards: async () => {
    const res = await api.get<CardsResponse>(
      `${prefix}cards/`,
    );
    return res.data;
  },
  getCard: async (id: number) => {
    const res = await api.get<Card>(
      `${prefix}cards/${id}/`,
    );
    return res.data;
  },
  getLanding: async () => {
    const res = await apiLanding.get<LandingResponse>(
      `${prefix}landing/`,
    );

    return res.data;
  },
  findAllByHost: async (filters: FiltrosPropiedades) => {
    const res = await apiToken.get<
      PaginatedResponse<Propiedad>
    >(`${prefix}by_host/`, {
      params: filters,
    });
    return res.data;
  },
  save: async (data: PropiedadForm) => {
    const res = await apiToken.post<Propiedad>(
      prefix,
      data,
    );
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
    const res = await apiToken.delete<void>(
      `${prefix}${id}/`,
    );
    return res.data;
  },
  findUbicaciones: async () => {
    const res = await api.get<Ubicacion[]>(
      `${prefix}locations/`,
    );
    return res.data;
  },
  findDueno: async (id: number) => {
    const res = await api.get<Anfitrion>(
      `dueno_propiedad/${id}/`,
    );
    return res.data;
  },
};

export default PropiedadRepository;
