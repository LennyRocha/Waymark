type FiltrosPropiedades = {
  ciudad?: string | undefined;
  precio_min?: number | undefined;
  precio_max?: number | undefined;
  max_huespedes?: number | undefined;
  habitaciones?: number | undefined;
  banos?: number | undefined;
  camas?: number | undefined;
  tipo_id?: number | undefined;
  amenidades?: number[] | undefined;
  ninos?: boolean | undefined;
  mascotas?: boolean | undefined;
  entrada?: string | undefined;
  salida?: string | undefined;
  page?: number | undefined;
  size?: number | undefined;
};
//Enviar amenidades: filters.amenidades?.join(",")
export default FiltrosPropiedades;