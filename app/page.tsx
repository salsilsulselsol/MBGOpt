'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FoodItem, NutritionTargets, SimplexResult } from '@/lib/simplex';
import NutritionGoals from '@/components/NutritionGoals';
import FoodTable from '@/components/FoodTable';
import ResultCard from '@/components/ResultCard';
import SimplexTable from '@/components/SimplexTable';

const DEFAULT_FOODS: FoodItem[] = [
  { id: '1', name: 'Nasi Putih (100g)', calories: 130, protein: 2.7, fat: 0.3, carbs: 28.2, price: 1500 },
  { id: '2', name: 'Ayam Goreng (50g)', calories: 130, protein: 12.0, fat: 7.5, carbs: 0.5, price: 5000 },
  { id: '3', name: 'Telur Rebus (1 btr)', calories: 77, protein: 6.3, fat: 5.3, carbs: 0.6, price: 2000 },
  { id: '4', name: 'Tahu Goreng (50g)', calories: 76, protein: 5.5, fat: 4.8, carbs: 1.9, price: 1000 },
  { id: '5', name: 'Tempe Goreng (50g)', calories: 99, protein: 9.4, fat: 4.0, carbs: 8.5, price: 1200 },
  { id: '6', name: 'Sayur Sop (100g)', calories: 45, protein: 1.5, fat: 1.0, carbs: 8.0, price: 1500 },
  { id: '7', name: 'Pisang Ambon (1 bh)', calories: 92, protein: 1.2, fat: 0.2, carbs: 22.4, price: 2000 },
  { id: '8', name: 'Susu UHT (200ml)', calories: 120, protein: 6.0, fat: 6.0, carbs: 9.0, price: 3000 },
];

const DEFAULT_TARGETS: NutritionTargets = {
  calories: 650,
  protein: 20,
  fat: 15,
  carbs: 65,
};

export default function Home() {
  const [foods, setFoods] = useState<FoodItem[]>(DEFAULT_FOODS);
  const [targets, setTargets] = useState<NutritionTargets>(DEFAULT_TARGETS);
  const [maxBudget, setMaxBudget] = useState<number>(20000);
  const [result, setResult] = useState<SimplexResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasOptimized, setHasOptimized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [portionType, setPortionType] = useState<'single' | 'batch'>('single');
  const [batchSize, setBatchSize] = useState<number>(60);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target;
      if (!target) return;
      if (target === document || target === document.documentElement || target === document.body) {
        setIsCollapsed(window.scrollY > 50);
      } else {
        const element = target as HTMLElement;
        if (element.scrollTop !== undefined) {
          setIsCollapsed(element.scrollTop > 50);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

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
    setFoods([]);
    setTargets({
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    });
    setMaxBudget(0);
    setPortionType('single');
    setBatchSize(60);
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
      if (data.error) {
        setError(data.error);
        setHasOptimized(false);
      } else {
        setResult(data);
        setHasOptimized(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan tidak terduga.');
    } finally {
      setLoading(false);
    }
  };

  const showRightPanel = hasOptimized || loading || !!error;

  return (
    <div className="bg-[#f1f5f9] text-slate-800 lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Dynamic Header / Landing Hero */}
      <header className={`sticky top-0 z-50 bg-gradient-to-r from-indigo-700 via-indigo-850 to-indigo-950 text-white transition-all duration-500 ease-in-out shadow-md border-b-2 border-indigo-900 flex items-center ${
        isCollapsed ? 'py-3.5 px-6' : 'py-10 px-6 sm:px-10'
      }`}>
        <div className="w-full flex flex-col justify-center">
          <div className="flex items-center">
            <h1 className={`font-black tracking-tight text-white transition-all duration-500 leading-none ${
              isCollapsed ? 'text-sm' : 'text-2xl sm:text-3xl'
            }`}>
              MBG Optimizer
            </h1>
            {isCollapsed && (
              <span className="text-[10px] text-indigo-200 font-extrabold tracking-wider uppercase ml-3 border-l border-indigo-600 pl-3 animate-in fade-in duration-300">
                Metode Simpleks Big-M
              </span>
            )}
          </div>
          
          {!isCollapsed && (
            <p className="text-indigo-150 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300 font-semibold">
              Aplikasi ini membantu menentukan kombinasi bahan makanan dengan biaya seminimal mungkin namun tetap memenuhi seluruh kebutuhan gizi minimum yang dipersyaratkan.
            </p>
          )}
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

          {/* Configuration Input */}
          <div className="space-y-6">
            {/* Nutrition Targets Section */}
            <NutritionGoals
              targets={targets}
              onChange={setTargets}
              maxBudget={maxBudget}
              onBudgetChange={setMaxBudget}
              portionType={portionType}
              onPortionTypeChange={setPortionType}
              batchSize={batchSize}
              onBatchSizeChange={setBatchSize}
            />

            {/* Food Manager Table Section */}
            <FoodTable
              foods={foods}
              onAdd={handleAddFood}
              onEdit={handleEditFood}
              onDelete={handleDeleteFood}
            />
          </div>

          {/* Optimization & Action Button Panel */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-3 w-full">
              <button
                onClick={handleReset}
                className="flex-1 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 font-black rounded-xl shadow-xs transition active:scale-97 cursor-pointer text-center text-xs"
              >
                Reset Data
              </button>
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="flex-[2.5] py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-xl shadow-xs transition active:scale-97 cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Sedang Menghitung...
                  </>
                ) : (
                  "Mulai Optimasi Menu"
                )}
              </button>
            </div>
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
              <ResultCard 
                result={null} 
                foods={foods} 
                targets={targets} 
                loading={true} 
                maxBudget={maxBudget} 
                portionType={portionType}
                batchSize={batchSize}
              />
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
              <ResultCard 
                result={result} 
                foods={foods} 
                targets={targets} 
                loading={false} 
                maxBudget={maxBudget} 
                portionType={portionType}
                batchSize={batchSize}
              />

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
