export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  price: number;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface SimplexIteration {
  iterationIndex: number;
  tableau: number[][];
  basis: string[];
  headers: string[];
  pivotRow: number | null;
  pivotCol: number | null;
  enteringVar: string | null;
  leavingVar: string | null;
  ratios: (number | null)[];
}

export interface SimplexResult {
  optimal: boolean;
  infeasible: boolean;
  unbounded: boolean;
  iterations: SimplexIteration[];
  solution: Record<string, number>;
  totalCost: number;
  nutritionMet: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  error?: string;
}

const M = 1000000; // Big-M value for penalties

export function solveSimplex(foods: FoodItem[], targets: NutritionTargets): SimplexResult {
  // 1. Input Validation and Sanitization
  if (!foods || foods.length === 0) {
    return {
      optimal: false,
      infeasible: false,
      unbounded: false,
      iterations: [],
      solution: {},
      totalCost: 0,
      nutritionMet: { calories: 0, protein: 0, fat: 0, carbs: 0 },
      error: 'Daftar bahan makanan tidak boleh kosong.',
    };
  }

  // Sanitize targets to be non-negative
  const sanitizedTargets: NutritionTargets = {
    calories: Math.max(0, targets.calories),
    protein: Math.max(0, targets.protein),
    fat: Math.max(0, targets.fat),
    carbs: Math.max(0, targets.carbs),
  };

  // Sanitize foods to be non-negative
  const sanitizedFoods = foods.map(food => ({
    ...food,
    calories: Math.max(0, food.calories),
    protein: Math.max(0, food.protein),
    fat: Math.max(0, food.fat),
    carbs: Math.max(0, food.carbs),
    price: Math.max(0, food.price),
  }));

  // Check if all sanitized prices are 0 while some targets are > 0
  const allPricesZero = sanitizedFoods.every(f => f.price === 0);
  const hasPositiveTarget = Object.values(sanitizedTargets).some(t => t > 0);
  if (allPricesZero && hasPositiveTarget) {
    return {
      optimal: false,
      infeasible: false,
      unbounded: false,
      iterations: [],
      solution: {},
      totalCost: 0,
      nutritionMet: { calories: 0, protein: 0, fat: 0, carbs: 0 },
      error: 'Harga semua bahan makanan tidak boleh nol jika target gizi lebih besar dari nol.',
    };
  }

  const numFoods = sanitizedFoods.length;
  const numConstraints = 4;

  // Nutrient targets in order
  const targetValues = [
    sanitizedTargets.calories,
    sanitizedTargets.protein,
    sanitizedTargets.fat,
    sanitizedTargets.carbs,
  ];

  const targetNames = ['Kalori', 'Protein', 'Lemak', 'Karbohidrat'];

  // Setup variable headers
  const decisionVars = sanitizedFoods.map((_, i) => `x${i + 1}`);
  const surplusVars = Array.from({ length: numConstraints }, (_, i) => `s${i + 1}`);
  const artificialVars = Array.from({ length: numConstraints }, (_, i) => `a${i + 1}`);

  const headers = [...decisionVars, ...surplusVars, ...artificialVars, 'RHS'];

  const numCols = numFoods + 2 * numConstraints + 1;
  const numRows = numConstraints + 1;

  const tableau: number[][] = Array.from({ length: numRows }, () => Array(numCols).fill(0));
  const basis: string[] = Array(numRows).fill('');
  basis[0] = 'W';

  // Fill constraint rows (Row 1 to m)
  for (let i = 0; i < numConstraints; i++) {
    const rowIdx = i + 1;
    for (let j = 0; j < numFoods; j++) {
      const food = sanitizedFoods[j];
      let val = 0;
      if (i === 0) val = food.calories;
      else if (i === 1) val = food.protein;
      else if (i === 2) val = food.fat;
      else if (i === 3) val = food.carbs;
      tableau[rowIdx][j] = val;
    }

    tableau[rowIdx][numFoods + i] = -1;
    tableau[rowIdx][numFoods + numConstraints + i] = 1;
    tableau[rowIdx][numCols - 1] = targetValues[i];
    basis[rowIdx] = artificialVars[i];
  }

  // Fill Row 0
  for (let j = 0; j < numFoods; j++) {
    tableau[0][j] = sanitizedFoods[j].price;
  }
  for (let i = 0; i < numConstraints; i++) {
    tableau[0][numFoods + numConstraints + i] = M;
  }
  tableau[0][numCols - 1] = 0;

  // Eliminate artificial variables from Row 0
  for (let i = 0; i < numConstraints; i++) {
    const rowIdx = i + 1;
    for (let col = 0; col < numCols; col++) {
      tableau[0][col] -= M * tableau[rowIdx][col];
    }
  }

  const iterations: SimplexIteration[] = [];
  let currentTableau = tableau.map(row => [...row]);
  let currentBasis = [...basis];

  let iterationCount = 0;
  const maxIterations = 100;
  let optimal = false;
  let unbounded = false;
  let useBlandsRule = false;
  const visitedBases = new Set<string>();

  const cloneTableau = (t: number[][]) => t.map(row => [...row]);

  while (iterationCount < maxIterations) {
    const iter: SimplexIteration = {
      iterationIndex: iterationCount,
      tableau: cloneTableau(currentTableau),
      basis: [...currentBasis],
      headers: [...headers],
      pivotRow: null,
      pivotCol: null,
      enteringVar: null,
      leavingVar: null,
      ratios: Array(numConstraints).fill(null),
    };

    // Cycle detection: track set of basic variables
    const basisKey = currentBasis.slice(1).sort().join(',');
    if (visitedBases.has(basisKey)) {
      useBlandsRule = true; // Switch to Bland's rule to break cycling
    }
    visitedBases.add(basisKey);

    // 1. Find Entering Variable (Pivot Column)
    let pivotCol = -1;

    if (useBlandsRule) {
      // Bland's Rule: Choose the first column with negative coefficient
      for (let col = 0; col < numCols - 1; col++) {
        if (currentTableau[0][col] < -1e-9) {
          pivotCol = col;
          break;
        }
      }
    } else {
      // Dantzig's Rule: Choose the most negative coefficient
      let minVal = -1e-9;
      for (let col = 0; col < numCols - 1; col++) {
        if (currentTableau[0][col] < minVal) {
          minVal = currentTableau[0][col];
          pivotCol = col;
        }
      }
    }

    if (pivotCol === -1) {
      optimal = true;
      iterations.push(iter);
      break;
    }

    iter.pivotCol = pivotCol;
    iter.enteringVar = headers[pivotCol];

    // 2. Find Leaving Variable (Pivot Row) using Minimum Ratio Test
    let pivotRow = -1;
    let minRatio = Infinity;
    const ratios: (number | null)[] = Array(numConstraints).fill(null);

    for (let i = 0; i < numConstraints; i++) {
      const rowIdx = i + 1;
      const val = currentTableau[rowIdx][pivotCol];
      if (val > 1e-9) {
        const rhs = currentTableau[rowIdx][numCols - 1];
        const ratio = rhs / val;
        ratios[i] = ratio;

        if (useBlandsRule) {
          if (Math.abs(ratio - minRatio) < 1e-9) {
            // Bland's Rule tie-breaking: Choose the basic variable with the lowest index in headers
            if (pivotRow === -1) {
              minRatio = ratio;
              pivotRow = rowIdx;
            } else {
              const currentVar = currentBasis[rowIdx];
              const minRatioVar = currentBasis[pivotRow];
              if (headers.indexOf(currentVar) < headers.indexOf(minRatioVar)) {
                minRatio = ratio;
                pivotRow = rowIdx;
              }
            }
          } else if (ratio < minRatio) {
            minRatio = ratio;
            pivotRow = rowIdx;
          }
        } else {
          if (ratio < minRatio) {
            minRatio = ratio;
            pivotRow = rowIdx;
          }
        }
      } else {
        ratios[i] = null;
      }
    }

    iter.ratios = ratios;

    // If no positive pivot row element, the problem is unbounded
    if (pivotRow === -1) {
      unbounded = true;
      iterations.push(iter);
      break;
    }

    iter.pivotRow = pivotRow;
    iter.leavingVar = currentBasis[pivotRow];

    iterations.push(iter);

    // 3. Perform Row Operations (OBE)
    const pivotVal = currentTableau[pivotRow][pivotCol];
    
    for (let col = 0; col < numCols; col++) {
      currentTableau[pivotRow][col] /= pivotVal;
    }

    for (let r = 0; r < numRows; r++) {
      if (r !== pivotRow) {
        const factor = currentTableau[r][pivotCol];
        for (let col = 0; col < numCols; col++) {
          currentTableau[r][col] -= factor * currentTableau[pivotRow][col];
        }
      }
    }

    currentBasis[pivotRow] = headers[pivotCol];
    iterationCount++;
  }

  // Calculate final solution values
  const solution: Record<string, number> = {};
  
  headers.forEach(h => {
    if (h !== 'RHS') {
      solution[h] = 0;
    }
  });

  for (let r = 1; r < numRows; r++) {
    const varName = currentBasis[r];
    const val = currentTableau[r][numCols - 1];
    solution[varName] = val >= 1e-9 ? val : 0;
  }

  // Check feasibility: if any artificial variable in the basis is > 1e-4, it is infeasible
  let infeasible = false;
  artificialVars.forEach(av => {
    if (solution[av] && solution[av] > 1e-4) {
      infeasible = true;
    }
  });

  // Calculate nutrition achieved and total cost
  let totalCost = 0;
  const nutritionMet = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };

  sanitizedFoods.forEach((food, idx) => {
    const portion = solution[`x${idx + 1}`] || 0;
    totalCost += portion * food.price;
    nutritionMet.calories += portion * food.calories;
    nutritionMet.protein += portion * food.protein;
    nutritionMet.fat += portion * food.fat;
    nutritionMet.carbs += portion * food.carbs;
  });

  let solverError: string | undefined = undefined;
  if (iterationCount >= maxIterations && !optimal && !unbounded) {
    solverError = 'Batas maksimum iterasi tercapai. Kemungkinan masalah tidak memiliki solusi stabil atau terjadi pengulangan basis (cycling).';
  }

  return {
    optimal: optimal && !infeasible && !unbounded && !solverError,
    infeasible,
    unbounded,
    iterations,
    solution,
    totalCost: Math.round(totalCost * 100) / 100,
    nutritionMet: {
      calories: Math.round(nutritionMet.calories * 100) / 100,
      protein: Math.round(nutritionMet.protein * 100) / 100,
      fat: Math.round(nutritionMet.fat * 100) / 100,
      carbs: Math.round(nutritionMet.carbs * 100) / 100,
    },
    error: solverError,
  };
}
