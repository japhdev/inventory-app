import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/**
 * Login Component
 *
 * Renders a sign-in form for the Inventory application.
 * Handles user authentication by sending credentials to the backend API.
 * On success, stores the access token and username in localStorage
 * and redirects the user to the home page.
 */
function Login({ onLogin }) {
    /**
     * Form state containing the user's email and password input.
     * Initialized with empty strings for both fields.
     */
    const [form, setForm] = useState({ email: "", password: "" });

    /**
     * Error message displayed when login fails or a connection error occurs.
     * Empty string means no error is shown.
     */
    const [error, setError] = useState("");

    const navigate = useNavigate();

    /**
     * Updates the form state when the user types in an input field.
     * Uses the input's name attribute as the key to update the correct field.
     */
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /**
     * Handles form submission by sending login credentials to the backend.
     *
     * Makes a POST request to http://localhost:8000/login with the form data.
     * - On success: saves access_token and username to localStorage, redirects to /.
     * - On invalid credentials: shows "Invalid email or password".
     * - On network failure: shows "Connection error. Try again.".
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.access_token) {
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("username", data.username);
                    onLogin()
                    navigate("/");
                } else {
                    setError("Invalid email or password");
                }
            })
            .catch(() => setError("Connection error. Try again."));
    };

return (
    <div className="auth-container">
        <div className="auth-box">
            <h1 className="auth-title">Inventory Management</h1>
            <h2 className="auth-subtitle">Sign in to your account</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                {error && <p className="auth-error">{error}</p>}
                <button type="submit">Sign in</button>
            </form>
            <p className="auth-link">
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>

        <div className="auth-image-panel">
            <img src="/image-login.png" alt="workspace" />
        </div>
    </div>
);
}

export default Login;