import React from "react";

export default function TaskCard({ t, onDelete, onComplete }) {
  const status = t.status || "pending";

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{t.title}</h3>
          <p className="text-gray-600 text-sm mt-1">
            {t.summary || t.description}
          </p>

          <div className="flex gap-2 mt-3 text-sm">
            <span className="px-2 py-1 bg-gray-100 rounded">{t.category}</span>
            {t.predictedDeadline && (
              <span className="px-2 py-1 bg-yellow-100 rounded">
                Due: {t.predictedDeadline}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <div
            className={`px-3 py-1 rounded-full text-xs ${
              status === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={onComplete}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded"
            >
              Complete
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
