import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../LanguageContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <div className="space-y-6">

      <div className="bg-white rounded-xl p-5 text-center shadow-sm">
        <div className="w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
          🤖
        </div>
        <h4 className="font-semibold">{t('sidebar_need_help')}</h4>
        <p className="text-sm text-gray-500 mb-3">
          {t('sidebar_support_247')}
        </p>
        <button
          onClick={() => navigate('/raise-dispute')}
          className="bg-blue-600 text-white w-full py-2 rounded-lg"
        >
          {t('sidebar_raise_dispute')}
        </button>
      </div>

    </div>
  );
}
