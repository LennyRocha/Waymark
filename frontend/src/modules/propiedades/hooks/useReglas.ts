export default function useReglas(
  extraReglas: Record<string, string>,
  setExtraReglas: (reglas: Record<string, string>) => void,
) {
  const addRegla = () => {
    const nextKey = `regla_${Object.keys(extraReglas).length + 1}`;
    setExtraReglas({ ...extraReglas, [nextKey]: "" });
  };

  const removeRegla = (key: string) => {
    const copy = { ...extraReglas };
    delete copy[key];
    if (Object.keys(copy).length === 0) {
      copy.regla_1 = "";
    }
    setExtraReglas(copy);
  };

  const updateRegla = (key: string, value: string) => {
    setExtraReglas({ ...extraReglas, [key]: value });
  };

  return {
    addRegla,
    removeRegla,
    updateRegla,
  };
}
