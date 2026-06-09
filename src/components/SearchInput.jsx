import { forwardRef } from "react";

const SearchInput = forwardRef(function SearchInput({ value, onChange, className = "", style }, ref) {
  return (
    <div className="search-input-wrap">
      <input
        ref={ref}
        className={className}
        style={style}
        type="text"
        placeholder="Search..."
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="search-input-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
          tabIndex={-1}
        >
          ×
        </button>
      )}
    </div>
  );
});

export default SearchInput;
