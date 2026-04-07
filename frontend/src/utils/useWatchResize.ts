import React from "react";

type Props = {
  pixeles: number;
  metrica:
    | "max"
    | "min"
    | "equal"
    | "notEqual"
    | "greaterThan"
    | "lessThan";
};

export default function useWatchResize({
  pixeles,
  metrica,
}: Props): boolean {
  const [width, setWidth] = React.useState(
    window.innerWidth,
  );

  React.useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  const value = React.useMemo(() => {
    switch (metrica) {
      case "max":
        return width <= pixeles;
      case "min":
        return width >= pixeles;
      case "equal":
        return width === pixeles;
      case "notEqual":
        return width !== pixeles;
      case "greaterThan":
        return width > pixeles;
      case "lessThan":
        return width < pixeles;
      default:
        return false;
    }
  }, [width, pixeles, metrica]);

  return value;
}