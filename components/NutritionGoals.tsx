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
    { id: 'calories', label: 'Kalori', unit: 'kkal', value: targets.calories },
    { id: 'protein', label: 'Protein', unit: 'g', value: targets.protein },
    { id: 'fat', label: 'Lemak', unit: 'g', value: targets.fat },
    { id: 'carbs', label: 'Karbohidrat', unit: 'g', value: targets.carbs },
  ];

  return (
    <div className="bg-surface rounded-md p-6 border border-line space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h3 className="font-bold text-ink text-base leading-tight">Target Gizi &amp; Anggaran</h3>
          <p className="text-xs text-muted mt-1">Tentukan batas minimum gizi dan batas biaya per porsi</p>
        </div>
        <div className="flex items-center gap-2 bg-fill border border-line-strong rounded px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-brand/40 focus-within:bg-surface focus-within:border-brand transition">
          <span className="text-[11px] font-semibold text-muted select-none">Anggaran Maks</span>
          <div className="flex items-center text-xs font-mono">
            <span className="text-faint font-medium mr-1">Rp</span>
            <input
              type="number"
              min="0"
              placeholder="15000"
              value={maxBudget === 0 ? '' : maxBudget}
              onChange={e => onBudgetChange(parseFloat(e.target.value) || 0)}
              className="w-20 bg-transparent border-0 font-bold text-ink focus:outline-none p-0 text-sm placeholder:text-faint placeholder:font-normal"
            />
          </div>
        </div>
      </div>

      {/* Tipe Perhitungan: Satuan / Batch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-fill p-4 rounded-md border border-line">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-muted">Tipe Perhitungan</span>
          <div className="flex gap-1 bg-surface p-1 border border-line rounded">
            <button
              type="button"
              onClick={() => onPortionTypeChange('single')}
              className={`flex-1 py-1.5 rounded text-xs font-semibold transition cursor-pointer text-center ${
                portionType === 'single'
                  ? 'bg-brand text-white'
                  : 'text-muted hover:text-ink hover:bg-fill'
              }`}
            >
              Satuan (1 Porsi)
            </button>
            <button
              type="button"
              onClick={() => onPortionTypeChange('batch')}
              className={`flex-1 py-1.5 rounded text-xs font-semibold transition cursor-pointer text-center ${
                portionType === 'batch'
                  ? 'bg-brand text-white'
                  : 'text-muted hover:text-ink hover:bg-fill'
              }`}
            >
              Batch (Banyak Porsi)
            </button>
          </div>
        </div>

        {portionType === 'batch' && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-muted">Jumlah Porsi (Siswa)</span>
            <div className="flex items-center bg-surface border border-line rounded px-3 py-1.5 focus-within:ring-2 focus-within:ring-brand/40 focus-within:border-brand transition">
              <input
                type="number"
                min="1"
                value={batchSize}
                onChange={e => onBatchSizeChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-transparent border-0 font-bold text-ink focus:outline-none p-0 text-sm"
              />
              <span className="text-[11px] font-medium text-faint ml-2 select-none">Siswa</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {fields.map(field => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-muted">{field.label}</label>
            <div className="flex items-center bg-fill border border-line-strong hover:border-faint focus-within:ring-2 focus-within:ring-brand/40 focus-within:bg-surface focus-within:border-brand rounded overflow-hidden transition w-full">
              <button
                type="button"
                aria-label={`Kurangi ${field.label}`}
                onClick={() => handleStep(field.id as keyof NutritionTargets, false)}
                className="px-3 py-2.5 text-faint hover:text-ink hover:bg-line/60 transition cursor-pointer select-none flex items-center justify-center"
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
                className="w-full text-center bg-transparent border-0 text-ink text-sm font-bold focus:outline-none focus:ring-0 p-0 font-mono"
              />
              <span className="text-[11px] font-medium text-faint px-2 select-none">{field.unit}</span>
              <button
                type="button"
                aria-label={`Tambah ${field.label}`}
                onClick={() => handleStep(field.id as keyof NutritionTargets, true)}
                className="px-3 py-2.5 text-faint hover:text-ink hover:bg-line/60 transition cursor-pointer select-none flex items-center justify-center"
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
