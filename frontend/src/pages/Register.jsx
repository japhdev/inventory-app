import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/**
 * Register Component
 *
 * Renders a registration form for the Inventory application.
 * Handles new user creation by sending the form data to the backend API.
 * On success, shows a confirmation message and redirects to the login page.
 */
function Register() {
    /**
     * Form state containing the user's username, email and password input.
     * Initialized with empty strings for all fields.
     */
    const [form, setForm] = useState({ username: "", email: "", password: "" });

    /**
     * Error message displayed when registration fails or a connection error occurs.
     * Empty string means no error is shown.
     */
    const [error, setError] = useState("");

    /**
     * Success message displayed when the account is created successfully.
     * Empty string means no message is shown.
     */
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    /**
     * Updates the form state when the user types in an input field.
     * Uses the input's name attribute as the key to update the correct field.
     */
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /**
     * Handles form submission by sending registration data to the backend.
     *
     * Makes a POST request to http://localhost:8000/register with the form data.
     * - On success: shows "Account created! Redirecting..." and navigates to /login after 1.5s.
     * - On failed registration: shows the error detail returned by the API or "Registration failed".
     * - On network failure: shows "Connection error. Try again.".
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:8000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message === "User registered successfully") {
                    setSuccess("Account created! Redirecting...");
                    setTimeout(() => navigate("/login"), 1500);
                } else {
                    setError(data.detail || "Registration failed");
                }
            })
            .catch(() => setError("Connection error. Try again."));
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1 className="auth-title">Inventory Management</h1>
                <h2 className="auth-subtitle">Create account</h2>
                {/* Registration form — calls handleSubmit on submission */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Username input — controlled via form state */}
                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                    {/* Email input — controlled via form state */}
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    {/* Password input — controlled via form state */}
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    {/* Conditionally renders error message if registration fails */}
                    {error && <p className="auth-error">{error}</p>}
                    {/* Conditionally renders success message on account creation */}
                    {success && <p className="auth-success">{success}</p>}
                    <button type="submit">Create account</button>
                </form>
                {/* Link to login page for existing users */}
                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
            <div className="auth-image-panel">
                <img src="/image-login.png" alt="workspace" />
            </div>
        </div>
    );
}

export default Register;