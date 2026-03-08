import { FiHome, FiBriefcase, FiUser, FiImage, FiEdit2, FiLayers, FiTrash2 } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

export default function CategoryCard({
  type,
  title,
  count,
  active,
  onToggle,
  onDelete
}) {
  const { t } = useLanguage();

  const icons = {
    home: <FiHome />,
    professional: <FiBriefcase />,
    personal: <FiUser />,
    creative: <FiImage />,
  };

  return (
    <div className="category-row">

      {/* LEFT */}
      <div className="category-left">
        <div className="category-icon">
          {icons[type] || <FiLayers />}
        </div>

        <div className="category-info">
          <p className="category-title">{title}</p>
          <span className="category-count">{count}</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="category-right">

        <span className="category-status">
          {active ? (t('admin_services_cc_active') || "Active") : (t('admin_services_cc_inactive') || "Inactive")}
        </span>

        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={active}
            onChange={onToggle}
          />
          <span className="slider" />
        </label>

        <FiTrash2
          className="category-edit"
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
          }}
          style={{ cursor: "pointer", color: "#ef4444" }} // Red color for delete
        />
      </div>
    </div>
  );
}
