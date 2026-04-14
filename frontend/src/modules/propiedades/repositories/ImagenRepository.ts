import apiToken from "../../../utils/apiToken";
import Imagen from "../types/Imagen";

const prefix = "imagenes/";
const ImagenRepository = {
  saveAll: async (data: FormData) => {
    const res = await apiToken.post<Imagen[]>(`${prefix}save_many/`, data);
    return res.data;
  },
  save: async (data: Imagen) => {
    const res = await apiToken.post<Imagen>(prefix, data);
    return res.data;
  },
  update: async (data: Partial<Imagen>, id: number) => {
    const res = await apiToken.patch<Imagen>(`${prefix}${id}/`, data);
    return res.data;
  },
};

export default ImagenRepository;
