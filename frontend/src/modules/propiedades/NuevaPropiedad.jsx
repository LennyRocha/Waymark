import React, { useEffect, useRef } from 'react'
import { AnimatePresence } from "framer-motion"
import { motion } from 'framer-motion'
import { useState } from "react"
import { propiedadPlantilla } from './templates/PropiedadPlantilla'
import { AlertCircle, ChevronLeft, ChevronRight, ImagePlus, MapPin, Minus, Plus, X } from 'lucide-react'
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
import useDivisas from '../divisas/hooks/useDivisas'
import useSetPageTitle from '../../utils/setPageTitle'
import usePropiedadMutation from './hooks/usePropiedadMutation'
import { useDropzone } from 'react-dropzone'
import { useQueryClient } from '@tanstack/react-query'
import { getAxiosErrorMessage } from '../../utils/getAxiosErrorMessage'
import { useNavigate } from 'react-router-dom'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

/** 
 *  @typedef {import("./schemas/PropiedadZod").PropiedadForm} PropiedadForm 
 *  @typedef {import("./types/Imagen").default} Imagen
 *  @typedef {import("react-hook-form").Use}   
 *  @typedef {import("react-hook-form").UseFormReturn<any>} Form
*/
export default function NuevaPropiedad() {
    useSetPageTitle("Registrar nueva propiedad");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const toastRef = useRef(null);

    const mutation = usePropiedadMutation({
        onMutate: async (payload) => {
            console.log("Preparando envío:", payload);
            toastRef.current = toast.loading("Guardando...");
            // Opcional: guardar snapshot para rollback
            const previousData = queryClient.getQueryData(["propiedades"]);
            return { previousData };
        },
        onError: (err, variables, context) => {
            const errorMessage = getAxiosErrorMessage(err);
            console.log("Falló la mutación", err, context?.previousData, errorMessage);
            toast.error(errorMessage || "¡Error al guardar propiedad!", { id: toastRef.current, duration: 5000 });
        },
        onSuccess: () => {
            toast.success("Propiedad guardada!", { id: toastRef.current, duration: 3000 });
            setTimeout(() => {
                navigate("/host/listings");
            }, 3000);
        }
    })

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
                console.log("Coordenadas obtenidas", coords)
                setUserCoords(coords);
            } catch (error) {
                console.error(error)
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

    async function onSubmit(data) {
        const reglasMap = new Object();
        Object.entries(data.reglas_extra).forEach(([key, value]) => {
            if (value !== "") {
                reglasMap[key] = value;
            }
        });
        const payload = {
            ...data,
            imagenes: data.imagenes.filter(img => img.url),
            reglas_extra: Object.entries(reglasMap).length === 0 ? null : reglasMap
        }
        console.log("Datos a enviar", payload)
        mutation.mutate(payload);
    }

    const allTabs = [
        {
            label: 'Tipo',
            component: Step1,
            props: { next: nextStep, change: doChange, form, validateStep }
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
            props: { formData: formData, next: nextStep, prev: prevStep, setAmenidades: setAmenidades, form, validateStep }
        },
        {
            label: 'Imágenes',
            component: Step5,
            props: { formData: formData, next: nextStep, prev: prevStep, setFotos: setFotos, form, validateStep }
        },
        {
            label: 'Titulo',
            component: Step6,
            props: { formData: formData, next: nextStep, prev: prevStep, change: handleChange, form, validateStep }
        },
        {
            label: 'Precio',
            component: Step7,
            props: { formData: formData, next: nextStep, prev: prevStep, form, validateStep, change: doChange }
        },
        {
            label: 'Horarios',
            component: Step8,
            props: { formData: formData, prev: prevStep, next: nextStep, change: doChange, form, validateStep }
        },
        {
            label: 'Reglas',
            component: Step9,
            props: { formData: formData, prev: prevStep, submit: form.handleSubmit(onSubmit), change: doChange, form, validateStep, loading: mutation.isLoading }
        },
    ]

    const [tipo, ubicacion, basicos, amenidades, fotos, titulo, precio, horarios, reglas] = allTabs

    const tabs = [tipo, ubicacion, basicos, amenidades, fotos, titulo, precio, horarios, reglas];

    const Tab = tabs[selectedTab]?.component
    const tabProps = tabs[selectedTab]?.props ?? {}
    const label = tabs[selectedTab]?.label ?? ""

    return (
        <div className='w-full flex flex-col items-center lg:items-start justify-center gap-1 content'>
            <h4>Registrar nueva propiedad</h4>
            <nav className='flex flex-row items-center justify-center gap-2 mb-2'>
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

/**
 * @param {{
 *  next?: () => void,
 *  change?: (tag:string, value: any) => Promise<void>,
 *  form: Form,
 * validateStep: (step: number) => boolean,
 * }} props
 */
const Step1 = ({ next, change, form, validateStep }) => {
    const tipos = useTipos();
    const currTip = useWatch({
        control: form.control,
        name: "tipo_id"
    });
    const canContinue = validateStep(0);
    return <section className='w-full' >
        <div className="w-auto flex flex-col  gap-4">
            <h3>¿Qué tipo de alojamiento vas a compartir?</h3>
            {tipos.isLoading && !tipos.isError ? (
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
    </section>
}

/**
 * @param {{
 *  next?: () => void,
 * prev?: () => void
 *  change?: (tag:string, value: any) => Promise<void>,
 *  form: Form,
 * setCoordenadas: ({ lat: number, lng: number }) => Promise<void>, 
 * validateStep: (step: number) => boolean,
 * }} props
 */
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
        <section className='flex flex-col gap-4 w-full'>
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
        </section>
    )
}

/**
 * @param {{
 *  next?: () => void,
 * prev?: () => void
 *  change?: (tag:string, value: any) => Promise<void>,
 *  form: Form
 * }} props
 */
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
    return <section className='w-full flex gap-6 flex-col'>
        <h3>¿A cuantos huéspedes te gustaría recibir?</h3>
        <SelectNav
            label="Huéspedes"
            value={maxHuespedes}
            change={change}
            field="max_huespedes"
        />
        <SelectNav
            label="Recámaras"
            value={habiitaciones}
            change={change}
            field="habitaciones"
        />
        <SelectNav
            label="Camas"
            value={camas}
            change={change}
            field="camas"
        />
        <SelectNav
            label="Baños"
            value={banos}
            change={change}
            field="banos"
        />
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='tertiary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next}>
                Siguiente
            </CustomButton>
        </div>
    </section>
}

/**
 * @param {{
 *  next?: () => void,
 * prev?: () => void
 *  change?: (tag:string, value: any) => Promise<void>,
 * setAmenidades: (list: number[]) => Promise<void>,
 * form: Form
 * }} props
 */
const Step4 = ({ prev, next, setAmenidades, form }) => {
    const list = useWatch({
        control: form.control,
        name: "amenidades_ids"
    });
    const amenidades = useAmenidades();
    const grouped = (amenidades.data ?? []).reduce((acc, a) => {
        if (!acc[a.categoria]) {
            acc[a.categoria] = [];
        }
        acc[a.categoria].push(a);
        return acc;
    }, {});
    const canContinue = list.length > 0;
    return <section className='w-full flex gap-2 flex-col'>
        <h3>¿Qué es lo que ofrece tu propiedad?</h3>
        {amenidades.isLoading && !amenidades.isError ? (
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
            <CustomButton variant='secondary' onClick={next} disabled={!canContinue} isWaiting={amenidades.isLoading}>
                Siguiente
            </CustomButton>
        </div>
    </section>
}

/**
 * @param {{
 *  next?: () => void,
 * prev?: () => void
 * setAmenidades: (list: number[]) => Promise<void>,
 * setFotos: (list: Imagen[]) => Promise<void>,
 * form: Form,
 * validateStep: (step: number) => boolean,
 * }} props
 */
/** @param {Imagen[]} list */
const Step5 = ({ prev, next, setFotos, form, validateStep }) => {
    const list = useWatch({
        control: form.control,
        name: "imagenes"
    });

    const hasCover = !!list?.[0]?.url;

    const canContinue = validateStep(4);

    const getImageSrc = (img) => {
        if (!img?.url) return;
        if (img.url instanceof File)
            return img.preview;
        return img.url;
    };

    const removeImage = (index) => {
        const newList = [...list];
        newList[index] = {
            prop_ima_id: 0,
            orden: index + 1,
        };
        setFotos(newList);
    };

    useEffect(() => {
        return () => {
            list.forEach(img => {
                if (img.url && img.url instanceof File) {
                    URL.revokeObjectURL(
                        URL.createObjectURL(img.url)
                    );
                }
            });
        };
    });
    const onDropToIndex = (acceptedFiles, index) => {
        if (!acceptedFiles.length) return;
        const file = acceptedFiles[0];
        const newList = [...list];
        newList[index] = {
            ...newList[index],
            url: file,
            preview: URL.createObjectURL(file),
        };
        setFotos(newList);
    };

    function MakeDropZone(index = 0) {
        const {
            getRootProps,
            getInputProps,
            isDragActive
        } = useDropzone({
            onDrop: (files) =>
                onDropToIndex(files, index),
            accept: { "image/*": [] },
            maxFiles: 1,
        });

        return {
            getRootProps,
            getInputProps,
            isDragActive
        }
    }
    return <section className='w-full flex gap-2 flex-col'>
        <h3>Compartenos unas imágenes de tu propiedad</h3>

        <div
            className={`grid grid-cols-2 max-sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 place-items-center p-2 transition`}
        >
            {list.map((img, index) => {
                const src = getImageSrc(img);
                const {
                    getRootProps,
                    getInputProps,
                } = MakeDropZone(index);
                return (
                    <div
                        {...getRootProps()}
                        key={img.orden}
                        className="w-full aspect-video min-h-[150px] rounded-xl overflow-hidden relative bg-transparent md:min-w-[120px] lg:min-w-[175px] cursor-pointer border-2 border-dashed border-border flex items-center justify-center"
                    >
                        <input {...getInputProps()} />
                        {src ? (
                            <>
                                <img
                                    src={src}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    alt={`Imagen #${img.orden} de la propiedad`}
                                />

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                    className="absolute top-1 right-1 bg-white rounded-full p-2 "
                                >
                                    <X size={18} />
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full flex  flex-col items-center justify-center text-text-secondary text-xl">
                                <ImagePlus size={32} />
                                <span className='text-sm'>{index === 0 ? "Agregar o arrastrar portada" : "Agregar o arrastrar imagen"}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
        <small className='font-[montserrat] text-sm text-text-secondary block'>
            <b className='text-primary-500'>NOTA:</b>
            {" "}
            Debes adjuntar al menos una imagen de portada para tu propiedad. Puedes agregar más imágenes si lo deseas, pero la primera imagen será la que se muestre como portada.
        </small>
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='tertiary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next} disabled={!canContinue || !hasCover}>
                Siguiente
            </CustomButton>
        </div>
    </section>
}

/**
 * @param {{
 *  next?: () => void,
 * prev?: () => void
 *  change?: (tag:string, value: any) => Promise<void>,
 *  form: Form,
 * validateStep: (step: number) => boolean,
 * }} props
 */
const Step6 = ({ prev, next, form, validateStep }) => {
    const canContinue = validateStep(5);

    return <section className='w-full flex gap-2 flex-col'>
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
    </section>
}

/**
 * @param {{
 *  next?: () => void,
 *  change?: (tag:string, value: any) => Promise<void>,
 *  form: Form,
 * validateStep: (step: number) => boolean,
 * }} props
 */
const Step7 = ({ prev, next, change, form, validateStep }) => {
    const divisas = useDivisas();
    const divisa = useWatch({
        control: form.control,
        name: "divisa_id"
    });
    const canContinue = validateStep(6)
    return <section className='w-full md:min-w-[350px] flex gap-2 flex-col'>
        <h3>¡Define tu precio!</h3>
        {divisas.isLoading && !divisas.isError ? (
            <CustomLoader />
        ) : (
            <>
                <CustomInput label='Precio por noche' placeholder=' Ingresa el precio que vas a cobrar.'   {...form.register("precio_noche", {
                    pattern: {
                        value: /^\d+(\.\d{0,2})?$/,
                        message: "Máximo 2 decimales",
                    },
                })} name='precio_noche' type='number' inputMode='decimal' min={1.00} step={0.01} max={9999999.99}
                    isError={
                        !!form.formState.errors.precio_noche &&
                        form.formState.touchedFields.precio_noche
                    }
                    ErrorElement={<FieldErrors errors={form.formState.errors} name="precio_noche" />}
                />
                <CustomSelect label='Divisa de cambio'
                    helperText='Selecciona un tipo de cambio para tu precio.'
                    value={divisa}
                    onChange={async (val) => await change("divisa_id", val)}
                    options={
                        divisas.data?.map(d => ({ label: d.acronimo + " - " + d.nombre, value: d.divisa_id })) ?? []} />
            </>
        )}
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='tertiary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next} disabled={!canContinue} isWaiting={divisas.isLoading}>
                Siguiente
            </CustomButton>
        </div>
    </section>
}

/**
 * @param {{
 *  next?: () => void,
 *  change?: (tag:string, value: any) => Promise<void>,
 *  form: Form,
 * validateStep: (step: number) => boolean,
 * }} props
 */
const Step8 = ({ prev, next, form, validateStep }) => {
    React.useEffect(() => {
        form.trigger(["check_in", "check_out"]);
    }, []);
    const canContinue = validateStep(7);
    return <section className='w-full flex gap-2 flex-col'>
        <h3 className='md:text-left'>¿Cuáles son tus horarios de entrada y salida?</h3>
        <div className='flex flex-col md:flex-row w-full gap-2'>
            <CustomInput label='Entrada' type="time" name="check_in" step="60" min="00:00" placeholder='Ej. 00:00' max="23:59" {...form.register("check_in")}
                fullWidth
                isError={
                    !!form.formState.errors.check_in &&
                    form.formState.touchedFields.check_in
                }
                ErrorElement={<FieldErrors errors={form.formState.errors} name="check_in" />}
                useMinWidth={false}
            />

            <CustomInput label='Salida' type="time" name='check_out' step="60" min="00:00" placeholder='Ej. 00:00' max="23:59" {...form.register("check_out")}
                fullWidth
                isError={
                    !!form.formState.errors.check_out &&
                    form.formState.touchedFields.check_out
                }
                ErrorElement={<FieldErrors errors={form.formState.errors} name="check_out" />}
                useMinWidth={false}
            />
        </div>
        <p className='text-text-secondary md:text-left'>Formato de 24 horas</p>
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='tertiary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next} disabled={!canContinue}>
                Siguiente
            </CustomButton>
        </div>
    </section >
}

/**
 * @param {{
 *  prev?: () => void,
 *  change?: (tag:string, value: any) => Promise<void>,
 *  form: Form,
 *  submit: () => Promise<void>,
 * loading: boolean,
 * }} props
 */
const Step9 = ({ prev, submit, change, form, loading }) => {
    const [showReglas, setShowReglas] = useState(false);

    // Checkboxes principales
    const mascotas = useWatch({ control: form.control, name: "regla_mascotas" });
    const ninos = useWatch({ control: form.control, name: "regla_ninos" });
    const fiestas = useWatch({ control: form.control, name: "regla_fiestas" });
    const fumar = useWatch({ control: form.control, name: "regla_fumar" });

    // Reglas extra dinámicas como JSON
    const reglasJson = useWatch({ control: form.control, name: "reglas_extra" });
    const [extraReglas, setExtraReglas] = useState(reglasJson ?? { regla_1: "" });

    // Agregar nueva regla
    const addRegla = () => {
        const nextKey = `regla_${Object.keys(extraReglas).length + 1}`;
        setExtraReglas({ ...extraReglas, [nextKey]: "" });
    };

    // Eliminar regla
    const removeRegla = (key) => {
        const copy = { ...extraReglas };
        delete copy[key];
        setExtraReglas(copy);
    };

    // Actualizar valor de regla
    const updateRegla = (key, value) => {
        setExtraReglas({ ...extraReglas, [key]: value });
    };

    // Sincronizar con RHF cada vez que cambie extraReglas o showReglas
    useEffect(() => {
        change("reglas_extra", extraReglas);
    }, [extraReglas]);

    useEffect(() => {
        if (!showReglas) {
            change("reglas_extra", null);
            setExtraReglas({ regla_1: "" });
        }
    }, [showReglas]);

    // Trigger inicial para los checkboxes
    useEffect(() => {
        form.trigger(["regla_mascotas", "regla_ninos", "regla_fiestas", "regla_fumar"]);
    }, []);

    return (
        <section className="w-full flex flex-col gap-4">
            <h3>Sólo unas preguntas más...</h3>

            <CheckRow
                question="¿Permites mascotas?"
                checked={mascotas}
                onChange={change}
                field="regla_mascotas"
            />
            <CheckRow
                question="¿Permites niños?"
                checked={ninos}
                onChange={change}
                field="regla_ninos"
            />
            <CheckRow
                question="¿Permites fiestas?"
                checked={fiestas}
                onChange={change}
                field="regla_fiestas"
            />
            <CheckRow
                question="¿Cuentas con área para fumar?"
                checked={fumar}
                onChange={change}
                field="regla_fumar"
            />

            <CheckRow
                question="¿Deseas adjuntar reglas específicas?"
                checked={showReglas}
                onChange={() => setShowReglas(!showReglas)}
                field=""
            />

            {showReglas && (
                <div className="flex flex-col gap-2">
                    {Object.entries(extraReglas).map(([key, value]) => (
                        <div key={key} className="flex gap-2 items-center">
                            <CustomInput
                                placeholder={`Regla #${key.split("_")[1]}`}
                                value={value}
                                onChange={(e) => updateRegla(key, e.target.value)}
                                fullWidth
                                inpSize="small"
                            />
                            {key === "regla_1" ? (
                                <button
                                    type="button"
                                    onClick={addRegla}
                                    className="bg-green-500 text-white rounded px-2 py-2 flex items-center justify-center h-full"
                                >
                                    <Plus size={18} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => removeRegla(key)}
                                    className="bg-red-500 text-white rounded px-2 py-2 flex items-center justify-center h-full"
                                >
                                    <Minus size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
                {prev && (
                    <CustomButton variant="tertiary" onClick={prev}>
                        Anterior
                    </CustomButton>
                )}
                <CustomButton variant="secondary" onClick={submit} isWaiting={loading}>
                    Guardar
                </CustomButton>
            </div>
        </section>
    );
};

const fieldsByStep = {
    0: ["tipo_id"],
    1: ["coordenadas", "direccion", "ciudad", "pais"],
    2: ["max_huespedes", "camas", "habitaciones", "banos"],
    3: ["amenidades_ids"],
    4: ["imagenes"],
    5: ["titulo", "descripcion"],
    6: ["precio_noche"],
    7: ["check_in", "check_out"],
    8: ["reglas_extra", "regla_mascotas", "regla_ninos", "regla_fumar", "regla_fiestas", "regla_autochecar", "regla_apagar"],
};

/**
 * @param {{
 * name: string,
 * errors: Record<string, any>
 * }} props
 */
const FieldErrors = ({ errors = {}, name = "" }) => {

    const fieldError = errors[name];

    if (!fieldError) return null;

    if (fieldError.types) {
        return (
            <ul className="text-orange-500 text-sm mt-1  text-left ">
                {Object.values(fieldError.types).map((msg, i) => (
                    <li className='flex gap-1 items-center' key={i}><AlertCircle fill='var(--color-orange-500)' color='#fff' />{msg}</li>
                ))}
            </ul>
        );
    }

    return (
        <p className="text-red-500 text-sm mt-1 text-left flex gap-1 items-center">
            <AlertCircle fill='var(--color-orange-500)' color='#fff' />
            {fieldError.message}
        </p>
    );
};

/**
 * @param {{
 * value: number,
 *  change?: (tag:string, value: any) => Promise<void>,
 *  field: string,
 *  label: string,
 * }} props
 */
const SelectNav = ({ label = "", value = 0, change = () => { }, field = "" }) => {
    return (
        <nav className='flex justify-between items-center my-1'>
            <h5>{label}</h5>
            <div className='flex flex-row items-center justify-center gap-2 mb-2'>

                <button
                    type="button"
                    disabled={value === 1}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={async () =>
                        await change(
                            field,
                            value - 1
                        )
                    }
                >
                    <Minus color='var(--color-text-secondary)' size={18} />
                </button>

                <p>
                    {value}
                </p>

                <button
                    type="button"
                    disabled={value === 20}
                    className='disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-transparent disabled:bg-border rounded-full border-1 border-text-secondary'
                    onClick={async () =>
                        await change(
                            field,
                            value + 1
                        )
                    }
                >
                    <Plus color='var(--color-text-secondary)' size={18} />
                </button>
            </div>
        </nav>
    )
}

/**
 * @param {{
 *  question: string,
 *  checked: boolean,
 *  onChange: (tag:string, value: any) => Promise<void>,
 *  field: string,
 * }} props
 */
const CheckRow = ({ question = "¿?", checked = false, onChange = async () => { }, field = "" }) => {
    return (
        <div className="flex justify-between items-center my-2 gap-4">
            <h5>{question}</h5>
            <CustomCheckBox checked={checked} onChange={async (e) => await onChange(field, (e.target.checked))} />
        </div>
    )
}