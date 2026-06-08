export default function TypeIcon({ type, size = 28, className = "" }) {
  return (
    <span
      className={`type-icon ${className}`}
      data-type={String(type || "").toLowerCase()}
      style={size !== 28 ? { width: size, height: size } : undefined}
    />
  );
}
