export default function SectionHeader({ label, count }) {
  return (
    <div className="global-search-section-header">
      <span>{label}</span>
      <span className="global-search-section-count">({count})</span>
    </div>
  );
}
