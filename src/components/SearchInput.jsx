export default function SearchInput({
  value,
  onChange,
  className = "",
  style,
}) {
  return (
    <input
      className={className}
      style={style}
      type="text"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
