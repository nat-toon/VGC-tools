import { memo } from "react";

const AbilityGridRow = memo(function AbilityGridRow({ a }) {
  return (
    <>
      <div className="vt-cell vt-sprite"></div>
      <div className="vt-cell vt-name">{a.name}</div>
      <div className="vt-cell vt-desc">{a.shortDesc || a.desc || "—"}</div>
    </>
  );
});

export default AbilityGridRow;
