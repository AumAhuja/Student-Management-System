import { useEffect } from "react";

const deptColors = {
  "Computer Science": "#6366f1", "Electronics": "#f59e0b",
  "Mechanical": "#ef4444", "Civil": "#10b981",
  "Chemical": "#8b5cf6", "Biotechnology": "#ec4899",
};

export function Avatar({ name, dept }) {
  const initials = (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const color = deptColors[dept] || "#6366f1";
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}cc, ${color}44)`,
      border: `2px solid ${color}66`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Bebas Neue', cursive", fontSize: 16,
      color: "#fff", flexShrink: 0, letterSpacing: 1
    }}>{initials}</div>
  );
}

export function DeptDot({ dept }) {
  const color = deptColors[dept] || "#6366f1";
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />;
}

export function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "success" ? "#0d1f12" : "#1f0d0d",
      border: `1px solid ${type === "success" ? "#22c55e" : "#ef4444"}`,
      color: type === "success" ? "#22c55e" : "#ef4444",
      padding: "12px 22px", borderRadius: 10,
      fontFamily: "'DM Mono', monospace", fontSize: 13,
      boxShadow: `0 0 24px ${type === "success" ? "#22c55e33" : "#ef444433"}`,
      animation: "slideUp .3s ease",
      display: "flex", alignItems: "center", gap: 10
    }}>
      <span style={{ fontSize: 18 }}>{type === "success" ? "✓" : "✕"}</span>
      {msg}
    </div>
  );
}

export function Modal({ title, onClose, children, maxWidth = 560 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#0e1117", border: "1px solid #1e2535",
        borderRadius: 18, width: "100%", maxWidth,
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        animation: "popIn .25s ease", maxHeight: "90vh", overflowY: "auto"
      }}>
        <div style={{
          padding: "20px 28px", borderBottom: "1px solid #1e2535",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "#0e1117", zIndex: 1
        }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: "#e2e8f0", letterSpacing: 2 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "#1e2535", border: "none", color: "#94a3b8",
            width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>
        <div style={{ padding: "24px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon, color, loading }) {
  return (
    <div style={{
      background: "#0e1117", border: "1px solid #1e2535",
      borderRadius: 14, padding: "18px 22px",
      display: "flex", alignItems: "center", gap: 16,
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", right: -12, top: -12, width: 80, height: 80, borderRadius: "50%", background: `${color}11` }} />
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: `${color}1a`, border: `1px solid ${color}33`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color, lineHeight: 1 }}>
          {loading ? "—" : value}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <span style={{
      fontSize: 11, padding: "4px 12px", borderRadius: 20,
      fontFamily: "'DM Mono', monospace", letterSpacing: 1,
      background: active ? "#052e1411" : "#1f0d0d",
      border: `1px solid ${active ? "#22c55e44" : "#ef444444"}`,
      color: active ? "#22c55e" : "#ef4444",
      display: "inline-flex", alignItems: "center", gap: 6,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: active ? "#22c55e" : "#ef4444",
        animation: active ? "pulse 2s infinite" : "none"
      }} />
      {status}
    </span>
  );
}

export { deptColors };
