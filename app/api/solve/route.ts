import { NextResponse } from 'next/server';
import { solveSimplex, FoodItem, NutritionTargets } from '@/lib/simplex';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { foods, targets, maxBudget } = body as {
      foods: FoodItem[];
      targets: NutritionTargets;
      maxBudget?: number;
    };

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return NextResponse.json(
        { error: 'Bahan makanan tidak valid atau kosong.' },
        { status: 400 }
      );
    }

    if (!targets || typeof targets !== 'object') {
      return NextResponse.json(
        { error: 'Kebutuhan gizi target tidak valid.' },
        { status: 400 }
      );
    }

    const result = solveSimplex(foods, targets, maxBudget);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan server saat memproses optimasi.' },
      { status: 500 }
    );
  }
}
