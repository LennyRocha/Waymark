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
  regla_ninos?: boolean | undefined | number;
  regla_mascotas?: boolean | undefined | number;
  entrada?: string | undefined;
  salida?: string | undefined;
  page?: number | undefined;
  size?: number | undefined;
};
//Enviar amenidades: filters.amenidades?.join(",")
export default FiltrosPropiedades;

export type FiltrosPropiedadesKeys =
  | "ciudad"
  | "precio_min"
  | "precio_max"
  | "max_huespedes"
  | "habitaciones"
  | "banos"
  | "camas"
  | "tipo_id"
  | "amenidades"
  | "regla_ninos"
  | "regla_mascotas"
  | "entrada"
  | "salida"
  | "page"
  | "size";