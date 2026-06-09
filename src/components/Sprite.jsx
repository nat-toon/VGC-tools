export default function Sprite({ sprite, className, alt, loading = "lazy", onError }) {
  if (!sprite) return null;
  const style = sprite.pixelated ? { imageRendering: "pixelated" } : undefined;
  return (
    <img
      className={className}
      src={sprite.url}
      width={sprite.w}
      height={sprite.h}
      alt={alt}
      loading={loading}
      style={style}
      onError={onError}
    />
  );
}
