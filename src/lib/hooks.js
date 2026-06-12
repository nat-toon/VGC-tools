import { useState, useEffect } from "react";

const DESKTOP_HEIGHT = 44;
const MOBILE_HEIGHT = 32;

export function useRowHeight(desktop = DESKTOP_HEIGHT, mobile = MOBILE_HEIGHT) {
  const [height, setHeight] = useState(() =>
    window.innerWidth <= 768 ? mobile : desktop
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setHeight(e.matches ? mobile : desktop);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [desktop, mobile]);

  return height;
}
