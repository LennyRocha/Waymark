import api from "../../../utils/api";
import Imagen from "../types/Imagen";

const prefix = "imagenes/";
const ImagenRepository = {
  saveAll: async (data: FormData) => {
    const res = await api.post<Imagen[]>(`${prefix}save_many/`, data);
    return res.data;
  },
  save: async (data: Imagen) => {
    const res = await api.post<Imagen>(prefix, data);
    return res.data;
  },
  update: async (data: Partial<Imagen>, id: number) => {
    const res = await api.patch<Imagen>(`${prefix}${id}/`, data);
    return res.data;
  },
};

export default ImagenRepository;
