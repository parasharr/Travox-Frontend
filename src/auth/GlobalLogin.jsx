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
    FiCpu
} from "react-icons/fi";
import "../admin/admin.css"; // Reusing admin styles as requested

export default function GlobalLogin() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [role, setRole] = useState("user"); // user, provider, admin
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const roleParam = searchParams.get("role");
        if (roleParam && ["user", "provider", "admin"].includes(roleParam)) {
            setRole(roleParam);
        }
    }, [searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (email && password) {
            try {
                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
                // Using fallback just in case env isn't loaded yet in dev without restart, though it should be.

                const response = await fetch(`${baseUrl}api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        role // sending role in case backend supports/needs it
                    }),
                });

                const data = await response.json();


                if (!response.ok) {
                    throw new Error(data.message || "Login failed");
                }

                // Strict Role Enforcement
                // Attempt to determine the actual role from the response
                let actualRole = null;

                if (data.admin || data.role === 'admin' || data?.user?.role === 'admin') {
                    actualRole = 'admin';
                } else if (data.provider || data.role === 'provider' || data?.user?.role === 'provider') {
                    actualRole = 'provider';
                } else if (data.user || data.role === 'user' || data?.user?.role === 'user') {
                    actualRole = 'user';
                }

                if (actualRole && actualRole !== role) {
                    throw new Error(`Access Denied: Must be a valid ${role.charAt(0).toUpperCase() + role.slice(1)}`);
                }

                // SUCCESS
                // Store token
                if (data.token) {
                    localStorage.setItem("token", data.token);
                } else if (data.accessToken) {
                    localStorage.setItem("token", data.accessToken);
                }

                // Store Email & Name for display
                localStorage.setItem("loginEmail", email);

                console.log("Full Login Response Data:", data);

                const userName =
                    data.name ||
                    data.user?.name ||
                    data.admin?.name ||
                    data.provider?.name ||
                    data.data?.user?.name ||
                    data.data?.name ||
                    "User";

                localStorage.setItem("loginName", userName);

                // Store User ID for fetching full profile later
                let userId = data.user?._id || data.admin?._id || data.provider?._id || data._id || data.data?._id;

                // Fallback: Decode JWT if ID is missing (common with some backends)
                if (!userId) {
                    try {
                        const token = data.token || data.accessToken;
                        if (token && token.includes('.')) {
                            const base64Url = token.split('.')[1];
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            const payload = JSON.parse(window.atob(base64));
                            userId = payload.id || payload._id || payload.sub; // sub is standard for ID
                            console.log("Extracted userId from JWT:", userId);
                        }
                    } catch (e) {
                        console.error("JWT Decode Error:", e);
                    }
                }

                if (userId) {
                    localStorage.setItem("userId", userId);
                }

                console.log("Stored loginName:", userName, "userId:", userId);

                // Set Session Flag
                if (role === "admin") {
                    localStorage.setItem("adminLoggedIn", "true");
                    navigate("/admin/dashboard", { replace: true });
                } else if (role === "provider") {
                    localStorage.setItem("providerLoggedIn", "true");
                    navigate("/provider/dashboard", { replace: true });
                } else {
                    localStorage.setItem("userLoggedIn", "true");
                    navigate("/home", { replace: true });
                }

            } catch (err) {
                console.error("Login Error:", err);
                setError(err.message || "Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    const getRoleIcon = () => {
        switch (role) {
            case "admin": return <FiShield className="text-blue-600" />;
            case "provider": return <FiBriefcase className="text-green-600" />;
            case "user": default: return <FiUser className="text-purple-600" />;
        }
    };

    const getRoleTitle = () => {
        switch (role) {
            case "admin": return "Administrator Access";
            case "provider": return "Provider Access";
            case "user": default: return "User Login";
        }
    };

    const getRoleSubtitle = () => {
        switch (role) {
            case "admin": return "Platform administration access";
            case "provider": return "Manage your services and bookings";
            case "user": default: return "Access your bookings and profile";
        }
    };

    return (
        <div className="admin-auth-wrapper">
            <div className="admin-auth-card">

                <div className="auth-header">
                    <img src={logo} alt="ServiceHub" className="auth-logo" />
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
                    <button
                        type="button"
                        onClick={() => setRole("admin")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: "1px solid #e2e8f0",
                            background: role === "admin" ? "#dbeafe" : "white",
                            color: role === "admin" ? "#1d4ed8" : "#64748b",
                            fontWeight: 500,
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        Admin
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

                <form onSubmit={handleLogin}>
                    <label>Email Address</label>
                    <div className="input-wrap">
                        <FiMail />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={`Enter ${role} email`}
                            disabled={loading}
                        />
                    </div>

                    <label>Password</label>
                    <div className="input-wrap">
                        <FiLock />
                        <input
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter password"
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

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                    >
                        {loading ? "Signing In..." : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                    </button>
                </form>

                {/* Registration Link */}
                {role !== "admin" && (
                    <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#64748b" }}>
                        Don't have an account?{" "}
                        <Link
                            to={`/register?role=${role}`}
                            style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
                        >
                            Register Now
                        </Link>
                    </div>
                )}

                <div className="auth-footer">
                    <span><FiShield /> Secure</span>
                    <span><FiLock /> Encrypted</span>
                    <span><FiClock /> Session expires</span>
                </div>

            </div>
        </div>
    );
}
