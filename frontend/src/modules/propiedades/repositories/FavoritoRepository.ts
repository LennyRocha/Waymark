import api from "../../../utils/api";
import Card from "../types/Card";
import Favorito, { FavoritoRequest } from "../types/Favorito";
const prefix = "favoritos/";
const PropiedadRepository = {
  findAll: async () => {
    const res = await api.get<Card[]>(prefix);
    return res.data;
  },
  save: async (data: FavoritoRequest) => {
    const res = await api.post<Favorito>(prefix, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<void>(`${prefix}${id}/`);
    return res.data;
  },
};

export default PropiedadRepository;
