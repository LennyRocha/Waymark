/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion"
import usePropiedad from './hooks/useGetPropiedad'
import usePropiedadForm from './hooks/usePropiedadForm'
import { PropiedadSchema } from './schemas/PropiedadZod'
import CustomLoader from '../../layout/CustomLoader';
import ErrorViewComponent from '../../layout/ErrorViewComponent';
import CustomButton from '../../components/CustomButton'
import { useWatch } from 'react-hook-form'
import { CheckRow } from './NuevaPropiedad'
import { FieldErrors, CustomTextArea, MediumInput, SmallInput } from '../../components/CustomInputs'
import { Plus, Minus, MapPin } from 'lucide-react'
import Chip from '../../components/Chip'
import useAmenidades from './hooks/useAmenidades'
import useTipos from './hooks/useTipos'
import useDivisas from '../divisas/hooks/useDivisas'
import imagenSlots from './templates/ImagenSlots'
import DropZoneItem from './components/DropZoneItem'
import Breadcrumb from '../../components/Breadcrumb'
import useSetPageTitle from '../../utils/setPageTitle'
import Map, { Marker } from 'react-map-gl/mapbox'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

/** 
*  @typedef {import("./types/Imagen").default} Imagen
* @typedef {import("./types/Propiedad").default} Propiedad
* @typedef {import("./types/Amenidad").default} Amenidad
*  @typedef {import("./schemas/PropiedadZod").PropiedadForm} PropiedadForm 
*  @typedef {import("react-hook-form").UseFormReturn<PropiedadForm>} Form 
*  @typedef {import("@tanstack/react-query").UseQueryResult<any>} Query 
*/

export default function AdministrarPropiedad() {
    const { id } = useParams();
    const propiedadQuery = usePropiedad(id);

    useSetPageTitle("Administrar propiedad - Waymark")

    const form = usePropiedadForm();

    useEffect(() => {
        if (propiedadQuery.data) {
            const data = {
                ...propiedadQuery.data,
                tipo_id: propiedadQuery.data.tipo.id,
                amenidades_ids: propiedadQuery.data.amenidades.map(a => a.amenidad_id),
            }

            form.reset(
                PropiedadSchema.parse(data)
            );

            form.trigger();
        }
    }, [propiedadQuery.data, form]);

    function change(key, value) {
        form.setValue(key, value, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true
        })

        form.trigger(key);
    }

    //Tab 1: General (título, descripción, huespedes, baños, habitaciones, camas tipo de propiedad,  check-in, check-out, divisa, precio) Solo lectura: (ciudad, país, dirección,coordenadas en mapa)
    // Tab 2: Imagenes, guardar

    const amenidadesList = useAmenidades();
    const tiposList = useTipos();
    const divisasList = useDivisas();

    const useWatchKey = (key) => useWatch({
        control: form.control,
        name: key
    });

    const generalProps = {
        form,
        change,
        watchKey: useWatchKey
    }

    let smallScreen = globalThis.matchMedia("(max-width: 640px)").matches;

    const oldTipo = useMemo(() => {
        return propiedadQuery.data?.tipo.tipo ?? "casa";
    }, [propiedadQuery.data]);

    const backup = propiedadQuery.data?.imagenes;
    console.log(oldTipo, backup)

    const components = [
        {
            label: 'general',
            Component: Tab1,
            props: { ...generalProps, tiposList, divisasList, tipo: oldTipo }
        },
        {
            label: 'fotos',
            Component: Tab2,
            props: generalProps
        },
        {
            label: 'amenidades',
            Component: Tab3,
            props: { ...generalProps, amenidadesList: amenidadesList.data }
        },
        {
            label: 'reglas',
            Component: Tab4,
            props: generalProps
        },
    ]

    const [general, fotos, amenidades, reglas] = components
    const componentes = [general, fotos, amenidades, reglas]
    const [selectedTab, setSelectedTab] = useState(componentes[0])

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
            label: smallScreen ? "Administrar" : propiedadQuery.data?.titulo ?? "Administrar propiedad",
            href: "",
            disabled: true
        }
    ]

    console.log(form.formState) // <-- para debuggear el estado del formulario

    async function onSubmit(data) {
        console.log("Juas juas");
        form.reset();
    }

    if (propiedadQuery.isInitialLoading || propiedadQuery.isLoading) return <main className='w-[100dvw] h-[100dvh] flex items-center justify-center' >
        <CustomLoader />
    </main>
    if (propiedadQuery.isError) return <main className='w-[100dvw] h-[100dvh]'>
        <ErrorViewComponent error={propiedadQuery.error} retryFunction={() => propiedadQuery.refetch()} />
    </main>

    return (
        <section className='content w-full'>
            <Breadcrumb items={links} />
            <h5 className='md:text-left font-[montserrat] mt-4'>{propiedadQuery.data?.titulo}</h5>
            <nav className='mt-4 border-sm border-bl-0 border-br-0 border-t-0 h-[44px]' >
                <ul style={tabsContainer}>
                    {componentes.map((item) => (
                        <motion.li
                            key={item.label}
                            initial={false}
                            animate={{
                                backgroundColor:
                                    item.label === selectedTab.label ? "var(--color-border)" : "transparent",
                                color: item.label === selectedTab.label ? "var(--color-primary-500)" : "black",
                            }}
                            style={tab}
                            className={`text-wrap list-none ${item.label === selectedTab.label ? "max-md:w-150" : "max-md:w-40"}`}
                            onClick={() => setSelectedTab(item)}
                        >
                            <b className='truncate'>
                                {`${item.label}`}
                            </b>
                            {item.label === selectedTab.label ? (
                                <motion.div
                                    style={underline}
                                    layoutId="underline"
                                    id="underline"
                                />
                            ) : null}
                        </motion.li>
                    ))}
                </ul>
            </nav>
            <article className='flex flex-1 items-center justify-center mt-2'>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedTab ? selectedTab.label : "empty"}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className='min-h-[50dvh] w-full'
                    >
                        <Tab Component={selectedTab.Component} props={selectedTab.props} />
                    </motion.div>
                </AnimatePresence>
            </article>
            <div className='mt-2 flex items-center justify-center md:justify-end w-full' >
                <CustomButton variant='secondary' disabled={!form.formState.isDirty || !form.formState.isValid} onClick={() => form.handleSubmit(onSubmit)()} >Guardar cambios</CustomButton>
            </div>
        </section>
    )
}

const tabsStyles = {
    padding: 0,
    margin: 0,
    fontWeight: 500,
}

const tabsContainer = {
    ...tabsStyles,
    display: "flex",
    width: "100%",
    flexWrap: "wrap",
}

const tab = {
    ...tabsStyles,
    borderRadius: 5,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: "18px 15px",
    position: "relative",
    background: "white",
    cursor: "pointer",
    height: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    userSelect: "none",
    color: "#0f1115",
}

const underline = {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
    background: "var(--color-primary-500)",
}

/**
 * @param {{
 * Component: React.ReactNode,
 * props: Object
 * }} props
 */
const Tab = ({ Component = <></>, props = {} }) => {
    return <div>
        <Component {...props} />
    </div>
}

/**
 * @param {{
 *  form: Form,
 * change: (key: string, value: any) => void,
 * watchKey: (key: string) => any
 * }} props
 */
const Tab1 = ({ form, change, watchKey, tipo }) => {
    //Tab 1: General (título, descripción, huespedes, baños, habitaciones, camas tipo de propiedad,  check-in, check-out, divisa, precio)
    console.log(form.getValues())
    const titulo = watchKey("titulo");
    const descripcion = watchKey("descripcion");
    const huespedes = watchKey("huespedes");
    const banos = watchKey("banos");
    const habitaciones = watchKey("habitaciones");
    const camas = watchKey("camas");
    const tipoPropiedad = watchKey("tipo_id");
    const checkIn = watchKey("check_in");
    const checkOut = watchKey("check_out");
    const divisa = watchKey("divisa");
    const precio = watchKey("precio");
    const direccion = watchKey("direccion");
    const coordenadas = watchKey("coordenadas");
    console.log(checkIn, checkOut)
    return <div>
        <h3>Datos de tu {tipo}</h3>
        <div className='flex max-md:flex-col gap-4'>
            <div className="flex-1 flex flex-col items-center justify-start gap-4  w-full">
                <MediumInput
                    value={titulo}
                    placeholder='Actualiza el título de tu propiedad'
                    label='Título'
                    fullWidth
                    {...form.register("titulo")}
                    isError={
                        !!form.formState.errors.titulo &&
                        form.formState.touchedFields.titulo
                    }
                    ErrorElement={<FieldErrors errors={form.formState.errors} name="titulo" />} maxLength={50}
                />
                <CustomTextArea
                    value={descripcion}
                    placeholder='Describe tu propiedad'
                    label='Descripción'
                    fullWidth
                    {...form.register("descripcion")}
                    resizeVertical
                    cols={8}
                    isError={
                        !!form.formState.errors.descripcion &&
                        form.formState.touchedFields.descripcion
                    }
                    ErrorElement={<FieldErrors errors={form.formState.errors} name="descripcion" />}
                    maxLength={3000}
                    resize='vertical'
                />
            </div>
            <div className="flex-1 flex flex-col items-center justify-start gap-4 w-full">
                <p>{tipoPropiedad}</p>
                <div className="w-full mt-4">
                    <MediumInput value={checkIn} placeholder='Actualiza la hora de entrada' label='Hora de entrada' type='time' fullWidth />
                </div>
                <div className="w-full mt-4">
                    <MediumInput value={checkOut} placeholder='Actualiza la hora de salida' label='Hora de salida' type='time' fullWidth />
                </div>
            </div>
            <div className="flex-1 flexflex-col items-center justify-start gap-4 w-full">
                <p className='font-[montserrat]'>
                    <b className='font-[cabin]'>Dirección:</b>
                    {" "}
                    {direccion}
                </p>
                <Map
                    longitude={coordenadas.lng}
                    latitude={coordenadas.lat}
                    zoom={12}
                    onMove={() => { }}
                    style={{ width: "100%", maxWidth: 350, minHeight: 200, height: "auto", borderRadius: 12, marginRight: "auto", marginLeft: "auto" }}
                    mapStyle='mapbox://styles/mapbox/streets-v12'
                    mapboxAccessToken={MAPBOX_TOKEN}
                    onClick={() => { }}
                    cursor='crosshairs'
                >
                    <Marker
                        longitude={coordenadas?.lng ?? 0}
                        latitude={coordenadas?.lat ?? 0}
                        anchor='bottom'
                    >
                        <MapPin color='#fff' fill='var(--color-secondary-500)' size={32} strokeWidth={1} />
                    </Marker>
                </Map>
            </div>
        </div>
    </div>
}

/**
 * @param {{
 * change: (key: string, value: any) => void,
 * watchKey: (key: string) => any
 * }} props
 */
const Tab2 = ({ change, watchKey }) => {
    /** @param {Imagen[]} list */
    const list = watchKey("imagenes") ?? []

    const normalizeList = (rawList) => {
        rawList.forEach(img => {
            const index = img.orden - 1;
            if (
                index >= 0 &&
                index < imagenSlots.length
            ) {
                imagenSlots[index] = {
                    ...imagenSlots[index],
                    ...img
                };
            }
        });
        return imagenSlots;
    };

    const fullList = normalizeList(list);

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
        const newList = [...fullList];
        newList[index] = {
            ...newList[index],
            url: file,
            preview: URL.createObjectURL(file),
        };
        change("imagenes", newList);
    };

    return <section className='w-full flex gap-2 flex-col'>
        <h3>Imágenes de tu propiedad</h3>

        <div
            className={`grid grid-cols-2 max-sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 place-items-center p-2 transition`}
        >
            {fullList.map((img, index) => (

                <DropZoneItem
                    key={index}
                    img={img}
                    index={index}
                    onDrop={onDropToIndex}
                    action='replace'
                />

            ))}
        </div>
        <small className='font-[montserrat] text-sm text-text-secondary block'>
            <b className='text-primary-500'>NOTA:</b>
            {" "}
            También puedes arrastrar y soltar una imagen en el espacio de cada imagen o presionar sobre ella para seleccionar una.
        </small>
    </section>
}

/**
 * @param {{
 * change: (key: string, value: any) => void,
 * watchKey: (key: string) => any
 * amenidadesList: Amenidad[]
 * }} props
 */
const Tab3 = ({ change, watchKey, amenidadesList }) => {
    const amenidades = watchKey("amenidades_ids");
    const grouped = (amenidadesList ?? []).reduce((acc, a) => {
        if (!acc[a.categoria]) {
            acc[a.categoria] = [];
        }
        acc[a.categoria].push(a);
        return acc;
    }, {});
    function addAmenidad(selected, amenidad) {
        if (!selected) {
            change(
                "amenidades_ids",
                [...amenidades, amenidad.amenidad_id],
            );
        }
    }
    function removeAmenidad(amenidad) {
        change(
            "amenidades_ids",
            amenidades.filter(
                (id) => id !== amenidad.amenidad_id
            ),
        );
    }
    return <div>
        <h3>¿Qué es lo que ofrece tu propiedad?</h3>
        <div className="flex flex-col gap-4 max-w-[800px]">
            <div className="flex flex-wrap items-center gap-2 justify-center">
                {
                    amenidades.map((a) => {
                        const amenidad = amenidadesList?.find(
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

                        <p className="font-bold mb-2">
                            {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 justify-center">
                            {items.map((a) => {
                                const selected = amenidades.includes(
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
    </div>
}

/**
 * @param {{
 * change: (key: string, value: any) => void,
 * watchKey: (key: string) => any
 * }} props
 */
const Tab4 = ({ change, watchKey }) => {
    const reglasJson = watchKey("reglas_extra");
    const mascotas = watchKey("regla_mascotas");
    const ninos = watchKey("regla_ninos");
    const fiestas = watchKey("regla_fiestas");
    const fumar = watchKey("regla_fumar");
    const apagar = watchKey("regla_apagar");
    const autocheck = watchKey("regla_autochecar");

    const [extraReglas, setExtraReglas] = useState(
        reglasJson ?? { regla_1: "" }
    );
    const [showReglas, setShowReglas] = useState(
        reglasJson !== null
    );
    const backupReglasRef = useRef(
        reglasJson ?? { regla_1: "" }
    );

    const addRegla = () => {
        const nextKey = `regla_${Object.keys(extraReglas).length + 1}`;
        setExtraReglas({ ...extraReglas, [nextKey]: "" });
    };

    const removeRegla = (key) => {
        const copy = { ...extraReglas };
        delete copy[key];
        if (Object.keys(copy).length === 0) {
            copy.regla_1 = "";
        }
        setExtraReglas(copy);
    };

    const updateRegla = (key, value) => {
        setExtraReglas({ ...extraReglas, [key]: value });
    };

    useEffect(() => {
        if (showReglas) {
            change("reglas_extra", extraReglas);
        } else {
            change("reglas_extra", null);
        }
    }, [extraReglas, showReglas]);

    const toggleReglas = () => {
        if (showReglas) {
            backupReglasRef.current = extraReglas;
            setShowReglas(false);
            change("reglas_extra", null);
        } else {
            const restored =
                backupReglasRef.current ?? { regla_1: "" };
            setExtraReglas(restored);
            setShowReglas(true);
            change("reglas_extra", restored);
        }
    };

    return <div className='w-full md:min-w-[450px] flex flex-col gap-2'>
        <h3>
            Define tus reglas
        </h3>
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

        <div>
            <CheckRow
                question="¿Tienes otras reglas?"
                checked={showReglas}
                onChange={toggleReglas}
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
        </div>
    </div>
} 