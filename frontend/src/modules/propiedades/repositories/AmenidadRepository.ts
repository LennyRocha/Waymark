import api from "../../../utils/api";
import Amenidad from "../types/Amenidad";
const prefix = "amenidades/";
const AmenidadRepository = {
  findAll: async () => {
    const res = await api.get<Amenidad[]>(prefix);
    return res.data;
  },
  findOne: async (id: number) => {
    const res = await api.get<Amenidad>(`${prefix}${id}`);
    return res.data;
  },
};

export default AmenidadRepository;
