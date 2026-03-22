import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropiedadSchema } from "../schemas/PropiedadZod";
import { propiedadPlantilla } from "../templates/PropiedadPlantilla";

export default function usePropiedadForm(
  plantilla = propiedadPlantilla,
) {
  const propiedadFormState = useForm({
    resolver: zodResolver(PropiedadSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: plantilla,
    shouldUnregister: false,
    criteriaMode: "all",
    delayError: 500,
  });
  return propiedadFormState;
}

/*
const {
    register,
    control,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    watch,
    reset,
    setError,
    clearErrors,

    formState: {
        errors,
        isValid,
        isDirty,
        dirtyFields,
    },
} = methods;
 */
