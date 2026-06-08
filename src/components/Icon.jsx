export default function Icon({ icon, className = "" }) {
  if (!icon) return null;
  return <span className={className} style={icon.css} />;
}
