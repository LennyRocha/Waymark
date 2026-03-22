type FiltrosPropiedades = {
  ciudad?: string;
  precio_min?: number;
  precio_max?: number;
  max_huespedes?: number;
  habitaciones?: number;
  banos?: number;
  camas?: number;
  tipo_id?: number;
  amenidades?: number[];
  page?: number,
  size?: number
};
//Enviar amenidades: filters.amenidades?.join(",")
export default FiltrosPropiedades;