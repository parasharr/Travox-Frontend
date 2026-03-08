import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import {
    FiLock,
    FiMail,
    FiShield,
    FiClock,
    FiEye,
    FiEyeOff,
    FiUser,
    FiBriefcase,
    FiPhone,
    FiMapPin,
    FiCreditCard,
    FiInfo
} from "react-icons/fi";
import "../admin/admin.css";

export default function GlobalRegister() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [role, setRole] = useState("user"); // user or provider

    // Common fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    // Provider-specific fields
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const roleParam = searchParams.get("role");
        if (roleParam && ["user", "provider"].includes(roleParam)) {
            setRole(roleParam);
        }
    }, [searchParams]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validation
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            // Prepare payload based on role
            let payload;

            if (role === "user") {
                // User registration: only name, email, password
                payload = {
                    name,
                    email,
                    password
                };
            } else {
                // Provider registration: includes additional fields
                payload = {
                    name,
                    email,
                    password,
                    role: "provider",
                    companyName,
                    mobile,
                    address,
                    bankDetails: {
                        bankName,
                        accountNumber,
                        ifscCode,
                        accountHolderName
                    }
                };
            }

            const response = await fetch(`${baseUrl}api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // SUCCESS
            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate(`/login?role=${role}`, { replace: true });
            }, 2000);

        } catch (err) {
            console.error("Registration Error:", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = () => {
        switch (role) {
            case "provider": return <FiBriefcase className="text-green-600" />;
            case "user": default: return <FiUser className="text-purple-600" />;
        }
    };

    const getRoleTitle = () => {
        switch (role) {
            case "provider": return "Provider Registration";
            case "user": default: return "User Registration";
        }
    };

    const getRoleSubtitle = () => {
        switch (role) {
            case "provider": return "Start offering your services on Travox";
            case "user": default: return "Join Travox to book amazing services";
        }
    };

    if (success) {
        return (
            <div className="admin-auth-wrapper">
                <div className="admin-auth-card">
                    <div className="auth-header">
                        <img src={logo} alt="Travox" className="auth-logo" />
                        <p>Travox Secure Portal</p>
                    </div>

                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <div style={{ fontSize: "48px", color: "#15803d", marginBottom: "16px" }}>
                            ✓
                        </div>
                        <h3 style={{ margin: "0 0 8px 0", color: "#15803d" }}>Registration Successful!</h3>
                        <p className="sub-text" style={{ margin: 0 }}>
                            Redirecting you to login...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-auth-wrapper">
            <div className="admin-auth-card">

                <div className="auth-header">
                    <img src={logo} alt="Travox" className="auth-logo" />
                    <p>Travox Secure Portal</p>
                </div>

                {/* Role Selector Tabs */}
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px", marginTop: "10px" }}>
                    <button
                        type="button"
                        onClick={() => setRole("user")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: "1px solid #e2e8f0",
                            background: role === "user" ? "#ede9fe" : "white",
                            color: role === "user" ? "#7c3aed" : "#64748b",
                            fontWeight: 500,
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        User
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("provider")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: "1px solid #e2e8f0",
                            background: role === "provider" ? "#dcfce7" : "white",
                            color: role === "provider" ? "#15803d" : "#64748b",
                            fontWeight: 500,
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        Provider
                    </button>
                </div>

                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px", display: "flex", justifyContent: "center" }}>
                        {getRoleIcon()}
                    </div>
                    <h3 style={{ margin: "0 0 4px 0" }}>{getRoleTitle()}</h3>
                    <p className="sub-text" style={{ margin: 0 }}>
                        {getRoleSubtitle()}
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        padding: "10px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        textAlign: "center"
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    {/* Name */}
                    <label>Full Name</label>
                    <div className="input-wrap">
                        <FiUser />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your full name"
                            disabled={loading}
                        />
                    </div>

                    {/* Email */}
                    <label>Email Address</label>
                    <div className="input-wrap">
                        <FiMail />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                    </div>

                    {/* Provider-specific fields */}
                    {role === "provider" && (
                        <>
                            {/* Mobile */}
                            <label>Mobile Number</label>
                            <div className="input-wrap">
                                <FiPhone />
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    required
                                    placeholder="Enter your mobile number"
                                    disabled={loading}
                                />
                            </div>

                            <label>Company Name</label>
                            <div className="input-wrap">
                                <FiBriefcase />
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    required
                                    placeholder="Enter your company name"
                                    disabled={loading}
                                />
                            </div>

                            <label>Address</label>
                            <div className="input-wrap">
                                <FiMapPin />
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    placeholder="Enter your business address"
                                    disabled={loading}
                                />
                            </div>

                            <div style={{ marginTop: "16px", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#475569", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                                {t('reg_bank_details')}
                            </div>

                            <label>{t('reg_bank_name')}</label>
                            <div className="input-wrap">
                                <FiBriefcase />
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    required
                                    placeholder={t('reg_bank_name_placeholder')}
                                    disabled={loading}
                                />
                            </div>

                            <label>{t('reg_account_number')}</label>
                            <div className="input-wrap">
                                <FiCreditCard />
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    required
                                    placeholder={t('reg_account_number_placeholder')}
                                    disabled={loading}
                                />
                            </div>

                            <label>{t('reg_ifsc_code')}</label>
                            <div className="input-wrap">
                                <FiInfo />
                                <input
                                    type="text"
                                    value={ifscCode}
                                    onChange={(e) => setIfscCode(e.target.value)}
                                    required
                                    placeholder={t('reg_ifsc_placeholder')}
                                    disabled={loading}
                                />
                            </div>

                            <label>{t('reg_account_holder')}</label>
                            <div className="input-wrap">
                                <FiUser />
                                <input
                                    type="text"
                                    value={accountHolderName}
                                    onChange={(e) => setAccountHolderName(e.target.value)}
                                    required
                                    placeholder={t('reg_account_holder_placeholder')}
                                    disabled={loading}
                                />
                            </div>
                        </>
                    )}

                    {/* Password */}
                    <label>Password</label>
                    <div className="input-wrap">
                        <FiLock />
                        <input
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Create a password (min 6 characters)"
                            disabled={loading}
                        />
                        <span
                            className="eye"
                            onClick={() => setShowPwd(!showPwd)}
                            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                            {showPwd ? <FiEyeOff /> : <FiEye />}
                        </span>
                    </div>

                    {/* Confirm Password */}
                    <label>Confirm Password</label>
                    <div className="input-wrap">
                        <FiLock />
                        <input
                            type={showConfirmPwd ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your password"
                            disabled={loading}
                        />
                        <span
                            className="eye"
                            onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                            {showConfirmPwd ? <FiEyeOff /> : <FiEye />}
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                    >
                        {loading ? "Creating Account..." : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                    </button>
                </form>

                {/* Login Link */}
                <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#64748b" }}>
                    Already have an account?{" "}
                    <Link
                        to={`/login?role=${role}`}
                        style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
                    >
                        Sign In
                    </Link>
                </div>

                <div className="auth-footer">
                    <span><FiShield /> Secure</span>
                    <span><FiLock /> Encrypted</span>
                    <span><FiClock /> Session expires</span>
                </div>

            </div>
        </div>
    );
}
