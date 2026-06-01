'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FoodItem, NutritionTargets, SimplexResult } from '@/lib/simplex';
import NutritionGoals from '@/components/NutritionGoals';
import FoodTable from '@/components/FoodTable';
import ResultCard from '@/components/ResultCard';
import SimplexTable from '@/components/SimplexTable';

const DEFAULT_FOODS: FoodItem[] = [
  { id: '1', name: 'Nasi Putih (100g)', calories: 130, protein: 2.7, fat: 0.3, carbs: 28.2, price: 2000 },
  { id: '2', name: 'Ayam Goreng (50g)', calories: 120, protein: 10.5, fat: 8.1, carbs: 0, price: 8000 },
  { id: '3', name: 'Telur Rebus (1 btr)', calories: 77, protein: 6.3, fat: 5.3, carbs: 0.6, price: 2500 },
  { id: '4', name: 'Tahu Goreng (50g)', calories: 76, protein: 5.5, fat: 4.8, carbs: 1.9, price: 1500 },
  { id: '5', name: 'Tempe Goreng (50g)', calories: 99, protein: 9.4, fat: 4.0, carbs: 8.5, price: 1500 },
  { id: '6', name: 'Sayur Bayam (100g)', calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, price: 1000 },
];

const DEFAULT_TARGETS: NutritionTargets = {
  calories: 600,
  protein: 15,
  fat: 10,
  carbs: 50,
};

export default function Home() {
  const [foods, setFoods] = useState<FoodItem[]>(DEFAULT_FOODS);
  const [targets, setTargets] = useState<NutritionTargets>(DEFAULT_TARGETS);
  const [maxBudget, setMaxBudget] = useState<number>(15000);
  const [result, setResult] = useState<SimplexResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasOptimized, setHasOptimized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll/adjust panel scroll when result is ready and loading is complete
  useEffect(() => {
    if (hasOptimized && result && !loading) {
      const scrollTimer = setTimeout(() => {
        if (window.innerWidth < 1024) {
          resultRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        } else {
          rightPanelRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [result, loading, hasOptimized]);

  const handleAddFood = (newFood: Omit<FoodItem, 'id'>) => {
    const id = (Math.random() * 100000).toFixed(0);
    setFoods(prev => [...prev, { ...newFood, id }]);
  };

  const handleEditFood = (id: string, updatedFood: Partial<FoodItem>) => {
    setFoods(prev =>
      prev.map(food => (food.id === id ? { ...food, ...updatedFood } : food))
    );
  };

  const handleDeleteFood = (id: string) => {
    setFoods(prev => prev.filter(food => food.id !== id));
  };

  const handleReset = () => {
    setFoods(DEFAULT_FOODS);
    setTargets(DEFAULT_TARGETS);
    setResult(null);
    setHasOptimized(false);
    setError(null);
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    setHasOptimized(false); // Hide the old result section during a new load
    
    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ foods, targets }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal melakukan perhitungan optimasi.');
      }

      const data = (await response.json()) as SimplexResult;
      setResult(data);
      setHasOptimized(true);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan tidak terduga.');
    } finally {
      setLoading(false);
    }
  };

  const showRightPanel = hasOptimized || loading || !!error;

  return (
    <div className="bg-[#f1f5f9] text-slate-800 lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-45 shadow-2xs">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-indigo-600 text-white font-black text-base shadow-xs">
              M
            </span>
            <div>
              <h1 className="text-sm font-black text-slate-800 leading-none tracking-tight">MBG Optimizer</h1>
              <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">Metode Simpleks Big-M</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-lg px-3.5 py-2 transition cursor-pointer"
            >
              Reset Data
            </button>
            <button
              onClick={handleOptimize}
              disabled={loading}
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg px-4.5 py-2 shadow-xs transition active:scale-97 cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Sedang Menghitung...
                </>
              ) : (
                "Optimalkan Menu"
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-grow min-h-0 flex flex-col lg:flex-row gap-6 lg:px-6 px-4 mt-6 pb-6 overflow-y-auto lg:overflow-hidden relative">
        
        {/* LEFT COLUMN: Input & Settings */}
        <div className={`flex flex-col gap-6 lg:overflow-y-auto lg:h-full lg:pr-2 pb-6 transition-all duration-550 ease-in-out ${
          showRightPanel 
            ? 'w-full lg:w-[40%]' 
            : 'w-full'
        }`}>
          
          {/* Simple Page Header / Hero */}
          <section className="space-y-2 py-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
              Optimasi Menu Makan Bergizi Gratis (MBG)
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              Aplikasi ini membantu menentukan kombinasi bahan makanan dengan biaya seminimal mungkin namun tetap memenuhi seluruh kebutuhan gizi minimum yang dipersyaratkan.
            </p>
          </section>

          {/* Configuration Input */}
          <div className="space-y-6">
            {/* Nutrition Targets Section */}
            <NutritionGoals
              targets={targets}
              onChange={setTargets}
              maxBudget={maxBudget}
              onBudgetChange={setMaxBudget}
            />

            {/* Food Manager Table Section */}
            <FoodTable
              foods={foods}
              onAdd={handleAddFood}
              onEdit={handleEditFood}
              onDelete={handleDeleteFood}
            />
          </div>

          {/* Optimization Button Panel */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleOptimize}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs transition active:scale-97 cursor-pointer flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Sedang Menghitung Solusi...
                </>
              ) : (
                "Mulai Optimasi Menu"
              )}
            </button>
            <span className="text-[9.5px] text-slate-400 font-bold text-center">
              Solusi optimal dihitung otomatis menggunakan Metode Simpleks Big-M
            </span>
          </div>

          {/* Footer */}
          <footer className="py-4 text-center text-[9px] text-slate-400 font-bold mt-auto">
            <p>Optimasi Menu MBG — Metode Simpleks Big-M</p>
          </footer>
        </div>

        {/* RIGHT COLUMN: Results & Solusi */}
        <div 
          ref={rightPanelRef}
          className={`flex flex-col gap-6 lg:overflow-y-auto lg:h-full lg:pl-2 mt-8 lg:mt-0 transition-all duration-550 ease-in-out ${
            showRightPanel 
              ? 'w-full lg:w-[60%] opacity-100 pointer-events-auto translate-x-0' 
              : 'w-0 h-0 lg:w-0 lg:h-auto opacity-0 pointer-events-none translate-x-12 overflow-hidden mt-0 lg:mt-0 p-0'
          }`}
        >
          {/* Loading placeholder block (while executing optimization) */}
          {loading && (
            <div className="animate-pulse">
              <ResultCard result={null} foods={foods} targets={targets} loading={true} maxBudget={maxBudget} />
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="bg-rose-100 rounded-xl p-4 text-rose-900 text-xs font-bold flex items-center gap-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {/* Results Overview & Simplex Iterations */}
          {hasOptimized && result && !loading && (
            <div className="space-y-6" ref={resultRef}>
              {/* Results Overview */}
              <ResultCard result={result} foods={foods} targets={targets} loading={false} maxBudget={maxBudget} />

              {/* Simplex Iterations step breakdown */}
              {result.iterations && result.iterations.length > 0 && (
                <SimplexTable iterations={result.iterations} foods={foods} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
