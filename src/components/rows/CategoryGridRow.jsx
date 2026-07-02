import { memo } from "react";
import CategoryIcon from "../CategoryIcon.jsx";

const CategoryGridRow = memo(function CategoryGridRow({ cat }) {
  return (
    <>
      <div className="vt-cell vt-spacer"></div>
      <div className="vt-cell vt-sprite">
        <CategoryIcon category={cat} width={28} />
      </div>
      <div className="vt-cell vt-name">{cat}</div>
    </>
  );
});

export default CategoryGridRow;
