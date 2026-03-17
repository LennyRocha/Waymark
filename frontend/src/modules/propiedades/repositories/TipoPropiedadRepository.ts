import api from "../../../utils/api";
import TipoPropiedad from "../types/TipoPropiedad";
const prefix = "tipos_propiedad /";
const TipoPropiedadRepository = {
  findAll: async () => {
    const res = await api.get<TipoPropiedad[]>(prefix);
    return res.data;
  },
  findOne: async (id: number) => {
    const res = await api.get<TipoPropiedad>(
      `${prefix}${id}`,
    );
    return res.data;
  },
};

export default TipoPropiedadRepository;
