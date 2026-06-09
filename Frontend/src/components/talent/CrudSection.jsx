import { useState } from "react";
import { api } from "../../lib/api.js";
import {
  IoAdd,
  IoPencil,
  IoTrash,
  IoChevronDown,
  IoChevronUp,
  IoClose,
  IoCheckmark,
} from "react-icons/io5";

const EMPTY_ITEM = (fields) => {
  const obj = {};
  fields.forEach((f) => {
    obj[f.name] = f.type === "checkbox" ? false : f.type === "tags" ? [] : "";
  });
  return obj;
};

/**
 * Reusable CRUD section for sub-entities (experience, projects, certifications,
 * achievements).  Each section owns its own API path and renders a configurable
 * set of fields.
 */
export default function CrudSection({
  title,
  icon: Icon,
  items,
  onItemsChange,
  apiPath,
  fields,
}) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* ── helpers ─────────────────────────────────────────────────── */

  const startAdd = () => {
    setFormData(EMPTY_ITEM(fields));
    setEditingId(null);
    setAdding(true);
    setError("");
  };

  const startEdit = (item) => {
    setFormData({ ...item });
    setEditingId(item.id);
    setAdding(false);
    setError("");
  };

  const cancelForm = () => {
    setAdding(false);
    setEditingId(null);
    setFormData({});
    setError("");
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (name, raw) => {
    const parsed = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateField(name, parsed);
  };

  /* ── API calls ───────────────────────────────────────────────── */

  const handleSave = async () => {
    setSubmitting(true);
    setError("");
    try {
      if (adding) {
        const res = await api.post(apiPath, formData);
        const created = await res.json();
        onItemsChange([...items, created]);
      } else {
        await api.put(`${apiPath}/${editingId}`, formData);
        onItemsChange(
          items.map((it) => (it.id === editingId ? { ...formData } : it)),
        );
      }
      cancelForm();
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await api.delete(`${apiPath}/${id}`);
      onItemsChange(items.filter((it) => it.id !== id));
      if (editingId === id) cancelForm();
    } catch (e) {
      setError(e?.message || "Delete failed");
    }
  };

  /* ── render helpers ──────────────────────────────────────────── */

  const inputClass =
    "w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all text-sm";

  const labelClass = "block text-xs font-medium text-slate-500 mb-1";

  const renderField = (field, value, onChange) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            rows={3}
            className={inputClass}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        );

      case "checkbox":
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-300"
            />
            <span className="text-sm text-slate-600">{field.label}</span>
          </label>
        );

      case "tags":
        return (
          <input
            value={Array.isArray(value) ? value.join(", ") : ""}
            onChange={(e) => handleTagChange(field.name, e.target.value)}
            placeholder={field.placeholder || "Separate with commas"}
            className={inputClass}
          />
        );

      case "url":
        return (
          <input
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "https://..."}
            className={inputClass}
          />
        );

      default: // text
        return (
          <input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className={inputClass}
          />
        );
    }
  };

  const renderFieldValue = (field, value) => {
    if (field.type === "checkbox") return value ? "Yes" : "No";
    if (field.type === "tags" && Array.isArray(value))
      return value.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {value.map((tag, i) => (
            <span
              key={i}
              className="inline-block px-2 py-0.5 text-[0.7rem] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-slate-400 italic">—</span>
      );
    if (!value) return <span className="text-slate-400 italic">—</span>;
    return <span className="text-sm text-slate-700">{String(value)}</span>;
  };

  /* ── main render ─────────────────────────────────────────────── */

  return (
    <div className="glass-card p-4">
      {/* header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-5 h-5 text-emerald-500" />}
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <span className="text-xs text-slate-400">({items.length})</span>
        </div>
        {expanded ? (
          <IoChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <IoChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600">
              {error}
            </div>
          )}

          {/* existing items */}
          {items.map((item) => {
            const isEditing = editingId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200/60 bg-white/40 p-3"
              >
                {isEditing ? (
                  /* ── edit form ── */
                  <div className="space-y-3">
                    {fields.map((field) => {
                      // Checkbox labels are rendered inside renderField
                      if (field.type === "checkbox") {
                        return (
                          <div key={field.name}>
                            {renderField(field, formData[field.name], (v) =>
                              updateField(field.name, v),
                            )}
                          </div>
                        );
                      }
                      return (
                        <div key={field.name}>
                          <label className={labelClass}>
                            {field.label}
                            {field.required && (
                              <span className="text-rose-400"> *</span>
                            )}
                          </label>
                          {renderField(field, formData[field.name], (v) =>
                            updateField(field.name, v),
                          )}
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={submitting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                      >
                        <IoCheckmark className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelForm}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <IoClose className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── display mode ── */
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {fields.map((field) => {
                        if (field.type === "checkbox") return null;
                        return (
                          <div key={field.name}>
                            <span className="text-[0.65rem] uppercase tracking-wider text-slate-400">
                              {field.label}
                            </span>
                            <div className="mt-0.5">
                              {renderFieldValue(field, item[field.name])}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        <IoPencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete this ${title.toLowerCase()} entry?`,
                            )
                          )
                            handleDelete(item.id);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <IoTrash className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {items.length === 0 && !adding && (
            <p className="text-xs text-slate-400 py-2 text-center">
              No {title.toLowerCase()} added yet.
            </p>
          )}

          {/* add form */}
          {adding && (
            <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/30 p-3 space-y-3">
              <p className="text-xs font-semibold text-emerald-700">
                New {title.slice(0, -1)} Entry
              </p>
              {fields.map((field) => {
                if (field.type === "checkbox") {
                  return (
                    <div key={field.name}>
                      {renderField(field, formData[field.name], (v) =>
                        updateField(field.name, v),
                      )}
                    </div>
                  );
                }
                return (
                  <div key={field.name}>
                    <label className={labelClass}>
                      {field.label}
                      {field.required && (
                        <span className="text-rose-400"> *</span>
                      )}
                    </label>
                    {renderField(field, formData[field.name], (v) =>
                      updateField(field.name, v),
                    )}
                  </div>
                );
              })}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  <IoCheckmark className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <IoClose className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* add button */}
          {!adding && (
            <button
              type="button"
              onClick={startAdd}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <IoAdd className="w-4 h-4" /> Add {title.slice(0, -1)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
