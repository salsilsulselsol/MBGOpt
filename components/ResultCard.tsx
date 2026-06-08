import React from 'react';
import { SimplexResult, FoodItem, NutritionTargets } from '@/lib/simplex';

interface ResultCardProps {
  result: SimplexResult | null;
  foods: FoodItem[];
  targets: NutritionTargets;
  loading: boolean;
  maxBudget?: number;
  portionType?: 'single' | 'batch';
  batchSize?: number;
}

export default function ResultCard({
  result,
  foods,
  targets,
  loading,
  maxBudget = 0,
  portionType = 'single',
  batchSize = 60,
}: ResultCardProps) {
  if (loading) {
    return (
      <div className="bg-surface rounded-md p-8 border border-line text-center min-h-[220px] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-soft border-t-brand rounded-full animate-spin"></div>
        </div>
        <p className="text-ink font-semibold text-sm">Menghitung Solusi Optimal…</p>
        <p className="text-muted text-xs mt-1">Menjalankan iterasi Metode Simpleks Big-M</p>
      </div>
    );
  }

  if (!result) return null;

  const { infeasible, unbounded, solution, totalCost, nutritionMet } = result;

  if (infeasible) {
    return (
      <div className="bg-brand-soft rounded-md p-6 border border-brand/25">
        <div className="space-y-3">
          <h3 className="font-bold text-brand-dark text-base leading-tight">Solusi Tidak Layak (Infeasible)</h3>
          <p className="text-brand-dark/90 text-xs leading-relaxed">
            Tidak ditemukan kombinasi bahan makanan yang dapat memenuhi seluruh target gizi minimum dengan bahan makanan yang tersedia saat ini.
          </p>
          <div className="p-4 bg-surface rounded text-xs text-muted space-y-2 border border-line">
            <p className="font-semibold text-ink">Saran Solusi:</p>
            <p>• Turunkan target gizi minimum (misal target kalori/protein).</p>
            <p>• Tambahkan bahan makanan baru dengan kandungan gizi yang lebih tinggi ke dalam daftar.</p>
            {maxBudget > 0 && <p>• Naikkan batas Anggaran Maks — biaya menu termurah mungkin melebihi anggaran saat ini.</p>}
          </div>
        </div>
      </div>
    );
  }

  if (unbounded) {
    return (
      <div className="bg-gold-soft rounded-md p-6 border border-gold/30">
        <div className="space-y-3">
          <h3 className="font-bold text-gold text-base leading-tight">Solusi Tidak Terbatas (Unbounded)</h3>
          <p className="text-ink/80 text-xs leading-relaxed">
            Fungsi tujuan tidak terbatas. Solusi optimal tidak dapat ditentukan karena nilai minimal menuju negatif tak terhingga.
          </p>
          <div className="p-4 bg-surface rounded text-xs text-muted border border-line">
            <p>Periksa kembali harga bahan makanan pada daftar input (harga tidak boleh bernilai 0 atau negatif).</p>
          </div>
        </div>
      </div>
    );
  }

  const isBatch = portionType === 'batch';
  const size = batchSize;

  const recommendedFoods = foods
    .map((food, idx) => {
      const portion = solution[`x${idx + 1}`] || 0;
      return {
        food,
        portion: Math.round(portion * 100) / 100,
        batchPortion: Math.round(portion * size * 100) / 100,
        cost: portion * food.price,
        batchCost: portion * food.price * size,
      };
    })
    .filter(item => item.portion > 0);

  const getPercent = (achieved: number, target: number) => {
    if (target <= 0) return 100;
    return Math.min(100, (achieved / target) * 100);
  };

  const getStatusBadge = (achieved: number, target: number) => {
    return achieved >= target ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-good text-white">
        Terpenuhi
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-brand text-white">
        Belum Terpenuhi
      </span>
    );
  };

  const nutritionData = [
    { label: 'Kalori', achieved: nutritionMet.calories, target: targets.calories, unit: 'kkal', color: 'bg-orange-500', bgClass: 'bg-orange-50', numColor: 'text-orange-900' },
    { label: 'Protein', achieved: nutritionMet.protein, target: targets.protein, unit: 'g', color: 'bg-rose-500', bgClass: 'bg-rose-50', numColor: 'text-rose-900' },
    { label: 'Lemak', achieved: nutritionMet.fat, target: targets.fat, unit: 'g', color: 'bg-amber-500', bgClass: 'bg-amber-50', numColor: 'text-amber-900' },
    { label: 'Karbohidrat', achieved: nutritionMet.carbs, target: targets.carbs, unit: 'g', color: 'bg-teal-500', bgClass: 'bg-teal-50', numColor: 'text-teal-900' },
  ];

  const displayCost = isBatch ? totalCost * size : totalCost;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-surface rounded-md p-6 border border-line flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-ink text-base leading-tight">
              {isBatch ? `Rekomendasi Menu Optimal (Batch: ${size} Siswa)` : 'Rekomendasi Menu Optimal'}
            </h3>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase tracking-wide bg-gold-soft border border-gold/30 rounded px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              Optimal
            </span>
          </div>

          <div className="space-y-3 mb-6">
            {recommendedFoods.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-fill rounded border border-line">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded bg-brand text-white flex flex-col items-center justify-center font-bold leading-none">
                    <span className="text-[10px] font-mono">{item.portion}x</span>
                    {isBatch && <span className="text-[7px] text-white/70 mt-0.5">/{size}</span>}
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink text-xs leading-none">{item.food.name}</h4>
                    <p className="text-muted text-[10px] mt-1.5 font-medium">
                      {isBatch
                        ? `Total: ${item.batchPortion}x porsi • Rp ${item.food.price.toLocaleString('id-ID')}/unit`
                        : `Harga/unit: Rp ${item.food.price.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col">
                  <span className="font-bold text-ink text-xs font-mono">
                    Rp {Math.round(isBatch ? item.batchCost : item.cost).toLocaleString('id-ID')}
                  </span>
                  {isBatch && (
                    <span className="text-[9px] text-faint font-medium font-mono">
                      (Rp {Math.round(item.cost).toLocaleString('id-ID')} / siswa)
                    </span>
                  )}
                </div>
              </div>
            ))}

            {recommendedFoods.length === 0 && (
              <p className="text-faint text-xs text-center py-6 font-medium">Semua porsi 0.</p>
            )}

            {isBatch && recommendedFoods.length > 0 && (
              <div className="mt-4 p-4 bg-brand-soft/50 rounded border border-brand/20 text-xs text-ink space-y-2">
                <h4 className="font-bold text-brand-dark flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Detail Belanja Bahan (Batch: {size} Siswa)
                </h4>
                <p className="text-muted font-medium leading-relaxed text-[11px]">
                  Untuk menyajikan menu makan kepada {size} siswa, total kuantitas bahan makanan yang perlu dibeli adalah:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {recommendedFoods.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-surface rounded border border-line font-medium text-[11px]">
                      <span className="text-muted">{item.food.name}</span>
                      <span className="font-bold text-brand font-mono">{item.batchPortion}x Unit</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-line pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
          <div>
            <span className="text-[10px] text-faint font-semibold uppercase tracking-wide block">
              {isBatch ? `Total Pengeluaran (${size} Siswa)` : 'Total Pengeluaran'}
            </span>
            <div className="flex items-center gap-3.5 flex-wrap mt-1">
              <span className="text-2xl font-extrabold text-brand tracking-tight font-mono leading-none">
                Rp {Math.round(displayCost).toLocaleString('id-ID')}
              </span>
              {isBatch && (
                <span className="text-xs font-semibold text-muted font-mono">
                  (Rp {Math.round(totalCost).toLocaleString('id-ID')} / siswa)
                </span>
              )}
              {maxBudget > 0 &&
                (totalCost <= maxBudget ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-good-soft text-good border border-good/30 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-good"></span>
                    Sesuai Anggaran
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-brand-soft text-brand border border-brand/30 select-none">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand"></span>
                    </span>
                    Lebih Rp {Math.round(totalCost - maxBudget).toLocaleString('id-ID')}
                  </span>
                ))}
            </div>
          </div>
          {maxBudget > 0 && (
            <div className="text-right sm:block hidden">
              <span className="text-[9px] text-faint font-semibold uppercase tracking-wide block">Batas Anggaran / Siswa</span>
              <span className="text-xs font-bold text-muted font-mono">Rp {maxBudget.toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 bg-surface rounded-md p-6 border border-line flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-ink text-base leading-tight mb-6">Analisis Pemenuhan Gizi</h3>

          <div className="space-y-4">
            {nutritionData.map((nut, idx) => {
              const percent = getPercent(nut.achieved, nut.target);

              return (
                <div key={idx} className={`rounded p-3.5 ${nut.bgClass} border border-line`}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-ink">{nut.label}</span>
                    <span className={`font-bold font-mono ${nut.numColor}`}>
                      {nut.achieved} / {nut.target} {nut.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${nut.color} transition-all duration-700`} style={{ width: `${percent}%` }} />
                    </div>
                    {getStatusBadge(nut.achieved, nut.target)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
