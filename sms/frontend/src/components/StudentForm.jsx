import { useState } from "react";

const DEPTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Chemical", "Biotechnology"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const EMPTY = { name: "", roll: "", email: "", phone: "", dept: "Computer Science", year: "1st Year", gpa: "", status: "Active" };

const labelStyle = { fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" };
const inputStyle = (err) => ({
  width: "100%", background: "#0a0d14",
  border: `1px solid ${err ? "#ef4444" : "#1e2535"}`,
  color: "#e2e8f0", borderRadius: 8, padding: "10px 14px",
  fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none", boxSizing: "border-box"
});
const errStyle = { color: "#ef4444", fontSize: 11, marginTop: 3, fontFamily: "'DM Mono', monospace" };

// Defined OUTSIDE parent component — prevents focus loss on every keystroke
function Field({ label, value, onChange, type = "text", placeholder, error }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={inputStyle(error)}
      />
      {error && <div style={errStyle}>{error}</div>}
    </div>
  );
}

function FormSelect({ label, value, onChange, opts }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle(false), cursor: "pointer" }}
      >
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function validate(form) {
  const e = {};
  if (!form.name.trim()) e.name = "Required";
  if (!form.roll.trim()) e.roll = "Required";
  if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
  if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = "10-digit number";
  if (form.gpa === "" || isNaN(form.gpa) || +form.gpa < 0 || +form.gpa > 10) e.gpa = "GPA 0–10 required";
  return e;
}

export default function StudentForm({ initial, onSubmit, onCancel, saving, apiErrors = [] }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [errors, setErrors] = useState({});

  const set = (k) => (v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const submit = async () => {
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }
    await onSubmit({ ...form, gpa: parseFloat(form.gpa) });
  };

  return (
    <div>
      {apiErrors.length > 0 && (
        <div style={{ background: "#1f0d0d", border: "1px solid #ef444444", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
          {apiErrors.map((e, i) => (
            <div key={i} style={{ color: "#ef4444", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
              {e.field ? `${e.field}: ${e.message}` : e.message}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <Field label="Full Name"   value={form.name}  onChange={set("name")}  placeholder="e.g. Arjun Kumar"   error={errors.name} />
        <Field label="Roll Number" value={form.roll}  onChange={set("roll")}  placeholder="e.g. CS2021001"     error={errors.roll} />
        <Field label="Email"       value={form.email} onChange={set("email")} placeholder="student@uni.edu" type="email" error={errors.email} />
        <Field label="Phone"       value={form.phone} onChange={set("phone")} placeholder="10-digit number"    error={errors.phone} />
        <FormSelect label="Department" value={form.dept}   onChange={set("dept")}   opts={DEPTS} />
        <FormSelect label="Year"       value={form.year}   onChange={set("year")}   opts={YEARS} />
        <Field label="GPA (0–10)"  value={form.gpa}   onChange={set("gpa")}   placeholder="e.g. 8.5"          error={errors.gpa} />
        <FormSelect label="Status"     value={form.status} onChange={set("status")} opts={["Active", "Inactive"]} />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} disabled={saving} style={{
          background: "transparent", border: "1px solid #1e2535", color: "#94a3b8",
          padding: "10px 22px", borderRadius: 8, cursor: "pointer",
          fontFamily: "'DM Mono', monospace", fontSize: 13
        }}>Cancel</button>
        <button onClick={submit} disabled={saving} style={{
          background: saving ? "#374151" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none", color: "#fff", padding: "10px 28px",
          borderRadius: 8, cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "'Bebas Neue', cursive", fontSize: 16, letterSpacing: 2,
          boxShadow: saving ? "none" : "0 4px 20px rgba(99,102,241,0.4)"
        }}>
          {saving ? "SAVING..." : (initial ? "SAVE CHANGES" : "ADD STUDENT")}
        </button>
      </div>
    </div>
  );
}