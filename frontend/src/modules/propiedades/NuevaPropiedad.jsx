import React, { useEffect } from 'react'
"use client"
import { AnimatePresence } from "framer-motion"
import { motion } from 'framer-motion'
import { useState } from "react"
import { propiedadPlantilla } from './templates/PropiedadPlantilla'
import { ChevronLeft, ChevronRight, MapPin, Minus, Plus } from 'lucide-react'
import Map, { Marker } from 'react-map-gl/mapbox'
import { SearchBox } from '@mapbox/search-js-react'
import 'mapbox-gl/dist/mapbox-gl.css'
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'
import useTipos from './hooks/useTipos'
import { DynamicIcon } from 'lucide-react/dynamic'
import TiposIconos from './data/TiposIconos'
import TipoChip from './components/TipoChip'
import toast from 'react-hot-toast'
import CustomButton from '../../components/CustomButton'
import { getUserLocation } from '../../utils/getUserLocation'
import usePropiedadForm from './hooks/usePropiedadForm'
import { CustomCheckBox, CustomInput, CustomRadioButton, CustomSelect, CustomSwitch, CustomTextArea } from '../../components/CustomInputs'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

/** @typedef {import("./schemas/PropiedadZod").PropiedadForm} PropiedadForm */
export default function NuevaPropiedad() {
    const [formData, setFormData] = useState(propiedadPlantilla);
    const [selectedTab, setSelectedTab] = useState(0);
    const [userCoords, setUserCoords] = useState({ lat: 0, lng: 0 });

    const DEFAULT_LOCATION = {
        lat: 18.849545093738826,
        lng: -99.20111345293311
    };

    const form = usePropiedadForm();

    const prevStep = () => setSelectedTab((value) => value - 1);
    const nextStep = () => setSelectedTab((value) => value + 1);

    useEffect(() => {
        // TODO: Mientras no esté listo lo del token, usar este useEffect
        getUserLocation()
            .then((coords) => {
                setFormData({
                    ...formData,
                    anfitrion_id: 1,
                    coordenadas: coords
                });
                setUserCoords(coords);
            })
            .catch(() => {
                setFormData({
                    ...formData,
                    anfitrion_id: 1,
                    coordenadas: DEFAULT_LOCATION
                });
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
            props: { formData: formData, next: nextStep, change: handleChange, form }
        },
        {
            label: 'Ubicación',
            component: Step2,
            props: { formData, next: nextStep, prev: prevStep, change: handleChange, setCoordenadas, userCoords, form }
        },
        {
            label: 'Básicos',
            component: Step3,
            props: { formData: formData, next: nextStep, prev: prevStep, change: handleChange, form }
        },
        {
            label: 'Amenidades',
            component: Step4,
            props: { formData: formData, next: nextStep, prev: prevStep, setAmenidades: setAmenidades, change: handleChange, form }
        },
        {
            label: 'Imágenes',
            component: Step5,
            props: { formData: formData, next: nextStep, prev: prevStep, setFotos: setFotos, change: handleChange, form }
        },
        {
            label: 'Titulo',
            component: Step6,
            props: { formData: formData, next: nextStep, prev: prevStep, change: handleChange, form }
        },
        {
            label: 'Precio',
            component: Step7,
            props: { formData: formData, next: nextStep, prev: prevStep, change: handleChange, form }
        },
        {
            label: 'Reglas',
            component: Step8,
            props: { formData: formData, prev: prevStep, submit: handleSubmit, change: handleChange, form }
        },
    ]

    const [tipo, ubicacion, basicos, amenidades, fotos, titulo, precio, reglas] = allTabs

    const tabs = [tipo, ubicacion, basicos, amenidades, fotos, titulo, precio, reglas];

    const Tab = tabs[selectedTab]?.component
    const tabProps = tabs[selectedTab]?.props ?? {}
    const label = tabs[selectedTab]?.label ?? ""

    //1. Tipo de propiedad
    //2.  Ubicación
    //3. Básicos (huespedes, habitaciones, camas, banos, check_in, check_out)
    //4. Amenidades
    //5. Imágenes
    //6. Título y descripción
    //7. Precio por noche
    // 8. Reglas

    return (
        <div className='w-full flex flex-col items-center lg:items-start justify-center gap-1'>
            <h4>Registrar nueva propiedad</h4>
            <nav className='flex flex-row items-center justify-center gap-2 mb-2'>
                {/* <button className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-primary-700 rounded-full' onClick={prevStep} disabled={selectedTab === 0}><ChevronLeft color='#fff' size={18} /></button> */}
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
                {/* <button className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-primary-700 rounded-full' onClick={nextStep} disabled={selectedTab === tabs.length - 1}><ChevronRight color='#fff' size={18} /></button> */}
            </nav>
            <main className='flex items-center justify-center flex-1 w-full'>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tabs[selectedTab]?.label}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Tab {...tabProps} label={label} />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}

/** @param {{formData: PropiedadForm}} props */
const Step1 = ({ formData, next, change, label, form }) => {
    const tipos = useTipos();
    return <div className='w-full' >
        <div className="w-auto flex flex-col  gap-4">
            <h3>¿Qué tipo de alojamiento vas a compartir?</h3>
            {tipos.isLoading ? (
                <p>Cargando</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tipos.data?.map((t) => (
                        <TipoChip
                            key={t.id}
                            t={t}
                            currId={formData.tipo_id}
                            onChange={() => {
                                change({ target: { name: 'tipo_id', value: t.id } });
                                form.setValue("tipo_id", t.id)
                            }
                            }
                        />
                    ))}
                </div>
            )}
            <div className='w-full flex flex-row items-center justify-end' >
                <CustomButton customWidth="w-full lg:w-[225px]" variant='secondary' onClick={next} disabled={formData.tipo_id === 0} isWaiting={tipos.isLoading} >
                    Siguiente
                </CustomButton>
            </div>
        </div>
    </div>
}

/** @param {{formData: PropiedadForm}} props */
const Step2 = ({ formData, next, prev, change, setCoordenadas, form }) => {
    const [viewState, setViewState] = useState({
        longitude: formData.coordenadas.lng || -99.1332,  // CDMX por defecto
        latitude: formData.coordenadas.lat || 19.4326,
        zoom: 12
    })

    const handleRetrieve = (res) => {
        const feature = res.features[0]
        const [lng, lat] = feature.geometry.coordinates

        const ciudad = feature.properties.context.place.name;
        const pais = feature.properties.context.country.name;

        setCoordenadas({ lat, lng })
        change({ target: { name: 'direccion', value: feature.properties.full_address } })
        change({ target: { name: 'ciudad', value: ciudad } })
        change({ target: { name: 'pais', value: pais } })

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
        const context = res.body.features[0].context ?? []

        const ciudad = context.find(c => c.id.startsWith('place'))?.text
        const pais = context.find(c => c.id.startsWith('country'))?.text

        if (direccion) {
            change({ target: { name: 'direccion', value: direccion } })
            change({ target: { name: 'ciudad', value: ciudad } })
            change({ target: { name: 'pais', value: pais } })
        }
    }

    async function changeAndNext() {
        form.setValue("direccion", formData.direccion);
        form.setValue("ciudad", formData.ciudad);
        form.setValue("pais", formData.pais);
        form.setValue("coordenadas", formData.coordenadas, {
            shouldValidate: true,
            shouldDirty: true
        });
        const valid = await form.trigger(fieldsByStep[1]);
        if (valid) next();
    }

    return (
        <div className='flex flex-col gap-4 w-full'>
            <h3>¿Dónde está tu propiedad?</h3>

            {formData.coordenadas.lat > 0 && formData.coordenadas.lng > 0 && (
                <h6>{formData.coordenadas.lat} - {formData.coordenadas.lng}</h6>
            )}
            {formData.direccion && (<h6>Dirección: {formData.direccion}</h6>)}

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
                style={{ width: '100%', minWidth: 250, height: 400, borderRadius: 12 }}
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

            <div className='w-full flex flex-row items-center justify-end gap-2' >
                <CustomButton variant='tertiary' onClick={prev}>
                    Anterior
                </CustomButton>
                <CustomButton variant='secondary' onClick={async () => await changeAndNext()} disabled={formData.direccion === '' && formData.ciudad === '' && formData.pais === ''}>
                    Siguiente
                </CustomButton>
            </div>
        </div>
    )
}

/** @param {{formData: PropiedadForm}} props */
const Step3 = ({ formData, prev, next, change, label, form }) => {
    console.log(form.getValues())
    const maxHuespedes = form.watch("max_huespedes");
    const camas = form.watch("camas");
    const banos = form.watch("banos");
    const habiitaciones = form.watch("habitaciones");
    return <div className='w-full flex gap-6 flex-col'>
        <h3>¿A cuantos huéspedes te gustaría recibir?</h3>
        <nav className='flex justify-between items-center my-1'>
            <h5>Húespedes</h5>
            <div className='flex flex-row items-center justify-center gap-2 mb-2'>

                <button
                    type="button"
                    disabled={maxHuespedes === 1}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={() =>
                        form.setValue(
                            "max_huespedes",
                            maxHuespedes - 1,
                            { shouldValidate: true, shouldDirty: true }
                        )
                    }
                >
                    <Minus color='var(--color-text-secondary)' size={18} />
                </button>

                <p>
                    {maxHuespedes}
                </p>

                <button
                    type="button"
                    disabled={maxHuespedes === 20}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={() =>
                        form.setValue(
                            "max_huespedes",
                            maxHuespedes + 1,
                            { shouldValidate: true, shouldDirty: true }
                        )
                    }
                >
                    <Plus color='var(--color-text-secondary)' size={18} />
                </button>
            </div>
        </nav>
        <nav className='flex justify-between items-center my-1'>
            <h5>Recámaras</h5>
            <div className='flex flex-row items-center justify-center gap-2 mb-2'>

                <button
                    type="button"
                    disabled={habiitaciones === 1}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={() =>
                        form.setValue(
                            "habitaciones",
                            habiitaciones - 1,
                            { shouldValidate: true, shouldDirty: true }
                        )
                    }
                >
                    <Minus color='var(--color-text-secondary)' size={18} />
                </button>

                <p>
                    {habiitaciones}
                </p>

                <button
                    type="button"
                    disabled={habiitaciones === 20}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={() =>
                        form.setValue(
                            "habitaciones",
                            habiitaciones + 1,
                            { shouldValidate: true, shouldDirty: true }
                        )
                    }
                >
                    <Plus color='var(--color-text-secondary)' size={18} />
                </button>

            </div>
        </nav>
        <nav className='flex justify-between items-center my-1'>
            <h5>Camas</h5>
            <div className='flex flex-row items-center justify-center gap-2 mb-2'>

                <button
                    type="button"
                    disabled={camas === 1}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={() =>
                        form.setValue(
                            "cams",
                            camas - 1,
                            { shouldValidate: true, shouldDirty: true }
                        )
                    }
                >
                    <Minus color='var(--color-text-secondary)' size={18} />
                </button>

                <p>
                    {camas}
                </p>

                <button
                    type="button"
                    disabled={camas === 20}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={() =>
                        form.setValue(
                            "camas",
                            camas + 1,
                            { shouldValidate: true, shouldDirty: true }
                        )
                    }
                >
                    <Plus color='var(--color-text-secondary)' size={18} />
                </button>

            </div>
        </nav>
        <nav className='flex justify-between items-center my-1'>
            <h5>Baños</h5>
            <div className='flex flex-row items-center justify-center gap-2 mb-2'>

                <button
                    type="button"
                    disabled={banos === 1}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={() =>
                        form.setValue(
                            "banos",
                            banos - 1,
                            { shouldValidate: true, shouldDirty: true }
                        )
                    }
                >
                    <Minus color='var(--color-text-secondary)' size={18} />
                </button>

                <p>
                    {banos}
                </p>

                <button
                    type="button"
                    disabled={banos === 20}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={() =>
                        form.setValue(
                            "banos",
                            banos + 1,
                            { shouldValidate: true, shouldDirty: true }
                        )
                    }
                >
                    <Plus color='var(--color-text-secondary)' size={18} />
                </button>

            </div>
        </nav>

        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='tertiary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next}>
                Siguiente
            </CustomButton>
        </div>
    </div>
}

/** @param {{formData: PropiedadForm}} props */
const Step4 = ({ formData, prev, next, setAmenidades, change, label, form }) => {
    return <div className='w-full flex gap-2 flex-col'>
        <h3>¿Qué es lo que ofrece tu propiedad?</h3>
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='secondary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next}>
                Siguiente
            </CustomButton>
        </div>
    </div>
}

/** @param {{formData: PropiedadForm}} props */
const Step5 = ({ formData, prev, next, setFotos, change, label, form }) => {
    return <div className='w-full flex gap-2 flex-col'>
        <h3>Compartenos unas imágenes de tu propiedad</h3>
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='secondary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next}>
                Siguiente
            </CustomButton>
        </div>
    </div>
}

/** @param {{formData: PropiedadForm}} props */
const Step6 = ({ formData, prev, next, change, label, form }) => {
    return <div className='w-full flex gap-2 flex-col'>
        <h3>Dale identidad a tu propiedad</h3>
        <CustomInput label='Título' placeholder='Ingresa el título' icon='calendar' helperText='Hola' />
        <CustomTextArea label='Descripción' rows={4} placeholder='Ingresa el título' helperText='Hola' icon='calendar' />
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='tertiary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next}>
                Siguiente
            </CustomButton>
        </div>
    </div>
}

/** @param {{formData: PropiedadForm}} props */
const Step7 = ({ formData, prev, next, change, label, form }) => {
    return <div className='w-full flex gap-2 flex-col'>
        <h3>¡Define tu precio!</h3>
        <CustomSelect label='Selecciona' helperText='Ayuda' options={[
            { label: "Casa", value: "casa" },
            { label: "Departamento", value: "depto" },
            { label: "Cabaña", value: "cabana" }
        ]}  />
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='secondary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next}>
                Siguiente
            </CustomButton>
        </div>
    </div>
}

/** @param {{formData: PropiedadForm}} props */
const Step8 = ({ formData, prev, submit, change, label, form }) => {
    return <div className='w-full flex gap-2 flex-col'>
        <h3>Sólo unas preguntas mas...</h3>
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomCheckBox />
            <CustomRadioButton />
            <CustomSwitch />
            <CustomButton variant='secondary' onClick={prev} >
                Anterior
            </CustomButton>
        </div>
    </div>
}

const fieldsByStep = {
    0: ["tipo_id"],
    1: ["coordenadas", "direccion", "ciudad", "pais"],
    2: ["max_huespedes", "camas", "habitaciones", "banos", "check_in", "check_out"],
    3: ["amenidades_ids"],
    4: ["imagenes"],
    5: ["titulo", "descripcion"],
    6: ["precio_noche"],
    7: ["reglas_extra", "regla_mascotas", "regla_ninos", "regla_fumar", "regla_fiestas", "regla_autochecar", "regla_apagar"],
};