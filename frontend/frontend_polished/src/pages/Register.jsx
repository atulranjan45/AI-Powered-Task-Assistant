import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Try to register via backend
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      // If backend returns token + user, use it
      const token = res.data?.token;
      const user = res.data?.user || { name, email };

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/", { replace: true });
      } else {
        // fallback to demo account
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("user", JSON.stringify({ name: name || email, email }));
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.warn("Register error:", err);
      if (err?.response == null) {
        // backend offline — demo register fallback
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("user", JSON.stringify({ name: name || email, email }));
        navigate("/", { replace: true });
      } else {
        setError(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Create your account</h2>

        {error && <div className="text-red-600 mb-3">{error}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-3 rounded"
            placeholder="Full name"
          />
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded"
            placeholder="Email"
            type="email"
          />
          <input
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded"
            placeholder="Password"
            type="password"
          />
          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 underline">
            Sign in
          </Link>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Note: If backend is offline, this uses a demo fallback so the UI still works.
        </div>
      </div>
    </div>
  );
}
