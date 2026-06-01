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
}

const M = 1000000; // Big-M value for penalties

export function solveSimplex(foods: FoodItem[], targets: NutritionTargets): SimplexResult {
  const numFoods = foods.length;
  // We have 4 constraints: Calories, Protein, Fat, Carbs
  const numConstraints = 4;

  // Nutrient targets in order
  const targetValues = [
    targets.calories,
    targets.protein,
    targets.fat,
    targets.carbs,
  ];

  const targetNames = ['Kalori', 'Protein', 'Lemak', 'Karbohidrat'];

  // Setup variable headers
  // Decision variables: x1, x2, ... x_n
  const decisionVars = foods.map((_, i) => `x${i + 1}`);
  // Surplus variables: s1, s2, s3, s4
  const surplusVars = Array.from({ length: numConstraints }, (_, i) => `s${i + 1}`);
  // Artificial variables: a1, a2, a3, a4
  const artificialVars = Array.from({ length: numConstraints }, (_, i) => `a${i + 1}`);

  const headers = [...decisionVars, ...surplusVars, ...artificialVars, 'RHS'];

  // Tableau size: (numConstraints + 1) rows, (numFoods + 2 * numConstraints + 1) columns
  // Row 0 is the objective function row (Maximize W = -Z = -sum(c_j * x_j) - M * sum(a_i))
  // Row 1 to 4 are constraint rows
  const numCols = numFoods + 2 * numConstraints + 1;
  const numRows = numConstraints + 1;

  const tableau: number[][] = Array.from({ length: numRows }, () => Array(numCols).fill(0));
  const basis: string[] = Array(numRows).fill('');
  basis[0] = 'W'; // Objective row label

  // Fill constraint rows (Row 1 to m)
  for (let i = 0; i < numConstraints; i++) {
    const rowIdx = i + 1;
    // Set coefficients for decision variables
    for (let j = 0; j < numFoods; j++) {
      const food = foods[j];
      let val = 0;
      if (i === 0) val = food.calories;
      else if (i === 1) val = food.protein;
      else if (i === 2) val = food.fat;
      else if (i === 3) val = food.carbs;
      tableau[rowIdx][j] = val;
    }

    // Set coefficient for surplus variable s_i
    tableau[rowIdx][numFoods + i] = -1;

    // Set coefficient for artificial variable a_i
    tableau[rowIdx][numFoods + numConstraints + i] = 1;

    // Set RHS
    tableau[rowIdx][numCols - 1] = targetValues[i];

    // Set initial basis for this row to artificial variable a_i
    basis[rowIdx] = artificialVars[i];
  }

  // Fill Row 0: W + sum(c_j * x_j) + M * sum(a_i) = 0
  // Initially, coeff for x_j is c_j, for s_k is 0, for a_k is M
  for (let j = 0; j < numFoods; j++) {
    tableau[0][j] = foods[j].price;
  }
  for (let i = 0; i < numConstraints; i++) {
    tableau[0][numFoods + numConstraints + i] = M;
  }
  tableau[0][numCols - 1] = 0;

  // Eliminate artificial variables from Row 0
  // For each row i: Row 0 = Row 0 - M * Row i
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
  const maxIterations = 50;
  let optimal = false;
  let unbounded = false;

  // Helper to deep copy tableau
  const cloneTableau = (t: number[][]) => t.map(row => [...row]);

  while (iterationCount < maxIterations) {
    // Save current state as iteration start
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

    // 1. Find Entering Variable (Pivot Column)
    // Most negative coefficient in Row 0 (excluding RHS)
    let pivotCol = -1;
    let minVal = -1e-9; // Tolerance

    for (let col = 0; col < numCols - 1; col++) {
      if (currentTableau[0][col] < minVal) {
        minVal = currentTableau[0][col];
        pivotCol = col;
      }
    }

    // If no negative coefficient, we have reached optimal
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

        if (ratio < minRatio) {
          minRatio = ratio;
          pivotRow = rowIdx;
        }
      } else {
        ratios[i] = null; // Can't divide or negative
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

    // Push iteration state before performing row operations
    iterations.push(iter);

    // 3. Perform Row Operations (OBE)
    const pivotVal = currentTableau[pivotRow][pivotCol];
    
    // Normalize pivot row
    for (let col = 0; col < numCols; col++) {
      currentTableau[pivotRow][col] /= pivotVal;
    }

    // Eliminate pivot column from other rows
    for (let r = 0; r < numRows; r++) {
      if (r !== pivotRow) {
        const factor = currentTableau[r][pivotCol];
        for (let col = 0; col < numCols; col++) {
          currentTableau[r][col] -= factor * currentTableau[pivotRow][col];
        }
      }
    }

    // Update basis
    currentBasis[pivotRow] = headers[pivotCol];
    iterationCount++;
  }

  // Calculate final solution values
  const solution: Record<string, number> = {};
  
  // Set all to 0 initially
  headers.forEach(h => {
    if (h !== 'RHS') {
      solution[h] = 0;
    }
  });

  // Read basis values
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

  foods.forEach((food, idx) => {
    const portion = solution[`x${idx + 1}`] || 0;
    totalCost += portion * food.price;
    nutritionMet.calories += portion * food.calories;
    nutritionMet.protein += portion * food.protein;
    nutritionMet.fat += portion * food.fat;
    nutritionMet.carbs += portion * food.carbs;
  });

  return {
    optimal: optimal && !infeasible,
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
  };
}
