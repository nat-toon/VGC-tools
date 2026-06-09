export default function Icon({ icon, className = "", style }) {
  if (!icon) return null;
  return <span className={className} style={style || icon.css} />;
}
