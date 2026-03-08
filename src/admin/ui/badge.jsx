import "../admin.css";

export default function Badge({ text, type }) {
  return (
    <span className={`badge-status ${type}`}>
      {text}
    </span>
  );
}
