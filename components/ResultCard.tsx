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
      <div className="bg-white rounded-2xl p-8 shadow-2xs text-center min-h-[220px] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-800 font-bold text-sm">Menghitung Solusi Optimal...</p>
        <p className="text-slate-500 text-xs mt-1">Menjalankan iterasi metode Simpleks Big-M</p>
      </div>
    );
  }

  if (!result) return null;

  const { optimal, infeasible, unbounded, solution, totalCost, nutritionMet } = result;

  if (infeasible) {
    return (
      <div className="bg-rose-100 rounded-2xl p-6">
        <div className="space-y-3">
          <h3 className="font-extrabold text-rose-950 text-base leading-tight">Solusi Tidak Layak (Infeasible)</h3>
          <p className="text-rose-900 text-xs leading-relaxed">
            Tidak ditemukan kombinasi bahan makanan yang dapat memenuhi seluruh target gizi minimum dengan bahan makanan yang tersedia saat ini.
          </p>
          <div className="p-4 bg-white rounded-xl text-xs text-slate-700 space-y-2">
            <p className="font-bold text-slate-800">Saran Solusi:</p>
            <p>• Turunkan target gizi minimum (misal target kalori/protein).</p>
            <p>• Tambahkan bahan makanan baru dengan kandungan gizi yang lebih tinggi ke dalam daftar.</p>
          </div>
        </div>
      </div>
    );
  }

  if (unbounded) {
    return (
      <div className="bg-amber-100 rounded-2xl p-6">
        <div className="space-y-3">
          <h3 className="font-extrabold text-amber-950 text-base leading-tight">Solusi Tidak Terbatas (Unbounded)</h3>
          <p className="text-amber-900 text-xs leading-relaxed">
            Fungsi tujuan tidak terbatas. Solusi optimal tidak dapat ditentukan karena nilai minimal menuju negatif tak terhingga.
          </p>
          <div className="p-4 bg-white rounded-xl text-xs text-slate-700">
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
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
        Terpenuhi
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
        Belum Terpenuhi
      </span>
    );
  };

  const nutritionData = [
    { 
      label: 'Kalori', 
      achieved: nutritionMet.calories, 
      target: targets.calories, 
      unit: 'kkal', 
      color: 'bg-orange-600', 
      bgClass: 'bg-orange-100',
      labelColor: 'text-orange-950',
      numColor: 'text-orange-950'
    },
    { 
      label: 'Protein', 
      achieved: nutritionMet.protein, 
      target: targets.protein, 
      unit: 'g', 
      color: 'bg-rose-600', 
      bgClass: 'bg-rose-100',
      labelColor: 'text-rose-950',
      numColor: 'text-rose-950'
    },
    { 
      label: 'Lemak', 
      achieved: nutritionMet.fat, 
      target: targets.fat, 
      unit: 'g', 
      color: 'bg-amber-600', 
      bgClass: 'bg-amber-100',
      labelColor: 'text-amber-950',
      numColor: 'text-amber-950'
    },
    { 
      label: 'Karbohidrat', 
      achieved: nutritionMet.carbs, 
      target: targets.carbs, 
      unit: 'g', 
      color: 'bg-teal-600', 
      bgClass: 'bg-teal-100',
      labelColor: 'text-teal-950',
      numColor: 'text-teal-950'
    },
  ];

  const displayCost = isBatch ? totalCost * size : totalCost;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-2xs flex flex-col justify-between border-2 border-slate-200">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base leading-tight">
                {isBatch ? `Rekomendasi Menu Optimal (Batch: ${size} Siswa)` : 'Rekomendasi Menu Optimal'}
              </h3>
            </div>
            <span className="text-xs font-black text-emerald-700 tracking-wider uppercase">
              Optimal
            </span>
          </div>

          <div className="space-y-3 mb-6">
            {recommendedFoods.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-indigo-50/70 rounded-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex flex-col items-center justify-center font-black leading-none shadow-xs">
                    <span className="text-[10px]">{item.portion}x</span>
                    {isBatch && <span className="text-[7px] text-indigo-200 mt-0.5">/{size}</span>}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs leading-none">{item.food.name}</h4>
                    <p className="text-slate-500 text-[10px] mt-1.5 font-semibold">
                      {isBatch
                        ? `Total: ${item.batchPortion}x porsi • Rp ${item.food.price.toLocaleString('id-ID')}/unit`
                        : `Harga/unit: Rp ${item.food.price.toLocaleString('id-ID')}`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col">
                  <span className="font-extrabold text-indigo-950 text-xs font-mono">
                    Rp {Math.round(isBatch ? item.batchCost : item.cost).toLocaleString('id-ID')}
                  </span>
                  {isBatch && (
                    <span className="text-[9px] text-slate-400 font-bold font-mono">
                      (Rp {Math.round(item.cost).toLocaleString('id-ID')} / siswa)
                    </span>
                  )}
                </div>
              </div>
            ))}

            {recommendedFoods.length === 0 && (
              <p className="text-slate-400 text-xs text-center py-6 font-semibold">Semua porsi 0.</p>
            )}

            {isBatch && recommendedFoods.length > 0 && (
              <div className="mt-4 p-4.5 bg-indigo-50/40 rounded-xl border-2 border-indigo-200 text-xs text-indigo-950 space-y-2">
                <h4 className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-650 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Detail Belanja Bahan (Batch: {size} Siswa)
                </h4>
                <p className="text-slate-600 font-semibold leading-relaxed text-[11px]">
                  Untuk menyajikan menu makan kepada {size} siswa, total kuantitas bahan makanan yang perlu dibeli adalah:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {recommendedFoods.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-white rounded-lg border-2 border-slate-200 font-semibold text-[11px]">
                      <span className="text-slate-700">{item.food.name}</span>
                      <span className="font-bold text-indigo-650 font-mono">{item.batchPortion}x Unit</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t-2 border-slate-250 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {isBatch ? `Total Pengeluaran (${size} Siswa)` : 'Total Pengeluaran'}
            </span>
            <div className="flex items-center gap-3.5 flex-wrap mt-1">
              <span className="text-2xl font-extrabold text-indigo-700 tracking-tight font-mono leading-none">
                Rp {Math.round(displayCost).toLocaleString('id-ID')}
              </span>
              {isBatch && (
                <span className="text-xs font-bold text-slate-500 font-mono">
                  (Rp {Math.round(totalCost).toLocaleString('id-ID')} / siswa)
                </span>
              )}
              {maxBudget > 0 && (
                totalCost <= maxBudget ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border-2 border-emerald-400 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Sesuai Anggaran
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border-2 border-rose-400 select-none">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                    </span>
                    Lebih Rp {Math.round(totalCost - maxBudget).toLocaleString('id-ID')}
                  </span>
                )
              )}
            </div>
          </div>
          {maxBudget > 0 && (
            <div className="text-right sm:block hidden">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Batas Anggaran / Siswa</span>
              <span className="text-xs font-extrabold text-slate-500 font-mono">
                Rp {maxBudget.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-2xs flex flex-col justify-between border-2 border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base leading-tight">Analisis Pemenuhan Gizi</h3>
            </div>
          </div>

          <div className="space-y-4">
            {nutritionData.map((nut, idx) => {
              const percent = getPercent(nut.achieved, nut.target);

              return (
                <div key={idx} className={`rounded-xl p-3.5 ${nut.bgClass}`}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-extrabold">{nut.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-extrabold font-mono ${nut.numColor}`}>
                        {nut.achieved} / {nut.target} {nut.unit}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${nut.color} transition-all duration-700`}
                        style={{ width: `${percent}%` }}
                      />
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
