/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react'
import { href, useParams } from 'react-router-dom'
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
import { SmallInput } from '../../components/CustomInputs'
import { Plus, Minus } from 'lucide-react'
import Chip from '../../components/Chip'
import useAmenidades from './hooks/useAmenidades'
import useTipos from './hooks/useTipos'
import useDivisas from '../divisas/hooks/useDivisas'
import imagenSlots from './templates/ImagenSlots'
import DropZoneItem from './components/DropZoneItem'
import Breadcrumb from '../../components/Breadcrumb'

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

    const components = [
        {
            label: 'general',
            Component: Tab1,
            props: { ...generalProps, tiposList, divisasList }
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
            label: propiedadQuery.data?.titulo ?? "Administrar propiedad",
            href: "",
            disabled: true
        }
    ]

    if (propiedadQuery.isInitialLoading || propiedadQuery.isLoading) return <main className='w-[100dvw] h-[100dvh] flex items-center justify-center' >
        <CustomLoader />
    </main>
    if (propiedadQuery.isError) return <main className='w-[100dvw] h-[100dvh]'>
        <ErrorViewComponent error={propiedadQuery.error} retryFunction={() => propiedadQuery.refetch()} />
    </main>

    return (
        <section className='content'>
            <Breadcrumb items={links} />
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
                        className='min-h-[50dvh]'
                    >
                        <Tab Component={selectedTab.Component} props={selectedTab.props} />
                    </motion.div>
                </AnimatePresence>
            </article>
            <div className='mt-2 flex items-center justify-center md:justify-end w-full' >
                <CustomButton variant='secondary' disabled={!form.formState.isDirty || !form.formState.isValid}  >Guardar cambios</CustomButton>
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
const Tab1 = ({ form, change, watchKey }) => {
    //Tab 1: General (título, descripción, huespedes, baños, habitaciones, camas tipo de propiedad,  check-in, check-out, divisa, precio) Solo lectura: (ciudad, país, dirección,coordenadas en mapa)
    const titulo = watchKey("titulo");
    const descripcion = watchKey("descripcion");
    const huespedes = watchKey("huespedes");
    const banos = watchKey("banos");
    const habitaciones = watchKey("habitaciones");
    const camas = watchKey("camas");
    const tipoPropiedad = watchKey("tipoPropiedad");
    const checkIn = watchKey("checkIn");
    const checkOut = watchKey("checkOut");
    const divisa = watchKey("divisa");
    const precio = watchKey("precio");
    return <div>
        <h2>{titulo}</h2>
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
        <h2>
            Reglas de la casa
        </h2>
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