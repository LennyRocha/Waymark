import api from "../../../utils/api";
import Favorito from "../types/Favorito";
const prefix = "favoritos/";
const PropiedadRepository = {
  findAll: async () => {
    const res = await api.get<Favorito[]>(prefix);
    return res.data;
  },
  save: async (data: Favorito) => {
    const res = await api.post<Favorito>(prefix, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<void>(`${prefix}${id}`);
    return res.data;
  },
};

export default PropiedadRepository;
