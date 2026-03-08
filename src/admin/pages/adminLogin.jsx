import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import {
  FiLock,
  FiMail,
  FiShield,
  FiClock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import "../admin.css";
import { useLanguage } from "../../LanguageContext";

export default function AdminLogin() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (email && password) {
      localStorage.setItem("adminLoggedIn", "true");
      navigate("/admin/dashboard", { replace: true });
    }
  };

  return (
    <div className="admin-auth-wrapper">
      <div className="admin-auth-card">

        <div className="auth-header">
          <img src={logo} alt="ServiceHub" className="auth-logo" />
          <p>{t('admin_login_portal') || "Admin Portal"}</p>
        </div>

        <h3>{t('admin_login_access') || "Administrator Access"}</h3>
        <p className="sub-text">
          {t('admin_login_access_sub') || "Platform administration access"}
        </p>

        <form onSubmit={handleLogin}>
          <label>{t('admin_login_email') || "Email Address"}</label>
          <div className="input-wrap">
            <FiMail />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>{t('admin_login_pass') || "Password"}</label>
          <div className="input-wrap">
            <FiLock />
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <button type="submit" className="login-btn">
            {t('admin_login_btn_signin') || "Sign In Securely"}
          </button>
        </form>

        <div className="auth-footer">
          <span><FiShield /> {t('admin_login_secure') || "Secure"}</span>
          <span><FiLock /> {t('admin_login_encrypted') || "Encrypted"}</span>
          <span><FiClock /> {t('admin_login_session') || "Session expires"}</span>
        </div>

      </div>
    </div>
  );
}
