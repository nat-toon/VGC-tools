import { memo } from "react";
import TypeIcon from "../TypeIcon.jsx";

const TypeGridRow = memo(function TypeGridRow({ t, size = 28 }) {
  return (
    <>
      <div className="vt-cell vt-spacer"></div>
      <div className="vt-cell vt-sprite">
        <TypeIcon type={t} size={size} />
      </div>
      <div className="vt-cell vt-name">{t}</div>
    </>
  );
});

export default TypeGridRow;
