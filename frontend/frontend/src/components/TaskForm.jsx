import React, { useState } from "react";
import axios from "axios";

export default function TaskForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Work");
  const [deadline, setDeadline] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const token = localStorage.getItem("token") || "";

  const callAI = async () => {
    if (!description) return alert("Enter description first");

    try {
      setLoadingAI(true);
      await new Promise((r) => setTimeout(r, 800)); // mock delay
      const text = description.split(/[.!?]/)[0] || description;

      setSummary(text.length > 120 ? text.slice(0, 120) + "..." : text);
      setCategory("Work");

      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDeadline(d.toISOString().slice(0, 10));
    } finally {
      setLoadingAI(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const data = {
      title,
      description,
      summary,
      category,
      predictedDeadline: deadline,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/tasks",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCreated(res.data);
    } catch {
      onCreated({ ...data, _id: Math.random().toString(36).slice(2, 8) });
    }

    setTitle("");
    setDescription("");
    setSummary("");
    setCategory("Work");
    setDeadline("");
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className="w-full border p-3 rounded-md"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="w-full border p-3 rounded-md"
        rows={4}
        placeholder="Task description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={callAI}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md"
        >
          {loadingAI ? "Thinking..." : "AI Suggest"}
        </button>

        <input
          className="flex-1 border p-2 rounded-md"
          placeholder="Summary (auto)"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <select
          className="border p-2 rounded-md"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Work</option>
          <option>Personal</option>
          <option>Bugfix</option>
          <option>Other</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded-md flex-1"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded-md w-full">
        Create Task
      </button>
    </form>
  );
}
