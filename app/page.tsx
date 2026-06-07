'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FoodItem, NutritionTargets, SimplexResult } from '@/lib/simplex';
import NutritionGoals from '@/components/NutritionGoals';
import FoodTable from '@/components/FoodTable';
import ResultCard from '@/components/ResultCard';
import SimplexTable from '@/components/SimplexTable';
import SensitivityPanel from '@/components/SensitivityPanel';

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
  const [maxBudget, setMaxBudget] = useState<number>(0);
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
        body: JSON.stringify({ foods, targets, maxBudget }),
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
    <div className="bg-paper text-ink lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-brand-soft selection:text-brand-dark">

      {/* Official civic masthead */}
      <header className="sticky top-0 z-50 bg-surface border-b border-line-strong shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {/* Merah-putih accent stripe */}
        <div className="h-1 w-full bg-brand" />
        <div className={`flex items-center transition-all duration-500 ease-in-out px-6 sm:px-10 ${
          isCollapsed ? 'py-3' : 'py-6'
        }`}>
          <div className="w-full flex items-center gap-4">
            {/* Emblem mark */}
            <div className={`flex-shrink-0 rounded-md bg-brand text-white grid place-items-center transition-all duration-500 ${
              isCollapsed ? 'w-9 h-9' : 'w-12 h-12'
            }`}>
              <svg className={`transition-all duration-500 ${isCollapsed ? 'w-5 h-5' : 'w-6 h-6'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12.5h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z" />
                <path d="M7 9c0-1 .7-1.6.7-2.6S7 4 7 4M12 9c0-1 .7-1.6.7-2.6S12 4 12 4M17 9c0-1 .7-1.6.7-2.6S17 4 17 4" />
              </svg>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className={`font-extrabold tracking-tight text-ink transition-all duration-500 leading-none ${
                  isCollapsed ? 'text-base' : 'text-xl sm:text-2xl'
                }`}>
                  MBG Optimizer
                </h1>
                <span className="text-[10px] text-brand font-bold tracking-wide uppercase border-l border-line-strong pl-3">
                  Metode Simpleks Big-M
                </span>
              </div>
              {!isCollapsed && (
                <p className="text-muted text-xs sm:text-[13px] mt-1.5 max-w-3xl leading-relaxed">
                  Optimasi komposisi bahan makanan program Makan Bergizi Gratis — biaya seminimal mungkin, kebutuhan gizi tetap terpenuhi.
                </p>
              )}
            </div>
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
                className="flex-1 py-3 bg-surface hover:bg-fill border border-line-strong text-muted font-semibold rounded-md transition active:scale-[0.98] cursor-pointer text-center text-xs"
              >
                Reset Data
              </button>
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="flex-[2.5] py-3 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold rounded-md shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Sedang Menghitung...
                  </>
                ) : (
                  "Mulai Optimasi Menu"
                )}
              </button>
            </div>
            <span className="text-[10px] text-faint font-medium text-center">
              Solusi optimal dihitung otomatis menggunakan Metode Simpleks Big-M
            </span>
          </div>

          {/* Footer */}
          <footer className="py-4 text-center text-[10px] text-faint font-medium mt-auto">
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
            <div role="alert" className="bg-brand-soft border border-brand/25 rounded-md p-4 text-brand-dark text-xs font-semibold flex items-center gap-3">
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

              {/* Sensitivity / What-If analysis (post-optimality) */}
              {result.optimal && (
                <SensitivityPanel foods={foods} baseTargets={targets} maxBudget={maxBudget} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
