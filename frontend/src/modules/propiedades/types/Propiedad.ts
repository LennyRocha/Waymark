import Amenidad from "./Amenidad";
import Divisa from "../../divisas/types/Divisa";
import Imagen from "./Imagen";
import TipoPropiedad from "./TipoPropiedad";

export default interface Propiedad {
  propiedad_id: number;

  titulo: string;
  descripcion: string;

  pais: string;
  ciudad: string;
  region: string;
  direccion: string;

  activa: boolean;

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

  regla_mascotas: boolean;
  regla_ninos: boolean;
  regla_fumar: boolean;
  regla_fiestas: boolean;
  regla_autochecar: boolean;
  regla_apagar: boolean;

  reglas_extra?: Record<string, any> | null;

  tipo: TipoPropiedad;

  anfitrion_id: number;

  amenidades: Amenidad[];

  slug: string;

  imagenes: Imagen[];
}

export type Ubicacion = {
  pais: string;
  region: string;
  ciudad: string;
};
