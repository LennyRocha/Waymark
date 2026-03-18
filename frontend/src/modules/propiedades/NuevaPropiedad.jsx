import React, { useEffect } from 'react'
"use client"
import { AnimatePresence } from "framer-motion"
import { motion } from 'framer-motion'
import { useState } from "react"
import { propiedadPlantilla } from './templates/PropiedadPlantilla'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import Map, { Marker } from 'react-map-gl/mapbox'
import { SearchBox } from '@mapbox/search-js-react'
import 'mapbox-gl/dist/mapbox-gl.css'
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

/** @typedef {import("./schemas/PropiedadZod").PropiedadForm} PropiedadForm */
export default function NuevaPropiedad() {
    const [formData, setFormData] = useState(propiedadPlantilla);
    const [selectedTab, setSelectedTab] = useState(0);

    const prevStep = () => setSelectedTab((value) => value - 1);
    const nextStep = () => setSelectedTab((value) => value + 1);

    useEffect(() => {
        // TODO: Mientras no esté listo lo del token, usar este useEffect
        setFormData({
            ...formData,
            anfitrion_id: 1
        });
    }, []);

    function setCoordenadas(obj = { lat: 0, lng: 0 }) {
        setFormData(prev => ({ ...prev, coordenadas: obj }))
    }

    function setFotos(list) {
        setFormData(prev => ({ ...prev, imagenes: list }))
    }

    function setAmenidades(list) {
        setFormData(prev => ({ ...prev, amenidades_ids: list }))
    }

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function handleSubmit(e) {
        e.preventDefautl();
        //Después, ya me cansé
    }

    const allTabs = [
        {
            label: 'Tipo',
            component: Step1,
            props: { formData: formData, next: nextStep, change: handleChange }
        },
        {
            label: 'Ubicación',
            component: Step2,
            props: { formData: formData, next: nextStep, change: handleChange, setCoordenadas: setCoordenadas }
        },
        {
            label: 'Básicos',
            component: Step3,
            props: { formData: formData, next: nextStep, prev: prevStep, change: handleChange }
        },
        {
            label: 'Amenidades',
            component: Step4,
            props: { formData: formData, next: nextStep, prev: prevStep, setAmenidades: setAmenidades, change: handleChange }
        },
        {
            label: 'Imágenes',
            component: Step5,
            props: { formData: formData, next: nextStep, prev: prevStep, setFotos: setFotos, change: handleChange }
        },
        {
            label: 'Titulo',
            component: Step6,
            props: { formData: formData, next: nextStep, prev: prevStep, change: handleChange }
        },
        {
            label: 'Precio',
            component: Step7,
            props: { formData: formData, next: nextStep, prev: prevStep, change: handleChange }
        },
        {
            label: 'Reglas',
            component: Step8,
            props: { formData: formData, prev: prevStep, submit: handleSubmit, change: handleChange }
        },
    ]

    const [tipo, ubicacion, basicos, amenidades, fotos, titulo, precio, reglas] = allTabs

    const tabs = [tipo, ubicacion, basicos, amenidades, fotos, titulo, precio, reglas];

    const Tab = tabs[selectedTab]?.component
    const tabProps = tabs[selectedTab]?.props ?? {}
    const label = tabs[selectedTab]?.label ?? ""

    //1. Tipo de propiedad
    //2.  Ubicación
    //3. Básicos (huespedes, habitaciones, camas, banos)
    //4. Amenidades
    //5. Imágenes
    //6. Título y descripción
    //7. Precio por noche
    // 8. Reglas

    return (
        <div className='w-full flex flex-col items-start justify-start'>
            <h3>Registrar nueva propiedad</h3>
            <nav className='flex flex-row items-center justify-center gap-2'>
                <button className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-primary-700 rounded-full' onClick={prevStep} disabled={selectedTab === 0}><ChevronLeft color='#fff' size={18} /></button>
                <p>Paso{" "}
                    <AnimatePresence mode="wait">
                        <motion.b
                            key={selectedTab}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.15 }}
                            style={{ display: "inline-block" }}
                        >
                            {selectedTab + 1}
                        </motion.b>
                    </AnimatePresence>
                    {" "}de <b>{tabs.length}</b>
                </p>
                <button className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-primary-700 rounded-full' onClick={nextStep} disabled={selectedTab === tabs.length - 1}><ChevronRight color='#fff' size={18} /></button>
            </nav>
            <main style={iconContainer}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tabs[selectedTab]?.label}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={icon}
                    >
                        <Tab {...tabProps} label={label} />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}

/**
 * ==============   Styles   ================
 */

const iconContainer = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%"
}

const icon = {
    fontSize: 128,
}

/** @param {{formData: PropiedadForm}} props */
const Step1 = ({ formData, next, change, label }) => {
    return <h1>Paso 1 {label}</h1>
}

/** @param {{formData: PropiedadForm}} props */
const Step2 = ({ formData, next, prev, change, setCoordenadas }) => {
    const [viewState, setViewState] = useState({
        longitude: formData.coordenadas.lng || -99.1332,  // CDMX por defecto
        latitude: formData.coordenadas.lat || 19.4326,
        zoom: 12
    })

    const handleRetrieve = (res) => {
        const feature = res.features[0]
        const [lng, lat] = feature.geometry.coordinates

        // Simulas el evento que espera tu handleChange
        setCoordenadas({ lat, lng })
        change({ target: { name: 'direccion', value: feature.properties.full_address } })

        setViewState(prev => ({ ...prev, longitude: lng, latitude: lat, zoom: 15 }))
    }

    const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN })

    const handleMapClick = async (e) => {
        const { lng, lat } = e.lngLat

        setCoordenadas({ lat, lng })
        setViewState(prev => ({ ...prev, longitude: lng, latitude: lat }))

        // Geocoding inverso
        const res = await geocodingClient.reverseGeocode({
            query: [lng, lat],
            language: ['es'],
            countries: ['mx'],
            limit: 1
        }).send()

        const direccion = res.body.features[0]?.place_name
        if (direccion) {
            change({ target: { name: 'direccion', value: direccion } })
        }
    }

    return (
        <div className='flex flex-col gap-4 w-full'>
            <h2>¿Dónde está tu propiedad?</h2>

            <SearchBox
                accessToken={MAPBOX_TOKEN}
                onRetrieve={handleRetrieve}
                placeholder='Busca tu dirección...'
                language='es'
                country='MX'
            />

            <Map
                {...viewState}
                onMove={e => setViewState(e.viewState)}
                style={{ width: '100%', height: 400, borderRadius: 12 }}
                mapStyle='mapbox://styles/mapbox/streets-v12'
                mapboxAccessToken={MAPBOX_TOKEN}
                onClick={handleMapClick}
                cursor='crosshairs'
            >
                {formData.coordenadas?.lat && formData.coordenadas?.lng && (
                    <Marker
                        longitude={formData.coordenadas.lng ?? -99.22557954}
                        latitude={formData.coordenadas.lat ?? 18.83204343}
                        anchor='bottom'
                    >
                        <MapPin color='var(--color-primary-500)' size={32} />
                    </Marker>
                )}
            </Map>
            {formData.coordenadas.lat && formData.coordenadas.lng && (
                <h6>{formData.coordenadas.lat} - {formData.coordenadas.lng}</h6>
            )}
            {formData.direccion && (<h6>Dirección: {formData.direccion}</h6>)}
        </div>
    )
}

/** @param {{formData: PropiedadForm}} props */
const Step3 = ({ formData, prev, next, change, label }) => {
    return <h1>Paso 3 {label}</h1>
}

/** @param {{formData: PropiedadForm}} props */
const Step4 = ({ formData, prev, next, setAmenidades, change, label }) => {
    return <h1>Paso 4 {label}</h1>
}

/** @param {{formData: PropiedadForm}} props */
const Step5 = ({ formData, prev, next, setFotos, change, label }) => {
    return <h1>Paso 5 {label}</h1>
}

/** @param {{formData: PropiedadForm}} props */
const Step6 = ({ formData, prev, next, change, label }) => {
    return <h1>Paso 6 {label}</h1>
}

/** @param {{formData: PropiedadForm}} props */
const Step7 = ({ formData, prev, next, change, label }) => {
    return <h1>Paso 7 {label}</h1>
}

/** @param {{formData: PropiedadForm}} props */
const Step8 = ({ formData, prev, submit, change, label }) => {
    return <h1>Paso 8 {label}</h1>
}

