import { FiX } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

export default function AddCategoryModal({ open, onClose, onSubmit }) {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>

        <div className="admin-modal-header">
          <h3>{t('admin_services_cm_title') || "Add Category"}</h3>
          <FiX className="modal-close" onClick={onClose} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;

            onSubmit({
              name: form.name.value.trim(),
              description: form.description.value.trim(),
            });

            form.reset();
          }}
        >
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{t('admin_services_cm_name_label') || "Name *"}</label>
              <input name="name" required placeholder={t('admin_services_cm_name_placeholder') || "Category name"} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{t('admin_services_cm_desc_label') || "Description"}</label>
              <textarea name="description" rows="3" placeholder={t('admin_services_cm_desc_placeholder') || "Category description"} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }} />
            </div>
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              {t('admin_services_cm_cancel') || "Cancel"}
            </button>
            <button type="submit" className="btn-primary">
              {t('admin_services_cm_submit') || "Add Category"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
