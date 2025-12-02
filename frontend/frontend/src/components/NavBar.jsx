// Navbar.jsx
import React from "react";

export default function Navbar() {
  // Always read current user from localStorage so it can't be hardcoded
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // If you use history or router, replace with navigate('/login')
    window.location.href = "/login";
  };

  return (
    <header className="w-full bg-indigo-600 text-white flex items-center justify-between px-6 py-3 shadow">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white text-indigo-600 font-bold flex items-center justify-center">AI</div>
        <div>
          <div className="font-bold">AI Task Assistant</div>
          <div className="text-xs opacity-80">Smart task automation</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right mr-2">
          <div className="font-medium text-sm text-white">{user?.name ?? "Guest"}</div>
          <div className="text-xs opacity-80">{user?.email ?? ""}</div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-white text-indigo-600 px-3 py-1 rounded shadow-sm hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
