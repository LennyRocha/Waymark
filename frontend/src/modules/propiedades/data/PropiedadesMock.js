export const propiedadesMock = [
{
propiedad_id: 1,
titulo: "Casa moderna con alberca",
descripcion: "Hermosa casa moderna con alberca privada y jardín amplio.",
pais: "México",
ciudad: "Cuernavaca",
direccion: "Av Palmas 101",
activa: 1,
coordenadas: { lat: 18.9242, lng: -99.2216 },
precio_noche: 1800,
divisa: { divisa_id: 1, nombre: "Peso Mexicano", acronimo: "MXN" },
max_huespedes: 6,
habitaciones: 3,
camas: 4,
banos: 2,
check_in: "15:00",
check_out: "11:00",
regla_mascotas: true,
regla_ninos: true,
regla_fumar: false,
regla_fiestas: false,
regla_autochecar: true,
regla_apagar: true,
reglas_extra: null,
tipo: { id: 1, tipo: "Casa" },
anfitrion_id: 1,
amenidades: [
{ amenidad_id: 1, nombre: "Wifi", icono_nombre: "wifi", descripcion: "Internet", categoria: "General" },
{ amenidad_id: 2, nombre: "Alberca", icono_nombre: "pool", descripcion: "Piscina", categoria: "General" }
],
slug: "casa-moderna-alberca",
imagenes: [
{ prop_ima_id: 1, url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6", orden: 1 },
{ prop_ima_id: 2, url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85", orden: 2 }
]
},

{
propiedad_id: 2,
titulo: "Departamento céntrico moderno",
descripcion: "Departamento moderno en zona céntrica.",
pais: "México",
ciudad: "Ciudad de México",
direccion: "Calle Reforma 202",
activa: 1,
coordenadas: { lat: 19.4326, lng: -99.1332 },
precio_noche: 950,
divisa: { divisa_id: 1, nombre: "Peso Mexicano", acronimo: "MXN" },
max_huespedes: 3,
habitaciones: 1,
camas: 2,
banos: 1,
check_in: "14:00",
check_out: "12:00",
regla_mascotas: false,
regla_ninos: true,
regla_fumar: false,
regla_fiestas: false,
regla_autochecar: true,
regla_apagar: false,
reglas_extra: null,
tipo: { id: 2, tipo: "Departamento" },
anfitrion_id: 2,
amenidades: [
{ amenidad_id: 3, nombre: "TV", icono_nombre: "tv", descripcion: "Televisión", categoria: "Entretenimiento" }
],
slug: "departamento-centrico-moderno",
imagenes: [
{ prop_ima_id: 3, url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb", orden: 1 }
]
},

{
propiedad_id: 3,
titulo: "Cabaña rústica en bosque",
descripcion: "Cabaña acogedora rodeada de naturaleza.",
pais: "México",
ciudad: "Valle de Bravo",
direccion: "Camino Bosque 45",
activa: 1,
coordenadas: { lat: 19.195, lng: -100.132 },
precio_noche: 2200,
divisa: { divisa_id: 2, nombre: "Dólar", acronimo: "USD" },
max_huespedes: 5,
habitaciones: 2,
camas: 3,
banos: 1,
check_in: "16:00",
check_out: "10:00",
regla_mascotas: true,
regla_ninos: true,
regla_fumar: true,
regla_fiestas: false,
regla_autochecar: false,
regla_apagar: true,
reglas_extra: { chimenea: "Usar con cuidado" },
tipo: { id: 3, tipo: "Cabaña" },
anfitrion_id: 3,
amenidades: [
{ amenidad_id: 5, nombre: "Chimenea", icono_nombre: "fireplace", descripcion: "Chimenea", categoria: "General" }
],
slug: "cabana-bosque",
imagenes: [
{ prop_ima_id: 4, url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750", orden: 1 }
]
},

// continúan automáticamente...

...Array.from({ length: 17 }, (_, i) => ({
propiedad_id: i + 4,
titulo: `Propiedad demo ${i + 4}`,
descripcion: "Propiedad ficticia para pruebas del sistema.",
pais: "México",
ciudad: ["Querétaro","Guadalajara","Puebla","Tulum","Monterrey"][i % 5],
direccion: `Calle Demo ${i + 4}`,
activa: 1,
coordenadas: {
lat: 19 + (i * 0.01),
lng: -99 - (i * 0.01)
},
precio_noche: 800 + (i * 120),
divisa: { divisa_id: 1, nombre: "Peso Mexicano", acronimo: "MXN" },
max_huespedes: 2 + (i % 6),
habitaciones: 1 + (i % 4),
camas: 1 + (i % 5),
banos: 1 + (i % 3),
check_in: "15:00",
check_out: "11:00",
regla_mascotas: i % 2 === 0,
regla_ninos: true,
regla_fumar: false,
regla_fiestas: false,
regla_autochecar: true,
regla_apagar: true,
reglas_extra: null,
tipo: { id: (i % 3) + 1, tipo: ["Casa","Departamento","Cabaña"][i % 3] },
anfitrion_id: (i % 5) + 1,
amenidades: [
{
amenidad_id: 1,
nombre: "Wifi",
icono_nombre: "wifi",
descripcion: "Internet",
categoria: "General"
}
],
slug: `propiedad-demo-${i + 4}`,
imagenes: [
{
prop_ima_id: i + 10,
url: `https://a0.muscache.com/im/pictures/225729b8-a72d-4048-89a3-92000e80086a.jpg?im_w=960`,
orden: 1
}
]
}))
];