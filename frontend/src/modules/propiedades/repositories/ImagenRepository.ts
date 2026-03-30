import api from "../../../utils/api";
import Imagen, { Payload } from "../types/Imagen";

const prefix = "imagenes/";
const ImagenRepository = {
  save: async (data: Payload) => {
    const res = await api.post<Imagen[]>(prefix, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  update: async (data: Imagen, id: number) => {
    const res = await api.patch<Imagen>(
      `${prefix}${id}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  },
};

export default ImagenRepository;
