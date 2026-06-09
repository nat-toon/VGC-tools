import { forwardRef } from "react";

const SearchInput = forwardRef(function SearchInput(
  { value, onChange, className = "", style },
  ref
) {
  return (
    <input
      ref={ref}
      className={className}
      style={style}
      type="text"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
});

export default SearchInput;
