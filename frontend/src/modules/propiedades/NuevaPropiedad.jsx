/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { AnimatePresence, motion } from "framer-motion"
import { MapPin, Minus, Plus, X } from 'lucide-react'
import Map, { Marker } from 'react-map-gl/mapbox'
import { SearchBox } from '@mapbox/search-js-react'
import 'mapbox-gl/dist/mapbox-gl.css'
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'
import useTipos from './hooks/useTipos'
import TipoChip from './components/TipoChip'
import toast from 'react-hot-toast'
import CustomButton from '../../components/CustomButton'
import { getUserLocation } from '../../utils/getUserLocation'
import usePropiedadForm from './hooks/usePropiedadForm'
import { CustomCheckBox, CustomInput, CustomSelect, CustomTextArea, SmallInput, FieldErrors } from '../../components/CustomInputs'
import CustomLoader from '../../layout/CustomLoader'
import Chip from '../../components/Chip'
import useAmenidades from './hooks/useAmenidades'
import { useWatch } from 'react-hook-form'
import useDivisas from '../divisas/hooks/useDivisas'
import useSetPageTitle from '../../utils/setPageTitle'
import usePropiedadMutation from './hooks/usePropiedadMutation'
import { useQueryClient } from '@tanstack/react-query'
import { getAxiosErrorMessage } from '../../utils/getAxiosErrorMessage'
import { useNavigate } from 'react-router-dom'
import useImagenMutation from './hooks/useImagenMutation'
import Breadcrumb from '../../components/Breadcrumb'
import DropZoneItem from './components/DropZoneItem'
import getPropiedadNameByField from './hooks/getPropiedadNameByField'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

/** 
 * @typedef {import("./schemas/PropiedadZod").PropiedadForm} PropiedadForm 
 * @typedef {import("./types/Imagen").default} Imagen
 * @typedef {import("react-hook-form").UseFormReturn<any>} Form
 * @typedef {import("react-hook-form").RegisterOptions} Register
 * @typedef {import("react-hook-form").FormState} FormState
*/
export default function NuevaPropiedad() {
    useSetPageTitle("Registrar nueva propiedad");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const toastRef = useRef(null);

    const imgMutation = useImagenMutation({
        onSuccess: (data) => {
            console.log("Imágenes guardadas", data)
        },
        onError: (err) => {
            const errorMessage = getAxiosErrorMessage(err);
            console.log("Error al guardar imágenes", err, errorMessage);
        }
    })

    const mutation = usePropiedadMutation({
        onMutate: async () => {
            toastRef.current = toast.loading("Guardando...");
            // Opcional: guardar snapshot para rollback
            const previousData = queryClient.getQueryData(["propiedades"]);
            return { previousData };
        },
        onError: (error, variables, context) => {
            console.warn(variables, context)
            const errorMessage = getAxiosErrorMessage(error);
            const backendErrors = error.response?.data;
            console.log("Errores backend:", backendErrors);
            if (backendErrors && typeof backendErrors === "object") {
                const firstError = Object.entries(backendErrors)
                    .map(([field, messages]) => {
                        console.log({ field, messages })
                        const msg = Array.isArray(messages) ? messages[0] : messages;
                        return `${getPropiedadNameByField(field)}: ¡${msg}!`;
                    })[0];

                if (firstError) {
                    return toast.error(firstError, { id: toastRef.current, duration: 5000 });
                }
            }
            toast.error(errorMessage || "¡Error al guardar propiedad!", { id: toastRef.current, duration: 5000 });
        },
        onSuccess: async (data, variables) => {
            const payload = makeImgenPayload(data.propiedad_id, variables.imagenes);
            await imgMutation.mutateAsync(payload);
            toast.success("Propiedad guardada!", { id: toastRef.current, duration: 3000 });
            queryClient.invalidateQueries(["propiedades_host"]);
            setTimeout(() => {
                navigate("/host/listings");
            }, 3000);
        }
    })

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

    function setCoordenadas(obj = { lat: 0, lng: 0 }) {
        form.setValue("coordenadas", obj, {
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

    function setAmenidades(list) {
        form.setValue("amenidades_ids", list, {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    function doChange(tag, value) {
        form.setValue(tag, value, {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    const useWatchKey = (key) => useWatch({
        control: form.control,
        name: key
    })

    const register = (key) => {
        return form.register(key)
    }

    function triggerStep() {
        form.trigger(fieldsByStep[selectedTab]);
    }

    const defaultProps = useMemo(() => ({
        watchKey: useWatchKey,
        next: nextStep,
        prev: prevStep,
        change: doChange,
        validateStep,
        form,
        register,
        formState: form.formState
    }), [form.formState]);

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
        mutation.mutate(payload);
    }

    const allTabs = [
        {
            label: 'Tipo',
            component: Step1,
            props: defaultProps
        },
        {
            label: 'Ubicación',
            component: Step2,
            props: { ...defaultProps, setCoordenadas, userCoords }
        },
        {
            label: 'Básicos',
            component: Step3,
            props: defaultProps
        },
        {
            label: 'Amenidades',
            component: Step4,
            props: { ...defaultProps, setAmenidades }
        },
        {
            label: 'Imágenes',
            component: Step5,
            props: { ...defaultProps, setFotos }
        },
        {
            label: 'Titulo',
            component: Step6,
            props: defaultProps
        },
        {
            label: 'Precio',
            component: Step7,
            props: defaultProps
        },
        {
            label: 'Horarios',
            component: Step8,
            props: { ...defaultProps, triggerStep }
        },
        {
            label: 'Reglas',
            component: Step9,
            props: { ...defaultProps, submit: form.handleSubmit(onSubmit), loading: mutation.isLoading || imgMutation.isLoading, triggerStep }
        },
    ]

    const links = [
        {
            label: "Anfitrión",
            href: "/host",
        },
        {
            label: "Mis propiedades",
            href: "/host/listings",
        },
        {
            label: "Nueva propiedad",
            href: "/host/new-listing",
            disabled: true
        }
    ]

    const [tipo, ubicacion, basicos, amenidades, fotos, titulo, precio, horarios, reglas] = allTabs

    const tabs = [tipo, ubicacion, basicos, amenidades, fotos, titulo, precio, horarios, reglas];

    const Tab = tabs[selectedTab]?.component
    const tabProps = tabs[selectedTab]?.props ?? {}
    const label = tabs[selectedTab]?.label ?? ""

    return (
        <div className='w-full flex flex-col items-center lg:items-start justify-center gap-1 content'>
            <Breadcrumb items={links} />
            <h5 className='mt-4'>Registrar nueva propiedad</h5>
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
 * change?: (tag:string, value: any) => void,
 * validateStep: (step: number) => boolean,
 * }} props
 */
const Step1 = ({ next, change, validateStep, watchKey }) => {
    const tipos = useTipos();
    const currTip = watchKey("tipo_id");
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
                            onChange={() => {
                                change('tipo_id', t.id);
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
 * change?: (tag:string, value: any) => void,
 * setCoordenadas: ({ lat: number, lng: number }) => Promise<void>, 
 * validateStep: (step: number) => boolean,
 * }} props
 */
const Step2 = ({ next, prev, change, validateStep, watchKey, setCoordenadas, userCoords = { lat: 0, lng: 0 } }) => {
    const mapRef = useRef(null);
    const coords = watchKey("coordenadas");
    const direction = watchKey("direccion");

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

        setCoordenadas({ lat, lng })
        if (direccion) {
            change("direccion", direccion)
            change("ciudad", ciudad)
            change("pais", pais)
        }

        setViewState(prev => ({ ...prev, longitude: lng, latitude: lat, zoom: 15 }))

        mapRef.current?.resize();
        setLoading(false);
    }

    const handleMapClick = async (e) => {
        setLoading(true);
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
            change("direccion", direccion)
            change("ciudad", ciudad)
            change("pais", pais)
        }

        mapRef.current?.resize();
        setLoading(false);
    }

    const markerLng =
        coords?.lng === 0
            ? userCoords.lng
            : coords.lng;

    const markerLat =
        coords?.lat === 0
            ? userCoords.lat
            : coords.lat;

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
 * change?: (tag:string, value: any) => void,
 * }} props
 */
const Step3 = ({ prev, next, change, watchKey }) => {
    const maxHuespedes = watchKey("max_huespedes");
    const camas = watchKey("camas");
    const banos = watchKey("banos");
    const habiitaciones = watchKey("habitaciones");
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
 * change?: (tag:string, value: any) => void,
 * setAmenidades: (list: number[]) => void,
 * }} props
 */
const Step4 = ({ prev, next, watchKey, setAmenidades }) => {
    const list = watchKey("amenidades_ids") ?? [];
    const amenidades = useAmenidades();
    const grouped = (amenidades.data ?? []).reduce((acc, a) => {
        if (!acc[a.categoria]) {
            acc[a.categoria] = [];
        }
        acc[a.categoria].push(a);
        return acc;
    }, {});
    function addAmenidad(selected, amenidad) {
        if (!selected) {
            setAmenidades(
                [...list, amenidad.amenidad_id],
            );
        }
    }
    function removeAmenidad(amenidad) {
        setAmenidades(
            list.filter(
                (id) => id !== amenidad.amenidad_id
            ),
        );
    }
    const canContinue = list.length > 0;
    return <section className='w-full flex gap-2 flex-col'>
        <h3>¿Qué es lo que ofrece tu propiedad?</h3>
        {amenidades.isLoading && !amenidades.isError ? (
            <CustomLoader />
        ) : (
            <AnimatePresence mode='wait'>
                <div className="flex flex-col gap-4 max-w-[800px]">
                    <div className="flex flex-wrap items-center gap-2 justify-center">
                        {
                            list.map((a) => {
                                const amenidad = amenidades.data.find(
                                    (am) => am.amenidad_id === a
                                );
                                return <Chip
                                    key={a}
                                    selected={true}
                                    label={amenidad.nombre}
                                    icon={amenidad.icono_nombre}
                                    onDelete={() => {
                                        removeAmenidad(amenidad);
                                    }}
                                />
                            })
                        }
                    </div>
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

                                        return !selected && (
                                            <Chip
                                                key={a.amenidad_id}
                                                selected={selected}
                                                label={a.nombre}
                                                icon={a.icono_nombre}
                                                onClick={() => {
                                                    addAmenidad(selected, a);
                                                }}
                                                onDelete={() => {
                                                    removeAmenidad(a);
                                                }}
                                            />
                                        );
                                    })}
                                </div>

                            </div>
                        )
                    )}
                </div>
            </AnimatePresence>
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
 * setFotos: (list: Imagen[]) => void,
 * validateStep: (step: number) => boolean,
 * }} props
 */
const Step5 = ({ prev, next, validateStep, watchKey, setFotos }) => {
    /** @param {Imagen[]} list */
    const list = watchKey("imagenes") ?? []

    const hasCover = !!list?.[0]?.url;

    const canContinue = validateStep(4);

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
                if (img?.preview) {
                    URL.revokeObjectURL(img.preview);
                }
            });
        };
    }, [list]);

    const onDropToIndex = (acceptedFiles, index) => {
        if (!acceptedFiles.length) return;
        const file = acceptedFiles[0];
        if (file.size > 10 * 1024 * 1024) {
            toast.error("La imagen no debe superar los 10 MB");
            return;
        }
        const newList = [...list];
        newList[index] = {
            ...newList[index],
            url: file,
            preview: URL.createObjectURL(file),
        };
        setFotos(newList);
    };

    return <section className='w-full flex gap-2 flex-col'>
        <h3>Compartenos unas imágenes de tu propiedad</h3>

        <div
            className={`grid grid-cols-2 max-sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 place-items-center p-2 transition`}
        >
            {list.map((img, index) => {
                return <DropZoneItem
                    key={img.orden}
                    index={index}
                    img={img}
                    onDelete={(index) => removeImage(index)}
                    onDrop={(files) => onDropToIndex(files, index)}
                />
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
 * change?: (tag:string, value: any) => void,
 * validateStep: (step: number) => boolean,
 * register: (key: string, options?: Register) => ReturnType<Form["register"]>,
 * formState: FormState,
 * }} props
 */
const Step6 = ({ prev, next, validateStep, register, formState }) => {
    const canContinue = validateStep(5);

    return <section className='w-full flex gap-2 flex-col'>
        <h3>Dale identidad a tu propiedad</h3>
        <CustomInput label='Título' placeholder='Define un título para tu propiedad.' {...register("titulo")} name='titulo'
            isError={
                !!formState.errors.titulo &&
                formState.touchedFields.titulo
            }
            ErrorElement={<FieldErrors errors={formState.errors} name="titulo" />} maxLength={50} />
        <CustomTextArea label='Descripción' rows={4} placeholder='Cuentanos más acerca de ella.' name='descripcion'
            {...register("descripcion")}
            isError={
                !!formState.errors.descripcion &&
                formState.touchedFields.descripcion
            }
            ErrorElement={<FieldErrors errors={formState.errors} name="descripcion" />}
            maxLength={3000}
        />
        <div className='w-full flex flex-row items-center justify-end gap-2' >
            <CustomButton variant='tertiary' onClick={prev} >
                Anterior
            </CustomButton>
            <CustomButton variant='secondary' onClick={next} disabled={!canContinue || !formState.dirtyFields.titulo || !formState.dirtyFields.descripcion} >
                Siguiente
            </CustomButton>
        </div>
    </section>
}

/**
 * @param {{
 * prev?: () => void
 * next?: () => void,
 * change?: (tag:string, value: any) => void,
 * validateStep: (step: number) => boolean,
 * register: (key: string, options?: Register) => ReturnType<Form["register"]>,
 * formState: FormState,
 * }} props
 */
const Step7 = ({ prev, next, change, validateStep, watchKey, register, formState }) => {
    const divisas = useDivisas();
    const divisa = watchKey("divisa_id");
    const canContinue = validateStep(6)
    return <section className='w-full md:min-w-[350px] flex gap-2 flex-col'>
        <h3>¡Define tu precio!</h3>
        {divisas.isLoading && !divisas.isError ? (
            <CustomLoader />
        ) : (
            <>
                <CustomInput label='Precio por noche' placeholder=' Ingresa el precio que vas a cobrar.'   {...register("precio_noche", {
                    pattern: {
                        value: /^\d+(\.\d{0,2})?$/,
                        message: "Máximo 2 decimales",
                    },
                })} name='precio_noche' type='number' inputMode='decimal' min={1} step={0.01} max={9999999.99}
                    isError={
                        !!formState.errors.precio_noche &&
                        formState.touchedFields.precio_noche
                    }
                    ErrorElement={<FieldErrors errors={formState.errors} name="precio_noche" />}
                />
                <CustomSelect label='Divisa de cambio'
                    helperText='Selecciona un tipo de cambio para tu precio.'
                    value={divisa}
                    onChange={(val) => change("divisa_id", val)}
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
 * prev?: () => void
 *  next?: () => void,
 * validateStep: (step: number) => boolean,
  * register: (key: string, options?: Register) => ReturnType<Form["register"]>,
 * formState: FormState,
 * triggerStep: () => void,
 * }} props
 */
const Step8 = ({ prev, next, validateStep, register, formState, triggerStep }) => {
    React.useEffect(() => {
        triggerStep();
    }, []);
    const canContinue = validateStep(7);
    return <section className='w-full flex gap-2 flex-col'>
        <h3 className='md:text-left'>¿Cuáles son tus horarios de entrada y salida?</h3>
        <div className='flex flex-col md:flex-row w-full gap-2'>
            <CustomInput label='Entrada' type="time" name="check_in" step="60" min="00:00" placeholder='Ej. 00:00' max="23:59" {...register("check_in")}
                fullWidth
                isError={
                    !!formState.errors.check_in &&
                    formState.touchedFields.check_in
                }
                ErrorElement={<FieldErrors errors={formState.errors} name="check_in" />}
                useMinWidth={false}
            />

            <CustomInput label='Salida' type="time" name='check_out' step="60" min="00:00" placeholder='Ej. 00:00' max="23:59" {...register("check_out")}
                fullWidth
                isError={
                    !!formState.errors.check_out &&
                    formState.touchedFields.check_out
                }
                ErrorElement={<FieldErrors errors={formState.errors} name="check_out" />}
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
 * change?: (tag:string, value: any) => void,
 *  submit: () => Promise<void>,
 * loading: boolean,
 * triggerStep: () => void,
 * }} props
 */
const Step9 = ({ prev, change, watchKey, loading, submit, triggerStep }) => {
    const [showReglas, setShowReglas] = useState(false);

    // Checkboxes principales
    const mascotas = watchKey("regla_mascotas");
    const ninos = watchKey("regla_ninos");
    const fiestas = watchKey("regla_fiestas");
    const fumar = watchKey("regla_fumar");
    const apagar = watchKey("regla_apagar");
    const autocheck = watchKey("regla_autochecar");

    // Reglas extra dinámicas como JSON
    const reglasJson = watchKey("reglas_extra");
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
        if (Object.keys(copy).length === 0) {
            copy.regla_1 = "";
        }
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
        triggerStep();
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
                question="¿Apagar todo a la salida?"
                checked={apagar}
                onChange={change}
                field="regla_apagar"
            />
            <CheckRow
                question="¿Llegada autónoma?"
                checked={autocheck}
                onChange={change}
                field="regla_autochecar"
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
                            <SmallInput
                                placeholder={`Regla #${key.split("_")[1]}`}
                                value={value}
                                onChange={(e) => updateRegla(key, e.target.value)}
                                fullWidth
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
 * value: number,
 *  change?: (tag:string, value: any) => void,
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
                    onClick={() =>
                        change(
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
                    onClick={() =>
                        change(
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
 *  onChange: (tag:string, value: any) => void,
 *  field: string,
 * }} props
 */
export const CheckRow = ({ question = "¿?", checked = false, onChange = async () => { }, field = "" }) => {
    return (
        <div className="flex justify-between items-center my-2 gap-4">
            <h5 className='text-left'>{question}</h5>
            <CustomCheckBox checked={checked} onChange={(e) => onChange(field, (e.target.checked))} />
        </div>
    )
}

function makeImgenPayload(propiedadId, imgs) {
    const formData = new FormData();

    formData.append("propiedad", propiedadId);

    imgs.forEach((img) => {
        formData.append("imagenes", img.url);
        formData.append("ordenes", img.orden);
    });

    return formData;
}