import { solveSimplex, FoodItem, NutritionTargets } from '../lib/simplex';

function runTests() {
  console.log('--- STARTING SIMPLEX TESTS ---');

  // Test 1: Standard Optimal Solution
  console.log('\n[Test 1] Standard Optimal Solution');
  const foods1: FoodItem[] = [
    { id: '1', name: 'Food A', calories: 100, protein: 10, fat: 5, carbs: 10, price: 1000 },
    { id: '2', name: 'Food B', calories: 200, protein: 2, fat: 1, carbs: 40, price: 2000 },
  ];
  const targets1: NutritionTargets = { calories: 300, protein: 12, fat: 6, carbs: 50 };
  const res1 = solveSimplex(foods1, targets1);
  console.log('Optimal:', res1.optimal);
  console.log('Infeasible:', res1.infeasible);
  console.log('Unbounded:', res1.unbounded);
  console.log('Error:', res1.error);
  console.log('Total Cost:', res1.totalCost);
  console.log('Solution:', res1.solution);

  // Test 2: Input Sanitization (Negative values)
  console.log('\n[Test 2] Negative Input Sanitization');
  const foods2: FoodItem[] = [
    { id: '1', name: 'Food A', calories: -100, protein: -10, fat: -5, carbs: -10, price: -1000 },
    { id: '2', name: 'Food B', calories: 200, protein: 2, fat: 1, carbs: 40, price: 2000 },
  ];
  const targets2: NutritionTargets = { calories: -300, protein: 12, fat: 6, carbs: 50 };
  // Expected: negative inputs sanitized to 0. Food A will have 0 price and 0 nutrition.
  const res2 = solveSimplex(foods2, targets2);
  console.log('Optimal:', res2.optimal);
  console.log('Infeasible:', res2.infeasible);
  console.log('Unbounded:', res2.unbounded);
  console.log('Error:', res2.error);
  console.log('Solution:', res2.solution);

  // Test 3: Zero Prices with Positive Target Validation
  console.log('\n[Test 3] Zero Prices with Positive Target Validation');
  const foods3: FoodItem[] = [
    { id: '1', name: 'Free Food', calories: 100, protein: 10, fat: 5, carbs: 10, price: 0 },
  ];
  const targets3: NutritionTargets = { calories: 100, protein: 0, fat: 0, carbs: 0 };
  const res3 = solveSimplex(foods3, targets3);
  console.log('Optimal:', res3.optimal);
  console.log('Error (Expected):', res3.error);

  // Test 4: Infeasible Solution (Target exceeds possible nutrition combinations)
  console.log('\n[Test 4] Infeasible Solution Detection');
  const foods4: FoodItem[] = [
    { id: '1', name: 'Food A', calories: 10, protein: 0, fat: 0, carbs: 0, price: 1000 },
  ];
  const targets4: NutritionTargets = { calories: 100, protein: 50, fat: 50, carbs: 50 }; // High protein/fat/carbs targets but Food A has 0
  const res4 = solveSimplex(foods4, targets4);
  console.log('Optimal:', res4.optimal);
  console.log('Infeasible (Expected True):', res4.infeasible);
  console.log('Unbounded:', res4.unbounded);
  console.log('Solution:', res4.solution);

  // Test 5: Unbounded Solution Detection
  console.log('\n[Test 5] Unbounded Solution Detection');
  // In simplex, if a column can enter and improve objective infinitely without violation, it is unbounded.
  // We can construct this by having food items with negative surplus coeff which means they can increase infinitely.
  // Wait, our constraint is Ax - s + a = b. Here A >= 0, x >= 0, s >= 0, a >= 0.
  // Since we minimize c^T x, if we have a food with price 0 and positive nutrients, we can choose it infinitely to meet the target.
  // But wait! If all prices are 0, we throw an error in validation.
  // What if we have one food with price 10 and another food with price 0?
  // Let's test if we have a food with price 0 and positive nutrients, and another food with positive price.
  // If we have Food A with price 0, calories 10, and target calories 100.
  // Simplex will choose Food A to meet the target. The cost will be 0.
  // Is this unbounded? No, it's bounded at 10 portions of Food A.
  // An unbounded solution in minimization: the cost can go to negative infinity.
  // In standard linear programming, if we can decrease the objective value infinitely, the problem is unbounded.
  // Since prices are non-negative (sanitized to >= 0), the minimum cost is bounded below by 0.
  // But wait! Can we trigger the unbounded condition where pivotRow === -1?
  // Yes: if we have a variable whose entering coefficient in Row 0 is negative (meaning it can enter to improve the objective function, but in our case objective is Minimize Z = sum(price * x) + M * sum(a)),
  // Wait! In the Big-M objective row:
  // Row 0 is: W - sum(c_j * x_j) - M * sum(a_i)
  // Initially, coeff for x_j is c_j. Then we eliminate artificial variables: Row 0 = Row 0 - M * Row i.
  // So coeff for x_j becomes c_j - M * sum(A_ij). Since M is very large, these coefficients are highly negative.
  // They enter the basis to eliminate artificial variables (reduce penalty M * sum(a_i)).
  // If we have a column where all elements in the column are <= 0, then we can increase that variable infinitely without violating any constraints.
  // Let's construct a food item that has 0 calories, 0 protein, 0 fat, and 0 carbs, but price -100 (which sanitizes to 0).
  // If all constraint coefficients are 0, and price is 0, is it unbounded?
  // If we have a food item with 0 nutrition, its constraint entries are all 0.
  // Let's see what happens if we run it:
  const foods5: FoodItem[] = [
    { id: '1', name: 'Food A', calories: 100, protein: 10, fat: 5, carbs: 10, price: 1000 },
    { id: '2', name: 'Zero Nutrition Item', calories: 0, protein: 0, fat: 0, carbs: 0, price: 0 },
  ];
  const targets5: NutritionTargets = { calories: 100, protein: 10, fat: 5, carbs: 10 };
  const res5 = solveSimplex(foods5, targets5);
  console.log('Optimal:', res5.optimal);
  console.log('Unbounded:', res5.unbounded);
  console.log('Infeasible:', res5.infeasible);
  console.log('Solution:', res5.solution);

  console.log('\n--- SIMPLEX TESTS COMPLETE ---');
}

runTests();
