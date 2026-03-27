import React, { useEffect, useRef } from 'react'
"use client"
import { AnimatePresence } from "framer-motion"
import { motion } from 'framer-motion'
import { useState } from "react"
import { propiedadPlantilla } from './templates/PropiedadPlantilla'
import { AlertCircle, ChevronLeft, ChevronRight, MapPin, Minus, Plus } from 'lucide-react'
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
import CustomLoader from '../../layout/CustomLoader'
import Chip from '../../components/Chip'
import useAmenidades from './hooks/useAmenidades'
import { useWatch } from 'react-hook-form'
import Accordion from '../../components/Accordion'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

/** @typedef {import("./schemas/PropiedadZod").PropiedadForm} PropiedadForm */
export default function NuevaPropiedad() {
    const [formData, setFormData] = useState(propiedadPlantilla);
    const [selectedTab, setSelectedTab] = useState(0);

    const DEFAULT_LOCATION = {
        lat: 18.849545093738826,
        lng: -99.20111345293311
    };
    const [userCoords, setUserCoords] = useState(DEFAULT_LOCATION);

    const form = usePropiedadForm();

    const prevStep = () => setSelectedTab((value) => value - 1);
    const nextStep = () => setSelectedTab((value) => value + 1);

    function validateStep(step) {
        const fields = fieldsByStep[step];

        const canContinue = fields.every(
            (field) =>
                form.formState.dirtyFields[field] &&
                !form.formState.errors[field]
        );

        return canContinue;
    }

    useEffect(() => {
        // TODO: Mientras no esté listo lo del token, usar este useEffect
        const load = async () => {
            try {
                const coords = await getUserLocation();
                setFormData((prev) => ({
                    ...prev,
                    anfitrion_id: 1,
                    coordenadas: coords
                }));
                console.log("Coordenadas obtenidas", coords)
                setUserCoords(coords);
            } catch (error) {
                console.error(error)
                setFormData((prev) => ({
                    ...prev,
                    anfitrion_id: 1,
                    coordenadas: DEFAULT_LOCATION
                }));
            }
        }
        load();
    }, []);

    async function setCoordenadas(obj = { lat: 0, lng: 0 }) {
        setFormData(prev => ({ ...prev, coordenadas: obj }))
        await form.setValue("coordenadas", obj, {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    function setFotos(list) {
        form.setValue("imagenes", list, {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    async function setAmenidades(list) {
        await form.setValue("amenidades_ids", list, {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function doChange(tag, value) {
        await form.setValue(tag, value, {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    function onSubmit(e) {
        e.preventDefautl();
        //Después, ya me cansé
    }

    const allTabs = [
        {
            label: 'Tipo',
            component: Step1,
            props: { formData: formData, next: nextStep, change: doChange, form, validateStep }
        },
        {
            label: 'Ubicación',
            component: Step2,
            props: { formData, next: nextStep, prev: prevStep, change: doChange, setCoordenadas, userCoords, form, validateStep }
        },
        {
            label: 'Básicos',
            component: Step3,
            props: { formData: formData, next: nextStep, prev: prevStep, change: doChange, form, validateStep }
        },
        {
            label: 'Amenidades',
            component: Step4,
            props: { formData: formData, next: nextStep, prev: prevStep, setAmenidades: setAmenidades, change: handleChange, form, validateStep }
        },
        {
            label: 'Imágenes',
            component: Step5,
            props: { formData: formData, next: nextStep, prev: prevStep, setFotos: setFotos, change: handleChange, form, validateStep }
        },
        {
            label: 'Titulo',
            component: Step6,
            props: { formData: formData, next: nextStep, prev: prevStep, change: handleChange, form, validateStep }
        },
        {
            label: 'Precio',
            component: Step7,
            props: { formData: formData, next: nextStep, prev: prevStep, change: handleChange, form, validateStep }
        },
        {
            label: 'Reglas',
            component: Step8,
            props: { formData: formData, prev: prevStep, submit: form.handleSubmit(onSubmit), change: handleChange, form, validateStep }
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
const Step1 = ({ next, change, form, validateStep }) => {
    const tipos = useTipos();
    const currTip = useWatch({
        control: form.control,
        name: "tipo_id"
    });
    const canContinue = validateStep(0);
    return <div className='w-full' >
        <div className="w-auto flex flex-col  gap-4">
            <h3>¿Qué tipo de alojamiento vas a compartir?</h3>
            {tipos.isLoading ? (
                <CustomLoader />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tipos.data?.map((t) => (
                        <TipoChip
                            key={t.id}
                            t={t}
                            currId={currTip}
                            onChange={async () => {
                                await change('tipo_id', t.id);
                            }
                            }
                        />
                    ))}
                </div>
            )}
            <div className='w-full flex flex-row items-center justify-end' >
                <CustomButton customWidth="w-full lg:w-[225px]" variant='secondary' onClick={next} disabled={!canContinue} isWaiting={tipos.isLoading} >
                    Siguiente
                </CustomButton>
            </div>
        </div>
    </div>
}

/** @param {{formData: PropiedadForm}} props */
const Step2 = ({ next, prev, change, setCoordenadas, form, userCoords, validateStep }) => {
    const mapRef = useRef(null);
    const coords = useWatch({
        control: form.control,
        name: "coordenadas"
    });
    const direction = useWatch({
        control: form.control,
        name: "direccion"
    });

    useEffect(() => {
        if (mapRef.current) {
            setTimeout(() => {
                mapRef.current.resize();
            }, 200);
        }
    }, [direction]);

    const [loading, setLoading] = useState(false);

    const canContinue = validateStep(1)

    const [viewState, setViewState] = useState({
        longitude: userCoords.lng,
        latitude: userCoords.lat,
        zoom: 12
    })

    useEffect(() => {
        if (userCoords?.lat && userCoords?.lng) {
            setViewState({
                longitude: userCoords.lng,
                latitude: userCoords.lat,
                zoom: 12
            });
        }
    }, [userCoords]);

    const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN })

    const handleRetrieve = async (res) => {
        setLoading(true);
        const feature = res.features[0]
        const [lng, lat] = feature.geometry.coordinates

        const direccion = feature.properties.full_address;
        const ciudad = feature.properties.context.place.name;
        const pais = feature.properties.context.country.name;

        await setCoordenadas({ lat, lng })
        if (direccion) {
            await change("direccion", direccion)
            await change("ciudad", ciudad)
            await change("pais", pais)
        }

        setViewState(prev => ({ ...prev, longitude: lng, latitude: lat, zoom: 15 }))

        mapRef.current?.resize();
        setLoading(false);
    }

    const handleMapClick = async (e) => {
        setLoading(true);
        const { lng, lat } = e.lngLat

        await setCoordenadas({ lat, lng })
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
            await change("direccion", direccion)
            await change("ciudad", ciudad)
            await change("pais", pais)
        }

        mapRef.current?.resize();
        setLoading(false);
    }

    const markerLng =
        coords?.lng !== 0
            ? coords.lng
            : userCoords.lng;

    const markerLat =
        coords?.lat !== 0
            ? coords.lat
            : userCoords.lat;

    return (
        <div className='flex flex-col gap-4 w-full'>
            <h3>¿Dónde está tu propiedad?</h3>

            <AnimatePresence>
                {direction !== "" && (<motion.h6
                    className='break-all w-full'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >Dirección: {direction}</motion.h6>)}
            </AnimatePresence>

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
                style={{ width: '100%', minWidth: 300, height: 400, borderRadius: 12 }}
                mapStyle='mapbox://styles/mapbox/streets-v12'
                mapboxAccessToken={MAPBOX_TOKEN}
                onClick={handleMapClick}
                cursor='crosshairs'
                ref={mapRef}
            >
                <Marker
                    longitude={markerLng}
                    latitude={markerLat}
                    anchor='bottom'
                >
                    <MapPin color='#fff' fill='var(--color-secondary-500)' size={32} strokeWidth={1} />
                </Marker>
            </Map>

            <div className='w-full flex flex-row items-center justify-end gap-2' >
                <CustomButton variant='tertiary' onClick={prev}>
                    Anterior
                </CustomButton>
                <CustomButton variant='secondary' onClick={next} disabled={!canContinue} isWaiting={loading} >
                    Siguiente
                </CustomButton>
            </div>
        </div>
    )
}

/** @param {{formData: PropiedadForm}} props */
const Step3 = ({ prev, next, change, form }) => {
    const maxHuespedes = useWatch({
        control: form.control,
        name: "max_huespedes"
    });
    const camas = useWatch({
        control: form.control,
        name: "camas"
    });
    const banos = useWatch({
        control: form.control,
        name: "banos"
    });
    const habiitaciones = useWatch({
        control: form.control,
        name: "habitaciones"
    });
    return <div className='w-full flex gap-6 flex-col'>
        <h3>¿A cuantos huéspedes te gustaría recibir?</h3>
        <nav className='flex justify-between items-center my-1'>
            <h5>Húespedes</h5>
            <div className='flex flex-row items-center justify-center gap-2 mb-2'>

                <button
                    type="button"
                    disabled={maxHuespedes === 1}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={async () =>
                        await change(
                            "max_huespedes",
                            maxHuespedes - 1
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
                    onClick={async () =>
                        await change(
                            "max_huespedes",
                            maxHuespedes + 1
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
                    onClick={async () =>
                        await change(
                            "habitaciones",
                            habiitaciones - 1
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
                    onClick={async () =>
                        await change(
                            "habitaciones",
                            habiitaciones + 1
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
                    onClick={async () =>
                        await change(
                            "camas",
                            camas - 1
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
                    onClick={async () =>
                        await change(
                            "camas",
                            camas + 1
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
                    onClick={async () =>
                        await change(
                            "banos",
                            banos - 1
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
                    onClick={async () =>
                        await change(
                            "banos",
                            banos + 1
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
const Step4 = ({ prev, next, setAmenidades, form }) => {
    const list = useWatch({
        control: form.control,
        name: "amenidades_ids"
    });
    const amenidades = useAmenidades()
    const grouped = (amenidades.data ?? []).reduce((acc, a) => {
        if (!acc[a.categoria]) {
            acc[a.categoria] = [];
        }
        acc[a.categoria].push(a);
        return acc;
    }, {});
    const canContinue = list.length > 0;
    return <div className='w-full flex gap-2 flex-col'>
        <h3>¿Qué es lo que ofrece tu propiedad?</h3>
        {amenidades.isLoading ? (
            <CustomLoader />
        ) : (
            <div className="flex flex-col gap-4 max-w-[800px]">
                {Object.entries(grouped ?? {}).map(
                    ([categoria, items]) => (
                        <div key={categoria}>

                            {/* Título categoría */}
                            <p className="font-bold mb-2">
                                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                            </p>

                            {/* Chips de la categoría */}
                            <div className="flex flex-wrap items-center gap-2 justify-center">
                                {items.map((a) => {
                                    const selected = list.includes(
                                        a.amenidad_id
                                    );

                                    return (
                                        <Chip
                                            key={a.amenidad_id}
                                            selected={selected}
                                            label={a.nombre}
                                            icon={a.icono_nombre}
                                            onClick={async () => {
                                                if (!selected) {
                                                    await setAmenidades(
                                                        [...list, a.amenidad_id],
                                                    );
                                                }
                                            }}
                                            onDelete={async () => {
                                                await setAmenidades(
                                                    list.filter(
                                                        (id) => id !== a.amenidad_id
                                                    ),
                                                );
                                            }}
                                        />
                                    );
                                })}
                            </div>

                        </div>
                    )
                )}
            </div>
        )}
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='tertiary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next} disabled={!canContinue}>
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
    const fields = fieldsByStep[5];

    const canContinue = fields.every(
        (field) =>
            form.formState.dirtyFields[field] &&
            !form.formState.errors[field]
    );

    return <div className='w-full flex gap-2 flex-col'>
        <h3>Dale identidad a tu propiedad</h3>
        <CustomInput label='Título' placeholder='Define un título para tu propiedad.' {...form.register("titulo")} name='titulo'
            isError={
                !!form.formState.errors.titulo &&
                form.formState.touchedFields.titulo
            }
            ErrorElement={<FieldErrors errors={form.formState.errors} name="titulo" />} maxLength={50} />
        <CustomTextArea label='Descripción' rows={4} placeholder='Cuentanos más acerca de ella.' name='descripcion'
            {...form.register("descripcion")}
            isError={
                !!form.formState.errors.descripcion &&
                form.formState.touchedFields.descripcion
            }
            ErrorElement={<FieldErrors errors={form.formState.errors} name="descripcion" />} maxLength={500} />
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='tertiary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next} disabled={!canContinue}>
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
        ]} />
        <CustomLoader />
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
    const items = [{
        title: "Hola",
        content: <h2>Hola</h2>
    }, {
        title: "Hola",
        content: <h2>Hola</h2>
    }, {
        title: "Hola",
        content: <h2>Hola</h2>
    }, {
        title: "Hola",
        content: <h2>Hola</h2>
    }]
    const mascotas = useWatch({
        control: form.control,
        name: "regla_mascotas"
    });
    const fumar = useWatch({
        control: form.control,
        name: "regla_fumar"
    });
    const ninos = useWatch({
        control: form.control,
        name: "regla_ninos"
    });
    const fiestas = useWatch({
        control: form.control,
        name: "regla_fiestas"
    });
    const reglasJson = useWatch({
        control: form.control,
        name: "reglas_extra"
    });
    return <div className='w-full flex gap-2 flex-col'>
        <h3>Sólo unas preguntas mas...</h3>
        <div className="flex justify-between items-center">
            <h5>¿Permites mascotas?</h5>
            <CustomCheckBox checked={mascotas} />
        </div>
        <div className="flex justify-between items-center">
            <h5>¿Permites niños?</h5>
            <CustomCheckBox checked={ninos} />
        </div>
        <div className="flex justify-between items-center">
            <h5>¿Permites fiestas?</h5>
            <CustomCheckBox checked={fiestas} />
        </div>
        <div className="flex justify-between items-center">
            <h5>¿Cuentas con área para fumar?</h5>
            <CustomCheckBox checked={fumar} />
        </div>
        <Accordion items={items} />
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomCheckBox />
            <CustomRadioButton />
            <CustomSwitch />
            <CustomButton variant='tertiary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={prev}>
                Guardar
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

const FieldErrors = ({ errors, name }) => {

    const fieldError = errors[name];

    if (!fieldError) return null;

    // múltiples errores
    if (fieldError.types) {
        return (
            <ul className="text-orange-500 text-sm mt-1  text-left ">
                {Object.values(fieldError.types).map((msg, i) => (
                    <li className='flex gap-1 items-center' key={i}><AlertCircle fill='var(--color-orange-500)' color='#fff' />{msg}</li>
                ))}
            </ul>
        );
    }

    // error único
    return (
        <p className="text-red-500 text-sm mt-1 text-left flex gap-1 items-center">
            <AlertCircle fill='var(--color-orange-500)' color='#fff' />
            {fieldError.message}
        </p>
    );
};