import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function nameFromEmail(email = "") {
  // derive a simple display name from email before the @,
  // e.g. rohit@example.com -> Rohit
  const [local] = email.split("@");
  if (!local) return "User";
  const parts = local.split(/[._\-]/).filter(Boolean);
  const name = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return name || "User";
}

export default function Login() {
  // start empty so we don't accidentally prefill Atul
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
      // try backend login
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // Expect res.data.token and optionally res.data.user
      const token = res.data?.token;
      const userFromResponse = res.data?.user || null;

      if (!token) {
        throw new Error("Invalid login response: no token");
      }

      // store token first
      localStorage.setItem("token", token);

      // If backend returned a user object, use it
      if (userFromResponse && (userFromResponse.name || userFromResponse.email)) {
        localStorage.setItem("user", JSON.stringify(userFromResponse));
      } else {
        // If backend only returned token, fetch /me for authoritative user info
        try {
          const me = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const authoritativeUser = me.data;
          localStorage.setItem("user", JSON.stringify(authoritativeUser));
        } catch (fetchErr) {
          // If /me fails, fallback to a sensible demo-like user derived from email
          const fallbackUser = { name: nameFromEmail(email), email };
          localStorage.setItem("user", JSON.stringify(fallbackUser));
        }
      }

      // go to root (Protected route will render Dashboard)
      navigate("/", { replace: true });
    } catch (err) {
      console.warn("Login error:", err);

      // If backend is unreachable (network error), fallback to demo login
      if (!err?.response) {
        // network or backend offline — demo login
        const demoUser = { name: nameFromEmail(email), email };
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("user", JSON.stringify(demoUser));
        navigate("/", { replace: true });
      } else {
        // show server-provided message if available
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="hidden md:block bg-gradient-to-br from-primary to-accent text-white p-8 rounded-2xl card">
          <h2 className="text-3xl font-bold mb-4">AI Task Assistant</h2>
          <p className="opacity-90 mb-6">
            Smart task summarization, deadline prediction and an AI assistant to boost productivity.
          </p>
          <div className="mt-6 flex justify-center">
            <img src="/avatar.svg" alt="avatar" className="w-32 h-32 rounded" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl card">
          <h1 className="text-2xl font-semibold mb-4">Welcome back</h1>

          {error && <div className="text-red-600 mb-2">{error}</div>}

          <form onSubmit={submit} className="space-y-3">
            <input
              className="border p-3 w-full rounded-md"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
            <input
              className="border p-3 w-full rounded-md"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="w-full bg-primary text-white py-3 rounded-md btn disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary underline">
              Create one
            </Link>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Tip: If backend is offline, this page falls back to a demo login so you can present the UI.
          </div>
        </div>
      </div>
    </div>
  );
}
