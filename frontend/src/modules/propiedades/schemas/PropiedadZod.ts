import { z } from "zod";

export const PropiedadSchema = z.object({
  titulo: z
    .string()
    .min(1, "Este campo no puede estar vacío")
    .max(
      50,
      "El título asignado no debe exceder los 50 carácteres",
    )
    .default(""),

  descripcion: z
    .string()
    .min(1, "Este campo no puede estar vacío")
    .max(
      500,
      "La descripción asignada no debe exceder los 500 carácteres",
    )
    .default(""),

  pais: z
    .string()
    .min(1, "Este campo no puede estar vacío")
    .max(25, "El país no debe exceder los 25 carácteres")
    .default(""),

  ciudad: z
    .string()
    .min(1, "Este campo no puede estar vacío")
    .max(25, "La ciudad no debe exceder los 25 carácteres")
    .default(""),

  direccion: z
    .string()
    .min(1, "Este campo no puede estar vacío")
    .max(
      100,
      "La dirección asignada no debe exceder los 100 carácteres",
    )
    .default(""),

  coordenadas: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .default({ lat: 0, lng: 0 }),

  precio_noche: z.coerce
    .number({
      error: "Este campo no puede estar vacío",
    })
    .positive("No se aceptan numeros menores o iguales a 0")
    .default(0),

  divisa_id: z.coerce
    .number()
    .min(1, "Este campo no puede estar vacío")
    .default(1),

  max_huespedes: z.coerce
    .number()
    .min(1, "No se aceptan numeros menores o iguales a 0")
    .default(1),

  habitaciones: z.coerce
    .number()
    .min(1, "No se aceptan numeros menores o iguales a 0")
    .max(20, "El límite de habitaciones es 20")
    .default(1),

  camas: z.coerce
    .number()
    .min(1, "No se aceptan numeros menores o iguales a 0")
    .max(20, "El límite de camas es 20")
    .default(1),

  banos: z.coerce
    .number()
    .min(1, "No se aceptan numeros menores o iguales a 0")
    .max(20, "El límite de baños es 20")
    .default(1),

  check_in: z
    .string()
    .min(1, "Este campo no puede estar vacío")
    .default(""),

  check_out: z
    .string()
    .min(1, "Este campo no puede estar vacío")
    .default(""),

  regla_mascotas: z.coerce.number().default(0),
  regla_ninos: z.coerce.number().default(0),
  regla_fumar: z.coerce.number().default(0),
  regla_fiestas: z.coerce.number().default(0),
  regla_autochecar: z.coerce.number().default(0),
  regla_apagar: z.coerce.number().default(0),

  reglas_extra: z
    .record(z.string(), z.any())
    .nullable()
    .default(null),

  tipo_id: z.coerce
    .number()
    .min(1, "Este campo no puede estar vacío")
    .default(1),

  anfitrion_id: z.coerce.number().min(1).default(1),

  amenidades_ids: z
    .array(z.coerce.number())
    .min(1, "Debe seleccionar al menos una amenidad")
    .default([]),

  imagenes: z
    .array(
      z.object({
        prop_ima_id: z.number().optional(),
        orden: z.number(),
        url: z.string().optional(),
        foto: z.instanceof(File).optional(),
      }),
    )
    .max(10, "Solo se permiten máximo 10 imágenes")
    .default([]),
});

export type PropiedadForm = z.infer<typeof PropiedadSchema>;

export type PropiedadUpdate = Partial<PropiedadForm>;
