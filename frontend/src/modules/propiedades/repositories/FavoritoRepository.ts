import apiToken from "../../../utils/apiToken";
import Card from "../types/Card";
import Favorito, { FavoritoRequest } from "../types/Favorito";
const prefix = "favoritos/";
const PropiedadRepository = {
  findAll: async () => {
    const res = await apiToken.get<Card[]>(prefix);
    return res.data;
  },
  save: async (data: FavoritoRequest) => {
    const res = await apiToken.post<Favorito>(prefix, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiToken.delete<void>(`${prefix}${id}/`);
    return res.data;
  },
};

export default PropiedadRepository;
