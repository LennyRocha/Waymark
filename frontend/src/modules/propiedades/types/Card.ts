export default interface Card {
  propiedad_id: number;
  ciudad: string;
  region: string;
  pais: string;
  precio_noche: number;
  slug: string;
  portada: string;
  promedio: number | null;
  divisa: string;
  tipo: string;
  favorito_id: number | null;
  es_favorito: boolean;
  es_mi_favorito: boolean;
}

export interface CardsResponse {
  ciudad: string | null;
  cards: Card[];
}

export interface LandingResponse {
  favoritos: Card[];
  ciudades: CardsResponse[];
}