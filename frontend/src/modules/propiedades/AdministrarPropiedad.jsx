/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion"
import usePropiedad from './hooks/useGetPropiedad'
import usePropiedadForm from './hooks/usePropiedadForm'
import { PropiedadSchema } from './schemas/PropiedadZod'
import CustomLoader from '../../layout/CustomLoader';
import ErrorViewComponent from '../../layout/ErrorViewComponent';
import CustomButton from '../../components/CustomButton'
import { useWatch } from 'react-hook-form'
import { CheckRow, SelectNav } from './NuevaPropiedad'
import { FieldErrors, CustomTextArea, MediumInput, SmallInput, CustomSelect, CustomInput } from '../../components/CustomInputs'
import { Plus, Minus, MapPin, Cog, Book, Banknote, Image as Picture, ScrollText } from 'lucide-react'
import Chip from '../../components/Chip'
import useAmenidades from './hooks/useAmenidades'
import useTipos from './hooks/useTipos'
import useDivisas from '../divisas/hooks/useDivisas'
import imagenSlots from './templates/ImagenSlots'
import DropZoneItem from './components/DropZoneItem'
import Breadcrumb from '../../components/Breadcrumb'
import useSetPageTitle from '../../utils/setPageTitle'
import Map, { Marker } from 'react-map-gl/mapbox'
import usePropiedadMutation from './hooks/usePropiedadMutation'
import useImagenMutation from './hooks/useImagenMutation'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { getAxiosErrorMessage } from '../../utils/getAxiosErrorMessage'
import getPropiedadNameByField from './hooks/getPropiedadNameByField'
import useWatchResize from '../../utils/useWatchResize'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

/** 
*  @typedef {import("./types/Imagen").default} Imagen
*  @typedef {import("./types/Propiedad").default} Propiedad
*  @typedef {import("../divisas/types/Divisa").default} Divisa
*  @typedef {import("./types/TipoPropiedad").default} TipoPropiedad
*  @typedef {import("./types/Amenidad").default} Amenidad
*  @typedef {import("./schemas/PropiedadZod").PropiedadForm} PropiedadForm 
*  @typedef {import("react-hook-form").UseFormReturn<PropiedadForm>} Form 
*  @typedef {import("@tanstack/react-query").UseQueryResult<any>} Query 
*/

export default function AdministrarPropiedad() {
    const { idSlug } = useParams();
    const id = idSlug.split("-")[0];
    const navigate = useNavigate();
    const propiedadQuery = usePropiedad(id);

    const [success, setSuccess] = useState(false);

    const [savedData, setSavedData] = useState(false);
    const [updatedImages, setUpdatedImages] = useState(false);

    useSetPageTitle("Administrar propiedad - Waymark")

    const form = usePropiedadForm();

    const queryClient = useQueryClient();

    const toastRef = useRef(null);

    const mutation = usePropiedadMutation({
        onMutate: () => {
            if (toastRef.current) {
                toast.loading("Guardando...", { id: toastRef.current });
            } else {
                toastRef.current = toast.loading("Guardando...");
            }
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
            toast.error(errorMessage || "¡Error al modificar  propiedad!", { id: toastRef.current, duration: 5000 });
        },
        onSuccess: () => {
            setSuccess(true);
            toast.success("!Propiedad modificada correctamente!", { id: toastRef.current, duration: 3000 });
            queryClient.invalidateQueries(["propiedades_host"]);
            queryClient.invalidateQueries(["propiedad", id]);
            setSavedData(false);
            setUpdatedImages(false);
            setTimeout(() => {
                form.reset();
                navigate("/host/listings");
            }, 3000);
        }
    }, "put")

    const imgPostMutation = useImagenMutation({
        onMutate: () => {
            if (toastRef.current) {
                toast.loading("Guardando imagenes nuevas...", { id: toastRef.current });
            } else {
                toastRef.current = toast.loading("Guardando imagenes nuevas...", { id: toastRef.current });
            }
        },
        onError: (error) => {
            const errorMessage = getAxiosErrorMessage(error);
            toast.error(errorMessage || "¡Error al subir imagen!", { id: toastRef.current, duration: 5000 });
        },
        onSuccess: () => {
            if (savedData) return;
            setSuccess(true);
            toast.success("!Imagenes guardadas correctamente!", { id: toastRef.current, duration: 3000 });
            if (!updatedImages) {
                queryClient.invalidateQueries(["propiedades_host"]);
                queryClient.invalidateQueries(["propiedad", id]);
                setTimeout(() => {
                    form.reset();
                    navigate("/host/listings");
                }, 3000);
            }
        }
    }, "post");

    const imgPutMutation = useImagenMutation({
        onMutate: () => {
            if (toastRef.current) {
                toast.loading("Actualizando imagenes...", { id: toastRef.current });
            } else {
                toastRef.current = toast.loading("Actualizando imagenes...", { id: toastRef.current });
            }
        },
        onError: (error) => {
            const errorMessage = getAxiosErrorMessage(error);
            toast.error(errorMessage || "¡Error al actualizar imagen!", { id: toastRef.current, duration: 5000 });
        },
        onSuccess: () => {
            if (savedData) return;
            setSuccess(true);
            toast.success("!Imagenes actualizadas correctamente!", { id: toastRef.current, duration: 3000 });
            if (updatedImages) {
                setUpdatedImages(false);
                queryClient.invalidateQueries(["propiedades_host"]);
                queryClient.invalidateQueries(["propiedad", id]);
                setTimeout(() => {
                    form.reset();
                    navigate("/host/listings");
                }, 3000);
            }
        }
    }, "put");

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

    const amenidadesList = useAmenidades();
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

    let smallScreen = useWatchResize({ pixeles: 640, metrica: "lessThan" });
    let mediumScreen = useWatchResize({ pixeles: 768, metrica: "lessThan" });

    const oldTipo = useMemo(() => {
        return propiedadQuery.data?.tipo.tipo ?? "casa";
    }, [propiedadQuery.data]);

    const backup = propiedadQuery.data?.imagenes;

    const backupOrders = useMemo(() => {
        return new Set(backup?.map(img => img.orden))
    }, [backup]);

    const components = [
        {
            label: 'general',
            Icon: <Cog size={24} className='mx-auto' />,
            Component: Tab1,
            props: { ...generalProps, tipo: oldTipo }
        },
        {
            label: 'fotos',
            Icon: <Picture size={24} className='mx-auto' />,
            Component: Tab2,
            props: { ...generalProps, backup: backupOrders }
        },
        {
            label: 'amenidades',
            Icon: <ScrollText size={24} className='mx-auto' />,
            Component: Tab3,
            props: { ...generalProps, amenidadesList: amenidadesList.data }
        },
        {
            label: 'reglas',
            Icon: <Book size={24} className='mx-auto' />,
            Component: Tab4,
            props: generalProps
        },
        {
            label: 'servicio',
            Icon: <Banknote size={24} className='mx-auto' />,
            Component: Tab5,
            props: { ...generalProps, divisasList: divisasList.data }
        },
    ]

    const [general, fotos, amenidades, reglas, servicio] = components
    const componentes = [general, fotos, amenidades, reglas, servicio]
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

    async function onSubmit(data) {
        const imagesToSave = [];
        const imagesToUpdate = [];

        const dirtyFields =
            form.formState.dirtyFields;

        let clData = {
            ...data,
            titulo: data.titulo.trim(),
            descripcion: data.descripcion.trim(),
        };

        if (data.reglas_extra) {
            const reglasMap = {};

            Object.entries(data.reglas_extra)
                .forEach(([key, value]) => {
                    if (value !== "") {
                        reglasMap[key] = value;
                    }
                });

            clData.reglas_extra =
                Object.keys(reglasMap).length
                    ? reglasMap
                    : null;
        }

        const dirtyData =
            getDirtyValues(dirtyFields, clData);

        delete dirtyData.imagenes;

        const otherFieldsModified =
            Object.keys(dirtyData).length > 0;

        if (dirtyFields["imagenes"]) {
            data.imagenes.forEach(img => {
                if (!img.url) return;
                if (!backupOrders.has(img.orden)) {
                    imagesToSave.push(img);
                }
                else if (img.url instanceof File) {
                    imagesToUpdate.push(img);
                }
            });
        }

        if (dirtyFields["amenidades_ids"]) {
            dirtyData.amenidades_ids = clData.amenidades_ids;
        }

        if (
            !imagesToSave.length &&
            !imagesToUpdate.length &&
            !otherFieldsModified
        ) {

            toast("No hay cambios para guardar");

            return;
        }

        if (otherFieldsModified) setSavedData(true);
        if (imagesToUpdate.length !== 0) setUpdatedImages(true);

        try {
            await saveImages(imagesToSave);
            await updateImages(imagesToUpdate);
            if (otherFieldsModified) {
                await mutation.mutateAsync({
                    data: dirtyData,
                    id: id
                });
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function saveImages(list) {
        if (!list.length) return;
        await Promise.all(list.map(img => {
            const formData = new FormData();
            formData.append("propiedad", id);
            formData.append("orden", img.orden);
            formData.append("imagen", img.url);
            return imgPostMutation.mutateAsync(formData);
        }))
    }

    async function updateImages(list) {
        if (!list.length) return;
        await Promise.all(list.map(img => {
            console.log("Actualizando imagen:", img);
            const formData = new FormData();
            formData.append("orden", img.orden);
            formData.append("url", img.url);
            return imgPutMutation.mutateAsync({ id: img.prop_ima_id, data: formData });
        }))
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
                            {
                                mediumScreen ? item.Icon : <b className='truncate'>
                                    {`${item.label}`}
                                </b>
                            }
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
            <div className='mt-2 flex items-center justify-center md:justify-end w-full gap-2' >
                <CustomButton variant='tertiary' disabled={success || !form.formState.isDirty} onClick={() => form.reset()} isWaiting={mutation.isPending}>Reestablecer</CustomButton>
                <CustomButton variant='secondary' disabled={success || !form.formState.isDirty || !form.formState.isValid} onClick={() => form.handleSubmit(onSubmit)()} isWaiting={mutation.isPending || imgPutMutation.isPending || imgPostMutation.isPending}>Guardar cambios</CustomButton>
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
const Tab = ({ Component, props = {} }) => {
    return <div>
        <Component {...props} />
    </div>
}

/**
 * @param {{
 *  form: Form,
 * change: (key: string, value: any) => void,
 * watchKey: (key: string) => any
 * tiposList: TipoPropiedad[],
 * }} props
 */
const Tab1 = ({ form, change, watchKey, tipo }) => {
    const tiposList = useTipos();

    const titulo = watchKey("titulo");
    const descripcion = watchKey("descripcion");
    const direccion = watchKey("direccion");
    const coordenadas = watchKey("coordenadas");
    const tipoId = watchKey("tipo_id");

    if (tiposList.isLoading || tiposList.isInitialLoading) {
        return <CustomLoader />
    }

    return <div className='w-fullflex gap-2 flex-col'>
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
                    inpSize='large'
                    {...form.register("descripcion")}
                    cols={10}
                    isError={
                        !!form.formState.errors.descripcion &&
                        form.formState.touchedFields.descripcion
                    }
                    ErrorElement={<FieldErrors errors={form.formState.errors} name="descripcion" />}
                    maxLength={3000}
                    resize='vertical'
                />
                <div className="flex flex-col md:flex-row  gap-2 w-full">
                    <div className="w-full mt-2">
                        <SmallInput
                            {...form.register("check_in")}
                            label='Hora de entrada'
                            type='time'
                            name="check_in"
                            step="60" min="00:00"
                            placeholder='Ej. 00:00'
                            max="23:59"
                            fullWidth
                            isError={
                                !!form.formState.errors.check_in &&
                                form.formState.touchedFields.check_in
                            }
                            ErrorElement={
                                <FieldErrors errors={form.formState.errors} name="check_in" />
                            }
                            useMinWidth={false}
                        />
                    </div>
                    <div className="w-full mt-2">
                        <SmallInput
                            {...form.register("check_out")}
                            label='Hora de salida'
                            type='time'
                            name="check_out"
                            step="60"
                            min="00:00"
                            placeholder='Ej. 00:00'
                            max="23:59"
                            fullWidth
                            isError={
                                !!form.formState.errors.check_out &&
                                form.formState.touchedFields.check_out
                            }
                            ErrorElement={
                                <FieldErrors errors={form.formState.errors} name="check_out" />
                            }
                            useMinWidth={false}
                        />
                    </div>
                </div>
            </div>
            <div className="flex-1 gap-4 w-full">
                <CustomSelect label='Tipo de propiedad'
                    value={tipoId}
                    onChange={(val) => change("tipo_id", val)}
                    options={
                        tiposList.data.map(t => ({ label: t.tipo, value: t.id })) ?? []} />
                <p className='md:text-left font-[montserrat] mt-2'>
                    <b className='font-[cabin]'>Dirección:</b>
                    {" "}
                    {direccion}
                </p>
                <Map
                    longitude={coordenadas.lng}
                    latitude={coordenadas.lat}
                    zoom={12}
                    onMove={() => { }}
                    style={{ width: "100%", minHeight: 350, height: "auto", borderRadius: 8, marginRight: "auto", marginLeft: "auto" }}
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
 * backup: Set<number>
 * }} props
 */
const Tab2 = ({ change, watchKey, backup }) => {
    /** @param {Imagen[]} list */
    const list = watchKey("imagenes");
    let slots = imagenSlots.map(slot => ({ ...slot }));

    const normalizeList = (rawList) => {
        rawList.forEach(img => {
            const index = img.orden - 1;
            if (
                index >= 0 &&
                index < slots.length
            ) {
                slots[index] = {
                    ...slots[index],
                    ...img
                };
            }
        });
        return slots;
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
        if (file.size > 10 * 1024 * 1024) {
            toast.error("La imagen no debe superar los 10 MB");
            return;
        }
        const newList = [...fullList];
        if (newList[index]?.preview) {
            URL.revokeObjectURL(
                newList[index].preview
            );
        }
        newList[index] = {
            ...newList[index],
            url: file,
            preview: URL.createObjectURL(file),
        };
        change("imagenes", newList);
    };

    const removeImage = (index) => {
        const newList = [...fullList];
        newList[index] = {
            prop_ima_id: 0,
            orden: index + 1,
        };
        change("imagenes", newList);
    };


    return <div className='w-fullflex gap-2 flex-col'>
        <h3>Imágenes de tu propiedad</h3>

        <div
            className={`grid grid-cols-2 max-sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 place-items-center p-2 transition`}
        >
            {fullList.map((img, index) => {
                const hadImg = backup.has(img.orden);
                return (
                    <DropZoneItem
                        key={img.orden}
                        img={img}
                        index={index}
                        onDrop={onDropToIndex}
                        onDelete={removeImage}
                        action={hadImg ? "replace" : "add"}
                    />
                )
            })}
        </div>
        <small className='font-[montserrat] text-sm text-text-secondary block'>
            <b className='text-primary-500'>NOTA:</b>
            {" "}
            También puedes arrastrar y soltar una imagen en el espacio de cada imagen o presionar sobre ella para seleccionar una.
        </small>
    </div>
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

    return <div className='w-full flex gap-2 flex-col'>
        <h3>¿Qué es lo que ofrece tu propiedad?</h3>
        <div className="flex flex-col gap-4 max-w-[800px] mx-auto">
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

    return <div className='w-full md:min-w-[450px] max-w-[600px] mx-auto flex flex-col gap-2'>
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

/**
 * @param {{
 *  form: Form,
 * change: (key: string, value: any) => void,
 * watchKey: (key: string) => any
 * divisasList:Divisa[]
 * }} props
 */
const Tab5 = ({ form, change, watchKey, divisasList }) => {
    //Tab 1: General (título, descripción, huespedes, baños, habitaciones, camas tipo de propiedad,  check-in, check-out, divisa, precio)
    const huespedes = watchKey("max_huespedes");
    const banos = watchKey("banos");
    const habitaciones = watchKey("habitaciones");
    const camas = watchKey("camas");
    const divisa = watchKey("divisa_id");

    return <div className='w-full flex gap-2 flex-col'>
        <h3>Acerca del servicio</h3>
        <div className='flex max-md:flex-col gap-4'>
            <div className="flex-1 flex flex-col items-center justify-start gap-4  w-full">
                <SelectNav label='Huéspedes' value={huespedes} change={change} field='max_huespedes' fullWidth />
                <SelectNav label='Habitaciónes' value={habitaciones} change={change} field='habitaciones' fullWidth />
                <SelectNav label='Camas' value={camas} change={change} field='camas' fullWidth />
                <SelectNav label='Baños' value={banos} change={change} field='banos' fullWidth />
            </div>
            <div className="flex-1 flex flex-col items-center justify-start gap-4 w-full">
                <CustomInput label='Precio por noche' placeholder=' Ingresa el precio que vas a cobrar.'   {...form.register("precio_noche", {
                    pattern: {
                        value: /^\d+(\.\d{0,2})?$/,
                        message: "Máximo 2 decimales",
                    },
                })} name='precio_noche' type='number' inputMode='decimal' min={1} step={0.01} max={9999999.99}
                    isError={
                        !!form.formState.errors.precio_noche &&
                        form.formState.touchedFields.precio_noche
                    }
                    ErrorElement={<FieldErrors errors={form.formState.errors} name="precio_noche" />}
                    fullWidth
                />
                <CustomSelect label='Divisa de cambio'
                    helperText='Selecciona un tipo de cambio para tu precio.'
                    value={divisa}
                    onChange={(val) => change("divisa_id", val)}
                    options={
                        divisasList.map(d => ({ label: d.acronimo + " - " + d.nombre, value: d.divisa_id })) ?? []}
                />
            </div>
        </div>
    </div>
}

function getDirtyValues(dirtyFields, allValues) {

    const dirtyValues = {};

    Object.keys(dirtyFields).forEach(key => {

        if (typeof dirtyFields[key] === "object") {

            dirtyValues[key] = getDirtyValues(
                dirtyFields[key],
                allValues[key]
            );

        }
        else {

            dirtyValues[key] = allValues[key];

        }

    });

    return dirtyValues;

}