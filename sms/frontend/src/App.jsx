import { useState, useCallback, useEffect, useRef } from "react";
import { useStudents, useStats, useStudentMutations } from "./hooks/useStudents";
import StudentForm from "./components/StudentForm";
import { Modal, Toast, Avatar, StatusBadge, DeptDot } from "./components/UI";

const DEPTS = ["Computer Science","Electronics","Mechanical","Civil","Chemical","Biotechnology"];
const DEPT_COLORS = {
  "Computer Science":"#818cf8","Electronics":"#fbbf24",
  "Mechanical":"#f87171","Civil":"#34d399",
  "Chemical":"#c084fc","Biotechnology":"#f472b6",
};

// ── Animated counter ──────────────────────────────────────────────────────────
function useAnimatedValue(target, duration = 900) {
  const [v, setV] = useState(0);
  const ref = useRef({ from: 0, raf: null });
  useEffect(() => {
    const to = parseFloat(target) || 0;
    const from = ref.current.from;
    if (from === to) return;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      const cur = from + (to - from) * e;
      setV(cur);
      if (p < 1) ref.current.raf = requestAnimationFrame(tick);
      else { setV(to); ref.current.from = to; }
    };
    cancelAnimationFrame(ref.current.raf);
    ref.current.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current.raf);
  }, [target, duration]);
  return v;
}

// ── Live Clock ────────────────────────────────────────────────────────────────
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  const p = n => String(n).padStart(2,"0");
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'DM Mono',monospace", fontSize:12, color:"#475569" }}>
      <div style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 8px #22c55e", animation:"livePulse 2s infinite" }} />
      <span style={{ color:"#e2e8f0", letterSpacing:2 }}>{p(t.getHours())}:{p(t.getMinutes())}:{p(t.getSeconds())}</span>
      <span style={{ color:"#1e2535" }}>|</span>
      <span>{t.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</span>
    </div>
  );
}

// ── Aurora background ─────────────────────────────────────────────────────────
function Aurora() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
      <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, #6366f115 0%, transparent 70%)", top:"-20%", left:"-10%", animation:"drift1 18s ease-in-out infinite" }} />
      <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, #8b5cf614 0%, transparent 70%)", bottom:"-15%", right:"-10%", animation:"drift2 22s ease-in-out infinite" }} />
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, #ec489910 0%, transparent 70%)", top:"40%", left:"40%", animation:"drift3 26s ease-in-out infinite" }} />
      {/* grid */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(#ffffff03 1px,transparent 1px),linear-gradient(90deg,#ffffff03 1px,transparent 1px)", backgroundSize:"48px 48px" }} />
    </div>
  );
}

// ── Mini sparkline ────────────────────────────────────────────────────────────
function Sparkline({ color }) {
  const pts = useRef(Array.from({length:12},()=>Math.random()*40+10));
  const [data] = useState(pts.current);
  const max = Math.max(...data), min = Math.min(...data);
  const norm = v => 44 - ((v-min)/(max-min||1))*40;
  const path = data.map((v,i)=>`${i===0?"M":"L"}${(i/(data.length-1))*120},${norm(v)}`).join(" ");
  return (
    <svg width={120} height={44} style={{ opacity:0.6 }}>
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={path+" L120,44 L0,44 Z"} fill={`url(#sg${color.replace("#","")})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, suffix="", isFloat=false }) {
  const animated = useAnimatedValue(parseFloat(value)||0);
  const display = isFloat ? animated.toFixed(2) : Math.round(animated);
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background: hov ? `linear-gradient(135deg,#0f1523,${color}12)` : "linear-gradient(135deg,#0b0f1c,#0e1220)", border:`1px solid ${hov?color+"30":"#161d2e"}`, borderRadius:20, padding:"22px 24px", position:"relative", overflow:"hidden", transition:"all .35s cubic-bezier(.4,0,.2,1)", transform:hov?"translateY(-4px)":"translateY(0)", boxShadow:hov?`0 20px 50px ${color}18,0 0 0 1px ${color}18`:"0 2px 12px #00000033", cursor:"default" }}>
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at top right, ${color}0f 0%, transparent 60%)`, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:0, right:0 }}><Sparkline color={color}/></div>
      <div style={{ position:"relative" }}>
        <div style={{ width:46, height:46, borderRadius:14, background:`${color}18`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16, boxShadow:hov?`0 0 20px ${color}40`:"none", transition:"box-shadow .35s" }}>{icon}</div>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:42, lineHeight:1, color:hov?color:"#e2e8f0", transition:"color .35s", letterSpacing:1, textShadow:hov?`0 0 30px ${color}66`:"none" }}>{display}{suffix}</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#3d4f6b", textTransform:"uppercase", letterSpacing:2, marginTop:6 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Department Pill Bar ───────────────────────────────────────────────────────
function DeptBar({ dept, count, total, color }) {
  const pct = total ? (count/total)*100 : 0;
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", cursor:"default" }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:color, boxShadow:`0 0 8px ${color}`, flexShrink:0, animation:"livePulse 3s infinite" }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:hov?"#e2e8f0":"#64748b", transition:"color .2s", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{dept}</span>
          <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, color, letterSpacing:1, flexShrink:0, marginLeft:8 }}>{count}</span>
        </div>
        <div style={{ height:3, background:"#161d2e", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${color}88,${color})`, borderRadius:99, boxShadow:`0 0 8px ${color}66`, transition:"width 1.2s cubic-bezier(.4,0,.2,1)" }}/>
        </div>
      </div>
    </div>
  );
}

// ── GPA Ring ─────────────────────────────────────────────────────────────────
function GpaRing({ gpa }) {
  const pct = (parseFloat(gpa)||0)/10;
  const r=54, circ=2*Math.PI*r;
  const color = pct>=.9?"#34d399":pct>=.75?"#fbbf24":"#f87171";
  return (
    <div style={{ position:"relative", width:130, height:130, flexShrink:0 }}>
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle cx={65} cy={65} r={r} fill="none" stroke="#161d2e" strokeWidth={8}/>
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${pct*circ} ${circ*(1-pct)}`}
          strokeDashoffset={circ/4} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 10px ${color})`, transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }}/>
        <circle cx={65} cy={65} r={r-14} fill="none" stroke={color+"18"} strokeWidth={1}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:34, color, lineHeight:1, textShadow:`0 0 20px ${color}88` }}>{gpa||"—"}</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#3d4f6b", letterSpacing:2, marginTop:2 }}>AVG GPA</div>
      </div>
    </div>
  );
}

// ── Top Student Card ──────────────────────────────────────────────────────────
function TopCard({ student, rank }) {
  const [hov, setHov] = useState(false);
  const color = DEPT_COLORS[student.dept]||"#818cf8";
  const gpaColor = +student.gpa>=9?"#34d399":+student.gpa>=7.5?"#fbbf24":"#f87171";
  const medal = ["🥇","🥈","🥉"][rank]||"";
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", background:hov?`linear-gradient(135deg,#0f1523,${color}0d)`:"#080c18", border:`1px solid ${hov?color+"33":"#161d2e"}`, borderRadius:14, transition:"all .25s", cursor:"default" }}>
      <span style={{ fontSize:18, width:24, textAlign:"center", flexShrink:0 }}>{medal||<span style={{color:"#3d4f6b",fontFamily:"'DM Mono',monospace",fontSize:12}}>#{rank+1}</span>}</span>
      <Avatar name={student.name} dept={student.dept}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{student.name}</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3d4f6b", marginTop:2 }}>{student.dept}</div>
      </div>
      <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:24, color:gpaColor, textShadow:`0 0 16px ${gpaColor}66`, letterSpacing:1 }}>{student.gpa}</div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [filters, setFilters] = useState({ search:"", dept:"", status:"", sort:"createdAt", order:"desc" });
  const [toast, setToast] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const showToast = useCallback((msg,type="success")=>setToast({msg,type}),[]);
  const { students, pagination, loading, error, refetch } = useStudents(filters);
  const { stats, loading:statsLoading, refetch:refetchStats } = useStats();
  const refreshAll = useCallback(()=>{ refetch(); refetchStats(); },[refetch,refetchStats]);
  const { add, update, remove, saving, apiErrors, clearErrors } = useStudentMutations((msg,type)=>{ showToast(msg,type); refreshAll(); });

  const setFilter = (k,v) => setFilters(f=>({...f,[k]:v}));
  const handleSort = key => {
    const d = sortKey===key&&sortDir==="asc"?"desc":"asc";
    setSortKey(key); setSortDir(d);
    setFilters(f=>({...f,sort:key,order:d}));
  };
  const handleAdd = async d => { const ok=await add(d); if(ok) setShowAdd(false); };
  const handleEdit = async d => { const ok=await update(editStudent._id,d); if(ok) setEditStudent(null); };
  const handleDelete = async () => { const ok=await remove(deleteTarget._id); if(ok) setDeleteTarget(null); };

  const topStudents = [...students].sort((a,b)=>+b.gpa-+a.gpa).slice(0,5);
  const deptData = Array.isArray(stats?.byDept) ? stats.byDept : [];

  const SortIcon = ({k}) => <span style={{marginLeft:4,fontSize:9,opacity:sortKey===k?1:0.15,color:"#818cf8"}}>{sortKey===k?(sortDir==="asc"?"▲":"▼"):"▲"}</span>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#060912;overflow-x:hidden;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#1e2a3d;border-radius:99px;}
        @keyframes drift1{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(60px,40px) scale(1.1);}}
        @keyframes drift2{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-50px,-30px) scale(1.08);}}
        @keyframes drift3{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(30px,-50px) scale(1.12);}}
        @keyframes livePulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.7);}}
        @keyframes popIn{from{opacity:0;transform:scale(.94) translateY(12px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes rowIn{from{opacity:0;transform:translateX(-8px);}to{opacity:1;transform:translateX(0);}}
        @keyframes shimmer{0%{background-position:-400% 0;}100%{background-position:400% 0;}}
        @keyframes headerGlow{0%,100%{box-shadow:0 1px 0 #161d2e;}50%{box-shadow:0 1px 0 #6366f133,0 4px 30px #6366f10a;}}
        .tr-row{transition:background .18s;}
        .tr-row:hover td{background:#0c1121!important;}
        input:focus,select:focus{border-color:#6366f155!important;box-shadow:0 0 0 3px #6366f114!important;outline:none!important;}
        .btn-add{transition:all .25s!important;}
        .btn-add:hover{transform:translateY(-1px)!important;box-shadow:0 8px 32px #6366f166!important;}
        .btn-add:active{transform:translateY(0)!important;}
        .act-btn{transition:all .18s!important;}
        .act-btn:hover{transform:scale(1.2)!important;filter:brightness(1.3)!important;}
      `}</style>

      <Aurora/>

      <div style={{ minHeight:"100vh", position:"relative", zIndex:1, color:"#e2e8f0", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

        {/* ─── HEADER ─────────────────────────────────────────────────────── */}
        <header style={{ position:"sticky", top:0, zIndex:100, background:"rgba(6,9,18,0.88)", borderBottom:"1px solid #161d2e", backdropFilter:"blur(28px) saturate(180%)", padding:"0 36px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", animation:"headerGlow 8s ease infinite" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 4px 20px #6366f155" }}>🎓</div>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, letterSpacing:4, color:"#f1f5f9", lineHeight:1 }}>ACADEX</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#3d4f6b", letterSpacing:3, textTransform:"uppercase" }}>Student Management System</div>
            </div>
          </div>

          <LiveClock/>

          <button className="btn-add" onClick={()=>{ clearErrors(); setShowAdd(true); }}
            style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", color:"#fff", padding:"10px 22px", borderRadius:10, cursor:"pointer", fontFamily:"'Bebas Neue',cursive", fontSize:15, letterSpacing:2, display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 24px #6366f155" }}>
            <span style={{ fontSize:18, lineHeight:1 }}>＋</span> ADD STUDENT
          </button>
        </header>

        <div style={{ padding:"28px 36px", maxWidth:1600, margin:"0 auto" }}>

          {/* ─── STAT CARDS ──────────────────────────────────────────────── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:28 }}>
            <StatCard label="Total Students" value={statsLoading?0:stats?.total??0} icon="👥" color="#818cf8"/>
            <StatCard label="Active Students" value={statsLoading?0:stats?.active??0} icon="⚡" color="#34d399"/>
            <StatCard label="Departments" value={statsLoading?0:stats?.departments??0} icon="🏛" color="#fbbf24"/>
            <StatCard label="Average GPA" value={statsLoading?0:stats?.avgGpa??0} icon="✦" color="#f472b6" isFloat/>
          </div>

          {/* ─── MAIN LAYOUT: left big table + right panel ───────────────── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20, alignItems:"start" }}>


            {/* ── LEFT: Table Section ───────────────────────────────────── */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Filter bar */}
              <div style={{ background:"linear-gradient(135deg,#0b0f1c,#0e1220)", border:"1px solid #161d2e", borderRadius:16, padding:"14px 18px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ position:"relative", flex:1, minWidth:200 }}>
                  <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#3d4f6b", fontSize:16, pointerEvents:"none" }}>⌕</span>
                  <input value={filters.search} placeholder="Search name, roll, email…"
                    onChange={e=>setFilter("search",e.target.value)}
                    style={{ width:"100%", background:"#060912", border:"1px solid #161d2e", color:"#e2e8f0", borderRadius:9, padding:"9px 14px 9px 40px", fontFamily:"'DM Mono',monospace", fontSize:12 }}/>
                </div>
                {[{key:"dept",label:"All Departments",opts:DEPTS},{key:"status",label:"All Status",opts:["Active","Inactive"]}].map(({key,label,opts})=>(
                  <select key={key} value={filters[key]} onChange={e=>setFilter(key,e.target.value)}
                    style={{ background:"#060912", border:"1px solid #161d2e", color:filters[key]?"#e2e8f0":"#3d4f6b", borderRadius:9, padding:"9px 14px", fontFamily:"'DM Mono',monospace", fontSize:11 }}>
                    <option value="">{label}</option>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                ))}
                <button onClick={refreshAll}
                  style={{ background:"#0b0f1c", border:"1px solid #161d2e", color:"#3d4f6b", width:36, height:36, borderRadius:9, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", transition:"transform .5s" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="rotate(180deg)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="rotate(0)"}>↻</button>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#3d4f6b", marginLeft:"auto" }}>
                  <span style={{ color:"#818cf8" }}>{loading?"…":students.length}</span>/{pagination?.total??0}
                </span>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background:"#110a0a", border:"1px solid #ef444430", borderRadius:12, padding:"13px 18px", color:"#ef4444", fontFamily:"'DM Mono',monospace", fontSize:12, display:"flex", alignItems:"center", gap:10 }}>
                  ⚠ {error}
                  <button onClick={refetch} style={{ marginLeft:"auto", background:"transparent", border:"1px solid #ef444430", color:"#ef4444", padding:"3px 12px", borderRadius:6, cursor:"pointer", fontSize:11, fontFamily:"'DM Mono',monospace" }}>Retry</button>
                </div>
              )}

              {/* Table */}
              <div style={{ background:"linear-gradient(160deg,#0b0f1c,#0e1220)", border:"1px solid #161d2e", borderRadius:18, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"#07091580", borderBottom:"1px solid #161d2e" }}>
                      {[{l:"Student",k:"name"},{l:"Roll",k:"roll"},{l:"Department",k:"dept"},{l:"Year",k:"year"},{l:"GPA",k:"gpa"},{l:"Status",k:"status"},{l:"",k:null}].map(c=>(
                        <th key={c.l} onClick={()=>c.k&&handleSort(c.k)}
                          style={{ padding:"12px 16px", textAlign:"left", fontFamily:"'DM Mono',monospace", fontSize:9, color:sortKey===c.k?"#818cf8":"#2d3d52", textTransform:"uppercase", letterSpacing:2, cursor:c.k?"pointer":"default", userSelect:"none", transition:"color .2s", fontWeight:500, whiteSpace:"nowrap" }}>
                          {c.l}{c.k&&<SortIcon k={c.k}/>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} style={{ padding:56, textAlign:"center" }}>
                        <div style={{ width:32, height:32, border:"2px solid #161d2e", borderTopColor:"#818cf8", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto" }}/>
                      </td></tr>
                    ) : students.length===0 ? (
                      <tr><td colSpan={7} style={{ padding:64, textAlign:"center" }}>
                        <div style={{ fontSize:40, marginBottom:14 }}>🎓</div>
                        <div style={{ color:"#2d3d52", fontFamily:"'DM Mono',monospace", fontSize:12 }}>{error?"Failed to load.":"No students yet. Add one to get started."}</div>
                      </td></tr>
                    ) : students.map((s,i)=>(
                      <tr key={s._id} className="tr-row"
                        style={{ borderBottom:"1px solid #0e1422", animation:`rowIn .4s ease ${Math.min(i*.03,.4)}s both` }}>
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                            <Avatar name={s.name} dept={s.dept}/>
                            <div>
                              <div style={{ fontSize:14, fontWeight:600, color:"#dde4f0" }}>{s.name}</div>
                              <div style={{ fontSize:11, color:"#2d3d52", fontFamily:"'DM Mono',monospace", marginTop:1 }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"13px 16px" }}>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, background:"#818cf80d", border:"1px solid #818cf820", color:"#818cf8", padding:"3px 10px", borderRadius:6 }}>{s.roll}</span>
                        </td>
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                            <DeptDot dept={s.dept}/>
                            <span style={{ fontSize:12, color:"#64748b", fontFamily:"'DM Mono',monospace" }}>{s.dept}</span>
                          </div>
                        </td>
                        <td style={{ padding:"13px 16px" }}>
                          <span style={{ fontSize:11, color:"#3d4f6b", fontFamily:"'DM Mono',monospace", background:"#ffffff06", border:"1px solid #ffffff08", padding:"3px 10px", borderRadius:6 }}>{s.year}</span>
                        </td>
                        <td style={{ padding:"13px 16px" }}>
                          {(() => {
                            const g=+s.gpa, c=g>=9?"#34d399":g>=7.5?"#fbbf24":"#f87171";
                            const arc=2*Math.PI*14*(g/10);
                            const circ=2*Math.PI*14;
                            return (
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <svg width={36} height={36} viewBox="0 0 36 36">
                                  <circle cx={18} cy={18} r={14} fill="none" stroke="#161d2e" strokeWidth={4}/>
                                  <circle cx={18} cy={18} r={14} fill="none" stroke={c} strokeWidth={4}
                                    strokeDasharray={`${arc} ${circ-arc}`} strokeDashoffset={circ/4}
                                    strokeLinecap="round" style={{filter:`drop-shadow(0 0 5px ${c})`}}/>
                                  <text x={18} y={22} textAnchor="middle" fontFamily="'Bebas Neue',cursive" fontSize={11} fill={c}>{s.gpa}</text>
                                </svg>
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ padding:"13px 16px" }}><StatusBadge status={s.status}/></td>
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex", gap:5 }}>
                            {[
                              {icon:"👁",title:"View",fn:()=>setViewStudent(s),c:"#64748b",bg:"#ffffff08"},
                              {icon:"✏️",title:"Edit",fn:()=>{clearErrors();setEditStudent(s);},c:"#818cf8",bg:"#818cf80d"},
                              {icon:"🗑",title:"Delete",fn:()=>setDeleteTarget(s),c:"#f87171",bg:"#f871710d"},
                            ].map(b=>(
                              <button key={b.title} title={b.title} onClick={b.fn} className="act-btn"
                                style={{ background:b.bg, border:`1px solid ${b.c}18`, color:b.c, width:30, height:30, borderRadius:7, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>{b.icon}</button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
            <div style={{ display:"flex", flexDirection:"column", gap:18, position:"sticky", top:80 }}>

              {/* GPA Ring + status */}
              <div style={{ background:"linear-gradient(135deg,#0b0f1c,#0e1220)", border:"1px solid #161d2e", borderRadius:20, padding:"24px 20px" }}>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, letterSpacing:3, color:"#2d3d52", marginBottom:20 }}>PERFORMANCE</div>
                <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:20 }}>
                  <GpaRing gpa={stats?.avgGpa??0}/>
                  <div style={{ flex:1 }}>
                    {[
                      {label:"Active",value:stats?.active??0,color:"#34d399"},
                      {label:"Inactive",value:stats?.inactive??0,color:"#f87171"},
                    ].map(item=>(
                      <div key={item.label} style={{ marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3d4f6b" }}>{item.label}</span>
                          <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:16, color:item.color, letterSpacing:1 }}>{item.value}</span>
                        </div>
                        <div style={{ height:3, background:"#161d2e", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:99, background:item.color, width:`${(item.value/Math.max(stats?.total??1,1))*100}%`, boxShadow:`0 0 8px ${item.color}66`, transition:"width 1s ease" }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GPA buckets */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    {label:"9–10 ★",value:students.filter(s=>+s.gpa>=9).length,color:"#34d399"},
                    {label:"8–9",value:students.filter(s=>+s.gpa>=8&&+s.gpa<9).length,color:"#818cf8"},
                    {label:"7–8",value:students.filter(s=>+s.gpa>=7&&+s.gpa<8).length,color:"#fbbf24"},
                    {label:"< 7",value:students.filter(s=>+s.gpa<7).length,color:"#f87171"},
                  ].map(b=>(
                    <div key={b.label} style={{ background:"#060912", border:"1px solid #161d2e", borderRadius:10, padding:"10px 12px", display:"flex", flexDirection:"column", gap:2 }}>
                      <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, color:b.color, lineHeight:1 }}>{b.value}</span>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#2d3d52", letterSpacing:1 }}>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departments */}
              <div style={{ background:"linear-gradient(135deg,#0b0f1c,#0e1220)", border:"1px solid #161d2e", borderRadius:20, padding:"22px 20px" }}>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, letterSpacing:3, color:"#2d3d52", marginBottom:16 }}>DEPARTMENTS</div>
                {deptData.length===0
                  ? <div style={{ color:"#1e2a3d", fontFamily:"'DM Mono',monospace", fontSize:11, padding:"12px 0" }}>No data yet</div>
                  : deptData.map(d=>(
                    <DeptBar key={d._id} dept={d._id} count={d.count} total={stats?.total??0} color={DEPT_COLORS[d._id]||"#818cf8"}/>
                  ))
                }
              </div>

              {/* Top performers */}
              <div style={{ background:"linear-gradient(135deg,#0b0f1c,#0e1220)", border:"1px solid #161d2e", borderRadius:20, padding:"22px 20px" }}>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, letterSpacing:3, color:"#2d3d52", marginBottom:16 }}>TOP PERFORMERS</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {topStudents.length===0
                    ? <div style={{ color:"#1e2a3d", fontFamily:"'DM Mono',monospace", fontSize:11, padding:"8px 0" }}>Add students to see rankings</div>
                    : topStudents.map((s,i)=><TopCard key={s._id} student={s} rank={i}/>)
                  }
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop:28, textAlign:"center", fontFamily:"'DM Mono',monospace", fontSize:9, color:"#161d2e", letterSpacing:3 }}>
            ACADEX · REACT + EXPRESS + MONGODB · {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      {showAdd&&<Modal title="ADD NEW STUDENT" onClose={()=>setShowAdd(false)}><StudentForm onSubmit={handleAdd} onCancel={()=>setShowAdd(false)} saving={saving} apiErrors={apiErrors}/></Modal>}
      {editStudent&&<Modal title="EDIT STUDENT RECORD" onClose={()=>setEditStudent(null)}><StudentForm initial={editStudent} onSubmit={handleEdit} onCancel={()=>setEditStudent(null)} saving={saving} apiErrors={apiErrors}/></Modal>}

      {viewStudent&&(
        <Modal title="STUDENT PROFILE" onClose={()=>setViewStudent(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", background:"#060912", borderRadius:14, border:"1px solid #161d2e" }}>
              <Avatar name={viewStudent.name} dept={viewStudent.dept}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:20, fontWeight:700, color:"#f1f5f9" }}>{viewStudent.name}</div>
                <div style={{ fontSize:12, color:"#818cf8", fontFamily:"'DM Mono',monospace", marginTop:3 }}>{viewStudent.roll}</div>
              </div>
              <StatusBadge status={viewStudent.status}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[["🏛 Dept",viewStudent.dept],["📅 Year",viewStudent.year],["✉ Email",viewStudent.email],["📞 Phone",viewStudent.phone],["◈ GPA",`${viewStudent.gpa} / 10`],["🗓 Enrolled",new Date(viewStudent.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})]].map(([k,v])=>(
                <div key={k} style={{ background:"#060912", border:"1px solid #161d2e", borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:10,color:"#2d3d52",fontFamily:"'DM Mono',monospace",marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:13,color:"#cbd5e1",fontFamily:"'DM Mono',monospace" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button onClick={()=>{setViewStudent(null);setDeleteTarget(viewStudent);}} style={{ background:"#f871710d",border:"1px solid #f8717130",color:"#f87171",padding:"9px 20px",borderRadius:9,cursor:"pointer",fontFamily:"'Bebas Neue',cursive",fontSize:14,letterSpacing:2 }}>DELETE</button>
              <button onClick={()=>{setViewStudent(null);clearErrors();setEditStudent(viewStudent);}} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",color:"#fff",padding:"9px 22px",borderRadius:9,cursor:"pointer",fontFamily:"'Bebas Neue',cursive",fontSize:14,letterSpacing:2 }}>EDIT RECORD</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget&&(
        <Modal title="CONFIRM DELETION" onClose={()=>setDeleteTarget(null)} maxWidth={420}>
          <div style={{ textAlign:"center", padding:"10px 0 6px" }}>
            <div style={{ width:58,height:58,borderRadius:"50%",background:"#f871710d",border:"1px solid #f8717130",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 16px" }}>⚠</div>
            <div style={{ fontSize:18,fontWeight:600,color:"#f1f5f9",marginBottom:8 }}>Remove {deleteTarget.name}?</div>
            <div style={{ fontSize:12,color:"#3d4f6b",fontFamily:"'DM Mono',monospace",lineHeight:1.8,marginBottom:24 }}>Permanently deletes this record from MongoDB.<br/>This action cannot be undone.</div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={()=>setDeleteTarget(null)} style={{ background:"transparent",border:"1px solid #1e2a3d",color:"#3d4f6b",padding:"10px 24px",borderRadius:9,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:12 }}>Cancel</button>
              <button onClick={handleDelete} style={{ background:"linear-gradient(135deg,#ef4444,#dc2626)",border:"none",color:"#fff",padding:"10px 24px",borderRadius:9,cursor:"pointer",fontFamily:"'Bebas Neue',cursive",fontSize:15,letterSpacing:2,boxShadow:"0 4px 20px #ef444433" }}>DELETE PERMANENTLY</button>
            </div>
          </div>
        </Modal>
      )}

      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </>
  );
}