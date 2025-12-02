import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import ChatWidget from "../components/ChatWidget";
import axios from "axios";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  // start with any cached user name, otherwise fall back to Guest
  const [name, setName] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "Guest";
      const u = JSON.parse(raw);
      return u?.name || "Guest";
    } catch {
      return "Guest";
    }
  });
  const [email, setEmail] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "";
      const u = JSON.parse(raw);
      return u?.email || "";
    } catch {
      return "";
    }
  });

  // token may change if user logs in/out — read fresh inside functions
  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    // init user (use cached user or call /me if token exists)
    async function initUser() {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          setName(u?.name || "Guest");
          setEmail(u?.email || "");
          // don't call /me if we already have user
          return;
        }
      } catch {
        // ignore parse error
      }

      const token = getToken();
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUser = res.data;
        if (fetchedUser) {
          localStorage.setItem("user", JSON.stringify(fetchedUser));
          setName(fetchedUser?.name || "Guest");
          setEmail(fetchedUser?.email || "");
        }
      } catch (err) {
        // cannot fetch /me => leave as Guest or cached values
        console.warn("Could not fetch /api/auth/me:", err?.message || err);
      }
    }

    initUser();
    // load tasks after init (can run in parallel)
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const loadTasks = async () => {
    const token = getToken();
    try {
      if (!token) {
        // no token -> likely demo mode, leave tasks empty or fetch demo tasks if you want
        setTasks([]);
        return;
      }
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(
        "loadTasks -> backend returned",
        Array.isArray(res.data) ? res.data.length : 0,
        "tasks"
      );
      const ordered = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTasks(ordered);
    } catch (err) {
      console.log("Backend offline or tasks fetch failed, using demo mode", err);
      // fallback: keep tasks as-is (empty or previously set)
    }
  };

  const handleCreated = (t) => {
    // add new task to top
    setTasks((p) => [t, ...p]);
  };

  const handleDelete = async (t) => {
    const token = getToken();
    try {
      if (!token) {
        // demo fallback: remove locally
        setTasks((p) => p.filter((x) => x._id !== t._id));
        return;
      }
      await axios.delete(`http://localhost:5000/api/tasks/${t._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((p) => p.filter((x) => x._id !== t._id));
    } catch (err) {
      console.warn("Delete failed, applying demo fallback:", err);
      // fixed fallback: remove by _id (previous code had typo _1)
      setTasks((p) => p.filter((x) => x._id !== t._id));
    }
  };

  const handleComplete = async (t) => {
    const token = getToken();
    try {
      if (!token) {
        // demo fallback: update locally
        setTasks((p) => p.map((x) => (x._id === t._id ? { ...x, status: "completed" } : x)));
        return;
      }
      const res = await axios.patch(
        `http://localhost:5000/api/tasks/${t._id}`,
        { status: "completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((p) => p.map((x) => (x._id === t._id ? res.data : x)));
    } catch (err) {
      console.warn("Complete update failed, applying demo fallback:", err);
      setTasks((p) => p.map((x) => (x._id === t._id ? { ...x, status: "completed" } : x)));
    }
  };

  // dynamic stats derived from tasks array
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => (t.status || "pending") === "pending").length;
  const inProgressCount = tasks.filter((t) => {
    const s = (t.status || "").toString().toLowerCase();
    return s === "in-progress" || s === "in_progress" || s === "in progress";
  }).length;
  const completedCount = tasks.filter((t) => (t.status || "").toString().toLowerCase() === "completed").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* pass dynamic name to NavBar */}
      <NavBar name={name} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CREATE TASK LEFT PANEL */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border">
              <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
              <TaskForm onCreated={handleCreated} />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="md:col-span-2 space-y-6">
            {/* WELCOME BLOCK: now dynamic */}
            <div className="bg-white p-6 rounded-2xl shadow border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Welcome back, {name}</h3>
                <p className="text-sm text-gray-500">Here's your task summary</p>
              </div>
              <div className="text-sm text-gray-600">{email}</div>
            </div>

            {/* STATS ROW (dynamic) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Total Tasks</div>
                <div className="text-2xl font-bold">{totalTasks}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold">{pendingCount}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border">
                <div className="text-sm text-gray-600">In Progress</div>
                <div className="text-2xl font-bold">{inProgressCount}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-2xl font-bold">{completedCount}</div>
              </div>
            </div>

            {/* TASK LIST */}
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border text-gray-500">
                  No tasks created yet — start by adding a new one.
                </div>
              ) : (
                tasks.map((t) => (
                  <TaskCard
                    key={t._id || Math.random()}
                    t={t}
                    onDelete={() => handleDelete(t)}
                    onComplete={() => handleComplete(t)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}
