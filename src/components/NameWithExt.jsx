export default function NameWithExt({ name }) {
  const i = name.indexOf("-");
  if (i === -1) return name;
  return (
    <>
      {name.slice(0, i)}
      <span className="name-ext">{name.slice(i)}</span>
    </>
  );
}
