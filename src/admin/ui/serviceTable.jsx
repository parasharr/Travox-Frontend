import { FiMoreVertical, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

export default function ServicesTable({ data, onView, onEdit, onDelete }) {
  const { t } = useLanguage();

  return (
    <div className="services-table">

      {/* TABLE HEADER */}
      <div className="services-row header">
        <div>{t('admin_services_st_service') || "Service"}</div>
        <div>{t('admin_services_st_provider') || "Provider"}</div>
        <div>{t('admin_services_st_category') || "Category"}</div>
        <div>{t('admin_services_st_price') || "Price"}</div>
        <div>{t('admin_services_st_status') || "Status"}</div>
        <div>{t('admin_services_st_bookings') || "Bookings"}</div>
        <div>{t('admin_services_st_actions') || "Actions"}</div>
      </div>

      {data.map((item, i) => (
        <div className="services-row" key={i}>

          {/* SERVICE */}
          <div className="service-col" data-label="Service">
            <div className="service-main-info">
              {item.image && (
                <div className="service-thumbnail">
                  <img src={item.image} alt={item.service} />
                </div>
              )}
              <span className="service-name">{item.service}</span>
            </div>
          </div>

          {/* PROVIDER */}
          <div className="provider-col" data-label="Provider">
            <div className="provider-avatar">{item.providerInitials}</div>
            <span>{item.provider}</span>
          </div>

          {/* CATEGORY */}
          <div data-label="Category">
            <span className="category-pill">{item.category}</span>
          </div>

          {/* PRICE */}
          <div data-label="Price">${item.price}</div>

          {/* STATUS */}
          <div data-label="Status">
            <span className={`status-pill ${item.status.toLowerCase()}`}>
              {item.status}
            </span>
          </div>

          {/* BOOKINGS */}
          <div data-label="Bookings">{item.bookings}</div>

          {/* ACTIONS */}
          <div className="actions-col" data-label={t('admin_services_st_actions') || "Actions"}>
            <button
              className="icon-btn view"
              title={t('admin_services_st_view_details') || "View Details"}
              onClick={() => onView && onView(item)}
              style={{ color: "#3b82f6", background: "#eff6ff", border: "none" }} // Inline fallback style
            >
              <FiEye />
            </button>
            {/* <button
              className="icon-btn edit"
              title={t('admin_services_st_edit') || "Edit"}
              onClick={() => onEdit && onEdit(item)}
            >
              <FiEdit2 />
            </button> */}
            <button
              className="icon-btn delete"
              title={t('admin_services_st_delete') || "Delete"}
              onClick={() => onDelete && onDelete(item)}
            >
              <FiTrash2 />
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}
