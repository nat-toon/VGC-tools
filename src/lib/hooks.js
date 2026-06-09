import { useState, useEffect } from "react";

const DESKTOP_HEIGHT = 44;
const MOBILE_HEIGHT = 32;

export function useRowHeight() {
  const [height, setHeight] = useState(() =>
    window.innerWidth <= 768 ? MOBILE_HEIGHT : DESKTOP_HEIGHT
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setHeight(e.matches ? MOBILE_HEIGHT : DESKTOP_HEIGHT);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return height;
}
