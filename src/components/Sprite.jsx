import { useState, useCallback, useEffect } from "react";

export default function Sprite({ sprite, className, alt, loading = "lazy", onError }) {
  const [fallbacks, setFallbacks] = useState(sprite?.fallbacks || []);
  const [src, setSrc] = useState(sprite?.url || "");

  useEffect(() => {
    setSrc(sprite?.url || "");
    setFallbacks(sprite?.fallbacks || []);
  }, [sprite?.url]);

  const handleError = useCallback(() => {
    if (fallbacks.length > 0) {
      const [next, ...rest] = fallbacks;
      setFallbacks(rest);
      setSrc(next);
    } else if (onError) {
      onError();
    }
  }, [fallbacks, onError]);

  if (!sprite) return null;
  const style = sprite.pixelated ? { imageRendering: "pixelated" } : undefined;
  return (
    <img
      className={className}
      src={src}
      width={sprite.w}
      height={sprite.h}
      alt={alt}
      loading={loading}
      style={style}
      onError={handleError}
    />
  );
}
