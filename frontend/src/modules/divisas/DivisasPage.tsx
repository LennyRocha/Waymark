import React from "react";
import Breadcrumb from "../../components/Breadcrumb";
import useDivisas from "./hooks/useDivisas";
import CustomLoader from "../../layout/CustomLoader";
import ErrorViewComponent from "../../layout/ErrorViewComponent";
import { Landmark, Pencil } from "lucide-react";
import { CustomInput } from "../../components/CustomInputs";
import CustomButton from "../../components/CustomButton";
import { AnimatePresence, motion } from "framer-motion";
import Divisa from "./types/Divisa";
import useDivisaMutation from "./hooks/useDivisaMutation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useWatchResize from "../../utils/useWatchResize";

const links = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Administración",
    href: "/admin",
  },
  {
    label: "Divisas",
    href: "/admin/currencys",
    disabled: true,
  },
];

const MotionPencil = motion.create(Pencil);

function DivisasPage() {
  const divisasQuery = useDivisas();
  const queryClient = useQueryClient();
  const divisaMutation = useDivisaMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["divisas"],
      });
      toast.success(id ? "Divisa actualizada exitosamente" : "Divisa guardada exitosamente");
      clearForm();
    },
  });
  const emptyForm = {
    nombre: "",
    acronimo: "",
  };
  const [formData, setFormData] =
    React.useState<Partial<Divisa>>(emptyForm);
  const [id, setId] = React.useState<number | null>(null);
  const patternName = /^[a-zA-ZáéíóúÁÉÍÓÚ ]+$/;
  const patternAcronym = /^[A-Z]+$/;
  const isFormValid =
    formData.nombre &&
    formData.acronimo &&
    patternName.test(formData.nombre) &&
    patternAcronym.test(formData.acronimo) &&
    formData.nombre.length <= 50 &&
    formData.acronimo.length <= 5 &&
    formData.acronimo.length > 0 &&
    formData.nombre.length > 0 &&
    formData.nombre?.trim() !== "" &&
    formData.acronimo?.trim() !== "";

  function handleSubmit() {
    if (!isFormValid) return;
    if (id) {
      divisaMutation.mutate({
        data: formData,
        id,
      });
    } else {
      divisaMutation.mutate({
        data: formData,
      });
    }
  }

  function clearForm() {
    setFormData(emptyForm);
    setId(null);
  }

  function setDivisa(divisa: Divisa) {
    setFormData({
      nombre: divisa.nombre,
      acronimo: divisa.acronimo,
    });
    setId(divisa.divisa_id);
  }

  const isSmalll = useWatchResize({
    pixeles: 768,
    metrica: "max",
  });

  if (
    divisasQuery.isLoading ||
    divisasQuery.isInitialLoading
  )
    return (
      <main className="w-[100dvw] h-[100dvh] flex items-center justify-center">
        <CustomLoader />
      </main>
    );
  if (divisasQuery.isError)
    return (
      <main className="w-[100dvw] h-[100dvh]">
        <ErrorViewComponent
          error={divisasQuery.error}
          retryFunction={() => {
            divisasQuery.refetch();
          }}
        />
      </main>
    );
  return (
    <main className="content">
      <Breadcrumb items={links} />
      <h5 className="text-left mt-4">Divisas de cambio</h5>
      <div className="flex gap-4 w-full max-md:flex-col-reverse mt-4">
        <div className="flex flex-col scroll-mini is_y md:max-w-[425px] flex-1 shrink-0">
          <h6 className="text-left mt-2">
            Divisas disponibles
          </h6>
          <AnimatePresence>
            <motion.ul>
              {divisasQuery.data.map((d, idx) => (
                <motion.li
                  initial={{ opacity: 0, x: 10 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: idx * 0.1,
                      duration: 0.3,
                      stiffness: 100,
                      type: "keyframes",
                    },
                  }}
                  whileHover={{
                    backgroundColor: "var(--color-border)",
                  }}
                  key={d.divisa_id}
                  className="flex items-center gap-2 justify-between my-2 p-2 rounded-md  bg-white"
                  onClick={() => isSmalll && setDivisa(d)}
                >
                  <div className="flex items-center gap-2 justify-start">
                    <Landmark
                      size={36}
                      className="shrink-0 transition-colors"
                      color={
                        id && id === d.divisa_id
                          ? "var(--color-primary-500)"
                          : "var(--color-text-primary)"
                      }
                    />
                    <div>
                      <h6
                        className={`transition-colors text-lg font-semibold text-left mb-0 ${id && id === d.divisa_id ? "text-primary-500" : "text-text-primary"}`}
                      >
                        {d.nombre}
                      </h6>
                      <p className="text-text-secondary text-left mt-0">
                        <small>{d.acronimo}</small>
                      </p>
                    </div>
                  </div>
                  <MotionPencil
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    size={24}
                    className="justify-self-end-safe shrink-0 cursor-pointer text-secondary-500 rounded-sm max-md:hidden p-1 transition-colors"
                    onClick={() => setDivisa(d)}
                  />
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-4 flex-1 shrink-0 max-md:min-w-0">
          <h6 className="text-left mt-2">
            Agregar divisa de cambio
          </h6>
          <CustomInput
            placeholder="Nombre de la divisa"
            label="Nombre"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({
                ...formData,
                nombre: e.target.value,
              })
            }
            maxLength={50}
            pattern="^[a-zA-ZáéíóúÁÉÍÓÚ ]+$"
            isError={
              formData.nombre
                ? !patternName.test(formData.nombre)
                : false
            }
            errorMessage={
              formData.nombre === ""
                ? "El nombre es obligatorio"
                : "El nombre debe contener solo letras y espacios."
            }
          />
          <CustomInput
            placeholder="Acrónimo"
            label="Acrónimo"
            value={formData.acronimo}
            onChange={(e) =>
              setFormData({
                ...formData,
                acronimo: e.target.value.toUpperCase(),
              })
            }
            maxLength={5}
            pattern="^[A-Z]+$"
            isError={
              formData.acronimo
                ? !patternAcronym.test(formData.acronimo)
                : false
            }
            errorMessage={
              formData.acronimo === ""
                ? "El acrónimo es obligatorio"
                : "El acrónimo debe contener solo letras mayúsculas."
            }
          />
          <div className="flex gap-2 justify-end">
            <CustomButton
              size="small"
              customWidth="max-md:w-full"
              onClick={clearForm}
              isWaiting={divisaMutation.isPending}
              disabled={
                divisaMutation.isPending ||
                (!formData.nombre && !formData.acronimo)
              }
            >
              Borrar
            </CustomButton>
            <CustomButton
              size="small"
              customWidth="max-md:w-full"
              disabled={!isFormValid}
              onClick={() => handleSubmit()}
              isWaiting={divisaMutation.isPending}
            >
              {id ? "Actualizar" : "Agregar"}
            </CustomButton>
          </div>
        </div>
      </div>
    </main>
  );
}

export default DivisasPage;
