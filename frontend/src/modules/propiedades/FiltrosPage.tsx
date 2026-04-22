import {
  useSearchParams,
  useParams,
} from "react-router-dom";
import FiltrosPropiedades from "./types/FiltrosPropiedad";
import usePropiedades from "./hooks/usePropiedades";

//https://www.airbnb.mx/s/Acapulco/homes?refinement_paths%5B%5D=%2Fhomes&place_id=ChIJyVDOroVXyoUR46SQivfYAZg&date_picker_type=calendar&checkin=2026-04-12&checkout=2026-04-13&adults=3&pets=1&search_type=AUTOSUGGEST

//https://www.airbnb.mx/s/Temixco--Mor./homes?refinement_paths%5B%5D=%2Fhomes&place_id=ChIJGzfg9SDZzYURLe2rgyC-ac4&location_bb=QZcVOMLGarxBlnRswsaG8A%3D%3D&acp_id=d133f826-c204-4791-87f0-1bffa5b4a387&date_picker_type=calendar&checkin=2026-03-30&checkout=2026-04-22&adults=1&children=1&infants=1&pets=2&search_type=autocomplete_click

//https://www.airbnb.mx/s/homes?refinement_paths%5B%5D=%2Fhomes&location_search=NEARBY&source=structured_search_input_header&search_type=user_map_move&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2026-04-01&monthly_length=3&monthly_end_date=2026-07-01&search_mode=regular_search&price_filter_input_type=2&channel=EXPLORE&ne_lat=19.395046106013783&ne_lng=-98.86464033990347&sw_lat=18.657099025326463&sw_lng=-99.5837533838374&zoom=10.180119851874752&zoom_level=10.180119851874752&search_by_map=true&price_filter_num_nights=5
export default function FiltrosPage() {
  const [searchParams] = useSearchParams();

  // Leer de parámetros de búsqueda
  const { ciudad_pais } = useParams();
  const checkIn = searchParams.get("checkin");
  const checkOut = searchParams.get("checkout");
  const homies = searchParams.get("adults");
  const pets = searchParams.get("allow_pets");
  const kids = searchParams.get("allow_children");

  const filtros: FiltrosPropiedades = {
    //Campos de ruta
    ciudad: ciudad_pais?.split("-")[0] || undefined,
    max_huespedes: homies
      ? Number.parseInt(homies)
      : undefined,
    regla_ninos: kids ? kids === "true" : undefined,
    regla_mascotas: pets ? pets === "true" : undefined,
    // Campos que se obtienen de un modal
    precio_min: 0,
    precio_max: 799999.99,
    habitaciones: undefined,
    banos: undefined,
    camas: undefined,
    tipo_id: undefined,
    amenidades: undefined,
    // Paginación
    page: undefined,
    size: undefined,
    // Fechas
    entrada: parseFecha(checkIn),
    salida: parseFecha(checkOut),
  };

  function setFiltro(key: "string", value: any) {
    searchParams.set(key, value);
  }

  const propiedadesQuery = usePropiedades(filtros);
  console.log(propiedadesQuery.data);
  return <div>{JSON.stringify(filtros)}</div>;
}

function parseFecha(fecha: string | null): string | undefined {
  if (!fecha) return undefined;
  const [day, month, year] = fecha.split("/").map(Number);
  if (!day || !month || !year) return undefined;
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}