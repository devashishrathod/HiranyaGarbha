// "15/30" beside a field. Over the limit only happens for a record saved
// before the limit existed — the inputs themselves stop at it.
const CharCount = ({ length, max }) => {
  let color = "text-slate-400";
  if (length > max) color = "text-red-600";
  else if (length === max) color = "text-amber-600";

  return (
    <span className={`text-xs tabular-nums ${color}`}>
      {length}/{max}
    </span>
  );
};

export default CharCount;
