'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { solveSimplex, FoodItem, NutritionTargets } from '@/lib/simplex';

interface SensitivityPanelProps {
  foods: FoodItem[];
  baseTargets: NutritionTargets;
  maxBudget?: number;
}

type NutrientKey = keyof NutritionTargets;

const NUTRIENTS: { key: NutrientKey; label: string; unit: string; step: number; fallback: number }[] = [
  { key: 'calories', label: 'Kalori', unit: 'kkal', step: 10, fallback: 600 },
  { key: 'protein', label: 'Protein', unit: 'g', step: 1, fallback: 15 },
  { key: 'fat', label: 'Lemak', unit: 'g', step: 1, fallback: 10 },
  { key: 'carbs', label: 'Karbohidrat', unit: 'g', step: 5, fallback: 50 },
];

const PRESETS: { label: string; note: string; targets: NutritionTargets }[] = [
  { label: 'Anak SD', note: 'standar MBG', targets: { calories: 600, protein: 15, fat: 10, carbs: 50 } },
  { label: 'Remaja', note: 'kebutuhan lebih tinggi', targets: { calories: 850, protein: 25, fat: 18, carbs: 90 } },
  { label: 'Ibu Hamil', note: 'gizi tambahan', targets: { calories: 900, protein: 30, fat: 20, carbs: 100 } },
];

const rpFmt = (v: number) => `Rp ${Math.round(v).toLocaleString('id-ID')}`;

export default function SensitivityPanel({ foods, baseTargets, maxBudget }: SensitivityPanelProps) {
  const [localTargets, setLocalTargets] = useState<NutritionTargets>(baseTargets);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [axis, setAxis] = useState<string>('calories'); // nutrient key or `price:<id>`
  const [selectedFoodId, setSelectedFoodId] = useState<string>(foods[0]?.id ?? '');

  // Reset working copy whenever the user re-runs the main optimization
  useEffect(() => {
    setLocalTargets(baseTargets);
    setPriceOverrides({});
  }, [baseTargets]);

  useEffect(() => {
    if (foods.length && !foods.some(f => f.id === selectedFoodId)) {
      setSelectedFoodId(foods[0].id);
    }
  }, [foods, selectedFoodId]);

  const effectiveFoods = useMemo(
    () => foods.map(f => ({ ...f, price: priceOverrides[f.id] ?? f.price })),
    [foods, priceOverrides]
  );

  // Live solve for the current parameter set
  const current = useMemo(
    () => solveSimplex(effectiveFoods, localTargets, maxBudget),
    [effectiveFoods, localTargets, maxBudget]
  );

  const menuNames = (r: ReturnType<typeof solveSimplex>) =>
    foods.filter((_, i) => (r.solution[`x${i + 1}`] || 0) > 1e-3).map(f => f.name);

  // Resolve the active chart axis into a numeric config
  const axisCfg = useMemo(() => {
    if (axis.startsWith('price:')) {
      const id = axis.slice(6);
      const food = foods.find(f => f.id === id);
      const base = priceOverrides[id] ?? food?.price ?? 0;
      const anchor = base > 0 ? base : 5000;
      return {
        kind: 'price' as const,
        foodId: id,
        label: `Harga ${food?.name ?? 'Bahan'}`,
        unit: 'Rp',
        min: 0,
        max: Math.round(anchor * 2),
        current: base,
        step: Math.max(50, Math.round((anchor * 2) / 100 / 50) * 50),
        fmt: rpFmt,
      };
    }
    const key = axis as NutrientKey;
    const meta = NUTRIENTS.find(n => n.key === key)!;
    const base = localTargets[key];
    const anchor = base > 0 ? base : meta.fallback;
    return {
      kind: 'nutrient' as const,
      key,
      label: `Target ${meta.label}`,
      unit: meta.unit,
      min: 0,
      max: Math.round(anchor * 2),
      current: base,
      step: meta.step,
      fmt: (v: number) => `${Math.round(v)} ${meta.unit}`,
    };
  }, [axis, localTargets, foods, priceOverrides]);

  // Sweep the active axis to build the sensitivity curve
  const sweep = useMemo(() => {
    const N = 24;
    const pts: { x: number; cost: number | null }[] = [];
    const span = axisCfg.max - axisCfg.min || 1;
    for (let i = 0; i <= N; i++) {
      const v = axisCfg.min + (span * i) / N;
      let t = localTargets;
      let fds = effectiveFoods;
      if (axisCfg.kind === 'nutrient') {
        t = { ...localTargets, [axisCfg.key]: v };
      } else {
        fds = effectiveFoods.map(f => (f.id === axisCfg.foodId ? { ...f, price: v } : f));
      }
      const r = solveSimplex(fds, t, maxBudget);
      pts.push({ x: v, cost: r.optimal ? r.totalCost : null });
    }
    return pts;
  }, [axisCfg, localTargets, effectiveFoods, maxBudget]);

  const presetResults = useMemo(
    () =>
      PRESETS.map(p => {
        const r = solveSimplex(effectiveFoods, p.targets, maxBudget);
        return { ...p, cost: r.optimal ? r.totalCost : null, foods: menuNames(r) };
      }),
    [effectiveFoods, maxBudget] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const setAxisValue = (v: number) => {
    if (axisCfg.kind === 'nutrient') {
      setLocalTargets(prev => ({ ...prev, [axisCfg.key]: v }));
    } else {
      setPriceOverrides(prev => ({ ...prev, [axisCfg.foodId]: v }));
    }
  };

  const isDirty =
    NUTRIENTS.some(n => localTargets[n.key] !== baseTargets[n.key]) || Object.keys(priceOverrides).length > 0;

  return (
    <div className="bg-surface rounded-md p-6 border border-line space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-ink text-base leading-tight">Analisis Sensitivitas (What-If)</h3>
            <span className="text-[9px] font-bold text-gold uppercase tracking-wide bg-gold-soft border border-gold/30 rounded px-1.5 py-0.5">
              Post-Optimality
            </span>
          </div>
          <p className="text-xs text-muted mt-1 leading-relaxed max-w-xl">
            Ubah target gizi atau harga bahan, lalu lihat bagaimana biaya optimal (Z*) dan komposisi menu ikut berubah —
            model di-<em>solve</em> ulang secara langsung.
          </p>
        </div>
        {isDirty && (
          <button
            onClick={() => {
              setLocalTargets(baseTargets);
              setPriceOverrides({});
            }}
            className="text-[11px] font-semibold text-muted hover:text-ink bg-fill hover:bg-line border border-line rounded px-3 py-1.5 transition cursor-pointer flex-shrink-0"
          >
            Kembalikan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: parameters */}
        <div className="space-y-5">
          <span className="text-[11px] font-semibold text-muted">Parameter Target Gizi</span>
          <div className="space-y-4">
            {NUTRIENTS.map(n => {
              const base = localTargets[n.key];
              const anchor = base > 0 ? base : n.fallback;
              const max = Math.round(anchor * 2);
              return (
                <div key={n.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-ink">{n.label}</label>
                    <span className="text-xs font-bold font-mono text-ink">
                      {Math.round(base)} <span className="text-faint font-medium">{n.unit}</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={max}
                    step={n.step}
                    value={base}
                    onChange={e => setLocalTargets(prev => ({ ...prev, [n.key]: parseFloat(e.target.value) }))}
                    className="w-full"
                    aria-label={`Target ${n.label}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Price what-if */}
          {foods.length > 0 && (
            <div className="pt-2 border-t border-line space-y-3">
              <span className="text-[11px] font-semibold text-muted">Harga Bahan (What-If)</span>
              <select
                value={selectedFoodId}
                onChange={e => setSelectedFoodId(e.target.value)}
                className="w-full bg-fill border border-line-strong rounded px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand cursor-pointer"
              >
                {foods.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {(() => {
                const food = foods.find(f => f.id === selectedFoodId);
                if (!food) return null;
                const base = priceOverrides[food.id] ?? food.price;
                const anchor = base > 0 ? base : 5000;
                const max = Math.round(anchor * 2);
                const step = Math.max(50, Math.round(max / 100 / 50) * 50);
                return (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted">Harga per porsi</span>
                      <span className="text-xs font-bold font-mono text-ink">{rpFmt(base)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={max}
                      step={step}
                      value={base}
                      onChange={e => setPriceOverrides(prev => ({ ...prev, [food.id]: parseFloat(e.target.value) }))}
                      className="w-full"
                      aria-label={`Harga ${food.name}`}
                    />
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* RIGHT: live result + chart */}
        <div className="space-y-4">
          {/* Live optimal result */}
          <div className="bg-fill rounded border border-line p-4">
            <span className="text-[10px] font-semibold text-faint uppercase tracking-wide">Biaya Optimal (Z*)</span>
            {current.optimal ? (
              <>
                <div className="text-2xl font-extrabold text-brand font-mono tracking-tight mt-0.5">
                  {rpFmt(current.totalCost)}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {menuNames(current).length > 0 ? (
                    menuNames(current).map((name, i) => (
                      <span key={i} className="text-[10px] font-semibold text-brand-dark bg-brand-soft border border-brand/20 rounded px-2 py-0.5">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-faint font-medium">Menu kosong</span>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
                <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                {current.infeasible
                  ? 'Tidak ada solusi layak pada target ini'
                  : current.unbounded
                  ? 'Solusi tidak terbatas'
                  : current.error || 'Solusi tidak tersedia'}
              </div>
            )}
          </div>

          {/* Sensitivity chart */}
          <div className="bg-surface rounded border border-line p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-[11px] font-semibold text-muted">Kurva Sensitivitas</span>
              <select
                value={axis}
                onChange={e => setAxis(e.target.value)}
                className="bg-fill border border-line-strong rounded px-2 py-1 text-[11px] font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand cursor-pointer max-w-[55%]"
              >
                {NUTRIENTS.map(n => (
                  <option key={n.key} value={n.key}>Target {n.label}</option>
                ))}
                {foods.map(f => (
                  <option key={f.id} value={`price:${f.id}`}>Harga {f.name}</option>
                ))}
              </select>
            </div>
            <SensitivityChart points={sweep} axisCfg={axisCfg} />
            <p className="text-[10px] text-faint font-medium mt-2 leading-relaxed">
              Sumbu X: {axisCfg.label} · Sumbu Y: biaya optimal. Garis putus menandai nilai saat ini.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario presets */}
      <div className="pt-2 border-t border-line">
        <span className="text-[11px] font-semibold text-muted">Perbandingan Skenario Populasi</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          {presetResults.map(p => (
            <button
              key={p.label}
              onClick={() => setLocalTargets(p.targets)}
              className="text-left bg-fill hover:bg-brand-soft border border-line hover:border-brand/30 rounded p-3 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">{p.label}</span>
                <span className="text-[9px] text-faint font-medium">{p.note}</span>
              </div>
              <div className="mt-1.5 font-mono font-extrabold text-sm text-brand">
                {p.cost !== null ? rpFmt(p.cost) : <span className="text-faint text-xs">Tidak layak</span>}
              </div>
              <div className="text-[10px] text-muted font-medium mt-1 truncate">
                {p.foods.length ? p.foods.join(', ') : '—'}
              </div>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-faint font-medium mt-2">
          Klik skenario untuk menerapkannya pada slider di atas. Biaya dihitung dengan harga bahan saat ini.
        </p>
      </div>
    </div>
  );
}

/* ---- Hand-rolled SVG line chart (no dependency) ---- */
function SensitivityChart({
  points,
  axisCfg,
}: {
  points: { x: number; cost: number | null }[];
  axisCfg: { min: number; max: number; current: number; fmt: (v: number) => string };
}) {
  const W = 320;
  const H = 150;
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 18;

  const valid = points.filter(p => p.cost !== null) as { x: number; cost: number }[];
  const span = axisCfg.max - axisCfg.min || 1;

  if (valid.length === 0) {
    return (
      <div className="h-[150px] flex items-center justify-center text-[11px] text-faint font-medium bg-fill/50 rounded">
        Tidak ada solusi layak pada rentang ini.
      </div>
    );
  }

  const maxCost = Math.max(...valid.map(p => p.cost)) || 1;
  const sx = (x: number) => padL + ((x - axisCfg.min) / span) * (W - padL - padR);
  const sy = (c: number) => padT + (1 - c / maxCost) * (H - padT - padB);

  // Build a path, breaking the line where solutions are infeasible (null)
  let d = '';
  let pen = false;
  points.forEach(p => {
    if (p.cost === null) {
      pen = false;
      return;
    }
    d += `${pen ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.cost).toFixed(1)} `;
    pen = true;
  });

  const curX = sx(Math.min(Math.max(axisCfg.current, axisCfg.min), axisCfg.max));
  // nearest computed point to current for the dot
  const nearest = valid.reduce((a, b) => (Math.abs(b.x - axisCfg.current) < Math.abs(a.x - axisCfg.current) ? b : a));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]" role="img" aria-label="Kurva biaya optimal terhadap parameter">
      {/* gridlines */}
      {[0.25, 0.5, 0.75, 1].map(g => (
        <line key={g} x1={padL} x2={W - padR} y1={padT + g * (H - padT - padB)} y2={padT + g * (H - padT - padB)} stroke="#e6e3dc" strokeWidth={1} />
      ))}
      {/* current value marker */}
      <line x1={curX} x2={curX} y1={padT} y2={H - padB} stroke="#9a6b16" strokeWidth={1} strokeDasharray="3 3" />
      {/* cost curve */}
      <path d={d} fill="none" stroke="#c8102e" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* current point dot */}
      <circle cx={sx(nearest.x)} cy={sy(nearest.cost)} r={3.5} fill="#c8102e" stroke="#ffffff" strokeWidth={1.5} />
      {/* axis min/max labels */}
      <text x={padL} y={H - 5} fontSize={8} fill="#8a857c" fontFamily="monospace">{axisCfg.fmt(axisCfg.min)}</text>
      <text x={W - padR} y={H - 5} fontSize={8} fill="#8a857c" fontFamily="monospace" textAnchor="end">{axisCfg.fmt(axisCfg.max)}</text>
    </svg>
  );
}
