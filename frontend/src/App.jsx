/**
 * HENS Dashboard — React Frontend
 * Heat Exchanger Network Synthesis Optimizer
 */

import React, { useState } from "react";

// ─── Default stream data (Retrofitting Case Study) ──────────────────────
const RETROFIT_HOT = [
  { id: "H1", Tin: 350, Tout: 100 },
  { id: "H2", Tin: 450, Tout: 50 },
];
const RETROFIT_COLD = [
  { id: "C1", Tin: 20,  Tout: 220 },
  { id: "C2", Tin: 100, Tout: 300 },
];

const GRASSROOT_HOT = [
  { id: "H1", Tin: 350, Tout: 100, Mcp: 10 },
  { id: "H2", Tin: 450, Tout: 150, Mcp: 12 },
];

const GRASSROOT_COLD = [
  { id: "C1", Tin: 20,  Tout: 220, Mcp: 8 },
  { id: "C2", Tin: 100, Tout: 300, Mcp: 9 },
];

// ─── Existing Matches Data ────────────────────
const DEFAULT_EXISTING_MATCHES = [
  { hot_id: "H1", cold_id: "C1", stage: 2, q_old: 500, area_old: 0 }, 
  { hot_id: "H2", cold_id: "C2", stage: 3, q_old: 600, area_old: 0 },
];

// ─── Existing Utilities ─────────────
const DEFAULT_EXISTING_UTILITIES = [
  { stream_id: "C1", utility_type: "Heater", q_old: 500 },
  { stream_id: "H2", utility_type: "Cooler", q_old: 1000 }
];

const Label = ({ children }) => (
  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1 mt-2">
    {children}
  </label>
);

const Input = ({ value, onChange, type = "number", step = "0.1", min, max, placeholder, readOnly = false }) => (
  <input
    type={type}
    step={step}
    min={min}
    max={max}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    readOnly={readOnly}
    className={`w-full border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-all
                ${readOnly 
                  ? 'bg-slate-800/50 border-slate-700/50 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-800 border-slate-700 focus:ring-2 focus:ring-orange-500/60 focus:border-orange-500'}`}
  />
);

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    orange: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    blue:   "bg-blue-500/20 text-blue-300 border-blue-500/30",
    green:  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    slate:  "bg-slate-700/60 text-slate-300 border-slate-600",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${colors[color]}`}>
      {children}
    </span>
  );
};

function CostEquationsNote() {
  return (
    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 mt-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-blue-400 text-lg">ℹ️</span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-300">
          Cost Calculation Equations Guide
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
          <span className="block text-white font-bold mb-1">
            1. Fixed Capital Cost (تكلفة المعدات الثابتة)
          </span>
          <div className="font-mono text-emerald-400 bg-slate-950/50 px-2 py-1.5 rounded mb-2 border border-slate-800">
            Cost = A + B × (Area) ^ C
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            تُستخدم لحساب التكلفة الرأسمالية للمبادلات الحرارية (Heat Exchangers).
            <br />
            المعاملات <span className="text-slate-300 font-mono">a, b, c</span> تمثل ثوابت التكلفة.
          </p>
        </div>
        
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
          <span className="block text-white font-bold mb-1">
            2. Operating Cost (تكاليف التشغيل السنوية)
          </span>
          <div className="font-mono text-orange-400 bg-slate-950/50 px-2 py-1.5 rounded mb-2 border border-slate-800">
            Cost = (C_HU × Q_HU) + (C_CU × Q_CU)
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            تُستخدم لحساب التكلفة المستمرة للمرافق (Utilities).
            <br />
            المعاملات <span className="text-slate-300 font-mono">C_HU, C_CU</span> تمثل سعر الوحدة (Unit Cost) للمرافق الحارة والباردة.
          </p>
        </div>
      </div>
    </div>
  );
}

function StreamPanel({ streams, onChange, type, activeTab, matches = [], utils = [] }) {
  const isHot = type === "hot";
  const accent = isHot
    ? "from-orange-600/20 to-rose-600/10 border-orange-500/30"
    : "from-blue-600/20 to-cyan-600/10 border-blue-500/30";
  const dot = isHot ? "bg-orange-400" : "bg-blue-400";
  const label = isHot ? "Hot Stream" : "Cold Stream";
  const prefix = isHot ? "H" : "C";

  const update = (idx, field, raw) => {
    const val = field === "id" ? raw : parseFloat(raw);
    const next = streams.map((s, i) => (i === idx ? { ...s, [field]: val } : s));
    onChange(next);
  };

  const addStream = () => {
    const newId = `${prefix}${streams.length + 1}`;
    const newStream = activeTab === "grassroot" 
      ? { id: newId, Tin: 200, Tout: 100, Mcp: 10 }
      : { id: newId, Tin: 200, Tout: 100 };
    onChange([...streams, newStream]);
  };

  const removeStream = (idx) => {
    if (streams.length <= 2) {
      alert("Minimum 2 streams required.");
      return;
    }
    onChange(streams.filter((_, i) => i !== idx));
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${accent} transition-all duration-500`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${dot}`} />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">{label}s</h3>
        </div>
        <button onClick={addStream} className="text-xs bg-slate-800/80 hover:bg-slate-700 text-white px-2 py-1 rounded border border-slate-600">
          + Add {label}
        </button>
      </div>
      <div className="space-y-4">
        {streams.map((s, idx) => {
          const deltaT = Math.abs(s.Tin - s.Tout);
          let calculatedQ ;
          let mcpValue ;

          if (activeTab === "retrofit") {
            const matchesQ = matches.reduce((sum, m) => {
              if (isHot && m.hot_id === s.id) return sum + (parseFloat(m.q_old) || 0);
              if (!isHot && m.cold_id === s.id) return sum + (parseFloat(m.q_old) || 0);
              return sum;
            }, 0);

            const utilsQ = utils.reduce((sum, u) => {
              if (u.stream_id === s.id) return sum + (parseFloat(u.q_old) || 0);
              return sum;
            }, 0);

            calculatedQ = matchesQ + utilsQ;
            mcpValue = deltaT !== 0 ? (Math.abs(calculatedQ) / deltaT).toFixed(3) : "0.000";
          } else {
            const userMcp = s.Mcp !== undefined ? parseFloat(s.Mcp) : 0;
            mcpValue = isNaN(userMcp) ? "0.000" : userMcp.toFixed(3);
            calculatedQ = isNaN(userMcp) ? 0 : userMcp * deltaT;
          }
          
          return (
            <div key={idx} className="bg-slate-900/50 rounded-xl p-4 space-y-3 relative">
              {streams.length > 2 && (
                <button onClick={() => removeStream(idx)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-500 text-lg leading-none">&times;</button>
              )}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-mono">Stream #{idx + 1}</span>
                <input
                  value={s.id}
                  onChange={e => update(idx, "id", e.target.value)}
                  className="bg-transparent text-right text-sm font-bold text-white w-16
                             border-b border-slate-600 focus:outline-none focus:border-orange-400"
                />
              </div>
              
              <div className={`grid ${activeTab === 'retrofit' ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                <div>
                  <Label>T_in (°C)</Label>
                  <Input value={s.Tin} onChange={e => update(idx, "Tin", e.target.value)} />
                </div>
                <div>
                  <Label>T_out (°C)</Label>
                  <Input value={s.Tout} onChange={e => update(idx, "Tout", e.target.value)} />
                </div>
                
                {activeTab === 'grassroot' && (
                  <div>
                    <Label>MCP (kW/°C)</Label>
                    <Input value={s.Mcp !== undefined ? s.Mcp : ''} onChange={e => update(idx, "Mcp", e.target.value)} />
                  </div>
                )}
              </div>
              
              {activeTab === 'retrofit' ? (
                <div className="bg-slate-800/50 px-3 py-2 rounded text-[11px] text-slate-300 font-mono border border-slate-700 flex justify-between">
                  <span>Calculated Total Q: <span className="text-white font-bold">{calculatedQ.toFixed(2)}</span> kW</span>
                  <span>Calculated Mcp: <span className="text-orange-400 font-bold">{mcpValue}</span> kW/°C</span>
                </div>
              ) : (
                <div className="bg-slate-800/50 px-2 py-1 rounded text-[10px] text-slate-400 font-mono border border-slate-700">
                  Calculated Total Q: <span className="text-orange-400 font-bold">{calculatedQ.toFixed(2)}</span> kW
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExistingMatchesPanel({ matches, onChange, hotStreams, coldStreams, utils, U_global }) {
  const calculateAreaForMatch = (m, allMatches, currentUtils) => {
    const hot = hotStreams.find(s => s.id === m.hot_id);
    const cold = coldStreams.find(s => s.id === m.cold_id);
    if (!hot || !cold || !U_global || !m.q_old) return 0;

    const getMcp = (stream, isHot) => {
      const deltaT = Math.abs(stream.Tin - stream.Tout);
      if (deltaT === 0) return 0;
      let streamQ = 0;
      allMatches.forEach(match => {
        if (isHot && match.hot_id === stream.id) streamQ += (parseFloat(match.q_old) || 0);
        if (!isHot && match.cold_id === stream.id) streamQ += (parseFloat(match.q_old) || 0);
      });
      currentUtils.forEach(u => {
        if (u.stream_id === stream.id) streamQ += (parseFloat(u.q_old) || 0);
      });
      return streamQ / deltaT;
    };

    const hotMcp = getMcp(hot, true);
    const coldMcp = getMcp(cold, false);

    if (hotMcp > 0 && coldMcp > 0) {
      const Q = parseFloat(m.q_old);
      const mStage = parseInt(m.stage);

      const hotQ_earlier = allMatches
        .filter(x => x.hot_id === m.hot_id && parseInt(x.stage) < mStage)
        .reduce((sum, x) => sum + (parseFloat(x.q_old) || 0), 0);

      const coldQ_earlier = allMatches
        .filter(x => x.cold_id === m.cold_id && parseInt(x.stage) > mStage)
        .reduce((sum, x) => sum + (parseFloat(x.q_old) || 0), 0);

      const TH_in = parseFloat(hot.Tin) - (hotQ_earlier / hotMcp);
      const TC_in = parseFloat(cold.Tin) + (coldQ_earlier / coldMcp);

      const TH_out = TH_in - (Q / hotMcp);
      const TC_out = TC_in + (Q / coldMcp);

      const dt1 = TH_in - TC_out;
      const dt2 = TH_out - TC_in;

      if (dt1 > 0 && dt2 > 0) {
        const LMTD_approx = Math.pow((dt1 * dt2 * 0.5 * (dt1 + dt2)), 0.3333333);
        return (Q / (parseFloat(U_global) * LMTD_approx)).toFixed(2);
      } else {
        return "Invalid ΔT";
      }
    }
    return 0;
  };

  React.useEffect(() => {
    let changed = false;
    const updatedMatches = matches.map(m => {
      const calc = calculateAreaForMatch(m, matches, utils);
      if (calc && calc !== 0 && calc !== "Invalid ΔT" && calc !== m.area_old) {
        changed = true;
        return { ...m, area_old: calc };
      }
      return m;
    });

    if (changed) {
      onChange(updatedMatches);
    }
  // eslint-disable-next-line
  }, [utils, hotStreams, coldStreams, U_global]);

  const update = (idx, field, raw) => {
    const val = field.includes("id") || field === "area_old" ? raw : parseFloat(raw);
    let next = matches.map((m, i) => (i === idx ? { ...m, [field]: val } : m));

    if (field === "q_old" || field === "hot_id" || field === "cold_id" || field === "stage") {
      next = next.map(m => {
        const calc = calculateAreaForMatch(m, next, utils);
        return { ...m, area_old: calc !== 0 ? calc : m.area_old };
      });
    }

    onChange(next);
  };

  const addMatch = () => {
    const defaultHot = hotStreams.length > 0 ? hotStreams[0].id : "H1";
    const defaultCold = coldStreams.length > 0 ? coldStreams[0].id : "C1";
    onChange([...matches, { hot_id: defaultHot, cold_id: defaultCold, stage: 1, q_old: 100, area_old: 0 }]);
  };

  const removeMatch = (idx) => {
    const next = matches.filter((_, i) => i !== idx);
    const updated = next.map(m => ({ ...m, area_old: calculateAreaForMatch(m, next, utils) }));
    onChange(updated);
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Existing Heat Exchangers
        </h3>
        <button onClick={addMatch} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded">
          + Add Match
        </button>
      </div>
      <div className="space-y-4">
        {matches.length === 0 && <div className="text-xs text-slate-500 text-center py-2">No existing exchangers.</div>}
        {matches.map((m, idx) => (
          <div key={idx} className="bg-slate-900/50 rounded-xl p-4 relative border border-slate-800">
            <button onClick={() => removeMatch(idx)} className="absolute top-2 right-3 text-rose-500 hover:text-rose-400 text-xl font-bold leading-none">&times;</button>
            
            <div className="grid grid-cols-4 gap-3 mb-4 pr-6">
              <div>
                <Label>Hot ID</Label>
                <select 
                  value={m.hot_id} 
                  onChange={e => update(idx, "hot_id", e.target.value)} 
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white uppercase mt-1 outline-none focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Hot</option>
                  {hotStreams.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
              </div>
              <div>
                <Label>Cold ID</Label>
                <select 
                  value={m.cold_id} 
                  onChange={e => update(idx, "cold_id", e.target.value)} 
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white uppercase mt-1 outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Cold</option>
                  {coldStreams.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
              </div>
              <div>
                <Label>Stage (1-4)</Label>
                <Input value={m.stage} type="number" min="1" max="4" step="1" onChange={e => update(idx, "stage", e.target.value)} />
              </div>
              <div>
                <Label>Old Q (kW)</Label>
                <Input value={m.q_old} onChange={e => update(idx, "q_old", e.target.value)} />
              </div>
            </div>

            <div className="bg-slate-800/50 px-3 py-2 rounded text-[11px] text-slate-300 font-mono border border-slate-700 flex justify-between items-center">
              <span>Match: <span className="text-orange-300">{m.hot_id}</span> ↔ <span className="text-blue-300">{m.cold_id}</span></span>
              <span>Calculated Old Area: <span className="text-emerald-400 font-bold text-[13px] ml-1">{m.area_old}</span> m²</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExistingUtilitiesPanel({ utils, onChange, hotStreams, coldStreams }) {
  const allStreamIds = [
    ...hotStreams.map(s => s.id),
    ...coldStreams.map(s => s.id)
  ];

  const update = (idx, field, raw) => {
    let next = [...utils];
    if (field === "q_old") {
      next[idx][field] = parseFloat(raw);
    } else {
      next[idx][field] = raw;
    }

    if (field === "stream_id") {
      const isHot = hotStreams.some(s => s.id === raw);
      next[idx].utility_type = isHot ? "Cooler" : "Heater";
    }

    onChange(next);
  };

  const addUtil = () => {
    const defaultStream = allStreamIds.length > 0 ? allStreamIds[0] : "C1";
    const isHot = hotStreams.some(s => s.id === defaultStream);
    onChange([...utils, { stream_id: defaultStream, utility_type: isHot ? "Cooler" : "Heater", q_old: 100 }]);
  };

  const removeUtil = (idx) => {
    onChange(utils.filter((_, i) => i !== idx));
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Existing Utilities (Heaters/Coolers)
        </h3>
        <button onClick={addUtil} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded">
          + Add Utility
        </button>
      </div>
      <div className="space-y-3">
        {utils.length === 0 && <div className="text-xs text-slate-500 text-center py-2">No existing utilities.</div>}
        {utils.map((u, idx) => (
          <div key={idx} className="bg-slate-900/50 rounded-xl p-4 relative border border-slate-800">
            <button onClick={() => removeUtil(idx)} className="absolute top-2 right-3 text-rose-500 hover:text-rose-400 text-xl font-bold leading-none">&times;</button>
            
            <div className="grid grid-cols-3 gap-4 pr-6">
              <div>
                <Label>Stream ID</Label>
                <select 
                  value={u.stream_id} 
                  onChange={e => update(idx, "stream_id", e.target.value)} 
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white uppercase mt-1 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="" disabled>Select Stream</option>
                  <optgroup label="Hot Streams">
                    {hotStreams.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                  </optgroup>
                  <optgroup label="Cold Streams">
                    {coldStreams.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                  </optgroup>
                </select>
              </div>
              <div>
                <Label>Type</Label>
                <select 
                  value={u.utility_type} 
                  disabled
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1.5 text-xs text-slate-400 mt-1 outline-none cursor-not-allowed"
                >
                  <option value="Heater">Heater (Hot Util)</option>
                  <option value="Cooler">Cooler (Cold Util)</option>
                </select>
              </div>
              <div>
                <Label>Old Q (kW)</Label>
                <Input value={u.q_old} onChange={e => update(idx, "q_old", e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsPanel({ result }) {
  if (!result) return null;

  const isRetrofit = result.payback_period !== undefined && result.payback_period > 0;

  const costCards = [
    { label: "Total Annual Cost",  value: result.total_cost,   unit: "$/yr", color: "orange", icon: "◈" },
    { label: "Utility Cost",       value: result.utility_cost, unit: "$/yr", color: "blue",   icon: "⚡" },
    { label: "Capital Cost",       value: result.capital_cost, unit: "$/yr", color: "green",  icon: "🏗" },
  ];

  const stageColors = ["bg-violet-500/20 text-violet-300", "bg-amber-500/20 text-amber-300", "bg-teal-500/20 text-teal-300", "bg-pink-500/20 text-pink-300"];

  const qNewTotal = result.heat_exchangers
    .filter(hx => hx.area_old === 0 || !hx.area_old)
    .reduce((sum, hx) => sum + hx.Q_ex, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-400 text-lg">✓</span>
          <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
            Optimization Complete
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{result.solver_message}</p>
      </div>

      {isRetrofit && (
        <div className="flex gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-xl flex-1 text-center border border-blue-500/30">
            <h4 className="text-slate-400 text-xs font-bold mb-1 uppercase">Payback Period</h4>
            <p className="text-2xl font-mono font-bold text-blue-400">{result.payback_period} Yrs</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl flex-1 text-center border border-emerald-500/30">
            <h4 className="text-slate-400 text-xs font-bold mb-1 uppercase">Total Investment</h4>
            <p className="text-2xl font-mono font-bold text-emerald-400">${result.total_investment?.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl flex-1 text-center border border-emerald-500/30">
            <h4 className="text-slate-400 text-xs font-bold mb-1 uppercase">Annual Savings</h4>
            <p className="text-2xl font-mono font-bold text-emerald-400">${result.annual_savings?.toLocaleString()}</p>
          </div>
        </div>
      )}

      {!isRetrofit && (
        <div className="grid grid-cols-3 gap-4">
          {costCards.map(c => (
            <div key={c.label} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className="text-2xl font-black text-white tracking-tight">
                {c.value?.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-slate-400 font-mono">{c.unit}</div>
              <div className="text-xs text-slate-500 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className={`grid ${isRetrofit ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-center gap-3">
          <div className="text-2xl">🔥</div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Hot Utility Required</div>
            <div className="text-lg font-bold text-orange-300">{(result.hot_utility || 0).toFixed(2)} <span className="text-sm font-normal text-slate-400">kW</span></div>
          </div>
        </div>
        
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-center gap-3">
          <div className="text-2xl">❄</div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Cold Utility Required</div>
            <div className="text-lg font-bold text-blue-300">{(result.cold_utility || 0).toFixed(2)} <span className="text-sm font-normal text-slate-400">kW</span></div>
          </div>
        </div>

        {isRetrofit && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
            <div className="text-2xl">➕</div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Added Duty (Q_new)</div>
              <div className="text-lg font-bold text-emerald-300">{qNewTotal.toFixed(2)} <span className="text-sm font-normal text-slate-400">kW</span></div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-orange-500 rounded-full inline-block" />
          Active Heat Exchanger Matches ({result.heat_exchangers.length})
        </h3>
        <div className="rounded-2xl border border-slate-700 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead>
              <tr className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 text-left">Match</th>
                <th className="px-4 py-3 text-center">Stage</th>
                <th className="px-4 py-3 text-right">Q (kW)</th>
                <th className="px-4 py-3 text-right">Total Area (m²)</th>
                {isRetrofit && <th className="px-4 py-3 text-right">A_old (m²)</th>}
                {isRetrofit && <th className="px-4 py-3 text-right">Modifications (m²)</th>}
                <th className="px-4 py-3 text-right">ΔT Hot (°C)</th>
                <th className="px-4 py-3 text-right">ΔT Cold (°C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {result.heat_exchangers.map((hx, idx) => {
                const isNewHX = isRetrofit && (!hx.area_old || hx.area_old === 0);
                return (
                  <tr key={idx} className="bg-slate-900/40 hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-mono">
                      <Badge color="orange">{hx.hot_id}</Badge>
                      <span className="text-slate-500 mx-1.5">↔</span>
                      <Badge color="blue">{hx.cold_id}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        isNewHX ? "bg-emerald-500/20 text-emerald-400" : (stageColors[hx.stage - 1] || "text-slate-300")
                      }`}>
                        {isNewHX ? "N" : `S${hx.stage}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-white font-semibold">{hx.Q_ex.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400 font-semibold">{hx.area.toFixed(2)}</td>
                    {isRetrofit && <td className="px-4 py-3 text-right font-mono text-slate-400 text-xs">{hx.area_old?.toFixed(2) || "0.00"}</td>}
                    {isRetrofit && (
                      <td className="px-4 py-3 text-right text-xs">
                        {hx.area_new > 0 ? (
                          <span className="text-emerald-400 font-bold">+{hx.area_new.toFixed(2)} (New)</span>
                        ) : hx.excess_area > 0 ? (
                          <span className="text-amber-400 font-bold">+{hx.excess_area.toFixed(2)} (Excess)</span>
                        ) : (
                          <span className="text-slate-500 font-mono">Existing</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right font-mono text-orange-300 text-xs">{hx.T_hot_in.toFixed(1)} → {hx.T_hot_out.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right font-mono text-blue-300 text-xs">{hx.T_cold_in.toFixed(1)} → {hx.T_cold_out.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {result.utility_matches && result.utility_matches.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-rose-500 rounded-full inline-block" />
            End-of-Pipe Utilities ({result.utility_matches.length})
          </h3>
          <div className="rounded-2xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 text-left">Stream</th>
                  <th className="px-4 py-3 text-center">Equipment</th>
                  <th className="px-4 py-3 text-right">Duty Q (kW)</th>
                  <th className="px-4 py-3 text-right">Temperature Change (°C)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {result.utility_matches.map((u, idx) => (
                  <tr key={idx} className="bg-slate-900/40 hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-mono">
                      <Badge color={u.utility_type === "Heater" ? "blue" : "orange"}>{u.stream_id}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        u.utility_type === "Heater" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {u.utility_type === "Heater" ? "🔥 Heater" : "❄️ Cooler"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-white font-semibold">{u.Q.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300 text-xs">{u.T_in.toFixed(1)} → {u.T_out.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function NetworkGridDiagram({ result, hotStreams, coldStreams, isRetrofit }) {
  if (!result || !result.heat_exchangers) return null;

  const hStreams = hotStreams.map(s => s.id);
  const cStreams = coldStreams.map(s => s.id);

  const streamSpacing = 70;
  const getHotY = (id) => 60 + hStreams.indexOf(id) * streamSpacing;
  const getColdY = (id) => 60 + hStreams.length * streamSpacing + 40 + cStreams.indexOf(id) * streamSpacing;

  const exchangers = [...result.heat_exchangers].sort((a, b) => a.stage - b.stage);
  const width = Math.max(800, exchangers.length * 140 + 300);
  const height = getColdY(cStreams[cStreams.length - 1]) + 80;

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <span className="w-1 h-4 bg-indigo-500 rounded-full inline-block" />
        Heat Exchanger Network Grid Diagram
      </h3>
      
      <div className="overflow-x-auto bg-slate-900/60 rounded-2xl p-6 border border-slate-700 shadow-inner">
        <svg width={width} height={height} className="text-sm font-mono mx-auto">
          {hotStreams.map(s => {
            const y = getHotY(s.id);
            return (
              <g key={s.id}>
                <line x1="60" y1={y} x2={width - 60} y2={y} stroke="#f97316" strokeWidth="3" opacity="0.4" />
                <polygon points={`${width-60},${y} ${width-70},${y-5} ${width-70},${y+5}`} fill="#f97316" opacity="0.6"/>
                <text x="20" y={y + 4} fill="#f97316" fontWeight="bold">{s.id}</text>
                <text x="60" y={y - 12} fill="#94a3b8" fontSize="11">T_in: {s.Tin}°C</text>
                <text x={width - 120} y={y - 12} fill="#94a3b8" fontSize="11">T_out: {s.Tout}°C</text>
              </g>
            );
          })}

          {coldStreams.map(s => {
            const y = getColdY(s.id);
            return (
              <g key={s.id}>
                <line x1="60" y1={y} x2={width - 60} y2={y} stroke="#3b82f6" strokeWidth="3" opacity="0.4" />
                <polygon points={`60,${y} 70,${y-5} 70,${y+5}`} fill="#3b82f6" opacity="0.6"/>
                <text x="20" y={y + 4} fill="#3b82f6" fontWeight="bold">{s.id}</text>
                <text x={width - 120} y={y - 12} fill="#94a3b8" fontSize="11">T_in: {s.Tin}°C</text>
                <text x="60" y={y - 12} fill="#94a3b8" fontSize="11">T_out: {s.Tout}°C</text>
              </g>
            );
          })}

          {exchangers.map((hx, i) => {
            const x = 160 + i * ((width - 320) / Math.max(1, exchangers.length - 1 || 1));
            const y1 = getHotY(hx.hot_id);
            const y2 = getColdY(hx.cold_id);
            
            const isNewHX = isRetrofit && (!hx.area_old || hx.area_old === 0);
            const labelColor = isNewHX ? "#10b981" : "#f97316"; 
            const labelText = isNewHX ? "N" : `S${hx.stage}`;

            return (
              <g key={i}>
                <line x1={x} y1={y1} x2={x} y2={y2} stroke="#94a3b8" strokeWidth="3" />
                <circle cx={x} cy={y1} r="14" fill="#slate-900" stroke={isNewHX ? "#10b981" : "#f97316"} strokeWidth="3" className="fill-slate-900" />
                <circle cx={x} cy={y2} r="14" fill="#slate-900" stroke={isNewHX ? "#10b981" : "#3b82f6"} strokeWidth="3" className="fill-slate-900" />
                
                <rect x={x - 24} y={(y1 + y2) / 2 - 14} width="48" height="28" rx="6" fill="#1e293b" stroke="#475569" />
                <text x={x} y={(y1 + y2) / 2 + 4} fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="bold">{Math.round(hx.Q_ex)}</text>
                
                <text x={x} y={y1 - 22} fill={labelColor} fontSize={isNewHX ? "14" : "11"} textAnchor="middle" fontWeight="bold">
                  {labelText}
                </text>
              </g>
            );
          })}

          {result.utility_matches && result.utility_matches.map((u, i) => {
            if (u.utility_type === "Heater") {
              const y = getColdY(u.stream_id);
              const x = 90; 
              return (
                <g key={`u-${i}`}>
                  <circle cx={x} cy={y} r="16" fill="#ef4444" opacity="0.2" />
                  <circle cx={x} cy={y} r="12" fill="#ef4444" />
                  <text x={x} y={y + 4} fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">H</text>
                  <text x={x} y={y - 22} fill="#ef4444" fontSize="11" textAnchor="middle">{Math.round(u.Q)} kW</text>
                </g>
              );
            } else {
              const y = getHotY(u.stream_id);
              const x = width - 90;
              return (
                <g key={`u-${i}`}>
                  <circle cx={x} cy={y} r="16" fill="#3b82f6" opacity="0.2" />
                  <circle cx={x} cy={y} r="12" fill="#3b82f6" />
                  <text x={x} y={y + 4} fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">C</text>
                  <text x={x} y={y - 22} fill="#3b82f6" fontSize="11" textAnchor="middle">{Math.round(u.Q)} kW</text>
                </g>
              );
            }
          })}
        </svg>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("grassroot"); 
  const [currentView, setCurrentView] = useState("inputs");

  const [grHotStreams,  setGrHotStreams]  = useState(GRASSROOT_HOT);
  const [grColdStreams, setGrColdStreams] = useState(GRASSROOT_COLD);
  const [rtHotStreams,  setRtHotStreams]  = useState(RETROFIT_HOT);
  const [rtColdStreams, setRtColdStreams] = useState(RETROFIT_COLD);

  const [existingMatches, setExistingMatches] = useState(DEFAULT_EXISTING_MATCHES);
  const [existingUtilities, setExistingUtilities] = useState(DEFAULT_EXISTING_UTILITIES);

  const [params, setParams] = useState({
    U: 0.1,                  
    annualized_cost: 1.0,    
    hot_utility_cost: 170,   
    cold_utility_cost: 30, 
    HRAT: 10,
    max_matches: 5,
    area_cost_coef: 800,   
    area_cost_exp: 0.8,      
    fixed_hx_cost: 35000,  
  });

  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const updateParam = (key, val) => setParams(p => ({ ...p, [key]: parseFloat(val) }));

  const handleModeSwitch = (tab) => {
    setActiveTab(tab);
    setResult(null);
    setError(null);
  };

  const prepareStreamsForBackend = (streams, isGrassroot, isHot) => {
    return streams.map(s => {
      const deltaT = Math.abs(s.Tin - s.Tout);
      let calculatedMcp ;

      if (isGrassroot) {
        calculatedMcp = s.Mcp !== undefined ? parseFloat(s.Mcp) : 0;
        if (isNaN(calculatedMcp)) calculatedMcp = 0;
      } else {
        let streamQ = 0;
        existingMatches.forEach(m => {
          if (isHot && m.hot_id === s.id) streamQ += (parseFloat(m.q_old) || 0);
          if (!isHot && m.cold_id === s.id) streamQ += (parseFloat(m.q_old) || 0);
        });
        existingUtilities.forEach(u => {
          if (u.stream_id === s.id) streamQ += (parseFloat(u.q_old) || 0);
        });
        calculatedMcp = deltaT > 0 ? (streamQ / deltaT) : 0;
      }

      return {
        id: s.id,
        Tin: parseFloat(s.Tin),
        Tout: parseFloat(s.Tout),
        Mcp: calculatedMcp
      };
    });
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const isGrassroot = activeTab === "grassroot";
    const endpoint = isGrassroot ? "/optimize" : "/retrofit";

    const payload = {
      hot_streams:  prepareStreamsForBackend(isGrassroot ? grHotStreams : rtHotStreams, isGrassroot, true),
      cold_streams: prepareStreamsForBackend(isGrassroot ? grColdStreams : rtColdStreams, isGrassroot, false),
      existing_matches: isGrassroot ? [] : existingMatches,
      existing_utilities: isGrassroot ? [] : existingUtilities,
      ...params,
    };

    try {
      const res = await fetch(`https://mahfathy-heat-exchanger-network.hf.space${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setCurrentView("results"); 
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const mainTabs = [
    { id: 'inputs', label: 'Data Inputs', icon: '📝' },
    { id: 'costs', label: 'Cost Parameters', icon: '💲' },
    { id: 'results', label: 'Optimization Results', icon: '📊' },
    { id: 'diagram', label: 'Grid Diagram', icon: '🕸️' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white font-black text-sm">H</div>
            <div>
              <div className="font-black tracking-tight text-white text-lg leading-none">HENS Optimizer</div>
              <div className="text-xs text-slate-500 leading-none mt-0.5">Heat Exchanger Network Synthesis</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            MINLP · Grassroot & Retrofitting
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        
        {/* ── التعديل 1: نقلنا اختيار نوع المسألة ليكون فوق كل التابات ── */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 max-w-md mx-auto mb-6">
          <button 
            onClick={() => handleModeSwitch('grassroot')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'grassroot' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Grassroot Design
          </button>
          <button 
            onClick={() => handleModeSwitch('retrofit')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'retrofit' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Retrofitting
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/50 rounded-t-2xl border border-slate-800 overflow-x-auto mb-8 hide-scrollbar">
          {mainTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-all border-b-2 ${
                currentView === tab.id 
                  ? 'border-orange-500 text-white bg-slate-800/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="space-y-6">
          
          {/* TAB 1: DATA INPUTS */}
          {currentView === 'inputs' && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTab === 'grassroot' ? (
                  <>
                    <StreamPanel streams={grHotStreams}  onChange={setGrHotStreams}  type="hot" activeTab={activeTab} />
                    <StreamPanel streams={grColdStreams} onChange={setGrColdStreams} type="cold" activeTab={activeTab} />
                  </>
                ) : (
                  <>
                    <StreamPanel streams={rtHotStreams}  onChange={setRtHotStreams}  type="hot" activeTab={activeTab} matches={existingMatches} utils={existingUtilities} />
                    <StreamPanel streams={rtColdStreams} onChange={setRtColdStreams} type="cold" activeTab={activeTab} matches={existingMatches} utils={existingUtilities} />
                  </>
                )}
              </div>

              {activeTab === 'retrofit' && (
                <div className="space-y-4">
                  <ExistingMatchesPanel 
                      matches={existingMatches} 
                      onChange={setExistingMatches} 
                      hotStreams={rtHotStreams}
                      coldStreams={rtColdStreams}
                      utils={existingUtilities}
                      U_global={params.U}
                  />
                  <ExistingUtilitiesPanel 
                      utils={existingUtilities} 
                      onChange={setExistingUtilities} 
                      hotStreams={rtHotStreams} 
                      coldStreams={rtColdStreams} 
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COST PARAMETERS */}
          {currentView === 'costs' && (
            <div className="animate-fade-in space-y-6">
              <CostEquationsNote />
              <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Solver & Cost Parameters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div><Label>Fixed HX Cost (a)</Label><Input value={params.fixed_hx_cost} step="100" onChange={e => updateParam("fixed_hx_cost", e.target.value)} /></div>
                  <div><Label>Area Cost Coef (b)</Label><Input value={params.area_cost_coef} step="10" onChange={e => updateParam("area_cost_coef", e.target.value)} /></div>
                  <div><Label>Area Exponent (c)</Label><Input value={params.area_cost_exp} step="0.01" onChange={e => updateParam("area_cost_exp", e.target.value)} /></div>
                  
                  <div><Label>U (kW/m²·°C)</Label><Input value={params.U} step="0.01" min="0.01" onChange={e => updateParam("U", e.target.value)} /></div>
                  <div><Label>HRAT (°C)</Label><Input value={params.HRAT} step="1" min="1" onChange={e => updateParam("HRAT", e.target.value)} /></div>
                  <div><Label>Hot Util Cost (C_HU)</Label><Input value={params.hot_utility_cost} step="1" onChange={e => updateParam("hot_utility_cost", e.target.value)} /></div>
                  <div><Label>Cold Util Cost (C_CU)</Label><Input value={params.cold_utility_cost} step="1" onChange={e => updateParam("cold_utility_cost", e.target.value)} /></div>
                  {activeTab === 'grassroot' && <div><Label>Annualized Cost Factor</Label><Input value={params.annualized_cost} step="0.01" onChange={e => updateParam("annualized_cost", e.target.value)} /></div>}
                  <div><Label>Max Matches</Label><Input value={params.max_matches} step="1" onChange={e => updateParam("max_matches", e.target.value)} /></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESULTS */}
          {currentView === 'results' && (
            <div className="animate-fade-in">
              {result ? (
                <ResultsPanel result={result} />
              ) : (
                <div className="h-[400px] border border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-500 bg-slate-900/30">
                  <span className="text-4xl mb-4">⚙️</span>
                  <p className="text-sm font-mono">No results yet. Please run optimization first.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GRID DIAGRAM */}
          {currentView === 'diagram' && (
            <div className="animate-fade-in">
              {result ? (
                <NetworkGridDiagram 
                  result={result} 
                  hotStreams={activeTab === 'grassroot' ? grHotStreams : rtHotStreams} 
                  coldStreams={activeTab === 'grassroot' ? grColdStreams : rtColdStreams} 
                  isRetrofit={activeTab === 'retrofit'} 
                />
              ) : (
                <div className="h-[400px] border border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-500 bg-slate-900/30">
                  <span className="text-4xl mb-4">📐</span>
                  <p className="text-sm font-mono">Grid diagram will appear here after optimization.</p>
                </div>
              )}
            </div>
          )}

          {/* ── التعديل 2: زرار الـ Run باللون البرتقالي القديم 100% ── */}
          {(currentView === 'inputs' || currentView === 'costs') && (
            <div className="mt-8 pt-6 border-t border-slate-800">
              {error && (
                <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-mono">
                  {error}
                </div>
              )}
              <button
                onClick={handleOptimize}
                disabled={loading}
                style={{ background: 'linear-gradient(to right, #f97316, #e11d48)' }}
                className="w-full py-4 rounded-2xl text-white font-black text-lg uppercase tracking-widest hover:opacity-90 shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : "RUN OPTIMIZATION"}
              </button>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}