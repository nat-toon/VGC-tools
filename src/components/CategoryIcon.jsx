/*
 * Move category icon.  Pairs with src/styles/categories.css, which
 * defines the per-category background-image data-URIs (4:3 PNGs).
 *
 * Mirrors the TypeIcon pattern: data-category is lowercased so the
 * CSS selectors match regardless of whether the caller passes
 * "Physical" or "physical".
 *
 * Pass `width` for the rendered size; the height is auto-derived
 * from the 4:3 aspect ratio of the source PNGs.  Pass a `title` for
 * a tooltip on hover.
 */

export default function CategoryIcon({ category, width = 20, className = "", title }) {
  const h = Math.round(width * 0.75);
  return (
    <span
      className={`category-icon ${className}`}
      data-category={String(category || "").toLowerCase()}
      style={{ width: width + "px", height: h + "px" }}
      title={title}
    />
  );
}
