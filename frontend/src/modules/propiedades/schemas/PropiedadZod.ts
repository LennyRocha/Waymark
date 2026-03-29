import { z } from "zod";

export const PropiedadSchema = z
  .object({
    titulo: z
      .string()
      .min(1, "Este campo no puede estar vacío")
      .max(
        50,
        "El título asignado no debe exceder los 50 carácteres",
      )
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚ ]+$/,
        "No puedes incluir números ni símbolos",
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
      .max(
        25,
        "La ciudad no debe exceder los 25 carácteres",
      )
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
        lat: z.number().min(-90).max(90),

        lng: z.number().min(-180).max(180),
      })
      .default({
        lat: 0,
        lng:  0,
      }),

    precio_noche: z.coerce
      .number()
      .min(
        1.0,
        "El precio asignado no debe ser menor o igual a 0",
      )
      .max(9999999.99, "El precio dado es demasiado grande")
      .default(1.00),

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
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Formato inválido (HH:mm)",
      )
      .default("00:00"),

    check_out: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Formato inválido (HH:mm)",
      )
      .default("00:01"),

    regla_mascotas: z.coerce.boolean().default(false),

    regla_ninos: z.coerce.boolean().default(false),

    regla_fumar: z.coerce.boolean().default(false),

    regla_fiestas: z.coerce.boolean().default(false),

    regla_autochecar: z.coerce.boolean().default(false),

    regla_apagar: z.coerce.boolean().default(false),

    reglas_extra: z
      .record(z.string(), z.any())
      .nullable()
      .default(null),

    tipo_id: z.coerce
      .number()
      .min(1, "Este campo no puede estar vacío")
      .default(0),

    amenidades_ids: z
      .array(z.coerce.number())
      .min(1, "Debe seleccionar al menos una amenidad")
      .default([]),

    imagenes: z
      .array(
        z.object({
          prop_ima_id: z.number().optional(),

          orden: z.number().min(1).max(10),

          url: z.instanceof(File).optional(),
        }),
      )
      .max(10, "Solo se permiten máximo 10 imágenes")
      .default([]),
  })

  .refine((data) => data.check_out > data.check_in, {
    message: "Check-out debe ser después del check-in",
    path: ["check_out"],
  });

export type PropiedadForm = z.infer<typeof PropiedadSchema>;

export type PropiedadUpdate = Partial<PropiedadForm>;
