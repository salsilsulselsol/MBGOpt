import React, { useState } from 'react';
import { FoodItem } from '@/lib/simplex';

interface FoodTableProps {
  foods: FoodItem[];
  onAdd: (food: Omit<FoodItem, 'id'>) => void;
  onEdit: (id: string, updatedFood: Partial<FoodItem>) => void;
  onDelete: (id: string) => void;
}

export default function FoodTable({ foods, onAdd, onEdit, onDelete }: FoodTableProps) {
  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    price: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FoodItem>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name.trim()) return;

    onAdd({
      name: newFood.name,
      calories: parseFloat(newFood.calories) || 0,
      protein: parseFloat(newFood.protein) || 0,
      fat: parseFloat(newFood.fat) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      price: parseFloat(newFood.price) || 0,
    });

    setNewFood({
      name: '',
      calories: '',
      protein: '',
      fat: '',
      carbs: '',
      price: '',
    });

    setIsModalOpen(false);
  };

  const startEditing = (food: FoodItem) => {
    setEditingId(food.id);
    setEditForm({ ...food });
  };

  const handleEditChange = (field: keyof FoodItem, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'name' ? (parseFloat(value) || 0) : value,
    }));
  };

  const saveEdit = () => {
    if (editingId && editForm.name) {
      onEdit(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xs space-y-6 border-2 border-slate-200">
      {/* Table Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-slate-800 text-base leading-tight">Daftar Bahan Makanan</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-550 rounded-lg px-3.5 py-2 transition active:scale-97 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Bahan Makanan
          </button>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[650px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-350 text-slate-800 font-extrabold bg-slate-50/80">
                <th className="py-2.5 px-3 rounded-l-lg w-16">Variabel</th>
                <th className="py-2.5 px-3">Bahan Makanan</th>
                <th className="py-2.5 px-2 text-right">Kalori (kkal)</th>
                <th className="py-2.5 px-2 text-right">Protein (g)</th>
                <th className="py-2.5 px-2 text-right">Lemak (g)</th>
                <th className="py-2.5 px-2 text-right">Karbo (g)</th>
                <th className="py-2.5 px-2 text-right">Harga (Rp)</th>
                <th className="py-2.5 px-3 text-center w-24 rounded-r-lg">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 text-slate-700">
              {foods.map((food, idx) => {
                const isEditing = editingId === food.id;

                return (
                  <tr key={food.id} className="hover:bg-slate-50/50 transition duration-100">
                    <td className="py-3 px-3 font-mono text-xs font-bold text-indigo-750">
                      x{idx + 1}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={e => handleEditChange('name', e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                        />
                      ) : (
                        <span className="font-semibold text-xs text-slate-800">{food.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.calories ?? 0}
                          onChange={e => handleEditChange('calories', e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 w-16 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                        />
                      ) : (
                        <span>{food.calories}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editForm.protein ?? 0}
                          onChange={e => handleEditChange('protein', e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 w-16 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                        />
                      ) : (
                        <span>{food.protein}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editForm.fat ?? 0}
                          onChange={e => handleEditChange('fat', e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 w-16 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                        />
                      ) : (
                        <span>{food.fat}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editForm.carbs ?? 0}
                          onChange={e => handleEditChange('carbs', e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 w-16 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                        />
                      ) : (
                        <span>{food.carbs}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-mono font-bold text-slate-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.price ?? 0}
                          onChange={e => handleEditChange('price', e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 w-20 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                        />
                      ) : (
                        <span>Rp {food.price.toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={saveEdit}
                            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition cursor-pointer"
                            title="Simpan"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition cursor-pointer"
                            title="Batal"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => startEditing(food)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDelete(food.id)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-655 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            title="Hapus"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden space-y-4">
          {foods.map((food, idx) => {
            const isEditing = editingId === food.id;

            return (
              <div key={food.id} className="border-2 border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b-2 border-slate-250">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 rounded-md">
                      x{idx + 1}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={e => handleEditChange('name', e.target.value)}
                        className="bg-white border border-slate-350 rounded px-2 py-0.5 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="font-bold text-xs text-slate-800">{food.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="p-1 bg-emerald-600 text-white rounded-md transition cursor-pointer"
                          title="Simpan"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
                          title="Batal"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(food)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(food.id)}
                          className="p-1 bg-slate-100 hover:bg-rose-50 text-slate-655 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          title="Hapus"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                  <div className="bg-slate-100/50 p-2 rounded-lg flex flex-col justify-between">
                    <span>Kalori</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.calories ?? 0}
                        onChange={e => handleEditChange('calories', e.target.value)}
                        className="bg-white border border-slate-350 rounded mt-1 p-0.5 text-right w-full font-bold text-slate-900 text-xs"
                      />
                    ) : (
                      <span className="font-mono text-slate-800 font-extrabold mt-1 text-xs">{food.calories} kkal</span>
                    )}
                  </div>
                  <div className="bg-slate-100/50 p-2 rounded-lg flex flex-col justify-between">
                    <span>Protein</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={editForm.protein ?? 0}
                        onChange={e => handleEditChange('protein', e.target.value)}
                        className="bg-white border border-slate-350 rounded mt-1 p-0.5 text-right w-full font-bold text-slate-900 text-xs"
                      />
                    ) : (
                      <span className="font-mono text-slate-800 font-extrabold mt-1 text-xs">{food.protein} g</span>
                    )}
                  </div>
                  <div className="bg-slate-100/50 p-2 rounded-lg flex flex-col justify-between">
                    <span>Lemak</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={editForm.fat ?? 0}
                        onChange={e => handleEditChange('fat', e.target.value)}
                        className="bg-white border border-slate-350 rounded mt-1 p-0.5 text-right w-full font-bold text-slate-900 text-xs"
                      />
                    ) : (
                      <span className="font-mono text-slate-800 font-extrabold mt-1 text-xs">{food.fat} g</span>
                    )}
                  </div>
                  <div className="bg-slate-100/50 p-2 rounded-lg flex flex-col justify-between">
                    <span>Karbohidrat</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={editForm.carbs ?? 0}
                        onChange={e => handleEditChange('carbs', e.target.value)}
                        className="bg-white border border-slate-350 rounded mt-1 p-0.5 text-right w-full font-bold text-slate-900 text-xs"
                      />
                    ) : (
                      <span className="font-mono text-slate-800 font-extrabold mt-1 text-xs">{food.carbs} g</span>
                    )}
                  </div>
                  <div className="bg-indigo-50/50 p-2 rounded-lg flex flex-col justify-between col-span-2">
                    <span className="text-indigo-800">Harga</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.price ?? 0}
                        onChange={e => handleEditChange('price', e.target.value)}
                        className="bg-white border border-slate-350 rounded mt-1 p-0.5 text-right w-full font-bold text-slate-900 text-xs"
                      />
                    ) : (
                      <span className="font-mono text-indigo-950 font-black mt-1 text-xs">Rp {food.price.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {foods.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <p className="font-semibold">Belum ada bahan makanan dalam daftar.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-550 rounded-lg px-4 py-2 shadow-sm transition active:scale-97 cursor-pointer"
            >
              Tambah Bahan Makanan Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modal Backdrop */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-800 text-base leading-tight">Tambah Bahan Makanan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Sayur Sop (100g)"
                  value={newFood.name}
                  onChange={e => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg py-2 px-3 text-slate-900 text-sm transition"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kalori (kkal)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newFood.calories}
                    onChange={e => setNewFood({ ...newFood, calories: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg py-2 px-3 text-slate-900 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={newFood.protein}
                    onChange={e => setNewFood({ ...newFood, protein: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg py-2 px-3 text-slate-900 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Lemak (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={newFood.fat}
                    onChange={e => setNewFood({ ...newFood, fat: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg py-2 px-3 text-slate-900 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Karbohidrat (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={newFood.carbs}
                    onChange={e => setNewFood({ ...newFood, carbs: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg py-2 px-3 text-slate-900 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Harga (Rupiah)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-450 text-xs font-bold select-none">Rp</span>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={newFood.price}
                    onChange={e => setNewFood({ ...newFood, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg py-2 pl-8 pr-3 text-slate-900 text-sm transition"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-550 rounded-lg transition shadow-xs cursor-pointer"
                >
                  Tambah Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
