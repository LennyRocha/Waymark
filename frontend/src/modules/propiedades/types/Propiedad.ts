import Amenidad from "./Amenidad";
import Divisa from "./Divisa";
import Imagen from "./Imagen";
import TipoPropiedad from "./TipoPropiedad";

export default interface Propiedad {
  propiedad_id: number;

  titulo: string;
  descripcion: string;

  pais: string;
  ciudad: string;
  direccion: string;

  activa: number | null;

  coordenadas: {
    lat: number;
    lng: number;
  };

  precio_noche: number;

  divisa: Divisa;

  max_huespedes: number;
  habitaciones: number;
  camas: number;
  banos: number;

  check_in: string;
  check_out: string;

  regla_mascotas: number;
  regla_ninos: number;
  regla_fumar: number;
  regla_fiestas: number;
  regla_autochecar: number;
  regla_apagar: number;

  reglas_extra?: Record<string, any> | null;

  tipo: TipoPropiedad;

  anfitrion_id: number;

  amenidades: Amenidad[];

  slug: string;

  imagenes: Imagen[];
}

export type Ubicacion = {
  pais: string;
  ciudad: string;
};
