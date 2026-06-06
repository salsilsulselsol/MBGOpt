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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xs overflow-hidden border-2 border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 min-w-0">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base leading-tight">Iterasi OBE</h3>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl overflow-x-auto w-full md:max-w-[70%] min-w-0">
          {iterations.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeStep === idx
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Iterasi {idx}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-100 rounded-xl p-4 flex flex-col justify-between border-2 border-slate-250">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status Perhitungan</span>
          <span className="text-sm font-bold text-slate-850 mt-1.5">
            {isFinalStep ? (
              <span className="text-emerald-700 font-extrabold">
                Solusi Optimal Tercapai
              </span>
            ) : (
              <span className="text-amber-700 font-extrabold">
                Penyelesaian OBE
              </span>
            )}
          </span>
          <p className="text-slate-650 text-[11px] mt-1.5 font-semibold leading-relaxed">
            {isFinalStep 
              ? "Seluruh koefisien baris fungsi tujuan bernilai non-negatif." 
              : "Melakukan Operasi Baris Elementer untuk meningkatkan nilai tujuan."}
          </p>
        </div>

        <div className="bg-sky-100 rounded-xl p-4 flex flex-col justify-between border-2 border-sky-300">
          <span className="text-[10px] uppercase font-bold text-sky-850 tracking-wider">Variabel Masuk</span>
          <span className="text-sm font-bold text-slate-850 mt-1.5">
            {enteringVar ? (
              <span className="text-white font-mono bg-sky-600 px-2 py-0.5 rounded text-xs font-extrabold">
                {enteringVar}
              </span>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </span>
          <p className="text-sky-900 text-[11px] mt-1.5 font-semibold leading-relaxed">
            {enteringVar 
              ? `${getVarDescription(enteringVar)}. Memiliki koefisien negatif terbesar pada baris tujuan W (${formatNum(tableau[0][pivotCol!])}).` 
              : "Tidak ada (sudah optimal)."}
          </p>
        </div>

        <div className="bg-rose-100 rounded-xl p-4 flex flex-col justify-between border-2 border-rose-300">
          <span className="text-[10px] uppercase font-bold text-rose-850 tracking-wider">Variabel Keluar</span>
          <span className="text-sm font-bold text-slate-850 mt-1.5">
            {leavingVar ? (
              <span className="text-white font-mono bg-rose-600 px-2 py-0.5 rounded text-xs font-extrabold">
                {leavingVar}
              </span>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </span>
          <p className="text-rose-900 text-[11px] mt-1.5 font-semibold leading-relaxed">
            {leavingVar 
              ? `${getVarDescription(leavingVar)}. Dipilih berdasarkan rasio positif terkecil (${formatNum(ratios[pivotRow! - 1]!)}).` 
              : "Tidak ada (sudah optimal)."}
          </p>
        </div>
      </div>

      {/* Simplex Tableau Table */}
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-350 text-slate-655 font-bold">
              <th className="py-3 px-3 w-20 whitespace-nowrap">Basis</th>
              {headers.map((h, idx) => {
                const isPivotCol = idx === pivotCol;
                return (
                  <th
                    key={idx}
                    className={`py-3 px-3 text-right font-mono whitespace-nowrap ${
                      isPivotCol ? 'bg-sky-100/70 text-sky-950 font-extrabold' : ''
                    }`}
                  >
                    {h}
                  </th>
                );
              })}
              <th className="py-3 px-3 text-right w-24 whitespace-nowrap">Rasio</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-200 text-slate-700">
            {tableau.map((row, rowIdx) => {
              const isPivotRow = rowIdx === pivotRow;
              const basisVar = basis[rowIdx];

              return (
                <tr
                  key={rowIdx}
                  className={`hover:bg-slate-50/40 transition duration-300 ${
                    isPivotRow ? 'bg-rose-55/80 font-semibold' : ''
                  }`}
                >
                  {/* Basis column */}
                  <td className="py-3 px-3 font-mono font-bold text-slate-650 bg-slate-55 border-r-2 border-slate-250 whitespace-nowrap">
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
                            ? 'bg-emerald-600 text-white font-black rounded scale-102 shadow-sm z-10 relative'
                            : isPivotCol
                            ? 'bg-sky-50 text-sky-950 font-semibold'
                            : isPivotRow
                            ? 'bg-rose-50/90 text-rose-950'
                            : ''
                        }`}
                      >
                        {formatNum(val)}
                      </td>
                    );
                  })}

                  {/* Ratio column */}
                  <td className="py-3 px-3 text-right font-mono text-slate-500 bg-slate-50/20 border-l-2 border-slate-250 whitespace-nowrap">
                    {rowIdx === 0 ? (
                      <span className="text-slate-400">-</span>
                    ) : ratios[rowIdx - 1] !== null ? (
                      <span className={isPivotRow ? 'text-rose-700 font-bold' : ''}>
                        {formatNum(ratios[rowIdx - 1]!)}
                      </span>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Guide / Legend */}
      <div className="mt-4 p-3 bg-slate-50 rounded-xl flex flex-wrap gap-4 text-[11px] text-slate-650 items-center justify-between font-bold border-2 border-slate-200">
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-100"></span>
            Kolom Pivot (Masuk)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-100"></span>
            Baris Pivot (Keluar)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
            Elemen Pivot
          </span>
        </div>
        
        {!isFinalStep && pivotRow !== null && pivotRow > 0 && pivotCol !== null && pivotCol >= 0 && (
          <div className="font-mono text-xs text-emerald-900 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded">
            OBE: B{pivotRow} = B{pivotRow} / {formatNum(tableau[pivotRow][pivotCol])}
          </div>
        )}
      </div>

      {/* Keterangan Variabel */}
      <div className="mt-4 p-4 bg-slate-55 rounded-xl space-y-2 text-xs border-2 border-slate-300">
        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Keterangan Variabel OBE:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-slate-600">
          <div>
            <span className="font-bold text-indigo-700 block mb-1">xᵢ (Variabel Keputusan / Porsi Bahan Makanan):</span>
            <ul className="list-disc list-inside space-y-1.5 font-semibold pl-1">
              {foods.map((food, idx) => (
                <li key={food.id}>
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border-2 border-slate-300">x{idx + 1}</span>: {food.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <div>
              <span className="font-bold text-sky-700 block mb-1">sᵢ (Surplus Variable / Kelebihan Gizi):</span>
              <div className="grid grid-cols-2 gap-2 font-semibold pl-1">
                <div><span className="font-mono bg-white px-1.5 py-0.5 rounded border-2 border-slate-300">s1</span>: Kalori</div>
                <div><span className="font-mono bg-white px-1.5 py-0.5 rounded border-2 border-slate-300">s2</span>: Protein</div>
                <div><span className="font-mono bg-white px-1.5 py-0.5 rounded border-2 border-slate-300">s3</span>: Lemak</div>
                <div><span className="font-mono bg-white px-1.5 py-0.5 rounded border-2 border-slate-300">s4</span>: Karbohidrat</div>
              </div>
            </div>
            <div>
              <span className="font-bold text-rose-700 block mb-1">aᵢ (Artificial Variable / Variabel Buatan Big-M):</span>
              <div className="grid grid-cols-2 gap-2 font-semibold pl-1">
                <div><span className="font-mono bg-white px-1.5 py-0.5 rounded border-2 border-slate-300">a1</span>: Kalori</div>
                <div><span className="font-mono bg-white px-1.5 py-0.5 rounded border-2 border-slate-300">a2</span>: Protein</div>
                <div><span className="font-mono bg-white px-1.5 py-0.5 rounded border-2 border-slate-300">a3</span>: Lemak</div>
                <div><span className="font-mono bg-white px-1.5 py-0.5 rounded border-2 border-slate-300">a4</span>: Karbohidrat</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
