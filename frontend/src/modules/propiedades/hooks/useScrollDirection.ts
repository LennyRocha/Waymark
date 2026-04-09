import { useEffect, useState } from "react";

export default function useScrollDirection() {
  const [direction, setDirection] = useState<"up" | "down">(
    "up",
  );

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY) < 10) return;

      if (scrollY > lastScrollY) {
        setDirection("down");
      } else {
        setDirection("up");
      }

      lastScrollY = Math.max(scrollY, 0);
    };

    window.addEventListener("scroll", updateDirection);

    return () =>
      window.removeEventListener("scroll", updateDirection);
  }, []);

  return direction;
}