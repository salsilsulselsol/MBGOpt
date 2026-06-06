import React from 'react';
import { NutritionTargets } from '@/lib/simplex';

interface NutritionGoalsProps {
  targets: NutritionTargets;
  onChange: (newTargets: NutritionTargets) => void;
  maxBudget: number;
  onBudgetChange: (budget: number) => void;
  portionType: 'single' | 'batch';
  onPortionTypeChange: (type: 'single' | 'batch') => void;
  batchSize: number;
  onBatchSizeChange: (size: number) => void;
}

export default function NutritionGoals({
  targets,
  onChange,
  maxBudget,
  onBudgetChange,
  portionType,
  onPortionTypeChange,
  batchSize,
  onBatchSizeChange,
}: NutritionGoalsProps) {
  const handleChange = (field: keyof NutritionTargets, value: string) => {
    const numValue = parseFloat(value);
    onChange({
      ...targets,
      [field]: isNaN(numValue) ? 0 : Math.max(0, numValue),
    });
  };

  const handleStep = (field: keyof NutritionTargets, isIncrement: boolean) => {
    const currentVal = targets[field];
    let step = 1;
    if (field === 'calories') step = 50;
    else if (field === 'protein') step = 5;
    else if (field === 'fat') step = 2;
    else if (field === 'carbs') step = 10;

    const newVal = isIncrement ? currentVal + step : Math.max(0, currentVal - step);
    onChange({
      ...targets,
      [field]: newVal,
    });
  };

  const fields = [
    {
      id: 'calories',
      label: 'Kalori',
      unit: 'kkal',
      value: targets.calories,
    },
    {
      id: 'protein',
      label: 'Protein',
      unit: 'g',
      value: targets.protein,
    },
    {
      id: 'fat',
      label: 'Lemak',
      unit: 'g',
      value: targets.fat,
    },
    {
      id: 'carbs',
      label: 'Karbohidrat',
      unit: 'g',
      value: targets.carbs,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xs space-y-6 border-2 border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base leading-tight">Target Gizi & Anggaran</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Tentukan batas minimum gizi dan batas biaya per porsi</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white focus-within:border-indigo-500 transition">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider select-none">Anggaran Maks:</span>
          <div className="flex items-center text-xs font-mono">
            <span className="text-slate-400 font-bold mr-1">Rp</span>
            <input
              type="number"
              min="0"
              placeholder="15000"
              value={maxBudget === 0 ? '' : maxBudget}
              onChange={e => onBudgetChange(parseFloat(e.target.value) || 0)}
              className="w-20 bg-transparent border-0 font-extrabold text-slate-900 focus:outline-none p-0 text-sm placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>
        </div>
      </div>

      {/* Tipe Perhitungan: Satuan / Batch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border-2 border-slate-250">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe Perhitungan</span>
          <div className="flex gap-1 bg-white p-1 border-2 border-slate-250 rounded-xl">
            <button
              type="button"
              onClick={() => onPortionTypeChange('single')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                portionType === 'single'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Satuan (1 Porsi)
            </button>
            <button
              type="button"
              onClick={() => onPortionTypeChange('batch')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                portionType === 'batch'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Batch (Banyak Porsi)
            </button>
          </div>
        </div>

        {portionType === 'batch' && (
          <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Porsi (Siswa)</span>
            <div className="flex items-center bg-white border-2 border-slate-250 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
              <input
                type="number"
                min="1"
                value={batchSize}
                onChange={e => onBatchSizeChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-transparent border-0 font-extrabold text-slate-900 focus:outline-none p-0 text-sm"
              />
              <span className="text-[10px] font-bold text-slate-400 ml-2 select-none">Siswa</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {fields.map(field => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {field.label}
            </label>
            <div className="flex items-center bg-slate-50 border-2 border-slate-300 hover:border-slate-450 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white focus-within:border-indigo-500 rounded-xl overflow-hidden transition w-full">
              <button
                type="button"
                onClick={() => handleStep(field.id as keyof NutritionTargets, false)}
                className="px-3 py-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer select-none flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                min="0"
                step="any"
                value={field.value === 0 ? '' : field.value}
                onChange={e => handleChange(field.id as keyof NutritionTargets, e.target.value)}
                placeholder="0"
                className="w-full text-center bg-transparent border-0 text-slate-900 text-sm font-extrabold focus:outline-none focus:ring-0 p-0"
              />
              <span className="text-[10px] font-bold text-slate-400 px-2 select-none">
                {field.unit}
              </span>
              <button
                type="button"
                onClick={() => handleStep(field.id as keyof NutritionTargets, true)}
                className="px-3 py-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer select-none flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
