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

    setNewFood({ name: '', calories: '', protein: '', fat: '', carbs: '', price: '' });
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

  const cellInput =
    'bg-surface border border-line-strong rounded px-2 py-1 text-ink text-right focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand text-xs font-semibold font-mono';

  return (
    <div className="bg-surface rounded-md p-6 border border-line space-y-6">
      {/* Table Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink text-base leading-tight">Daftar Bahan Makanan</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-md px-3.5 py-2 transition active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-sm"
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
              <tr className="border-b border-line-strong text-ink font-bold bg-fill">
                <th className="py-2.5 px-3 w-16">Variabel</th>
                <th className="py-2.5 px-3">Bahan Makanan</th>
                <th className="py-2.5 px-2 text-right">Kalori (kkal)</th>
                <th className="py-2.5 px-2 text-right">Protein (g)</th>
                <th className="py-2.5 px-2 text-right">Lemak (g)</th>
                <th className="py-2.5 px-2 text-right">Karbo (g)</th>
                <th className="py-2.5 px-2 text-right">Harga (Rp)</th>
                <th className="py-2.5 px-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-muted">
              {foods.map((food, idx) => {
                const isEditing = editingId === food.id;

                return (
                  <tr key={food.id} className="hover:bg-fill/60 transition duration-100">
                    <td className="py-3 px-3 font-mono text-xs font-bold text-brand">x{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-ink">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={e => handleEditChange('name', e.target.value)}
                          className="bg-surface border border-line-strong rounded px-2.5 py-1 text-ink w-36 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand text-xs font-semibold"
                        />
                      ) : (
                        <span className="font-semibold text-xs text-ink">{food.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-mono">
                      {isEditing ? (
                        <input type="number" value={editForm.calories ?? 0} onChange={e => handleEditChange('calories', e.target.value)} className={`${cellInput} w-16`} />
                      ) : (
                        <span>{food.calories}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-mono">
                      {isEditing ? (
                        <input type="number" step="any" value={editForm.protein ?? 0} onChange={e => handleEditChange('protein', e.target.value)} className={`${cellInput} w-16`} />
                      ) : (
                        <span>{food.protein}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-mono">
                      {isEditing ? (
                        <input type="number" step="any" value={editForm.fat ?? 0} onChange={e => handleEditChange('fat', e.target.value)} className={`${cellInput} w-16`} />
                      ) : (
                        <span>{food.fat}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-mono">
                      {isEditing ? (
                        <input type="number" step="any" value={editForm.carbs ?? 0} onChange={e => handleEditChange('carbs', e.target.value)} className={`${cellInput} w-16`} />
                      ) : (
                        <span>{food.carbs}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-mono font-bold text-ink">
                      {isEditing ? (
                        <input type="number" value={editForm.price ?? 0} onChange={e => handleEditChange('price', e.target.value)} className={`${cellInput} w-20`} />
                      ) : (
                        <span>Rp {food.price.toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-1">
                          <button onClick={saveEdit} className="p-1 bg-good hover:opacity-90 text-white rounded transition cursor-pointer" title="Simpan">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 bg-fill hover:bg-line text-muted rounded transition cursor-pointer" title="Batal">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-1">
                          <button onClick={() => startEditing(food)} className="p-1.5 bg-fill hover:bg-line text-muted rounded transition cursor-pointer" title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button onClick={() => onDelete(food.id)} className="p-1.5 bg-fill hover:bg-brand-soft text-muted hover:text-brand rounded transition cursor-pointer" title="Hapus">
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
              <div key={food.id} className="border border-line-strong rounded-md p-4 bg-fill/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-line">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-brand bg-brand-soft border border-brand/20 rounded">
                      x{idx + 1}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={e => handleEditChange('name', e.target.value)}
                        className="bg-surface border border-line-strong rounded px-2 py-0.5 text-ink text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/40"
                      />
                    ) : (
                      <span className="font-bold text-xs text-ink">{food.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button onClick={saveEdit} className="p-1 bg-good text-white rounded transition cursor-pointer" title="Simpan">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1 bg-fill text-muted rounded transition cursor-pointer" title="Batal">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(food)} className="p-1 bg-fill hover:bg-line text-muted rounded transition cursor-pointer" title="Edit">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button onClick={() => onDelete(food.id)} className="p-1 bg-fill hover:bg-brand-soft text-muted hover:text-brand rounded transition cursor-pointer" title="Hapus">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-muted">
                  <div className="bg-surface border border-line p-2 rounded flex flex-col justify-between">
                    <span>Kalori</span>
                    {isEditing ? (
                      <input type="number" value={editForm.calories ?? 0} onChange={e => handleEditChange('calories', e.target.value)} className="bg-surface border border-line-strong rounded mt-1 p-0.5 text-right w-full font-bold text-ink text-xs" />
                    ) : (
                      <span className="font-mono text-ink font-bold mt-1 text-xs">{food.calories} kkal</span>
                    )}
                  </div>
                  <div className="bg-surface border border-line p-2 rounded flex flex-col justify-between">
                    <span>Protein</span>
                    {isEditing ? (
                      <input type="number" step="any" value={editForm.protein ?? 0} onChange={e => handleEditChange('protein', e.target.value)} className="bg-surface border border-line-strong rounded mt-1 p-0.5 text-right w-full font-bold text-ink text-xs" />
                    ) : (
                      <span className="font-mono text-ink font-bold mt-1 text-xs">{food.protein} g</span>
                    )}
                  </div>
                  <div className="bg-surface border border-line p-2 rounded flex flex-col justify-between">
                    <span>Lemak</span>
                    {isEditing ? (
                      <input type="number" step="any" value={editForm.fat ?? 0} onChange={e => handleEditChange('fat', e.target.value)} className="bg-surface border border-line-strong rounded mt-1 p-0.5 text-right w-full font-bold text-ink text-xs" />
                    ) : (
                      <span className="font-mono text-ink font-bold mt-1 text-xs">{food.fat} g</span>
                    )}
                  </div>
                  <div className="bg-surface border border-line p-2 rounded flex flex-col justify-between">
                    <span>Karbohidrat</span>
                    {isEditing ? (
                      <input type="number" step="any" value={editForm.carbs ?? 0} onChange={e => handleEditChange('carbs', e.target.value)} className="bg-surface border border-line-strong rounded mt-1 p-0.5 text-right w-full font-bold text-ink text-xs" />
                    ) : (
                      <span className="font-mono text-ink font-bold mt-1 text-xs">{food.carbs} g</span>
                    )}
                  </div>
                  <div className="bg-brand-soft p-2 rounded flex flex-col justify-between col-span-2">
                    <span className="text-brand-dark">Harga</span>
                    {isEditing ? (
                      <input type="number" value={editForm.price ?? 0} onChange={e => handleEditChange('price', e.target.value)} className="bg-surface border border-line-strong rounded mt-1 p-0.5 text-right w-full font-bold text-ink text-xs" />
                    ) : (
                      <span className="font-mono text-brand-dark font-bold mt-1 text-xs">Rp {food.price.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {foods.length === 0 && (
          <div className="text-center py-10 text-faint text-xs flex flex-col items-center justify-center gap-3">
            <p className="font-medium">Belum ada bahan makanan dalam daftar.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-md px-4 py-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              Tambah Bahan Makanan Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modal Backdrop */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink/45 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-md w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 border border-line">
            <div className="h-1 -mx-6 -mt-6 mb-5 rounded-t-md bg-brand" />
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-ink text-base leading-tight">Tambah Bahan Makanan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup"
                className="p-1 text-faint hover:text-ink rounded transition hover:bg-fill cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Nama Bahan</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Sayur Sop (100g)"
                  value={newFood.name}
                  onChange={e => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full bg-fill border border-line-strong hover:border-faint focus:bg-surface focus:ring-2 focus:ring-brand/40 focus:border-brand focus:outline-none rounded py-2 px-3 text-ink text-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Kalori (kkal)</label>
                  <input type="number" min="0" placeholder="0" value={newFood.calories} onChange={e => setNewFood({ ...newFood, calories: e.target.value })} className="w-full bg-fill border border-line-strong hover:border-faint focus:bg-surface focus:ring-2 focus:ring-brand/40 focus:border-brand focus:outline-none rounded py-2 px-3 text-ink text-sm transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Protein (g)</label>
                  <input type="number" min="0" step="any" placeholder="0" value={newFood.protein} onChange={e => setNewFood({ ...newFood, protein: e.target.value })} className="w-full bg-fill border border-line-strong hover:border-faint focus:bg-surface focus:ring-2 focus:ring-brand/40 focus:border-brand focus:outline-none rounded py-2 px-3 text-ink text-sm transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Lemak (g)</label>
                  <input type="number" min="0" step="any" placeholder="0" value={newFood.fat} onChange={e => setNewFood({ ...newFood, fat: e.target.value })} className="w-full bg-fill border border-line-strong hover:border-faint focus:bg-surface focus:ring-2 focus:ring-brand/40 focus:border-brand focus:outline-none rounded py-2 px-3 text-ink text-sm transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Karbohidrat (g)</label>
                  <input type="number" min="0" step="any" placeholder="0" value={newFood.carbs} onChange={e => setNewFood({ ...newFood, carbs: e.target.value })} className="w-full bg-fill border border-line-strong hover:border-faint focus:bg-surface focus:ring-2 focus:ring-brand/40 focus:border-brand focus:outline-none rounded py-2 px-3 text-ink text-sm transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Harga (Rupiah)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-faint text-xs font-semibold select-none">Rp</span>
                  <input type="number" required min="0" placeholder="0" value={newFood.price} onChange={e => setNewFood({ ...newFood, price: e.target.value })} className="w-full bg-fill border border-line-strong hover:border-faint focus:bg-surface focus:ring-2 focus:ring-brand/40 focus:border-brand focus:outline-none rounded py-2 pl-8 pr-3 text-ink text-sm transition" />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted hover:text-ink bg-fill hover:bg-line border border-line rounded transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded transition shadow-sm cursor-pointer"
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
