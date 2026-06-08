import React, { useState } from 'react';
import { SimplexIteration, FoodItem } from '@/lib/simplex';

interface SimplexTableProps {
  iterations: SimplexIteration[];
  foods: FoodItem[];
}

export default function SimplexTable({ iterations, foods }: SimplexTableProps) {
  const [activeStep, setActiveStep] = useState<number>(0);

  if (iterations.length === 0) return null;

  const currentIter = iterations[activeStep];
  const { tableau, basis, headers, pivotRow, pivotCol, enteringVar, leavingVar, ratios } = currentIter;

  const formatNum = (num: number) => {
    if (num === 0) return '0';
    if (Math.abs(num) < 1e-9) return '0';
    if (Math.abs(num - Math.round(num)) < 1e-9) return Math.round(num).toString();

    if (Math.abs(num) > 500000) {
      const sign = num < 0 ? '-' : '';
      const mVal = Math.abs(num) / 1000000;
      if (Math.abs(mVal - Math.round(mVal)) < 1e-2) {
        return `${sign}${Math.round(mVal)}M`;
      }
      return num.toLocaleString('id-ID', { maximumFractionDigits: 0 });
    }

    return parseFloat(num.toFixed(4)).toString();
  };

  const getVarDescription = (name: string) => {
    if (name.startsWith('x')) {
      const idx = parseInt(name.substring(1)) - 1;
      const foodName = foods[idx]?.name || `Bahan ${idx + 1}`;
      return `Porsi ${foodName}`;
    }

    const nutrientNames = ['Kalori', 'Protein', 'Lemak', 'Karbohidrat'];
    if (name === 'sB') return 'Slack Anggaran (≤)';
    if (name.startsWith('s')) {
      const idx = parseInt(name.substring(1)) - 1;
      const nutName = nutrientNames[idx] || `Nutrisi ${idx + 1}`;
      return `Surplus ${nutName}`;
    }
    if (name.startsWith('a')) {
      const idx = parseInt(name.substring(1)) - 1;
      const nutName = nutrientNames[idx] || `Nutrisi ${idx + 1}`;
      return `Variabel Buatan (${nutName})`;
    }
    if (name === 'W') return 'Fungsi Tujuan W';
    return name;
  };

  const isFinalStep = activeStep === iterations.length - 1;
  const hasBudgetSlack = headers.includes('sB');

  return (
    <div className="bg-surface rounded-md p-6 border border-line overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 min-w-0">
        <h3 className="font-bold text-ink text-base leading-tight flex-shrink-0">Iterasi OBE</h3>

        {/* Stepper Tabs */}
        <div className="flex items-center gap-1.5 bg-fill p-1.5 rounded-md overflow-x-auto w-full md:max-w-[70%] min-w-0 border border-line">
          {iterations.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeStep === idx ? 'bg-brand text-white' : 'text-muted hover:text-ink hover:bg-surface'
              }`}
            >
              Iterasi {idx}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-fill rounded p-4 flex flex-col justify-between border border-line">
          <span className="text-[10px] uppercase font-semibold text-faint tracking-wide">Status Perhitungan</span>
          <span className="text-sm font-bold mt-1.5">
            {isFinalStep ? (
              <span className="text-good">Solusi Optimal Tercapai</span>
            ) : (
              <span className="text-gold">Penyelesaian OBE</span>
            )}
          </span>
          <p className="text-muted text-[11px] mt-1.5 font-medium leading-relaxed">
            {isFinalStep
              ? 'Seluruh koefisien baris fungsi tujuan bernilai non-negatif.'
              : 'Melakukan Operasi Baris Elementer untuk meningkatkan nilai tujuan.'}
          </p>
        </div>

        <div className="bg-gold-soft rounded p-4 flex flex-col justify-between border border-gold/30">
          <span className="text-[10px] uppercase font-semibold text-gold tracking-wide">Variabel Masuk</span>
          <span className="text-sm font-bold mt-1.5">
            {enteringVar ? (
              <span className="text-white font-mono bg-gold px-2 py-0.5 rounded text-xs font-bold">{enteringVar}</span>
            ) : (
              <span className="text-faint">-</span>
            )}
          </span>
          <p className="text-ink/75 text-[11px] mt-1.5 font-medium leading-relaxed">
            {enteringVar
              ? `${getVarDescription(enteringVar)}. Koefisien negatif terbesar pada baris tujuan W (${formatNum(tableau[0][pivotCol!])}).`
              : 'Tidak ada (sudah optimal).'}
          </p>
        </div>

        <div className="bg-brand-soft rounded p-4 flex flex-col justify-between border border-brand/30">
          <span className="text-[10px] uppercase font-semibold text-brand tracking-wide">Variabel Keluar</span>
          <span className="text-sm font-bold mt-1.5">
            {leavingVar ? (
              <span className="text-white font-mono bg-brand px-2 py-0.5 rounded text-xs font-bold">{leavingVar}</span>
            ) : (
              <span className="text-faint">-</span>
            )}
          </span>
          <p className="text-brand-dark/85 text-[11px] mt-1.5 font-medium leading-relaxed">
            {leavingVar
              ? `${getVarDescription(leavingVar)}. Dipilih berdasarkan rasio positif terkecil (${formatNum(ratios[pivotRow! - 1]!)}).`
              : 'Tidak ada (sudah optimal).'}
          </p>
        </div>
      </div>

      {/* Simplex Tableau Table */}
      <div className="overflow-x-auto rounded border border-line">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-fill border-b border-line-strong text-muted font-bold">
              <th className="py-3 px-3 w-20 whitespace-nowrap">Basis</th>
              {headers.map((h, idx) => {
                const isPivotCol = idx === pivotCol;
                return (
                  <th
                    key={idx}
                    className={`py-3 px-3 text-right font-mono whitespace-nowrap ${
                      isPivotCol ? 'bg-gold-soft text-gold font-bold' : ''
                    }`}
                  >
                    {h}
                  </th>
                );
              })}
              <th className="py-3 px-3 text-right w-24 whitespace-nowrap">Rasio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-muted">
            {tableau.map((row, rowIdx) => {
              const isPivotRow = rowIdx === pivotRow;
              const basisVar = basis[rowIdx];

              return (
                <tr key={rowIdx} className={`transition duration-300 ${isPivotRow ? 'bg-brand-soft/70 font-semibold' : 'hover:bg-fill/50'}`}>
                  {/* Basis column */}
                  <td className="py-3 px-3 font-mono font-bold text-muted bg-fill border-r border-line whitespace-nowrap">
                    {basisVar}
                  </td>

                  {/* Tableau elements */}
                  {row.map((val, colIdx) => {
                    const isPivotCol = colIdx === pivotCol;
                    const isPivotCell = isPivotRow && isPivotCol;

                    return (
                      <td
                        key={colIdx}
                        className={`py-3 px-3 text-right font-mono whitespace-nowrap ${
                          isPivotCell
                            ? 'bg-good text-white font-bold relative z-10'
                            : isPivotCol
                            ? 'bg-gold-soft/70 text-gold font-semibold'
                            : isPivotRow
                            ? 'bg-brand-soft/60 text-brand-dark'
                            : 'text-ink'
                        }`}
                      >
                        {formatNum(val)}
                      </td>
                    );
                  })}

                  {/* Ratio column */}
                  <td className="py-3 px-3 text-right font-mono text-faint bg-fill/40 border-l border-line whitespace-nowrap">
                    {rowIdx === 0 ? (
                      <span className="text-faint">-</span>
                    ) : ratios[rowIdx - 1] !== null ? (
                      <span className={isPivotRow ? 'text-brand font-bold' : ''}>{formatNum(ratios[rowIdx - 1]!)}</span>
                    ) : (
                      <span className="text-faint">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Guide / Legend */}
      <div className="mt-4 p-3 bg-fill rounded flex flex-wrap gap-4 text-[11px] text-muted items-center justify-between font-semibold border border-line">
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-gold-soft border border-gold/40"></span>
            Kolom Pivot (Masuk)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-brand-soft border border-brand/40"></span>
            Baris Pivot (Keluar)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-good"></span>
            Elemen Pivot
          </span>
        </div>

        {!isFinalStep && pivotRow !== null && pivotRow > 0 && pivotCol !== null && pivotCol >= 0 && (
          <div className="font-mono text-xs text-good font-bold bg-good-soft px-2.5 py-0.5 rounded">
            OBE: B{pivotRow} = B{pivotRow} / {formatNum(tableau[pivotRow][pivotCol])}
          </div>
        )}
      </div>

      {/* Keterangan Variabel */}
      <div className="mt-4 p-4 bg-fill rounded space-y-2 text-xs border border-line">
        <h4 className="font-bold text-ink uppercase tracking-wide text-[10px]">Keterangan Variabel OBE:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-muted">
          <div>
            <span className="font-bold text-brand block mb-1">xᵢ (Variabel Keputusan / Porsi Bahan Makanan):</span>
            <ul className="list-disc list-inside space-y-1.5 font-medium pl-1">
              {foods.map((food, idx) => (
                <li key={food.id}>
                  <span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">x{idx + 1}</span>: {food.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <div>
              <span className="font-bold text-sky-700 block mb-1">sᵢ (Surplus Variable / Kelebihan Gizi):</span>
              <div className="grid grid-cols-2 gap-2 font-medium pl-1">
                <div><span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">s1</span>: Kalori</div>
                <div><span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">s2</span>: Protein</div>
                <div><span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">s3</span>: Lemak</div>
                <div><span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">s4</span>: Karbohidrat</div>
              </div>
              {hasBudgetSlack && (
                <div className="mt-2 font-medium pl-1">
                  <span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">sB</span>: Slack Anggaran — sisa anggaran pada kendala biaya ≤ batas (≤).
                </div>
              )}
            </div>
            <div>
              <span className="font-bold text-gold block mb-1">aᵢ (Artificial Variable / Variabel Buatan Big-M):</span>
              <div className="grid grid-cols-2 gap-2 font-medium pl-1">
                <div><span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">a1</span>: Kalori</div>
                <div><span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">a2</span>: Protein</div>
                <div><span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">a3</span>: Lemak</div>
                <div><span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">a4</span>: Karbohidrat</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
