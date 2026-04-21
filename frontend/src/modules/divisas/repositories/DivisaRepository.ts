import api from "../../../utils/api";
import apiToken from "../../../utils/apiToken";
import Divisa from "../types/Divisa";
const prefix = "divisas/";
const DivisaRepository = {
  findAll: async () => {
    const res = await api.get<Divisa[]>(prefix);
    return res.data;
  },
  findOne: async (id: number) => {
    const res = await api.get<Divisa>(`${prefix}${id}`);
    return res.data;
  },
  save: async (data: Partial<Divisa>) => {
    const res = await apiToken.post<Divisa>(prefix, data);
    return res.data;
  },
  update: async (data: Partial<Divisa>, id: number) => {
    const res = await apiToken.patch<Divisa>(
      `${prefix}${id}`,
      data,
    );
    return res.data;
  },
};

export default DivisaRepository;
