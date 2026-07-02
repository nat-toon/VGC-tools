import { memo } from "react";
import Icon from "../Icon.jsx";
import { getItemIcon } from "../../lib/sprite.js";

const ItemGridRow = memo(function ItemGridRow({ i }) {
  const icon = getItemIcon(i.spritenum);
  return (
    <>
      <div className="vt-cell vt-spacer"></div>
      <div className="vt-cell vt-sprite">
        {icon ? <Icon className="item-row-icon" icon={icon} /> : null}
      </div>
      <div className="vt-cell vt-name">{i.name}</div>
      <div className="vt-cell vt-desc">{i.shortDesc || i.desc || "—"}</div>
    </>
  );
});

export default ItemGridRow;
