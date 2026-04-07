export default interface Imagen {
    prop_ima_id: number,
    url?: string | File,
    orden: number,
    preview?: string
}

export type Payload = {
  propiedad: number;
  imagenes: File[];
  ordenes: number[];
};