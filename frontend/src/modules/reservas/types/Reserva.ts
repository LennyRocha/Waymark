export default interface Reserva {
  reserva_id: number;
  propiedad_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  huespedes: number;
  estado_nombre: string;
  codigo: string;
  precio_total: number;
  created_at: string;
}