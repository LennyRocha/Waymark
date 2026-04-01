import { Imagen } from "../NuevaPropiedad";

const imagenSlots: Imagen[] = Array.from(
  { length: 10 },
  (_, i) => ({
    prop_ima_id: 0,
    orden: i + 1,
  }),
);

export default imagenSlots;
