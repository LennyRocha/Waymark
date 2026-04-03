const fields = {
  titulo: "Título",
  descripcion: "Descripción",

  pais: "País",
  ciudad: "Ciudad",
  region: "Región",
  direccion: "Dirección",

  coordenadas: "Coordenadas",

  precio_noche: "Precio por noche",

  divisa: "Divisa",

  max_huespedes: "Máximo de huéspedes",
  habitaciones: "Habitaciones",
  camas: "Camas",
  banos: "Baños",

  check_in: "Check-in",
  check_out: "Check-out",

  regla_mascotas: "Regla de mascotas",
  regla_ninos: "Regla de niños",
  regla_fumar: "Regla de fumar",
  regla_fiestas: "Regla de fiestas",
  regla_autochecar: "Regla de autocheck-in",
  regla_apagar: "Regla de apagar luces",

  reglas_extra: "Reglas extra",

  tipo: "Tipo de propiedad",

  amenidades: "Amenidades",

  imagenes: "Imágenes",
};
const getPropiedadNameByField = (field: string) => {
    return fields[field as keyof typeof fields] || field;
};

export default getPropiedadNameByField;
